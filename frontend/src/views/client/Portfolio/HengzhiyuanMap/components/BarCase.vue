<template>
  <div ref="barChart" class="barChart"></div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, reactive, watch, nextTick } from 'vue'
import { useDialogStore } from '@/views/client/Portfolio/HengzhiyuanMap/stores/dialogStore'
import { useChart } from '@/views/client/Portfolio/HengzhiyuanMap/hooks/ChartHandler'
const dialogStore = useDialogStore()
const barChart = ref(null)
const props = defineProps(['echarts', 'data'])
const { chartInstance, setResize } = useChart()
const chartData = reactive({
  // total: [256, 3784, 382], // 总数 顺序: (超标案件, 离线案件, 投诉案件)
  // process: [144, 175, 75] // 处理中 顺序: (超标案件, 离线案件, 投诉案件)
})
const maxValue = ref(100)
// const maxValue = computed(() => {
//   if (!props.data.value) return 100
//   return Object.values(props.value.value).sort((a,b)=>b-a)[1] + 20
// })
function setData (data) {
  const {
    case_sys,
    case_sys_lx,
    case_inspect2,
    case_letter,
    case_sys_all,
    case_sys_lx_all,
    case_inspect2_all,
    case_letter_all,
    case_lz,
    case_lz_all
  } = data
  const secondValue = Object.values(data).sort((a,b)=>b-a)[1] + 20
  const dataObj = {
    total: [
      {
        value: case_sys_all, // 超标案件, 下面的数据是给到formModel去使用的
        rawData: { case_status: '0' ,case_type: 1, is_total: true , type: 'exceed'}
      },
      {
        value: case_sys_lx_all, // 离线案件, 下面的数据是给到formModel去使用的
        rawData: { case_status: '0' ,case_type: 4, is_total: true , type: 'offline'}
      },
      {
        value: case_lz_all, // 投诉案件, 下面的数据是给到formModel去使用的
        rawData: { case_status: '0' ,case_type: null, is_total: true , type: 'complain'}
      }
    ],
    // 顺序同上, 给formModel的数据也同上, 唯一区别是 case_status 字段
    process: [
      {
        value: case_sys, // 超标案件
        rawData: { case_status: '4' ,case_type: 1, is_process: true , type: 'exceed'}
      },
      {
        value: case_sys_lx, // 离线案件
        rawData: { case_status: '4' ,case_type: 4, is_process: true , type: 'offline'}
      },
        {
        value : case_lz, // 投诉案件
        rawData: { case_status: '4' ,case_type: null, is_process: true , type: 'complain'}
      }
    ]
  }
  Object.assign(chartData, dataObj)
  maxValue.value = secondValue
}
function setChart () {
  chartInstance.value = props.echarts.init(barChart.value)
  chartInstance.value.setOption({
    grid: {
      left: "5%",
      right: "10%",
      top: "25%",
      bottom: "5%",
      containLabel: true,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: 'shadow'
      },
      formatter: function (params) { // 这里竟然都是去找process的数据
        // console.log('params==>>>', params);
        const _data = params[0]
        const _value = _data.value
        const _index = chartData.process.findIndex(v => v.value ==_value)
        const _total = chartData.total[_index].value
        return `${_data.name}共 ${_total} 件, ${_value} 件正在处理中`
      }
    },
    legend: {
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 30,
      top: '5%',
      textStyle: {
        color: '#fff'
      }
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: maxValue.value,
      // interval: (maxValue.value/5),
      interval: 1000,
      /*
        数据值差距过大, 方案1
        type: 'log',
        logBase: 80,
      */
      axisTick: {
        show: false,
        inside: true,
        alignWithLable: true
      },
      axisLine: {
        show: false,
      },
      axisLabel: {
        show: false,
        color: "#fff",
        fontSize: '0.5rem',
        fontFamily: "PingFangSC-Regular",
        align: "center",
        fontWeight: "400",
      },
      splitLine: {//x轴分割线
        show: false,
        lineStyle: {
          color: '#E5E5E5'
        }
      }
    },
    yAxis: [
      {
        type: 'category',
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: "#fff",
          fontSize: '1rem',
          fontFamily: "PingFangSC-Regular",
          align: "right",
          fontWeight: "400",
        },
        axisLine: {
          show: false,
          lineStyle: {
            color: "#E5E5E5",
          },
        },
        data: ['超标案件', '离线案件', '投诉案件']
      },
      {
        type: 'category',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: false
        },
        splitArea: {
          show: false
        },
        splitLine: {
          show: false
        },
        data: []
      }
    ],
    series: [
      {
        name: '总   数',
        type: "bar",
        yAxisIndex: 1,
        barWidth: '50%',
        data: chartData.total,
        itemStyle: {
          color: 'rgba(65,237,255,0.1)',
          borderRadius: [0, 20, 20, 0], // 圆角（左上、右上、右下、左下）
          borderColor: "#1890FF",
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'top',
          offset: [10, 0],
          color: '#fff',
          formatter: function (params) {
            // 返回带单位的字符串
            return '共 ' + params.value + ' 件';
          }
        }
      },
      {
        name: '处理中',
        type: "bar",
        barWidth: '50%',
        data: chartData.process,
        itemStyle: {
          color: {
            colorStops: [
              {
                offset: 0.01,
                color: '#0d3458'
              },
              {
                offset: 0.99,
                color: '#3167ef'
              }
            ]
          },
          borderRadius: [0, 20, 20, 0], // 圆角（左上、右上、右下、左下）
          borderWidth: 1,
          borderColor: '#3167ef'
        },
        label: {
          show: true,
          position: 'right',
          color: '#fff',
          formatter: function (params) {
            // 返回带单位的字符串
            return '处理中 ' + params.value + ' 件';
          }
        }
      }
    ]
  })
  chartInstance.value.on('click', params => {
    // console.log('click event');
    // console.log('params==>>>', params);
    dialogStore.setFormModel('FormCaseModel')
    dialogStore.setClickItem(params.data)
  })
  // chartInstance.value.getZr().on('click', event => {
  //   console.log('event=>>>', event);
  //   // dialogStore.setFormModel('FormCaseModel')
  //   // dialogStore.setClickItem({rawData: {}})
  // })
  setResize()
}
watch(
  () => props.data,
  async nv => {
    setData(nv)
    await nextTick()
    setChart()
  },
  { deep: true }
)
</script>

<style lang="scss" scoped>
.barChart {
  width: 100%;
  height: 100%;
}
</style>
