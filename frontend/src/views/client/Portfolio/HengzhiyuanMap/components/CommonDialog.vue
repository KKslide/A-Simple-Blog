<template>
  <div>
    <el-dialog
      class="hzy-public-dialog"
      v-model="dialogStore.visible"
      width="80%"
      destroy-on-close
      draggable
      @close="dialogStore.toggleVisible"
    >
      <template #header="{ titleId, titleClass }">
        <div class="my-header">
          <h4 :id="titleId" :class="titleClass">{{ dialogStore.getTitle }}</h4>
        </div>
      </template>
      <template #default>
         <component :is="formModel[dialogStore.formModel]"></component>

         <!-- 二级弹窗 -->
         <el-dialog
          v-model="dialogStore.subVisivle"
          width="70%"
          :title="dialogStore.getSubTitle"
          destroy-on-close
          draggable
          append-to-body
          @close="dialogStore.toggleSubVisible"
        >
          <template #default>
            <component :is="subDetailModel[dialogStore.subDetailModel]"></component>
          </template>
         </el-dialog>

      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, watch } from 'vue'
import { useDialogStore } from '@/views/client/Portfolio/HengzhiyuanMap/stores/dialogStore'
import FormDeviceListModel from './FormModel/FormDeviceListModel.vue'
import FormCompanyOrFoodCategoryModel from './FormModel/FormCompanyOrFoodCategoryModel.vue'
import FormProhibitedSite from './FormModel/FormProhibitedSite.vue'
import FormCaseModel from './FormModel/FormCaseModel.vue'
import FormLicenseModel from './FormModel/FormLicenseModel.vue'
import CompanyDetail from './subDetailModel/CompanyDetail.vue'
import StoreLocationDetail from './subDetailModel/StoreLocationDetail.vue'
import CaseDetail from './subDetailModel/CaseDetail.vue'
import LicenseDetail from './subDetailModel/LicenseDetail.vue'
const formModel = {
  FormDeviceListModel,
  FormCompanyOrFoodCategoryModel,
  FormProhibitedSite,
  FormCaseModel,
  FormLicenseModel
}
const subDetailModel = {
  CompanyDetail,
  StoreLocationDetail,
  CaseDetail,
  LicenseDetail
}
const dialogStore = useDialogStore()

// 不要用这个 $subscribe , 发布时有问题
// dialogStore.$subscribe((mutate) => {
//   console.log('mutate =>>>', mutate);
//   const { events: { key, oldValue, newValue } } = mutate
//   if (key == 'clickItem' && !oldValue && !!newValue) {
//     dialogStore.toggleVisible()
//   }
// })

watch(
  () => dialogStore.clickItem,
  (newValue, oldValue) => {

    if (!oldValue && !!newValue) {
      dialogStore.toggleVisible()
    }
  },
  { deep: true }
)

watch(
  () => dialogStore.subDetailID,
  (newValue, oldValue) => {
    if (!!newValue) {
      dialogStore.toggleSubVisible(newValue)
    }
  },
)

</script>

<style lang="scss" scoped></style>
