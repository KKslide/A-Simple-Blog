import { createApp } from 'vue'
import { createPinia } from 'pinia'

import 'normalize.css'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/display.css'
import 'element-plus/theme-chalk/dark/css-vars.css' // 暗黑模式
import './styles/main.scss'

import i18n, { initialLang } from './locales'
import PageTitle from './views/client/Widgets/PageTitle.vue'

import App from './App.vue'
import router from './router'

const app = createApp(App)
app.component('PageTitle', PageTitle)
app.use(createPinia())
app.use(router)
app.use(i18n)
app.mount('#app')

initialLang()
