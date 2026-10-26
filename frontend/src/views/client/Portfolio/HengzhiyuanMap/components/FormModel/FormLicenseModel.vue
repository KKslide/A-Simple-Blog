<template>
  <div>
    <el-form :model="form" :inline="true">
      <el-form-item style="margin-right:15px;">
        <Cascader v-model:id="form.area_id" style="width: 250px" />
      </el-form-item>
      <el-form-item style="width:100px;margin-right:15px;">
        <el-select v-model="form.year">
          <el-option :value="0" label="全部时间"></el-option>
          <el-option :value="2022" label="2022年"></el-option>
          <el-option :value="2023" label="2023年"></el-option>
          <el-option :value="2024" label="2024年"></el-option>
          <el-option :value="2025" label="2025年"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item style="width:100px;margin-right:15px;">
        <el-select v-model="form.status">
          <el-option :value="'no'" label="受理总数"></el-option>
          <el-option :value="0" label="处理中"></el-option>
          <el-option :value="1" label="已完成"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item style="width:100px;margin-right:15px;">
        <el-select v-model="form.audit_create_type">
          <el-option :value="'no'" label="申请类型"></el-option>
          <el-option :value="1" label="新办"></el-option>
          <el-option :value="2" label="续办"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item style="width:120px;margin-right:15px;">
        <el-select v-model="form.case_rs">
          <el-option :value="'no'" label="审核结果"></el-option>
          <el-option :value="1" label="审核通过"></el-option>
          <el-option :value="2" label="审核未通过"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item style="margin-right:15px;">
        <el-input type="text" v-model="form.store_name" placeholder="商铺名称" autocomplete="off" style="width: 150px;"></el-input>
      </el-form-item>
      <el-form-item style="margin-right:15px;">
        <el-input type="text" v-model="form.door_name" placeholder="门牌号码" autocomplete="off" style="width: 150px;"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="pageChange(1)">搜索</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="tableData" style="width: 100%" height="400px" border>
      <el-table-column prop="store_name" label="商铺名称" />
      <el-table-column prop="door_name" label="门牌号码" />
      <el-table-column prop="area_name" label="区域" min-width="100"/>
      <el-table-column prop="contacts" label="联系人(电话)" min-width="120">
        <template #default="scope">
          <p>{{ scope.row.contacts }}({{ scope.row.phone }})</p>
        </template>
      </el-table-column>
      <el-table-column prop="audit_create_type" label="申请类型">
        <template #default="scope">
          <p>{{ _createTypeMap[scope.row.audit_create_type] || '-' }}</p>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="审核状态">
        <template #default="scope">
          <p>{{ _statusMap[scope.row.status] || '-' }}</p>
        </template>
      </el-table-column>
      <el-table-column prop="case_rs" label="审核结果">
        <template #default="scope">
          <p>{{ _caseResMap[scope.row.case_rs] || '-' }}</p>
        </template>
      </el-table-column>
      <el-table-column prop="finish_time" label="完成时间" min-width="120">
        <template #default="scope">
          <p>{{ scope.row.finish_time || '-' }}</p>
        </template>
      </el-table-column>
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
import { Search } from '@element-plus/icons-vue'
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useDialogStore } from '@/views/client/Portfolio/HengzhiyuanMap/stores/dialogStore'
import Cascader from './Cascader.vue'
const dialogStore = useDialogStore()
const { form, totalCount, table: tableData } = storeToRefs(dialogStore)
const _statusMap = ref({
  '0': '处理中',
  '1': '已完成',
})
const _createTypeMap = ref({
  '1': '新办',
  '2': '续办',
})
const _caseResMap = ref({
  '1': '审核通过',
  '2': '审核未通过',
})

function pageChange(pageIndex) {
  form.value.page = pageIndex
  dialogStore.getList()
}

function checkDetail(id) {
  dialogStore.setSubDetailModel('LicenseDetail')
  dialogStore.setsubDetailID(id)
}

onMounted(() => {
  const item = dialogStore.clickItem
  const { type } = item
  const formData = {
    area_id: '',
    level: 0,
    year: item.year,
    store_name: '',
    door_name: '',
    status: 'no',
    audit_create_type: 'no',
    case_rs: 'no',
    page: 1,
    limit: 10
  }
  // status 处理中/已完成
  // case_rs 通过/未通过
  // audit_create_type 新办/续办
  const statusMap = {
    '处理中': 0,
    '已完成': 1,
  }
  const caseResMap = {
    '通过': 1,
    '未通过': 2,
  }
  const createTypeMap = {
    '新办': 1,
    '续办': 2
  }
  if (type) {
    switch (type) {
      case 'statusMap':
        formData.status = statusMap[item.name]
        break;
      case 'caseResMap':
        formData.case_rs = caseResMap[item.name]
        formData.status = 1
        break;
      case 'createTypeMap':
        formData.audit_create_type = createTypeMap[item.name]
        break;
    }
  }
  dialogStore.setForm(formData)
  dialogStore.getList()
})
</script>

<style lang="scss" scoped></style>
