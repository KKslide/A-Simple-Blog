/**
 * 百度地图脚本加载
 *
 * 博客里已有百度地图相关环境变量, 这里复用同一套配置.
 * 注意: 百度地图 API 使用 callback 异步初始化, onload 时 BMapGL 还不一定存在.
 */

/** 动态加载外部脚本 */
export function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.head.appendChild(script)
  })
}

/** 通过 callback 参数加载百度地图 API (API 异步初始化) */
export function loadBaiduMapAPI(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const cbName = '_hzyBaiduMapInit_' + Date.now()
    const timer = setTimeout(() => reject(new Error('Baidu Map API init timeout')), 15000)
    ;(window as any)[cbName] = () => {
      delete (window as any)[cbName]
      clearTimeout(timer)
      resolve()
    }
    const url = src + (src.includes('?') ? '&' : '?') + 'callback=' + cbName
    const script = document.createElement('script')
    script.src = url
    script.onerror = () => {
      clearTimeout(timer)
      reject(new Error('Baidu Map API load failed'))
    }
    document.head.appendChild(script)
  })
}

/** 轮询等待全局变量可用 */
export function waitForGlobal(key: string, timeout = 15000): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any)[key]) return resolve()
    const start = Date.now()
    const timer = setInterval(() => {
      if ((window as any)[key]) {
        clearInterval(timer)
        resolve()
      } else if (Date.now() - start > timeout) {
        clearInterval(timer)
        reject(new Error(`Timeout waiting for window.${key}`))
      }
    }, 50)
  })
}

/** 确保百度地图和聚合插件都已就绪 (可重复调用) */
export async function ensureBaiduMap(): Promise<void> {
  if ((window as any).BMapGL && (window as any).Cluster) return

  const api = import.meta.env.VITE_BAIDU_MAP_API
  const cluster = import.meta.env.VITE_BAIDU_MAP_CLUSTER_CDN

  if (!(window as any).BMapGL) {
    await loadBaiduMapAPI(api)
  }
  if (!(window as any).Cluster) {
    await loadScript(cluster)
    await waitForGlobal('Cluster')
  }
}
