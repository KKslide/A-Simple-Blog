<template>
  <div id="map" ref="mapRef"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'

/* ================= 工具 ================= */

function getRandom(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min)
}

/* ================= 方向 ================= */

enum Direction {
  TOP,
  RIGHT,
  DOWN,
  LEFT
}

/* ================= 类型建模 ================= */

interface SnakePart {
  x: number
  y: number
  color: string
}

/* ================= 食物 ================= */

class Food {
  x = 0
  y = 0
  width: number
  height: number
  color: string
  element: HTMLDivElement | null = null
  map: HTMLDivElement

  constructor(width = 20, height = 20, color = 'green', map: HTMLDivElement) {
    this.width = width
    this.height = height
    this.color = color
    this.map = map
    this.init()
  }

  init() {
    const maxX = this.map.clientWidth / this.width
    const maxY = this.map.clientHeight / this.height

    this.x = getRandom(0, maxX) * this.width
    this.y = getRandom(0, maxY) * this.height

    const el = document.createElement('div')
    el.style.cssText = `
      position:absolute;
      width:${this.width}px;
      height:${this.height}px;
      background:${this.color};
      left:${this.x}px;
      top:${this.y}px;
    `
    this.map.appendChild(el)
    this.element = el
  }

  remove() {
    this.element?.remove()
    this.element = null
  }
}

/* ================= 蛇 ================= */

class Snake {
  width: number
  height: number
  direction: Direction
  body: SnakePart[]
  elements: HTMLDivElement[] = []
  map: HTMLDivElement

  constructor(map: HTMLDivElement, size = 20) {
    this.map = map
    this.width = size
    this.height = size
    this.direction = Direction.RIGHT

    this.body = [
      { x: 40, y: 0, color: 'red' },
      { x: 20, y: 0, color: 'skyblue' },
      { x: 0, y: 0, color: 'skyblue' }
    ]

    this.init()
  }

  init() {
    this.body.forEach(part => this.createDom(part))
  }

  createDom(part: SnakePart) {
    const div = document.createElement('div')
    div.className = 'snake-body'
    div.style.cssText = `
      position:absolute;
      transition:all .1s linear;
      width:${this.width}px;
      height:${this.height}px;
      background:${part.color};
      left:${part.x}px;
      top:${part.y}px;
    `
    this.map.appendChild(div)
    this.elements.push(div)
  }

  move() {
    for (let i = this.body.length - 1; i > 0; i--) {
      const currentPart = this.body[i]
      const prevPart = this.body[i - 1]
      const currentElement = this.elements[i]

      if (currentPart && prevPart && currentElement) {
        currentPart.x = prevPart.x
        currentPart.y = prevPart.y
        currentElement.style.left = `${currentPart.x}px`
        currentElement.style.top = `${currentPart.y}px`
      }
    }

    const head = this.body[0]
    const headElement = this.elements[0]

    if (head && headElement) {
      switch (this.direction) {
        case Direction.TOP:
          head.y -= this.height
          break
        case Direction.RIGHT:
          head.x += this.width
          break
        case Direction.DOWN:
          head.y += this.height
          break
        case Direction.LEFT:
          head.x -= this.width
          break
      }

      headElement.style.left = `${head.x}px`
      headElement.style.top = `${head.y}px`
    }
  }

  grow() {
    const lastIndex = this.body.length - 1
    const last = this.body[lastIndex]

    if (last) {
      const part = { ...last, color: 'skyblue' }
      this.body.push(part)
      this.createDom(part)
    }
  }
}

/* ================= 游戏 ================= */

class Game {
  map: HTMLDivElement
  snake: Snake
  food: Food
  animId: number | null = null
  keyHandler?: (e: KeyboardEvent) => void
  isGameOver: boolean = false

  constructor(map: HTMLDivElement) {
    this.map = map
    this.snake = new Snake(map)
    this.food = new Food(20, 20, 'green', map)
    this.start()
    this.bindKey()
  }

  start() {
    let last = 0
    const interval = 200

    const loop = (now: number) => {
      if (!last) last = now

      if (now - last >= interval) {
        this.update()
        last = now
      }

      if (!this.isGameOver) {
        this.animId = requestAnimationFrame(loop)
      }
    }

    this.animId = requestAnimationFrame(loop)
  }

  update() {
    this.snake.move()

    const head = this.snake.body[0]

    if (head) {
      const eatSelf = this.snake.body.slice(1).some(p => p.x === head.x && p.y === head.y)

      const out =
        head.x < 0 ||
        head.y < 0 ||
        head.x > this.map.clientWidth - this.food.width ||
        head.y > this.map.clientHeight - this.food.height ||
        eatSelf

      if (out) {
        ElMessage.error('Oops, Game Over!!')
        this.destroy()
        return
      }

      if (head.x === this.food.x && head.y === this.food.y) {
        this.food.remove()
        this.snake.grow()
        this.food = new Food(20, 20, 'green', this.map)
      }
    }
  }

  bindKey() {
    this.keyHandler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          this.snake.direction = Direction.LEFT
          break
        case 'ArrowUp':
          this.snake.direction = Direction.TOP
          break
        case 'ArrowRight':
          this.snake.direction = Direction.RIGHT
          break
        case 'ArrowDown':
          this.snake.direction = Direction.DOWN
          break
      }
    }

    document.addEventListener('keydown', this.keyHandler)
  }

  destroy() {
    this.isGameOver = true
    if (this.animId) cancelAnimationFrame(this.animId)
    if (this.keyHandler) document.removeEventListener('keydown', this.keyHandler)

    this.snake.elements.forEach(el => el.remove())
    this.food.remove()
  }
}

/* ================= Vue ================= */

const mapRef = ref<HTMLDivElement | null>(null)
let game: Game | null = null

onMounted(() => {
  ElMessageBox.alert('方向键控制', 'Prototype Snake', {
    confirmButtonText: '开始',
    callback: () => {
      if (mapRef.value) {
        game = new Game(mapRef.value)
      }
    }
  })
})

onUnmounted(() => {
  game?.destroy()
  game = null
})
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
