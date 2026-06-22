/**
 * HTTP 请求基类
 *
 * 提供类型安全的 get/post/put/delete 方法
 * 所有方法返回 Promise，由 axios 响应拦截器统一处理错误
 */

import { type AxiosInstance } from 'axios'
import request from '@/api/index'
import utils from '@/utils'

export default class ApiHelper {
  req: AxiosInstance
  constructor() {
    this.req = request.getInstance().request()
  }

  /**
   * GET 请求
   * @typeParam T - 响应数据类型
   * @param url - 请求路径
   * @param params - 查询参数
   */
  get<T = unknown>(url: string, params = {}): Promise<T> {
    return this.req.get<T, T>(`${url}?${utils.objectToQueryString(params)}`)
  }

  /**
   * POST 请求
   * @typeParam T - 响应数据类型
   * @typeParam D - 请求体数据类型
   * @param url - 请求路径
   * @param data - 请求体数据
   */
  post<T = unknown, D = unknown>(url: string, data = {} as D): Promise<T> {
    return this.req.post<T, T, D>(url, data)
  }

  /**
   * PUT 请求
   * @typeParam T - 响应数据类型
   * @typeParam D - 请求体数据类型
   * @param url - 请求路径
   * @param data - 请求体数据
   */
  put<T = unknown, D = unknown>(url: string, data = {} as D): Promise<T> {
    return this.req.put<T, T, D>(url, data)
  }

  /**
   * DELETE 请求
   * @typeParam T - 响应数据类型
   * @param url - 请求路径
   */
  delete<T = unknown>(url: string): Promise<T> {
    return this.req.delete<T, T>(url)
  }
}
