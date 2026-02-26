<template>
  <div id="page_title">
    <div class="page_title_txt">{{ title }}</div>
    <div v-if="desc" class="page_title_desc">{{ desc }}</div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
  desc: String
})
</script>

<style lang="scss" scoped>
#page_title{
  text-align: center;
  margin-bottom: 30px;
  .page_title_txt {
    display: inline-block;
    padding: 10px 30px;
    font-size: 30px;
    font-weight: bold;
    position: relative;
    margin-bottom: 15px;
    &::before,&::after{
      content: '';
      position: absolute;
      top:50%;
      transform: translateY(-50%);
      width: 1px;
      height: 20px;
      background-color: #000;
    }
    &::before{
      left: 0;
    }
    &::after {
      right: 0;
    }
  }
  // .page_title_desc {}
}
</style>
