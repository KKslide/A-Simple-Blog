<template>
  <el-config-provider :locale="zhCn">
    <div id="server">
      <Nav />
      <RouterView />
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import Nav from './Layout/Nav.vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

</script>

<style lang="scss" scoped>
#server {
  min-width: 1000px;
  min-height: 100vh;
  background-color: #000;
}
</style>
