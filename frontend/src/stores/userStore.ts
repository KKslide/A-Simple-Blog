import type { UserDataConfig } from '@/interfaces'
import { defineStore } from 'pinia'

const defaultUserState: UserDataConfig = {
  id: 0,
  username: '',
  is_admin: 0,
  login: false
}

export const useUserStore = defineStore('userInfo', {
  state: () => ({ ...defaultUserState }), // 初始为空对象
  actions: {
    setUserInfo(info: Partial<UserDataConfig>) {
      Object.assign(this.$state, info) // 直接合并
    },
    clearUserInfo() {
      // 重置为默认值
      Object.assign(this.$state, defaultUserState)
    }
  }
})
