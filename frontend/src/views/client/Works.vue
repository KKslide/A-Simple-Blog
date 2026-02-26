<template>
  <div id="work_list">
    <Card
      :data-image="'https://mypics.zhaopin.cn/small/procedures/resume/individual/works/1757411062228148397/4c2e703f-cfc0-4cec-ba7d-71a1737ca0c8.jpeg'"
      @click="check('/v2')"
    >
      <template #header>
        <h1>Echarts & Map</h1>
      </template>
      <template #content>
        <p>一个Echarts+百度地图应用</p>
      </template>
    </Card>
    <Card v-for="item in list" :key="item.id" :data-image="BaseUrl + item.img" @click="check(item.routeName)">
      <template #header>
        <h1>{{ item.name }}</h1>
      </template>
      <template #content>
        <p>{{ item.description }}</p>
      </template>
    </Card>
  </div>
</template>

<script setup>
defineOptions({name:'works'})
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { portfoliosList } from '@/utils/config'
import Card from './Widgets/Card.vue'
const BaseUrl = import.meta.env.VITE_MEDIA_URL
const router = useRouter()
function check(routeName) {
  if (!routeName) return
  if (routeName == '/v2') {
    window.open('/v2')
    return
  }
  router.push({ name: routeName })
}
const list = computed(() => {
  return portfoliosList.sort(() => Math.random() - 0.5)
})
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
