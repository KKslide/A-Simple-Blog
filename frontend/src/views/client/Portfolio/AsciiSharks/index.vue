<template>
  <div class="ascii-sharks">
    <canvas ref="canvasRef" class="ascii-ocean" aria-hidden="true"></canvas>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'AsciiSharksPage' })
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { OceanEngine } from './engine'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let engine: OceanEngine | null = null

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  engine = new OceanEngine(canvas)
})

onBeforeUnmount(() => {
  engine?.destroy()
  engine = null
})
</script>

<style lang="scss" scoped>
.ascii-sharks {
  width: 100%;
  height: calc(100vh - 150px);
  height: calc(100svh - 150px);
  min-height: 420px;
  overflow: hidden;
  background: #000;
  border-radius: 12px;
}

.ascii-ocean {
  display: block;
  width: 100%;
  height: 100%;
  cursor: crosshair;
  // 字形由 canvas 的 font-family 决定, 用系统等宽字体保证离线可用
  font-family: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
}
</style>
