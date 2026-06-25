import type { RouteRecordRaw } from 'vue-router'

const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    name: 'admin',
    meta: {
      bodyClass: 'dark',
    },
    component: () => import('@/views/admin/index.vue'),
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: { title: '仪表盘' }
      },
      {
        path: 'category',
        name: 'category',
        component: () => import('@/views/admin/Category.vue'),
        meta: { title: '分类管理' }
      },
      {
        path: 'article',
        name: 'article',
        component: () => import('@/views/admin/Article.vue'),
        meta: { title: '文章管理' }
      },
      {
        path: 'message',
        name: 'message',
        component: () => import('@/views/admin/Message.vue'),
        meta: { title: '留言管理' }
      },
    ]
  },
  {
    path: '/admin/login',
    name: 'login',
    component: () => import('@/views/admin/Login.vue'),
    meta: { title: '登录' }
  }
]

export { adminRoutes }
