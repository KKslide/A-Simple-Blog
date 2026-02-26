export const serverRoutes = [
  {
    path: '/admin',
    redirect: '/server', // 标准写法，确保被主路由表合并
  },
  {
    path: '/server',
    name: 'server',
    meta: {
      bodyClass: 'dark',
    },
    redirect: to => {
      return { name: 'dashboard' }
    },
    component: () => import('@/views/admin/index.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/views/admin/Login.vue'),
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
      },
      {
        path: 'article',
        name: 'article',
        component: () => import('@/views/admin/Article.vue'),
      },
      {
        path: 'category',
        name: 'category',
        component: () => import('@/views/admin/Category.vue'),
      },
      {
        path: 'work',
        name: 'work',
        component: () => import('@/views/admin/Work.vue'),
      },
      {
        path: 'message',
        name: 'message',
        component: () => import('@/views/admin/Message.vue'),
      },
    ],
  },
]

