import { defineStore } from 'pinia'

export const useUserStore = defineStore('userInfo', {
  state: () => ({}), // 初始为空对象
  actions: {
    setUserInfo(info) {
      // Object.assign(this.$state, info) // 直接合并
      Object.keys(info).forEach(v => {
        this.$state[v] = info[v]
      })
    },
    clearUserInfo() {
      Object.keys(this.$state).forEach(key => delete this.$state[key]) // 清空所有字段
    }
  }
})
