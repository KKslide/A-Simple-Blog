<template>
  <div class="chart-container">
    <div ref="lineChart" class="lineChart"></div>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, watch, nextTick } from 'vue'
import { useChart } from '@/views/client/Portfolio/HengzhiyuanMap/hooks/ChartHandler' // 假设您的 useChart hook 存在

const lineChart = ref(null)
const props = defineProps(['echarts', 'data'])
const { chartInstance, setResize } = useChart()

// 1. 新增状态管理
const selectedYear = ref('now') // 默认显示今年的数据 ('now', 'last', 'lastTwo')
const processedData = ref({})   // 存储所有预处理好的年份数据
const yearNames = ref({})       // 存储年份名称，如 '2023年'

// 2. 重构数据处理函数
function processAllData (data) {
  const { yearName: { now, last, lastTow: lastTwo } = {}, listLastTow, listLast, listNow } = data;
  // yearNames.value = yearName;
  yearNames.value = { now, last, lastTwo }

  const result = {
    now: {
      total: listNow.map(v => [v.create_date.split('-')[1], v.count_all]),
      valid: listNow.map(v => [v.create_date.split('-')[1], v.count]),
    },
    last: {
      // 注意：去年数据没有 count_all，这里我们假设 count 同时代表总数和属实数
      // 如果业务逻辑不同，请在这里修改
      total: listLast.map(v => [v.create_date.split('-')[1], v.count]),
      valid: listLast.map(v => [v.create_date.split('-')[1], v.count]),
    },
    lastTwo: {
      // 同上，前年数据也没有 count_all
      total: listLastTow.map(v => [v.create_date.split('-')[1], v.count]),
      valid: listLastTow.map(v => [v.create_date.split('-')[1], v.count]),
    },
  };
  processedData.value = result;
}

// 3. 重构图表渲染/更新函数
function renderChart () {
  if (!lineChart.value) return;

  // 如果 chartInstance 不存在，则初始化
  if (!chartInstance.value) {
    chartInstance.value = props.echarts.init(lineChart.value);
    setResize(); // 绑定 resize 事件
  }

  const currentData = processedData.value[selectedYear.value];
  if (!currentData) return;

  chartInstance.value.setOption({
    tooltip: {
      trigger: 'axis',
      textStyle: {
        fontWeight: 600,
        fontSize: '1rem'
      },
    },
    legend: {
      data: ['投诉总数', '属实数'],
      top: '10', // 调整位置以避开标题
      textStyle: {
        color: '#fff',
        fontSize: '0.8rem'
      }
    },
    color: ['#5bffff', '#afff9e'], // 调整颜色以匹配新系列
    grid: {
      top: '60', // 为标题和图例留出空间
      left: '3%',
      right: '10%',
      bottom: '5%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        axisLabel: {
          color: '#fff',
          fontSize: '1rem'
        }
      }
    ],
    yAxis: [
      {
        show: false,
        type: 'value',
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '投诉总数',
        type: 'line',
        label: { show: true, position: 'top', color: '#fff' },
        emphasis: { focus: 'series' },
        data: currentData.total
      },
      {
        name: '属实数',
        type: 'line',
        label: { show: true, position: 'top', color: '#fff' },
        emphasis: { focus: 'series' },
        data: currentData.valid
      }
    ]
  }, true); // 使用 true 来确保旧的 option 被完全替换
}

// 4. 更新 watch 逻辑
watch(
  () => props.data,
  async (newData) => {
    if (!newData || !newData.listNow) return;
    processAllData(newData);
    await nextTick();
    renderChart();
  },
  { deep: true, immediate: true }
)

// 5. 新增 watch 来监听年份切换
watch(selectedYear, () => {
  renderChart();
});

// 6. 定义切换年份的方法并暴露给父组件
function switchYear (yearKey) {
  if (['now', 'last', 'lastTwo'].includes(yearKey)) {
    selectedYear.value = yearKey;
  }
}

defineExpose({
  switchYear,
  yearNames,
  selectedYear
});

</script>

<style lang="scss" scoped>
.chart-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.lineChart {
  width: 100%;
  height: 100%;
}

</style>
