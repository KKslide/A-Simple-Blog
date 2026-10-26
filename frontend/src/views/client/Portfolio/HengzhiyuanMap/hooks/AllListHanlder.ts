import { ref, reactive, onMounted, computed } from 'vue'
import { useECharts } from '@/views/client/Portfolio/HengzhiyuanMap/composables/useECharts'
import { HZY_COMPANY_INFO_KEY } from '@/api/hengzhiyuan'

/**
 * 地图页公共数据 / 设备状态 / 全屏处理
 */
export function useAllList() {
  const isFull = ref(false)
  const companyInfo = reactive<any>({})
  const Echarts = ref<any>(null)
  const deviceList = reactive<any[]>([
    { title: '设备总数', val: '0000', status: 'all', color: '#76bef5', icon: 'icon-hzyziyuanxhdpi' },
    { title: '正  常', val: '0000', status: 'normal', color: '#aae754', icon: 'icon-hzypurifier_status' },
    { title: '预  警', val: '0000', status: 'warning', color: '#e7c981', icon: 'icon-hzyyujing' },
    { title: '超  标', val: '0000', status: 'exceed', color: '#fa5c4d', icon: 'icon-hzychaobiaobaojing' },
    { title: '离  线', val: '0000', status: 'offline', color: '#d1d1d1', icon: 'icon-hzylixian1' },
  ])

  const basicAreaParams = computed(() => {
    const { level: _level, area_id: parent } = companyInfo
    let _level_ = Number(_level)
    _level_ += _level_ < 5 ? 1 : 0
    return { level: _level_, parent }
  })

  // 补零算法
  function PrefixInteger(num: number, length: number): string {
    return (Array(length).join('0') + num).slice(-length)
  }

  function setDeviceList(list: any[]) {
    const {
      warning_soot_min,
      soot_threshold,
      particulate_threshold,
      non_methane_threshold,
    } = companyInfo.config || {}

    const _all = {
      title: '设备总数',
      val: PrefixInteger(list.length, 4),
      status: 'all',
      color: '#76bef5',
      icon: 'icon-hzyziyuanxhdpi',
    }
    const _warn = {
      title: '预  警',
      val: PrefixInteger(
        list.filter((v) => {
          return Number(v.soot) > warning_soot_min && Number(v.soot) <= soot_threshold
        }).length,
        4,
      ),
      status: 'warning',
      color: '#e7c981',
      icon: 'icon-hzyyujing',
    }
    const _exceed = {
      title: '超  标',
      val: PrefixInteger(
        list.filter((v) => {
          return (
            Number(v.soot) > soot_threshold ||
            Number(v.particulate) > particulate_threshold ||
            Number(v.non_methane) > non_methane_threshold
          )
        }).length,
        4,
      ),
      status: 'exceed',
      color: '#fa5c4d',
      icon: 'icon-hzychaobiaobaojing',
    }
    const _offline = {
      title: '离  线',
      val: PrefixInteger(
        list.filter((v) => {
          return v.monitoring_status == 0
        }).length,
        4,
      ),
      status: 'offline',
      color: '#d1d1d1',
      icon: 'icon-hzylixian1',
    }
    const _normal = {
      title: '正  常',
      val: PrefixInteger(
        list.length - Number(_warn['val']) - Number(_exceed['val']) - Number(_offline['val']),
        4,
      ),
      status: 'normal',
      color: '#aae754',
      icon: 'icon-hzypurifier_status',
    }
    setTimeout(() => {
      deviceList.length = 0
      deviceList.push(...[_all, _normal, _warn, _exceed, _offline])
    }, 800)
  }

  function fullScreenHandler() {
    const de = document.documentElement as any

    if (!isFull.value) {
      if (de.requestFullscreen) {
        de.requestFullscreen()
      } else if (de.mozRequestFullScreen) {
        de.mozRequestFullScreen()
      } else if (de.webkitRequestFullScreen) {
        de.webkitRequestFullScreen()
      }
      isFull.value = true
    } else {
      const doc = document as any
      if (doc.exitFullscreen) {
        doc.exitFullscreen()
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen()
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen()
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen()
      }
      isFull.value = false
    }
  }

  function setComponyInfo() {
    Object.assign(companyInfo, JSON.parse(localStorage.getItem(HZY_COMPANY_INFO_KEY) || '{}'))
  }

  async function getData(fn: (...args: any[]) => Promise<any>, params: any = {}) {
    return fn(params)
  }

  onMounted(async () => {
    setComponyInfo()
    Echarts.value = await useECharts()
  })

  return { isFull, deviceList, companyInfo, basicAreaParams, Echarts, getData, setDeviceList, fullScreenHandler }
}
