<template>
  <div id="categoryManager">
    <el-table :data="categoryData" :border="true" style="width: 100%" :cell-class-name="setIdColumn">
      <el-table-column prop="id" label="分类ID"></el-table-column>
      <el-table-column prop="name" label="分类名称"></el-table-column>
      <el-table-column prop="sort_order" label="顺序" min-width="120">
        <template #header>
          顺序
          <el-tooltip class="box-item" effect="dark" content="数值越大越靠前, 限制100之内" placement="right">
            <el-icon>
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </template>
        <template #default="scope">
          <el-input-number :min="0" :max="100" v-model="scope.row.sort_order" size="small"
            @change="setRank(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="新增时间" min-width="200">
        <template #default="scope">
          <p>{{ formatDate(scope.row.created_at) }}</p>
        </template>
      </el-table-column>
      <el-table-column prop="updated_at" label="上次修改" min-width="200">
        <template #default="scope">
          <p>{{ formatDate(scope.row.updated_at) }}</p>
        </template>
      </el-table-column>
      <el-table-column prop="banner_url" label="分类缩略图" min-width="150">
        <template #default="scope">
          <el-image style="width: 150px; height: 34px" :src="scope.row.banner_url.startsWith('http') ? scope.row.banner_url : BaseUrl + scope.row.banner_url" fit="cover"></el-image>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="150">
        <template #default="scope">
          <el-button size="small" @click="edit(scope.row)">编辑</el-button>
          <el-popconfirm width="unset" confirm-button-text="确认" cancel-button-text="取消" cancel-button-type="info"
            placement="left-start" :title="`永久删除分类 ${scope.row.name} , 是否继续?`" @confirm="del(scope.row.id)">
            <template #reference>
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <br />

    <el-button type="default" :text="true" bg :disabled="categoryData.length >= 6" @click="open">新增分类</el-button>

    <el-dialog v-if="dialogVisible" v-model="dialogVisible" :title="handleType == 'add' ? '添加分类' : '编辑分类'" width="600"
      draggable :before-close="handleClose">
      <el-form :model="categoryDetail">
        <el-form-item label="分类名称" :label-width="90">
          <el-input v-model="categoryDetail.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="分类缩略图" :label-width="90">
          <div style="width: 100%">
            (banner长宽要求: 最佳比例👉2278x516, 或者 22:5 的长形图片)
          </div>
          <el-upload action="#" class="categoryImgUploader" list-type="picture-card" v-model:file-list="cateImgFiles"
            :auto-upload="false" :limit="1" :show-file-list="false" :on-change="uploadHandler">
            <template #default>
              <img v-if="tempUrl" :src="tempUrl" :style="{ width: bannerWidth + 'px', height: bannerHeight + 'px' }" />
              <div v-else>
                <el-icon>
                  <Plus />
                </el-icon>
              </div>
            </template>
          </el-upload>
          <div v-if="tempUrl" class="cate_img_previewer">
            <el-icon size="20"><zoom-in /></el-icon>
            <el-icon size="20" @click="clearBanner">
              <Delete />
            </el-icon>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="saveHandler"> 确 定 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import ServerAPI from '@/api/server'
import { ref, reactive, onMounted } from 'vue'
import type { UploadResponse } from '@/types/api'
import { ElMessage, type UploadFile } from 'element-plus'

const BaseUrl = import.meta.env.VITE_MEDIA_URL

interface CategoryDetail {
  id: number | ''
  name: string
  banner_url: string
  sort_order: number
  show_type: string
}

interface CategoryItem extends CategoryDetail {
  created_at: string
  updated_at: string
}

const categoryData = ref<CategoryItem[]>([])
const handleType = ref<'add' | 'edit'>('add')
const dialogVisible = ref(false)
const categoryDetail = reactive<CategoryDetail>({
  id: '',
  name: '',
  banner_url: '',
  sort_order: 0,
  show_type: 'card'
})
const bannerWidth = ref(396)
const bannerHeight = ref(86)
const tempUrl = ref('')
const cateImgFiles = ref<UploadFile[]>([])

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

function edit(row: CategoryItem) {
  handleType.value = 'edit'
  dialogVisible.value = true
  Object.assign(categoryDetail, row)
  tempUrl.value = row.banner_url.startsWith('http') ? row.banner_url : BaseUrl + row.banner_url
}

function del(id: number | '') {
  ServerAPI.delCategory({ id })
    .then(() => {
      ElMessage.success('删除成功!')
      categoryData.value = categoryData.value.filter((v) => v.id !== id)
    })
}

function open() {
  handleType.value = 'add'
  dialogVisible.value = true
}

function handleClose() {
  categoryDetail.id = ''
  categoryDetail.name = ''
  categoryDetail.banner_url = ''
  tempUrl.value = ''
  cateImgFiles.value = []
  dialogVisible.value = false
}

function clearBanner() {
  categoryDetail.banner_url = ''
  tempUrl.value = ''
  cateImgFiles.value = []
}

function saveHandler() {
  if (!categoryDetail.name) {
    return ElMessage.error('请写上分类名!')
  }
  if (!categoryDetail.banner_url) {
    return ElMessage.error('请上传banner图!')
  }

  if (handleType.value === 'add') {
    ServerAPI.addCategory(categoryDetail).then(() => {
      ElMessage.success('添加成功!')
      handleClose()
      getCateData()
    })
  }

  if (handleType.value === 'edit') {
    ServerAPI.editCategory(categoryDetail).then(() => {
      ElMessage.success('修改成功!')
      handleClose()
      getCateData()
    })
  }
}

function setRank(params: CategoryItem) {
  handleType.value = 'edit'
  Object.assign(categoryDetail, params)
  saveHandler()
}

function uploadHandler(file: UploadFile) {
  if (!file.raw) {
    ElMessage.error('请选择图片文件')
    return
  }

  const ImgForm = new FormData()
  ImgForm.append('file', file.raw)

  ServerAPI.picUpload(ImgForm)
    .then((res: UploadResponse) => {
      if (res.code === 1 && res.imageUrl) {
        categoryDetail.banner_url = res.imageUrl
        tempUrl.value = file.url || URL.createObjectURL(file.raw as File)
        ElMessage.success('图片已上传')
      } else {
        ElMessage.error('图片上传失败')
      }
    })
    .catch(() => {
      ElMessage.error('图片上传失败')
    })

}

function setIdColumn({ column }: { row: CategoryItem; column: unknown; rowIndex: number }) {
  if ((column as { property: string }).property === 'id') {
    return 'cell_nowrap'
  }
}

function getCateData() {
  ServerAPI.getCategoryList().then((res) => {
    categoryData.value = (res.data as CategoryItem[]) || []
  })
}

onMounted(() => {
  getCateData()
})
</script>

<style lang="scss" scoped>
#categoryManager {
  margin: 10px;

  .categoryImgUploader {
    :deep(.el-upload) {
      width: 396px;
      height: 88px;
      overflow: hidden;
    }
  }

  .cate_img_previewer {
    width: 396px;
    height: 88px;
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
