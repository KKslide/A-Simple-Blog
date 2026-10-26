<template>
  <div>
    <el-form :model="form" :inline="true">
      <el-form-item style="margin-right:15px;">
        <Cascader v-model:id="form.area_id" style="width: 250px" />
      </el-form-item>
      <el-form-item style="width:140px;margin-right:15px;">
        <el-select v-model="form.store_value">
          <el-option :value="0" label="业态种类"></el-option>
          <el-option :value="1" label="产生油烟餐饮"></el-option>
          <el-option :value="3" label="不产生油烟餐饮"></el-option>
          <el-option :value="2" label="其他"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item style="width:150px;margin-right:15px;">
        <el-select v-model="form.address_v">
          <el-option :value="0" label="地址属性"></el-option>
          <el-option :value="1" label="居民住宅楼"></el-option>
          <el-option :value="2" label="未配套设立专用烟道的商住综合楼"></el-option>
          <el-option :value="3" label="商住综合楼内与居住层相邻的商业楼层内"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item style="margin-right:15px;">
        <el-input type="text" v-model="form.store_name" placeholder="商铺名称" autocomplete="off" style="width: 150px;"></el-input>
      </el-form-item>
      <el-form-item style="margin-right:15px;">
        <el-input type="text" v-model="form.door_name" placeholder="门牌号码" autocomplete="off" style="width: 150px;"></el-input>
      </el-form-item>
      <el-form-item style="margin-right:15px;">
        <el-input type="text" v-model="form.roadway" placeholder="输入道路" autocomplete="off" style="width: 150px;"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="pageChange(1)">搜索</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="tableData" style="width: 100%" height="400px" border>
      <el-table-column prop="store_name" label="商铺名称" />
      <el-table-column prop="door_name" label="门牌号码" />
      <el-table-column prop="area_name" label="区域" />
      <el-table-column prop="roadway" label="道路" />
      <el-table-column prop="store_value" label="业态种类">
        <template #default="scope">
          <p>{{ storeValueMap[scope.row.store_value] || '其他' }}</p>
        </template>
      </el-table-column>
      <el-table-column prop="address_v" label="地址属性">
        <template #default="scope">
          <p>{{ addressMap[scope.row.address_v] || '其他' }}</p>
        </template>
      </el-table-column>
      <el-table-column label="查看" width="80">
        <template #default="scope">
          <span style="cursor:pointer;padding:5px 10px" @click="checkDetail(scope.row._id)">
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
const addressMap = ref({ '1': '居民住宅楼', '2': '未配套设立专用烟道的商住综合楼', '3': '商住综合楼内与居住层相邻的商业楼层内', '4': '配套设立专用烟道的商住综合楼内与居住层不相邻的商业楼层' , '5': '临近居民住宅楼、存在油烟扰民风险的非住宅楼和非商住楼内', '6': '其他'})
const storeValueMap = ref({ '1': '产生油烟餐饮', '2': '其他', '3': '不产生油烟餐饮', })
function pageChange(pageIndex) {
  form.value.page = pageIndex
  dialogStore.getList()
}

function checkDetail(id) {
  dialogStore.setSubDetailModel('StoreLocationDetail')
  dialogStore.setsubDetailID(id)
}

onMounted(() => {
  const item = dialogStore.clickItem
  const formData = {
    area_id: '',
    level: 0,
    page: 1,
    limit: 10,
    store_name: '',
    door_name: '',
    roadway: '',
    store_value: 0,
    address_v: '',
    is_negative: 1,
    address_v_type:1
  }

  const addressMap = {
    'III类': 3,
    'II类': 2,
    'I类': 1
  }

  formData.address_v = addressMap[item.name]

  dialogStore.setForm(formData)
  dialogStore.getList()
})
</script>

<style lang="scss" scoped></style>
