<template>
  <div class="site_content">
    <el-container>
      <div id="site-border-left"></div>
      <div id="site-border-right"></div>
      <div id="site-border-top"></div>
      <div id="site-border-bottom"></div>
      <el-header ref="headEl" :class="{ 'isHome': isHome }">
        <Header :is-home="isHome" />
      </el-header>
      <el-main>
        <RouterView v-slot="{ Component }">
          <KeepAlive :include="['bloglist','vloglist', 'about', 'works', 'contact']">
            <component :is="Component" />
          </KeepAlive>
        </RouterView>
      </el-main>

      <el-footer ref="footEl" :class="{ 'isHome': isHome }">
        <div>© Kangyouknowwho | Website created by Lykang</div>
      </el-footer>
    </el-container>

    <LangSwitcher />

  </div>

</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import Header from './Layout/Header.vue'
import LangSwitcher from './Widgets/LangSwitcher.vue'

defineOptions({
  name: 'ClientIndex',
})

const route = useRoute()
const headEl = ref(null)
const footEl = ref(null)
const isHome = computed(() => {
  return route.name == 'home'
})
onMounted(() => {
  document.body.classList.add('client')
})
onUnmounted(() => {
  document.body.classList.remove('client')
})
</script>
