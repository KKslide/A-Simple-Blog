<template>
  <div id="echartDrillDown" ref="echartRef" style="width: 100%; height: 600px;"></div>
  <el-divider></el-divider>
  <el-row>
    <el-button v-if="showBackCountry" @click="backCountry">返回全国</el-button>
  </el-row>
</template>

<script setup>
import { ref, reactive, shallowRef, onMounted, computed, watch, nextTick } from 'vue'
import ClientAPI from '@/api/client/index'
import * as echarts from 'echarts/core'
import { TitleComponent, TooltipComponent, GeoComponent } from 'echarts/components'
import { MapChart } from 'echarts/charts' // 使用 MapChart 替代 GraphChart 以获得更好的地图特性
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  TitleComponent,
  TooltipComponent,
  GeoComponent,
  MapChart, // 推荐使用 MapChart
  CanvasRenderer
])

const echartRef = ref(null)
const echartInstance = shallowRef(null)

// ECharts 的基础配置
const echartsConfig = reactive({
  tooltip: {
    trigger: 'item',
    formatter: '{b}' // 提示框只显示地名
  },
  title: {
    text: '全国数据总览',
    x: 'center',
    y: 'top',
    textAlign: 'left'
  },
  geo: {
    map: 'china', // 这个 map 名称将会是动态的
    roam: true, // 允许缩放和拖拽
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

// 用来存储当前下钻的区域信息
const currentArea = reactive({
  province: '',
  city: ''
})

// 封装一个渲染地图的函数，避免代码重复
async function renderMap() {
  // 1. 根据当前区域状态，决定要请求的地图名称
  let mapName = 'china' // 默认是中国地图
  let apiParams = {}

  if (currentArea.province && !currentArea.city) {
    mapName = currentArea.province
    apiParams = { province: currentArea.province }
  }
  // 注意：ECharts 不支持市级下钻，通常市级数据已经包含在省级JSON中
  // 这里我们简化为只支持省级下钻

  try {
    const res = await ClientAPI.getMapData(apiParams)

    // 2. 用动态的 mapName 注册地图
    echarts.registerMap(mapName, res)

    // 3. 更新 ECharts 配置，指向新的地图
    echartsConfig.geo.map = mapName
    echartsConfig.title.text = `${mapName}数据总览`

    // 4. 调用 setOption，并传入 true 来强制重新渲染，实现自动缩放
    echartInstance.value.setOption(echartsConfig, true)

  } catch (err) {
    console.log('加载地图失败 ===>>>>', err)
    // 如果加载失败，可以考虑回退到上一级
    backCountry();
    alert('地图数据加载失败，已返回全国视图');
  }
}


function clickHandler(params) {
  // params.name 是点击的区域名称，例如 "云南省" 或 "昆明市"
  // 在中国地图上点击，我们认为是要下钻到省
  if (!currentArea.province) {
    // 移除名称中的 "省", "市", "自治区" 等后缀，以匹配你的JSON文件名（如果需要）
    const provinceName = params.name.replace(/省|市|自治区|特别行政区|壮族|回族|维吾尔/g, '')
    currentArea.province = provinceName
  }
  // 如果需要市级下钻，在这里添加逻辑
  // else if (!currentArea.city) {
  //   currentArea.city = params.name
  // }
}

// 返回全国
function backCountry() {
  currentArea.province = ''
  currentArea.city = ''
}

// 监听 currentArea 的变化，自动重新渲染地图
watch(currentArea, renderMap)

const showBackCountry = computed(() => {
  return currentArea.province !== ''
})

onMounted(async () => {
  echartInstance.value = echarts.init(echartRef.value)
  echartInstance.value.on('click', clickHandler)

  // 首次加载全国地图
  await renderMap()
})

</script>

<style lang="scss" scoped>
#echartDrillDown {
  width: 100%;
  height: 60vh;
  background-color: #f2f2f2;
}
</style>
