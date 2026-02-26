import { createRouter, createWebHistory } from 'vue-router'
/* **********客户端********** */
import { clientRoutes } from './client'
/* **********管理端********** */
import { serverRoutes } from './server'
import NotFound from '../views/NotFound.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...clientRoutes,
    ...serverRoutes,
    {
      path: '/:pathMatch(.*)*', // 通配所有未匹配路径
      name: 'NotFound',
      component: NotFound,
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    // 始终滚动到顶部
    return { top: 0 }
  }
})

// router.beforeEach((to, from, next) => {
//   // 判断来源是否为 router-link 跳转，可以自定义方式
//   if (to.name === 'bloglist' && from.name !== 'content') {
//     to.meta.keepAlive = false
//   } else {
//     to.meta.keepAlive = true
//   }
//   next()
// })

export default router
