<template>
  <div v-if="data" class="company-details-container hzy-detail-wrapper">
    <el-descriptions
      title="基本信息"
      :column="2"
      border
      class="info-card"
    >
      <el-descriptions-item label="商铺名称">{{ formatted.company_name }}</el-descriptions-item>
      <el-descriptions-item label="营业执照名称">{{ formatted.company_yyzz }}</el-descriptions-item>
      <el-descriptions-item label="营业执照代码">{{ formatted.company_yyzz_id }}</el-descriptions-item>
      <el-descriptions-item label="区域">{{ formatted.area_name }}</el-descriptions-item>
      <el-descriptions-item label="地址" :span="2">{{ formatted.address }}</el-descriptions-item>
      <el-descriptions-item label="商家联系人">{{ formatted.contacts }}</el-descriptions-item>
      <el-descriptions-item label="联系电话">{{ formatted.phone }}</el-descriptions-item>
      <el-descriptions-item label="营业状态">{{ formatted.operating_state }}</el-descriptions-item>
      <el-descriptions-item label="规模">{{ formatted.scale }}</el-descriptions-item>
      <el-descriptions-item label="监控级别">{{ formatted.monitoring_level }}</el-descriptions-item>
      <el-descriptions-item label="餐饮类别">{{ formatted.cuisineName }}</el-descriptions-item>
      <el-descriptions-item label="企业类别">{{ formatted.company_type }}</el-descriptions-item>
      <el-descriptions-item label="录入时间">{{ formatted.create_time }}</el-descriptions-item>
      <el-descriptions-item label="是否产生油烟">{{ formatted.produce_soot }}</el-descriptions-item>
      <el-descriptions-item label="是否安装净化设备">{{ formatted.purifier_install }}</el-descriptions-item>
      <el-descriptions-item label="是否安装在线设备">{{ formatted.is_bind2 }}</el-descriptions-item>
      <el-descriptions-item label="证照是否齐全">{{ formatted.foodexpire_all }}</el-descriptions-item>
      <el-descriptions-item
        v-if="companyPhotos.length"
        label="企业照片"
        :span="2"
      >
        <div class="image-gallery">
          <div v-for="photo in companyPhotos" :key="photo.key" class="image-container">
            <el-image
              style="width: 150px; height: 150px"
              :src="photo.url"
              :preview-src-list="allPhotoUrls"
              :initial-index="photo.index"
              fit="contain"
              hide-on-click-modal
            >
            <template #error>
              <div class="image-slot">暂无图片</div>
            </template>
          </el-image>
          <p class="image-caption">{{ photo.label }}</p>
          </div>
        </div>
      </el-descriptions-item>
    </el-descriptions>
  </div>
  <div v-else>
    <el-empty description="暂无数据" />
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref,reactive, onMounted, watch, computed } from 'vue'
import { useDialogStore } from '@/views/client/Portfolio/HengzhiyuanMap/stores/dialogStore'
import { useDialog } from '@/views/client/Portfolio/HengzhiyuanMap/hooks/DialogHandler'
const IMG_DOMAIN = import.meta.env.VITE_IMG_DOMAIN
const dialogStore = useDialogStore()
const data = ref(null)
const { formattedData: formatted } = useDialog(data)
// 将照片数据结构化，方便 v-for 循环
const companyPhotos = computed(() => {
  const photos = [
    { key: 'door_photo_url', label: '门头照片', url: data.value.door_photo_url },
    { key: 'business_license_url', label: '营业执照', url: data.value.business_license_url },
    { key: 'purifier_photo_url', label: '净化器照片', url: data.value.purifier_photo_url },
    { key: 'fj_photo_url', label: '风机照片', url: data.value.fj_photo_url },
    { key: 'monitoring_photo_url', label: '监控仪照片', url: data.value.monitoring_photo_url },
    { key: 'kitchen_1_photo_url', label: '厨房照片', url: data.value.kitchen_1_photo_url },
    { key: 'kitchen_2_photo_url', label: '炉灶照片', url: data.value.kitchen_2_photo_url },
  ];

  // 过滤掉没有 url 的照片，并为它们添加完整的 url 和在预览列表中的索引
  let index = 0;
  return photos
    .filter(p => p.url)
    .map(p => ({
      ...p,
      url: IMG_DOMAIN + p.url,
      index: index++,
    }));
})
// 4. 创建一个所有有效照片 URL 的数组，用于图片预览
const allPhotoUrls = computed(() => companyPhotos.value.map(p => p.url))

onMounted(() => {
  dialogStore.getDetail()
})

watch(
  () => dialogStore.subDetailData,
  nv => {
    data.value = nv.company
  },
  { deep: true }
)
</script>

<style lang="scss" scoped>
.company-details-container {
  padding: 20px;
}
.info-card {
  margin-bottom: 20px;
}
.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 14px;
}
.image-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}
.image-container {
  text-align: center;
}
.image-caption {
  margin-top: 5px;
  font-size: 13px;
  color: #606266;
}
</style>
