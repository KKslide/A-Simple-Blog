<template>
  <div>
    <el-form :model="form" :inline="true">
      <el-form-item style="margin-right:15px;">
        <Cascader v-model:id="form.area_id" style="width: 250px" />
      </el-form-item>
      <el-form-item style="width:100px;margin-right:15px;">
        <el-select v-model="form.monitoring_status" placeholder="总数">
          <el-option :value="''" label="总数"></el-option>
          <el-option value="1" label="正常"></el-option>
          <el-option value="3" label="预警"></el-option>
          <el-option value="2" label="超标"></el-option>
          <el-option value="0" label="离线"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="pageChange(1)">搜索</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="tableData" style="width: 100%" height="400px" border>
      <el-table-column prop="company_name" label="企业名称" min-width="120"/>
      <el-table-column prop="devices_id" label="监控仪编号" min-width="120"/>
      <el-table-column prop="area_name" label="区域" />
      <el-table-column prop="monitorStatus" label="监控仪状态">
        <template #default="scope">
          <div v-html="scope.row.monitorStatus"></div>
        </template>
      </el-table-column>
      <el-table-column prop="oilFume" label="油烟浓度">
        <template #default="scope">
          <div v-html="scope.row.oilFume"></div>
        </template>
      </el-table-column>
      <el-table-column prop="avg_particulate_30" label="颗粒物浓度" />
      <el-table-column prop="avg_non_methane_30" label="非甲烷总烃浓度" min-width="110"/>
      <el-table-column prop="setPurifierStatus" label="净化器状态">
        <template #default="scope">
          <div v-html="scope.row.setPurifierStatus"></div>
        </template>
      </el-table-column>
      <el-table-column prop="fanStatus" label="排风机状态">
         <template #default="scope">
          <div v-html="scope.row.fanStatus"></div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      layout="prev, pager, next"
      :current-page="form.page"
      :total="totalCount"
      @current-change="pageChange"
    />
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { Search } from '@element-plus/icons-vue'
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useDialogStore } from '@/views/client/Portfolio/HengzhiyuanMap/stores/dialogStore'
import Cascader from './Cascader.vue'
const dialogStore = useDialogStore()
const { form, totalCount, table } = storeToRefs(dialogStore)
function pageChange(pageIndex) {
  form.value.page = pageIndex
  dialogStore.getList()
}

// monitoring_status
function setMonitorStatus(res) {
  var str = "";
  if (parseInt(res.monitoring_status) == 0) {
    str = "<span>离线</span>";
  } else if (parseInt(res.monitoring_status) == 1) {
    str = '<span class="txt_c2">在线</span>';
  } else {
    str = '<span style="color:#fd8c21;">待机</span>'
  }
  if (res.lx_type == 44 || res.lx_type == "44") {
    str = '<span style="color:#fd8c21;">设备故障</span>'
  }
  else if (res.lx_type == 5 || res.lx_type == "5") {
    str = '<span style="color:#fd8c21;">监控设备未正常供电</span>'
  }
  else if (res.lx_type == 6 || res.lx_type == "6") {
    str = '<span style="color:#fd8c21;">监控设备与净化器联动，未正常使用净化设备</span>'
  }
  else if (res.lx_type == 7 || res.lx_type == "7") {
    str = '<span style="color:#fd8c21;">其他原因</span>'
  }
  if (res.operating_state == 's') {
    str = '<span style="color:#fd8c21;">暂停营业</span>'
  }
  if (res.operating_state == 'c') {
    str = '<span style="color:#fd8c21;">结业(倒闭)</span>'
  }

  return str;

}
// avg_soot_30
function setOilFumeConcentration(res) {
  var str = "";
  if (parseFloat(res.avg_soot_30) >= 2) {
    str = "<span style='color: red;'>" + res.avg_soot_30 + "</span>";
  }
  else {
    str = res.avg_soot_30;
  }
  if (res.renewal_period_type == 3) {
    str = "<span style='color: red;font-weight:800;'>服务到期</span>";
  }
  return str;
}
// purifier_status
function setPurifierStatus(res) {
  var purifier_status = (parseInt(res.purifier_status) == 0) ? "<span>关闭</span>" : '<span class="txt_c2">开启</span>';
  return purifier_status;
}
// fen_status
function setFanStatus(res) {
  var fen_status = (parseInt(res.fen_status) == 0) ? "<span>关闭</span>" : '<span class="txt_c2">开启</span>';
  return fen_status;
}

const tableData = computed(() => {
  table.value.forEach(v => {
    v.monitorStatus = setMonitorStatus(v)
    v.oilFume = setOilFumeConcentration(v)
    v.setPurifierStatus = setPurifierStatus(v)
    v.fanStatus = setFanStatus(v)
  })
  return table.value
})

onMounted(() => {
  const { monitoring_status } = dialogStore.clickItem

  const formData = {
    page: 1,
    limit: 10,
    area_id: '',
    level: 0,
    monitoring_status,
    is_status: '0',
    bind_vedio: '0',
    is_bind: '2',
  }

  dialogStore.setForm(formData)
  dialogStore.getList()
})
</script>

