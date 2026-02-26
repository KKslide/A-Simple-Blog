<template>
  <div id="sticker" ref="StickerRef" v-show="screen.width <= 768 || demoMode" :style="stickerStyle"
    @touchstart.prevent="startHandler" @touchmove.prevent="moveHandler" @touchend.prevent="endHandler"
    @mousedown.prevent="startHandler"
  >
    <div class="sticker_content">
      <span class="cate_name" @touchend.stop="setCollapse(false, $event)" @click.stop="isCollapsed=false">{{ cateName }}</span>
      <div :class="['cate_nav', { 'collapsed': isCollapsed }]" v-if="props.cateList">
        <ul ref="cateNavRef" v-show="!isDragging||demoMode">
          <li @touchend.stop="emitSwitch({}, $event)" @click.stop="$emit('switch')">
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

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import utils from '@/utils'
const StickerRef = ref(null)
const cateNavRef = ref(null)
const canDrag = ref(true)
const isDragging = ref(false)
const isCollapsed = ref(false)
const props = defineProps(['cateList', 'curCat', 'demoMode'])
const emit = defineEmits(['switch'])
const pos = reactive({ x: 10, y: 200 })
const screen = reactive({ width: 0, height: 0 })
const touchPos = reactive({ D2Right: 0, D2Top: 0 })
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
const stickerStyle = computed({
  get: () => {
    let basicStyle = `right:${pos.x}px;top:${pos.y}px;border-radius:${isDragging.value ? '15px' : '15px 0 0 15px'};`
    // 新增一个demoMode
    if (props.demoMode) {
      basicStyle += 'position:absolute;'
      basicStyle += isDragging.value ? `right:${pos.x}px;` : 'right:-1px;'
    }
    return basicStyle
  }
})
const minY = ref(0)
watch(() => props.cateList,
  async () => {
    await nextTick()
    const { height } = screen
    const stickerHeight = StickerRef.value?.offsetHeight ?? 0
    const ulHeight = cateNavRef.value?.offsetHeight ?? 0
    minY.value = height - (stickerHeight + ulHeight + 20)
  },
  { immediate: true })
watch(isCollapsed, (boo) => {
  const ulHeight = cateNavRef.value?.offsetHeight ?? 0
  !boo ? minY.value -= ulHeight : minY.value += ulHeight
})
function startHandler (e) {
  const isTouch = e.type.startsWith('touch')
  const _target = isTouch ? e.touches[0] : e
  const { clientX, clientY } = _target
  const { offsetLeft, offsetTop, offsetWidth } = StickerRef.value
  const elAtPoint = document.elementFromPoint(clientX, clientY)
  const _D2right = offsetWidth - (clientX - offsetLeft)
  const _D2Top = clientY - offsetTop
  console.log(`触摸点离sticker右侧:${_D2right}`, '|', `离顶部:${_D2Top}`)
  touchPos.D2Right = _D2right
  touchPos.D2Top = _D2Top

  const catNavEl = StickerRef.value.querySelector('.cate_nav')
  if (catNavEl && catNavEl.contains(elAtPoint)) {
    canDrag.value = false
  }

  if (!isTouch) {
    document.addEventListener('mousemove', moveHandler)
    document.addEventListener('mouseup', endHandler)
  }
}
function moveHandler (e) {
  if (!canDrag.value) return
  isDragging.value = true
  const isTouch = e.type.startsWith('touch')
  const _target = isTouch ? e.touches[0] : e
  const { clientX, clientY } = _target
  let x = (screen.width - clientX - touchPos.D2Right).toFixed(3)
  let y = clientY - touchPos.D2Top
  if (y < 0) {
    y = 10
  }
  else if (y >= (screen.height - 70)) {
    y = screen.height - 70
  }
  else {
    y = y.toFixed(3)
  }
  Object.assign(pos, { x, y })
}
async function endHandler (e) {
  await nextTick()
  // console.log('touch end~~~', isCollapsed.value);
  let x = 10
  let y = Number(pos.y) >= minY.value ? minY.value : pos.y
  isDragging.value = false
  canDrag.value = true
  Object.assign(pos, { x, y })
  Object.assign(touchPos, { D2Right: 0, D2Top: 0 })
  if (!e.type.startsWith('touch')) {
    document.removeEventListener('mousemove', moveHandler)
    document.removeEventListener('mouseup', endHandler)
  }
}
function isOnTarget (e) {
  const touch = e.changedTouches[0]
  const { clientX, clientY } = touch
  // 当前触摸点下的元素
  const elAtPoint = document.elementFromPoint(clientX, clientY)
  // 当前 sticker 元素
  return e.target.contains(elAtPoint)
}
function setCollapse (boo, e) {
  if (isOnTarget(e)) {
    if (boo) {
      isCollapsed.value = boo
    }
    else {
      if (cateName.value == '<<') {
        isCollapsed.value = boo
      }
    }
  }
  endHandler()
}
function emitSwitch (obj, e) {
  if (isOnTarget(e)) {
    emit('switch', obj)
  }
  canDrag.value = true
}
const setSreenData = function () {
  const { clientWidth, clientHeight } = props.demoMode
    ? document.querySelector('#stickerDemo')
    : document.documentElement
  Object.assign(screen, { width: clientWidth, height: clientHeight })
}
const handleResize = utils._debounce(setSreenData, 200)
onMounted(() => {
  setSreenData()
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
