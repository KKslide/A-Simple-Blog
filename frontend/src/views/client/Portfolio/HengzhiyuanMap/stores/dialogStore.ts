import { defineStore } from 'pinia'
import {
  // 设备列表
  getList_30,
  getCompanyInfo,
  getProhibitedSite,
  getLicenseDetail,
  getCaseByExceedList,
  getCaseByOfflineList,
  getCaseByComplainList,
  // 二级页面详情
  getCompanyDetail,
  getStoreLocationDetail,
  getCaseDetail,
  getComplainCaseDetail,
  getLicenseSubDetail,
} from '@/api/hengzhiyuan'

/**
 * 餐饮油烟大管家 - 弹窗状态
 * store id 加 hzy 前缀, 避免和博客自身的 store 冲突.
 */
export const useDialogStore = defineStore('hzyDialog', {
  state: () => ({
    visible: false,
    title: '',
    formModel: '',
    form: {} as any,
    table: [] as any[],
    totalCount: 1,
    clickItem: null as any,
    areaData: null as any,
    apiList: {
      // 设备列表弹窗
      FormDeviceListModel: getList_30,
      FormCompanyOrFoodCategoryModel: getCompanyInfo,
      FormProhibitedSite: getProhibitedSite,
      /*
        [案件统计]相关的接口, 后端设计得比较特别...
          从[投诉, 离线, 超标]进入的请求接口都不一样, 所以这里加二级 key 存储不同的 Api
        [超标] 列表 -> /case/querySysCase (key: exceed)
        [离线] 列表 -> /case/querySysCase_LX (key: offline)
        [投诉] 列表 -> /case/queryLZCaseOne (key: complain)
        点击进入详情页还需要额外的请求.
      */
      FormCaseModel: {
        exceed: getCaseByExceedList,
        offline: getCaseByOfflineList,
        complain: getCaseByComplainList,
      },
      FormLicenseModel: getLicenseDetail,
      // 二级页面详情
      CompanyDetail: getCompanyDetail,
      StoreLocationDetail: getStoreLocationDetail,
      /*
        超标案件还有子接口, 用多一层 key 区分.
      */
      CaseDetail: {
        exceed: getCaseDetail,
        offline: getCaseDetail,
        complain: getComplainCaseDetail,
      },
      LicenseDetail: getLicenseSubDetail,
    } as any,
    // 以下是二级详情页面
    subDetailID: '',
    subVisivle: false,
    subDetailModel: '',
    subDetailData: { list: {} } as any,
  }),
  getters: {
    getTitle(state): string {
      const titleMap: Record<string, string> = {
        FormDeviceListModel: '设备信息',
        FormCompanyOrFoodCategoryModel: '企业信息',
        FormProhibitedSite: '禁止选址清单信息',
        FormCaseModel: '案件信息',
        FormLicenseModel: '证照审批信息',
      }
      return titleMap[state.formModel] || ''
    },
    getSubTitle(state): string {
      const titleMap: Record<string, string> = {
        CompanyDetail: '企业信息',
        StoreLocationDetail: '选址清单信息',
        CaseDetail: '案件信息',
        LicenseDetail: '证照联审信息',
      }
      return titleMap[state.subDetailModel] || ''
    },
  },
  actions: {
    toggleVisible() {
      // 临时缓存一下 areaData
      const _areaData = this.areaData
      this.visible = !this.visible
      if (!this.visible) {
        this.$reset()
        this.setAreaData(_areaData)
      }
    },
    toggleSubVisible() {
      this.subVisivle = !this.subVisivle
      if (!this.subVisivle) {
        this.subDetailData = { list: {} }
        this.subDetailID = ''
        this.subDetailModel = ''
      }
    },
    setFormModel(model: string) {
      this.formModel = model
    },
    setForm(form: any) {
      this.form = form
    },
    setTable(table: any[]) {
      this.table = table
    },
    setClickItem(item: any) {
      this.clickItem = item
    },
    setAreaData(data: any) {
      this.areaData = data
    },
    // 请求数据
    async getList(extraKey?: string) {
      this.setTable([])
      /*
        请求前做 level 判断, 如果 area_id 存在 areaData 中, 就是其任一条数据的 level, 否则 +1
      */
      if (this.form.area_id) {
        const isEmpty = (this.areaData as any[]).filter((v) => v.code == this.form.area_id).length
        this.form.level = isEmpty ? 4 : 5
      }
      // 这里主要针对[案件统计]相关
      const apiRequest = extraKey
        ? this.apiList['FormCaseModel'][extraKey]
        : this.apiList[this.formModel]
      const { data } = await apiRequest(this.form)
      // 这两个接口还嵌套了一层 list
      if ('FormLicenseModel,FormCaseModel'.includes(this.formModel)) {
        this.setTable(data.list.list || [])
        this.totalCount = data.list.totalCount || 1
      } else {
        this.setTable(data.list || [])
        this.totalCount = data.totalCount || 1
      }
    },
    setSubDetailModel(name: string) {
      this.subDetailModel = name
    },
    setsubDetailID(id: string) {
      this.subDetailID = id
    },
    setSubDetailData(data: any) {
      this.subDetailData = data
    },
    async getDetail(id?: any) {
      /*
        获取[案件统计]的详情, 从 超标/离线/投诉 进入时接口不一样,
        所以从 clickItem 里取 type 做区分.
      */
      let subDetailRequest = this.apiList[this.subDetailModel]
      const { rawData: { type: subType } = {} } = this.clickItem || {}
      if (subType) {
        subDetailRequest = this.apiList['CaseDetail'][subType]
      }
      const { data } = await subDetailRequest(id || this.subDetailID)
      this.setSubDetailData(data)
    },
  },
})
