<template>
  <div id="about_me">
    <PageTitle :title="'About Me'" />

    <div class="about_content">
      <el-row>
        <el-col :span="16" :offset="4">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
              <el-row>
                <el-col>
                  <div class="about_desc fe">
                    <h2>{{ part1Title }}</h2>
                    <div>{{ part1Content }}</div>
                  </div>
                </el-col>
                <el-col>
                  <div class="about_desc hobby">
                    <h2>{{ part2Title }}</h2>
                    <div>{{ part2Content }}</div>
                  </div>
                </el-col>
                <el-col>
                  <div class="about_desc next">
                    <h2>{{ part3Title }}</h2>
                    <div>{{ part3Content }}</div>
                  </div>
                </el-col>
              </el-row>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
              <div id="profil_img" ref="profilRef">
                <!-- old 默认显示, hover 淡出后露出底层的 young -->
                <img :src="oldImageSrc" class="img-responsive old" decoding="async" draggable="false" />
                <img :src="youngImageSrc" class="img-responsive young" decoding="async" draggable="false" />
              </div>
            </el-col>
            <el-divider></el-divider>
            <el-col>
              <el-button v-show="!isChecked" :type="''" @click="checkResume" >
                <span class="mr-3">My Resume</span>
                <el-icon><View /></el-icon>
              </el-button>
              <PdfViewer  v-show="isChecked" src="https://video.kangyouknowwho.space/Resume.pdf"/>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </div>

  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "AboutPage"
})
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import PdfViewer from './Widgets/PdfViewer.vue'
import { useI18n } from 'vue-i18n'

/** 两张人像图: old 在上层, young 在底层 */
const OLD_IMAGE = 'https://jpuboss.janime.cn/6a33bc8f6b58338796bae042'
const YOUNG_IMAGE = 'https://jpuboss.janime.cn/6a33bc9b6b58338796bae043'

const profilRef = ref<HTMLDivElement | null>(null)
/** 图片容器进入视口后, 两张图一起加载, 避免 hover 时缺图 */
const imagesVisible = ref(false)
let observer: IntersectionObserver | null = null

const oldImageSrc = computed(() => (imagesVisible.value ? OLD_IMAGE : undefined))
const youngImageSrc = computed(() => (imagesVisible.value ? YOUNG_IMAGE : undefined))

onMounted(() => {
  const el = profilRef.value
  if (!el) return

  // 提前 200px 加载
  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return
      imagesVisible.value = true
      observer?.disconnect()
      observer = null
    },
    { rootMargin: '200px' },
  )
  observer.observe(el)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
const { t } = useI18n()
const part1Title = computed(() => t('about.part1.title'))
const part1Content = computed(() => t('about.part1.content'))
const part2Title = computed(() => t('about.part2.title'))
const part2Content = computed(() => t('about.part2.content'))
const part3Title = computed(() => t('about.part3.title'))
const part3Content = computed(() => t('about.part3.content'))
const isChecked = ref(false)
async function checkResume() {
  isChecked.value = true
  await nextTick()
  const dom = document.querySelector('.pdf-viewer')
  dom!.scrollIntoView({ behavior: "smooth" })
}
</script>

<style lang="scss" scoped>
#about_me {
  .about_content {
    margin: 0 auto;
    .about_desc {
      div {
        line-height: 1.5;
      }
    }
    .about_desc.next {
      margin-bottom: 20px;
    }
  }

  #profil_img {
    position: relative;
    height: 100%;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 5px;
      user-select: none;
      -webkit-user-drag: none;
    }

    img.old {
      position: absolute;
      z-index: 2;
      transition: opacity .3s;
    }

    img.old:hover {
      opacity: 0;
    }

    img.young {
      z-index: 97;
    }

    img:not(.loading) {
      top: 0;
    }
  }
}
</style>
