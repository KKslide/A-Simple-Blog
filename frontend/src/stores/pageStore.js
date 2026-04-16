import { defineStore } from 'pinia'

export const usePageStore = defineStore('page', {
  state: () => ({
    blogList: [],
    catList: []
  }),
  actions: {
    setPage(data) {
      const { blogList, catList } = data
      this.blogList = blogList
      this.catList = catList
    },
    addSearchResultToList(data) {
      this.blogList['Search'] = []
      this.blogList['Search'] = data
    }
  }
})
