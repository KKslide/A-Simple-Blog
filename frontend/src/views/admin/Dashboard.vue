<template>
  <div id="admin_home">
    <div class="admin_top_list" v-if="showTagData">
      <a class="admin_top_list_item" v-for="(item, index) in tagData" :key="index"
        :style="{ 'background': bgColors[index] }" @click="jump(item.href)">
        <div class="admin_top_list_item_L">
          <p>{{ item.tag }}</p>
          <p>{{ item.value }}</p>
        </div>
        <div class="admin_top_list_item_R">
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
        </div>
      </a>
    </div>
    <div class="admin_mid_chart">
      <div class="line_chart">
        <div id="lineChart" style="width:100%;height:100%;" ref="lineChartRef"></div>
      </div>
      <div class="pie_chart">
        <div id="pieChart" style="width:100%;height:100%;" ref="barChartRef"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ServerAPI from '@/api/server'
import { ref, reactive, shallowRef, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts/core'
import utils from '@/utils'
import { PieChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
echarts.use([
  PieChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
])
const bgColors = reactive(['#64b0f2', '#f1b53d', '#3db9dc', '#ff5d48'])
const tagData = reactive([
  { icon: "Document" },
  { icon: "DataLine" },
  { icon: "User" },
  { icon: "Notebook", href: 'article' },
])
const showTagData = ref(false)
const lineChartRef = ref(null)
const barChartRef = ref(null)
const lineChartData = reactive({})
const pieChartData = reactive([])
const _Line_Chart_ = shallowRef(null)
const _Pie_Chart_ = shallowRef(null)
const router = useRouter()
const handleResize = utils._debounce(chartsResize, 200)
function getData () {
  ServerAPI.getDashboard()
    .then(res => {
      const _tagData = tagData.map((v, i) => {
        return v = Object.assign(res.tag_list[i], v)
      })
      Object.assign(tagData, _tagData)
      Object.assign(lineChartData, fixedObj(res.line_chart_data))
      Object.assign(pieChartData, res.pie_chart_data)
      showTagData.value = true
    })
    .then(() => {
      setLineData()
      setPieChart()
    })
    .then(() => {
      window.addEventListener('resize', handleResize)
    })
}
function setLineData () {
  _Line_Chart_.value = echarts.init(lineChartRef.value)
  _Line_Chart_.value.setOption({
    title: {
      text: '24小时访客记录概览',
      x: 'left',
      y: 'top',
      textStyle: {
        color: "#FFF",
        fontWeight: "bold"
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        return `<div>
                  <span style="display:inline-block;width:8px;height:8px;background:#3db9dc;border-radius:50%;"></span>
                  时间：${params[0].axisValue}:00</div>
                  <div><span style="display:inline-block;width:8px;height:8px;background:#f1b53d;border-radius:50%;"></span>
                  ${params[0].seriesName + ": " + params[0].value}
                </div>`;
      }
    },
    legend: {
      show: false,
      // color: ["#F58080", "#47D8BE", "#F9A589"],
      // data: ['新报', '流失', '续费'],
      // left: 'center',
      // bottom: 'bottom',
    },
    grid: {
      top: '15%',
      left: '3%',
      right: '4%',
      bottom: '3%',
      height: '80%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      // data: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
      data: lineChartData.time,
      axisLine: {
        lineStyle: {
          color: "#999"
        }
      },
      axisLabel: {
        color: "#FFF"
      }
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#DDD'
        }
      },
      axisLine: {
        show: false,
        lineStyle: {
          color: "#333"
        },
      },
      nameTextStyle: {
        color: "#999"
      },
      splitArea: {
        show: false
      },
      axisLabel: {
        color: "#FFF"
      },
      interval: 1
    },
    series: [
      {
        name: '访客数',
        type: 'line',
        data: lineChartData.value,
        color: "#F58080",
        lineStyle: {
          normal: {
            width: 5,
            color: {
              type: 'linear',

              colorStops: [{
                offset: 0,
                color: '#FFCAD4' // 0% 处的颜色
              }, {
                offset: 0.4,
                color: '#F58080' // 100% 处的颜色
              }, {
                offset: 1,
                color: '#F58080' // 100% 处的颜色
              }],
              globalCoord: false // 缺省为 false
            },
            shadowColor: 'rgba(245,128,128, 0.5)',
            shadowBlur: 10,
            shadowOffsetY: 7
          }
        },
        itemStyle: {
          normal: {
            color: '#F58080',
            borderWidth: 10,
            /*shadowColor: 'rgba(72,216,191, 0.3)',
             shadowBlur: 100,*/
            borderColor: "#F58080"
          }
        },
        smooth: true,
      },
    ]
  })
}
function setPieChart () {
  _Pie_Chart_.value = echarts.init(barChartRef.value)
  _Pie_Chart_.value.setOption({
    title: {
      text: '文章分类概览',
      x: 'left',
      y: 'top',
      textStyle: {
        color: "#FFF",
        fontWeight: "bold"
      }
    },
    color: ['#e38980', '#f7db88', '#85b6b2', '#6d4f8d', '#cd5e7e'],
    tooltip: {
      trigger: 'item',
      formatter: "{a}[{b}] <br/>数量: {c}<br/>占比: {d}%"
    },
    calculable: true,
    series: [
      {
        name: '分类',
        type: 'pie',
        radius: ['15%', '60%'],
        roseType: 'area',
        data: pieChartData,
        itemStyle: {
          normal: {
            shadowBlur: 30,
            shadowColor: 'rgba(40, 40, 40, 0.5)',
          }
        },
        label: {
          fontSize: '16',
          borderWidth: '1',
          borderColor: '#fff',
          borderRadius: 5,
          padding: [4, 10]
        },
        labelLine: {
          length: 8,
          length2: 4
        }
      }
    ]
  })
}
function chartsResize() {
  try {
    _Line_Chart_.value.resize()
    _Pie_Chart_.value.resize()
  } catch (error) {
    console.log('error ==>>>', error)
  }
}
function jump (href) {
  if (!href) return
  router.push({ name: href })
}
function fixedObj (data) {
  let obj = {}, keys = [];
  data.forEach(e => keys = keys.concat(Object.keys(e))); // 先拿到所有的keys, 去重
  Array.from(new Set([...keys])).forEach(ele => {
    obj[ele] = data.map(val => val[ele])
  });
  return obj;
}
onMounted(() => {
  getData()
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

</script>

<style lang="scss" scoped>
#admin_home {
  padding: 5px;

  .admin_top_list {
    display: flex;
    justify-content: space-around;

    .admin_top_list_item {
      width: 25%;
      margin: 3px 10px;
      padding: 15px;
      display: flex;
      justify-content: space-between;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.3s;
      border-radius: 15px;

      div {
        width: 50%;
        display: flex;
        justify-content: space-around; //x轴排列
        align-items: center; //y轴排列
      }

      .admin_top_list_item_L {
        flex-direction: column;

        p {
          font-size: 15px;
          margin: 0;
          color: #fff;
        }

        p:last-child {
          font-size: 20px;
        }
      }

      .admin_top_list_item_R {

        // justify-content: center; //x轴排列
        // align-items: center; //y轴排列
        i {
          font-size: 50px;
          // font-weight: bold;
          color: #fff;
        }
      }
    }

    .admin_top_list_item:nth-child(1):hover {
      background: #6ebafd;
      box-shadow: 0 0 3px #75cdf6, 0 0 5px #75cdf6, 0 0 10px #75cdf6,
        0 0 15px #75cdf6, 0 0 30px #1194ff, 0 0 5px #45bbff,
        0 0 40px #1194ff;
    }

    .admin_top_list_item:nth-child(2):hover {
      background: #ffc043;
      box-shadow: 0 0 3px #f1b53d, 0 0 5px #f1b53d, 0 0 10px #f1b53d,
        0 0 15px #f1b53d, 0 0 20px #ff9823, 0 0 5px #ffac3f,
        0 0 40px #ff9823;
    }

    .admin_top_list_item:nth-child(3):hover {
      background: #3db9dc;
      box-shadow: 0 0 3px #3db9dc, 0 0 5px #3db9dc, 0 0 10px #3db9dc,
        0 0 15px #3db9dc, 0 0 20px #28a9ff, 0 0 5px #22cbff,
        0 0 40px #28a9ff;
    }

    .admin_top_list_item:nth-child(4):hover {
      background: #ff5d48;
      box-shadow: 0 0 3px #ff5d48, 0 0 5px #ff5d48, 0 0 10px #ff5d48,
        0 0 15px #ff5d48, 0 0 20px #ff491b, 0 0 5px #22cbff,
        0 0 40px #ff4e22;
    }
  }

  .admin_mid_chart {
    display: flex;
    justify-content: space-around;

    div {
      height: 40vh;
      margin: 8px;
    }

    .line_chart {
      width: 60%;
    }

    .pie_chart {
      width: 40%;
    }
  }

  .admin_bottom_clock {
    height: 35vh;
    // position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
