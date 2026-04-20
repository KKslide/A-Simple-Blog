<template>
  <div class="display-wrapper">
    <!-- 进度条 -->
    <div class="processBar-container">
      <div class="accumulate-proccess">
        <div class="accumulate-proccess__track">
          <div class="proccess__bar" :style="{ height: `${progress}%` }"></div>
        </div>
      </div>
      <el-slider v-model="progress" />
    </div>

    <!-- 毛刺玻璃 + 模糊效果 + 梯形 -->
    <div class="blur-container">
      <div class="background-bar"></div>
      <div class="glass-button-wrapper">
        <img src="https://jpuboss.janime.cn/202603188Gt0eWHxyRYJ3wILcgFmQ8uIdlJxSBe1" class="button-bg-img"
          draggable="false" />
        <div class="button-text">6抽</div>
      </div>

      <div class="trapezoid-item">🥲</div>
    </div>

    <!-- 锯齿底部 + 保留换行符 + 选择顺序使用队列 -->
    <div class="jag-style-wrapper">
      <div class="some-list">
        <div class="some-item"></div>
        <div class="jagged-bottom"></div>
      </div>

      <el-input class="mt-20 mb-20" v-model="someText" type="textarea" />
      white-space: pre-wrap; // 保留换行符
      <el-divider />
      <div style="white-space: pre-wrap;" v-html="someText"></div>

      <el-divider />
      <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">
        Check all
      </el-checkbox>
      <el-checkbox-group v-model="checkedCities" @change="handleCheckedCitiesChange">
        <el-checkbox v-for="city in cities" :key="city" :label="city" :value="city">
          {{ city }}
        </el-checkbox>
      </el-checkbox-group>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { CheckboxValueType } from 'element-plus'

const progress = ref(33)
const someText = ref('')

const checkAll = ref(false)
const isIndeterminate = ref(true)
const checkedCities = ref(['Shanghai', 'Beijing'])
const cities = ['Shanghai', 'Beijing', 'Guangzhou', 'Shenzhen']

const handleCheckAllChange = (val: CheckboxValueType) => {
  checkedCities.value = val ? cities : []
  isIndeterminate.value = false
}
const handleCheckedCitiesChange = (value: CheckboxValueType[]) => {
  const checkedCount = value.length
  checkAll.value = checkedCount === cities.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < cities.length
}
</script>

<style lang="scss" scoped>
.display-wrapper {
  width: 100%;
  height: 60vh;
  display: flex;
  gap: 50px;

  // 进度条
  .processBar-container {
    width: 100px;
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;

    .accumulate-proccess {
      position: absolute;
      height: calc(100% - 64px);
      left: 36px;
      top: 50%;
      transform: translateY(-50%);

      &__track {
        width: 16px;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        border: 2px solid rgba(0, 0, 0, 0.7);
        overflow: hidden;

        .proccess__bar {
          width: 16px;
          // 这种进度条方案不够还原UI, 所以改用背景图的方式
          // background: repeating-linear-gradient(
          //   32deg,
          //   #ffffffb6 0px,
          //   #ffffffd0 3px,
          //   #7D9AFF 3px,
          //   #7D9AFF 7px
          // );
          background-image: url("https://jpuboss.janime.cn/20260323niIRnmOfUyt1Q1h9jqcIX7tGsdBUkGno");
          background-repeat: repeat;
          background-size: 16px;
          position: relative;

          &::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 16px;
            height: 100%;
            background: #7D9AFF;
            z-index: -1;
          }
        }
      }
    }
  }

  // 锯齿底部 + 保留换行符
  .jag-style-wrapper {
    width: 375px;

    // height: 100%;
    .some-list {
      background-color: skyblue;

      .some-item {
        height: 30px;
      }

      /* 底部锯齿 (利用径向渐变绘制半圆透明镂空) */
      .jagged-bottom {
        /* 背景必须是透明, 这样外层的 drop-shadow 才能穿透孔洞 */
        /* 高度可以稍微调小一点, 让半圆的比例更贴近截图 */
        height: 16px;
        background-color: transparent;

        /* 使用 calc 创造前后 0.5px 的过渡带 (总共 1px).
          这是前端实现平滑抗锯齿(Anti-aliasing)的关键, 能让圆弧边缘非常锐利干净.
          1. circle at 16px 16px: 圆心在 x=16, y=16(靠底边)
          2. 10px: 圆的半径. 直径为 20px
          3. calc(+/- 0.5px): 依然保留抗锯齿的平滑处理
        */
        background-image: radial-gradient(circle at 16px 16px,
            #fff calc(10px - 0.5px),
            skyblue calc(10px + 0.5px));

        /* 宽 36px, 高 16px.
          36(总宽) - 20(圆直径) = 16px 的间距!
        */
        background-size: 36px 16px;
        background-repeat: repeat-x;

        /* 必须居中平铺, 这样左右两边缘被裁切出的半圆才是绝对对称的 */
        background-position: 8px bottom;

        /* 适配最后一行是偶数行(浅色背景)的情况 */
        &.even-bg {
          background-image: radial-gradient(circle at 16px 16px,
              #fff calc(10px - 0.5px),
              skyblue calc(10px + 0.5px));
        }
      }
    }
  }

  // 毛刺玻璃 + 模糊效果
  .blur-container {
    position: relative;
    width: 240px;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f5f5f5;

    .background-bar {
      position: absolute;
      width: 40px;
      height: 100%;
      background: linear-gradient(to bottom, #99c0ff, #666);
      z-index: 1;
    }

    /* 核心毛玻璃容器 */
    .glass-button-wrapper {
      position: relative;
      width: 240px;
      /* 尺寸根据实际设计稿调整 */
      height: 240px;
      z-index: 10;

      /* 关键点 1: 必须设置为正圆, 否则模糊区域会变成方形 */
      border-radius: 50%;

      /* 关键点 2: 背景模糊滤镜 */
      backdrop-filter: blur(3px);
      -webkit-backdrop-filter: blur(3px);
      /* 兼容 iOS */

      /* 可选: 加一层极淡的半透明白色辅助提升玻璃质感 */
      background-color: rgba(255, 255, 255, 0.05);

      display: flex;
      justify-content: center;
      align-items: center;
    }

    .button-bg-img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      /* 图片层级在底层 */
    }

    .button-text {
      position: relative;
      z-index: 2;
      /* 文字层级在图片上方 */
      color: #ffffff;
      font-size: 60px;
      font-weight: bold;
    }
  }

  // 梯形
  .trapezoid-item {
    position: absolute;
    /* 直接贴合右下角即可 */
    right: 0;
    bottom: 0;
    width: 55px;
    height: 34px;
    line-height: 36px;
    text-align: center;
    text-indent: 8px;
    font-size: 20px;
    color: #ffffff;
    font-weight: 500;
    // box-sizing: border-box;
    // background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'%3E%3Cpolygon points='30,1 99,1 99,99 1,99' fill='%23000' fill-opacity='0.5' stroke='%23fff' stroke-opacity='0.8' stroke-width='1' vector-effect='non-scaling-stroke'/%3E%3C/svg%3E");
    // background-size: 100% 100%;
    /* 提升层级, 确保文字始终在最上层 */
    z-index: 1;
    pointer-events: none;
    transform: translateZ(0);
    backface-visibility: hidden;
    overflow: hidden;

    /* 将背景和边框逻辑全部剥离给伪元素 */
    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      /* 向右侧刻意延伸, 把右侧多余的斜边推到容器外部 */
      right: -20px;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);

      /* 只需要给顶部和左侧设置真实的 1px 边框 */
      border-top: 1px solid #fff;
      border-left: 1px solid #fff;

      /* 利用倾斜做出左侧的斜边 */
      transform: skewX(-25deg);
      /* 以左下角为基准点进行倾斜固定 */
      transform-origin: bottom left;
      /* 垫在文字下方 */
      z-index: -1;
      pointer-events: none;
      backface-visibility: hidden;
    }
  }

  /*
    在长页面动态渲染的时候, 会出现一些问题, 下面是一些解决方案:
      // 减少触摸滚动时的高亮/重绘抖动
      -webkit-tap-highlight-color: transparent;

      // 在滚动时固定合成层，降低首项闪动概率
      transform: translateZ(0);

      // 隐藏元素背面，避免不必要的绘制
      backface-visibility: hidden;
  */

}
</style>
