<template>
  <div class="cropper-wrapper">
    <div class="cropper-content">
      <div class="cropper">
        <vue-cropper
          ref="cropper"
          :img="imgFile"
          :outputSize="option.size"
          :outputType="option.outputType"
          :info="true"
          :full="option.full"
          :canMove="option.canMove"
          :canMoveBox="option.canMoveBox"
          :original="option.original"
          :autoCrop="option.autoCrop"
          :autoCropWidth="option.autoCropWidth"
          :autoCropHeight="option.autoCropHeight"
          :fixedBox="option.fixedBox"
          :fixed="option.fixed"
          :fixedNumber="option.fixedNumber"
          @realTime="realTime"
        >
        </vue-cropper>
      </div>
      <!-- 预览框 -->
      <div class="show-preview">
        <div :style="previews.div" class="preview">
          <img :src="previews.url" :style="previews.img">
        </div>
      </div>
    </div>
    <div class="footer-btn">
      <!-- 缩放旋转按钮 -->
      <div class="scope-btn">
        <el-button type="primary" @click="changeScale(1)">
          <el-icon color="#fff"><ZoomIn /></el-icon>
        </el-button>
        <el-button type="primary" @click="changeScale(-1)">
          <el-icon color="#fff"><ZoomOut /></el-icon>
        </el-button>
        <el-button type="primary" @click="rotateLeft">逆时针旋转</el-button>
        <el-button type="primary" @click="rotateRight">顺时针旋转</el-button>
      </div>
      <!-- 确认上传按钮 -->
      <div class="upload-btn">
        <el-button type="primary" @click="uploadImg('blob')">上传</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref,reactive } from 'vue'
import 'vue-cropper/dist/index.css'
import { VueCropper }  from "vue-cropper"
const props = defineProps(['imgFile'])
const emit = defineEmits(['cropperDone'])
const BaseUrl = import.meta.env.VITE_MEDIA_URL
const imgUrl = BaseUrl + '/upload/weekend_rolling.jpg'
const cropper = ref(null)
const previews = ref({})
const option = reactive({
  img: '' , // 裁剪图片的地址  (默认：空)
  size: 0.1, // 裁剪生成图片的质量  (默认:1)
  full: false, // 是否输出原图比例的截图 选true生成的图片会非常大  (默认:false)
  outputType: 'png', // 裁剪生成图片的格式  (默认:jpg)
  canMove: true, // 上传图片是否可以移动  (默认:true)
  original: false, // 上传图片按照原始比例渲染  (默认:false)
  canMoveBox: true, // 截图框能否拖动  (默认:true)
  autoCrop: true, // 是否默认生成截图框  (默认:false)
  autoCropWidth: 148, // 默认生成截图框宽度  (默认:80%)
  autoCropHeight: 96, // 默认生成截图框高度  (默认:80%)
  fixedBox: false, // 固定截图框大小 不允许改变  (默认:false)
  fixed: true, // 是否开启截图框宽高固定比例  (默认:true)
  fixedNumber: [1.777777777 , 1] // 截图框比例  (默认:[1:1])
})
function realTime(data) {
  previews.value = data
}
// 图片缩放
function changeScale (num) {
  num = num || 1
  cropper.value.changeScale(num)
}
// 向左旋转
function rotateLeft () {
  cropper.value.rotateLeft()
}
// 向右旋转
function rotateRight () {
  cropper.value.rotateRight()
}
function uploadImg(type) {
  cropper.value.getCropBlob(data => {
    // console.log('data ===>>>>', data, data.size / 1024)
    emit('cropperDone', data)
  })
}
</script>

<style lang="scss" scoped>
.cropper-wrapper {
  .cropper-content {
    display: flex;
    display: -webkit-flex;
    justify-content: flex-end;
    -webkit-justify-content: flex-end;
    .cropper {
      width: 350px;
      height: 300px;
    }
    .show-preview {
      width: 300px;
      height: 300px;
      margin: 0 25px;
      align-items: center;
      display: flex;
      display: -webkit-flex;
      justify-content: center;
      -webkit-justify-content: center;
      flex: 1;
      -webkit-flex: 1;
      overflow: hidden;
      border: 1px solid #cccccc;
      background: rgba(0, 0, 0, .8);
      margin-left: 40px;
      .preview {
        overflow: hidden;
        border: 1px dashed #000;
        background: rgba(255, 255, 255, .9);
      }
    }
  }

  .footer-btn {
    margin-top: 30px;
    display: flex;
    display: -webkit-flex;
    justify-content: flex-end;
    -webkit-justify-content: flex-end;
    .scope-btn {
      /* width: 250px; */
      display: flex;
      display: -webkit-flex;
      justify-content: space-between;
      -webkit-justify-content: space-between;
    }
    .upload-btn {
      flex: 1;
      -webkit-flex: 1;
      display: flex;
      display: -webkit-flex;
      justify-content: center;
      -webkit-justify-content: center;
    }
  }
}
</style>
