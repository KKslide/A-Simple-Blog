<template>
  <div id="colorBG">
    <div id="img">
      <input type="color" id="color-selector" :value="color" @click.prevent>
      <img :src="picUrl">
    </div>
    <div class="colorPicker">
      选择一个颜色:
      <el-color-picker v-model="color" color-format="hex" @active-change="setColor" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const color=  ref('#f28c92')
const BaseUrl = import.meta.env.VITE_MEDIA_URL
const picUrl = BaseUrl + `/upload/upload_4ca907a03dc9832035f0af9422068a2a.JPG`
function setColor(str: string) {
  color.value = str
}
</script>

<style lang="scss" scoped>
#colorBG {

  img {
    height: 100%;
    width: 100%;
    object-fit: cover;
  }

  div#img {
    margin: 0 auto;
    position: relative;
    width: 300px;
    height: 360px;
    box-shadow: 3px 1px 4px 0 rgba(0, 0, 0, 0.2);
  }

  input {
    /* 去除input基础样式 */
    padding: 0;
    border: none;
    /* 使input标签在容器内占位100% */
    position: absolute;
    width: 100%;
    height: 100%;
    /* 调整色相模式 - http://www.cnblogs.com/coco1s/p/6829372.html */
    mix-blend-mode: hue;
  }

  .colorPicker {
    text-align: center;
    margin-top: 20px;
  }
}
</style>
