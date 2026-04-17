// highlight配置
import hljs from 'highlight.js/lib/core'
import 'highlight.js/styles/github-dark.css'

// 常用语言列表（按需添加）
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import json from 'highlight.js/lib/languages/json'
import html from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import bash from 'highlight.js/lib/languages/bash'
import sql from 'highlight.js/lib/languages/sql'
import python from 'highlight.js/lib/languages/python'

// 注册
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('html', html)
hljs.registerLanguage('xml', html) // xml 也用于 html
hljs.registerLanguage('css', css)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('python', python)

// 播放器配置
const plyrOptions = {
  autoplay: false,
  controls: [
    'play-large',
    'play',
    'rewind',
    'fast-forward',
    'progress',
    'current-time',
    'mute',
    'volume',
    'captions',
    'settings',
    'pip',
    'airplay',
    'fullscreen',
  ],
  settings: ['captions', 'quality', 'speed', 'loop'],
  speed: { selected: 1, options: [0.5, 1, 1.25, 1.5, 2] },
  quality: { default: 720, options: [1080, 720, 480, 360] },
  ratio: '16:9',
  i18n: {
    speed: '播放速度',
    quality: '画质',
    loop: '循环',
  },
}

import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn' // 中文语言包
import relativeTime from 'dayjs/plugin/relativeTime' // 相对时间
import utc from 'dayjs/plugin/utc' // UTC
import timezone from 'dayjs/plugin/timezone' // 时区

dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale('zh-cn') // 设置为中文

const portfoliosList = [
  {
    name: 'Scroll-Demo',
    img: '/upload/upload_ace9f5bedbfe78f5192cbfa1e6f9ecca.JPG',
    description: '一个丝滑滚动的样式效果',
    routeName: 'scrollDemo'
  },
  {
    name: 'Color-BG',
    img: '/upload/upload_4ca907a03dc9832035f0af9422068a2a.JPG',
    description: '用CSS动态改变背景色',
    routeName: 'colorBG'
  },
  {
    name: 'Thanos-Flip',
    img: '/upload/upload_f5a1421ab2e8af04763221caa393d8fb.JPG',
    description: 'canvas绘制灭霸弹指效果',
    routeName: 'thanosFlip'
  },
  {
    name: 'Hover-effect',
    img: '/upload/upload_719d379ee4b4d8cb81782b7856df7a0b.JPG',
    description: '好玩的鼠标悬停CSS样式',
    routeName: 'hoverEffect'
  },
  {
    name: 'Neon Light',
    img: '/upload/upload_6c739a9d46e9c0a9f26601694c6af216.JPG',
    description: 'CSS仿霓虹特效',
    routeName: 'neonLamp'
  },
  {
    name: 'Glitch Demo',
    img: '/upload/upload_fe5b5338cc4fb903ecb995ff0942bd96.JPG',
    description: 'JS+CSS仿造故障特效',
    routeName: 'glitchEffect'
  },
  {
    name: 'Waterfall',
    img: '/upload/upload_cf6aee3120e20241d86a5230dac7c22c.png',
    description: 'JS+CSS制作瀑布流效果',
    routeName: 'waterfall'
  },
  {
    name: 'Echarts + Map',
    img: '/upload/upload_2028f88cba27a22edf7c5a7016d2b5dd.JPG',
    description: '基于echarts制作中国地图下钻效果',
    routeName: 'echartsDrillDown'
  },
  {
    name:'Map-Cluster',
    img: '/upload/baidu-map.jpeg',
    description: '百度地图应用==>>>缩放/聚合/标记点',
    routeName: 'mapCluster'
  },
  {
    name:'A Sticker 😜',
    img: '/upload/sticker.jpeg',
    description: '一个贴在左侧的sticker组件',
    routeName: 'sticker'
  },
  {
    name:'Snake 🐍',
    img: '/upload/snake_html.jpeg',
    description: '每个前端er都要会写的贪吃蛇😂',
    routeName: 'snake'
  }
]

export { plyrOptions, hljs, portfoliosList, dayjs }
