<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="site_content">
    <el-container>
      <div id="site-border-left"></div>
      <div id="site-border-right"></div>
      <div id="site-border-top"></div>
      <div id="site-border-bottom"></div>
      <el-header :class="{ 'isHome': isHome }">
        <Header :is-home="isHome" />
      </el-header>
      <el-main>
        <RouterView v-slot="{ Component }">
          <KeepAlive :include="['BlogListPage', 'VlogListPage', 'AboutPage', 'WorksPage', 'ContactPage']">
            <component :is="Component" />
          </KeepAlive>
        </RouterView>
      </el-main>

      <el-footer :class="{ 'isHome': isHome }">
        <div>© Kangyouknowwho | Website created by Lykang</div>
      </el-footer>
    </el-container>

    <LangSwitcher />

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import Header from './Layout/Header.vue'
import LangSwitcher from './Widgets/LangSwitcher.vue'
const route = useRoute()
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
