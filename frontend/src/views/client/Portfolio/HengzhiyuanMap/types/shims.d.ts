/// <reference types="vite/client" />

// 原项目依赖的第三方全局变量 (百度地图 / 聚合插件)
declare global {
  const BMapGL: any
  const Cluster: any

  interface Window {
    BMapGL: any
    Cluster: any
    echarts: any
  }
}

// ECharts 扩展没有随包提供类型声明, 这里放宽处理
declare module 'echarts/extension/bmap/bmap'
declare module 'echarts-gl'

// Vite 静态资源
declare module '*.JPG' {
  const src: string
  export default src
}

export {}
