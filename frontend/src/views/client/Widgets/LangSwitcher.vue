<template>
  <div>
    <div id="translate_bar" @click="switchLang">
      <span class="iconfont icon-fanyi ml-8 mr-3 fz-12"></span>
      <span class="text">{{ $t("lang") }}</span>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useLangStore } from '@/stores/langStore'
const langStore = useLangStore()
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()
function switchLang() {
  const lang = sessionStorage.getItem('lang')
  locale.value = lang == 'en' ? 'zh' : 'en'
  sessionStorage.setItem('lang', locale.value)
  langStore.setLang(locale.value)
}
onMounted(() => {
  var bar = document.getElementById('translate_bar');
  var barText = bar.children[1];
  var timer = null;
  timer = setTimeout(() => {
    bar.style.right = '-45px';
  }, 8000);
  bar.ontouchstart = function () {
    this.style.right = '3px';
    setTimeout(() => {
      bar.style.right = '-45px';
    }, 8000);
  }
  bar.onmouseover = function () {
    this.style.right = '3px';
  }
  bar.onmouseleave = function () {
    this.style.right = '-45px';
  }
  // barText.onclick = function () {
  //   localStorage.getItem('localeLanguage') == 'en' ? setup('zh') : setup('en');
  // }
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
