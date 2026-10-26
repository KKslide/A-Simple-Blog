<template>
  <div v-if="data?.list" class="case-details-container hzy-detail-wrapper">
    <el-descriptions title="证照申请" :column="2" border>
      <el-descriptions-item label="门牌号码">{{ formatText(caseInfo.door_name) }}</el-descriptions-item>
      <el-descriptions-item label="商铺名称">{{ formatText(caseInfo.store_name) }}</el-descriptions-item>
      <el-descriptions-item label="申请时间">{{ caseInfo.create_time_formatted }}</el-descriptions-item>
      <el-descriptions-item label="区域">{{ formatText(caseInfo.areaname) }}</el-descriptions-item>
      <el-descriptions-item label="地址" :span="2">{{ formatText(caseInfo.address) }}</el-descriptions-item>
      <el-descriptions-item label="商家联系人">{{ formatText(caseInfo.contacts) }}</el-descriptions-item>
      <el-descriptions-item label="联系电话">{{ formatText(caseInfo.phone) }}</el-descriptions-item>
      <el-descriptions-item label="街道责任人">{{ formatText(caseInfo.contacts_daily) }}</el-descriptions-item>
      <el-descriptions-item label="责任人电话">{{ formatText(caseInfo.phone_daily) }}</el-descriptions-item>
      <el-descriptions-item label="经营项目" :span="2">{{ caseInfo.businessScope_formatted }}</el-descriptions-item>
      <el-descriptions-item label="证照申请类型">{{ caseInfo.audit_create_type_formatted }}</el-descriptions-item>
      <el-descriptions-item v-if="caseInfo.audit_create_type === '2'" label="原证照到期时间">
        {{ formatText(caseInfo.audit_create_time) }}
      </el-descriptions-item>
    </el-descriptions>

    <template v-for="item in history" :key="item._id">
      <el-descriptions v-if="item.his_type === 2" class="mt-20" title="选址核查" :column="2" border>
        <el-descriptions-item label="处理人">{{ formatText(item.create_user) }}</el-descriptions-item>
        <el-descriptions-item label="处理日期">{{ item.create_time_formatted }}</el-descriptions-item>
        <el-descriptions-item label="地址属性" :span="2">{{ item.address_v_formatted }}</el-descriptions-item>
        <el-descriptions-item label="是否设置炒炉">{{ item.is_fry_formatted }}</el-descriptions-item>
        <el-descriptions-item label="是否存在产生油烟工序">{{ item.is_make_formatted }}</el-descriptions-item>
        <el-descriptions-item label="申请地址与经营地址是否一致">{{ item.address_agree_formatted }}</el-descriptions-item>
        <el-descriptions-item label="街道责任人">{{ formatText(item.contacts_daily) }}</el-descriptions-item>
        <el-descriptions-item label="责任人电话">{{ formatText(item.phone_daily) }}</el-descriptions-item>
        <el-descriptions-item label="街道核查人">{{ formatText(item.hc_contacts) }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ formatText(item.hc_phone) }}</el-descriptions-item>
        <el-descriptions-item label="商家配合人">{{ formatText(item.cooperate_contacts) }}</el-descriptions-item>
        <el-descriptions-item label="配合人电话">{{ formatText(item.cooperate_phone) }}</el-descriptions-item>
        <el-descriptions-item label="选址核查结果" :span="2">
          <el-tag type="danger">{{ formatText(item.hc_result) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="现场照片" :span="2">
          <div class="photo-gallery">
            <div v-for="(photo, index) in item.photos" :key="photo.key" class="photo-item">
              <el-image
                :src="IMG_DOMAIN + photo.url"
                :preview-src-list="historyImageUrls"
                :initial-index="historyImageUrls.findIndex(url => url.endsWith(photo.url))"
                fit="cover"
                hide-on-click-modal
              />
              <p class="photo-label">{{ photo.label }}</p>
            </div>
          </div>
        </el-descriptions-item>
      </el-descriptions>

      <el-descriptions v-if="item.his_type === 3" class="mt-20" title="现场核查" :column="2" border>
        <el-descriptions-item label="处理人">{{ formatText(item.create_user) }}</el-descriptions-item>
        <el-descriptions-item label="处理日期">{{ item.create_time_formatted }}</el-descriptions-item>
        <el-descriptions-item label="第三方公司人员">{{ formatText(item.three_contacts) }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ formatText(item.three_phone) }}</el-descriptions-item>
        <el-descriptions-item label="商家配合人">{{ formatText(item.cooperate_contacts) }}</el-descriptions-item>
        <el-descriptions-item label="配合人电话">{{ formatText(item.cooperate_phone) }}</el-descriptions-item>
        <el-descriptions-item label="现场照片" :span="2">
           <div class="photo-gallery">
            <div v-for="photo in item.photos" :key="photo.key" class="photo-item">
              <el-image
                :src="IMG_DOMAIN + photo.url"
                :preview-src-list="historyImageUrls"
                :initial-index="historyImageUrls.findIndex(url => url.endsWith(photo.url))"
                fit="cover"
                hide-on-click-modal
              />
              <p class="photo-label">{{ photo.label }}</p>
            </div>
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </template>

    <el-descriptions v-if="caseInfo.audit_status === 5" class="mt-20" title="审核完成" :column="2" border>
      <el-descriptions-item label="审核结果">
        <el-tag :type="caseInfo.case_rs == 1 ? 'success' : 'error'">
          {{ caseInfo.case_rs_formatted }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="完成时间">{{ caseInfo.finish_time_formatted }}</el-descriptions-item>
      <el-descriptions-item v-if="caseInfo.case_remark" label="审核备注" :span="2">
        {{ formatText(caseInfo.case_remark) }}
      </el-descriptions-item>
    </el-descriptions>
  </div>

  <el-empty v-else description="暂无数据" />
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref,reactive, onMounted, watch, computed } from 'vue'
import { useDialogStore } from '@/views/client/Portfolio/HengzhiyuanMap/stores/dialogStore'
import { useDialog } from '@/views/client/Portfolio/HengzhiyuanMap/hooks/DialogHandler'
const IMG_DOMAIN = import.meta.env.VITE_IMG_DOMAIN
const dialogStore = useDialogStore()
const data = ref(null)

const {
  formatText,
  formattedCaseInfo: caseInfo, // 重命名以简化模板中的使用
  formattedHistory: history,
  allHistoryImageUrls: historyImageUrls,
} = useDialog(data)

onMounted(() => {
  dialogStore.getDetail()
})

watch(
  () => dialogStore.subDetailData,
  nv => {
    data.value = nv
  },
  { deep: true }
)
</script>

<style lang="scss" scoped>
.case-details-container {
  padding: 20px;
}
.mt-20 {
  margin-top: 20px;
}
.photo-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.photo-item {
  text-align: center;
}
.photo-item .el-image {
  width: 150px;
  height: 150px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}
.photo-label {
  margin-top: 5px;
  font-size: 13px;
  color: #606266;
}
</style>
