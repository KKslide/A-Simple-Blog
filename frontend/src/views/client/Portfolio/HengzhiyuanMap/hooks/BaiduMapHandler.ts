import { reactive } from 'vue'
import { HZY_COMPANY_INFO_KEY, HZY_IMG_DOMAIN } from '@/api/hengzhiyuan'

/**
 * 百度地图弹窗 / tooltip 数据格式化
 */
export function useBaiduMap() {
  const { config } = JSON.parse(localStorage.getItem(HZY_COMPANY_INFO_KEY) || '{}')

  // 颜色映射表, 方便维护
  const colorMap = reactive<Record<string, string>>({
    all: '#76bef5',
    normal: '#aae754',
    warning: '#e7c981',
    exceed: '#fa5c4d',
    offline: '#d1d1d1',
    online: '#aae754',
  })

  let status: string | undefined
  let title: string | undefined

  const cuisineMap: Record<string, string> = { '1': '炒制类', '2': '烧烤类', '3': '火锅类', '4': '蒸煮类', '5': '煎炸类', '6': '饮品类' }
  const levelMap: Record<string, string> = { g: '一般', p: '重点', c: '常态' }
  const scaleMap: Record<string, string> = { s: '小', m: '中', l: '大' }
  const monitorStatusMap: Record<string, string> = { '0': '离线', '1': '在线', '2': '待机' }
  const purifierStatusMap: Record<string, string> = { '1': '开启', '0': '关闭' }
  const fanStatusMap: Record<string, string> = { '1': '开启', '0': '关闭' }

  function setStatusAndTitle(data: any) {
    const { soot, monitoring_status, particulate, non_methane, company_name, address, scale, cuisine, monitoring_level, door_photo_url } = data
    const { warning_soot_min, soot_threshold, particulate_threshold, non_methane_threshold } = config
    if (monitoring_status == 0) {
      status = 'offline'
      title = '离线'
    } else if (soot <= warning_soot_min) {
      status = 'online'
      title = '正常'
    } else if (soot <= soot_threshold) {
      status = 'warning'
      title = '预警'
    } else if (soot > soot_threshold || particulate > particulate_threshold || non_methane > non_methane_threshold) {
      status = 'exceed'
      title = '超标'
    }
    return { title, status, company_name, address, scale, cuisine, monitoring_level, door_photo_url }
  }

  function setTooltipHTML(params: any) {
    const {
      company_name,
      address,
      scale: _scale,
      cuisine: _cuisine,
      monitoring_level: _level,
    } = setStatusAndTitle(params.data.rawData)
    const cuisine = cuisineMap[_cuisine] || '其他'
    const level = levelMap[_level] || '普通'
    const scale = scaleMap[_scale]
    return `
      <div style="border-radius:3px;padding:5px;">
        <div style="margin-bottom:5px;">
          <h3 style="margin:0 0 3px 0;display:inline-block;">
              ${company_name}
              <span style="border-radius:3px;background-color:${colorMap[status as string]};color:#fff;padding:2px 4px;font-size:12px;font-weight:normal;">
                ${title}
              </span>
          </h3>
        </div>
        <div style="margin-right:5px;">
          <div>地点: ${address}</div>
          <div>规模: ${scale}</div>
          <div>菜系: ${cuisine}</div>
          <div>监控级别: ${level}</div>
          <div>状态: ${title}</div>
        </div>
      </div>
    `
  }

  function setDetailData(data: any) {
    const { title, status, door_photo_url } = setStatusAndTitle(data)
    const detailData = {
      title: data.company_name,
      status,
      statusText: title,
      statusColor: colorMap[status as string],
      doorImage: door_photo_url ? HZY_IMG_DOMAIN + door_photo_url : '',
      descList: [
        { label: '地点:', value: data.address, icon: 'icon-hzydidiandingwei_o' },
        { label: '规模:', value: scaleMap[data.scale], icon: 'icon-hzyguimo' },
        { label: '编码:', value: data.devices_id, icon: 'icon-hzya-zu10' },
        { label: '菜系:', value: cuisineMap[data.cuisine], icon: 'icon-hzyzidongtoucaixitongtubiao512_chaocai' },
        { label: '电话:', value: `${data.phone}(${data.contacts})`, icon: 'icon-hzydianhua' },
        { label: '监控级别:', value: levelMap[data.monitoring_level], icon: 'icon-hzyjiankong' },
      ],
      scatteredData: [
        { label: '油烟浓度', value: data.soot + 'mg/m³', icon: 'icon-hzyoil_fume_concentration' },
        { label: '颗粒物浓度', value: data.particulate + 'mg/m³', icon: 'icon-hzyparticle_concentration' },
        { label: '非甲烷总烃', value: data.non_methane + 'mg/m³', icon: 'icon-hzynon_methane_hydrocarbons' },
        { label: '监控仪状态', value: monitorStatusMap[data.monitoring_status], icon: 'icon-hzymonitor_status' },
        { label: '净化器状态', value: purifierStatusMap[data.purifier_status], icon: 'icon-hzypurifier_status' },
        { label: '排风机状态', value: fanStatusMap[data.fen_status], icon: 'icon-hzypaifengshan' },
        { label: '附近监测站', value: data.station || '-', icon: 'icon-hzynearby_monitoring_stations' },
        { label: 'AQI', value: data.AQI || '-', icon: 'icon-hzyaqi' },
        { label: '空气质量等级', value: data.quality || '-', icon: 'icon-hzyair_quality_level' },
        { label: 'PM2.5', value: data.PM2_5 || '-', icon: 'icon-hzypm25' },
        { label: 'PM10', value: data.PM10 || '-', icon: 'icon-hzyPM10' },
        { label: '首要污染物', value: data.pollutions || '-', icon: 'icon-hzyprimary_pollutants' },
      ],
    }
    return detailData
  }

  return { config, colorMap, HZY_IMG_DOMAIN, setTooltipHTML, setDetailData }
}
