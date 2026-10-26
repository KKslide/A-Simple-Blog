<template>
  <div ref="pieChart" class="pie"></div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, reactive, watch, computed, nextTick } from 'vue'
import { useDialogStore } from '@/views/client/Portfolio/HengzhiyuanMap/stores/dialogStore'
import { useChart } from '@/views/client/Portfolio/HengzhiyuanMap/hooks/ChartHandler'
const pieChart = ref(null)
const props = defineProps(['echarts', 'data'])
const dialogStore = useDialogStore()
const { chartInstance, setResize } = useChart()
const chartData = computed(() => {
  const dataArr = []
  const { all: total, scale: types } = props.data
  if (!total || !types) return dataArr
  // const { scale_l, scale_m, scale_s } = types
  const _nameMap = { 'scale_l': '大', 'scale_m': '中', 'scale_s': '小' }
  const _colorMap = {
    'scale_l': 'rgba(0, 81, 180, 0.8)', 'scale_m': 'rgba(255, 196, 0, 0.8)', 'scale_s': 'rgba(95, 144, 110, 0.8)'
  }
  for (const key in types) {
    if (Object.prototype.hasOwnProperty.call(types, key)) {
      const item = types[key];
      if (key != 'scale_default') {
        dataArr.push({
          value: item,
          name: `${_nameMap[key]}型餐饮(${item}):${((item / total) * 100).toFixed(1)}%`,
          itemStyle: {
            color: _colorMap[key]
          }
        })
      }
    }
  }
  return dataArr
})

const heightProportion = 0.1; // 柱状扇形的高度比例

const echartOption = reactive({
  tooltip: {
    trigger: 'item',
    formatter: function (params) {
      const { seriesName, seriesId } = params
      let str = "";
      if (`${seriesName},${seriesId}`.indexOf("小") >= 0) {
        str = "小型餐饮服务企业，是指加工经营场所<br/>使用面积小于150㎡（含150㎡）或者<br/>就餐座位数少于75座（含75座）的餐馆";
      }
      else if (`${seriesName},${seriesId}`.indexOf("中") >= 0) {
        str = "中型餐饮服务企业，是指加工经营场所<br/>使用面积在150～500㎡（不含150㎡<br/>含500㎡）或者就餐座位数在75～250<br/>座（不含75座，含250座）的餐馆";
      } else {
        str = "大型餐饮服务企业，是指加工经营场所<br/>使用面积在500～3000㎡（不含500㎡<br/>含3000㎡）或者就餐座位数在250～<br/>1000座（不含250座，含1000座）<br/>的餐馆";
      }
      return str;
    },
    position: 'right',
    appendToBody: true,
    extraCssText: 'z-index:9',
    textStyle: {
      fontWeight: 800,
      fontSize: '1rem'
    }
  },
  legend: {
    tooltip: {
      show: true,
    },
    data: [],
    formatter: function(params) {
      return params.slice(0, 2)
    },
    top: "3%",
    left: "3%",
    icon: "circle",
    textStyle: {
      color: "#fff",
      fontSize: 14,
    },
  },
  animation: true,
  labelLine: {
    show: true,
    lineStyle: {
      color: "#7BC0CB",
    },
  },
  label: {
    show: false,
  },
  xAxis3D: {
    min: -1.5,
    max: 1.5,
  },
  yAxis3D: {
    min: -1.5,
    max: 1.5,
  },
  zAxis3D: {
    min: -1,
    max: 1,
  },
  grid3D: {
    show: false,
    boxHeight: 4,
    top: '10%',
    left: 'center',
    bottom: "20%",
    viewControl: {
      distance: 180,
      alpha: 25,
      beta: 60,
      autoRotate: true, // 自动旋转
    },
  },
  series: []
})

// 生成扇形的曲面参数方程，用于 series-surface.parametricEquation
function getParametricEquation (startRatio, endRatio, isSelected, isHovered, k, height) {
  // 计算
  let midRatio = (startRatio + endRatio) / 3;

  let startRadian = startRatio * Math.PI * 2;
  let endRadian = endRatio * Math.PI * 2;
  let midRadian = midRatio * Math.PI * 2;

  // 如果只有一个扇形，则不实现选中效果。
  if (startRatio === 0 && endRatio === 1) {
    isSelected = false;
  }

  // 通过扇形内径/外径的值，换算出辅助参数 k（默认值 1/3）
  k = typeof k !== "undefined" ? k : 1 / 3;

  // 计算选中效果分别在 x 轴、y 轴方向上的位移（未选中，则位移均为 0）
  let offsetX = isSelected ? Math.cos(midRadian) * 0.1 : 0;
  let offsetY = isSelected ? Math.sin(midRadian) * 0.1 : 0;

  // 计算高亮效果的放大比例（未高亮，则比例为 1）
  let hoverRate = isHovered ? 1.1 : 1;

  // 返回曲面参数方程
  return {
    u: {
      min: -Math.PI,
      max: Math.PI * 3,
      step: Math.PI / 32,
    },

    v: {
      min: 0,
      max: Math.PI * 2,
      step: Math.PI / 20,
    },

    x: function (u, v) {
      if (u < startRadian) {
        return offsetX + Math.cos(startRadian) * (1 + Math.cos(v) * k) * hoverRate;
      }
      if (u > endRadian) {
        return offsetX + Math.cos(endRadian) * (1 + Math.cos(v) * k) * hoverRate;
      }
      return offsetX + Math.cos(u) * (1 + Math.cos(v) * k) * hoverRate;
    },

    y: function (u, v) {
      if (u < startRadian) {
        return offsetY + Math.sin(startRadian) * (1 + Math.cos(v) * k) * hoverRate;
      }
      if (u > endRadian) {
        return offsetY + Math.sin(endRadian) * (1 + Math.cos(v) * k) * hoverRate;
      }
      return offsetY + Math.sin(u) * (1 + Math.cos(v) * k) * hoverRate;
    },

    z: function (u, v) {
      if (u < -Math.PI * 0.5) {
        return Math.sin(u);
      }
      if (u > Math.PI * 2.5) {
        return Math.sin(u);
      }
      return Math.sin(v) > 0 ? heightProportion * height : -1;
    },
  };
}

// 生成模拟 3D 饼图的配置项
function getPie3D (pieData, internalDiameterRatio) {
  let series = [];
  let sumValue = 0;
  let startValue = 0;
  let endValue = 0;
  let legendData = [];
  let linesSeries = []; // line3D模拟label指示线
  let k = typeof internalDiameterRatio !== "undefined" ? (1 - internalDiameterRatio) / (1 + internalDiameterRatio) : 1 / 3;

  // 为每一个饼图数据，生成一个 series-surface 配置
  for (let i = 0; i < pieData.length; i++) {
    sumValue += pieData[i].value;

    let seriesItem = {
      name: typeof pieData[i].name === "undefined" ? `series${i}` : pieData[i].name,
      type: "surface",
      parametric: true,
      wireframe: {
        show: false,
      },
      pieData: pieData[i],
      pieStatus: {
        selected: false,
        hovered: false,
        k: k,
      },
    };

    if (typeof pieData[i].itemStyle != "undefined") {
      let itemStyle = {};

      typeof pieData[i].itemStyle.color != "undefined" ? (itemStyle.color = pieData[i].itemStyle.color) : null;
      typeof pieData[i].itemStyle.opacity != "undefined" ? (itemStyle.opacity = pieData[i].itemStyle.opacity) : null;

      seriesItem.itemStyle = itemStyle;
    }
    series.push(seriesItem);
  }

  // 使用上一次遍历时，计算出的数据和 sumValue，调用 getParametricEquation 函数，
  // 向每个 series-surface 传入不同的参数方程 series-surface.parametricEquation，也就是实现每一个扇形。
  for (let i = 0; i < series.length; i++) {
    endValue = startValue + series[i].pieData.value;
    // console.log(series[i]);
    series[i].pieData.startRatio = startValue / sumValue;
    series[i].pieData.endRatio = endValue / sumValue;
    series[i].parametricEquation = getParametricEquation(series[i].pieData.startRatio, series[i].pieData.endRatio, false, false, k, series[i].pieData.value);

    startValue = endValue;

    // 计算label指示线的起始和终点位置
    let midRadian = (series[i].pieData.endRatio + series[i].pieData.startRatio) * Math.PI;
    let posX = Math.cos(midRadian) * (1 + Math.cos(Math.PI / 2));
    let posY = Math.sin(midRadian) * (1 + Math.cos(Math.PI / 2));
    let posZ = Math.log(Math.abs(series[i].pieData.value + 1)) * 0.1;
    let flag = (midRadian >= 0 && midRadian <= Math.PI / 2) || (midRadian >= (3 * Math.PI) / 2 && midRadian <= Math.PI * 2) ? 1 : -1;
    let color = pieData[i].itemStyle.color;
    let turningPosArr = [posX * 1.8 + i * 0.1 * flag + (flag < 0 ? -0.5 : 0), posY * 1.8 + i * 0.1 * flag + (flag < 0 ? -0.5 : 0), posZ * 2];
    let endPosArr = [posX * 1.9 + i * 0.1 * flag + (flag < 0 ? -0.5 : 0), posY * 1.9 + i * 0.1 * flag + (flag < 0 ? -0.5 : 0), posZ * 6];

    linesSeries.push(
      {
        type: "line3D",
        lineStyle: {
          color: color,
        },
        data: [[posX, posY, posZ], turningPosArr, endPosArr],
      },
      {
        type: "scatter3D",
        label: {
          show: true,
          distance: 0,
          position: "center",
          color: "#ffffff",
          backgroundColor: color,
          borderWidth: 2,
          fontSize: 14,
          padding: 10,
          borderRadius: 4,
          formatter: '{b}',
        },
        symbolSize: 0,
        data: [
          {
            name: series[i].name,
            value: endPosArr,
          },
        ],
      }
    );

    legendData.push(series[i].name);
  }
  series = series.concat(linesSeries);

  // 最底下圆盘
  series.push({
    name: "mouseoutSeries",
    type: "surface",
    parametric: true,
    wireframe: {
      show: false,
    },
    itemStyle: {
      opacity: 1,
      color: "rgba(25, 93, 176, 1)",
    },
    parametricEquation: {
      u: {
        min: 0,
        max: Math.PI * 2,
        step: Math.PI / 20,
      },
      v: {
        min: 0,
        max: Math.PI,
        step: Math.PI / 20,
      },
      x: function (u, v) {
        return ((Math.sin(v) * Math.sin(u) + Math.sin(u)) / Math.PI) * 2;
      },
      y: function (u, v) {
        return ((Math.sin(v) * Math.cos(u) + Math.cos(u)) / Math.PI) * 2;
      },
      z: function (u, v) {
        return Math.cos(v) > 0 ? -0 : -1.5;
      },
    },
  });
  return series;
}

async function setPieChart () {
  chartInstance.value = props.echarts.init(pieChart.value)
  chartInstance.value.setOption(echartOption, 'dark')
  chartInstance.value.on('click', params => {
    console.log('params==>>>', params);
    const { name } = params
    dialogStore.setFormModel('FormCompanyOrFoodCategoryModel')
    dialogStore.setClickItem({ name, cuisine: props.data.cuisine, type: 'company' })
  })
  // chartInstance.value.getZr().on('click', function(event) {
  //   // 该监听器正在监听一个`zrender 事件`。
  //   console.log('点击空白处');
  // });
  setResize()
}
watch(
  () => props.data,
  async (nv) => {
    echartOption.legend.data = chartData.value.map(item => item.name)
    echartOption.series = getPie3D(
      chartData.value.map((item) => {
        item.value = Number(((item.value / props.data.all) * 100).toFixed(2));
        return item;
      }),
      0.8,
      240,
      28,
      26,
      1
    );
    await nextTick()
    setPieChart()
  },
  { deep: true }
)
</script>

<style lang="scss" scoped>
.pie {
  width: 100%;
  height: 100%;
}
</style>
