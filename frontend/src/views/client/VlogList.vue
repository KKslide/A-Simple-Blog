<template>
  <div id="vlog_list">
    <PageTitle :title="title" :desc="texts.pageIntro" />

    <el-row v-if="vlogList?.length">
      <el-col :span="18" :offset="3">
        <!-- 这里写一个窗口大小监听, 小过992时, type变为'' -->
        <el-carousel ref="videoCrs" :interval="2000" :autoplay="true" :type="carouselType" height="300px">
          <el-carousel-item v-for="item in vlogList.slice(0,4)" :key="item.id">
            <div :class="['vlog_item', `item-${item.id}`]" @mouseover="setHover(item.id, true)" @mouseout="setHover(item.id, false)" @click="checkContent(item.id)">
              <el-image :src="BaseUrl + item.minpic_url" style="height: 300px; width: 100%;" fit="cover" :lazy="true" loading="lazy"></el-image>
              <el-icon class="play_icon" size="80" color="rgba(255,255,255,.3)"><VideoPlay /></el-icon>
              <div class="v_i_info">
                <h3 class="v_i_title">{{ item.title }}</h3>
                <p class="v_i_desc">{{ item.description }}</p>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>

        <el-divider />
      </el-col>
    </el-row>

    <el-row v-if="vlogList?.length">
      <el-col :span="16" :offset="4">
        <el-row :gutter="10">
          <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8" v-for="item in vlogList.slice(4)" :key="item.id">
            <div :class="['vlog_item', 'list', `item-${item.id}`]" @mouseover="setHover(item.id, true)" @mouseout="setHover(item.id, false)" @click="checkContent(item.id)">
              <el-image :src="BaseUrl + item.minpic_url" fit="cover" style="height:200px; width: 100%;" :lazy="true" loading="lazy"></el-image>
              <el-icon class="play_icon" size="80" color="rgba(255,255,255,.3)"><VideoPlay /></el-icon>
              <div class="v_i_info">
                <h3 class="v_i_title">{{ item.title }}</h3>
                <p class="v_i_desc">{{ item.description }}</p>
              </div>
            </div>
          </el-col>
        </el-row>
        <el-divider />
      </el-col>
    </el-row>

    <el-row v-if="!vlogList?.length">
      <el-col :span="18" :offset="3">
        <el-divider></el-divider>
        <h1 class="text-center">
          {{ texts.noDataText }} 🥵
        </h1>
        <el-divider></el-divider>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="16" :offset="4">
        <div class="vlog_more">
          <p>{{ texts.desc_1 }}</p>
          <p>{{ texts.desc_2 }}</p>
          <p>👉 <a href="https://space.bilibili.com/334163601" target="_blank"><i class="iconfont icon-icon_bilibili"></i> {{ texts.Bilibili }}</a></p>
          <p>👉 <a href="https://www.youtube.com/@winghongLaw" target="_blank"><i class="iconfont icon-Youtube"></i> {{ texts.Youtube }}</a></p>
          <p>👉 <a href="https://v.douyin.com/YhjbfaOKDoU/" target="_blank"><i class="iconfont icon-douyin"></i> {{ texts.Douyin }}</a></p>
        </div>
      </el-col>
    </el-row>

  </div>
</template>

<script setup>
defineOptions({ name: 'vloglist' })
import { ref, watch, computed, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import ClientAPI from '@/api/client/index'
import utils from '@/utils'
import { storeToRefs } from 'pinia'
import { usePageStore } from '@/stores/pageStore'
const pageStore = usePageStore()
const { blogList } = storeToRefs(pageStore)
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const title = ref('Vlog')
const texts = computed(() => ({
  pageIntro: t('vlogList.pageIntro'),
  desc_1: t('vlogList.desc-1'),
  desc_2: t('vlogList.desc-2'),
  Bilibili: t('vlogList.Bilibili'),
  Youtube: t('vlogList.Youtube'),
  Douyin: t('vlogList.Douyin'),
  noDataText: t('logList.noData'),
}))
const vlogList = computed(() => blogList.value['Vlog'])
const BaseUrl = import.meta.env.VITE_MEDIA_URL
const threshold = 768
const carouselType = ref('card')
const videoCrs = ref(null)
const router = useRouter()
// 响应式设置 carouselType
const updateCarouselType = () => {
  carouselType.value = window.innerWidth < threshold ? '' : 'card'
}
const handleResize = utils.throttle(updateCarouselType, 200)
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
function setHover(id, flag) {
  const dom = document.querySelector(`.item-${id}`)
  const { classList } = dom
  flag ? classList.add('hovered') : classList.remove('hovered')
}
function checkContent(id) {
  router.push(`/content/${id}`)
}
function getList() {
  ClientAPI.getBlogList()
    .then(async res => {
      pageStore.setPage(res)
      await nextTick()
      updateCarouselType() // 初始化判断
      window.addEventListener('resize', handleResize)
  })
}
watch(
  () => pageStore.blogList,
  val => {
    if (!Object.keys(val).length) {
      getList()
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
#vlog_list {
  .vlog_item {
    height: 300px;
    position: relative;
    filter: contrast(130%) grayscale(70%);
    border-radius: 5px;
    overflow: hidden;
    transition: filter .1s;
    .play_icon {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%,-50%);
      z-index: 23;
    }
    .v_i_info {
      width: 100%;
      height: 40%;
      position: absolute;
      left: 0;
      bottom: 0;
      z-index: 23;
      text-align: center;
      background-color: rgba(255,255,255,.5);
      transition: bottom .2s;
      .v_i_title{
        font-size: 20px;
      }
      .v_i_desc {
        font-size: 15px;
      }
      h3,p{
        padding: 0 15px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    &.list {
      height: 200px;
      margin-bottom: 10px;
      cursor: pointer;
      overflow: hidden;
      .v_i_info{
        h3,p{
          margin: 8px 0;
        }
      }
    }
  }
  .vlog_item.hovered {
    filter:none;
    .v_i_info {
      bottom: -100%;
    }
  }
}
</style>
