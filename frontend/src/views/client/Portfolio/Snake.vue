<template>
  <div id="map" ref="mapRef"></div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue"
import { ElMessageBox } from 'element-plus'
const util = {
  getRandom (n, m) {
    return Math.floor(Math.random() * (m - n) + n);
  },
};

const Direction = {
  TOP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3,
};

// === 食物类 ===
class Food {
  constructor(x, y, width, height, color, map) {
    this.x = x || 0;
    this.y = y || 0;
    this.width = width || 20;
    this.height = height || 20;
    this.color = color || "green";
    this.element = null;
    this.init(map);
  }
  init (map) {
    const maxX = map.clientWidth / this.width;
    const maxY = map.clientHeight / this.height;
    this.x = util.getRandom(0, maxX) * this.width;
    this.y = util.getRandom(0, maxY) * this.height;

    const el = document.createElement("div");
    el.style.width = this.width + "px";
    el.style.height = this.height + "px";
    el.style.background = this.color;
    el.style.position = "absolute";
    el.style.left = this.x + "px";
    el.style.top = this.y + "px";
    map.appendChild(el);

    this.element = el;
  }
  remove (map) {
    if (this.element) {
      map.removeChild(this.element);
      this.element = null;
    }
  }
}

// === 蛇类 ===
class Snake {
  constructor(width, height, direction, map) {
    this.width = width || 20;
    this.height = height || 20;
    this.direction = direction || Direction.RIGHT;
    this.body = [
      { x: 40, y: 0, color: "red" },
      { x: 20, y: 0, color: "skyblue" },
      { x: 0, y: 0, color: "skyblue" },
    ];
    this.element = [];
    this.map = map;
    this.init();
  }
  init () {
    this.body.forEach((part) => {
      this.setDom({
        width: this.width,
        height: this.height,
        color: part.color,
        x: part.x,
        y: part.y,
      });
    });
  }
  setDom (styleObj) {
    const div = document.createElement("div");
    div.className = "snake-body";
    div.style.width = styleObj.width + "px";
    div.style.height = styleObj.height + "px";
    div.style.backgroundColor = styleObj.color;
    div.style.position = "absolute";
    div.style.transition = "all .1s linear";
    div.style.left = styleObj.x + "px";
    div.style.top = styleObj.y + "px";
    this.map.appendChild(div);
    this.element.push(div);
  }
  move () {
    for (let i = this.body.length - 1; i > 0; i--) {
      const cur = this.body[i];
      const prev = this.body[i - 1];
      cur.x = prev.x;
      cur.y = prev.y;
      this.element[i].style.left = cur.x + "px";
      this.element[i].style.top = cur.y + "px";
    }
    switch (this.direction) {
      case Direction.TOP:
        this.body[0].y -= this.height;
        break;
      case Direction.RIGHT:
        this.body[0].x += this.width;
        break;
      case Direction.DOWN:
        this.body[0].y += this.height;
        break;
      case Direction.LEFT:
        this.body[0].x -= this.width;
        break;
    }
    this.element[0].style.left = this.body[0].x + "px";
    this.element[0].style.top = this.body[0].y + "px";
  }
  grow () {
    const last = this.body[this.body.length - 1];
    this.body.push({ ...last });
    this.setDom({
      width: this.width,
      height: this.height,
      color: "skyblue",
      x: last.x,
      y: last.y,
    });
  }
}

// === 游戏类 ===
class Game {
  constructor(map) {
    this.map = map;
    this.snake = new Snake(20, 20, Direction.RIGHT, map);
    this.food = new Food(0, 0, 20, 20, "green", map);
    this.animId = null;
    this.keyHandler = null;
    this.start();
    this.bindKey();
  }

  start () {
    let lastTime = 0;
    const interval = 200;
    const animate = (now) => {
      if (!lastTime) lastTime = now;
      if (now - lastTime >= interval) {
        this.snake.move();

        const head = this.snake.body[0];
        const eatSelf = this.snake.body
          .slice(1)
          .some((i) => i.x === head.x && i.y === head.y);
        const gameOver =
          head.x < 0 ||
          head.x > this.map.offsetWidth - this.food.width ||
          head.y < 0 ||
          head.y > this.map.offsetHeight - this.food.height ||
          eatSelf;

        if (gameOver) {
          alert("Game Over!");
          return;
        }

        if (head.x === this.food.x && head.y === this.food.y) {
          this.food.remove(this.map);
          this.snake.grow();
          this.food = new Food(0, 0, 20, 20, "green", this.map);
        }
        lastTime = now;
      }
      this.animId = requestAnimationFrame(animate);
    };
    this.animId = requestAnimationFrame(animate);
  }

  bindKey () {
    this.keyHandler = (e) => {
      switch (e.keyCode) {
        case 37:
          this.snake.direction = Direction.LEFT;
          break;
        case 38:
          this.snake.direction = Direction.TOP;
          break;
        case 39:
          this.snake.direction = Direction.RIGHT;
          break;
        case 40:
          this.snake.direction = Direction.DOWN;
          break;
      }
    };
    document.addEventListener("keydown", this.keyHandler);
  }

  destroy () {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.keyHandler) {
      document.removeEventListener("keydown", this.keyHandler);
      this.keyHandler = null;
    }
    // 清理地图内元素（蛇和食物）
    this.snake.element.forEach((el) => el.remove());
    if (this.food.element) {
      this.food.remove(this.map);
    }
  }
}

// === Vue3 生命周期 ===
const mapRef = ref(null);
let gameInstance = null;

onMounted(() => {
  ElMessageBox.alert('点击方向键的⬆️⬇️⬅️➡️就好了', '这是一个非常[prototype]的页面.. 勿喷🥹', {
    confirmButtonText: '开始贪吃蛇 🐍',
    callback: () => {
      gameInstance = new Game(mapRef.value);
    },
  })
});

onUnmounted(() => {
  if (gameInstance) {
    gameInstance.destroy();
    gameInstance = null;
  }
});
</script>

<style scoped>
#map {
  width: 800px;
  height: 600px;
  background-color: #333;
  margin: 0 auto;
  position: relative;
}

.snake-body:first-child {
  z-index: 1;
}
</style>
