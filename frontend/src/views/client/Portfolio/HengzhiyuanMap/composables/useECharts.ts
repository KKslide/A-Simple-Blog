/**
 * ECharts 实例加载
 *
 * 原项目区分了 DEV (npm) / PROD (CDN) 两种方式, 集成进博客后统一走 Vite 打包,
 * 直接使用 npm 依赖即可.
 */
import * as echarts from 'echarts'
import 'echarts/extension/bmap/bmap'
import 'echarts-gl'

let echartsInstance: any = null

/**
 * 获取 ECharts 实例 (只初始化一次)
 */
export async function useECharts(): Promise<any> {
  if (echartsInstance) {
    return echartsInstance
  }
  echartsInstance = echarts
  return echartsInstance
}
