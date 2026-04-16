<template>
  <div id="messageManager">
    <el-table :data="msgList" :border="true" style="width: 100%">
      <el-table-column prop="created_at" label="日期" min-width="100">
        <template #default="scope">
          <p>{{ new Date(scope.row.created_at).Format('yyyy-MM-dd hh:mm:ss') }}</p>
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

<script setup>
import { ref,reactive, onMounted } from 'vue'
import ServerAPI from '@/api/server'
import { ElMessage } from 'element-plus'
const BaseUrl = import.meta.env.VITE_MEDIA_URL
const pageSize = ref(10)
const total = ref(1) // 总条数
const pages = ref(1) // 总页数
const curPage = ref(1) // 当前页
const msgList = ref([])
function checkMsg(row) {}
function deleteMsg(id) {
  ServerAPI.delMsg({id})
    .then(() => {
      ElMessage.success('删除成功✌️')
      getMessageList()
    })
}
function getMessageList() {
  ServerAPI.getMsgList({ pageNo: curPage.value, pageSize: pageSize.value })
    .then(res => {
      msgList.value = res.messages
      total.value = res.total
      pages.value = res.pages
    })
}
function pageChange() {}
onMounted(() => {
  getMessageList()
})
</script>

<style lang="scss" scoped>
#messageManager {
  margin: 10px;
}
</style>
