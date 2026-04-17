import 'normalize.css'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/display.css'
import 'element-plus/theme-chalk/dark/css-vars.css' // 暗黑模式
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './styles/main.scss'

import 'vue-plyr/dist/vue-plyr.css'
import { plyrOptions } from '@/utils/config'
import VuePlyr from 'vue-plyr'

import i18n, { initialLang } from './locales'

import PageTitle from './views/client/Widgets/PageTitle.vue'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)
app.component('PageTitle', PageTitle)
// element图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(VuePlyr, { plyr: plyrOptions })
app.use(createPinia())
app.use(router)
app.use(i18n)
app.mount('#app')

initialLang()
