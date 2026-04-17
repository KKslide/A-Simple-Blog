<template>
  <div id="echartDrillDown" ref="echartRef"></div>
  <el-divider></el-divider>
  <el-row>
    <el-button v-if="showBackCountry" @click="backCountry">返回全国</el-button>
    <el-button v-if="showBackProvince" @click="backProvince">返回本省</el-button>
  </el-row>
</template>

<script setup>
import { ref, reactive, shallowRef, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import utils from '@/utils'
import * as echarts from 'echarts/core'
import ClientAPI from '@/api/client/index'
import {
  TitleComponent,
  TooltipComponent,
  GeoComponent,
} from 'echarts/components'
import { MapChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
echarts.use([
  TitleComponent,
  TooltipComponent,
  GeoComponent,
  MapChart,
  CanvasRenderer
])
const echartRef = ref(null)
const echartInstance = shallowRef(null)
const echartsConfig = reactive({
  tooltip: {
    trigger: 'item'
  },
  title: {
    text: '全国地图',
    x: 'center',
    y: 'top',
    textAlign: 'left'
  },
  geo: {
    map: 'china',
    roam: true,
    label: {
      show: true,
      textBorderColor: '#fff',
      textBorderWidth: 2
    },
    emphasis: { // 高亮状态下的样式
      label: { show: true },
      itemStyle: {
        areaColor: '#ffde33'
      }
    }
  },
  series: [] // series 我们可以在渲染时动态添加，或者保持为空，因为 geo 组件本身就能显示地图
})
const mapData = reactive({})
const currentArea = reactive({
  province: '',
  city: ''
})
const handleResize = utils._debounce(chartsResize, 200)
function clickHandler(params) {
  /**
   * 判断是省份, 还是城市
   * ① 特别行政区（2个）：香港、澳门
   * ② 直辖市（4个）：北京、天津、上海、重庆
   * ③ 自治区（5个）：新疆、内蒙古、西藏、广西、宁夏
   * ④ 省（23个）
   */
  const specialDistrict = ['香港', '澳门', '北京', '天津', '上海', '重庆']
  if ('南海诸岛'.includes(params.name)) return
  if (!Object.values(currentArea).some(v=>!v)) return
  if (currentArea.province == '') {
    currentArea.province = params.name
  }
  else {
    if (specialDistrict.includes(currentArea.province)) return
    currentArea.city = params.name
  }
}
async function getMap(params = {}) {
  return await ClientAPI.getMapData(params)
}
function backProvince() {
  currentArea.city = ''
}
function backCountry() {
  currentArea.province=''
  currentArea.city = ''
}
function chartsResize() {
  try {
    echartInstance.value.resize()
  } catch (error) {
    console.log('error ==>>>', error)
  }
}
watch(
  () => currentArea,
  val => {
    getMap(currentArea)
      .then(res => {
        const { province, city } = currentArea
        const mapName = province || city || 'china'
        echarts.registerMap(mapName, res)
        echartsConfig.geo.map = mapName
        echartsConfig.title.text = `${city || province || '中国'}地图`
        echartInstance.value.setOption(echartsConfig, true)
      })
  },
{ deep: true })
const showBackCountry = computed(() => {
  return currentArea.province != ''
})
const showBackProvince = computed(() => {
  return currentArea.city != ''
})
onMounted(() => {
  getMap(currentArea)
    .then(res => {
      Object.assign(mapData, res)
      echarts.registerMap('china', mapData)
      echartInstance.value = echarts.init(echartRef.value)
      echartInstance.value.setOption(echartsConfig)
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
  echartInstance.value.dispose()
})
</script>

<style lang="scss" scoped>
#echartDrillDown {
  width: 100%;
  height: 70vh;
  background-color: #f2f2f2;
}
</style>
