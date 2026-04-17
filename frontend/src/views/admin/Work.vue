<template>
  <div id="workManager">
    <el-table :data="workData" :border="true" style="width: 100%">
      <el-table-column prop="id" label="作品ID" min-width="80"></el-table-column>
      <el-table-column prop="title" label="作品标题" min-width="200"></el-table-column>
      <el-table-column prop="category_name" label="作品分类" min-width="120"></el-table-column>
      <el-table-column prop="addtime" label="添加时间" min-width="200">
        <template #default="scope">
          <p>{{ formatDate(scope.row.addtime) }}</p>
        </template>
      </el-table-column>
      <el-table-column prop="is_show" label="显示" min-width="100">
        <template #default="scope">
          <el-switch
            v-model="scope.row.is_show"
            inline-prompt
            style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
            active-value="1"
            inactive-value="0"
            active-text="是"
            inactive-text="否"
            @change="toggleShow(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="200">
        <template #default="scope">
          <el-button size="small" @click="edit(scope.row)">编辑</el-button>
          <el-button size="small" @click="preview(scope.row)">预览</el-button>
          <el-popconfirm
            width="unset"
            confirm-button-text="确认"
            cancel-button-text="取消"
            cancel-button-type="info"
            placement="left-start"
            :title="`永久删除作品「${scope.row.title}」, 是否继续?`"
            @confirm="del(scope.row.id)"
          >
            <template #reference>
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <br />
    <el-button type="default" :text="true" bg @click="drawerType = 'add'; openEditor()"
      >添加作品</el-button
    >

    <el-divider></el-divider>
    <el-pagination
      v-if="workData.length"
      background
      layout="prev, pager, next"
      :page-size="5"
      :page-count="pages"
      :total="total"
      @current-change="pageChange"
    ></el-pagination>

    <!-- drawer弹窗 -->
    <el-drawer
      :title="drawerTitle"
      :before-close="closeHandler"
      v-model="drawerVisible"
      :destroy-on-close="true"
      direction="btt"
      size="100%"
      :modal-append-to-body="true"
    >
      <template #default>
        <el-form ref="workFormRef" :model="workForm" :rules="workFormRules">
          <!-- 作品标题 -->
          <el-form-item label="作品标题" prop="title">
            <el-input v-model="workForm.title" autocomplete="off"></el-input>
          </el-form-item>

          <!-- 作品分类 -->
          <el-form-item label="作品分类" prop="category">
            <el-select v-model="workForm.category" placeholder="请选择作品分类">
              <el-option
                v-for="item in categoryData"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>

          <!-- 作品描述 -->
          <el-form-item label="作品描述" prop="description">
            <el-input
              v-model="workForm.description"
              type="textarea"
              :rows="3"
              autocomplete="off"
            ></el-input>
          </el-form-item>

          <!-- 作品链接 -->
          <el-form-item label="作品链接" prop="link">
            <el-input v-model="workForm.link" autocomplete="off"></el-input>
          </el-form-item>

          <!-- 作品封面 -->
          <el-form-item label="作品封面" prop="cover">
            <el-upload
              action="#"
              class="work_cover_uploader"
              v-model="workForm.cover"
              list-type="picture-card"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleCoverChange"
            >
              <template #default>
                <img
                  v-if="workForm.cover"
                  :src="BaseUrl + workForm.cover"
                  style="width: 146px; height: 94px; border-radius: 5px; object-fit: cover"
                />
                <div v-else>
                  <el-icon><Plus /></el-icon>
                </div>
              </template>
            </el-upload>
            <div v-if="workForm.cover" class="work_cover_previewer">
              <el-icon size="20"><zoom-in /></el-icon>
              <el-icon size="20" @click="workForm.cover = ''"><Delete /></el-icon>
            </div>
          </el-form-item>

          <!-- 是否显示 -->
          <el-form-item label="是否显示" prop="is_show">
            <el-switch
              v-model="workForm.is_show"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-value="1"
              inactive-value="0"
            ></el-switch>
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <el-button @click="closeHandler">关 闭</el-button>
        <el-button type="primary" @click="saveHandler">保 存</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import ServerAPI from '@/api/server'
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules, type UploadFile } from 'element-plus'
import type { WorkItem, CategoryItem } from '@/types/api'

const BaseUrl = import.meta.env.VITE_MEDIA_URL

interface WorkForm {
  id?: number
  title: string
  category: number | null
  description: string
  link: string
  cover: string
  is_show: string
}

const workData = ref<WorkItem[]>([])
const categoryData = ref<CategoryItem[]>([])
const pageSize = ref(5)
const total = ref(1)
const pages = ref(1)
const curPage = ref(1)

const workFormRef = ref<FormInstance>()
const workForm = reactive<WorkForm>({
  title: '',
  category: null,
  description: '',
  link: '',
  cover: '',
  is_show: '1'
})

const workFormRules = reactive<FormRules<WorkForm>>({
  title: [{ required: true, message: '请填写作品标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择作品分类' }],
  description: [{ required: true, message: '请填写作品描述', trigger: 'blur' }],
  link: [{ required: true, message: '请填写作品链接', trigger: 'blur' }],
  cover: [{ required: true, message: '请上传作品封面' }]
})

const drawerType = ref<'add' | 'edit'>('add')
const drawerVisible = ref(false)

const drawerTitle = computed(() => {
  return drawerType.value === 'add' ? '添加作品' : '编辑作品'
})

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

async function getWorkData() {
  const params = { pageNo: curPage.value, pageSize: pageSize.value }
  await ServerAPI.getWorkList(params).then((res) => {
    const list = res.data || []
    total.value = list[0]?.total || 0
    pages.value = Math.floor(total.value / 5) || 1
    workData.value = list
  })
}

async function getCategoryData() {
  await ServerAPI.getCategoryList().then((res) => {
    categoryData.value = res.data || []
  })
}

function edit(row: WorkItem) {
  drawerType.value = 'edit'
  drawerVisible.value = true
  Object.assign(workForm, row)
}

function preview(row: WorkItem) {
  if (row.link) {
    window.open(row.link, '_blank')
  }
}

async function toggleShow(row: WorkItem) {
  const res = await ServerAPI.editWork(row)
  if (res.code === 1) {
    ElMessage.success('修改成功✌️')
  }
}

function del(id: number) {
  ServerAPI.delWork({ id }).then((res) => {
    if (res.code === 1) {
      ElMessage.success('删除成功')
      getWorkData()
    }
  })
}

function handleCoverChange(file: UploadFile) {
  const formData = new FormData()
  formData.append('file', file.raw as File)
  ServerAPI.picUpload(formData).then((res) => {
    if (res.code === 1) {
      ElMessage.success('封面上传成功~')
      workForm.cover = res.imageUrl as string
    }
  })
}

function pageChange(currentPage: number) {
  curPage.value = currentPage
  getWorkData()
}

function openEditor() {
  drawerVisible.value = true
}

function saveHandler() {
  workFormRef.value?.validate(async (valid, fields) => {
    if (!valid) {
      for (const key in fields) {
        if (Object.prototype.hasOwnProperty.call(fields, key)) {
          const item = fields[key]
          if (item && item[0]) {
            ElMessage.error(item[0].message)
          }
        }
      }
      return
    }
    const res =
      drawerType.value === 'add'
        ? await ServerAPI.addWork(workForm)
        : await ServerAPI.editWork(workForm)
    const successMsg = {
      add: '添加作品成功✌️',
      edit: '作品修改成功✌️'
    }
    if (res.code === 1) {
      ElMessage.success(successMsg[drawerType.value])
      closeHandler()
      getWorkData()
    }
  })
}

function closeHandler() {
  drawerVisible.value = false
  Object.assign(workForm, {
    title: '',
    category: null,
    description: '',
    link: '',
    cover: '',
    is_show: '1'
  })
}

onMounted(async () => {
  await getCategoryData()
  await getWorkData()
})
</script>

<style lang="scss" scoped>
#workManager {
  margin: 10px;

  .work_cover_uploader {
    :deep(.el-upload) {
      width: 148px;
      height: 96px;
    }
  }

  .work_cover_previewer {
    width: 148px;
    height: 96px;
    position: absolute;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 3px;

    &:hover {
      background-color: rgba(0, 0, 0, 0.5);

      .el-icon {
        opacity: 1;
        color: #fff;
      }
    }

    .el-icon {
      opacity: 0;
      cursor: pointer;
    }

    .el-icon:first-child {
      margin-right: 20px;
    }
  }
}
</style>
