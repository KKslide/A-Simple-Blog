/**
 * 餐饮油烟大管家 - 独立请求层
 *
 * 该模块对接的是第三方后端 (47.93.222.102), 与 Simple-Blog 自己的 api/client
 * 完全隔离: 独立的 axios 实例, 独立的 baseURL 和 token key, 避免互相污染.
 * 原项目用 JS 编写, 这里按宽松类型迁移到 TS, 不做过强的类型约束.
 */
import axios, { type AxiosResponse } from 'axios'

/** 第三方后端地址, 可通过环境变量覆盖 */
const API_BASE = import.meta.env.VITE_HZY_API_URL || 'http://47.93.222.102:9500'
/** 图片资源域名, 可通过环境变量覆盖 */
export const HZY_IMG_DOMAIN = import.meta.env.VITE_HZY_IMG_DOMAIN || 'http://47.93.222.102:98/'

/** 本项目专用的本地存储 key, 与博客自身的登录态隔离 */
export const HZY_TOKEN_KEY = 'hzy_token'
export const HZY_TOKEN_TIME_KEY = 'hzy_tokenTime'
export const HZY_COMPANY_INFO_KEY = 'hzy_companyInfo'

const service = axios.create({
  // 不使用 baseURL: URL() 会统一拼接, 这样 API_BASE 既可以是完整域名,
  // 也可以是部署时的反向代理路径 (如 /hzy-api)
  timeout: 8000,
})

service.interceptors.request.use(
  (config) => {
    config.headers = {
      Authorization: localStorage.getItem(HZY_TOKEN_KEY) || '',
      'Content-Type': 'application/json',
    } as any
    return config
  },
  (error) => Promise.reject(error),
)

service.interceptors.response.use(
  (response) => Promise.resolve(response),
  (error) => Promise.reject(error),
)

const URL = (url: string) => API_BASE + url

/** 获取数据 (GET, 把对象拼成 query string) */
export const getData = (urlV: string, dataV?: any): Promise<AxiosResponse<any>> => {
  if (dataV != '') {
    let url2 = ''
    for (const key in dataV) {
      if (dataV.hasOwnProperty(key)) {
        if (url2 == '') {
          url2 = key + '=' + dataV[key]
        } else {
          url2 += '&' + key + '=' + dataV[key]
        }
      }
    }
    if (url2 != '') urlV = urlV + '?' + url2
  }
  return service({ url: URL(urlV), method: 'GET' })
}

/** 获取数据 (POST) */
export const postData = (urlV: string, dataV?: any): Promise<AxiosResponse<any>> => {
  return service({ url: URL(urlV), method: 'POST', data: dataV })
}

// 登录
export const login = (data: any): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/login'), method: 'POST', data })
}

// 获取全部企业信息
export const getAll = (): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/api/allCompaniesCD'), method: 'GET' })
}

// 超标报警
export const overStandardRealTime = (): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/api/overStandardRealTime'), method: 'GET' })
}

// 超标趋势
export const overweightTrends = (): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/api/overweightTrends'), method: 'GET' })
}

// 运转率
export const operationRate = (): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/api/operationRate'), method: 'GET' })
}

// 清洗超期
export const cleaningMaintenance = (): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/api/cleaningMaintenance'), method: 'GET' })
}

// 各区域日超标统计
export const areaOverStandard = (): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/api/areaOverStandard'), method: 'GET' })
}

// 检查登录
export const isLogin = (): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/checkLogin'), method: 'POST' })
}

// 获取案件实时统计
export const getLiveCaseData = (): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/api/caseSysStatus'), method: 'GET' })
}

// 获取案件数量
export const getCaseTotalData = (): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/api/caseTotal'), method: 'GET' })
}

/** 获取国控点数据 (第三方空气质量接口, 不走上面的 service) */
export const getAQI = (lng: number | string, lat: number | string): Promise<AxiosResponse<any>> => {
  return axios.get('http://api.epmap.org/api/v1/air?', {
    params: { latitude: lat, longitude: lng },
    headers: { Authorization: 'APPCODE f30c87b8c8524c60ad5c1b38109f452f' },
  })
}

// 企业概况
export const getEpSurvey_chart = (): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/companyReference/epSurvey_chart'), method: 'GET' })
}

// 选址负面清单
export const getStore_chart = (): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/companyReference/epStore_chart'), method: 'GET' })
}

// 投诉统计
export const getComplaint_chart = (): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/api/complaintTotal'), method: 'GET' })
}

// 综合治理-成都
export const getZhShow_cd = (con: any): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/api/zhShow_cd'), method: 'POST', data: con })
}

// 禁止清单
export const getStore_address = (): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/api/store_address'), method: 'GET' })
}

// 距离国控点-天府
export const getDistanceAqi = (): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/api/epInfoAqi'), method: 'GET' })
}

// 超标案件结案统计-青羊
export const getStatSysCase = (): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/api/statSysCase'), method: 'GET' })
}

// 离线案件结案统计-青羊
export const getStatLxCase = (): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/api/statLxCase'), method: 'GET' })
}

// 设备列表
export const getList_30 = (con: any): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/companies/list_30'), method: 'POST', data: con })
}

// 网络理政详细信息
export const lzCaseHistoryQuery = (con: any): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/case/lzCaseHistoryQuery'), method: 'POST', data: con })
}

// 超标/离线案件信息
export const sysCaseHistoryQuery = (con: any): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/case/sysCaseHistoryQuery'), method: 'POST', data: con })
}

// 获取超标信息
export const getMoreDay3 = (con: any): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/statistics/getMoreDay3'), method: 'POST', data: con })
}

// 企业信息
export const getCompanyRef = (con: any): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/companyReference/getCompanyRef'), method: 'POST', data: con })
}

// 选址清单信息
export const storeQueryOne = (con: any): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/companyReference/storeQueryOne'), method: 'POST', data: con })
}

// 证照联审信息
export const storeAuditQueryHis = (con: any): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/companyReference/storeAuditQueryHis'), method: 'POST', data: con })
}

// 获取区域数据
export const getAreaData = (params: any): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/users/area'), method: 'get', params })
}

// 企业信息搜索
export const getCompanyInfo = (params: any): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/companyReference/list'), method: 'get', params })
}

// 禁止选址清单搜索
export const getProhibitedSite = (params: any): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/companyReference/storeQuery'), method: 'post', params })
}

// 案件统计搜索 (exceed-超标)
export const getCaseByExceedList = (params: any): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/case/querySysCase'), method: 'get', params })
}

// 案件统计搜索 (offline-离线)
export const getCaseByOfflineList = (params: any): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/case/querySysCase_LX'), method: 'get', params })
}

// 案件统计搜索 (complain-投诉)
export const getCaseByComplainList = (params: any): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/case/queryLZCaseOne'), method: 'get', params })
}

// 证件审批统计
export const getLicenseDetail = (params: any): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/companyReference/storeAuditQuery'), method: 'get', params })
}

// 获取详情 (二级) - 企业信息
export const getCompanyDetail = (id: any): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/companyReference/getCompanyRef'), method: 'post', data: { id } })
}

// 禁止选址清单详情
export const getStoreLocationDetail = (id: any): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/companyReference/storeQueryOne'), method: 'post', data: { id } })
}

// 案件信息详情 - 超标/离线
export const getCaseDetail = (id: any): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/case/sysCaseHistoryQuery'), method: 'post', data: { case_id: id } })
}

// 案件信息详情 - 投诉
export const getComplainCaseDetail = (id: any): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/case/lzCaseHistoryQuery'), method: 'post', data: { case_id: id } })
}

// 证照审批信息详情
export const getLicenseSubDetail = (id: any): Promise<AxiosResponse<any>> => {
  return service({ url: URL('/companyReference/storeAuditQueryHis'), method: 'post', data: { case_id: id } })
}
