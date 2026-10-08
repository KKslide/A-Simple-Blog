<template>
  <div class="miku-stage">
    <!--
      手机外框：唱片机整套设计是按小程序 750rpx 宽做的，
      这里用一个手机比例的框把它装起来，等比缩放由 --rpx 变量统一控制。
    -->
    <div class="miku-phone">
      <div class="miku-screen">
        <div class="miku-scroll">
          <div class="miku-bg">
            <!--
              顶部动画区（原版 float-animation）
              - 雷达：APNG 动图，自带帧动画，无需 CSS
              - 6 个角色：c_0 体型最大、幅度更大（mainFloatUp），其余统一 floatUp
              整块绝对定位盖在背景 KV 区上，pointer-events: none 不挡交互
            -->
            <div class="miku-float" aria-hidden="true">
              <img
                class="miku-float__radar"
                src="https://jpuboss.janime.cn/6aaa4fac4a49e74c22e72175"
                alt=""
              />
              <img
                class="miku-float__char miku-float__char--c0"
                src="https://jpuboss.janime.cn/6aaa4fca4a49e74c22e72176"
                alt=""
              />
              <img
                class="miku-float__char miku-float__char--c1"
                src="https://jpuboss.janime.cn/6aaa4fde4a49e74c22e72177"
                alt=""
              />
              <img
                class="miku-float__char miku-float__char--c2"
                src="https://jpuboss.janime.cn/6aaa4feb4a49e74c22e72178"
                alt=""
              />
              <img
                class="miku-float__char miku-float__char--c3"
                src="https://jpuboss.janime.cn/6aaa4ff74a49e74c22e72179"
                alt=""
              />
              <img
                class="miku-float__char miku-float__char--c4"
                src="https://jpuboss.janime.cn/6aaa50034a49e74c22e7217a"
                alt=""
              />
              <img
                class="miku-float__char miku-float__char--c5"
                src="https://jpuboss.janime.cn/6aaa50114a49e74c22e7217b"
                alt=""
              />
            </div>

            <!-- 内容区：落在背景 KV 下方的留白里 -->
            <div class="miku-content">
              <!-- 唱片宫格 -->
              <div v-if="list.length" class="card-grid">
                <div
                  v-for="item in list"
                  :key="item.no"
                  class="music-card-item"
                  :class="{ 'music-card-item--picked': item.no === randomNo }"
                  role="button"
                  :aria-label="`播放 ${item.title}`"
                  @click="play(item)"
                >
                  <div class="music-card-item__art">
                    <img
                      v-if="item.cover"
                      class="music-card-image"
                      :src="item.cover"
                      :alt="item.title"
                      loading="lazy"
                    />
                    <img
                      v-if="item.disc"
                      class="music-card-disc"
                      :src="item.disc"
                      alt=""
                      loading="lazy"
                    />
                    <span class="music-card-play" aria-hidden="true"></span>
                  </div>

                  <div class="music-card-meta">
                    <p class="music-card-meta__title">
                      <span class="music-card-meta__no">{{ item.no }}</span>
                      {{ item.title }}
                    </p>
                    <p class="music-card-meta__artist">{{ item.artist }}</p>
                  </div>

                  <!-- 随机挑中的那张：给个标记，让「打开就推荐这首」看得见 -->
                  <span v-if="item.no === randomNo" class="music-card-picked">推荐</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 唱片机弹窗 -->
        <PreviewPopup :visible="popupVisible" :item="currentItem" :auto-play="true" @close="closePopup" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PreviewPopup from './components/PreviewPopup/PreviewPopup.vue'
import { musicList, pickRandomMusic, type MusicItem } from './data/music'

defineOptions({ name: 'MikuTurntable' })

/**
 * 曲库：静态配置，页面自包含、不依赖任何接口
 * （原本走 GET /api/user/music-player，现已去掉后端）
 */
const list = musicList

/**
 * 「打开页面就推荐」的那首：每次进页面随机挑一首
 *
 * 本页不在 KeepAlive 白名单里，每次进入都会重新 setup，所以每次都有新花样。
 * 原由后端下发 random_id，现改由前端自行产生。
 */
const randomNo = pickRandomMusic()?.no ?? ''

/** 弹窗显隐 */
const popupVisible = ref(false)
/** 当前播放的曲目 */
const currentItem = ref<MusicItem | null>(null)

/** 点卡片：把这首交给弹窗并起播 */
function play(item: MusicItem) {
  currentItem.value = item
  popupVisible.value = true
}

function closePopup() {
  popupVisible.value = false
}
</script>

<style scoped lang="scss">
@use './styles/units' as *;

.miku-stage {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 16px 80px;
  min-height: 60vh;
}

/*
 * 手机外框
 * container-type 让子元素可以用 cqw（容器宽度）来算 --rpx，
 * 于是整个唱片机随外框宽度等比缩放，比例永远和设计稿一致。
 */
.miku-phone {
  container-type: inline-size;
  /*
   * 手机比例固定 375:812（iPhone X，也正是「750rpx 设计宽」对应的经典机型）。
   * 宽度取三重约束里的最小值：
   *   375px                —— 设计上限，再宽就不像手机了
   *   100%                 —— 容器可用宽度
   *   (100vh - 220px) 换算  —— 关键约束：不让手机框长到压住站点 header/footer
   *
   * 220px = 站点 header(60) + footer(60) + 上下装饰边框(20) + 舞台上下留白(80)
   */
  width: min(375px, 100%, calc((100vh - 220px) * 375 / 812));
  aspect-ratio: 375 / 812;
  padding: 10px;
  box-sizing: border-box;
  border-radius: 36px;
  background: linear-gradient(160deg, #2b2b33 0%, #14141a 100%);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.35),
    inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.miku-screen {
  /* 1 设计单位 = 外框宽度 / 750，等价于小程序的 1rpx */
  --rpx: calc(100cqw / 750);

  position: relative;
  /*
   * 独立层叠上下文：弹窗遮罩的 z-index 只在手机内部参与比较，
   * 不会跑出去和站点 header/footer/装饰边框争层级
   */
  isolation: isolate;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 28px;
  background: #b5e7e7;
}

/*
 * 滚动容器：手机里不该出现桌面风格的滚动条，三条属性覆盖各浏览器
 * （Firefox / 旧 Edge / WebKit）
 */
.miku-scroll {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
}

/*
 * 整页背景
 *
 * 原版 .bg-hero 是一张 750×2730 的整页长图：顶部 KV（唱机 + 标题「回转乐章唱片机」）、
 * 中间大片留白（专门留给内容区）、底部一条声波收尾。
 *
 * 这里改用 background-image 而非 <img>：容器高度由内容撑开，
 * 图片只铺顶部 2730rpx，超出部分由同色底兜住 —— 内容比原设计长/短都不会露白。
 */
.miku-bg {
  position: relative;
  width: 100%;
  min-height: rpx(2730);
  /* 内容落在 KV 区下方的留白里（原版 .content 的 top: 1120rpx） */
  padding-top: rpx(1120);
  box-sizing: border-box;
  background-color: #b5e7e7;
  background-image: url('https://jpuboss.janime.cn/6aa9fc804a49e74c22e72172');
  background-repeat: no-repeat;
  background-position: center top;
  background-size: 100% auto;
}

/* ---------------------------- 顶部动画区 ---------------------------- */

/*
 * 原版 float-animation：一个 APNG 雷达 + 6 个漂浮角色，绝对定位盖在 KV 区上。
 * 尺寸与位置完全沿用原设计稿数值。
 */
.miku-float {
  position: absolute;
  top: 0;
  left: 0;
  width: rpx(750);
  height: rpx(920);
  /* 纯装饰层，不能挡住下面的卡片点击 */
  pointer-events: none;
  z-index: 1;

  /* 雷达：APNG 自带帧动画，不需要 CSS animation */
  &__radar {
    display: block;
    width: 100%;
    height: auto;
  }

  &__char {
    position: absolute;
    animation: floatUp 2s ease-in-out infinite;
  }

  /* c_0 是主体角色：体型最大，漂浮幅度也更大 */
  &__char--c0 {
    width: rpx(391);
    height: rpx(406);
    left: rpx(161);
    top: rpx(248);
    animation: mainFloatUp 2s ease-in-out infinite;
  }

  &__char--c1 {
    width: rpx(136);
    height: rpx(202);
    left: rpx(473);
    top: rpx(88);
  }

  &__char--c2 {
    width: rpx(155);
    height: rpx(167);
    left: rpx(582);
    top: rpx(476);
  }

  &__char--c3 {
    width: rpx(121);
    height: rpx(176);
    left: rpx(420);
    top: rpx(700);
  }

  &__char--c4 {
    width: rpx(129);
    height: rpx(213);
    left: rpx(49);
    top: rpx(586);
  }

  &__char--c5 {
    width: rpx(155);
    height: rpx(190);
    left: rpx(42);
    top: rpx(173);
  }
}

/* ---------------------------- 内容区 ---------------------------- */

.miku-content {
  position: relative;
  z-index: 2;
  padding: 0 rpx(30);
}

/* ---------------------------- 唱片宫格 ---------------------------- */

.card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: rpx(30) rpx(30);
  align-items: start;
  /* 左右留白由 .miku-content 统一给，这里只管上下 */
  padding: rpx(6) 0 rpx(60);
}

/*
 * 9 张按两列排，最后一张会孤零零占左半行，这里让它居中。
 * 只调整最后一张卡自身的占位：先让它横跨两列（grid-column: 1 / -1），
 * 再用 auto 外边距在整行内居中——grid 的列定义仍是 2 列，整体布局不变。
 */
.music-card-item:last-child:nth-child(odd) {
  grid-column: 1 / -1;
  margin-left: auto;
  margin-right: auto;
  width: rpx(330);
}

.music-card-item {
  position: relative;
  width: 100%;
  border-radius: rpx(16);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.55);
  box-shadow: 0 rpx(6) rpx(18) rgba(30, 90, 100, 0.12);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(rpx(-6));
    box-shadow: 0 rpx(12) rpx(26) rgba(30, 90, 100, 0.2);
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }

  /* 后端随机挑中的那张：描边高亮 */
  &--picked {
    box-shadow:
      0 0 0 rpx(4) #e881aa,
      0 rpx(8) rpx(22) rgba(232, 129, 170, 0.32);
  }
}

/* 卡片上半部分：立绘 + 唱片，构图沿用小程序（唱片压在图中央） */
.music-card-item__art {
  position: relative;
  width: 100%;
  height: rpx(250);
  overflow: hidden;
}

.music-card-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: rpx(16) rpx(16) 0 0;
}

.music-card-disc {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -43%);
  width: rpx(288);
  height: rpx(180);
  object-fit: contain;
  pointer-events: none;
}

/* 右下角小播放标记 */
.music-card-play {
  position: absolute;
  right: rpx(16);
  bottom: rpx(12);
  width: rpx(40);
  height: rpx(40);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 rpx(2) rpx(8) rgba(0, 0, 0, 0.18);

  &::after {
    content: '';
    position: absolute;
    left: 55%;
    top: 50%;
    transform: translate(-50%, -50%);
    border-style: solid;
    border-width: rpx(9) 0 rpx(9) rpx(15);
    border-color: transparent transparent transparent #e881aa;
  }
}

/* 卡片下半部分：曲目信息 */
.music-card-meta {
  padding: rpx(14) rpx(14) rpx(18);

  &__title {
    margin: 0;
    font-size: rpx(26);
    font-weight: 600;
    color: #1d4f57;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__no {
    display: inline-block;
    margin-right: rpx(8);
    font-size: rpx(22);
    font-weight: 400;
    color: #e881aa;
  }

  &__artist {
    margin: rpx(6) 0 0;
    font-size: rpx(22);
    color: #3d7f88;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.music-card-picked {
  position: absolute;
  left: 0;
  top: rpx(12);
  padding: rpx(4) rpx(14) rpx(4) rpx(12);
  border-radius: 0 rpx(999) rpx(999) 0;
  background: rgba(232, 129, 170, 0.94);
  color: #fff;
  font-size: rpx(20);
  line-height: 1.4;
  letter-spacing: rpx(1);
}

/* ---------------------------- 动画 ---------------------------- */

/*
 * 角色漂浮：两档幅度，c_0 是主体角色所以摆得更大
 *
 * 原版位移写的是 -16px / -24px（设计稿里混用了 px），换算到设计单位是 32rpx / 48rpx，
 * 这里统一成 rpx() 才能跟着手机框等比缩放。
 */
@keyframes floatUp {
  0% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(rpx(-32)) rotate(2deg);
  }

  100% {
    transform: translateY(0) rotate(0deg);
  }
}

@keyframes mainFloatUp {
  0% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(rpx(-48)) rotate(4deg);
  }

  100% {
    transform: translateY(0) rotate(0deg);
  }
}
</style>
