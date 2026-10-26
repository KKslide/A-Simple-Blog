<template>
  <div ref="pieChart" class="pie"></div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, watch, computed } from 'vue'
import { useDialogStore } from '@/views/client/Portfolio/HengzhiyuanMap/stores/dialogStore'
import { useChart } from '@/views/client/Portfolio/HengzhiyuanMap/hooks/ChartHandler'
const dialogStore = useDialogStore()
const pieChart = ref(null)
const props = defineProps(['echarts', 'data'])
const chart = ref({})
const { chartInstance, setResize } = useChart()
const chartData = computed(() => {
  let total = 0
  props.data.forEach(v => total += v.num)
  const dataArr = props.data.map(v => {
    return {
      value: v.num,
      name: `${v.sub_text}(${v.num}):${((v.num/total)*100).toFixed(1)}%`,
      foodType: v.sub_type
    }
  })
  return dataArr
})
function setPieChart () {
  chartInstance.value = chart.value.init(pieChart.value)
  chartInstance.value.setOption({
    toolbox: {
      show: true
    },
    tooltip: {
      trigger: 'item',
      position: 'right'
    },
    color: ['#61e1e1', '#0fa9ed', '#f1d07b', '#84bfdb', '#de6e6a', '#9ec97e', '#ed895d'],
    polar: {
      radius: ['42%', '52%'],
      center: ['50%', '50%']
    },
    angleAxis: {
      max: 100,
      show: false
    },
    radiusAxis: {
      type: 'category',
      show: true,
      axisLabel: {
        show: false
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      }
    },
    series: [
      //外环
      {
        name: '',
        type: 'pie',
        radius: ['30%', '60%'],
        silent: true,
        clockwise: true,
        startAngle: 90,
        z: 0,
        zlevel: 0,
        label: {
          position: 'center'
        },
        data: [
          {
            value: 100,
            name: '',
            itemStyle: {
              color: {
                type: 'radial',
                x: 0.5,
                y: 0.5,
                r: 0.5,
                colorStops: [
                  {
                    offset: 0,
                    color: '#051558'
                  },
                  {
                    offset: 0.9,
                    color: '#002e50'
                  },
                  {
                    offset: 1,
                    color: '#134568'
                  }
                ]
              }
            }
          }
        ]
      },
      {
        name: '餐饮类别',
        type: 'pie',
        radius: ['20%', '45%'],
        center: ['50%', '50%'],
        roseType: 'area',
        itemStyle: {
          borderRadius: 2,
        },
        percentPrecision: 1, //百分比小数位
        minAngle: 30,  //最小角度  ，0-360
        width: '100%',
        height: '100%',
        label: {
          color: '#fff',
          overflow: 'break',
          fontSize: '0.9rem'
        },
        data: chartData.value
      },
      {
        name: '',
        type: 'pie',
        radius: ['60%', '61%'],
        silent: true,
        clockwise: true,
        startAngle: 90,
        z: 2,
        zlevel: 0,
        label: {
          position: 'center'
        },
        data: [
          {
            value: 100,
            name: '',
            itemStyle: {
              color: '#3EACF4'
            }
          }
        ]
      },
      {
        name: '',
        type: 'pie',
        radius: ['65%', '65.5%'],
        silent: true,
        clockwise: true,
        startAngle: 90,
        z: 2,
        zlevel: 0,
        label: {
          position: 'center'
        },
        data: [
          {
            value: 100,
            name: '',
            itemStyle: {
              color: '#417BC5'
            }
          }
        ]
      }
    ]
  })
  chartInstance.value.on('click', params => {
    dialogStore.setFormModel('FormCompanyOrFoodCategoryModel')
    dialogStore.setClickItem({foodType: params.data.foodType, cuisine: props.data, type: 'food'})
  })
  setResize()
}
watch(
  () => props.echarts,
  nv => {
    chart.value = nv
  }
)
watch(
  () => props.data,
  nv => setPieChart()
)
</script>

<style lang="scss" scoped>
.pie {
  width: 100%;
  height: 100%;
}
</style>
