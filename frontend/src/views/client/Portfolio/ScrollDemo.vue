<template>
  <div id="scrollDemo" ref="dom">
    <nav>
      <ul>
        <li v-for="item in navs" :key="item.name">
          <a :href="`#${item.id}`" :class="{ 'active': curID == item.id }" @click.prevent="scroll(item.id)">
            {{ item.name }}
          </a>
        </li>
      </ul>
    </nav>
    <div class="main">
      <section v-for="item in navs" :key="item.id" :id="item.id">
        <h1>{{ item.name }}</h1>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
const dom = ref<HTMLDivElement>()
const curID = ref('one')
const navs = ref([
  { id: 'one', name: 'HTML' },
  { id: 'two', name: 'CSS' },
  { id: 'three', name: 'JavaScript' },
])
function scroll (id: string) {
  curID.value = id
  document.getElementById(id)?.scrollIntoView({
    behavior: 'smooth'
  })
}
onMounted(() => {
  ElMessageBox.alert('', '禁止掉滚动事件了.. 🥹点击nav就好', {
    confirmButtonText: '试试看🥵',
    callback: () => {
      dom.value!.addEventListener('wheel', function (e: WheelEvent) {
        e.stopPropagation(); // 阻止事件冒泡
        e.preventDefault();  // 阻止滚动
      }, { passive: false });
    },
  })
})
</script>

<style lang="scss" scoped>
#scrollDemo {
  position: relative;

  nav {
    width: 400px;
    height: 50px;
    border-radius: 5px;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);

    ul {
      margin: 0;
      padding: 0;
      list-style: none;
      display: flex;
      border-bottom-left-radius: 5px;
      border-bottom-right-radius: 5px;
      background-color: #333;

      li {
        width: 33.333%;
        height: 100%;
        line-height: 50px;
        text-align: center;
        color: #fff;

        a {
          display: block;
          width: 100%;
          height: 100%;
          cursor: pointer;
          &.active {
            background-color: #000;
          }
        }
      }
    }
  }

  .main {
    width: 100%;
    height: 60vh;
    overflow: scroll;

    section {
      width: 100%;
      height: 100%;
      text-align: center;
      line-height: 600px;

      h1 {
        color: #fff;
        font-size: 50px;
        margin: 0;
      }
    }

    #one {
      background-color: #e24f1d;
    }

    #two {
      background-color: #0869ad;
    }

    #three {
      background-color: #dc9a0d;
    }
  }
}
</style>
