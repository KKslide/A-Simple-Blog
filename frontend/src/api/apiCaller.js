import request from '@/api/index'
import utils from '@/utils'
/**
 * 数据处理业务基类
 */
export default class ApiHelper {
  constructor() {
    this.request = request.getInstance().request()
  }

  /* 请求 */
  get(url, params) {
    return this.request.get(`${url}?${utils.objectToQueryString(params)}`)
  }
  post(url, data) {
    return this.request.post(url, data)
  }
  put(url, data) {
    return this.request.put(url, data)
  }
  delete(url, data) {
    return this.request.delete(url, data)
  }
}
