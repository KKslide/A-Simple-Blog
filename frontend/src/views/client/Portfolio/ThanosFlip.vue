<template>
  <el-row>
    <el-col :span="16" :offset="4" :xs="{span:24, offset:0}">
      <el-row>
        <el-col :span="6" style="padding-top:100px;">
          <button class="btn">Try a Snap🫰</button>
        </el-col>
        <el-col :span="18">
          <div class="content">
            <div id="image">
              <img src="/src/assets/img/profil.jpg" width="400" />
            </div>
          </div>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import html2canvas from 'html2canvas'
import { onMounted } from 'vue'
/**
 * 按权重随机选择
 * @param {Array} items - 候选项
 * @param {Array<number>} weights - 对应的权重（数值越大，概率越高）
 * @returns {*} - 随机选中的元素
 */
function weightedRandom (items: number[], weights: number[]) {
  if (items.length !== weights.length) {
    throw new Error('items 和 weights 长度必须一致')
  }

  // 计算总权重
  const totalWeight = weights.reduce((sum, w) => sum + w, 0)

  // 生成一个 0 ~ totalWeight 之间的随机数
  let random = Math.random() * totalWeight

  // 按权重区间查找
  for (let i = 0; i < items.length; i++) {
    if (random < weights[i]!) {
      return items[i]
    }
    random -= weights[i]!
  }
}

/**
 * 生成指定范围的随机整数（包含 min 和 max）
 * @param {Object} options - 参数对象
 * @param {number} options.min - 最小值
 * @param {number} options.max - 最大值
 * @returns {number} - 随机整数
 */
function randomInteger ({ min = 0, max = 100 } = {}) {
  if (typeof min !== 'number' || typeof max !== 'number') {
    throw new Error('min 和 max 必须是数字')
  }
  if (max < min) {
    throw new Error('max 必须大于等于 min')
  }
  return Math.floor(Math.random() * (max - min + 1)) + min
}
let imageBox: HTMLDivElement, image: HTMLImageElement, btn: HTMLButtonElement
onMounted(() => {
  imageBox = document.querySelector("#image")!;
  image = document.querySelector("#image img")!;
  btn = document.querySelector(".btn")!;
  btn.onclick = function () {
    startAnimation();
  };
})
function startAnimation () {
  image.classList.remove("quickFade");
  snap(imageBox);
}
function weightedRandomDistrib (peak: number, count: number): number | undefined {
  const prob: number[] = [],
    seq: number[] = [];
  for (let i = 0; i < count; i++) {
    prob.push(Math.pow(count - Math.abs(peak - i), 6));
    seq.push(i);
  }
  return weightedRandom(seq, prob);
}
function animateTransform (elem: HTMLElement, sx: number, sy: number, angle: number, duration: number) {
  elem.animate(
    [
      { transform: "rotate(0) translate(0, 0)" },
      { transform: "rotate(" + angle + "deg) translate(" + sx + "px," + sy + "px)" }
    ],
    {
      duration: duration,
      easing: "ease-in"
    }
  );
}
function newCanvasFromImageData (imageDataArray: Uint8ClampedArray, w: number, h: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const tempCtx = canvas.getContext("2d")!;
  const imageData = new ImageData(w, h);
  imageData.data.set(imageDataArray);
  tempCtx.putImageData(imageData, 0, 0);

  return canvas;
}
const snap = (target: HTMLElement) => {
  html2canvas(target, {
    allowTaint: false,
    useCORS: true,
    backgroundColor: "transparent",
    scale: 1 // 强制缩放为1, 避免宽度变大
  })
    .then(canvas => {
      const canvasCount = 20;
      const ctx = canvas.getContext("2d")!;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixelArr = imageData.data;
      const data = imageData.data.slice(0).fill(0);
      const imageDataArray = Array.from({ length: canvasCount }, () => data.slice(0));

      for (let i = 0; i < pixelArr.length; i += 4) {
        const p = Math.floor(i / pixelArr.length * canvasCount);
        const index = weightedRandomDistrib(p, canvasCount) || 0;
        const a = imageDataArray[index];

        if (a) {
          a[i] = pixelArr[i] || 0;
          a[i + 1] = pixelArr[i + 1] || 0;
          a[i + 2] = pixelArr[i + 2] || 0;
          a[i + 3] = pixelArr[i + 3] || 0;
        }
      }

      for (let i = 0; i < canvasCount; i++) {
        const c = newCanvasFromImageData(
          imageDataArray[i] as Uint8ClampedArray,
          canvas.width,
          canvas.height
        );
        c.classList.add("dust");
        setTimeout(() => {
          animateTransform(
            c,
            200,
            -100,
            randomInteger({ min: -25, max: 25 }),
            2000
          );
          c.classList.add("blur");
          setTimeout(() => {
            c.remove();
          }, 2050);
        }, 70 * i);

        target.appendChild(c);
      }

      Array.from(target.querySelectorAll(":not(.dust)")).map(el => {
        el.classList.add("quickFade");
      });
    })
    .catch(function (error) {
      console.log(error);
    });
};

</script>

<style lang="scss" scoped>
.btn {
  font-size: 20px;
}
.content {
  width: 100%;
  position: relative;

  #image {
    display: inline-block;
    width: 400px;
    position: relative;
    padding-top: 100px;

    img {
      width: 400px;
      max-width: 100%;
      display: block;

      &.quickFade {
        animation: fadeout 1.0s linear forwards;
      }
    }

    :deep(.dust) {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      filter: blur(0.05em);
    }

    :deep(.blur) {
      animation: fadeblur 2s ease-in forwards;
    }
  }

  @keyframes fadeblur {
    0% {
      opacity: 1;
      filter: blur(0.05em);
    }

    80% {
      filter: blur(0.188em);
    }

    100% {
      opacity: 0;
    }
  }

  @keyframes fadeout {
    0% {
      opacity: 1;
    }

    100% {
      opacity: 0;
    }
  }
}
</style>
