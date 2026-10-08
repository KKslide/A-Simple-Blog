import { computed, nextTick, onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { buildVisibleLyrics, findCurrentLyricIndex, parseLrc } from '../../utils/musicPopup'

/** 音频加载超时（ms）：到点还没 canplay 也要撤掉 loading，不能一直转下去 */
const AUDIO_LOAD_TIMEOUT = 5000
/**
 * seek 静默期（ms）：seek 提交后端上不一定立刻按新位置回调 timeupdate，
 * 这段时间内不拿回调值覆盖 UI，否则进度条会先弹回旧位置再跳过来
 */
const SEEK_SETTLE_MS = 600
/** 进度轮询间隔（ms）；timeupdate 只有 ~4Hz，单独用它进度条会一顿一顿 */
const PROGRESS_TICK_MS = 120

export interface UseMusicPlayerOptions {
  /** 音频地址，随曲目变化 */
  musicUrl: () => string
  /** LRC 歌词文本，随曲目变化 */
  lyricText: () => string
  /** 打开弹窗时是否自动起播 */
  autoPlay: () => boolean
  /** 进度条轨道元素，把指针位置换算成播放位置要用 */
  trackEl: Ref<HTMLElement | null>
  /**
   * 音频「有着落」时回调（canplay / error / 加载超时）
   * 外部据此重新判断首屏 loading 该不该收 —— 它还要等图片加载完
   */
  onAudioSettled?: () => void
  /**
   * 弹窗内容挂载完、开始拉音源之前回调（在 open 的 nextTick 里执行）
   * 外部在这里放开唱片这类首屏元素，时机和量轨道几何信息一致
   */
  onLayoutReady?: () => void
}

/**
 * 唱片机播放器（Web 版）
 *
 * 把「音频」这件事整个收在这里，组件只管展示：
 * 音频生命周期、播放/暂停、进度时间源、歌词索引、进度条拖拽定位、音频加载态。
 *
 * 对外只留一个时间入口 applyPlaybackTime：进度条宽度和歌词高亮共用它，
 * 两者时间基准必须是同一个值，否则就会出现「进度条在走、歌词不动」这类错位。
 *
 * ── 相对小程序版的改动 ──────────────────────────────────────
 * 小程序用的是 uni.createInnerAudioContext()，其回调不带载荷、currentTime
 * 在部分端上恒为 0，因此原版堆了两层兜底：读不到就返回 -1 + 本地时钟插值硬推。
 * 浏览器的 HTMLAudioElement 没有这个问题 —— currentTime 属性始终可信，
 * 所以这里**去掉了本地时钟插值**，时间一律以音频元素为准，逻辑更直白。
 * 其余设计（唯一时间源、拖拽让位、seek 静默期、加载超时）全部保留。
 */
export function useMusicPlayer(options: UseMusicPlayerOptions) {
  const { musicUrl, lyricText, autoPlay, trackEl, onAudioSettled, onLayoutReady } = options

  /* ------------------------------ 状态 ------------------------------ */

  /** 当前播放位置（秒） */
  const currentTime = ref(0)
  /** 音频总时长（秒） */
  const duration = ref(0)
  /** 是否正在播放 */
  const isPlaying = ref(false)
  /** 音频是否已可播放（canplay 过） */
  const isAudioReady = ref(false)
  /** 音频异常（资源不存在 / 加载失败），此时不给播也不给拖 */
  const isAudioBlocked = ref(false)
  /** 错误文案，给用户看的 */
  const loadErrorText = ref('')
  /** 音频缓冲中：seek 后重新拉流或网络卡顿时给个反馈 */
  const isBuffering = ref(false)
  /** 是否正在按住进度条拖拽（拖拽期间进度由指针决定，轮询和音频回调都让位） */
  const isSeeking = ref(false)
  /** 首屏 loading：等图片和音频都有结果才撤 */
  const showLoading = ref(false)
  /** 有自动播放诉求、但还不能播（等 canplay + 图片加载完） */
  const pendingAutoPlay = ref(false)
  /** 音频这一侧是否已经有了结果（canplay / error / 超时） */
  const audioLoadSettled = ref(false)

  /** 解析出的歌词行 */
  const lyrics = ref<ReturnType<typeof parseLrc>>([])
  /** 当前播放到第几句 */
  const activeLyricIndex = ref(0)
  /** 歌词整体偏移（秒）；预留的手动校准开关，当前恒为 0 */
  const lyricOffset = ref(0)

  /** 进度条轨道的位置与宽度（px），把指针位置换算成播放位置要用 */
  const trackRect = ref({ left: 0, width: 0 })

  let audio: HTMLAudioElement | null = null
  let audioLoadTimer: ReturnType<typeof setTimeout> | null = null
  let progressTimer: ReturnType<typeof setInterval> | null = null
  /** seek 静默期截止时间戳（ms），这段时间内不采用音频元素回调的位置 */
  let seekSettleUntil = 0
  /** 组件是否已卸载：卸载后到达的回调一律忽略 */
  let disposed = false

  /* --------------------- 播放进度：进度条和歌词的唯一时间源 --------------------- */

  /**
   * 把播放位置落到 UI 上 —— 进度条宽度和歌词高亮都只认这一个入口
   *
   * 「歌词高亮」就是：播到第 N 秒，就把第 N 秒所在的那一句高亮。
   * 由 findCurrentLyricIndex 按每句自己的时间戳定位出当前句，再交给 visibleLyrics 渲染
   * （可见窗口固定 5 行，当前句恒落在中间那行）。
   */
  const applyPlaybackTime = (audioTime: number) => {
    const time = Math.max(0, audioTime)
    currentTime.value = time
    activeLyricIndex.value = findCurrentLyricIndex(lyrics.value, time + lyricOffset.value)
  }

  /** 读音频元素当前播放位置（秒）；不可用时返回 -1 */
  const readAudioTime = (): number => {
    if (!audio) return -1
    const time = Number(audio.currentTime)
    return Number.isFinite(time) ? time : -1
  }

  /** 读音频元素总时长（秒），读不到返回 0 */
  const readAudioDuration = (): number => {
    if (!audio) return 0
    const value = Number(audio.duration)
    return Number.isFinite(value) ? value : 0
  }

  /**
   * 用音频元素的真实进度刷新一次 UI
   *
   * timeupdate 播放时约每 250ms 回调一次，所以拖拽守卫必须放在这里 ——
   * 只挡进度轮询不够，这条回调照样会把进度从指针位置拽回去
   */
  const syncPlaybackTime = () => {
    if (isSeeking.value || disposed) return

    const audioTime = readAudioTime()
    if (audioTime < 0) return
    const audioDuration = readAudioDuration()
    if (audioDuration > 0) {
      duration.value = audioDuration
    }
    applyPlaybackTime(audioTime)
  }

  /**
   * 进度轮询：进度条和高亮都靠它保持连续
   * - 拖拽中直接让位：位置由指针决定，轮询再插手就会和指针抢进度条
   * - 处于 seek 静默期时不采信元素位置，等音频真正跟过去
   */
  const tickPlaybackTime = () => {
    if (isSeeking.value || disposed) return
    if (Date.now() < seekSettleUntil) return

    const audioTime = readAudioTime()
    if (audioTime < 0) return
    const audioDuration = readAudioDuration()
    if (audioDuration > 0) {
      duration.value = audioDuration
    }
    applyPlaybackTime(audioTime)
  }

  const startProgressLoop = () => {
    stopProgressLoop()
    progressTimer = setInterval(tickPlaybackTime, PROGRESS_TICK_MS)
  }

  const stopProgressLoop = () => {
    if (progressTimer) {
      clearInterval(progressTimer)
      progressTimer = null
    }
  }

  /* --------------------------- 音频生命周期 --------------------------- */

  /** 安全调用 play()：浏览器会自动播放策略会 reject，这里吞掉并标为缓冲 */
  const safePlay = () => {
    if (!audio) return
    const result = audio.play()
    if (result && typeof result.catch === 'function') {
      result.catch(() => {
        // 通常是被自动播放策略拦下（等用户手势）或资源不可用，交给 onError/超时兜底
        isBuffering.value = false
      })
    }
  }

  const createAudio = () => {
    if (audio) return
    const el = new Audio()
    el.preload = 'auto'
    audio = el

    el.addEventListener('canplay', () => {
      if (disposed) return
      isAudioReady.value = true
      isAudioBlocked.value = false
      isBuffering.value = false
      loadErrorText.value = ''
      audioLoadSettled.value = true
      clearAudioLoadTimer()
      onAudioSettled?.()
    })

    el.addEventListener('play', () => {
      if (disposed) return
      isPlaying.value = true
      isBuffering.value = false
      audioLoadSettled.value = true
      clearAudioLoadTimer()
      showLoading.value = false
      pendingAutoPlay.value = false
      startProgressLoop()
    })

    el.addEventListener('pause', () => {
      if (disposed) return
      isPlaying.value = false
      isBuffering.value = false
      stopProgressLoop()
    })

    el.addEventListener('ended', () => {
      if (disposed) return
      isPlaying.value = false
      isBuffering.value = false
      stopProgressLoop()
      // 播完停在末尾：用已知时长当播放位置，避免进度条和歌词被打回开头
      applyPlaybackTime(duration.value || readAudioTime())
    })

    // 缓冲中：seek 之后要重新拉流，网络抖动也会走这里，给用户一个「在转圈」的反馈
    el.addEventListener('waiting', () => {
      if (disposed) return
      isBuffering.value = true
    })

    el.addEventListener('timeupdate', () => {
      syncPlaybackTime()
    })

    el.addEventListener('error', () => {
      if (disposed) return
      audioLoadSettled.value = true
      clearAudioLoadTimer()
      onAudioSettled?.()
    })
  }

  const destroyAudio = () => {
    stopProgressLoop()
    if (!audio) return
    audio.pause()
    audio.removeAttribute('src')
    audio.load()
    audio = null
  }

  const clearAudioLoadTimer = () => {
    if (audioLoadTimer) {
      clearTimeout(audioLoadTimer)
      audioLoadTimer = null
    }
  }

  const prepareAudioForOpen = () => {
    if (!audio) return
    if (!musicUrl()) {
      audioLoadSettled.value = true
      handleAudioFail('歌曲资源不存在')
      onAudioSettled?.()
      return
    }

    loadErrorText.value = ''
    isAudioBlocked.value = false
    isAudioReady.value = false
    audioLoadSettled.value = false
    clearAudioLoadTimer()

    audio.src = musicUrl()
    audio.load()

    audioLoadTimer = setTimeout(() => {
      if (isAudioReady.value || isPlaying.value) return
      audioLoadSettled.value = true
      onAudioSettled?.()
    }, AUDIO_LOAD_TIMEOUT)
  }

  const handleAudioFail = (message: string) => {
    loadErrorText.value = message
    isAudioBlocked.value = true
    isAudioReady.value = false
    isPlaying.value = false
    stopProgressLoop()
    if (audio) {
      audio.pause()
    }
  }

  /* -------------------------------- 歌词 -------------------------------- */

  watch(
    lyricText,
    (val) => {
      lyrics.value = parseLrc(val)
    },
    { immediate: true },
  )

  /** 可见歌词窗口（固定 5 行，当前句恒在中位） */
  const visibleLyrics = computed(() => buildVisibleLyrics(lyrics.value, activeLyricIndex.value))

  /* ---------------------------- 播放控制 / 开关 ---------------------------- */

  const tryAutoPlay = () => {
    if (!pendingAutoPlay.value) return
    if (!isAudioReady.value) return
    if (!audio) return
    if (isPlaying.value) return
    pendingAutoPlay.value = false
    safePlay()
  }

  /** 打开弹窗：重建音频元素、复位状态、挂上新的音源 */
  const open = () => {
    destroyAudio()
    createAudio()
    resetState()
    showLoading.value = true
    pendingAutoPlay.value = !!autoPlay()
    nextTick(() => {
      // 布局已就绪：外部放开首屏元素，这里量一次进度条轨道几何信息，再挂音源
      onLayoutReady?.()
      measureTrack()
      prepareAudioForOpen()
    })
  }

  const togglePlay = () => {
    if (showLoading.value) return
    if (isAudioBlocked.value) return
    if (!audio || !isAudioReady.value) return

    if (isPlaying.value) {
      audio.pause()
      return
    }
    safePlay()
  }

  /** 复位到「刚打开」的状态：进度、歌词、播放态、拖拽态一起清 */
  const resetState = () => {
    currentTime.value = 0
    duration.value = 0
    activeLyricIndex.value = 0
    isPlaying.value = false
    isAudioReady.value = false
    isAudioBlocked.value = false
    isSeeking.value = false
    isBuffering.value = false
    seekSettleUntil = 0
    loadErrorText.value = ''
    audioLoadSettled.value = false
    showLoading.value = false
    pendingAutoPlay.value = false
    stopProgressLoop()
    clearAudioLoadTimer()
    if (!audio) return
    audio.pause()
    try {
      audio.currentTime = 0
    } catch {
      /* 元数据未就绪时设置 currentTime 会抛错，忽略 */
    }
  }

  /** 关闭弹窗时停播并归零 */
  const stop = () => {
    stopProgressLoop()
    clearAudioLoadTimer()
    if (!audio) return
    audio.pause()
    try {
      audio.currentTime = 0
    } catch {
      /* 同上 */
    }
    isPlaying.value = false
    isSeeking.value = false
    isBuffering.value = false
    seekSettleUntil = 0
    currentTime.value = 0
    duration.value = readAudioDuration()
    activeLyricIndex.value = 0
  }

  const shouldAutoPlay = computed(() => {
    return pendingAutoPlay.value && isAudioReady.value && !isPlaying.value
  })

  const progressWidth = computed(() => {
    if (!duration.value) return '0%'
    const ratio = Math.min(1, currentTime.value / duration.value)
    return `${Math.max(0, Math.min(100, ratio * 100))}%`
  })

  /* --------------------- 进度条：点击定位 / 按住拖拽 --------------------- */

  /** 量一次进度条轨道的几何信息（px） */
  const measureTrack = () => {
    const el = trackEl.value
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.width > 0) {
      trackRect.value = { left: rect.left, width: rect.width }
    }
  }

  /** 把指针位置换算成目标播放位置（秒）；几何信息或时长拿不到时返回 null */
  const getSeekTargetByClientX = (clientX: number): number | null => {
    const { left, width } = trackRect.value
    if (!Number.isFinite(clientX) || width <= 0 || !duration.value) return null
    const ratio = Math.max(0, Math.min(1, (clientX - left) / width))
    return ratio * duration.value
  }

  /** 能不能拖：首屏 loading、音频异常、还没拿到时长时都不给拖 */
  const canSeek = computed(() => {
    return !showLoading.value && !isAudioBlocked.value && isAudioReady.value && duration.value > 0
  })

  /**
   * 按下：进入拖拽态，进度条和歌词高亮立刻跟到指针位置
   * 这里刻意不做 debounce —— 按下必须马上跟手，慢一拍就会被感觉成「按了没反应」
   */
  const handleSeekStart = (clientX: number) => {
    if (!canSeek.value) return
    const target = getSeekTargetByClientX(clientX)
    if (target === null) return
    isSeeking.value = true
    applyPlaybackTime(target)
  }

  /**
   * 拖动中：只更新 UI（进度条 + 歌词高亮一起跟着走），不调 seek
   * 一次拖动会触发几十次 move，每次都 seek 等于让浏览器反复重新缓冲，松手提交一次就够
   */
  const handleSeekMove = (clientX: number) => {
    if (!isSeeking.value) return
    const target = getSeekTargetByClientX(clientX)
    if (target === null) return
    applyPlaybackTime(target)
  }

  /** 松手：seek 到指针所在位置（点击定位也走这里 —— start 和 end 落在同一个点） */
  const handleSeekEnd = (clientX: number) => {
    if (!isSeeking.value) return
    isSeeking.value = false
    const target = getSeekTargetByClientX(clientX)
    commitSeek(target === null ? currentTime.value : target)
  }

  /** 拖拽被系统打断（切后台、指针丢失等）：按最后的预览位置提交，别卡在拖拽态 */
  const handleSeekCancel = () => {
    if (!isSeeking.value) return
    isSeeking.value = false
    commitSeek(currentTime.value)
  }

  /**
   * 真正执行 seek
   * - 先把 UI 钉在目标位置，进度条和歌词高亮立即到位，不等音频
   * - 再开一段静默期：元素位置可能过一会儿才跟过去，
   *   这期间轮询不插手，否则进度条会先弹回旧位置再跳过来
   */
  const commitSeek = (target: number) => {
    if (!audio) return
    const total = duration.value
    const time = Math.max(0, total > 0 ? Math.min(total, target) : target)

    applyPlaybackTime(time)
    seekSettleUntil = Date.now() + SEEK_SETTLE_MS

    try {
      audio.currentTime = time
    } catch (e) {
      console.error('seek 失败', e)
    }
  }

  /* ------------------------------ 收尾 ------------------------------ */

  /** 窗口尺寸变化后重新量一次轨道（响应式布局下几何信息会变） */
  const handleResize = () => measureTrack()

  window.addEventListener('resize', handleResize)

  onBeforeUnmount(() => {
    disposed = true
    window.removeEventListener('resize', handleResize)
    clearAudioLoadTimer()
    destroyAudio()
  })

  return {
    // 状态
    currentTime,
    duration,
    isPlaying,
    isAudioReady,
    isAudioBlocked,
    isBuffering,
    isSeeking,
    loadErrorText,
    showLoading,
    audioLoadSettled,
    pendingAutoPlay,
    shouldAutoPlay,
    // 歌词
    lyrics,
    activeLyricIndex,
    visibleLyrics,
    // 进度
    progressWidth,
    canSeek,
    // 操作
    open,
    stop,
    resetState,
    togglePlay,
    tryAutoPlay,
    measureTrack,
    handleSeekStart,
    handleSeekMove,
    handleSeekEnd,
    handleSeekCancel,
  }
}
