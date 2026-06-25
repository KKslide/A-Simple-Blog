/**
 * Vite 环境类型声明 & 第三方库模块补丁
 *
 * 集中管理：
 *   - Vite 特殊模块声明（*.vue / *.scss / *.css）
 *   - 第三方库类型补丁（plyr / echarts / wangeditor）
 *   - ImportMeta 环境变量类型
 */

// ============================================================
// Vite 特殊模块
// ============================================================

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

declare module '*.scss' {
  const content: string
  export default content
}

declare module '*.css'

// ============================================================
// 第三方库类型补丁
// ============================================================

/** Plyr - 修正 CJS/ESM 导出兼容 */
declare module 'plyr' {
  export { default } from 'plyr'
  export * from 'plyr'
}

/** ECharts v6 - 按模块声明 */
declare module 'echarts/core' {
  export const init: (dom: HTMLElement, theme?: string | object, opts?: { renderer?: string; useDirtyRect?: boolean }) => ECharts
  export const registerMap: (name: string, data: any) => void
  export const getMap: (name: string) => any
  export const use: (modules: any[]) => void

  export interface ECharts {
    setOption(option: any, notMerge?: boolean, lazyUpdate?: boolean): void
    getOption(): any
    resize(opts?: { width?: number | string; height?: number | string; silent?: boolean }): void
    dispatchAction(payload: any): void
    on(eventName: string, handler: Function, context?: object): void
    off(eventName: string, handler?: Function, context?: object): void
    showLoading(type?: string, opts?: object): void
    hideLoading(): void
    getDataURL(opts: { type?: string; pixelRatio?: number; backgroundColor?: string; excludeComponents?: string[] }): string
    getSvgDataURL(opts: { type?: string; pixelRatio?: number; backgroundColor?: string; excludeComponents?: string[] }): string
    clear(): void
    dispose(): void
    isDisposed(): boolean
    bind(name: string, fn: Function, ctx?: object): void
    unbind(name: string, fn?: Function): void
  }

  export interface ComposeOption<T extends string = never> {
    [key: string]: any
  }
}

declare module 'echarts/components' {
  export const TitleComponent: any
  export const TooltipComponent: any
  export const GeoComponent: any
  export const LegendComponent: any
  export const GridComponent: any
  export const ToolboxComponent: any
  export const DataZoomComponent: any
  export const TimelineComponent: any

  export type TitleComponentOption = any
  export type TooltipComponentOption = any
  export type GeoComponentOption = any
  export type LegendComponentOption = any
  export type GridComponentOption = any
  export type ToolboxComponentOption = any
  export type DataZoomComponentOption = any
  export type TimelineComponentOption = any
}

declare module 'echarts/charts' {
  export const MapChart: any
  export const LineChart: any
  export const BarChart: any
  export const PieChart: any
  export const ScatterChart: any
  export const RadarChart: any
  export const GaugeChart: any
  export const TreeChart: any
  export const TreemapChart: any
  export const SunburstChart: any
  export const EffectScatterChart: any
  export const CustomChart: any

  export type MapSeriesOption = any
  export type LineSeriesOption = any
  export type BarSeriesOption = any
  export type PieSeriesOption = any
  export type ScatterSeriesOption = any
  export type RadarSeriesOption = any
  export type GaugeSeriesOption = any
}

declare module 'echarts/renderers' {
  export const CanvasRenderer: any
  export const SVGRenderer: any
}

/** wangeditor 编辑器 */
declare module '@wangeditor/editor-for-vue' {
  import { DefineComponent } from 'vue'

  interface WangEditor {
    getHtml(): string
    getMenuConfig(menuKey: string): {
      customUpload?: (file: File, insertFn: (...args: unknown[]) => void) => void
    }
  }

  export const Editor: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export const Toolbar: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
}

declare module 'wangeditor' {
  export interface WangEditor {
    getHtml(): string
    getMenuConfig(menuKey: string): {
      customUpload?: (file: File, insertFn: (...args: unknown[]) => void) => void
    }
  }
}

// ============================================================
// Vite 环境变量
// ============================================================

interface ImportMetaEnv {
  /** 后端 API 地址 */
  readonly VITE_API_URL: string
  /** 静态资源（图片/视频）地址 */
  readonly VITE_MEDIA_URL: string
  /** 前端部署基路径 */
  readonly VITE_BASE_URL?: string
  /** 百度地图 API Key */
  readonly VITE_BAIDU_MAP_API: string
  /** 百度地图聚合插件 CDN */
  readonly VITE_BAIDU_MAP_CLUSTER_CDN: string
  /** Chance.js CDN */
  readonly VITE_CHANCE_JS: string
  /** Vite 内置 */
  readonly BASE_URL?: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean
  /** 兼容未显式声明的 env 变量 */
  [key: string]: any
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
