<template>
  <div id="hzy-BDMap" ref="chartRef" style="width:100%;height:100vh;"></div>
  <el-dialog
    class="hzy-detail-dialog"
    v-model="showDialog"
    width="1000"
    destroy-on-close
    draggable
    append-to-body
    :modal="false"
    @close="showDialog=false"
  >
    <template #header>
      <div class="detail_title">
        <h3>{{ detailData.title || '-' }}</h3>
        <span :class="detailData.status" :style="{backgroundColor:detailData.statusColor}">
          {{ detailData.statusText }}
        </span>
      </div>
    </template>
    <template #default>
      <el-descriptions :column="detailData.doorImage ? 3 : 2" :class="['detail_desc', { 'noimg': !detailData.doorImage }]">
        <el-descriptions-item
          v-if="detailData.doorImage"
          :rowspan="3"
          class-name="text-center"
        >
          <template #label>
            <div>
              <el-image
                :src="detailData.doorImage"
                :preview-src-list="[detailData.doorImage]"
                style="width: 150px; height: 150px"
                fit="cover"
                hide-on-click-modal
              />
              <p>门店照片</p>
            </div>
          </template>
        </el-descriptions-item>
        <el-descriptions-item v-for="item in detailData.descList" :key="item.icon">
          <template #label>
            <span :class="['iconfont', item.icon]"></span>
            {{ item.label }}
          </template>
          <template #default>{{ item.value }}</template>
        </el-descriptions-item>
      </el-descriptions>
      <div class="scattered_data">
        <div class="data_item" v-for="item in detailData.scatteredData" :key="item.label">
          <div class="item_title">
            <div class="title_icon">
              <span :class="['iconfont', item.icon]"></span>
            </div>
            <div class="title_txt">{{ item.label }}</div>
          </div>
          <div class="data_content">
            <div class="data_val">{{ item.value }}</div>
          </div>
        </div>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
// @ts-nocheck
import jinniu from '@/views/client/Portfolio/HengzhiyuanMap/assets/jinniu.json'
import { getAQI } from "@/api/hengzhiyuan"
import { ref, reactive, shallowRef, watch, nextTick, onUnmounted } from "vue"
import { useBaiduMap } from "@/views/client/Portfolio/HengzhiyuanMap/hooks/BaiduMapHandler"
const { config, colorMap, setTooltipHTML, setDetailData } = useBaiduMap()
const props = defineProps(['echarts', 'data', 'curList'])
const showDialog = ref(false)
const detailData = reactive<any>({})
// 容器
const chartRef = ref<any>(null)
const categorizedList = reactive<any>({})
const allData = reactive<any>({})
const initialConfig = ref<any>({})
// 金牛区 (BMapGL 由外部脚本异步加载, 首次使用时再创建)
let fillLayer: any = null
function createFillLayer() {
  if (!fillLayer) {
    fillLayer = new BMapGL.FillLayer({
      crs: 'GCJ02',
      enablePicked: false,
      autoSelect: false,
      selectedColor: 'green', // 悬浮选中项颜色
      border: true,
      style: {
        fillColor: 'rgba(112,112,117, 0.5)',
        fillOpacity: .3,
        strokeWeight: 1,
        strokeColor: 'rgba(255,0,0,0.5)',
        strokeStyle: 'dashed'
      }
    })
  }
  return fillLayer
}

// map实例
const map = ref<any>(null)
// 四个聚合点实例
const Clusters = ref<any>({
  normal: null,
  warning: null,
  exceed: null,
  offline: null,
})
/**
 * 处理位置数据，进行分类并计算地图中心点和缩放级别
 * @param {Array} list - 原始数据列表
 * @param {Object} configUser - 用户配置，包含各种阈值
 * @returns {Object} - 返回包含分类列表、中心点和缩放级别的对象
 */
function processLocationData(list, configUser) {
  // 1. 使用一个对象来存储所有分类列表，更清晰
  const categorizedPositions = {
    offline: [],
    warning: [],
    normal: [],
    exceed: [],
  };

  const normalStyle = { itemStyle: { color: colorMap.normal } }
  const warnStyle = { itemStyle: { color: colorMap.warning } }
  const exceedStyle = { itemStyle: { color: colorMap.exceed } }
  const offlineStyle = { itemStyle: { color: colorMap.offline } }
  const defaultStyle = { itemStyle: { color: colorMap.all } }

  const lngArr = [];
  const latArr = [];

  // 2. 使用单次循环处理所有事情
  for (const item of list) {
    // 3. 卫语句：提前过滤无效数据，避免后续代码中的重复判断
    if (!item.baidu_gps || item.baidu_gps === '0,0') {
      continue; // 跳过此项，继续下一次循环
    }

    // 4. 只需分割一次坐标，并立即转换为数字
    const [lng, lat] = item.baidu_gps.split(',').map(Number);

    // 将有效坐标存入数组，用于后续计算中心点
    lngArr.push(lng);
    latArr.push(lat);

    // 5. 使用解构后的坐标和原始 item 数据进行分类
    // const categorizedItem = {value:[lng, lat], rawData: item};
    const categorizedItem = {
      "type": "Feature",
      "properties": {
        "rawData": item,
        "style": '',
        "type": ''
      },
      "geometry": {
        "coordinates": [lng, lat],
        "type": "Point"
      },
    }

    if (item.monitoring_status === 0) {
      categorizedItem.properties.type = 'offline'
      categorizedItem.properties.style = offlineStyle;
      categorizedPositions.offline.push(categorizedItem);
    } else if (item.soot <= configUser.warning_soot_min) {
      categorizedItem.properties.type = 'normal'
      categorizedItem.properties.style = normalStyle;
      categorizedPositions.normal.push(categorizedItem);
    } else if (item.soot <= configUser.soot_threshold) {
      categorizedItem.properties.type = 'warning'
      categorizedItem.properties.style = warnStyle;
      categorizedPositions.warning.push(categorizedItem);
    } else if (
      item.soot > configUser.soot_threshold ||
      item.particulate > configUser.particulate_threshold ||
      item.non_methane > configUser.non_methane_threshold
    ) {
      categorizedItem.properties.type = 'exceed'
      categorizedItem.properties.style = exceedStyle;
      categorizedPositions.exceed.push(categorizedItem);
    }
  }

  // 6. 将计算中心点和缩放级别的逻辑封装成一个独立的函数
  const { center, zoom } = calculateMapCenterAndZoom(lngArr, latArr);

  return {
    categorizedPositions,
    center,
    zoom,
    // 如果仍然需要一个包含所有经纬度的列表
    allGpsCoords: lngArr.map((lng, index) => (Object.assign({value: [lng, latArr[index]]}, defaultStyle))),
  };
}

/**
 * 根据经纬度数组计算中心点和最佳缩放级别
 * @param {number[]} lngArr - 经度数组
 * @param {number[]} latArr - 纬度数组
 * @returns {{center: {lng: number, lat: number}, zoom: number}}
 */
function calculateMapCenterAndZoom(lngArr, latArr) {
  if (lngArr.length === 0) {
    // 默认值，例如市中心
    return { center: { lng: 104.06, lat: 30.67 }, zoom: 10 };
  }

  // 计算所有点的经纬度平均值，精确到小数点后5位
  const sumLng = lngArr.reduce((acc, cur) => acc + cur, 0);
  const sumLat = latArr.reduce((acc, cur) => acc + cur, 0);
  const centerLng = Number((sumLng / lngArr.length).toFixed(5));
  const centerLat = Number((sumLat / latArr.length).toFixed(5));

  // 7. 优化 zoom 的计算逻辑，更简洁
  const len = lngArr.length;
  let zoom = 10; // 默认值
  if (len > 1000) zoom = 11;
  else if (len > 200 && len > 500) zoom = 12;
  else zoom = 13;

  return {
    center: { lng: centerLng, lat: centerLat },
    zoom: zoom,
  };
}

function createClusterDOM (context) {
  const { pointCount } = context
  const pinContainer = createSingleDOM()
  if (pointCount) {
    const countEl = document.createElement('div')
    countEl.className = 'hzy-count'
    countEl.innerHTML = pointCount || ''
    pinContainer.appendChild(countEl)
  }
  return { pinContainer }
}
function createSingleDOM (context) {
  const type = context?.type
  const pinContainer = document.createElement('div')
  const pinEl = document.createElement('div')
  // const ripples = new Array(3).fill('').map((v, i) => {
  //   const rippleEl = document.createElement('div')
  //   rippleEl.className = `ripple r${i}`
  //   return rippleEl
  // })
  pinContainer.className = `hzy-pin-container ${type}`
  pinEl.className = 'hzy-pin'
  // ripples.forEach(v => {
  //   pinContainer.appendChild(v)
  // })
  pinContainer.appendChild(pinEl)
  return pinContainer
}
function createnormalDom(context) {
  const { pinContainer } = createClusterDOM(context)
  pinContainer.classList.add('normal')
  return pinContainer
}
function createwarningDom(context) {
  const { pinContainer } = createClusterDOM(context)
  pinContainer.classList.add('warning')
  return pinContainer
}
function createexceedDom(context) {
  const { pinContainer } = createClusterDOM(context)
  pinContainer.classList.add('exceed')
  return pinContainer
}
function createofflineDom(context) {
  const { pinContainer } = createClusterDOM(context)
  pinContainer.classList.add('offline')
  return pinContainer
}

const ClusterConfig = function(type) {
  const clusterFn = {
    normal:createnormalDom,
    warning:createwarningDom,
    exceed:createexceedDom,
    offline:createofflineDom,
  }
  return {
    clusterMinPoints: 2,
    clusterMaxZoom: 20,
    updateRealTime: true,
    fitViewOnClick: true,
    renderClusterStyle: {
      type: Cluster.ClusterRender.DOM,
      inject: clusterFn[type]
    },
    renderSingleStyle: {
      type: Cluster.ClusterRender.DOM,
      inject: createSingleDOM
    }
  }
}

function setMap(type) {
  const lng = initialConfig.value.center.lng
  const lat = initialConfig.value.center.lat
  if (!map.value) {
    map.value = new BMapGL.Map('hzy-BDMap');
    map.value.setMapStyleV2({
      // styleId: '7f1ddd6819e843f0de5c7ee327c7b937'
      styleId: '170d7f48abe3471089410f3de92624d9'
    });
    map.value.centerAndZoom(new BMapGL.Point(lng, lat), initialConfig.value.zoom);
    map.value.enableScrollWheelZoom(true);
    map.value.setMinZoom(2);
    map.value.setMaxZoom(20);
  }

  Clusters.value.normal = new Cluster.View(map.value, ClusterConfig('normal'))
  Clusters.value.warning = new Cluster.View(map.value, ClusterConfig('warning'))
  Clusters.value.exceed = new Cluster.View(map.value, ClusterConfig('exceed'))
  Clusters.value.offline = new Cluster.View(map.value, ClusterConfig('offline'))

  function handleFirstRender() {
    console.log('地图首次渲染完成');
    const layer = createFillLayer()
    map.value.addNormalLayer(layer);
    layer.setData(jinniu);
    map.value.removeEventListener('tilesloaded', handleFirstRender);
    Clusters.value.normal.setData(categorizedList.normal)
    Clusters.value.warning.setData(categorizedList.warning)
    Clusters.value.exceed.setData(categorizedList.exceed)
    Clusters.value.offline.setData(categorizedList.offline)
    setClickEvent()
  }

  map.value.addEventListener('tilesloaded', handleFirstRender)

}

function setClickEvent() {
  for (const key in Clusters.value) {
    if (Clusters.value[key]) {
      Clusters.value[key].on('click', params => {
        // console.log('params ====> ', params.target.properties);
        showDetail(params.target.properties)
      })
    }
  }
}

async function showDetail(params) {
  if (!params.rawData) return
  try {
      const { baidu_gps } = params.rawData
      const [ lng, lat ] = baidu_gps.split(',')
      const { data: { data } } = await getAQI(lng, lat)
      Object.assign(detailData, setDetailData(Object.assign(data, params.rawData)))
      await nextTick()
      showDialog.value = true
    } catch (error) {
      console.log('error==>>>>', error)
    }
}

watch(
  () => props.data,
  async nv => {
    const { categorizedPositions, center, zoom, allGpsCoords } = processLocationData(nv, config);
    console.log('分类后的坐标:', categorizedPositions);
    console.log('地图中心坐标:', center);
    console.log('地图缩放级别:', zoom);
    console.log('所有有效坐标集:', allGpsCoords.length);
    initialConfig.value = { center, zoom }
    Object.assign(categorizedList, categorizedPositions)
    Object.assign(allData, Object.values(categorizedPositions).flat())
    await nextTick()
    setMap('all')
  },
  { deep: true }
)
watch(
  () => props.curList,
  nv => {
    console.log('新的筛选值', nv);
    for (const key in Clusters.value) {
      if (Clusters.value[key]) {
        Clusters.value[key].destroy()
        Clusters.value[key] = null
      }
    }
    if (nv == 'all') {
      for (const key in Clusters.value) {
        Clusters.value[key] = new Cluster.View(map.value, ClusterConfig(key))
        Clusters.value[key].setData(categorizedList[key])
        Clusters.value[key].on('click', params => {
          showDetail(params.target.properties)
        })
      }
      return
    }
    Clusters.value[nv] = new Cluster.View(map.value, ClusterConfig(nv))
    Clusters.value[nv].setData(categorizedList[nv])
    setClickEvent()
  }
)

onUnmounted(() => {
  map.value.destroy()
  for (const key in Clusters.value) {
    if (Clusters.value[key]) {
      Clusters.value[key].destroy()
      Clusters.value[key] = null
    }
  }
})
</script>

