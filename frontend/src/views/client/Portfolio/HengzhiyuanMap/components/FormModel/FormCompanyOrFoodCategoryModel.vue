<template>
  <div>
    <el-form :model="form" :inline="true">
      <el-form-item style="margin-right:15px;">
        <Cascader v-model:id="form.area_id" style="width: 250px" />
      </el-form-item>
      <el-form-item style="width:100px;margin-right:15px;">
        <el-select v-model="form.scale">
          <el-option :value="'0'" label="规模"></el-option>
          <el-option value="l" label="大"></el-option>
          <el-option value="m" label="中"></el-option>
          <el-option value="s" label="小"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item style="width:100px;margin-right:15px;">
        <el-select v-model="form.cuisine">
          <el-option :value="'no'" label="餐饮类别"></el-option>
          <el-option v-for="(item, id) in cuisineData" :key="id" :value="item.sub_type"
            :label="item.sub_text"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item style="width:150px;margin-right:15px;">
        <el-select v-model="form.is_bind">
          <el-option :value="'no'" label="是否绑定监控仪"></el-option>
          <el-option :value="1" label="已绑定"></el-option>
          <el-option :value="0" label="未绑定"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item style="width:140px;margin-right:15px;">
        <el-select v-model="form.produce_soot">
          <el-option :value="'no'" label="是否产生油烟"></el-option>
          <el-option :value="1" label="是"></el-option>
          <el-option :value="0" label="否"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="pageChange(1)">搜索</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="tableData" style="width: 100%" height="400px" border>
      <el-table-column prop="company_name" label="企业名称" />
      <el-table-column prop="devices_id" label="监控仪编号" min-width="120"/>
      <el-table-column prop="area_name" label="区域" />
      <el-table-column prop="address" label="地址" />
      <el-table-column prop="scale" label="规模">
        <template #default="scope">
          <p>{{ sclaeMap[scope.row.scale] }}</p>
        </template>
      </el-table-column>
      <el-table-column prop="contacts" label="联系人" />
      <el-table-column prop="phone" label="联系方式" min-width="100"/>
      <el-table-column prop="produce_soot" label="是否产生油烟" min-width="100">
        <template #default="scope">
          <p>{{ produceMap[scope.row.produce_soot] }}</p>
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
const cuisineData = ref([])
const sclaeMap = ref({ 'l': '大', 'm': '中', 's': '小' })
const produceMap = ref({ '0': '否', '1': '是' })
function pageChange(pageIndex) {
  form.value.page = pageIndex
  dialogStore.getList()
}

function checkDetail(id) {
  dialogStore.setSubDetailModel('CompanyDetail')
  dialogStore.setsubDetailID(id)
}

onMounted(() => {
  const item = dialogStore.clickItem
  cuisineData.value.push(...item.cuisine)
  const formData = {
    page: 1,
    limit: 10,
    area_id: '',
    level: 0,
    scale: '0',
    cuisine: 'no',
    is_bind: 'no',
    produce_soot: 'no'
  }

  const scaleMap = {
    '小': 's',
    '中': 'm',
    '大': 'l'
  }

  // 从PieCompany进入
  if (item.type == 'company') {
    const _name = item.name.slice(0, 1)
    formData.scale = scaleMap[_name] || '0'
  }
  // 从FoodCategory进入
  if (item.type == 'food') {
    formData.cuisine = item.foodType
  }

  dialogStore.setForm(formData)
  dialogStore.getList()
})
</script>

<style lang="scss" scoped></style>
