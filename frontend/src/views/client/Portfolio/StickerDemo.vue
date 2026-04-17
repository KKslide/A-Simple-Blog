<template>
  <el-row>
    <el-col :span="12" :offset="6" :xs="{span:24, offset:0}">
      <div id="stickerDemo">
        <h3 class="desc">假设这是一部手机, 拖拽旁边这个小组件试试看~</h3>
        <Sticker :demo-mode="true" />
      </div>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import Sticker from '../Widgets/Sticker.vue';

</script>

<style lang="scss" scoped>
#stickerDemo {
  width: 368px;
  height: 600px;
  border-radius: 10px;
  border: 1px solid #000;
  margin: 0 auto;
  position: relative;
  .desc {
    padding: 50px;
    line-height: 1.5;
  }
}
</style>
