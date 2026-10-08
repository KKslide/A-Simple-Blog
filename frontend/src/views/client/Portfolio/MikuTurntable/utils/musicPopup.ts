/**
 * LRC 歌词解析 + 5 行窗口构建（纯函数，零依赖）
 *
 * 移植自小程序版本，逻辑未改动。
 */

export interface LyricLine {
  key?: string
  text: string
  time: number
}

/** 空行占位文案：用空格而非空串，保证行高不塌 */
export const EMPTY_LYRIC = ' '
/** 可见歌词窗口固定行数 */
export const POPUP_LINE_COUNT = 5
/** 当前播放行在窗口中的槽位（0 基），即「正中间」 */
export const ACTIVE_LINE_POSITION = 2

/** 构造一屏空歌词（无歌词 / 还没开始时用） */
export function buildEmptyLyrics(): LyricLine[] {
  return Array.from({ length: POPUP_LINE_COUNT }).map((_, index) => ({
    key: `empty-line-${index}`,
    text: EMPTY_LYRIC,
    time: Number.MAX_SAFE_INTEGER,
  }))
}

/**
 * 解析 LRC 文本
 *
 * 时间标签必须形如 [mm:ss.xxx]，**分钟必须两位**（[0:05.084] 解析不出来，整行丢弃）。
 * 小数位支持 1~3 位：`.4` 当 400ms，`.48` 当 480ms，`.480` 当 480ms。
 *
 * @param lrcText LRC 全文
 */
export function parseLrc(lrcText?: string): LyricLine[] {
  if (!lrcText) return []

  const rows = lrcText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const result: LyricLine[] = []

  rows.forEach((row) => {
    const timeMatches = [...row.matchAll(/\[(\d{2}):(\d{2})(?:\.(\d{1,3}))?\]/g)]

    if (!timeMatches.length) return

    const text = row.replace(/\[(\d{2}):(\d{2})(?:\.(\d{1,3}))?\]/g, '').trim()

    // 一行可能带多个时间标签（同一句重复出现），逐个展开
    timeMatches.forEach((match) => {
      const minute = Number(match[1] || 0)
      const second = Number(match[2] || 0)
      const fraction = String(match[3] || '0').padEnd(3, '0')
      const time = minute * 60 + second + Number(fraction) / 1000

      result.push({
        time,
        text: text || EMPTY_LYRIC,
      })
    })
  })

  return result.sort((a, b) => a.time - b.time)
}

/**
 * 构建固定 5 行的歌词窗口
 *
 * 取 [active-2, active-1, active, active+1, active+2]，
 * 所以当前行**恒落在第 2 槽**（ACTIVE_LINE_POSITION），模板里 index === 2 是设计不是魔数。
 * 越界的位置用空行补齐，保证窗口高度稳定不跳动。
 */
export function buildVisibleLyrics(lyrics: LyricLine[], activeLyricIndex: number): LyricLine[] {
  if (!lyrics.length) {
    return buildEmptyLyrics()
  }

  const start = activeLyricIndex - ACTIVE_LINE_POSITION
  const lines: LyricLine[] = []

  for (let i = 0; i < POPUP_LINE_COUNT; i++) {
    const lyricIndex = start + i
    const item = lyrics[lyricIndex]

    if (item) {
      lines.push({
        ...item,
        key: `${item.time}-${lyricIndex}-${item.text}`,
      })
    } else {
      lines.push({
        key: `empty-${i}-${lyricIndex}`,
        text: EMPTY_LYRIC,
        time: Number.MAX_SAFE_INTEGER,
      })
    }
  }

  return lines
}

/**
 * 按当前播放时间定位到第几句歌词
 * 取「最后一个时间戳 ≤ 当前时间」的那句；还没到第一句时返回 0
 */
export function findCurrentLyricIndex(lyrics: LyricLine[], currentTime: number): number {
  if (!lyrics.length) return 0

  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (currentTime >= lyrics[i].time) {
      return i
    }
  }

  return 0
}
