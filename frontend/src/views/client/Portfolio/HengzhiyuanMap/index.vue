<template>
  <div class="hzy-app">
    <RouterView />
    <RouterLink class="hzy-back" :to="{ name: 'works' }">← 返回作品集</RouterLink>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'HengzhiyuanMapPage' })
import { onMounted, onBeforeUnmount } from 'vue'
import { RouterView, RouterLink } from 'vue-router'
import '@/views/client/Portfolio/HengzhiyuanMap/styles/main.scss'

// 原项目依赖的 iconfont, dev 时一般写在 index.html, 集成后按需加载
const ICONFONT_URL = 'https://at.alicdn.com/t/c/font_5000643_peb91c4iewh.css'
let wasDark = false

function ensureIconfont() {
  if (document.querySelector(`link[href="${ICONFONT_URL}"]`)) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = ICONFONT_URL
  document.head.appendChild(link)
}

onMounted(() => {
  // 原项目整站是暗色主题, 进入时临时启用, 离开时恢复博客原本的状态
  wasDark = document.documentElement.classList.contains('dark')
  document.documentElement.classList.add('dark')
  document.body.classList.add('hzy-active')
  ensureIconfont()
})

onBeforeUnmount(() => {
  document.body.classList.remove('hzy-active')
  if (!wasDark) {
    document.documentElement.classList.remove('dark')
  }
})
</script>

<style lang="scss" scoped>
.hzy-app {
  position: fixed;
  inset: 0;
  z-index: 1000;
  overflow: auto;
  background: #000;
}

.hzy-back {
  position: fixed;
  left: 20px;
  top: 16px;
  z-index: 1010;
  padding: 6px 12px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 14px;
  line-height: 1;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
  transition: all 0.2s;

  &:hover {
    color: #fff;
    border-color: rgba(255, 255, 255, 0.6);
  }
}
</style>
