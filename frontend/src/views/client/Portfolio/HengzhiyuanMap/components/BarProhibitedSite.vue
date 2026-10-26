<template>
  <div ref="barChart" class="barChart"></div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { useDialogStore } from '@/views/client/Portfolio/HengzhiyuanMap/stores/dialogStore'
import { ref, reactive, watch, nextTick, toRaw } from 'vue'
import { useChart } from '@/views/client/Portfolio/HengzhiyuanMap/hooks/ChartHandler'
const dialogStore = useDialogStore()
const barChart = ref(null)
const props = defineProps(['echarts', 'data'])
const { chartInstance, setResize } = useChart()
const chartData = reactive({})
function setChartData () {
  function setRate(v, total) {
    return ((v/total)*100).toFixed(1)
  }
  const {
    all,
    address_v_1_Name,
    address_v_1_Val,
    address_v_2_Name,
    address_v_2_Val,
    address_v_3_Name,
    address_v_3_Val,
    store_value_1_Name,
    store_value_1_Val,
    store_value_2_Name,
    store_value_2_Val,
    store_value_3_Name,
    store_value_3_Val
  } = toRaw(props.data)
  const dataArr = {
    names: [address_v_1_Name, address_v_2_Name, address_v_3_Name],
    values: [address_v_1_Val, address_v_2_Val, address_v_3_Val],
    rate: [setRate(address_v_1_Val, all), setRate(address_v_2_Val, all), setRate(address_v_3_Val, all)]
  }
  Object.assign(chartData, dataArr)
}
function setPieChart () {
  chartInstance.value = props.echarts.init(barChart.value)
  chartInstance.value.setOption({
    tooltip: {
      show: true,
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      textStyle: {
        color: "#333",
      },
      formatter: function (params) {
        const value = params[1]['value']
        const name = params[2]['name']
        const rate = params[2]['data']['rate']
        const namesMap = {
          'I类': {
            str: '居民住宅楼<br/>',
            color: '#61e1e1'
          },
          'II类': {
            str: '未配套设立专用烟道的商住综合楼<br/>',
            color: '#0fa9ed'
          },
          'III类': {
            str: '商住综合楼内与居住层相邻的商业楼层内<br/>',
            color: '#f1d07b'
          },
        }
        const res = `
          <div style="display:flex;align-items:center">
            <span
              style="display:inline-block;
                margin-right:5px;
                border-radius:10px;
                width:10px;
                height:10px;
                background-color:${namesMap[name]['color']}"
            ></span>
            <span>${namesMap[name]['str']}${name}${Math.abs(value)}(${rate}%)</span>
          </div>
        `;
        return res;
      },
    },
    grid: {
      top: "5%",
      left: "3%",
      right: "4%",
      bottom: "5%",
      containLabel: true,
    },
    // legend: {
    //   data: chartData['names'],
    //   right: "5%",
    //   top: "5%",
    //   icon: "rect",
    //   textStyle: {
    //     color: "#fff",
    //     lineHeight: 12,
    //     fontSize: 12,
    //   },
    //   itemWidth: 12,
    //   itemHeight: 6,
    // },
    // 添加第二个 xAxis 用于折线图偏移
    xAxis: [
      {
        type: "category",
        data: chartData["names"],
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: "#A2B0B8",
          fontSize: 12,
          margin: 20,
        },
        axisLine: {
          lineStyle: {
            color: "#3C6579",
            width: 1,
          },
        },
      },
      {
        type: "category",
        data: chartData["names"],
        // 隐藏第二个 xAxis 的所有视觉元素
        show: false,
        // 调整偏移量（负值表示向左偏移，正值向右）
        offset: -15,
      },
    ],
    yAxis: {
      type: "value",
      name: "",
      nameLocation: "middle",
      nameGap: 35,
      nameTextStyle: {
        color: "#A2B0B8",
        fontSize: 12,
      },
      min: 0,
      max: 20000,
      axisLine: {
        lineStyle: {
          color: "#3C6579",
        },
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        lineStyle: {
          color: "#173055",
          type: "dashed",
        },
      },
      axisLabel: {
        color: "#A2B0B8",
        fontSize: 12,
      },
    },
    series: [
      {
        type: "bar",
        barWidth: 30,
        name: "图斑数量",
        xAxisIndex: 1, // 使用第一个 xAxis
        data: chartData["values"],
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#051937" },
              { offset: 0.1, color: "#0F274C" },
              { offset: 1, color: "#077EF4" },
            ],
            global: false,
          },
        },
        markPoint: {
          symbol: "none",
          silent: true,
          data: [
            {
              name: "top-line",
              xAxis: chartData["names"][0],
              yAxis: chartData["values"][0],
              symbol: "rect",
              symbolSize: [30, 4],
              itemStyle: {
                color: "#15B0FD",
              },
            },
            {
              name: "top-line",
              xAxis: chartData["names"][1],
              yAxis: chartData["values"][1],
              symbol: "rect",
              symbolSize: [30, 4],
              itemStyle: {
                color: "#15B0FD",
              },
            },
            {
              name: "top-line",
              xAxis: chartData["names"][2],
              yAxis: chartData["values"][2],
              symbol: "rect",
              symbolSize: [30, 4],
              itemStyle: {
                color: "#15B0FD",
              },
            },
          ],
        },
      },
      {
        type: "line",
        showSymbol: true,
        symbolSize: 6,
        name: "占比",
        xAxisIndex: 1, // 使用第二个 xAxis（带偏移的）
        data: chartData["values"].map((v, i) => ({ value: v / 2, rate: chartData['rate'][i] })),
        symbol: "circle",
        lineStyle: {
          color: "#FFD166",
          width: 1,
        },
        itemStyle: {
          color: "#F5CD66",
          borderColor: "rgba(245,205,102,0.4)",
          borderWidth: 12,
        },
        label: {
          show: false,
          position: "top",
          color: "#fff",
          fontSize: 12,
        },
      },
      {
        name: "",
        barGap: "-200%",
        type: "bar",
        z: 0,
        xAxisIndex: 0, // 使用第一个 xAxis
        data: [20000, 20000, 20000],
        barWidth: 90,
        itemStyle: {
          color: "rgba(4,22,34,0.6)",
        },
      },
    ],
  })
  chartInstance.value.on('click', params => {
    const { name } = params
    dialogStore.setFormModel('FormProhibitedSite')
    dialogStore.setClickItem({name, data: props.data})
  })
  setResize()
}
watch(
  () => props.data,
  async () => {
    setChartData()
    await nextTick()
    setPieChart()
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
