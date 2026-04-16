<template>
  <div>
    <div id="logo_bg"></div>

    <el-row class="typing_hello_world">
      <el-col :span="18" :offset="3">
        <!-- typing文字 -->
        <div id="texting_content" class="text-content">
          <h1>
            <span v-text="$t('homepage.part1') + ','"></span>
            <br />
            <span id="typed-strings">
              <span v-text="$t('homepage.part2')"></span>
              <span v-text="$t('homepage.part3')"></span>
              <span v-text="$t('homepage.part4')"></span>
              <span v-text="$t('homepage.part5')"></span>
            </span>
            <span id="typed"></span>
          </h1>
        </div>
      </el-col>
    </el-row>

  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useLangStore } from '@/stores/langStore'
import Typed from 'typed.js'
import clientApi from '@/api/client/index'

defineOptions({
  name: 'HomePage',
})

let handleMouseMove, typer;
const typerConfig = ref({
  stringsElement: '#typed-strings',
  typeSpeed: 100,
  backSpeed: 20,
  loop: true,
  loopCount: Infinity,
})
const langStore = useLangStore()
onMounted(() => {
  typer = type()
  setMouseEffect()
  /* ******************** */
  // sendVisit()
})
onBeforeUnmount(() => {
  document.body.removeEventListener('mousemove', handleMouseMove);
  typer.destroy()
})
// async function sendVisit () {
//   return await clientApi.visit()
// }
function setMouseEffect() {
  const body = document.body;
  const bg = document.getElementById('logo_bg');
  const windowWidth = window.innerWidth / 5;
  const windowHeight = window.innerHeight / 5;

  handleMouseMove = (e) => {
    const mouseX = e.clientX / windowWidth;
    const mouseY = e.clientY / windowHeight;
    if (bg) {
      bg.style.transform = `translate3d(-${mouseX * 2}px, -${mouseY * 2}px, 0)`;
    }
  };

  body.addEventListener('mousemove', handleMouseMove);
}
function type () {
  return new Typed('#typed', typerConfig.value);
}
watch(
  () => langStore.currentLang,
  async () => {
    typer.destroy()
    await nextTick()
    typer = type()
  }
)
</script>

<style lang="scss" scoped>
#logo_bg {
  width: 100vw;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: -1;
  // background-image: url("@/assets/img/kk-mirror.jpeg");
  background-image: url("@/assets/img/gemini_space.png");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}

.typing_hello_world {
  width: 100%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

#texting_content {
  z-index: 1;
  color: #fff;
  text-shadow: 0 1px 3px #000;
  font-size: 2em;
  line-height: 1.5;
}
</style>
