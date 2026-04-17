// ECharts v6 type declarations
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
