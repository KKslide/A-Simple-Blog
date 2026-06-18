type QueryValue = string | number | boolean

export default class utils {

  /** 节流 — 头部触发：立即执行一次，delay 内不再重复 */
  static _throttle<T extends (...args: unknown[]) => unknown>(fn: T, delay: number): (...args: Parameters<T>) => void {
    let lastTime = 0
    let timer: ReturnType<typeof setTimeout> | null = null
    return function (this: unknown, ...args: Parameters<T>): void {
      const now = Date.now()
      if (now - lastTime >= delay) {
        lastTime = now
        fn.apply(this, args)
      } else if (!timer) {
        timer = setTimeout(() => {
          lastTime = Date.now()
          timer = null
          fn.apply(this, args)
        }, delay - (now - lastTime))
      }
    }
  }

  /** 防抖 — 延迟执行，连续调用只触发最后一次 */
  static _debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number): (...args: Parameters<T>) => void {
    let timer: ReturnType<typeof setTimeout> | null = null
    return function (this: unknown, ...args: Parameters<T>): void {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        timer = null
        fn.apply(this, args)
      }, delay)
    }
  }

  /** 将对象拼接为查询字符串，如 {a:1, b:2} => "a=1&b=2" */
  static objectToQueryString(obj: Record<string, QueryValue> | null | undefined): string {
    if (!obj) return ''
    return Object.keys(obj)
      .filter(key => obj[key] !== undefined && obj[key] !== null)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(String(obj[key]))}`)
      .join('&')
  }

  /** 拼接媒体资源完整地址，若已是完整链接则直接返回 */
  static mediaUrl(url: string): string {
    if (!url) return ''
    return url.startsWith('http') ? url : (import.meta.env.VITE_MEDIA_URL || '') + url
  }

  /** 获取浏览器信息 */
  static browse(): string {
    const ua = navigator.userAgent.toLowerCase()
    const match = ua.match(/(msie|firefox|chrome|opera|version)\/?([\d.]+)/)
    if (!match) return 'unknown'
    const [, name, ver] = match
    const map: Record<string, string> = {
      msie: 'IE', firefox: 'firefox', chrome: 'chrome',
      opera: 'opera', version: 'safari'
    }
    return `${map[name!] || name} ${ver}`
  }

  /** 获取操作系统 (0=windows, 1=mac, 2=linux/unix) */
  static clientOs(): number {
    const p = navigator.platform
    if (/Mac/i.test(p)) return 1
    if (/Win/i.test(p)) return 0
    return 2
  }
}
