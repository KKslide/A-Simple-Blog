import { type AxiosInstance } from 'axios'
import request from '@/api/index'
import utils from '@/utils'
/**
 * 数据处理业务基类
 */
export default class ApiHelper {
  req: AxiosInstance
  constructor() {
    this.req = request.getInstance().request()
  }

  /**
   * T = 响应的 data 类型 (TData)
   * 调用 this.req.get<T, T>
   * 第一个 T: TData (response.data 的类型)
   * 第二个 T: TResult (Promise 解析后的类型)
   * 因为拦截器返回了 data，所以 TResult = TData = T
   */
  get<T = unknown>(url: string, params = {}): Promise<T> {
    return this.req.get<T, T>(`${url}?${utils.objectToQueryString(params)}`)
  }

  /**
   * T = 响应的 data 类型 (TData & TResult)
   * D = 发送的 data 类型 (TRequestData)
   */
  post<T = unknown, D = unknown>(url: string, data = {} as D): Promise<T> {
    return this.req.post<T, T, D>(url, data)
  }
  put(url: string, data = {}) {
    return this.req.put(url, data)
  }
  delete(url: string, data = {}) {
    return this.req.delete(url, data)
  }
}
