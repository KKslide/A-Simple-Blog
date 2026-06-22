import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { epIconResolver } from './plugins/ep-icon-resolver'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const { VITE_API_URL } = loadEnv(mode, process.cwd(), '')
  return {
    base: '/',
    plugins: [
      vue(),
      // 仅在开发模式启用 vueDevTools
      mode === 'development' && vueDevTools(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver(), epIconResolver()],
      }),
    ].filter(Boolean),
    server: {
      host: '0.0.0.0',
      port: 8888,
      proxy: {
        '/user': {
          changeOrigin: true,
          target: VITE_API_URL,
        },
        '/admin': {
          changeOrigin: true,
          target: VITE_API_URL,
        },
        '/pic': {
          changeOrigin: true,
          target: VITE_API_URL,
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      outDir: '../backend/dist',
      rollupOptions: {
        output: {
          /**
           * 手动分包策略
           * 将大型第三方库拆分为独立 chunk，避免单个 vendor 包过大
           * 注意：element-plus 必须在 @element-plus/icons-vue 之前匹配
           */
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // UI 框架
              if (id.includes('element-plus')) return 'vendor_element_plus'
              if (id.includes('@element-plus/icons-vue')) return 'vendor_ep_icons'

              // 代码高亮（按需导入语言，见 src/config/config.ts）
              if (id.includes('highlight.js')) return 'vendor_highlight'

              // Vue 生态
              if (id.includes('vue-router')) return 'vendor_vue_router'
              if (id.includes('vue')) return 'vendor_vue'
              if (id.includes('pinia')) return 'vendor_pinia'
              if (id.includes('vue-i18n') || id.includes('@intlify')) return 'vendor_vue_i18n'

              // 网络请求
              if (id.includes('axios')) return 'vendor_axios'

              // 图片处理
              if (id.includes('vue-cropper') || id.includes('cropperjs')) return 'vendor_cropper'
              if (id.includes('html2canvas')) return 'vendor_html2canvas'

              // 文档处理
              if (id.includes('pdfjs-dist')) return 'vendor_pdf'
              if (id.includes('wangeditor')) return 'vendor_wangeditor'

              // 动画/打字效果
              if (id.includes('typed.js')) return 'vendor_typed_js'
              if (id.includes('vue-plyr')) return 'vendor_vue_plyr'

              // 工具库
              if (id.includes('js-md5')) return 'vendor_js_md5'
              if (id.includes('dayjs')) return 'vendor_dayjs'

              // ECharts 按模块拆分
              if (id.includes('echarts/core')) return 'echarts-core'
              if (id.includes('echarts/charts')) return 'echarts-charts'
              if (id.includes('echarts/components')) return 'echarts-components'
              if (id.includes('echarts/features')) return 'echarts-features'
              if (id.includes('echarts/renderers')) return 'echarts-renderers'

              // 其他未分类的 node_modules
              return 'vendor'
            }
          },
        },
      },
    },
  }
})
