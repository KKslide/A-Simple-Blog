<template>
  <div class="hzy-container">
    <el-row class="row_title">
      <el-col :span="8" />
      <el-col :span="8">
        <div class="title">
          <h3 class="title_text">{{ companyInfo.platform_name }}</h3>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="options">
          <div class="screen" @click="fullScreenHandler">
            <span :class="['iconfont', isFull ? 'icon-hzy24gl-fullScreenExit3' : 'icon-hzy24gf-fullScreenEnter']"></span>
            <span>全屏</span>
          </div>
          <div class="user">
            <span class="iconfont icon-hzyyonghu"></span>
            <span>{{ companyInfo.user_name || '用户' }}</span>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row class="row_content">
      <!-- 左侧 -->
      <el-col class="left_wrapper" :span="6">
        <div class="content_box">
          <div class="l_content top">
            <div class="bg_title">企业总数: {{ surveyData?.all || 0 }}家</div>
            <div class="detail">
              <PieCompany :echarts="Echarts" :data="surveyData" />
            </div>
          </div>
          <div class="l_content middle">
            <div class="bg_title">餐饮类别</div>
            <div class="detail">
              <PieFoodCategory :echarts="Echarts" :data="surveyData?.cuisine" />
            </div>
          </div>
          <div class="l_content bottom">
            <div class="bg_title">禁止选址清单: {{ StoreAddress?.all || 0 }}家</div>
            <div class="detail">
              <BarProhibitedSite :echarts="Echarts" :data="StoreAddress" />
            </div>
          </div>
        </div>
      </el-col>
      <!-- 中间 -->
      <el-col class="center_wrapper" :span="12">
        <div class="divice_list">
          <div class="bg_title">设备状态</div>
          <DeviceList />
        </div>
        <div class="hzy-baidu-map">
          <BaiduMap v-if="mapReady" :echarts="Echarts" :data="allData" :cur-list="curList" />
        </div>
      </el-col>
      <!-- 右侧 -->
      <el-col class="right_wrapper" :span="6">
        <div class="content_box">
          <div class="r_content top">
            <div class="bg_title">案件统计(本年度)</div>
            <div class="detail">
              <BarCase :echarts="Echarts" :data="CaseTotalData" />
            </div>
          </div>
          <div class="r_content middle">
            <div class="bg_title">
              投诉趋势图(
              <span v-if="complainChart" style="position: relative">
                {{ complainChart.yearNames[complainChart.selectedYear] }}
                <el-select
                  v-if="complainChart && complainChart.yearNames"
                  v-model="complainChart.selectedYear"
                  :suffix-icon="''"
                  style="position: absolute; left: 0; opacity: 0"
                  class="bg_title_selector"
                >
                  <el-option
                    v-for="[k, v], index in Object.entries(complainChart.yearNames)"
                    :key="index"
                    :label="v"
                    :value="k"
                  ></el-option>
                </el-select>
              </span>
              )
            </div>
            <div class="detail">
              <LineComplaintTrendsCopy ref="complainChart" :echarts="Echarts" :data="ComplaintData" />
            </div>
          </div>
          <div class="r_content bottom">
            <div class="bg_title">
              证照审批统计(
              <el-select v-model="licenseYear" :suffix-icon="''" style="width: 2.8rem" class="bg_title_selector">
                <el-option label="2022年" :value="2022"></el-option>
                <el-option label="2023年" :value="2023"></el-option>
                <el-option label="2024年" :value="2024"></el-option>
                <el-option label="2025年" :value="2025"></el-option>
              </el-select>
              )
            </div>
            <div class="detail">
              <LicenseApprove :data="LicenseData" :year="licenseYear" />
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>

  <CommonDialog />
</template>

<script setup lang="ts">
import { ElLoading } from 'element-plus'
import { ref, reactive, onMounted, onBeforeUnmount, watch, nextTick, provide } from 'vue'
import { useRouter } from 'vue-router'
import { useDialogStore } from '@/views/client/Portfolio/HengzhiyuanMap/stores/dialogStore'
import {
  getAreaData,
  isLogin,
  getEpSurvey_chart,
  getAll,
  getStore_address,
  getLiveCaseData,
  getCaseTotalData,
  getComplaint_chart,
  getZhShow_cd,
  HZY_TOKEN_KEY,
} from '@/api/hengzhiyuan'
import DeviceList from './components/DeviceList.vue'
import BaiduMap from './components/BaiduMap.vue'
import PieCompany from './components/PieCompany.vue'
import PieFoodCategory from './components/PieFoodCategory.vue'
import BarProhibitedSite from './components/BarProhibitedSite.vue'
import BarCase from './components/BarCase.vue'
import LineComplaintTrendsCopy from './components/LineComplaintTrends.vue'
import LicenseApprove from './components/LicenseApprove.vue'
import CommonDialog from './components/CommonDialog.vue'
import { useAllList } from '@/views/client/Portfolio/HengzhiyuanMap/hooks/AllListHanlder'
import { ensureBaiduMap } from './utils/loadBaiduMap'

const loadingInstance = ref<any>(null)
const router = useRouter()
const dialogStore = useDialogStore()
const { isFull, deviceList, companyInfo, basicAreaParams, Echarts, getData, setDeviceList, fullScreenHandler } =
  useAllList()
const surveyData = reactive<any>({})
const StoreAddress = reactive<any>({})
const LiveCaseData = reactive<any>({})
const CaseTotalData = reactive<any>({})
const ComplaintData = reactive<any>({})
const LicenseData = reactive<any>({})
const allData = reactive<any[]>([])
const licenseYear = ref(2025)
const curList = ref('all')
const complainChart = ref<any>(null)
const mapReady = ref(false)
let reloadTimer: ReturnType<typeof setTimeout> | null = null

onMounted(async () => {
  isLogin().then((loginRes: any) => {
    if (loginRes.status != 200 || loginRes.data.code != 2000) {
      localStorage.removeItem(HZY_TOKEN_KEY)
      router.replace({ name: 'hzyLogin' })
    }
  })

  // 百度地图脚本必须先于 BaiduMap 子组件挂载
  try {
    await ensureBaiduMap()
    mapReady.value = true
  } catch (error) {
    console.error('百度地图资源加载失败', error)
  }

  await nextTick()
  loadPage()
})

onBeforeUnmount(() => {
  if (reloadTimer) {
    clearTimeout(reloadTimer)
    reloadTimer = null
  }
  loadingInstance.value?.close?.()
})

watch(
  () => allData,
  (nv) => setDeviceList(nv),
  { deep: true },
)

watch(
  () => licenseYear.value,
  async (nv) => {
    const {
      data: { list },
    } = await getData(getZhShow_cd, { year: nv })
    Object.assign(LicenseData, list)
  },
)

async function loadPage() {
  loadingInstance.value = ElLoading.service({ text: '数据加载中' })

  const [
    getAreaDataRes,
    getComponyInfoRes,
    getAllDataRes,
    getStoreAddressRes,
    getLiveCaseRes,
    getCaseTotalDataRes,
    getComplaintDataRes,
    getLicenseDataRes,
  ] = await Promise.all([
    getData(getAreaData, basicAreaParams.value),
    getData(getEpSurvey_chart),
    getData(getAll),
    getData(getStore_address),
    getData(getLiveCaseData),
    getData(getCaseTotalData),
    getData(getComplaint_chart),
    getData(getZhShow_cd),
  ])
  const {
    data: { list: areaData },
  } = getAreaDataRes
  const {
    data: { list: _list },
  } = getComponyInfoRes
  const {
    data: { list: __list },
  } = getAllDataRes
  const {
    data: { list: ___list },
  } = getStoreAddressRes
  const {
    data: { list: ____list },
  } = getLiveCaseRes
  const {
    data: { list: _____list },
  } = getCaseTotalDataRes
  const {
    data: { listLast, listLastTow, listNow, yearName },
  } = getComplaintDataRes
  const {
    data: { list: ______list },
  } = getLicenseDataRes

  dialogStore.setAreaData(areaData)
  Object.assign(surveyData, _list)
  Object.assign(allData, __list)
  Object.assign(StoreAddress, ___list)
  Object.assign(LiveCaseData, ____list)
  Object.assign(CaseTotalData, _____list)
  Object.assign(ComplaintData, { listLast, listLastTow, listNow, yearName })
  Object.assign(LicenseData, ______list)

  loadingInstance.value.close()

  // 每 10 分钟重新拉取一次
  reloadTimer = setTimeout(() => {
    loadPage()
  }, 10 * 60 * 1000)
}

provide('deviceList', { curList, deviceList })
</script>
