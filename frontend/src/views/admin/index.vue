<template>
  <el-config-provider :locale="zhCn">
    <div id="admin">
      <Nav />
      <RouterView />
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Nav from './Layout/Nav.vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useUserStore } from '@/stores/userStore'
import ServerAPI from '@/api/server'

const userStore = useUserStore()

// 页面刷新后从后端恢复登录状态（session 仍在有效期内）
// 放在 admin 布局组件而非 App.vue，避免客户端页面也触发不必要的 API 调用
onMounted(async () => {
  try {
    const res = await ServerAPI.getAuthStatus()
    if (res.code === 1 && res.data?.loggedIn) {
      userStore.setUserInfo({ ...res.data.userInfo, login: true })
    }
  } catch {
    // 未登录，忽略
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
