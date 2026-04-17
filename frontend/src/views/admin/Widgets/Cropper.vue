<template>
  <div class="cropper-wrapper">
    <div class="cropper-content">
      <div class="cropper">
        <img ref="imageRef" :src="imgFile" alt="cropper-source" />
      </div>
      <div class="show-preview">
        <div class="preview">
          <img :src="previewUrl" alt="cropper-preview" />
        </div>
      </div>
    </div>
    <div class="footer-btn">
      <div class="scope-btn">
        <el-button type="primary" @click="changeScale(0.1)">
          <el-icon color="#fff"><ZoomIn /></el-icon>
        </el-button>
        <el-button type="primary" @click="changeScale(-0.1)">
          <el-icon color="#fff"><ZoomOut /></el-icon>
        </el-button>
        <el-button type="primary" @click="rotateLeft">逆时针旋转</el-button>
        <el-button type="primary" @click="rotateRight">顺时针旋转</el-button>
      </div>
      <div class="upload-btn">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="uploadImg">上传</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'

interface Props {
  imgFile: string
}

interface Emits {
  (e: 'cropperDone', file: Blob): void
  (e: 'cropperCancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const imageRef = ref<HTMLImageElement | null>(null)
const previewUrl = ref('')
let cropper: Cropper | null = null

function initCropper() {
  if (!imageRef.value) return
  cropper?.destroy()
  cropper = new Cropper(imageRef.value, {
    // 与旧版比例保持一致：148 x 96
    aspectRatio: 148 / 96,
    viewMode: 1,
    dragMode: 'move',
    autoCropArea: 0.8,
    restore: false,
    guides: true,
    center: true,
    highlight: false,
    cropBoxMovable: true,
    cropBoxResizable: true,
    toggleDragModeOnDblclick: false,
    ready() {
      updatePreview()
    },
    crop() {
      updatePreview()
    }
  })
}

function updatePreview() {
  if (!cropper) return
  previewUrl.value = cropper.getCroppedCanvas().toDataURL('image/jpeg', 0.92)
}

function changeScale(step: number) {
  if (!cropper) return
  cropper.zoom(step)
}

function rotateLeft() {
  cropper?.rotate(-90)
}

function rotateRight() {
  cropper?.rotate(90)
}

function uploadImg() {
  if (!cropper) return
  cropper.getCroppedCanvas().toBlob((blob: Blob | null) => {
    if (blob) emit('cropperDone', blob)
  }, 'image/jpeg')
}

function handleCancel() {
  emit('cropperCancel')
}

onMounted(() => {
  initCropper()
})

watch(() => props.imgFile, () => {
  initCropper()
})

onBeforeUnmount(() => {
  cropper?.destroy()
  cropper = null
})
</script>

<style lang="scss" scoped>
.cropper-wrapper {
  .cropper-content {
    display: flex;
    justify-content: flex-end;
    .cropper {
      width: 350px;
      height: 300px;
      :deep(img) {
        max-width: 100%;
      }
    }
    .show-preview {
      width: 300px;
      height: 300px;
      margin: 0 25px;
      align-items: center;
      display: flex;
      justify-content: center;
      flex: 1;
      overflow: hidden;
      border: 1px solid #cccccc;
      background: rgba(0, 0, 0, 0.8);
      margin-left: 40px;
      .preview {
        width: 148px;
        height: 96px;
        overflow: hidden;
        border: 1px dashed #000;
        background: rgba(255, 255, 255, 0.9);
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }

  .footer-btn {
    margin-top: 30px;
    display: flex;
    justify-content: flex-end;
    .scope-btn {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .upload-btn {
      flex: 1;
      display: flex;
      justify-content: center;
      gap: 12px;
    }
  }
}
</style>
