<template>
  <div id="loginWrapper" :class="{ 'on-start': isStarted, 'document-loaded': isLoaded }">
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
          
          <div class="styled-input" :class="{ filled: isUsernameActive }">
            <input
              type="text"
              class="styled-input__input"
              name="username"
              v-model="userForm.username"
              @focus="usernameFocused = true"
              @blur="usernameFocused = false"
            />
            <div class="styled-input__placeholder">
              <span class="styled-input__placeholder-text">
                <span
                  v-for="(char, i) in 'Username'"
                  :key="`user-${i}`"
                  class="letter"
                  :class="{ active: isUsernameActive }"
                  :style="{ animationDelay: `${isUsernameActive ? i * 50 : ('Username'.length - 1 - i) * 50}ms` }"
                >
                  {{ char }}
                </span>
              </span>
            </div>
            <div class="styled-input__circle"></div>
          </div>

          <div class="styled-input" :class="{ filled: isPasswordActive }">
            <input
              type="password"
              class="styled-input__input"
              name="password"
              v-model="userForm.password"
              @focus="passwordFocused = true"
              @blur="passwordFocused = false"
              @keyup.enter="submit" 
            />
            <div class="styled-input__placeholder">
              <span class="styled-input__placeholder-text">
                <span
                  v-for="(char, i) in 'Password'"
                  :key="`pass-${i}`"
                  class="letter"
                  :class="{ active: isPasswordActive }"
                  :style="{ animationDelay: `${isPasswordActive ? i * 50 : ('Password'.length - 1 - i) * 50}ms` }"
                >
                  {{ char }}
                </span>
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
import { ref, reactive, computed, onMounted } from 'vue'
import ServerAPI from '@/api/server'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/types/api'
import { useUserStore } from '@/stores/userStore'

interface UserForm {
  username: string
  password: string
}

const UserStore = useUserStore()
const router = useRouter()

const userForm = reactive<UserForm>({
  username: '',
  password: ''
})

// 控制页面初始动画状态
const isStarted = ref(false)
const isLoaded = ref(false)

// 独立控制焦点状态
const usernameFocused = ref(false)
const passwordFocused = ref(false)

// 计算属性: 判断输入框是否应该处于 active 状态 (如果有焦点或者已经输入了内容)
const isUsernameActive = computed(() => usernameFocused.value || userForm.username.length > 0)
const isPasswordActive = computed(() => passwordFocused.value || userForm.password.length > 0)

onMounted(() => {
  // 直接更新响应式数据, 模板的 :class 会自动响应
  isStarted.value = true
  isLoaded.value = true
})

function submit() {
  const { username, password } = userForm
  if (!username || !password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  
  ServerAPI.userLogin({ username, password: md5(password) })
    .then((res: ApiResponse<{ userInfo: { id: number; username: string; is_admin: number } }>) => {
      if (res.code === 1) {
        UserStore.setUserInfo({ ...res.data?.userInfo, login: true })
        ElMessage.success('登录成功✌️')
        router.push({ name: 'dashboard' })
      } else {
        ElMessage.error(res.msg || '登录失败')
      }
    })
}
</script>

<style lang="scss" scoped>
/* 样式部分几乎保持不变, 仅去除了 :deep(), 因为现在的 span 已经是模板内的静态节点了 */
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

  /* 去掉了 :deep(), 因为现在的 DOM 节点在 Vue 模板里是可见的 */
  .styled-input__placeholder-text .letter {
    display: inline-block;
    vertical-align: middle;
    position: relative;
    animation: letterAnimOut 0.25s ease forwards;
  }

  .styled-input__placeholder-text .letter.active {
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