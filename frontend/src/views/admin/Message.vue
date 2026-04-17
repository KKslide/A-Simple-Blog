<template>
  <div id="messageManager">
    <el-table :data="msgList" :border="true" style="width: 100%">
      <el-table-column prop="created_at" label="日期" min-width="100">
        <template #default="scope">
          <p>{{ formatDate(scope.row.created_at) }}</p>
        </template>
      </el-table-column>
      <el-table-column prop="nickname" label="用户/邮箱"></el-table-column>
      <el-table-column prop="content" label="内容"></el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button size="small" @click="checkMsg(scope.row)">查看</el-button>
          <el-popconfirm
            width="180"
            confirm-button-text="确认"
            cancel-button-text="取消"
            cancel-button-type="info"
            placement="left-start"
            :title="`要删除这条留言吗?`"
            @confirm="deleteMsg(scope.row.id)"
          >
            <template #reference>
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-divider></el-divider>

    <el-pagination
      v-if="msgList.length"
      background
      layout="prev, pager, next"
      :page-size="5"
      :page-count="pages"
      :total="total"
      @current-change="pageChange"
    ></el-pagination>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ServerAPI from '@/api/server'
import { ElMessage } from 'element-plus'
import type { MessageItem } from '@/types/api'

const pageSize = ref(10)
const total = ref(1)
const pages = ref(1)
const curPage = ref(1)
const msgList = ref<MessageItem[]>([])

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

function checkMsg(_row: MessageItem) {
  // 可以扩展查看详情
}

function deleteMsg(id: number) {
  ServerAPI.delMsg({ id }).then(() => {
    ElMessage.success('删除成功✌️')
    getMessageList()
  })
}

function getMessageList() {
  ServerAPI.getMsgList({ pageNo: curPage.value, pageSize: pageSize.value }).then((res) => {
    msgList.value = res.messages || []
    total.value = res.total || 0
    pages.value = res.pages || 0
  })
}

function pageChange(currentPage: number) {
  curPage.value = currentPage
  getMessageList()
}

onMounted(() => {
  getMessageList()
})
</script>

<style lang="scss" scoped>
#messageManager {
  margin: 10px;
}
</style>
