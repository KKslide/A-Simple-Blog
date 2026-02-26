<template>
  <div id="BMap" ref="mapRef"></div>
</template>

<script setup>
import yuexiu from '@/assets/yuexiu.json'
console.log('yuexiu ====> ', yuexiu)
const chance = new Chance()
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import utils from '@/utils'
const handleResize = utils._debounce(resize, 200)
// 地图容器
const map = ref(null)
// 聚合点实例
const cluster = ref(null)
// 模拟一些点位
const points = reactive({
  type: "FeatureCollection",
  features: setRandomPos(100)
})

function setRandomPos (num) {
  // 四个角点
  const polygon = [
    [113.252840, 23.139701], // 左上
    [113.292807, 23.140298], // 右上
    [113.294556, 23.120580], // 右下
    [113.255234, 23.115724]  // 左下
  ];

  // 计算边界框
  const minLng = Math.min(...polygon.map(p => p[0]));
  const maxLng = Math.max(...polygon.map(p => p[0]));
  const minLat = Math.min(...polygon.map(p => p[1]));
  const maxLat = Math.max(...polygon.map(p => p[1]));

  // 生成 n 个随机点
  const points = Array.from({ length: num }, () => {
    return {
      type: "Feature",
      properties: {},
      geometry: {
        coordinates: [
          chance.floating({ min: minLng, max: maxLng, fixed: 6 }),
          chance.floating({ min: minLat, max: maxLat, fixed: 6 })
        ],
        type: "Point"
      }
    }
  });

  return points
}

function createBasicDom (context) {
  const pinContainer = document.createElement('div')
  const pinEl = document.createElement('div')
  pinContainer.className = 'pin-container'
  pinEl.className = 'pin'
  pinContainer.appendChild(pinEl)
  return { pinContainer }
}

function createClusterDOM (context) {
  const { pointCount } = context
  // console.log(pointCount, 'context ====> ', context);
  const { pinContainer } = createBasicDom()
  if (pointCount) {
    const countEl = document.createElement('div')
    countEl.className = 'count'
    countEl.innerHTML = pointCount || ''
    pinContainer.appendChild(countEl)
  }
  return pinContainer
}

function createSingleDOM () {
  const { pinContainer } = createBasicDom()
  return pinContainer
}

function resize () {
  if (map.value) {
    map.value.resize()
    map.value.centerAndZoom(new BMapGL.Point(113.270842, 23.131681), 14)
  }
}

onMounted(() => {

  map.value = new BMapGL.Map('BMap');
  map.value.setMapStyleV2({
    // styleId: '170d7f48abe3471089410f3de92624d9'
    styleId: '7f1ddd6819e843f0de5c7ee327c7b937'
  });
  map.value.centerAndZoom(new BMapGL.Point(113.270842, 23.131681), 14);
  map.value.enableScrollWheelZoom(true);
  map.value.setMinZoom(2);
  map.value.setMaxZoom(20);

  const fillLayer = new BMapGL.FillLayer({
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
  });

  cluster.value = new Cluster.View(map.value, {
    clusterMinPoints: 2,
    clusterMaxZoom: 20,
    updateRealTime: true,
    fitViewOnClick: true,
    renderClusterStyle: {
      type: Cluster.ClusterRender.DOM,
      inject: createClusterDOM
    },
    renderSingleStyle: {
      type: Cluster.ClusterRender.DOM,
      inject: createSingleDOM
    }
  });

  cluster.value.on('click', params => {
    console.log('params ====> ', params.target.properties);
  })


  function handleFirstRender () {
    console.log('地图首次渲染完成');

    map.value.addNormalLayer(fillLayer);
    fillLayer.setData(yuexiu);

    cluster.value.setData(points.features);
    map.value.removeEventListener('tilesloaded', handleFirstRender);
    window.addEventListener('resize', handleResize)
  }

  map.value.addEventListener('tilesloaded', handleFirstRender)

})

onUnmounted(() => {
  map.value.destroy()
  cluster.value.destroy()
  window.removeEventListener('resize', handleResize)
})

</script>

<style lang="scss" scoped>
#BMap {
  width: 100%;
  height: 80vh;
  overflow: hidden;
}
</style>
