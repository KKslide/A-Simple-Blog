import { defineStore } from 'pinia'

export const useLangStore = defineStore('lang', {
  state: () => ({
    currentLang: ''
  }),
  actions: {
    setLang(language: string) {
      this.currentLang = language
    }
  }
})
