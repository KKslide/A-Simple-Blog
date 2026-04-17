import { createRouter, createWebHistory } from 'vue-router'

/* **********客户端********** */
import { clientRoutes } from './client'
/* **********管理端********** */
import { serverRoutes } from './server'

const router = createRouter({
  history: createWebHistory((import.meta.env.VITE_BASE_URL as string) || '/'),
  routes: [
    ...clientRoutes,
    ...serverRoutes,
    {
      path: '/:pathMatch(.*)*', // 通配所有未匹配路径
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue'),
    },
  ],
  scrollBehavior() {
    // 始终滚动到顶部
    return { top: 0 }
  }
})

export default router
