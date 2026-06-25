interface ErrorResponse {
  code?: number
  msg?: string
  message?: string
  errors?: string[]
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

export default class Request {
  private static _instance?: Request;
  service: AxiosInstance;
  constructor() {
    this.service = axios.create({
      // 统一使用 /api 前缀，开发环境通过 Vite 代理转发至后端
      baseURL: '/api',
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

        loadingInstance = ElLoading.service(loadingOpt) as ReturnType<typeof ElLoading.service>

        return config
      },
      (error: AxiosError) => {
        loadingInstance?.close()
        return Promise.reject(error)
      },
    )

    /**
     * 响应拦截器
     *
     * 后端统一响应格式:
     *   成功: { code: 1, msg: "成功", data?: ... }
     *   失败: { code: 0, msg: "错误提示" }
     *
     * HTTP 状态码:
     *   200 — 正常（业务成功或业务失败）
     *   401 — 未登录
     *   404 — 路由不存在
     *   500 — 服务器异常
     */
    this.service.interceptors.response.use(
      (res: AxiosResponse): AxiosResponse | Promise<never> => {
        const { data } = res
        loadingInstance?.close()

        // code === 1 表示业务成功，返回 data
        if (data?.code === 1) {
          return data
        }

        // code === 0 表示业务失败，弹出错误提示并 reject
        if (data?.code === 0) {
          ElNotification({ title: '提示', message: data.msg || '操作失败', type: 'warning', duration: 3000 })
          return Promise.reject(data)
        }

        // 其他情况（如直接返回数组/对象的旧接口）原样返回
        return data
      },
      (error: AxiosError<ErrorResponse>) => {
        loadingInstance?.close()
        const status = error.response?.status
        const msg = error.response?.data?.msg || error.response?.data?.message

        if (status === 401) {
          ElNotification({
            title: '登录过期',
            message: msg || '未登录或登录已过期，请重新登录',
            type: 'error',
            duration: 3000,
            onClose: () => {
              window.location.pathname = '/admin/login'
            }
          })
        } else if (status === 404) {
          ElNotification({ title: '错误', message: '请求的资源不存在', type: 'error', duration: 3000 })
        } else if (status === 500) {
          ElNotification({ title: '错误', message: '服务器内部错误', type: 'error', duration: 3000 })
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
