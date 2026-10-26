<template>
  <div class="device_status_list">
    <div v-for="item in deviceList" :key="item.color" :class="['status', item.status]">
      <div class="desc">
        <span :class="['iconfont', item.icon, item.status]" @click="curList=item.status"></span>
        <div :class="['title', item.status]" @click="setCurListType(item.status)">{{ item.title }}</div>
      </div>
      <div
        :class="['val', item.status]"
        :style="{ color: item.color, backgroundColor: `${item.color}10` }"
        @click="curList=item.status"
      >
        {{ item.val }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { inject } from 'vue'
import { useDialogStore } from '@/views/client/Portfolio/HengzhiyuanMap/stores/dialogStore'
const dialogStore = useDialogStore()
const { deviceList, curList } = inject('deviceList')
const statusMap = {
  'all':'',
  'normal':'1',
  'exceed':'2',
  'warning':'3',
  'offline':'0',
}
function setCurListType(status) {
  dialogStore.setFormModel('FormDeviceListModel')
  dialogStore.setClickItem({
    monitoring_status: statusMap[status]
  })
}
</script>
