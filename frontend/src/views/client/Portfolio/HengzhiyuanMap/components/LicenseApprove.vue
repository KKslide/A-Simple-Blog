<template>
  <div class="license_list">
    <div class="lise_container" v-for="item in licenseList" :key="item.name">
      <div class="content">
        <div class="title">{{ item.name }}</div>
        <hr>
        <div class="value" @click="getDialog(item)">{{ item.val }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, watch, toRaw } from 'vue'
import { useDialogStore } from '@/views/client/Portfolio/HengzhiyuanMap/stores/dialogStore'
const dialogStore = useDialogStore()
const props = defineProps(['data', 'year'])
const licenseList = ref([
  // { name: '总受理数', val: 1677 },
  // { name: '新办', val: 1311 },
  // { name: '续办', val: 366 },
  // { name: '已完成', val: 1667 },
  // { name: '通过', val: 989 },
  // { name: '未通过', val: 678 },
  // { name: '处理中', val: 10 },
])
/*
  处理中
  ====> 处理中(status)
  已完成
  通过
  未通过
  ====> 已完成(status)
  总受理数
  ====> 不填
  ================
  通过
  未通过
  ====> 通过/未通过(case_rs)
  ================
  新办
  续办
  ====> 新办/续办(audit_create_type)
*/
function setData(data) {
  licenseList.value = [
    { name: data.name_1, val: data.value_1, type: '' }, // 总受理数
    { name: data.name_6, val: data.value_6, type: 'createTypeMap' }, // 新办
    { name: data.name_7, val: data.value_7, type: 'createTypeMap' }, // 续办
    { name: data.name_2, val: data.value_2, type: 'statusMap' }, // 已完成
    { name: data.name_3, val: data.value_3, type: 'caseResMap' }, // 通过
    { name: data.name_4, val: data.value_4, type: 'caseResMap' }, // 未通过
    { name: data.name_5, val: data.value_5, type: 'statusMap' }, // 处理中
  ]
}
function getDialog(item) {
  dialogStore.setFormModel('FormLicenseModel')
  dialogStore.setClickItem(Object.assign(item, { year: toRaw(props.year) }))
}
watch(
  () => props.data,
  nv => setData(nv),
  { deep: true }
)
</script>

<style lang="scss" scoped>
@mixin border-element {
  content: '';
  width: 3px;
  height: 3px;
  border: 0 solid;
  border-color: #82d3e8;
  filter: drop-shadow(0px 0px 3px #d8f1f8);
  display: block;
  position: absolute;
  pointer-events: none;
}
.license_list {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 0.5rem;
  padding: 0.5rem;
  .lise_container {
    width: 100%;
    border-width: 2px;
    border-style: solid;
    border-color: #305184;
    border-radius: 5px;
    margin: auto;
    position: relative;
    box-sizing: border-box;
    padding: 0.3rem;
    &::before, &::after{
      @include border-element
    }
    &::before {
      border-top-width: 2px;
      border-left-width: 2px;
      border-top-left-radius: 5px;
      top: -2px;
      left: -2px;
    }
    &::after {
      border-top-width: 2px;
      border-right-width: 2px;
      border-top-right-radius: 5px;
      top: -2px;
      right: -2px;
    }
    .content {
      &::before, &::after{
        @include border-element
      }
      &::before {
        border-bottom-width: 2px;
        border-left-width: 2px;
        border-bottom-left-radius: 5px;
        bottom: -2px;
        left: -2px;
      }
      &::after {
        border-bottom-width: 2px;
        border-right-width: 2px;
        border-bottom-right-radius: 5px;
        bottom: -2px;
        right: -2px;
      }
      .title {
        position: relative;
        font-size: 0.8rem;
        color: #fff;
        padding-left: 0.5rem;
        &::after {
          content: '';
          display: inline-block;
          width: 2px;
          height: 70%;
          background-color: #fff;
          position: absolute;
          left: 0;
          top: 0.15rem;
        }
      }
      hr {
        border-color: rgba(255,255,255,.5);
        margin: 0.1rem 0;
      }
      .value{
        color: #fff;
        font-size: 1.1rem;
        font-weight: bold;
        cursor: pointer;
        &:hover {
          text-shadow: 0 0 5px #ffffff40, 0 0 10px #ffffff60, 0 0 20px #ffcdff20, 0 0 30px #ffcdff10;
        }
      }
    }
  }
}
</style>
