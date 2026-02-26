<template>
  <div id="server">
    <Nav />
    <RouterView />
  </div>
</template>

<script setup>
import Nav from './Layout/Nav.vue'
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<style lang="scss" scoped>
#server {
  min-width: 1000px;
  min-height: 100vh;
  background-color: #000;
}
</style>
