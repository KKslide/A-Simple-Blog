<template>
  <div id="sticker" ref="StickerRef" v-show="screen.width <= 768 || demoMode" :style="stickerStyle"
    @touchstart.prevent="startHandler" @touchmove.prevent="moveHandler" @touchend.prevent="endHandler"
    @mousedown.prevent="startHandler"
  >
    <div class="sticker_content">
      <span class="cate_name" @touchend.stop="setCollapse(false, $event)" @click.stop="isCollapsed=false">{{ cateName }}</span>
      <div :class="['cate_nav', { 'collapsed': isCollapsed }]" v-if="props.cateList">
        <ul ref="cateNavRef" v-show="!isDragging||demoMode">
          <li @touchend.stop="emitSwitch(null, $event)" @click.stop="$emit('switch', null)">
            All
            <el-icon v-if="!curCat" color="#fff" size="15">
              <View />
            </el-icon>
          </li>
          <li v-for="item in props.cateList" :key="item.id" @touchend.stop="emitSwitch(item, $event)" @click.stop="$emit('switch', item)">
            {{ item.name }}
            <el-icon v-if="item.name == curCat" color="#fff" size="15">
              <View />
            </el-icon>
          </li>
          <li @touchend.stop="setCollapse(true, $event)" @click.stop="isCollapsed=true">
            >>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import utils from '@/utils'

interface Category {
  id: number;
  name: string;
  show_type?: string;
}

interface Position {
  x: number | string;
  y: number | string;
}

interface ScreenSize {
  width: number;
  height: number;
}

interface TouchPosition {
  D2Right: number;
  D2Top: number;
}

const StickerRef = ref<HTMLElement | null>(null)
const cateNavRef = ref<HTMLElement | null>(null)
const canDrag = ref<boolean>(true)
const isDragging = ref<boolean>(false)
const isCollapsed = ref<boolean>(false)

const props = defineProps<{
  cateList?: Category[];
  curCat?: string;
  demoMode?: boolean;
}>()

const emit = defineEmits<{
  (e: 'switch', category: Category | null): void;
}>()

const pos = reactive<Position>({ x: 10, y: 200 })
const screen = reactive<ScreenSize>({ width: 0, height: 0 })
const touchPos = reactive<TouchPosition>({ D2Right: 0, D2Top: 0 })

const cateName = computed(() => {
  // 新增一个demoMode
  if (props.demoMode) {
    if (isDragging.value) {
      return '😣 放开我~'
    }
    return '🥶 拖拽我'
  }
  return isDragging.value ? '😣 放开我~' : isCollapsed.value ? '<<' : '↕️ Category'
})

const stickerStyle = computed(() => {
  const style: Record<string, string> = {
    right: `${pos.x}px`,
    top: `${pos.y}px`,
    borderRadius: isDragging.value ? '15px' : '15px 0 0 15px'
  }
  // 新增一个demoMode
  if (props.demoMode) {
    style.position = 'absolute'
    style.right = isDragging.value ? `${pos.x}px` : '-1px'
  }
  return style
})

const minY = ref<number>(0)

watch(() => props.cateList,
  async () => {
    await nextTick()
    const { height } = screen
    const stickerHeight = StickerRef.value?.offsetHeight ?? 0
    const ulHeight = cateNavRef.value?.offsetHeight ?? 0
    minY.value = height - (stickerHeight + ulHeight + 20)
  },
  { immediate: true }
)

watch(isCollapsed, (boo) => {
  const ulHeight = cateNavRef.value?.offsetHeight ?? 0
  if (!boo) {
    minY.value -= ulHeight
  } else {
    minY.value += ulHeight
  }
})

function startHandler (e: MouseEvent | TouchEvent) {
  const isTouch = e.type.startsWith('touch')
  const _target = isTouch ? (e as TouchEvent).touches[0] : (e as MouseEvent)
  if (!_target) return
  const { clientX, clientY } = _target

  if (StickerRef.value) {
    const { offsetLeft, offsetTop, offsetWidth } = StickerRef.value
    const elAtPoint = document.elementFromPoint(clientX, clientY)
    const _D2right = offsetWidth - (clientX - offsetLeft)
    const _D2Top = clientY - offsetTop
    console.log(`触摸点离sticker右侧:${_D2right}`, '|', `离顶部:${_D2Top}`)
    touchPos.D2Right = _D2right
    touchPos.D2Top = _D2Top

    const catNavEl = StickerRef.value.querySelector('.cate_nav')
    if (catNavEl && elAtPoint && catNavEl.contains(elAtPoint)) {
      canDrag.value = false
    }
  }

  if (!isTouch) {
    document.addEventListener('mousemove', moveHandler)
    document.addEventListener('mouseup', endHandler)
  }
}

function moveHandler (e: MouseEvent | TouchEvent) {
  if (!canDrag.value) return
  isDragging.value = true
  const isTouch = e.type.startsWith('touch')
  const _target = isTouch ? (e as TouchEvent).touches[0] : (e as MouseEvent)
  if (!_target) return
  const { clientX, clientY } = _target
  const x = (screen.width - clientX - touchPos.D2Right).toFixed(3)
  let y = clientY - touchPos.D2Top
  if (y < 0) {
    y = 10
  }
  else if (y >= (screen.height - 70)) {
    y = screen.height - 70
  }
  else {
    y = Number(y.toFixed(3))
  }
  Object.assign(pos, { x, y })
}

async function endHandler (e: MouseEvent | TouchEvent) {
  await nextTick()
  // console.log('touch end~~~', isCollapsed.value);
  const x = 10
  const y = Number(pos.y) >= minY.value ? minY.value : Number(pos.y)
  isDragging.value = false
  canDrag.value = true
  Object.assign(pos, { x, y })
  Object.assign(touchPos, { D2Right: 0, D2Top: 0 })
  if (!e.type.startsWith('touch')) {
    document.removeEventListener('mousemove', moveHandler)
    document.removeEventListener('mouseup', endHandler)
  }
}

function isOnTarget (e: TouchEvent) {
  const touch = e.changedTouches[0]
  if (!touch) return false
  const { clientX, clientY } = touch
  // 当前触摸点下的元素
  const elAtPoint = document.elementFromPoint(clientX, clientY)
  // 当前 sticker 元素
  return e.target && elAtPoint && (e.target as Element).contains(elAtPoint)
}

function setCollapse (boo: boolean, e: MouseEvent | TouchEvent) {
  if (e.type.startsWith('touch')) {
    if (isOnTarget(e as TouchEvent)) {
      if (boo) {
        isCollapsed.value = boo
      }
      else {
        if (cateName.value === '<<') {
          isCollapsed.value = boo
        }
      }
    }
  }
  endHandler(e)
}

function emitSwitch (obj: Category | null, e: MouseEvent | TouchEvent) {
  if (e.type.startsWith('touch')) {
    if (isOnTarget(e as TouchEvent)) {
      emit('switch', obj)
    }
  }
  canDrag.value = true
}

const setScreenData = function () {
  const element = props.demoMode
    ? document.querySelector('#stickerDemo')
    : document.documentElement

  if (element) {
    const { clientWidth, clientHeight } = element
    Object.assign(screen, { width: clientWidth, height: clientHeight })
  }
}

const handleResize = utils._debounce(setScreenData, 200)

onMounted(() => {
  setScreenData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
#sticker {
  // width: 50px;
  height: 30px;
  line-height: 30px;
  border-radius: 15px 0 0 15px;
  background-color: rgba(0, 0, 0, .5);
  position: fixed;
  z-index: 23;

  .sticker_content {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;

    .cate_name {
      color: #fff;
      padding: 0 5px 0 8px;
      white-space: nowrap;
      height: 100%;
      cursor: grab;

      &.el-icon {
        height: 100%;
      }
    }

    .cate_nav {
      position: absolute;
      left: 10px;
      top: 35px;
      width: 100%;
      transition: left .2s;

      &.collapsed {
        left: 200px;
      }

      ul {
        margin: 0;
        padding: 10px 0 10px 10px;
        background-color: rgba(0, 0, 0, .4);
        border-radius: 5px;

        li {
          list-style-type: none;
          color: #fff;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          padding: 3px 0;
          cursor: pointer;

          &:last-child {
            margin-bottom: 0;
          }

          i.el-icon {
            margin-left: 3px;
          }
        }
      }
    }
  }
}
</style>
