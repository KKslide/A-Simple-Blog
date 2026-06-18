import type {
  PageData,
  BloglistConfig,
  BlogItemConfig,
  CategoryItemConfig,
} from '@/types/api'
import { defineStore } from 'pinia'

export const usePageStore = defineStore('page', {
  state: () => ({
    blogList: {} as BloglistConfig['blogList'], // 初始化为空对象
    catList: [] as BloglistConfig['catList']
  }),
  actions: {
    setPage(data: PageData) {
      const { blogList, catList } = data
      if (blogList) this.blogList = blogList as Record<string, BlogItemConfig[]>
      if (catList) this.catList = catList as CategoryItemConfig[]
    },
    addSearchResultToList(data: BlogItemConfig[]) {
      this.blogList['Search'] = data
    },
    /** 同步列表/搜索缓存中的文章阅读量 (详情页统计后更新) */
    updateArticleViewCount(articleId: number, viewCount: number) {
      const id = Number(articleId)
      if (!id) return
      for (const key of Object.keys(this.blogList)) {
        const list = this.blogList[key]
        if (!Array.isArray(list)) continue
        const item = list.find((a) => Number(a.id) === id)
        if (item) {
          item.view_count = viewCount
          return
        }
      }
    }
  }
})
