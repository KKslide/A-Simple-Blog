<template>
  <div id="echartDrillDown" ref="echartRef"></div>
  <el-divider></el-divider>
  <el-row>
    <el-button v-if="showBackCountry" @click="backCountry">返回全国</el-button>
    <el-button v-if="showBackProvince" @click="backProvince">返回本省</el-button>
  </el-row>
</template>

<script setup lang="ts">
import { ref, reactive, shallowRef, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import utils from '@/utils'
import * as echarts from 'echarts/core'
import ClientAPI from '@/api/client/index'
import {
  TitleComponent,
  TooltipComponent,
  GeoComponent,
  type TitleComponentOption,
  type TooltipComponentOption,
  type GeoComponentOption
} from 'echarts/components'
import { MapChart, type MapSeriesOption } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'

// 组合 ECharts 的配置类型
type EChartsConfig = echarts.ComposeOption<
  | TitleComponentOption
  | TooltipComponentOption
  | GeoComponentOption
  | MapSeriesOption
>

echarts.use([
  TitleComponent,
  TooltipComponent,
  GeoComponent,
  MapChart,
  CanvasRenderer
])

// 定义区域状态接口
interface AreaState {
  province: string
  city: string
}

// 1. DOM 引用，初始为 null，挂载后为 HTMLElement
const echartRef = ref<HTMLElement | null>(null)

// 2. ECharts 实例，使用 shallowRef 避免深层响应式导致的性能问题
const echartInstance = shallowRef<echarts.ECharts | null>(null)

// 3. ECharts 配置项，指定类型
const echartsConfig = reactive<EChartsConfig>({
  tooltip: {
    trigger: 'item'
  },
  title: {
    text: '全国地图',
    left: 'center', // x: 'center' 在新版 ECharts 推荐用 left
    top: 'top',     // y: 'top' 推荐用 top
    textAlign: 'left'
  },
  geo: {
    map: 'china',
    roam: true,
    label: {
      show: true,
      color: '#333', // textBorderColor 通常配合 color 使用，此处保留原逻辑
      textBorderColor: '#fff',
      textBorderWidth: 2
    },
    emphasis: {
      label: { show: true },
      itemStyle: {
        areaColor: '#ffde33'
      }
    }
  },
  series: []
})

const mapData = reactive<Record<string, unknown>>({})

const currentArea = reactive<AreaState>({
  province: '',
  city: ''
})

const handleResize = utils._debounce(chartsResize, 200)

// ECharts 点击事件参数类型通常包含 name, value 等
function clickHandler(params: { name?: string }) {
  /**
   * 判断是省份, 还是城市
   * ① 特别行政区（2个）：香港、澳门
   * ② 直辖市（4个）：北京、天津、上海、重庆
   * ③ 自治区（5个）：新疆、内蒙古、西藏、广西、宁夏
   * ④ 省（23个）
   */
  const specialDistrict = ['香港', '澳门', '北京', '天津', '上海', '重庆']

  if (params.name && '南海诸岛'.includes(params.name)) return

  // 检查是否已经钻取到底 (province 和 city 都有值)
  // Object.values(currentArea) 返回 string[], some 检查是否存在空字符串
  // !v 表示空字符串。 some(v=>!v) 为 true 表示有空的（没到底）。
  // !some(...) 为 true 表示全都有值（到底了）。
  if (!Object.values(currentArea).some(v => !v)) return

  if (currentArea.province === '') {
    currentArea.province = params.name || ''
  } else {
    if (specialDistrict.includes(currentArea.province)) return
    currentArea.city = params.name || ''
  }
}

async function getMap(params: Partial<AreaState> = {}) {
  // todo 为 ClientAPI.getMapData 添加泛型返回类型
  return await ClientAPI.getMapData(params)
}

function backProvince() {
  currentArea.city = ''
}

function backCountry() {
  currentArea.province = ''
  currentArea.city = ''
}

function chartsResize() {
  try {
    echartInstance.value?.resize()
  } catch (error) {
    console.log('error ==>>>', error)
  }
}

watch(
  () => currentArea,
  () => {
    getMap(currentArea).then(res => {
      const { province, city } = currentArea
      const mapName = province || city || 'china'

      // 注册地图
      echarts.registerMap(mapName, res as any)

      // 更新配置
      if (echartsConfig.geo) {
        echartsConfig.geo.map = mapName
      }
      if (echartsConfig.title && !Array.isArray(echartsConfig.title)) {
        echartsConfig.title.text = `${city || province || '中国'}地图`
      }

      // 设置选项
      echartInstance.value?.setOption(echartsConfig, true)
    })
  },
  { deep: true }
)

const showBackCountry = computed(() => {
  return currentArea.province !== ''
})

const showBackProvince = computed(() => {
  return currentArea.city !== ''
})

onMounted(() => {
  if (!echartRef.value) return

  getMap(currentArea)
    .then(res => {
      Object.assign(mapData, res)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      echarts.registerMap('china', mapData as any)

      // 初始化实例
      echartInstance.value = echarts.init(echartRef.value!)
      echartInstance.value.setOption(echartsConfig)

      // 绑定点击事件
      echartInstance.value.on('click', clickHandler)
    })
    .then(() => {
      window.addEventListener('resize', handleResize)
    })
    .catch(err => {
      console.log('err ===>>>>', err)
    })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  echartInstance.value?.dispose()
})
</script>

<style lang="scss" scoped>
#echartDrillDown {
  width: 100%;
  height: 60vh;
  background-color: #f2f2f2;
}
</style>
