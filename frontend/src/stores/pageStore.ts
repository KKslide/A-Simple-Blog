import type {
  PageData,
  BloglistConfig,
  BlogItemConfig,
  CategoryItemConfig,
} from '@/interfaces'
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
    }
  }
})
