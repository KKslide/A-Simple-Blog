<template>
  <div v-if="data" class="store-details-container">
    <el-descriptions
      title="基本信息"
      :column="2"
      border
    >
      <el-descriptions-item label="商铺名称">
        {{ formatted.store_name }}
      </el-descriptions-item>

      <el-descriptions-item label="门牌号码">
        {{ formatted.door_name }}
      </el-descriptions-item>

      <el-descriptions-item label="区域">
        {{ formatted.areaname }}
      </el-descriptions-item>

      <el-descriptions-item label="道路">
        {{ formatted.roadway }}
      </el-descriptions-item>

      <el-descriptions-item label="业态种类">
        {{ formatted.store_value }}
      </el-descriptions-item>

      <el-descriptions-item label="录入时间">
        {{ formatted.ctime }}
      </el-descriptions-item>

      <el-descriptions-item label="地址属性" :span="2">
        {{ formatted.address_v }}
      </el-descriptions-item>
    </el-descriptions>
  </div>
  <div v-else>
    <el-empty description="暂无数据" />
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, onMounted, watch } from 'vue'
import { useDialogStore } from '@/views/client/Portfolio/HengzhiyuanMap/stores/dialogStore'
import { useDialog } from '@/views/client/Portfolio/HengzhiyuanMap/hooks/DialogHandler'
const dialogStore = useDialogStore()
const data = ref(null)
const { formattedStore: formatted } = useDialog(data)

onMounted(() => {
  dialogStore.getDetail()
})

watch(
  () => dialogStore.subDetailData,
  nv => {
    data.value = nv.list
  },
  { deep: true }
)
</script>

<style lang="scss" scoped>
.store-details-container {
  padding: 20px;
}
</style>
