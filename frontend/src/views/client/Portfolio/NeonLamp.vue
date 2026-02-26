<template>
  <div class="neon-content">
    <div class="btnBox">
      <label class="button" for="btn">
        <input id="btn" type="checkbox" value="0" style="opacity: 0;" @click="switcher">
        <span class="switcher"></span>
      </label>
    </div>
    <h1 :class="{ 'lighted': turnOn }">Neon Lamp</h1>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const turnOn = ref(false)
function switcher () {
  turnOn.value = !turnOn.value
}
</script>

<style lang="scss" scoped>
$color-white: #FFFFFF;
$color-gray: rgb(129, 161, 194);
$color-green: #2ECC71;

.neon-content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
  position: relative;
  background: #222;
  background-image: repeating-linear-gradient(to bottom, transparent 7px, rgba(0, 0, 0, 0.8) 9px, rgba(0, 0, 0, 0.8) 13px, transparent 13px);

  /* 按钮样式开始 */
  .btnBox {
    position: absolute;
    top: 10%;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 50px;

    .button {
      display: block;
      height: 100%;
      border-radius: 50px;
      // border: 2px solid #fff;
      position: relative;

      .switcher {
        display: flex;
        align-items: center;
        background-color: $color-gray;
        top: 0;
        width: 100%;
        height: 100%;
        padding: 0 5px;
        transition: all .5s;
        border-radius: 50px;
        position: absolute;
        cursor: pointer;
        box-sizing: border-box;

        &::before {
          background: $color-white;
          content: '';
          width: 42px;
          height: 42px;
          transition: all 0.3s;
          border-radius: 25px;
          position: absolute;
        }
      }

    }

    .button>input:checked+.switcher {
      background: $color-green;
      transition: all .5s;
    }

    .button>input:checked+.switcher::before {
      transform: translateX(48px);
      transition: all .5s;
    }
  }

  /* 按钮样式结束 */

  h1 {
    font-size: calc(20px + 16vh);
    line-height: calc(20px + 16vh);
    color: #fff;
    font-family: sans-serif;
    text-align: center;
    transition: all .3s;
    cursor: default;
    user-select: none;
  }

  h1.lighted {
    animation: blink 3s forwards;
  }
}

@-webkit-keyframes blink {

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
    text-shadow: 0 0 5px #ffa500, 0 0 15px #ffa500, 0 0 20px #ffa500, 0 0 40px #ffa500, 0 0 60px #ff0000, 0 0 10px #ff8d00, 0 0 98px #ff0000;
    color: #fff6a9;
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
    text-shadow: 0 0 5px #ffa500, 0 0 15px #ffa500, 0 0 20px #ffa500, 0 0 40px #ffa500, 0 0 60px #ff0000, 0 0 10px #ff8d00, 0 0 98px #ff0000;
    color: #fff6a9;
  }
}
</style>
