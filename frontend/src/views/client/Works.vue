<template>
  <div id="work_list">
    <Card
      v-for="item in list"
      :key="item.name"
      :data-image="resolveImage(item.img)"
      @click="check(item.routeName)"
    >
      <template #header>
        <h1>{{ item.name }}</h1>
      </template>
      <template #content>
        <p>{{ item.description }}</p>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'WorksPage' })
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import utils from '@/utils'
import { portfoliosList } from '@/config/config'
import Card from './Widgets/Card.vue'
const router = useRouter()
const list = computed(() => [...portfoliosList].sort(() => Math.random() - 0.5))

/** Vite 打包的静态资源直接使用, 其余相对路径走媒体域名 */
const resolveImage = (img: string) => {
  if (!img) return ''
  if (img.startsWith('http') || img.startsWith('/src/') || img.startsWith('/assets/')) return img
  return utils.mediaUrl(img)
}

const check = (routeName: string) => {
  if (!routeName) return
  router.push({ name: routeName })
}
</script>

<style lang="scss" scoped>
#work_list {
  padding: 30px 20px 200px 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  grid-template-rows: repeat(auto-fit, minmax(360px, 1fr));
  justify-items: center;
}
</style>
