import axios from 'axios'
import utils from '@/utils/index'
import { ElLoading, ElNotification } from 'element-plus'
let loadingInstance
let loadingOpt = { fullscreen: true }

let canRequest = true
export default class Request {
  constructor() {
    this.service = axios.create({
      baseURL: import.meta.env.DEV ? '' : import.meta.env.VITE_API_URL,
      timeout: 60000,
      headers: {
        // 'Content-Type': 'application/x-www-form-urlencoded', // 不要设置这个, 会把键值对的值转换成字符串的
        'Content-Type': 'application/json',
      },
    })

    /**
     * 请求拦截器，每次请求发起之前都会经过此拦截器
     */
    this.service.interceptors.request.use(
      (config) => {
        if (config.data instanceof FormData) {
          config.headers['Content-Type'] = 'multipart/form-data'
        }
        // 如果请求的url带有http的不使用默认域名
        if (config.url.indexOf('http') > -1 || config.url.indexOf('https') > -1) {
          config.baseURL = ''
        }
        const obj = {
          browser: utils.browse(),
          os: utils.clientOs(),
          apptype: 1,
          from: 'pc',
        }
        config.headers = Object.assign(config.headers, obj)

        loadingInstance = ElLoading.service(loadingOpt)

        return config
      },
      (error) => {
        loadingInstance.close()
        return Promise.reject(error)
      },
    )
    /**
     * 请求接口后返回的拦截器
     */
    this.service.interceptors.response.use(
      (res) => {
        // 请求成功
        let { status, data } = res
        let replaceURL = (val) => {
          if (typeof val === 'string' && val.includes('127.0.0.1')) {
            return val.replace('127.0.0.1', window.location.hostname)
          } else if (Array.isArray(val)) {
            return val.map(replaceURL)
          } else if (typeof val === 'object' && val !== null) {
            for (const key in val) {
              val[key] = replaceURL(val[key])
            }
          }
          return val
        }
        data = replaceURL(data) // 替换开发时的本地回环地址字符串

        return new Promise((reslove, reject) => {
          loadingInstance.close()
          // 接口返回成功
          if (status === 200 && data.successed) {
            canRequest = true
            return reslove(data)
          }
          if (
            status === 200 &&
            data.successed == undefined &&
            data.status != 404 &&
            (typeof data == 'object' || Array.isArray(data))
          ) {
            return reslove(data)
          }
          const { errorcode, errcode } = data
          // 接口返回的错误信息为token失效或登录状态失效
          if (
            errorcode == 10000 ||
            errorcode == 9999 ||
            errorcode == 9998 ||
            errorcode == 9100 ||
            errorcode == 10001
          ) {
            if (!canRequest) return false
          }
          return reject(data)
        })
      },
      (error) => {
        loadingInstance.close()
        if (error.response && error.response.status === 401) {
          ElNotification({
            title: 'Error',
            message: error.response.data.message,
            type: 'error',
            duration: 3000,
            onClose: () => {
              console.log('关闭了~~~')
              window.location.pathname = '/server/login'
            }
          })
        }
        return Promise.reject(error.response)
      },
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
