import { defineStore } from 'pinia'

export const useLangStore = defineStore('lang', {
  state: () => ({
    currentLang: ''
  }),
  actions: {
    setLang(language) {
      this.currentLang = language
    }
  }
})
