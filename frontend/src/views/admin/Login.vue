<template>
  <div id="loginWrapper" ref="loginRef">
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
          <div class="styled-input">
            <input
              type="text"
              class="styled-input__input"
              name="username"
              v-model="userForm.username"
            />
            <div class="styled-input__placeholder">
              <span class="styled-input__placeholder-text">Username</span>
            </div>
            <div class="styled-input__circle"></div>
          </div>
          <div class="styled-input">
            <input
              type="password"
              class="styled-input__input"
              name="password"
              v-model="userForm.password"
              @keydown="typing"
            />
            <div class="styled-input__placeholder">
              <span class="styled-input__placeholder-text">Password</span>
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
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import ServerAPI from '@/api/server'
import { ElMessage } from 'element-plus'
import type { LoginResponse } from '@/types/api'
import { useUserStore } from '@/stores/userStore'

interface UserForm {
  username: string
  password: string
}

const UserStore = useUserStore()
const userForm = reactive<UserForm>({
  username: '',
  password: ''
})

const loginRef = ref<HTMLElement | null>(null)
const router = useRouter()

onMounted(() => {
  if (!loginRef.value) return

  const placeholders = loginRef.value.querySelectorAll('.styled-input__placeholder-text')
  const inputs = loginRef.value.querySelectorAll('.styled-input__input')

  function placeholderAnimationIn(parent: Element, action: boolean) {
    const act = action ? 'add' : 'remove'
    const letters = parent.querySelectorAll('.letter')
    const lettersArray = Array.from(letters)
    if (!action) lettersArray.reverse()

    lettersArray.forEach((el, i) => {
      setTimeout(() => {
        const contains = parent.classList.contains('filled')
        if (action && !contains || (!action && contains)) return
        el.classList[act]('active')
      }, 50 * i)
    })
  }

  placeholders.forEach((el) => {
    const value = el.textContent || ''
    let html = ''
    for (const w of value) {
      const char = w || '&nbsp;'
      html += `<span class="letter">${char}</span>`
    }
    el.innerHTML = html
  })

  inputs.forEach((el) => {
    const parent = el.parentNode as Element
    el.addEventListener('focus', () => {
      parent.classList.add('filled')
      placeholderAnimationIn(parent, true)
    }, false)
    el.addEventListener('blur', () => {
      if ((el as HTMLInputElement).value.length) return
      parent.classList.remove('filled')
      placeholderAnimationIn(parent, false)
    }, false)
  })

  loginRef.value.classList.add('on-start')
  loginRef.value.classList.add('document-loaded')
})

onBeforeUnmount(() => {
  if (loginRef.value) {
  loginRef.value.classList.remove('on-start', 'document-loaded')
  }
})

function submit() {
  const { username, password } = userForm
  ServerAPI.userLogin({ username, password: md5(password) })
    .then((res: LoginResponse) => {
      if (res.code === 1) {
        UserStore.setUserInfo({ ...res.userInfo, login: true })
        ElMessage.success('登陆成功✌️')
        router.push({ name: 'dashboard' })
      } else {
        ElMessage.error(res.msg || '登录失败')
      }
    })
}

function typing(e: KeyboardEvent) {
  if (e.keyCode === 13) {
    submit()
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
