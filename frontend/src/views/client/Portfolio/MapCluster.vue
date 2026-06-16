<template>
  <div ref="mapRef" class="map-wrapper">
    <div id="BMap"></div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, onUnmounted, shallowRef, ref } from 'vue'
import { ElLoading } from 'element-plus'
import utils from '@/utils'
import yuexiu from '@/assets/json/yuexiu.json'

const BAIDU_MAP_API = import.meta.env.VITE_BAIDU_MAP_API
const BAIDU_MAP_CLUSTER_CDN = import.meta.env.VITE_BAIDU_MAP_CLUSTER_CDN
const CHANCE_JS = import.meta.env.VITE_CHANCE_JS

/** 动态加载外部脚本 */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.head.appendChild(script)
  })
}

/** 通过 callback 参数加载百度地图 API（API 异步初始化，onload 触发时 BMapGL 还不存在） */
function loadBaiduMapAPI(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const cbName = '_baiduMapInit_' + Date.now()
    const timer = setTimeout(() => reject(new Error('Baidu Map API init timeout')), 15000)
    ;(window as any)[cbName] = () => {
      delete (window as any)[cbName]
      clearTimeout(timer)
      resolve()
    }
    const url = src + (src.includes('?') ? '&' : '?') + 'callback=' + cbName
    const script = document.createElement('script')
    script.src = url
    script.onerror = () => { clearTimeout(timer); reject(new Error('Baidu Map API load failed')) }
    document.head.appendChild(script)
  })
}

/** 轮询等待全局变量可用 */
function waitForGlobal(key: string, timeout = 15000): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any)[key]) return resolve()
    const start = Date.now()
    const timer = setInterval(() => {
      if ((window as any)[key]) {
        clearInterval(timer)
        resolve()
      } else if (Date.now() - start > timeout) {
        clearInterval(timer)
        reject(new Error(`Timeout waiting for window.${key}`))
      }
    }, 50)
  })
}

// 声明百度地图类型
declare global {
  interface Window {
    BMapGL: typeof BMapGL
    Cluster: typeof Cluster
    Chance: new () => Chance
  }
}

interface Chance {
  floating(opts: { min: number; max: number; fixed: number }): number
}

declare class BMapGLMap {
  constructor(container: string | HTMLElement)
  setMapStyleV2(options: { styleId: string }): void
  centerAndZoom(point: BMapGLPoint, zoom: number): void
  enableScrollWheelZoom(enable: boolean): void
  setMinZoom(zoom: number): void
  setMaxZoom(zoom: number): void
  resize(): void
  addNormalLayer(layer: BMapGLFillLayer): void
  addEventListener(event: string, handler: () => void): void
  removeEventListener(event: string, handler: () => void): void
  destroy(): void
}

declare class BMapGLPoint {
  constructor(lng: number, lat: number)
}

declare class BMapGLFillLayer {
  constructor(options: {
    crs: string
    enablePicked: boolean
    autoSelect: boolean
    border: boolean
    style: {
      fillColor: string
      fillOpacity: number
      strokeWeight: number
      strokeColor: string
      strokeStyle: string
    }
  })
  setData(data: unknown): void
}

declare class ClusterView {
  constructor(map: BMapGLMap, options: {
    clusterMinPoints: number
    clusterMaxZoom: number
    updateRealTime: boolean
    fitViewOnClick: boolean
    renderClusterStyle: {
      type: unknown
      inject: (context: { pointCount: number }) => HTMLDivElement
    }
    renderSingleStyle: {
      type: unknown
      inject: () => HTMLDivElement
    }
  })
  on(event: string, handler: (params: { target: { properties: Record<string, unknown> } }) => void): void
  setData(data: GeoFeature[]): void
  destroy(): void
}

declare const BMapGL: {
  Map: typeof BMapGLMap
  Point: typeof BMapGLPoint
  FillLayer: typeof BMapGLFillLayer
}

declare const Cluster: {
  View: typeof ClusterView
  ClusterRender: {
    DOM: unknown
  }
}

/* ================= 类型建模 ================= */

interface Point {
  lng: number
  lat: number
}

interface GeoFeature {
  type: 'Feature'
  properties: Record<string, unknown>
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
}

interface FeatureCollection {
  type: 'FeatureCollection'
  features: GeoFeature[]
}

/* ================= 基础数据 ================= */

let chance: Chance

const polygon: Point[] = [
  { lng: 113.25284, lat: 23.139701 },
  { lng: 113.292807, lat: 23.140298 },
  { lng: 113.294556, lat: 23.12058 },
  { lng: 113.255234, lat: 23.115724 }
]

/* ================= refs ================= */

const mapRef = ref<HTMLElement | null>(null)
const map = shallowRef<BMapGLMap | null>(null)
const cluster = shallowRef<ClusterView | null>(null)

const handleResize = utils._debounce(resize, 200)

/* ================= GeoJSON ================= */

const points = reactive<FeatureCollection>({
  type: 'FeatureCollection',
  features: []
})

/* ================= utils ================= */

function createRandomPoints(num: number): GeoFeature[] {
  const lngs = polygon.map(p => p.lng)
  const lats = polygon.map(p => p.lat)

  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)

  return Array.from({ length: num }, (): GeoFeature => ({
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Point',
      coordinates: [
        chance.floating({ min: minLng, max: maxLng, fixed: 6 }),
        chance.floating({ min: minLat, max: maxLat, fixed: 6 })
      ]
    }
  }))
}

/* ================= DOM ================= */

function createBasicDom(): HTMLDivElement {
  const pinContainer = document.createElement('div')
  const pinEl = document.createElement('div')

  pinContainer.className = 'pin-container'
  pinEl.className = 'pin'

  pinContainer.appendChild(pinEl)

  return pinContainer
}

function createClusterDOM(context: { pointCount: number }): HTMLDivElement {
  const pinContainer = createBasicDom()

  if (context.pointCount) {
    const countEl = document.createElement('div')
    countEl.className = 'count'
    countEl.textContent = String(context.pointCount)
    pinContainer.appendChild(countEl)
  }

  return pinContainer
}

function createSingleDOM(): HTMLDivElement {
  return createBasicDom()
}

/* ================= resize ================= */

function resize(): void {
  if (!map.value) return

  map.value.resize()
  map.value.centerAndZoom(new window.BMapGL.Point(113.270842, 23.131681), 14)
}

/* ================= lifecycle ================= */

onMounted(async () => {
  const loading = ElLoading.service({ target: mapRef.value!, text: 'Loading...' })
  try {
    // 动态加载三个外部库（百度地图用 callback 机制，其余用 onload）
    await Promise.all([
      loadBaiduMapAPI(BAIDU_MAP_API),
      loadScript(CHANCE_JS),
    ])
    await loadScript(BAIDU_MAP_CLUSTER_CDN)
    await waitForGlobal('Cluster')
  } catch (e) {
    loading.close()
    throw e
  }

  chance = new window.Chance()
  points.features = createRandomPoints(100)

  map.value = new window.BMapGL.Map('BMap')

  map.value.setMapStyleV2({
    styleId: '170d7f48abe3471089410f3de92624d9'
  })

  map.value.centerAndZoom(new window.BMapGL.Point(113.270842, 23.131681), 14)
  map.value.enableScrollWheelZoom(true)
  map.value.setMinZoom(2)
  map.value.setMaxZoom(20)

  const fillLayer = new window.BMapGL.FillLayer({
    crs: 'GCJ02',
    enablePicked: false,
    autoSelect: false,
    border: true,
    style: {
      fillColor: 'rgba(112,112,117,0.5)',
      fillOpacity: 0.3,
      strokeWeight: 1,
      strokeColor: 'rgba(255,0,0,0.5)',
      strokeStyle: 'dashed'
    }
  })

  cluster.value = new window.Cluster.View(map.value, {
    clusterMinPoints: 2,
    clusterMaxZoom: 20,
    updateRealTime: true,
    fitViewOnClick: true,
    renderClusterStyle: {
      type: window.Cluster.ClusterRender.DOM,
      inject: createClusterDOM
    },
    renderSingleStyle: {
      type: window.Cluster.ClusterRender.DOM,
      inject: createSingleDOM
    }
  })

  cluster.value.on('click', (params: { target: { properties: Record<string, unknown> } }) => {
    console.log(params.target.properties)
  })

  const handleFirstRender = () => {
    if (map.value) {
      map.value.addNormalLayer(fillLayer)
      fillLayer.setData(yuexiu)

      if (cluster.value) {
        cluster.value.setData(points.features)
      }

      loading.close()
      map.value.removeEventListener('tilesloaded', handleFirstRender)
      window.addEventListener('resize', handleResize)
    }
  }

  map.value.addEventListener('tilesloaded', handleFirstRender)
})

onUnmounted(() => {
  map.value?.destroy()
  cluster.value?.destroy()
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
.map-wrapper {
  width: 100%;
  height: 80vh;
  position: relative;
}

#BMap {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
