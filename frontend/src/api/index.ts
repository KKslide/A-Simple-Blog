interface ErrorResponse {
  message?: string
  code?: number
  errors?: string[]
  [key: string]: unknown  // 允许其他属性
}

import axios, { AxiosHeaders, type AxiosResponse, type AxiosInstance, type InternalAxiosRequestConfig, type AxiosError } from 'axios'
import { ElLoading, ElNotification } from 'element-plus'
import utils from '@/utils/index'
/**
 * loadingInstance 类型用 ReturnType 动态推断 ElLoading.service 的返回值类型
 * 这样即便 element-plus 的类型在未来变化，也能跟着同步
 */
let loadingInstance: ReturnType<typeof ElLoading.service> | null = null
/**
 * loadingOpt 的类型也用 Parameters 推断，参数索引 0 即为 options 类型
 */
const loadingOpt: Parameters<typeof ElLoading.service>[0] = { fullscreen: true }
let canRequest: boolean = true

export default class Request {
  private static _instance?: Request;
  service: AxiosInstance;
  constructor() {
    this.service = axios.create({
      baseURL: import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL as string),
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    /**
     * 请求拦截器，每次请求发起之前都会经过此拦截器
     */
    this.service.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (config.data instanceof FormData) {
          const headers = config.headers
            ? new AxiosHeaders(config.headers)
            : new AxiosHeaders()
          headers.set('Content-Type', 'multipart/form-data')
          config.headers = headers
        }
        // 如果请求的url带有http的不使用默认域名
        const url = config.url ?? ''
        if (url.indexOf('http') > -1 || url.indexOf('https') > -1) {
          config.baseURL = ''
        }
        const obj = {
          browser: utils.browse(),
          os: utils.clientOs(),
          apptype: 1,
          from: 'pc',
        }
        config.headers = Object.assign(config.headers || {}, obj)

        loadingInstance = ElLoading.service(loadingOpt) as ReturnType<typeof ElLoading.service>

        return config
      },
      (error: AxiosError) => {
        loadingInstance?.close()
        return Promise.reject(error)
      },
    )

    /**
     * 请求接口后返回的拦截器
     */
    this.service.interceptors.response.use(
      (res: AxiosResponse): AxiosResponse | Promise<never> => {
        let { status, data } = res
        const replaceURL = <T>(val: T): T => {
          // todo 把这一段 127... 给干掉
          if (typeof val === 'string' && val.includes('127.0.0.1')) {
            return val.replace('127.0.0.1', window.location.hostname) as T
          } else if (Array.isArray(val)) {
            return val.map(replaceURL) as T
          } else if (typeof val === 'object' && val !== null) {
            const result: Record<string, unknown> = {}
            for (const key in val) {
              result[key] = replaceURL((val as Record<string, unknown>)[key])
            }
            return result as T
          }
          return val
        }
        data = replaceURL(data) // 替换开发时的本地回环地址字符串

        loadingInstance?.close()

        if (status === 200 && data.successed) {
          canRequest = true
          return data
        }
        if (
          status === 200 &&
          data.successed == undefined &&
          data.status != 404 &&
          (typeof data == 'object' || Array.isArray(data))
        ) {
          return data
        }
        const { errorcode } = data
        // 接口返回的错误信息为token失效或登录状态失效
        if (
          errorcode == 10000 ||
          errorcode == 9999 ||
          errorcode == 9998 ||
          errorcode == 9100 ||
          errorcode == 10001
        ) {
          if (!canRequest) return Promise.reject(data)
        }
        return Promise.reject(data)
      },
      (error: AxiosError<ErrorResponse>) => {
        loadingInstance?.close()
        if (error.response && error.response.status === 401) {
          ElNotification({
            title: 'Error',
            message: error?.response?.data?.message || '未授权',
            type: 'error',
            duration: 3000,
            onClose: () => {
              console.log('关闭了~~~')
              window.location.pathname = '/server/login'
            }
          })
        }
        return Promise.reject(error.response)
      }
    )
  }
  /**
   * axios service 对象实例
   */
  request() {
    return this.service
  }

  /**
   * 单例模式，返回http 请求对象
   */
  static getInstance() {
    if (Request._instance) return Request._instance
    Request._instance = new Request()
    return Request._instance
  }
}
