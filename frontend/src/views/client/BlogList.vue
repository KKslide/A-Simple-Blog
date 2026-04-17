<template>
  <div id="blog_list">
    <PageTitle :title="texts.title" :desc="texts.desc" />

    <el-row>
      <el-col :span="16" :offset="4" :xs="{ span: 24, offset: 0 }">
        <!-- 置顶 -->
        <el-row v-show="blogList['TOP']?.length&&!activeId&&!isSearchPage">
          <el-col :xs="24" :sm="24" :md="20" :lg="20" :xl="20">
            <div class="top_list">
              <h4 class="mt-5 mb-10 pb-10">
                <span class="iconfont icon-zhiding mr-5"></span>
                <span>{{ texts.pin }}</span>
              </h4>
              <el-carousel
                ref="carouselRef"
                height="400px"
                type="card"
                arrow="always"
                :card-scale="0.95"
                :autoplay="false"
                @change="handleChange"
              >
                <el-carousel-item v-for="(item, index) in blogList['TOP']" :key="item.id" >
                  <div class="top_content" @click="handleItemClick(item.id, index)">
                    <el-image :src="item.cover_url.startsWith('http') ? item.cover_url : BaseUrl + item.cover_url" fit="cover" style="width: 100%; height: 100%;"></el-image>
                    <h4 class="top_title">{{ item.title }} >></h4>
                  </div>
                </el-carousel-item>
              </el-carousel>
            </div>
            <el-divider></el-divider>
          </el-col>
        </el-row>
        <!-- 列表 -->
        <el-row :gutter="10" v-if="!isEmptyList">
          <el-col class="blog_wrapper" :xs="24" :sm="24" :md="20" :lg="20" :xl="20"
            v-for="item in blogListKey" :key="item">
            <el-col :span="16" :push="3" :xs="{ span: 24, offset: 0, push: 0 }" v-for="sub_item in blogList[item]?.slice(0, blogListSliceNum)"
              :key="sub_item.id">
              <div class="blog_item">
                <div class="b_i_content">
                  <div class="b_i_c_title" @click="checkContent(sub_item.id)">{{ sub_item.title }}</div>
                  <div class="b_i_c_info">
                    <div class="info_icon view">
                      <el-icon size="14">
                        <View />
                      </el-icon>
                      <span>{{ sub_item.view_count }}</span>
                    </div>
                    <span class="split"></span>
                    <div class="info_icon comment">
                      <el-icon size="14">
                        <Comment />
                      </el-icon>
                      <span>{{ sub_item.comment_num }}</span>
                    </div>
                    <span class="split"></span>
                    <div class="info_icon time">
                      <el-icon size="14">
                        <Clock />
                      </el-icon>
                      <span>{{ dayjs(sub_item.created_at).format('YYYY-MM-DD') }}</span>
                    </div>
                    <span class="split"></span>
                    <div class="info_icon category">
                      <el-icon size="14">
                        <CollectionTag />
                      </el-icon>
                      <span>{{ sub_item.category }}</span>
                    </div>
                  </div>
                  <div class="b_i_c_desc">
                    <p>{{ sub_item.description }}</p>
                  </div>
                  <div class="b_i_c_img" @click="checkContent(sub_item.id)">
                    <el-image :src="sub_item.cover_url.startsWith('http') ? sub_item.cover_url : BaseUrl + sub_item.cover_url" fit="cover" style="width: 100%; height: 250px;"></el-image>
                  </div>
                  <div class="b_i_c_read" @click="checkContent(sub_item.id)">{{ texts.readText }} >></div>
                  <el-divider />
                </div>
              </div>
            </el-col>
            <div v-if="!blogList[item]?.length" class="text-center">
              {{ texts.noDataText }}
            </div>
            <div v-show="!activeId && !isSearchPage && blogList[item]?.length" class="blog_category_check" @click="checkCategory(categoryList.find(v=>v.name==item))">
              {{ texts.checkMore }}「{{ item }}」
            </div>
          </el-col>
        </el-row>
        <!-- 没有数据 -->
        <el-row :gutter="10" v-else>
          <el-col class="blog_wrapper" :xs="24" :sm="24" :md="20" :lg="20" :xl="20">
            <div class="blog_empty">{{ texts.noDataText }}</div>
          </el-col>
        </el-row>
      </el-col>
      <!-- 分类 -->
      <el-col :span="1" :xs="0" :sm="{ span: 2, pull: 0 }" :md="{ pull: 2 }">
        <div class="category_content">
          <div class="c_c_title">{{ texts.categoryTitle }}</div>
          <div class="c_c_list">
            <div
              :class="['c_c_item', { 'active': !activeId && !isSearchPage }]"
              @click="checkCategory()"
            >{{ texts.categoryAll }}</div>
            <div
              v-for="item in filtedCategoryList"
              :key="item.id"
              :class="['c_c_item', { 'active': activeId == item.id && !isSearchPage }]"
              @click="checkCategory(item)"
            >{{ item.name }}</div>
            <div
              :class="['c_c_item', { 'active': isSearchPage }]"
              @click="searchDialogVisible = true"
            >
              <el-icon><Search /></el-icon>
              {{ texts.search }}
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-dialog
      v-if="searchDialogVisible"
      class="searchDialog"
      v-model="searchDialogVisible"
      draggable
      :title="texts.searchTitle"
      width="500"
      :before-close="searchCancelHandler"
    >
      <el-form :model="searchForm" @submit.prevent  @keyup.enter="searchHandler">
        <el-form-item :label="texts.searchKeyword" label-width="80">
          <el-input v-model="searchForm.keyword" autocomplete="off" />
        </el-form-item>
        <!-- <el-form-item :label="texts.searchCategory" label-width="80">
          <el-select v-model="searchForm.category_id" placeholder="Please select a category" popper-class="search_cate_option">
            <el-option :label="texts.categoryAll" :value="0" />
            <el-option v-for="item in filtedCategoryList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item> -->
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="info" @click="searchCancelHandler">
            {{ texts.searchCancel }}
          </el-button>
          <el-button type="primary" @click="searchHandler">
            {{ texts.searchConfirm }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>

  <Sticker :cateList="filtedCategoryList" :curCat="currentCate" @switch="checkCategory" />

</template>

<script setup lang="ts">
defineOptions({ name: 'BlogListPage' })
import { ref, reactive, onMounted, computed, watch, onActivated, onDeactivated, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { dayjs } from '@/config/config'
import type { CarouselInstance } from 'element-plus'
import type {
  CategoryItemConfig,
  BlogItemConfig
} from '@/interfaces/index'
import { usePageStore } from '@/stores/pageStore'
import ClientAPI from '@/api/client/index'
import Sticker from './Widgets/Sticker.vue'
const activeIndex = ref(0)
const carouselRef = ref<CarouselInstance | null>(null)
const BaseUrl = import.meta.env.VITE_MEDIA_URL
const pageStore = usePageStore()
const { blogList, catList: categoryList } = storeToRefs(pageStore)
const { t } = useI18n()
const texts = computed(() => ({
  title: isSearchPage.value
    ? t('logList.searchPageTitle')
      : activeId.value
        ? 'Blog -> ' + currentCate.value
        : 'Blog',
  pin: t('logList.pin'),
  desc: isSearchPage.value ? '' : t('logList.logIntro'),
  readText: t('logList.readText'),
  categoryAll: t('logList.categoryAll'),
  searchTitle: t('logList.searchTitle'),
  searchKeyword: t('logList.searchKeyword'),
  searchCategory: t('logList.searchCategory'),
  searchConfirm: t('logList.searchConfirm'),
  searchCancel: t('logList.searchCancel'),
  noDataText: t('logList.noData'),
  checkMore: t('logList.checkMore'),
  categoryTitle: t('logList.categoryTitle'),
  search: t('logList.search')
}))
const isSearchPage = computed(() => route.name == 'searchlist')
/**
 * blogList是个类似字典类型的数据结构
 * 在视图里去v-for的时候, 获取分类数据时不用索引, 而是使用string类型的键名
 */
const blogListKey = computed(() => {
  // 如果是search页面, 造一个 'Search' 的key
  if (isSearchPage.value) return ['Search']
  // bloglist 页面, 过滤掉 Vlog 类型的数据
  const _filtedData = Object.keys(blogList.value).filter(v => v != 'Vlog' && v != 'Search' && v != 'TOP' && blogList.value[v]?.length > 0)
  // 如果点击过了某个分类, 将结构改成一个只有元素的数组, 这个元素是 分类列表下的某个单独分类
  return activeId.value ? [currentCate.value] : _filtedData
})
// 如果点击了某个分类 或者搜索文章, 就全量展示, 否则每组分类只显示3条数据
const blogListSliceNum = computed(() => {
  if (isSearchPage.value) {
    return blogList.value['Search']?.length ?? 0
  }
  return blogList.value[currentCate.value]?.length || 3
})
// bloglist 页面, 分类列表 过滤掉 Vlog 类型的数据
const filtedCategoryList = computed(() => categoryList.value.filter(v => v.name != 'Vlog'))
const activeId = ref(0) // 点击某个分类,设置一个分类的响应式id
const searchDialogVisible = ref(false)
const searchForm = reactive({ keyword: '', category_id: 0 })
const router = useRouter()
const route = useRoute()
// const currentCate = computed(() => {
//   // 从 categoryList 列表中查询 有无当前activeId的元素
//   const _curCate = () => categoryList.value.find(v => v.id == activeId.value)
//   // 先判断有无activeId, 再决定要不要find
//   return !activeId.value ? '' : (route.params.catename || _curCate()?.name)
// })
const currentCate = computed(() => {
  if (!activeId.value) return ''

  const fromRoute = route.params.catename
  if (typeof fromRoute === 'string') {
    return fromRoute
  }
  if (Array.isArray(fromRoute)) {
    // 如果是数组, 挑第一个或自行决定逻辑
    return fromRoute[0] ?? ''
  }

  const byId = categoryList.value.find(v => v.id == activeId.value)
  return byId?.name ?? ''
})
const isEmptyList = computed(() => {
  if (isSearchPage.value && blogList.value['Search']?.length == 0) return true
  // 如果点击过某个分类, 不展示
  if (!activeId.value) return false
  // 区分Search和其他分类的key
  const blogListKey = isSearchPage.value ? 'Search' : currentCate.value
  return !blogList.value[blogListKey]?.length
})
function checkContent (id: number) {
  router.push(`/content/${id}`)
}
// 点击切换分类
function checkCategory (cate?: CategoryItemConfig | null) {
  // const { id, name } = cate
  const id = cate?.id ?? 0
  const name = cate?.name ?? ''
  activeId.value = id
  const _router = !id ? `/bloglist` : `/bloglist/${name}`
  router.push(_router)
}
// 获取全部数据
function getList () {
  ClientAPI.getBlogList()
    .then(async res => {
      pageStore.setPage(res)

      // 稍微等待一下页面
      await nextTick()

      // 刷新后, 保持一下分类列表状态
      if (route.params.catename) {
        const _cateObj_ = res.catList.find(v => v.name == route.params.catename)
        // 如果乱写或者找不到, 就去404
        if (!_cateObj_) {
          return router.push({ name: 'NotFound' })
        }
        checkCategory(_cateObj_)
      }
      // 如果是search页面, 返回All列表
      if (isSearchPage.value) {
        router.push({ name: 'bloglist' })
      }
    })
}
function searchCancelHandler () {
  searchDialogVisible.value = false
  searchForm.keyword = ''
  searchForm.category_id = 0
}
function searchHandler () {
  ClientAPI.searchBlogList(searchForm)
    .then(res => {
      searchCancelHandler()
      router.push({ name: 'searchlist' })
      // 在这里为bloglist新造一个key,名为Search
      pageStore.addSearchResultToList(res)
    })
    .catch(err => {
      console.log(err)
    })
}
function handleChange(newIndex: number) {
  activeIndex.value = newIndex
}
function handleItemClick(id:number, index:number) {
  if (index === activeIndex.value) {
    checkContent(id)
  }
  else {
    carouselRef.value?.setActiveItem(index);
  }
}
onMounted(() => {
})
onActivated(() => {
  // 调用时机为首次挂载
  // 以及每次从缓存中被重新插入时
})
onDeactivated(() => {
  // 在从 DOM 上移除、进入缓存
  // 以及组件卸载时调用
})
watch(
  () => pageStore.blogList,
  (val: Record<string, BlogItemConfig[]>) => {
    if (!Object.keys(val).length) {
      getList()
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
#blog_list {
  .top_list {
    padding: 10px 20px 10px;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.5);
    border-radius: 5px;
    h4 {
      border-bottom: 1px solid #99999964;
    }
    .top_content {
      position: relative;
      height: 100%;
      .top_title {
        position: absolute;
        left: 50%;
        bottom: 0;
        transform: translate(-50%, 10px);
        padding: 10px;
        color: #000;
        background-color: rgba(255, 255, 255, 0.75);
        border-radius: 10px;
        opacity: 0.5;
      }
    }
    .el-carousel {
      padding: 10px 10px 40px 10px;
    }
    :deep(.el-carousel__item) {
      border-radius: 5px;
      overflow: hidden;
      box-shadow: 0 5px 10px rgba(0, 0, 0, 0.5);
      .el-image {
        img {
          filter: contrast(130%) grayscale(70%);
        }
      }
      &.is-active {
        .top_title {
          opacity: 1;
        }
        .el-image:hover {
          img {
            filter: none;
          }
        }
      }
    }
    :deep(.el-carousel__indicators) {
      // transform: translateX(-10px);
      background-color: rgba(0, 0, 0, .1);
      border-radius: 5px;
      padding: 0 5px;
      opacity: 1;
    }
  }
  // 左侧卡片列表
  .blog_wrapper {
    padding: 40px 0 20px 0;
    border-radius: 5px;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.5);
    margin-bottom: 20px;

    .blog_item {
      .b_i_content {
        margin-bottom: 20px;

        .b_i_c_title {
          display: inline-block;
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 15px;
          cursor: pointer;
          position: relative;

          &::after {
            content: '';
            width: 100%;
            height: 0;
            position: absolute;
            left: 0;
            bottom: -4px;
            background-color: #000;
            transition: height .2s;
          }
        }

        .b_i_c_title:hover {
          &::after {
            height: 2px;
          }
        }

        .b_i_c_info {
          display: flex;
          justify-content: start;
          align-items: center;
          flex-wrap: nowrap;

          .info_icon {
            height: 20px;
            line-height: 20px;
            display: flex;
            align-items: center;

            span {
              margin-left: 5px;
              font-size: 13px;
              white-space: nowrap;
            }
          }

          .split {
            display: inline-block;
            width: 1px;
            height: 10px;
            background-color: #000;
            margin: 0 10px;
          }
        }

        .b_i_c_desc {
          p {
            font-size: 14px;
            font-weight: bold;
            // padding: 0 10px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }

        .b_i_c_img {
          min-width: 300px;
          max-width: 400px;
          height: 250px;
          border-radius: 5px;
          overflow: hidden;
          cursor: pointer;
          filter: contrast(130%) grayscale(70%);
          transition: box-shadow .2s, filter .2s;

          &:hover {
            box-shadow: 0 5px 10px rgba(0, 0, 0, 0.5);
            filter: none;
          }
        }

        .b_i_c_read {
          display: inline-block;
          font-size: 15px;
          padding-bottom: 5px;
          position: relative;
          transition: font-size .2s;
          cursor: pointer;
          margin-top: 20px;

          &::after {
            content: '';
            width: 100%;
            height: 2px;
            background-color: #000;
            position: absolute;
            left: 0;
            bottom: 0;
            transition: width .2s;
          }

          &:hover {
            font-size: 18px;

            &::after {
              width: 0;
            }
          }
        }
      }
    }

    .blog_category_check {
      height: 20px;
      line-height: 20px;
      text-align: center;
      white-space: nowrap;
      cursor: pointer;
      transition: font-weight .2s;

      &:hover {
        font-weight: bold;
      }
    }

    .blog_empty {
      text-align: center;
    }
  }

  // 右侧分类部分
  .category_content {
    margin-left: 15px;
    position: fixed;

    .c_c_title {
      font-size: 20px;
      margin-bottom: 10px;
      padding-top: 20px;
    }

    .c_c_list {
      display: flex;
      flex-direction: column;

      .c_c_item {
        color: #666;
        font-size: 14px;
        height: 30px;
        line-height: 30px;
        cursor: pointer;
        margin-bottom: 10px;
        padding-left: 10px;
        position: relative;
        transition: font-weight .2s, color .2s, background-color .2s;

        &::before {
          content: '';
          width: 0px;
          height: 25px;
          background-color: #000;
          position: absolute;
          left: 0px;
          top: 50%;
          transform: translateY(-50%);
          transition: width .2s;
        }
      }

      .c_c_item.active,
      .c_c_item:hover {
        font-weight: bold;
        color: #000;
        background-color: rgba(0, 0, 0, .03);

        &::before {
          width: 2px;
        }
      }
    }
  }
}
</style>
