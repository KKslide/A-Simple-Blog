<!-- eslint-disable vue/multi-word-component-names -->
<template>
  现在是一个杂乱布局
  <el-button @click="setWaterfall">点一下</el-button>
  看看 [Waterfall] 效果
  <el-divider></el-divider>
  <div id="waterfall">
    <div class="content">
      <div class="item" v-for="(item, index) in BoxItem" :key="index"
        :style="{ 'height': item.height, 'line-height': item.height, 'backgroundColor': item['backgroundColor'] }">
        这是一个Div,假设这里有内容
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onUnmounted, nextTick } from 'vue'
import utils from '@/utils'

interface BoxItem {
  height: string
  backgroundColor: string
}

const columns = 3 // 设置默认3列

const handleResize = utils._debounce(waterFall, 200)

const BoxItem = reactive<BoxItem[]>(
  Array.from({ length: 20 }, () => ({
    height: `${randomInteger(100, 500)}px`,
    backgroundColor: getRandomHexColor()
  }))
)

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

function randomInteger(min = 0, max = 100): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomHexColor(): string {
  return `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`
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

function waterFall() {
  const container = document.querySelector<HTMLDivElement>('.content')
  if (!container) return

  // 1- 确定，图片宽度 = 浏览器宽度 - 滚动条宽度
  const pageWidth = container.clientWidth - getScrollbarWidth()
  // 1-1 得到item的宽度
  const itemWidth = Math.round(pageWidth / columns)
  // 1-2 设置item的宽度
  const items = container.querySelectorAll<HTMLDivElement>('.item')
  items.forEach((el) => {
    el.style.width = itemWidth + 'px'
  })

  // 空数组用于存放每一行的高度
  const heights = Array<number>(columns).fill(0)

  items.forEach((el, i) => {
    const ratio = itemWidth / el.offsetWidth // 获取图片的缩放比(假设.item中有一张图片)
    const boxHeight = Math.round(el.offsetHeight * ratio) // 用缩放比计算缩放后图片的高度, 注意是 高度

    // 2- 第一行
    if (i < columns) {
      el.style.top = '0px' // top值为0
      el.style.left = `${itemWidth * i}px` // left值为每个item的宽度相加
      // 把第一行的高度数值，依次添加到数组
      heights[i] = boxHeight
      return
    }
    // 3- 其他行
    // 3-1 每一次循环到新的item，取出前三个item元素中的最小高度 和它的索引值
    const minHeight = Math.min(...heights)
    const index = heights.indexOf(minHeight)

    // 当前item的top值 就是heights数组中最小高度的top值
    el.style.top = `${minHeight}px`
    // 当前item的left值 就是heights数组中 最小高度的 left值
    el.style.left = `${items[index]!.offsetLeft}px`

    // 赋值完之后 heights数组中的高度最小值 要加上当前item的高度值，这样下一次循环才能再继续比较
    heights[index]! += boxHeight

  })
}

// 获取滚动条宽度
function getScrollbarWidth(): number {
  const div = document.createElement('div')
  div.style.cssText = `
    width:100px;
    height:100px;
    overflow:scroll;
    position:absolute;
    top:-9999px;
  `
  document.body.appendChild(div)
  const width = div.offsetWidth - div.clientWidth
  document.body.removeChild(div)
  return width
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
