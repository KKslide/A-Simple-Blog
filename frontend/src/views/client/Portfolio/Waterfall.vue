<template>
  现在是一个杂乱布局
  <el-button @click="setWaterfall">点一下</el-button>
  看看 [Waterfall] 效果
  <el-divider></el-divider>
  <div id="waterfall">
    <div class="content">
      <div class="item" v-for="(item, index) in BoxItem" :key="index" :style="{ 'height': item.height, 'line-height': item.height, 'background-color': item['background-color'] }">
        这是一个Div,假设这里有内容
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, onUnmounted, nextTick } from 'vue'
import utils from '@/utils'
const handleResize = utils._debounce(waterFall, 200)
const boxItem = new Array(20).fill('').map(() => {
  return {
    'height': randomInteger({ min: 100, max: 500 }) + 'px',
    'background-color': getRandomHexColor()
  }
})
const BoxItem = reactive(boxItem)
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
function randomInteger ({ min = 0, max = 100 } = {}) {
  if (typeof min !== 'number' || typeof max !== 'number') {
    throw new Error('min 和 max 必须是数字')
  }
  if (max < min) {
    throw new Error('max 必须大于等于 min')
  }
  return Math.floor(Math.random() * (max - min + 1)) + min
}
function getRandomHexColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
async function setWaterfall() {
  await nextTick()
  waterFall()
  window.addEventListener('resize', handleResize)
}
/*
  思路:
    item:
      - 第一行: top值 为0
               left值 为 自身宽度*块数
      - 其他行: top值 为 排序后必须算出图片的缩小比例，再计算出缩小后的图片高度，第一行之外的元素高度进行排序，每次循环到下一个元素，就替换掉 前三个元素中的高度最小值
 */

function waterFall () {
  const el = document.querySelector('.content')
  // 1- 确定，图片宽度 = 浏览器宽度 - 滚动条宽度
  let pageWidth = getClient(el).width - getBarWidth()
  let columns = 3 // 设置默认3列
  // 1-1 得到item的宽度
  let itemWidth = parseInt(pageWidth / columns)
  // 1-2 设置item的宽度
  document.querySelectorAll('.item').forEach(el => {
    el.style.width = itemWidth + 'px'
  })

  let arr = [] // 空数组用于存放每一行的高度
  document.querySelectorAll(".content .item").forEach((el, i) => {
    // 假设.item中有子元素或者图片👇
    // const height = $(this).find("img").height() // 获取图片高度
    // const width = $(this).find("img").width() // 获取图片宽度
    const height = el.offsetHeight
    const width = el.offsetWidth
    const ratio = itemWidth / width // 获取图片的缩放比(假设.item中有一张图片)
    const boxHeight = parseInt(height * ratio) // 用缩放比计算缩放后图片的高度, 注意是 高度

    // 2- 第一行
    if (i < columns) {
      el.style.top = '0px' // top值为0
      el.style.left = (itemWidth * i) + 'px' // left值为每个item的宽度相加
      arr.push(boxHeight) // 把第一行的高度数值，依次添加到数组
    }
    // 3- 其他行
    else {
      let minHeight = arr[0], index = 0
      // 3-1 每一次循环到新的item，取出前三个item元素中的最小高度 和它的索引值
      for (let j = 0; j < arr.length; j++) {
        if (minHeight > arr[j]) {
          minHeight = arr[j]
          index = j
        }
      }

      // 当前item的top值 就是arr数组中最小高度的top值
      el.style.top = arr[index] + 'px'
      // 当前item的left值 就是arr数组中 最小高度的 left值
      const _left = document.querySelector(`.item:nth-child(${index + 1})`)?.offsetLeft || 0
      el.style.left = _left + 'px'

      // 赋值完之后 arr数组中的高度最小值 要加上当前item的高度值，这样下一次循环才能再继续比较
      arr[index] = arr[index] + boxHeight
    }

  })
}

// clientWidth 处理兼容性
function getClient (el) {
  let clientSize = {
    width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
  }
  if (el) {
    return {
      width: el.clientWidth,
      height: el.clientHeight
    }
  }
  return clientSize
}

// 获取滚动条宽度
function getBarWidth () {
  let outDiv = document.createElement("div");
  outDiv.style.width = "100px";
  outDiv.style.position = "absolute";
  outDiv.style.top = "-9999px";
  document.body.appendChild(outDiv);
  let widthnobar = outDiv.offsetWidth;

  outDiv.style.overflow = "scroll";

  let innerDiv = document.createElement("div");
  innerDiv.style.width = "100%";
  outDiv.appendChild(innerDiv);
  let widthbar = innerDiv.offsetWidth;

  document.body.removeChild(outDiv);

  return widthnobar - widthbar;
}

/**
 * 问题:
 * 1.如果是动态加载元素 在未完全加载完毕的时候 没办法获取到图片高度怎么办？
 * 2.如果文字而不是图片的话，怎么去依次设置高度和位置？
 */

</script>

<style lang="scss" scoped>
#waterfall {
  width: 100%;
  height: 60vh;

  .content {
    height: inherit;
    position: relative;
  }

  .item {
    text-align: center;
    overflow: hidden;
    position: absolute;
    z-index: 10;
  }
}
</style>
