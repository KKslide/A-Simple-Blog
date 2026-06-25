import { ref, watch, onBeforeUnmount, type Ref } from 'vue'
import Plyr from 'plyr'

/**
 * 在 Vue 3 中封装 Plyr 播放器的生命周期。
 * - 当 video 元素挂载到 DOM 时自动创建 Plyr 实例
 * - 当元素销毁（v-if / :key 变化）时自动销毁旧实例
 * - 组件卸载时清理
 */
export function usePlyr(videoRef: Ref<HTMLVideoElement | null>, options?: Plyr.Options) {
  const player = ref<Plyr | null>(null)

  const stopWatch = watch(
    () => videoRef.value,
    (newEl) => {
      // 先销毁旧实例
      if (player.value) {
        player.value.destroy()
        player.value = null
      }
      // 新元素挂载时创建 Plyr
      if (newEl) {
        player.value = new Plyr(newEl, options)
      }
    },
    { flush: 'post' },
  )

  onBeforeUnmount(() => {
    stopWatch()
    if (player.value) {
      player.value.destroy()
      player.value = null
    }
  })

  return { player }
}
