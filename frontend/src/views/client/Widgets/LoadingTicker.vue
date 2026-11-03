<template>
  <div class="loading-mask" role="status" aria-live="polite" aria-label="Loading">
    <div class="word">
      <span
        v-for="(letter, index) in letters"
        :key="index"
        :class="{ done: letter.done }"
        :style="{ opacity: letter.opacity }"
      >{{ letter.display }}</span>
    </div>
    <div class="overlay" aria-hidden="true"></div>
  </div>
</template>

<script setup lang="ts">
/**
 * 文字 Loading 动画: 字符随机闪烁, 再逐个定型, 全部完成后短暂停留并循环.
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'

defineOptions({ name: 'LoadingTicker' })

const props = withDefaults(
  defineProps<{
    text?: string
    /** 每个字符定型前的闪烁轮数 */
    cycleCount?: number
  }>(),
  {
    text: 'LOADING...',
    cycleCount: 5,
  },
)

interface Letter {
  orig: string
  display: string
  done: boolean
  opacity: number
}

// 乱码字符池
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()-_=+{}|[]\\;\':"<>?,./`~'.split('')

function createLetters(text: string): Letter[] {
  return text.split('').map((char) => ({
    orig: char,
    display: '-',
    done: false,
    opacity: 1,
  }))
}

const letters = ref<Letter[]>(createLetters(props.text))

let rafId = 0
let resetTimer: ReturnType<typeof setTimeout> | null = null
let disposed = false

const state = {
  done: false,
  cycleCurrent: 0,
  letterCurrent: 0,
}

function getChar(): string {
  return CHARS[Math.floor(Math.random() * CHARS.length)]
}

function loop() {
  if (disposed) return

  const list = letters.value

  // 未定型的字符继续随机闪烁
  for (let i = state.letterCurrent; i < list.length; i++) {
    const letter = list[i]
    if (letter.orig !== ' ') {
      letter.display = getChar()
      letter.opacity = Math.random()
    }
  }

  // 闪烁 cycleCount 轮后, 定型下一个字符
  if (state.cycleCurrent < props.cycleCount) {
    state.cycleCurrent++
  } else if (state.letterCurrent < list.length) {
    const current = list[state.letterCurrent]
    if (current) {
      state.cycleCurrent = 0
      current.display = current.orig
      current.opacity = 1
      current.done = true
      state.letterCurrent++
    }
  } else {
    state.done = true
  }

  if (!state.done) {
    rafId = requestAnimationFrame(loop)
  } else {
    resetTimer = setTimeout(reset, 750)
  }
}

function reset() {
  if (disposed) return

  state.done = false
  state.cycleCurrent = 0
  state.letterCurrent = 0

  for (const letter of letters.value) {
    letter.display = letter.orig
    letter.done = false
    letter.opacity = 1
  }

  loop()
}

onMounted(() => {
  loop()
})

onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(rafId)
  if (resetTimer) {
    clearTimeout(resetTimer)
    resetTimer = null
  }
})
</script>

<style lang="scss" scoped>
.loading-mask {
  position: fixed;
  inset: 0;
  // 高于站点语言切换按钮 (9999)
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: radial-gradient(#222922, #000500);
  // 系统等宽字体, 需要时再换成 Source Code Pro
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  font-weight: 400;
}

.word {
  color: #fff;
  font-size: 2.5em;
  line-height: 2.5em;
  text-align: center;
  text-shadow:
    0 0 10px rgba(50, 255, 50, 0.5),
    0 0 5px rgba(100, 255, 100, 0.5);

  span {
    display: inline-block;
    transform: translateX(100%) scale(0.9);
    transition: transform 500ms;

    &.done {
      color: #6f6;
      transform: translateX(0) scale(1);
    }
  }
}

.overlay {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(transparent 0%, rgba(10, 16, 10, 0.5) 50%);
  background-size: 1000px 2px;
  pointer-events: none;
}
</style>
