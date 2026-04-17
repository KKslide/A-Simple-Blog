import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const { VITE_API_URL } = loadEnv(mode, process.cwd(), '')
  return {
    base: '/',
    plugins: [
      vue(),
      vueDevTools(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
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
        }
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    build: {
      outDir: '../backend/dist',
      rollupOptions: {
        // external: mode === 'production' ? ['@wangeditor/editor',] : [],
        output: {
          // globals: {
          //   '@wangeditor/editor': 'wangEditor',
          // },
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('element-plus')) return 'vendor_element_plus'
              if (id.includes('highlight.js')) return 'vendor_highlight'
              if (id.includes('vue')) return 'vendor_vue'
              if (id.includes('axios')) return 'vendor_axios'
              if (id.includes('pinia')) return 'vendor_pinia'
              if (id.includes('vue-cropper')) return 'vendor_vue_cropper'
              if (id.includes('typed.js')) return 'vendor_typed_js'
              if (id.includes('vue-i18n')) return 'vendor_vue_i18n'
              if (id.includes('js-md5')) return 'vendor_js_md5'
              if (id.includes('vue-plyr')) return 'vendor_vue_plyr'
              if (id.includes('wangeditor')) return 'vendor_wangeditor'
              if (id.includes('html2canvas')) return 'vendor_html2canvas'
              if (id.includes('pdfjs-dist')) return 'vendor_pdf'
              // 拆分 ECharts 相关
              if (id.includes('echarts/core')) return 'echarts-core'
              if (id.includes('echarts/charts')) return 'echarts-charts'
              if (id.includes('echarts/components')) return 'echarts-components'
              if (id.includes('echarts/features')) return 'echarts-features'
              if (id.includes('echarts/renderers')) return 'echarts-renderers'
              return 'vendor'
            }
          },
        },
      },
    },
  }
})
