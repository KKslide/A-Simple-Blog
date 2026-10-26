import { shallowRef, onUnmounted } from 'vue'
import { debounce } from '@/views/client/Portfolio/HengzhiyuanMap/utils'

/**
 * 图表 resize 处理
 */
export function useChart() {
  const chartInstance = shallowRef<any>()
  const handleResize = debounce(() => {
    try {
      chartInstance.value?.resize()
    } catch (error) {
      console.log('err==>>>', error)
    }
  }, 200)

  function setResize() {
    window.addEventListener('resize', handleResize)
  }

  function removeResize() {
    window.removeEventListener('resize', handleResize)
  }

  onUnmounted(() => {
    removeResize()
  })

  return { chartInstance, setResize }
}
