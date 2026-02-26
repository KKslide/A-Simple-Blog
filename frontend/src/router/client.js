export const clientRoutes = [
  {
    path: '/',
    component: () => import('@/views/client/index.vue'),
    redirect: () => { return { name: 'home' } },
    children: [
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/client/Home.vue'),
      },
      {
        path: 'bloglist/:catename?',
        name: 'bloglist',
        component: () => import('@/views/client/BlogList.vue'),
        meta: { keepAlive: true },
      },
      {
        path: 'bloglist/search/:keyword?',
        name: 'searchlist',
        component: () => import('@/views/client/BlogList.vue'),
      },
      {
        path: 'vloglist',
        name: 'vloglist',
        component: () => import('@/views/client/VlogList.vue'),
        meta: { keepAlive: true },
      },
      {
        path: 'about',
        name: 'about',
        component: () => import('@/views/client/About.vue'),
        meta: { keepAlive: true },
      },
      {
        path: 'contact',
        name: 'contact',
        component: () => import('@/views/client/Contact.vue'),
      },
      {
        path: 'content/:id',
        name: 'content',
        component: () => import('@/views/client/Content.vue'),
      },
      {
        path: 'works',
        redirect: { name: 'works' },
        children: [
          {
            path: '',
            name: 'works',
            component: () => import('@/views/client/Works.vue'),
          },
          {
            path: 'scrollDemo',
            name: 'scrollDemo',
            component: () => import('@/views/client/Portfolio/ScrollDemo.vue')
          },
          {
            path: 'colorBG',
            name: 'colorBG',
            component: () => import('@/views/client/Portfolio/ColorBG.vue')
          },
          {
            path: 'thanosFlip',
            name: 'thanosFlip',
            component: () => import('@/views/client/Portfolio/ThanosFlip.vue')
          },
          {
            path: 'hoverEffect',
            name: 'hoverEffect',
            component: () => import('@/views/client/Portfolio/HoverEffect.vue')
          },
          {
            path: 'neonLamp',
            name: 'neonLamp',
            component: () => import('@/views/client/Portfolio/NeonLamp.vue')
          },
          {
            path: 'glitchEffect',
            name: 'glitchEffect',
            component: () => import('@/views/client/Portfolio/GlitchEffect.vue')
          },
          {
            path: 'echartsDrillDown',
            name: 'echartsDrillDown',
            component: () => import('@/views/client/Portfolio/EchartsDrillDown.vue')
          },
          {
            path: 'waterfall',
            name: 'waterfall',
            component: () => import('@/views/client/Portfolio/Waterfall.vue')
          },
          {
            path: 'mapCluster',
            name: 'mapCluster',
            component: () => import('@/views/client/Portfolio/MapCluster.vue')
          },
          {
            path: 'sticker',
            name: 'sticker',
            component: () => import('@/views/client/Portfolio/StickerDemo.vue')
          },
          {
            path: 'snake',
            name: 'snake',
            component: () => import('@/views/client/Portfolio/Snake.vue')
          }
        ],
      },
    ],
  },
]
