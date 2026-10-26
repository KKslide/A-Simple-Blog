import { ref, reactive, computed, type Ref } from 'vue'
import { getAreaData, HZY_IMG_DOMAIN } from '@/api/hengzhiyuan'
import { useDialogStore } from '@/views/client/Portfolio/HengzhiyuanMap/stores/dialogStore'
import { storeToRefs } from 'pinia'

// --- 数据映射表: 优化海量 if/else ---
const businessScopeMap: Record<string, string> = {
  '1': '散装食品和预包装食品销售',
  '1.1': '散装食品和预包装食品销售（含冷藏冷冻食品销售）',
  '1.2': '预包装食品（不含冷藏冷冻食品）销售',
  '1.3': '散装食品和预包装食品销售（含散装熟食销售）',
  '1.4': '散装食品和预包装食品销售（不含散装熟食销售）',
  '1.5': '散装食品和预包装食品销售（含保健食品销售）',
  '1.6': '散装食品和预包装食品销售（含特殊医学用途配方食品销售）',
  '1.7': '散装食品和预包装食品销售（含婴幼儿配方乳粉销售）',
  '1.8': '散装食品和预包装食品销售（含其他婴幼儿配方食品销售）',
  '2': '散装食品销售',
  '2.1': '散装食品销售（含冷藏冷冻食品销售',
  '2.2': '散装食品（不含冷藏冷冻食品）销售',
  '2.3': '散装食品销售（含散装熟食销售）',
  '2.4': '散装食品销售（不含散装熟食销售）',
  '3.1': '保健食品销售',
  '3.2': '特殊医学用途配方食品销售',
  '3.3': '婴幼儿配方乳粉销售',
  '3.4': '其他婴幼儿配方食品销售',
  '4': '其他类食品销售',
  '5': '热食类食品制售',
  '5.1': '热食类食品制售（简单制售）',
  '6': '冷食类食品制售',
  '6.1': '冷食类食品制售（含冷加工糕点制售）',
  '6.2': '冷食类食品制售（含冷荤类食品制售）',
  '6.3': '冷食类食品制售（简单制售）',
  '7': '生食类食品制售',
  '8': '糕点类食品（含裱花蛋糕）制售',
  '8.1': '糕点类食品（不含裱花蛋糕）制售',
  '9.1': '自制饮品制售',
  '9.2': '自制饮品制售（含乙醇饮料制售）',
  '9.3': '自制饮品制售（简单制售）',
  '10': '其他类食品制售',
  '11': '半成品制售（仅限中央厨房申请）',
  '12': '仅简单制售',
  '13': '食品销售连锁管理',
  '13.1': '食品销售连锁管理（仅简单制售）',
  '14': '餐饮服务连锁管理',
  '14.1': '餐饮服务管理',
}
const auditCreateTypeMap: Record<string, string> = { '1': '新办', '2': '续办' }
const addressVMap: Record<string, string> = {
  '1': '居民住宅楼',
  '2': '未配套设立专用烟道的商住综合楼',
  '3': '商住综合楼内与居住层相邻的商业楼层内',
  '4': '配套设立专用烟道的商住综合楼内与居住层不相邻的商业楼层',
  '5': '临近居民住宅楼、存在油烟扰民风险的非住宅楼和非商住楼内',
  '6': '其他',
}
const caseRsMap: Record<string, string> = { '1': '审核通过', '2': '审核未通过' }
const booleanMap: Record<string, string> = { '1': '是', '0': '否', '2': '否' }

const storeValueMap: Record<string, string> = {
  '1': '产生油烟餐饮',
  '3': '不产生油烟餐饮',
  '2': '其他',
}

/**
 * 弹窗 / 详情页数据格式化
 */
export function useDialog(dataRef: Ref<any>) {
  const dialogStore = useDialogStore()
  const { form } = storeToRefs(dialogStore)
  const areaOptions = ref<any[]>([])
  const cascaderProps = reactive<any>({
    value: 'code',
    label: 'name',
    children: 'children',
    leaf: 'isLeaf',
    checkStrictly: true,
    emitPath: false,
    lazy: true,
    async lazyLoad(node: any, resolve: any) {
      const { level } = node
      if (level === 0) {
        resolve(dialogStore.areaData || [])
      } else if (node.level === 1) {
        const { code, level } = node.data
        const listRes = await getAreaData({ level: level + 1, parent: code })
        const {
          data: { list },
        } = listRes
        const children = list.map((child: any) => ({
          ...child,
          isLeaf: true,
        }))
        resolve(children)
      }
    },
  })

  // 基础数据映射表
  const mappings: Record<string, Record<string, string>> = {
    operating_state: { n: '正常', s: '停业', c: '注销', a: '全部' },
    scale: { s: '小型', m: '中型', l: '大型', xl: '超大型' },
    monitoring_level: { p: '重点监控', g: '一般监控', n: '暂不监控' },
    company_type: { '1': '餐饮企业', '2': '机关食堂' },
    booleanLike: { '1': '是', '0': '否', '2': '否' },
    purifier_install: { '1': '已安装', '2': '未安装', '3': '无需安装' },
  }

  /**
   * 通用映射函数
   * @param type 映射类型 (如 'scale')
   * @param key 要转换的键
   */
  const getMappedValue = (type: string, key: any): string => {
    return mappings[type]?.[key] || '未知'
  }

  // 处理可能为空的文本值
  const formatText = (value: any): string => value || '--'

  // 格式化时间戳 (秒) 为日期字符串
  const formatDate = (timestamp: any): string => {
    if (!timestamp) return '--'
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  // 响应式的、格式化后的数据对象
  const formattedStore = computed(() => {
    const store = dataRef.value || {}
    return {
      store_name: formatText(store.store_name),
      door_name: formatText(store.door_name),
      areaname: formatText(store.areaname),
      roadway: formatText(store.roadway),
      store_value: storeValueMap[store.store_value] || '未知',
      address_v: addressVMap[store.address_v] || '未知',
      ctime: formatDate(store.ctime),
    }
  })

  const formattedData = computed(() => {
    const company = dataRef.value || {}
    return {
      company_name: formatText(company.company_name),
      company_yyzz: formatText(company.company_yyzz),
      company_yyzz_id: formatText(company.company_yyzz_id),
      area_name: formatText(company.area_name),
      address: formatText(company.address),
      contacts: formatText(company.contacts),
      phone: formatText(company.phone),
      cuisineName: formatText(company.cuisineName),
      operating_state: getMappedValue('operating_state', company.operating_state),
      scale: getMappedValue('scale', company.scale),
      monitoring_level: getMappedValue('monitoring_level', company.monitoring_level),
      company_type: getMappedValue('company_type', company.company_type),
      produce_soot: getMappedValue('booleanLike', company.produce_soot),
      purifier_install: getMappedValue('purifier_install', company.purifier_install),
      is_bind2: getMappedValue('booleanLike', company.is_bind2),
      foodexpire_all: getMappedValue('booleanLike', company.foodexpire_all),
      create_time: formatDate(company.create_time),
    }
  })

  const formatDateTime = (timestamp: any): string => {
    if (!timestamp) return '--'
    return new Date(timestamp * 1000).toLocaleString('zh-CN', { hour12: false })
  }
  const mapValue = (map: Record<string, string>, key: any): string =>
    key !== undefined && key !== null && map[key] ? map[key] : '--'

  // 复杂逻辑函数
  const formatBusinessScope = (scopeString: string): string => {
    if (!scopeString) return '--'
    return scopeString
      .split(',')
      .map((key) => businessScopeMap[key] || `未知代码(${key})`)
      .join('，')
  }

  // 响应式的格式化数据
  const caseInfo = computed(() => dataRef.value?.list || {})
  const history = computed<any[]>(() => dataRef.value?.listHis || [])

  const formattedCaseInfo = computed(() => {
    const data = caseInfo.value
    return {
      ...data,
      create_time_formatted: formatDateTime(data.create_time),
      businessScope_formatted: formatBusinessScope(data.businessScope),
      audit_create_type_formatted: mapValue(auditCreateTypeMap, data.audit_create_type),
      case_rs_formatted: mapValue(caseRsMap, data.case_rs),
      finish_time_formatted: formatDateTime(data.finish_time),
    }
  })

  const formattedHistory = computed(() => {
    return history.value.map((item) => {
      const photoKeys = ['imgurl_1', 'imgurl_2', 'imgurl_3', 'imgurl_4', 'imgurl_5', 'imgurl_6', 'imgurl_7']
      const photoLabels: Record<string, string> = {
        imgurl_1: '门头照片',
        imgurl_2: '炉灶照片',
        imgurl_3: '烟罩照片',
        imgurl_4: '风机照片',
        imgurl_5: '净化设备',
        imgurl_6: '核查人照片',
        imgurl_7: '营业执照',
      }

      const photos = photoKeys
        .filter((key) => item[key])
        .map((key) => ({
          key,
          label: photoLabels[key],
          url: item[key],
        }))

      return {
        ...item,
        create_time_formatted: formatDateTime(item.create_time),
        address_v_formatted: mapValue(addressVMap, item.address_v),
        is_fry_formatted: mapValue(booleanMap, item.is_fry),
        is_make_formatted: mapValue(booleanMap, item.is_make),
        address_agree_formatted: mapValue(booleanMap, item.address_agree),
        hc_res_1_formatted: mapValue(booleanMap, item.hc_res_1),
        hc_res_2_formatted: mapValue(booleanMap, item.hc_res_2),
        hc_res_3_formatted: mapValue(booleanMap, item.hc_res_3),
        hc_res_4_formatted: mapValue(booleanMap, item.hc_res_4),
        photos,
      }
    })
  })

  // 包含所有历史记录图片 URL 的扁平数组, 用于全局预览
  const allHistoryImageUrls = computed(() => {
    return formattedHistory.value.flatMap((item: any) => item.photos.map((p: any) => HZY_IMG_DOMAIN + p.url))
  })

  return {
    areaOptions,
    cascaderProps,
    form,
    formattedData,
    formattedStore,
    formatText,
    formattedCaseInfo,
    formattedHistory,
    allHistoryImageUrls,
  }
}
