<template>
  <div>
    <div class="hidden-sm-and-down">
      <el-row justify="center">
        <el-col class="router_link" :span="2">
          <RouterLink active-class="active" :to="{ name: 'home' }">{{ $t('navbar.Home') }}</RouterLink>
        </el-col>

        <el-col :span="1">
          <el-divider direction="vertical" />
        </el-col>

        <el-col class="router_link" :span="2">
          <RouterLink :class="{ 'active': 'bloglist,searchlist'.includes(currentRoute) }" :to="{ name: 'bloglist' }">{{ $t('navbar.Blogs') }}</RouterLink>
        </el-col>

        <el-col :span="1">
          <el-divider direction="vertical" />
        </el-col>

        <el-col class="router_link" :span="2">
          <RouterLink active-class="active" :to="{ name: 'vloglist' }">{{ $t('navbar.Vlogs') }}</RouterLink>
        </el-col>

        <el-col :span="1">
          <el-divider direction="vertical" />
        </el-col>

        <el-col class="router_link" :span="2">
          <RouterLink active-class="active" :to="{ name: 'works' }">{{ $t('navbar.Works') }}</RouterLink>
        </el-col>

        <el-col :span="1">
          <el-divider direction="vertical" />
        </el-col>

        <el-col class="router_link" :span="2" :offset="-1">
          <RouterLink active-class="active" :to="{ name: 'about' }">{{ $t('navbar.About') }}</RouterLink>
        </el-col>

        <el-col :span="1">
          <el-divider direction="vertical" />
        </el-col>

        <el-col class="router_link" :span="2">
          <RouterLink active-class="active" :to="{ name: 'contact' }">{{ $t('navbar.Contact') }}</RouterLink>
        </el-col>
      </el-row>
    </div>

    <div class="moble_menu hidden-sm-and-up">
      <el-row justify="end">
        <el-icon :color="isHome ? '#fff' : '#333'" size="40" @click="drawer=true">
          <Expand />
        </el-icon>
      </el-row>
    </div>

    <el-drawer v-model="drawer" title="Menu" size="60%" :with-header="false" :z-index="999">
      <el-row>
        <el-col :span="24">
          <div class="nav_link">
            <RouterLink :to="{ name: 'home' }" @click="drawer = false">01 : Home</RouterLink>
          </div>
        </el-col>
        <el-col :span="24">
          <div class="nav_link">
            <RouterLink :to="{ name: 'bloglist' }" @click="drawer = false">02 : Blogs</RouterLink>
          </div>
        </el-col>
        <el-col :span="24">
          <div class="nav_link">
            <RouterLink :to="{ name: 'vloglist' }" @click="drawer = false">03 : Vlogs</RouterLink>
          </div>
        </el-col>
        <el-col :span="24">
          <div class="nav_link">
            <RouterLink :to="{ name: 'about' }" @click="drawer = false">04 : About me</RouterLink>
          </div>
        </el-col>
        <el-col :span="24">
          <div class="nav_link">
            <RouterLink :to="{ name: 'works' }" @click="drawer = false">05 : Works</RouterLink>
          </div>
        </el-col>
        <el-col :span="24">
          <div class="nav_link">
            <RouterLink :to="{ name: 'contact' }" @click="drawer = false">06 : Contact</RouterLink>
          </div>
        </el-col>
      </el-row>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { portfoliosList } from '@/utils/config'
defineProps(['isHome'])
const drawer = ref(false)
const route = useRoute()
const currentRoute = computed(() => route.name)
const workPages = computed(() => 'works,' + portfoliosList.map(v => v.routeName).join(','))
</script>

<style lang="scss" scoped>
.moble_menu{
  margin: 10px;
}
.router_link {
  white-space: nowrap;
}
.nav_link {
  a {
    display: inline-block;
    width: 100%;
    height: 100%;
  }
}
</style>
