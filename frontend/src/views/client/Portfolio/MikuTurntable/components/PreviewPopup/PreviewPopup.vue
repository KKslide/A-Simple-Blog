<template>
  <!--
    弹窗壳：自研而非用 el-dialog。
    原因：el-dialog 默认 teleport 到 body，会逃离手机外框铺满整页；
    而唱片机本身就活在「手机屏幕」这个容器里，必须绝对定位在框内。
    自研壳 ~20 行，还能完全掌控过渡曲线，比改造 el-dialog 更省事也更丝滑。
  -->
  <Transition name="miku-popup">
    <div v-if="visible" class="music-popup-mask" @click.self="handleMaskClick">
      <!--
        关闭按钮放在遮罩层下（而非弹窗内）：原版是 position: fixed 相对视口定位，
        这里改成 absolute 相对手机框定位，语义才和原来一致 —— 放进弹窗内会被
        弹窗的 padding box 重新定义参照点，位置算不准
      -->
      <img
        v-if="isContentMounted"
        class="music-popup-close"
        src="https://jpuboss.janime.cn/6a2794466b58338796badff2"
        alt="关闭"
        @click="close"
        @load="imagePreload.handleDone('close')"
        @error="imagePreload.handleDone('close')"
      />

      <div class="music-popup-outer">
        <div class="music-popup">
          <div v-if="showLoading" class="music-popup-loading">
            <div class="music-popup-loading-spinner" />
            <span class="music-popup-loading-text">加载中...</span>
          </div>

          <div
            v-if="isContentMounted"
            :key="popupRenderKey"
            class="music-popup-main"
            :class="{ 'music-popup-main--ready': !showLoading }"
          >
            <img
              class="music-popup-note music-popup-note--left"
              src="https://jpuboss.janime.cn/6a27addc6b58338796badff4"
              alt=""
              @load="imagePreload.handleDone('noteLeft')"
              @error="imagePreload.handleDone('noteLeft')"
            />
            <img
              class="music-popup-note music-popup-note--right"
              src="https://jpuboss.janime.cn/6a27addc6b58338796badff3"
              alt=""
              @load="imagePreload.handleDone('noteRight')"
              @error="imagePreload.handleDone('noteRight')"
            />

            <div class="music-popup-title music-popup-title--card">
              <img
                class="music-popup-title-image"
                :src="titleImageUrl"
                alt=""
                @load="imagePreload.handleDone('title')"
                @error="imagePreload.handleDone('title')"
              />
            </div>

            <img
              class="music-popup-cover"
              src="https://jpuboss.janime.cn/6a2bcbaa6b58338796bae03c"
              alt=""
            />

            <div class="music-card">
              <div class="music-card__tonearm-anchor">
                <img
                  class="music-card__tonearm"
                  :class="{
                    'music-card__tonearm--playing': isPlaying,
                    'music-card__tonearm--blocked': isAudioBlocked,
                  }"
                  src="https://jpuboss.janime.cn/6a27cad16b58338796bae022"
                  alt=""
                  @load="imagePreload.handleDone('tonearm')"
                  @error="imagePreload.handleDone('tonearm')"
                />
              </div>

              <div class="music-card__panel">
                <img
                  v-if="trayImageUrl"
                  class="music-card__tray"
                  :src="trayImageUrl"
                  alt=""
                  @load="imagePreload.handleDone('tray')"
                  @error="imagePreload.handleDone('tray')"
                />
                <!-- 唱片旋转：播放中就一直转（真实唱机如此），不再受 playEffect 限制 -->
                <img
                  v-if="discVisible && currentDiscImage"
                  class="music-card__disc"
                  :class="{ 'music-card__disc--playing': isPlaying }"
                  :src="currentDiscImage"
                  alt=""
                  @load="imagePreload.handleDone('disc')"
                  @error="imagePreload.handleDone('disc')"
                />
                <div v-else-if="discVisible" class="music-card__disc music-card__disc--placeholder" />
              </div>
            </div>

            <div class="lyrics-panel">
              <!--
                key 用槽位下标而不是 line.key：可见窗口就固定 5 个槽位，是「位置固定、内容上滚」，
                用下标做 key 才能让每行原地改文案、原地换高亮类；用 line.key 的话每换一句 5 个
                key 全变，节点会被整体销毁重建，既浪费又拿不到过渡
              -->
              <div v-for="(line, index) in visibleLyrics" :key="index" class="lyrics-line">
                <div class="lyrics-line__inner">
                  <!--
                    可见歌词窗口固定 5 行，当前播放行恒在中位（index 2，见 utils/musicPopup 的
                    ACTIVE_LINE_POSITION），所以高亮直接打在 index === 2 上；
                    空行（占位/纯间奏）不高亮，故要判 text.trim()
                  -->
                  <span
                    class="lyrics-line__text"
                    :class="{
                      'lyrics-line__text--fade-top': index === 0 && !!line.text.trim(),
                      'lyrics-line__text--active': index === 2 && !!line.text.trim(),
                    }"
                  >
                    {{ line.text || '' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!--
            进度条：支持点击定位 + 按住拖拽
            用 Pointer Events 统一鼠标与触摸；setPointerCapture 保证拖出元素范围也继续收事件
          -->
          <div
            ref="trackEl"
            class="progress-wrap"
            @pointerdown.stop="onPointerDown"
            @pointermove.stop="onPointerMove"
            @pointerup.stop="onPointerUp"
            @pointercancel.stop="onPointerCancel"
          >
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: progressWidth }"></div>
            </div>
            <div class="progress-dot" :style="{ left: progressWidth }"></div>
          </div>

          <div class="music-actions">
            <div
              class="music-actions__button"
              :class="{
                'music-actions__button--disabled': isAudioBlocked,
                'music-actions__button--playing': isPlaying,
              }"
              role="button"
              :aria-label="isPlaying ? '暂停' : '播放'"
              @click="togglePlay"
            ></div>

            <!-- 缓冲转圈：盖在播放键上但不挡点击，seek 或网络卡顿时给个反馈 -->
            <div v-if="isBuffering" class="music-buffering">
              <div class="music-buffering__spinner" />
            </div>
          </div>

          <div v-if="loadErrorText" class="music-error">
            {{ loadErrorText }}
          </div>

          <!--
            播放动效点缀：按 play_effect 展示对应 APNG，铺满整个弹窗，
            pointer-events: none 不遮挡播放/暂停/关闭
          -->
          <img v-if="effectImageUrl" class="music-popup-effect" :src="effectImageUrl" alt="" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { MusicItem } from '../../data/music'
import { useImagePreload } from './useImagePreload'
import { useMusicPlayer } from './useMusicPlayer'

interface Props {
  /** 显隐 */
  visible?: boolean
  /** 当前曲目；为空时弹窗内各图走兜底 */
  item?: MusicItem | null
  /** 打开即播 */
  autoPlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  item: null,
  autoPlay: false,
})

const emit = defineEmits<{
  (event: 'close'): void
}>()

/* ------------------------------ 弹窗自身 UI 状态 ------------------------------ */

/** 内容是否已挂载（显隐切换时整块重建，保证每次打开都是干净的首屏） */
const isContentMounted = ref(false)
/** 每次打开自增，作为内容块的 key，强制重建 */
const popupRenderKey = ref(0)
/** 唱片是否可见（打开后由布局回调放开，避免首屏闪一下空托盘） */
const discVisible = ref(true)
/** 关闭后的延迟复位定时器 */
let closeTimer: ReturnType<typeof setTimeout> | null = null

/** 进度条轨道元素，换算拖拽位置要用 */
const trackEl = ref<HTMLElement | null>(null)

/* ------------------------------ 展示用派生数据 ------------------------------ */

/**
 * play_effect 取值 → 对应的点缀 APNG 外链
 * 只处理 sakura / snow / hidden 三个值；none 及未知值一律不展示点缀
 */
const PLAY_EFFECT_IMAGES: Record<string, string> = {
  sakura: 'https://jpuboss.janime.cn/6ab0fc104a49e74c22e721bf',
  snow: 'https://jpuboss.janime.cn/6ab0fc104a49e74c22e721c1',
  hidden: 'https://jpuboss.janime.cn/6ab0fc104a49e74c22e721c0',
}

/** 当前曲目的动效点缀图；effect 为 none / 空 / 未收录时不展示 */
const effectImageUrl = computed(() => {
  const effect = props.item?.effect || ''
  return PLAY_EFFECT_IMAGES[effect] || ''
})

/** 兜底封面：宫格立绘优先，其次唱片图 */
const coverImage = computed(() => props.item?.cover || props.item?.disc || '')

const titleImageUrl = computed(() => props.item?.titleImage || coverImage.value || '')

const trayImageUrl = computed(() => props.item?.tray || coverImage.value || '')

const currentDiscImage = computed(
  () => props.item?.discStill || props.item?.discPlaying || coverImage.value || '',
)

/** 要播的音频地址 */
const musicUrl = computed(() => props.item?.url || '')

/** 要展示的歌词 LRC */
const lyricText = computed(() => props.item?.lrc || '')

/**
 * 需要等加载的图片清单（固定外链 + 随曲目变化的三张）
 * 全部有着落之后才撤掉首屏 loading
 */
const trackedImages = computed(() =>
  [
    { key: 'close', src: 'https://jpuboss.janime.cn/6a2794466b58338796badff2' },
    { key: 'noteLeft', src: 'https://jpuboss.janime.cn/6a27addc6b58338796badff4' },
    { key: 'noteRight', src: 'https://jpuboss.janime.cn/6a27addc6b58338796badff3' },
    { key: 'tonearm', src: 'https://jpuboss.janime.cn/6a27cad16b58338796bae022' },
    { key: 'title', src: titleImageUrl.value },
    { key: 'tray', src: trayImageUrl.value },
    { key: 'disc', src: currentDiscImage.value },
  ].filter((entry) => entry.src),
)

/*
 * 注意顺序：下面两个 hook 在注册时就会立刻读 musicUrl / lyricText / trackEl，
 * 所以派生数据必须先定义好，否则会命中 TDZ 报 ReferenceError。
 */

/** 音频引擎：播放控制、进度时间源、歌词索引、进度条拖拽 */
const {
  isPlaying,
  isAudioBlocked,
  isBuffering,
  loadErrorText,
  showLoading,
  audioLoadSettled,
  shouldAutoPlay,
  visibleLyrics,
  progressWidth,
  open,
  stop,
  resetState,
  togglePlay,
  tryAutoPlay,
  handleSeekStart,
  handleSeekMove,
  handleSeekEnd,
  handleSeekCancel,
} = useMusicPlayer({
  musicUrl: () => musicUrl.value,
  lyricText: () => lyricText.value,
  autoPlay: () => props.autoPlay,
  trackEl,
  // 音频这一侧有结果了（canplay / error / 超时），重新判断 loading 收不收
  onAudioSettled: () => settlePopupLoading(),
  // 弹窗内容挂载完、开始拉音源之前：放开唱片
  onLayoutReady: () => {
    discVisible.value = true
  },
})

/** 图片预加载：全 load/error 完才算好，用来和音频一起决定 loading 何时撤 */
const imagePreload = useImagePreload(
  () => trackedImages.value,
  () => settlePopupLoading(),
)

/**
 * 收首屏 loading：图片和音频两边都有着落才撤
 * 撤掉的同时尝试自动起播（有诉求、音频可播、且当前没在播）
 */
const settlePopupLoading = () => {
  if (!showLoading.value) {
    tryAutoPlay()
    return
  }
  if (!imagePreload.allImagesLoaded.value) return
  if (!audioLoadSettled.value) return
  if (shouldAutoPlay.value) {
    tryAutoPlay()
    return
  }
  showLoading.value = false
  tryAutoPlay()
}

/* --------------------------- 进度条指针事件接线 --------------------------- */

/** 按下时捕获指针，之后移出元素范围也能继续收到 move/up */
const onPointerDown = (e: PointerEvent) => {
  ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
  handleSeekStart(e.clientX)
}

const onPointerMove = (e: PointerEvent) => {
  handleSeekMove(e.clientX)
}

const onPointerUp = (e: PointerEvent) => {
  ;(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
  handleSeekEnd(e.clientX)
}

const onPointerCancel = () => {
  handleSeekCancel()
}

/* -------------------------------- 关闭 -------------------------------- */

const close = () => {
  emit('close')
}

/** 点遮罩不关闭：防止误触把正在放的歌关掉（对应小程序 maskClickable: false） */
const handleMaskClick = () => {
  /* 刻意留空 */
}

onBeforeUnmount(() => {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
})

/**
 * 弹窗显隐：打开时重建音频并起播，关闭时停播并延迟复位
 *
 * 放在文件末尾注册（而不是推导数据那一段）：immediate 会同步跑一次回调，
 * 这时上面那些 hook 返回值还没解构出来
 */
watch(
  () => props.visible,
  (val) => {
    if (closeTimer) {
      clearTimeout(closeTimer)
      closeTimer = null
    }
    if (val) {
      resetState()
      imagePreload.reset()
      isContentMounted.value = false
      nextTick(() => {
        isContentMounted.value = true
        popupRenderKey.value += 1
        open()
      })
      return
    }
    stop()
    closeTimer = setTimeout(() => {
      resetState()
      imagePreload.reset()
      isContentMounted.value = false
      closeTimer = null
    }, 320)
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
/* rpx() 由 PreviewPopup.scss 内部自行 @use，这里不必重复引入 */
@use 'PreviewPopup';
</style>
