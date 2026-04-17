import { createI18n } from 'vue-i18n'
import { useLangStore } from '@/stores/langStore'
import { zh, en } from './lang'

const DEFAULT_LANG = 'en' // 默认语言为英文

const locales = {
  en,
  zh
}

const i18n = createI18n({
    locale: DEFAULT_LANG,
    legacy: false, // 如果要支持compositionAPI，此项必须设置为false;
    globalInjection: true, // 全局注册$t方法
    messages: locales,
})

export function initialLang() {
  const LangStore = useLangStore()
  sessionStorage.setItem('lang', DEFAULT_LANG)
  LangStore.setLang(DEFAULT_LANG)
}

export default i18n
