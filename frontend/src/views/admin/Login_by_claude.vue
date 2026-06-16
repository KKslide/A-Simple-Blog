<template>
  <!--
    改动 1: 去掉 ref="loginRef", 改用 :class 绑定响应式变量
    原来是在 onMounted 里手动 classList.add('on-start', 'document-loaded')
    现在直接让 Vue 的响应式系统驱动 class 的增减
  -->
  <div id="loginWrapper" :class="{ 'on-start': isOnStart, 'document-loaded': isDocumentLoaded }">
    <main>
      <form class="form" @submit.prevent="submit">
        <div class="form__cover"></div>
        <div class="form__loader">
          <div class="spinner active">
            <svg class="spinner__circular" viewBox="25 25 50 50">
              <circle
                class="spinner__path"
                cx="50"
                cy="50"
                r="20"
                fill="none"
                stroke-width="4"
                stroke-miterlimit="10"
              />
            </svg>
          </div>
        </div>
        <div class="form__content">
          <h1 class="form__content_h1">Login</h1>

          <!--
            改动 2: .styled-input 的 filled class 用 :class 绑定, 替代手动 classList.add/remove
            改动 3: focus/blur 用 Vue 事件指令, 替代手动 addEventListener
          -->
          <div class="styled-input" :class="{ filled: usernameFilled }">
            <input
              type="text"
              class="styled-input__input"
              name="username"
              v-model="userForm.username"
              @focus="onInputFocus('username')"
              @blur="onInputBlur('username')"
            />
            <div class="styled-input__placeholder">
              <span class="styled-input__placeholder-text">
                <!--
                  改动 4: 原来是在 onMounted 里拼接 innerHTML 字符串注入 <span class="letter">
                  现在直接用 v-for 渲染, letter.active 驱动 active class
                -->
                <span
                  v-for="(letter, i) in usernameLetters"
                  :key="i"
                  class="letter"
                  :class="{ active: letter.active }"
                >{{ letter.char }}</span>
              </span>
            </div>
            <div class="styled-input__circle"></div>
          </div>

          <div class="styled-input" :class="{ filled: passwordFilled }">
            <input
              type="password"
              class="styled-input__input"
              name="password"
              v-model="userForm.password"
              @focus="onInputFocus('password')"
              @blur="onInputBlur('password')"
              @keyup.enter="submit"
            />
            <!-- 改动 5: @keydown="typing" + keyCode 判断 → 直接用 @keyup.enter 指令 -->
            <div class="styled-input__placeholder">
              <span class="styled-input__placeholder-text">
                <span
                  v-for="(letter, i) in passwordLetters"
                  :key="i"
                  class="letter"
                  :class="{ active: letter.active }"
                >{{ letter.char }}</span>
              </span>
            </div>
            <div class="styled-input__circle"></div>
          </div>

          <button type="button" class="styled-button" @click="submit">
            <span class="styled-button__real-text-holder">
              <span class="styled-button__real-text">Login</span>
              <span class="styled-button__moving-block face">
                <span class="styled-button__text-holder">
                  <span class="styled-button__text">Login</span>
                </span>
              </span>
              <span class="styled-button__moving-block back">
                <span class="styled-button__text-holder">
                  <span class="styled-button__text">Login</span>
                </span>
              </span>
            </span>
          </button>
          <button type="button" class="styled-button" @click="router.push({ name: 'home' })">
            <span class="styled-button__real-text-holder">
              <span class="styled-button__real-text">Home Page</span>
              <span class="styled-button__moving-block face">
                <span class="styled-button__text-holder">
                  <span class="styled-button__text">Home Page</span>
                </span>
              </span>
              <span class="styled-button__moving-block back">
                <span class="styled-button__text-holder">
                  <span class="styled-button__text">Home Page</span>
                </span>
              </span>
            </span>
          </button>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { md5 } from 'js-md5'
import { useRouter } from 'vue-router'
import { ref, reactive, onMounted } from 'vue'
import ServerAPI from '@/api/server'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/types/api'
import { useUserStore } from '@/stores/userStore'

// ---------- types ----------

interface UserForm {
  username: string
  password: string
}

// 每个字母的状态: 字符本身 + 是否处于 active 动画
interface LetterState {
  char: string
  active: boolean
}

type InputField = 'username' | 'password'

// ---------- store / router ----------

const UserStore = useUserStore()
const router = useRouter()

// ---------- 表单数据 ----------

const userForm = reactive<UserForm>({
  username: '',
  password: ''
})

// ---------- 页面入场动画 ----------
// 原来: onMounted 里手动 loginRef.value.classList.add('on-start', 'document-loaded')
// 现在: 响应式 ref + :class 绑定, Vue 自动处理 DOM 同步, onBeforeUnmount 也不再需要

const isOnStart = ref(false)
const isDocumentLoaded = ref(false)

onMounted(() => {
  isOnStart.value = true
  isDocumentLoaded.value = true
})

// ---------- Placeholder 字母逐个动画 ----------

function createLetters(text: string): LetterState[] {
  return text.split('').map(char => ({ char, active: false }))
}

const usernameLetters = ref<LetterState[]>(createLetters('Username'))
const passwordLetters = ref<LetterState[]>(createLetters('Password'))
const usernameFilled = ref(false)
const passwordFilled = ref(false)

// 用版本号防止快速 focus/blur 时旧 setTimeout 回调干扰当前动画
// (对应原来的 if (action && !contains || (!action && contains)) return 那段逻辑)
const animationVersion: Record<InputField, number> = { username: 0, password: 0 }

function animateLetters(field: InputField, activate: boolean): void {
  const letters = field === 'username' ? usernameLetters : passwordLetters
  const version = ++animationVersion[field]
  const len = letters.value.length

  // activate=true 正向, activate=false 反向 (对应原来的 lettersArray.reverse())
  const indices = Array.from({ length: len }, (_, i) => (activate ? i : len - 1 - i))

  indices.forEach((letterIdx, i) => {
    setTimeout(() => {
      // 版本号不匹配说明中途又触发了新动画, 丢弃这次回调
      if (animationVersion[field] !== version) return
      letters.value[letterIdx].active = activate
    }, 50 * i)
  })
}

function onInputFocus(field: InputField): void {
  if (field === 'username') usernameFilled.value = true
  else passwordFilled.value = true
  animateLetters(field, true)
}

function onInputBlur(field: InputField): void {
  const hasValue = field === 'username' ? !!userForm.username : !!userForm.password
  if (hasValue) return  // 有内容时 blur 不收起 placeholder
  if (field === 'username') usernameFilled.value = false
  else passwordFilled.value = false
  animateLetters(field, false)
}

// ---------- 登录提交 ----------
// 原来: .then() 链式调用, 现在改为 async/await, 更直观

async function submit(): Promise<void> {
  const { username, password } = userForm
  const res = await ServerAPI.userLogin({
    username,
    password: md5(password)
  }) as ApiResponse<{ userInfo: { id: number; username: string; is_admin: number } }>

  if (res.code === 1) {
    UserStore.setUserInfo({ ...res.data?.userInfo, login: true })
    ElMessage.success('登陆成功✌️')
    router.push({ name: 'dashboard' })
  } else {
    ElMessage.error(res.msg || '登录失败')
  }
}
</script>

<style lang="scss" scoped>
#loginWrapper {
  main {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #222;
    background-image: repeating-linear-gradient(
      to bottom,
      transparent 7px,
      rgba(0, 0, 0, 0.8) 9px,
      rgba(0, 0, 0, 0.8) 13px,
      transparent 13px
    );
  }

  .form {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 400px;
    height: 400px;
    flex-shrink: 0;
    padding: 20px;
    border-radius: 5px;
  }

  .form__loader {
    display: flex;
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    justify-content: center;
    align-items: center;
    z-index: -4;
    transition: all 0.5s ease;
  }

  .form__content {
    text-align: center;
    display: flex;
    justify-content: center;
    flex-direction: column;
    position: relative;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.5s ease 0.7s;
  }

  .form__cover {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    z-index: -4;
    border-radius: 25px;
    overflow: hidden;
    transition: all 0.3s ease 0.8s;
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
  }

  .form__cover:after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    z-index: -4;
    border-radius: 50%;
    transition: all 1.5s ease 0.3s;
    transform: scale(0);
  }

  .form__cover:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    z-index: -5;
    border-radius: 50%;
    transition: all 0.5s ease;
    transform: scale(0);
  }

  &.on-start .form__cover:before {
    transform: scale(0.15);
  }

  &.document-loaded .form__loader {
    transform: scale(0);
    opacity: 0;
    visibility: hidden;
  }

  &.document-loaded .form__content {
    opacity: 1;
    transform: none;
  }

  &.document-loaded .form__cover {
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  }

  &.document-loaded .form__cover:after {
    transform: scale(2);
  }

  &.document-loaded .form__cover:before {
    transition: opacity 0.3s ease 0.8s, transform 2s ease;
    transform: scale(2);
    opacity: 0;
  }

  h1.form__content_h1 {
    font-size: 40px;
    margin: 15px 0 20px 0;
    letter-spacing: 0.05em;
    color: #fff6a9;
    font-weight: 700;
    text-shadow: 0 0 5px #ffa500, 0 0 15px #ffa500, 0 0 20px #ffa500,
      0 0 40px #ffa500, 0 0 60px #ff0000, 0 0 10px #ff8d00, 0 0 98px #ff0000;
    animation: blink 5s infinite;
  }

  .styled-button {
    appearance: none;
    user-select: none;
    cursor: pointer;
    font-size: 14px;
    width: 100%;
    padding: 20px;
    outline: none;
    background: none;
    position: relative;
    color: #8b5dd1;
    border-radius: 3px;
    margin-bottom: 25px;
    border: none;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.1em;
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .styled-button__real-text-holder {
    position: relative;
  }

  .styled-button__real-text {
    color: transparent;
    display: inline-block;
  }

  .styled-button__text-holder {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }

  .styled-button__moving-block {
    transition: all 0.3s ease;
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  .styled-button__moving-block.back {
    color: white;
    transform: translateX(-100%);
  }

  .styled-button__moving-block.back .styled-button__text-holder {
    transform: translateX(100%);
  }

  .styled-button:hover,
  .styled-button:active {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    background-color: rgba(255, 255, 255, 0.2);
  }

  .styled-button:hover .face,
  .styled-button:active .face {
    transform: translateX(100%);
  }

  .styled-button:hover .face .styled-button__text-holder,
  .styled-button:active .face .styled-button__text-holder {
    transform: translateX(-100%);
  }

  .styled-button:hover .back,
  .styled-button:active .back {
    transform: translateX(0);
  }

  .styled-button:hover .back .styled-button__text-holder,
  .styled-button:active .back .styled-button__text-holder {
    transform: translateX(0);
  }

  .styled-button:active {
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  }

  .styled-input {
    width: 100%;
    position: relative;
    margin-bottom: 25px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    transition: all 0.3s ease;
  }

  .styled-input__circle {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: -2;
    overflow: hidden;
    border-radius: 3px;
  }

  .styled-input__circle:after {
    content: '';
    position: absolute;
    left: 16.5px;
    top: 19px;
    height: 14px;
    width: 14px;
    z-index: -2;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0);
    transition: opacity 1s ease, transform 0.6s ease;
  }

  .styled-input__input {
    width: 100%;
    appearance: none;
    font-size: 14px;
    outline: none;
    background: none;
    padding: 18px 15px;
    color: #ceafff;
    border: none;
    font-weight: 600;
    letter-spacing: 0.035em;
  }

  .styled-input__placeholder {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    z-index: -1;
    padding-left: 45px;
    color: white;
  }

  .styled-input__placeholder-text {
    perspective: 500px;
    display: inline-block;
  }

  .styled-input__placeholder-text :deep(.letter) {
    display: inline-block;
    vertical-align: middle;
    position: relative;
    animation: letterAnimOut 0.25s ease forwards;
  }

  .styled-input__placeholder-text :deep(.letter.active) {
    animation: letterAnimIn 0.25s ease forwards;
  }

  .styled-input:hover {
    border-color: rgba(255, 255, 255, 0.4);
  }

  .styled-input.filled {
    border-color: rgba(255, 255, 255, 0.2);
  }

  .styled-input.filled .styled-input__circle:after {
    transform: scale(37);
    opacity: 0;
  }

  @keyframes letterAnimIn {
    0% {
      transform: translate(0, 0);
    }
    25% {
      transform: translate(0, 10px);
      color: red;
    }
    45% {
      transform: translate(0, 10px);
      opacity: 0;
      color: red;
    }
    55% {
      transform: translate(0, 10px);
      opacity: 0;
    }
    56% {
      transform: translate(-30px, -27px);
      opacity: 0;
      color: #00ff6b;
    }
    76% {
      color: #00ff6b;
      opacity: 1;
      transform: translate(-30px, -27px);
    }
    100% {
      transform: translate(-30px, -27px);
      opacity: 1;
    }
  }

  @keyframes letterAnimOut {
    0% {
      transform: translate(-30px, -27px);
      opacity: 1;
    }
    25% {
      transform: translate(-30px, -40px);
      opacity: 0;
    }
    45% {
      transform: translate(0, 10px);
      opacity: 0;
    }
    55% {
      transform: translate(0, 10px);
      opacity: 0;
      color: red;
    }
    56% {
      transform: translate(0, 10px);
      color: red;
    }
    100% {
      transform: translate(0, 0);
    }
  }

  .spinner {
    position: relative;
    margin: auto;
    width: 50px;
    height: 50px;
    transition: all 0.2s ease 0s;
  }

  .spinner__circular {
    animation: rotate 1s linear infinite;
    animation-play-state: paused;
    transform-origin: center center;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    margin: auto;
  }

  .spinner__path {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
    animation: dash 0.6s ease forwards 0.5s;
    opacity: 0;
    stroke-linecap: round;
    stroke: #7b23ff;
    animation-play-state: running;
  }

  @keyframes dash {
    0% {
      stroke-dasharray: 1, 200;
      stroke-dashoffset: 0;
      opacity: 0;
    }
    50% {
      stroke-dasharray: 40, 200;
      opacity: 1;
    }
    100% {
      stroke-dasharray: 125, 200;
      opacity: 1;
    }
  }

  @keyframes blink {
    20%,
    24%,
    55% {
      color: #111;
      text-shadow: none;
    }
    0%,
    19%,
    21%,
    23%,
    25%,
    54%,
    56%,
    100% {
      text-shadow: 0 0 5px #ffa500, 0 0 15px #ffa500, 0 0 20px #ffa500,
        0 0 40px #ffa500, 0 0 60px #ff0000, 0 0 10px #ff8d00,
        0 0 98px #ff0000;
      color: #fff6a9;
    }
  }
}
</style>
