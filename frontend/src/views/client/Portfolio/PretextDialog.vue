<template>
  <div>

  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { prepare, layout } from '@chenglou/pretext'

const prepared = prepare('AGI 春天到了. بدأت الرحلة 🚀‎', '16px Inter')
console.log('查看这个prepared ====> ', prepared)
const { height, lineCount } = layout(prepared, 320, 20) // pure arithmetic. No DOM layout & reflow!

onMounted(() => {
  console.log('查看 height, lineCount ====> ', height, lineCount)
})

</script>

<style scoped>

</style>
