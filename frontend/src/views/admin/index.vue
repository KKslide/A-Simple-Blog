<template>
  <el-config-provider :locale="zhCn">
    <div id="admin">
      <Nav />
      <RouterView v-if="authChecked" />
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Nav from './Layout/Nav.vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useUserStore } from '@/stores/userStore'
import ServerAPI from '@/api/server'

const userStore = useUserStore()
const router = useRouter()
const authChecked = ref(false)

// 页面刷新后从后端恢复登录状态（session 仍在有效期内）
// 认证完成前不渲染子路由，避免 Dashboard 等组件提前发起 API 调用导致双重警告
onMounted(async () => {
  try {
    const res = await ServerAPI.getAuthStatus()
    if (res.code === 1 && res.data?.loggedIn) {
      userStore.setUserInfo({ ...res.data.userInfo, login: true })
    }
    authChecked.value = true
  } catch {
    // 未登录，axios 拦截器已弹出提示，直接跳转登录页
    router.replace('/admin/login')
  }
})
</script>

<style lang="scss" scoped>
#admin {
  min-width: 1000px;
  min-height: 100vh;
  background-color: #000;
}
</style>
