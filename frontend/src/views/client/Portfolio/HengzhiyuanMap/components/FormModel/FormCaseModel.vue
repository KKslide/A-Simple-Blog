<template>
  <div>
    <el-form :model="form" :inline="true">
      <el-form-item style="margin-right:15px;">
        <Cascader v-model:id="form.area_id" style="width: 250px" />
      </el-form-item>
      <el-form-item style="width:150px;margin-right:15px;">
        <el-select v-model="form.case_status">
          <el-option :value="'0'" label="全部"></el-option>
          <el-option :value="'4'" label="处理中"></el-option>
          <el-option :value="'3'" label="已结案"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="pageChange(1)">搜索</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="tableData" style="width: 100%" height="400px" border>
      <template v-if="'exceed,offline'.includes(tableType)">
        <el-table-column prop="case_id" label="案件编号" />
        <el-table-column prop="company_name" label="企业名称" />
        <el-table-column prop="devices_id" label="监控仪编号" />
        <el-table-column prop="area_name" label="区域" />
        <el-table-column prop="address" label="地址" />
        <el-table-column prop="contacts" label="联系人" />
        <el-table-column prop="phone" label="联系方式" />
        <el-table-column prop="his_type" label="流程状态">
          <template #default="scope">
            <span v-if="tableType=='exceed'">
              {{ exceedProcessMap[scope.row.his_type] }}
            </span>
            <span v-else>
              {{ setOfflineProcessStatus(scope.row) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="his_type"
          :label="tableType == 'exceed' ? '超标原因' : '离线原因'"
        >
          <template #default="scope">
            <span v-if="tableType == 'exceed'">
              {{ setExceedReason(scope.row) }}
            </span>
            <span v-else>
              {{ setOfflineReason(scope.row) }}
            </span>
          </template>
        </el-table-column>
      </template>

      <template v-if="tableType=='complain'">
        <el-table-column prop="lz_id" label="工单号" />
        <el-table-column prop="door_name" label="单位名称" />
        <el-table-column prop="area_name" label="区域" />
        <el-table-column prop="signfor_time" label="签收日期">
          <template #default="scope">
            {{ dateFormat('YYYY-mm-dd', scope.row.signfor_time * 1000) }}
          </template>
        </el-table-column>
        <el-table-column prop="complaint_type" label="问题类型">
          <template #default="scope">
            {{ setComplaintType(scope.row.complaint_type) }}
          </template>
        </el-table-column>
        <el-table-column prop="his_type" label="流程状态">
          <template #default="scope">
            {{ processMap[scope.row.his_type] }}
          </template>
        </el-table-column>
        <el-table-column prop="finist_time" label="结案时间" v-if="form.case_status=='3'">
          <template #default="scope">
            {{ dateFormat('YYYY-mm-dd', scope.row.finist_time * 1000) }}
          </template>
        </el-table-column>
        <el-table-column prop="complaint_txt" label="诉求内容" />
      </template>

      <el-table-column label="查看" width="80">
        <template #default="scope">
          <span style="cursor:pointer;padding:5px 10px" @click="checkDetail(scope.row.case_id)">
            <el-icon size="16"><View /></el-icon>
          </span>
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
import { View } from '@element-plus/icons-vue'
import { dateFormat } from '@/views/client/Portfolio/HengzhiyuanMap/utils'
import Cascader from './Cascader.vue'
import { Search } from '@element-plus/icons-vue'
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDialogStore } from '@/views/client/Portfolio/HengzhiyuanMap/stores/dialogStore'
// import { scrollbarProps } from 'element-plus'
const dialogStore = useDialogStore()
const { form, totalCount, table: tableData } = storeToRefs(dialogStore)
const tableType = ref('')
const processMap = ref({ 2: '现场核查', 3: '现场整改', 4: '跟进处理', 10: '已结案' })
const exceedProcessMap = ref({ 2: '现场核查', 3: '现场整改', 4: '跟进处理', 10: '已结案' })

function setOfflineProcessStatus(row) {
  let txt = "";
  if (row.his_type == 2) {
    txt = "现场核查";
  }
  else if (row.his_type == 3) {
    if (row.lx_cs == 1) {
      txt = "待商家恢复营业";
    }
    else if (row.lx_cs == 2) {
      txt = "商家已经结业";
    }
    else {
      txt = "商家整改中";
    }
  }
  else if (row.his_type == 10) {
    txt = "已结案";
  }
  return txt;
}

function setExceedReason(res) {
  var his2 = "-";
  if (res.his_type == 10 || res.his_type == "10") {
    if (res.cbReason !== undefined && res.cbReason != "") {
      var tyArr = res.cbReason.split(',');
      for (var x in tyArr) {
        if (tyArr[x] == "1") his2 += `高空净化器处理效率低`;
        else if (tyArr[x] == "2") his2 += `净化器故障未正常使用`;
        else if (tyArr[x] == "3") his2 += `净化器老旧无法正常工作`;
        else if (tyArr[x] == "4") his2 += `净化器处理风量不匹配`;
        else if (tyArr[x] == "5") his2 += `净化器脏未定期清洗`;
        else if (tyArr[x] == "6") his2 += `未安装高效油烟净化器`;
        else if (tyArr[x] == "7") his2 += `其它`;
        else if (tyArr[x] == "8") his2 += `油烟在线设备故障`;
      }
    }
    return his2;
  }
  else {
    return "待核查";
  }
}

function setOfflineReason(res) {
  if (res.his_type == 10 || res.his_type == "10") {
    if (res.lx_type == "1") return "暂停营业";
    else if (res.lx_type == "2") return "结业";
    else if (res.lx_type == "3") return "设备故障";
    else if (res.lx_type == "4") return "监控设备未正常供电";
    else if (res.lx_type == "5") return "监控设备与净化器联动，未正常使用净化设备";
    else if (res.lx_type == "6") return "其他原因";
    else return "-";
  }
  else {
    return "待核查";
  }
}

function setComplaintType (types) {
  if (types == "" || types === undefined) return "-";
  var tyArr = types.split(',');
  var str = "";
  for (var i in tyArr) {
    if (tyArr[i] == "1") str = str + "油烟问题，";
    else if (tyArr[i] == "2") str = str + "异味问题，";
    else if (tyArr[i] == "3") str = str + "噪声问题，";
    else if (tyArr[i] == "4") str = str + "越门店经营问题，";
    else if (tyArr[i] == "5") str = str + "乱扔乱倒垃圾问题，";
    else if (tyArr[i] == "6") str = str + "乱倒乱排污油污水问题，";
    else if (tyArr[i] == "7") str = str + "其他问题，";
    else if (tyArr[i] == "8") str = str + "流动摊贩，";
    else str = '-'
  }
  str = str.slice(0, str.length - 1);
  return str;
}

function pageChange(pageIndex) {
  form.value.page = pageIndex
  dialogStore.getList(tableType.value)
}

function checkDetail(id) {
  dialogStore.setSubDetailModel('CaseDetail')
  dialogStore.setsubDetailID(id)
}

onMounted(() => {
  const item = dialogStore.clickItem

  const { case_type, case_status, is_process, is_total, type } = item.rawData

  const formData = {
    area_id: '',
    level: 0,
    page: 1,
    limit: 10,
    case_type: '',
    case_status: '0',
    dayApi: '2025-01-01'
  }

  tableType.value = type

  formData.case_status = case_status

  formData.case_type = case_type || '0'

  dialogStore.setForm(formData)
  dialogStore.getList(type)
})
</script>

<style lang="scss" scoped></style>
