<template>
  <div>
    <div
      ref="barRef"
      id="translate_bar"
      @click="switchLang"
      @touchstart="touchFn"
      @mouseover="msOverFn"
      @mouseleave="msLeaveFn"
    >
      <span class="iconfont icon-fanyi ml-8 mr-3 fz-12"></span>
      <span class="text">{{ $t("lang") }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLangStore } from '@/stores/langStore'
import { useI18n } from 'vue-i18n'
const langStore = useLangStore()
const { locale } = useI18n()
const barRef = ref()
const timer = ref(0);
function switchLang() {
  const lang = sessionStorage.getItem('lang')
  locale.value = lang == 'en' ? 'zh' : 'en'
  sessionStorage.setItem('lang', locale.value)
  langStore.setLang(locale.value)
}
function touchFn() {
  barRef.value.style.right = '3px';
  setTimeout(() => {
    barRef.value.style.right = '-45px';
  }, 8000);
}
function msOverFn() {
  barRef.value.style.right = '3px';
}
function msLeaveFn() {
  barRef.value.style.right = '-45px';
}
onMounted(() => {
  timer.value = setTimeout(() => {
    barRef.value.style.right = '-45px';
  }, 8000);
})
</script>

<style lang="scss" scoped>
#translate_bar {
  position: fixed;
  right: 3px;
  bottom: 25%;
  width: 75px;
  height: 25px;
  line-height: 25px;
  text-align: center;
  border: 1px solid #333;
  border-radius: 10px;
  z-index: 9999;
  background-color: #fff;
  transition: right 0.5s;
  display: flex;
  justify-content: flex-start;
  align-items: center;

  .el-icon{
    margin-left: 11px;
  }

  span {
    transform: translateX(4px);
    display: inline-block;
    height: 23px;
    padding: 0 3px 0 0;
  }
  span.text {
    font-size: 10px;
  }
}

#translate_bar:hover {
  cursor: pointer;
  right: 3px;
}
</style>
