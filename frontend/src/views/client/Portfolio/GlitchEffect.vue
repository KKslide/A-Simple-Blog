<template>
    点击按钮打开/关闭 [Glitch] 效果
    <el-switch
      v-model="turnOn"
      inline-prompt
      active-text="开启"
      inactive-text="关闭"
      style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949;"
    />
  <div id="glitch-effect"></div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
const GlitchInstance = ref(null)
const turnOn = ref(false)
class Glitch {
  constructor(object) {
    const obj = object || {};
    this.xpos = obj.xpos || 0;
    this.ypos = obj.ypos || 0;
    this.wide = obj.wide || 0;
    this.high = obj.high || 0;
    this.colorChooser = obj.colorChooser || 0;
    this.colour = obj.colour || "";
    this.op = obj.op || 1;
    this.textSelection = obj.textSelection || 0;
    this.barNums = obj.barNums || 8;
    this.glitchInterval = null;
    this.textGlitchInterval = null;
    this.init(this.barNums);
    // this.start();
  }
  /**
   * 准备故障条纹和文字
   */
  init (nums) {
    /* 加入文字span标签 */
    const _text = document.createElement("span");
    _text.id = "text";
    _text.innerHTML = "Hello World_";
    document.querySelector("#glitch-effect").appendChild(_text);
    /* 加入10个条子 */
    Array.from(new Array(nums)).map((_, i) => {
      const glitchBar = document.createElement("div");
      glitchBar.id = "glith" + (i + 1);
      glitchBar.className = "glitchBar";
      document.querySelector("#glitch-effect").appendChild(glitchBar);
    });
  }
  /**
   * 随机颜色
   */
  randomGenerator () {
    this.xpos = Math.floor(Math.random() * 150) - 50;
    this.ypos = Math.floor(Math.random() * 100);
    this.wide = Math.floor(Math.random() * 1900 + 30);
    this.high = Math.floor(Math.random() * 20 + 1);
    this.colorChooser = Math.floor(Math.random() * 15);
    // 随机颜色
    switch (this.colorChooser) {
      case 0:
        this.colour = "#FFFFFF";
        break;
      case 1:
        this.colour = "#FFFFFF";
        break;
      case 2:
        this.colour = "#FFFFFF";
        break;
      case 3:
        this.colour = "#efd8d8";
        break;
      case 4:
        this.colour = "#9db1c1";
        break;
      case 5:
        this.colour = "#dfc9e1";
        break;
      case 6:
        this.colour = "#595959";
        break;
      case 7:
        this.colour = "#000000";
        break;
      case 8:
        this.colour = "#e2f4cb";
        break;
      case 9:
        this.colour = "#f4e4cb";
        break;
      case 10:
        this.colour = "#dfc1af";
        break;
      case 11:
        this.colour = "#b25773";
        break;
      case 12:
        this.colour = "#afd3b3";
        break;
      case 13:
        this.colour = "#fdffc9";
        break;
      case 14:
        this.colour = "#e5c9ff";
        break;
      default:
        break;
    }
    this.op = Math.random();
  }
  /**
   * glitch效果
   */
  glitch () {
    const glitchBars = document.querySelectorAll(".glitchBar");
    for (var i = 0; i < glitchBars.length; i++) {
      this.randomGenerator();
      glitchBars[i].style.width = this.wide + "px";
      glitchBars[i].style.height = this.high + "px";
      glitchBars[i].style.top = this.ypos + "%";
      glitchBars[i].style.left = this.xpos + "%";
      glitchBars[i].style.backgroundColor = this.colour;
      glitchBars[i].style.opacity = this.op;
    }
  }
  /**
   * glitch文字
   */
  textGlitch () {
    let t = 0;
    t = Math.random();
    if (t > 0.5) {
      this.textSelection = Math.floor(Math.random() * 6);
      let quote = "";
      switch (this.textSelection) {
        case 0:
          quote = "see?";
          break;
        case 1:
          quote = "H̟̘̻͊̀̑̄̆̄̍ͦͥe̴̫̒́ͩͭ̇͋ͭ̈́͞l̔ͨ̓ͯͥ̄̌͂̕͏̡͍͓͖̗̙l͖̖͇̫̘̮̼͎͙ͭ͊̀̂̉ͤ̉ͣȯ͉ͪ͒͋͐͗͢";
          break;
        case 2:
          quote = "RU5FTVk=";
          break;
        case 3:
          quote = "....";
          break;
        case 4:
          quote = "I SEE YOU";
          break;
        case 5:
          quote = "bye";
          break;
        default:
          quote = "null";
          break;
      }
      this.changeText(quote);
    }
  }
  /**
   * 更换文字和位置、颜色、大小等
   */
  changeText (str) {
    var texter = document.querySelector("#text");
    // var textObj = { x, y, o, tsize };
    texter.innerHTML = str;
    setTimeout(() => {
      this.setText(
        { x: true, o: true, tsize: true },
        texter,
        setTimeout(() => {
          this.setText(
            { x: true, o: true, y: true },
            texter,
            setTimeout(() => {
              texter.innerHTML = "[null_]";
              setTimeout(() => {
                this.setText(
                  { o: true, tsize: true, x: true, y: true },
                  texter,
                  setTimeout(() => {
                    texter.innerHTML = "[Hello World_]";
                    setTimeout(() => {
                      texter.style.opacity = 1;
                      texter.style.fontSize = "3em";
                      texter.style.top = "50%";
                      texter.style.left = "50%";
                    }, 150);
                  }, 125)
                );
              }, 100);
            }, 75)
          );
        }, 50)
      );
    }, 25);
  }
  /**
   * glitch文字样式设置
   */
  setText (textObj, texter) {
    if (textObj.o) texter.style.opacity = Math.random();
    if (textObj.tsize) texter.style.fontSize = Math.floor(Math.random() * 800) + 5 + "px";
    if (textObj.x) texter.style.left = Math.floor(Math.random() * 100.99999) + "%";
    if (textObj.y) texter.style.top = Math.floor(Math.random() * 100.99999) + "%";
  }
  /**
   * 开始glitch
   */
  start () {
    this.glitchInterval = setInterval(() => this.glitch(), 40);
    this.textGlitchInterval = setInterval(() => this.textGlitch(), 700);
  }
  stop () {
    clearInterval(this.glitchInterval)
    clearInterval(this.textGlitchInterval)
  }
}
watch(turnOn,
  (val) => {
    val ? GlitchInstance.value.start() : GlitchInstance.value.stop()
  }
)
onMounted(() => {
  GlitchInstance.value = new Glitch()
})
onBeforeUnmount(() => {
  GlitchInstance.value.stop()
  GlitchInstance.value = null
})
</script>

<style lang="scss" scoped>
#glitch-effect {
  height: 70vh;
  background-color: #1f1f1f;
  font-family: 'Ubuntu Mono', 'Arial', sans-serif;
  color: #CFCFCF;
  overflow-x: hidden;
  overflow-y: hidden;
  position: relative;

  :deep(#text) {
    font-size: 3em;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
  }

  :deep(div.glitchBar) {
    z-index: 100;
    position: absolute;
    background-color: #FFFFFF;
    width: 600px;
    height: 2px;
  }
}
</style>
