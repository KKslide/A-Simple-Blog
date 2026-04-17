<template>
  <div class="pdf-viewer">
    <div class="controls">
      <button @click="prevPage" :disabled="pageNum<=1"><el-icon><DArrowLeft /></el-icon></button>
      <span>{{ pageNum }} / {{ numPages || '-' }}</span>
      <button @click="nextPage" :disabled="pageNum>=numPages"><el-icon><DArrowRight /></el-icon></button>
      <button @click="zoomOut"><el-icon><ZoomOut /></el-icon></button>
      <button @click="zoomIn"><el-icon><ZoomIn /></el-icon></button>
    </div>

    <div class="canvas-wrap" ref="wrap" style="overflow:auto;">
      <canvas ref="canvas"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'

// 指定 worker（Vite-friendly）
GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href

type PdfSource = string | Uint8Array | Record<string, unknown>

const props = defineProps({
  src: { type: [String, Uint8Array, Object], required: true } // 支持 URL 或 ArrayBuffer/Uint8Array 等
}) as { src: PdfSource }

const canvas = ref<HTMLCanvasElement | null>(null)
const wrap = ref<HTMLDivElement | null>(null)
type PdfViewportLike = { height: number; width: number }
type PdfPageLike = {
  getViewport: (opts: { scale: number; offsetY?: number }) => PdfViewportLike
  render: (ctx: { canvasContext: CanvasRenderingContext2D; viewport: PdfViewportLike }) => {
    promise: Promise<void>
  }
}
type PdfDocLike = { numPages: number; getPage: (n: number) => Promise<PdfPageLike>; destroy: () => void }

let pdfDoc: PdfDocLike | null = null
const pageNum = ref(1)
const numPages = ref(0)
const scale = ref(1)

type PdfJsGetDocumentParam = string | Uint8Array | Record<string, unknown>

async function loadPdf(src: PdfSource) {
  // 支持传入 URL 或 ArrayBuffer/Uint8Array
  const loadingTask = getDocument(src as unknown as PdfJsGetDocumentParam)
  pdfDoc = (await loadingTask.promise) as unknown as PdfDocLike
  numPages.value = pdfDoc.numPages
  pageNum.value = 1
  await renderPage(pageNum.value)
}

async function renderPage(num: number) {
  if (!pdfDoc) return
  const page = await pdfDoc.getPage(num)
  const viewport = page.getViewport({ scale: scale.value, offsetY: -80 })

  const c = canvas.value
  if (!c) return
  const context = c.getContext('2d')
  if (!context) return

  c.height = viewport.height
  c.width = viewport.width

  const renderContext = {
    canvasContext: context,
    viewport: viewport
  }
  await page.render(renderContext).promise
}

function prevPage() {
  if (pageNum.value <= 1) return
  pageNum.value--
  renderPage(pageNum.value)
}
function nextPage() {
  if (pageNum.value >= numPages.value) return
  pageNum.value++
  renderPage(pageNum.value)
}
function zoomIn() {
  scale.value = +(scale.value * 1.25).toFixed(2)
  renderPage(pageNum.value)
}
function zoomOut() {
  scale.value = +(scale.value / 1.25).toFixed(2)
  renderPage(pageNum.value)
}

watch(() => props.src, (v) => {
  if (v) loadPdf(v)
})

onMounted(() => {
  if (props.src) loadPdf(props.src)
})

onBeforeUnmount(() => {
  if (pdfDoc) {
    pdfDoc.destroy()
    pdfDoc = null
  }
})
</script>

<style scoped>
.pdf-viewer { width:100%; height:100%; display:flex; flex-direction:column; padding-top: 80px; }
.controls { padding:8px; display:flex; gap:8px; align-items:center; }
.canvas-wrap { flex:1; background:#fff; display:flex; justify-content:center; align-items:center; }
</style>
