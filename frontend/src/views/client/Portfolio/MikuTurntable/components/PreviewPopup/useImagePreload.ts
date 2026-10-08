import { ref } from 'vue'

export interface PreloadImage {
  /** 唯一标识，用来防止同一张图重复计数 */
  key: string
  /** 图片地址，为空的不纳入统计 */
  src: string
}

/**
 * 弹窗图片预加载门闸
 *
 * 用途：弹窗里有封面、唱机、唱片、标题等一堆外链图，全 load/error 完之前先盖着 loading，
 * 否则会出现「图一张张往外蹦」的观感。
 *
 * 两个刻意的设计：
 * - error 也算完成 —— 一张图 404 不该把整个弹窗永远卡在加载中
 * - 清单是一组固定的外链常量 + 随曲目变化的三张图，所以用 getter 而不是值传进来，
 *   换曲目重新 reset() 即可，不需要重建这个 hook
 *
 * 移植自小程序版本，逻辑未改动。
 *
 * @param images 需要跟进的图片清单（getter）
 * @param onChange 每张图有结果时回调，供外部重新判断 loading 该不该收
 */
export function useImagePreload(images: () => PreloadImage[], onChange?: () => void) {
  /** 清单里的图是否全部有着落 */
  const allImagesLoaded = ref(false)
  /** 已有着落的张数 */
  const loadedCount = ref(0)
  /** 本次需要跟进的张数（reset 时按当时的清单快照） */
  const requiredCount = ref(0)
  /** 已计过数的图，避免 load 和 error 双触发导致重复计数 */
  const trackedImageState = ref<Record<string, boolean>>({})

  /** 重新开始一轮统计；清单为空时直接算完成 */
  const reset = () => {
    allImagesLoaded.value = false
    loadedCount.value = 0
    requiredCount.value = images().length
    trackedImageState.value = {}
    if (requiredCount.value === 0) {
      allImagesLoaded.value = true
    }
  }

  /** 某张图 load/error 了，计数并判断是否全部有着落 */
  const handleDone = (key: string) => {
    if (trackedImageState.value[key]) return
    trackedImageState.value[key] = true
    loadedCount.value += 1
    if (loadedCount.value >= requiredCount.value) {
      allImagesLoaded.value = true
    }
    onChange?.()
  }

  return {
    allImagesLoaded,
    loadedCount,
    requiredCount,
    reset,
    handleDone,
  }
}
