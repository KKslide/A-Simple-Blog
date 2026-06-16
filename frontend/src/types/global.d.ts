declare module 'vue-plyr'
declare module '*.css'

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_MEDIA_URL: string
  readonly VITE_BAIDU_MAP_API: string
  readonly VITE_BAIDU_MAP_CLUSTER_CDN: string
  readonly VITE_CHANCE_JS: string
  [key: string]: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
