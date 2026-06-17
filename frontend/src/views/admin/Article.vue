<template>
  <div id="articleManager">
    <!-- 筛选表单 -->
    <el-form :inline="true" :model="filterForm" size="small" class="filter-form">
      <el-form-item label="标题">
        <el-input v-model="filterForm.title" placeholder="搜索标题" clearable style="width: 180px" />
      </el-form-item>
      <el-form-item label="分类">
        <el-select v-model="filterForm.category_id" placeholder="全部" clearable style="width: 130px">
          <el-option v-for="v in categoryData" :key="v.id" :label="v.name" :value="v.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="置顶">
        <el-select v-model="filterForm.is_pinned" placeholder="全部" clearable style="width: 100px">
          <el-option label="是" value="1" />
          <el-option label="否" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="显示">
        <el-select v-model="filterForm.is_published" placeholder="全部" clearable style="width: 100px">
          <el-option label="是" value="1" />
          <el-option label="否" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onFilter">查询</el-button>
        <el-button @click="onResetFilter">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="articleData" :border="true" max-height="600" style="width: 100%">
      <el-table-column prop="id" label="文章ID" width="80" fixed="left"></el-table-column>
      <el-table-column prop="title" label="分文章标题" min-width="300"></el-table-column>
      <el-table-column prop="cate_name" label="文章分类" min-width="100"></el-table-column>
      <el-table-column prop="created_at" label="添加时间" min-width="200">
        <template #default="scope">
          <p>{{ formatDate(scope.row.created_at) }}</p>
        </template>
      </el-table-column>
      <el-table-column prop="view_count" label="阅读量" min-width="100"></el-table-column>
      <el-table-column prop="comment_num" label="评论" min-width="100">
        <template #default="scope">
          <el-button
            v-if="!!scope.row.comment_num"
            type="primary"
            text
            @click="checkComment(scope.row)"
          >
            {{ scope.row.comment_num }}
          </el-button>
          <el-button v-else type="info" text disabled>0</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="is_pinned" label="置顶" min-width="100">
        <template #default="scope">
          <el-switch
            :model-value="scope.row.is_pinned"
            inline-prompt
            style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
            active-value="1"
            inactive-value="0"
            active-text="是"
            inactive-text="否"
            @change="(val: string) => toggleSomeKey(scope.row, 'is_pinned', val)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="is_published" label="显示" min-width="100">
        <template #default="scope">
          <el-switch
            :model-value="scope.row.is_published"
            inline-prompt
            style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
            active-value="1"
            inactive-value="0"
            active-text="是"
            inactive-text="否"
            @change="(val: string) => toggleSomeKey(scope.row, 'is_published', val)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="edit(scope.row)">编辑</el-button>
          <el-popconfirm
            width="unset"
            confirm-button-text="确认"
            cancel-button-text="取消"
            cancel-button-type="info"
            placement="left-start"
            :title="`永久删除文章「${scope.row.title}」, 是否继续?`"
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
    <el-button
      type="info"
      :text="true"
      bg
      @click="drawerType = 'add'; openEditor()"
      >添加文章</el-button
    >

    <el-divider></el-divider>
    <el-pagination
      v-if="total > 0"
      v-model:current-page="curPage"
      v-model:page-size="pageSize"
      background
      layout="sizes, prev, pager, next, total"
      :page-sizes="pageSizes"
      :total="total"
      @current-change="pageChange"
      @size-change="pageSizeChange"
    />

    <!-- drawer弹窗 -->
    <el-drawer
      :title="drawerTitle"
      :before-close="confirmClose"
      v-model="drawerVisible"
      :destroy-on-close="true"
      direction="btt"
      ref="drawerRef"
      size="100%"
      :modal-append-to-body="true"
    >
      <template #default>
        <el-form ref="articleFromRef" :model="articleFrom" :rules="articleFromRules">
          <!-- 文章标题 -->
          <el-form-item label="文章标题" prop="title" class="item_title">
            <el-input v-model="articleFrom.title" autocomplete="off"></el-input>
          </el-form-item>
          <!-- 文章分类 -->
          <el-form-item label="文章分类" prop="category_id" class="item_category">
            <el-select v-model="articleFrom.category_id" placeholder="请选文章分类">
              <el-option
                v-for="v in categoryData"
                :key="v.id"
                :label="v.name"
                :value="v.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <!-- 是否显示 -->
          <el-form-item label="是否显示" prop="is_published">
            <el-switch
              v-model="articleFrom.is_published"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-value="1"
              inactive-value="0"
            ></el-switch>
          </el-form-item>
          <!-- 是否置顶 -->
          <el-form-item label="是否置顶" prop="is_pinned">
            <el-switch
              v-model="articleFrom.is_pinned"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-value="1"
              inactive-value="0"
            ></el-switch>
          </el-form-item>
          <!-- 文章简介 -->
          <el-form-item label="文章简介" prop="description" class="item_description">
            <el-input v-model="articleFrom.description" autocomplete="off"></el-input>
          </el-form-item>
          <!-- 视频链接 -->
          <el-form-item v-if="isVlogType" label="视频链接" prop="video_url">
            <el-input v-model="articleFrom.video_url" autocomplete="off"></el-input>
          </el-form-item>
          <!-- 文章封面图 -->
          <el-form-item label="文章封面" prop="cover_url">
            <el-upload
              action="#"
              class="article_minpic_uploader"
              v-model="articleFrom.cover_url"
              list-type="picture-card"
              :auto-upload="false"
              :show-file-list="false"
              :accept="imageAcceptTypes"
              :on-change="handleCrop"
            >
              <template #default>
                <img
                  v-if="articleFrom.cover_url"
                  :src="articleFrom.cover_url.startsWith('http') ? articleFrom.cover_url : BaseUrl + articleFrom.cover_url"
                  style="width: 146px; height: 94px; border-radius: 5px; object-fit: cover"
                />
                <div v-else>
                  <el-icon><Plus /></el-icon>
                </div>
              </template>
            </el-upload>
            <div v-if="articleFrom.cover_url" class="article_minpic_previewer">
              <el-icon size="20" @click="showViewer = true"><zoom-in /></el-icon>
              <el-icon size="20" @click="articleFrom.cover_url = ''"><Delete /></el-icon>
            </div>
          </el-form-item>
          <!-- 文章内容 -->
          <el-form-item label="文章内容" prop="content">
            <el-input v-show="false" v-model="articleFrom.content"></el-input>
            <div style="border: 1px solid #ccc; width: 100%">
              <Toolbar
                style="border-bottom: 1px solid #ccc"
                :editor="editorRef"
                :defaultConfig="toolbarConfig"
                :mode="mode"
              />
              <Editor
                style="height: 300px; overflow-y: hidden"
                v-model="articleFrom.content"
                :defaultConfig="editorConfig"
                :mode="mode"
                @onCreated="handleCreated"
                @onChange="handleChange"
              />
            </div>
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <el-button @click="confirmClose()">关 闭</el-button>
        <el-button type="primary" @click="saveHandler">保 存</el-button>
      </template>
    </el-drawer>

    <!-- vue-cropper -->
    <el-dialog v-if="showCropper" v-model="showCropper" draggable width="800">
      <Cropper :img-file="cropperFile || ''" @cropperDone="uploadHandler" @cropperCancel="closeCropper" />
    </el-dialog>

    <!-- 图片预览 -->
    <ElImageViewer
      v-if="showViewer"
      :url-list="[previewUrl]"
      @close="showViewer = false"
    />

    <!-- comments -->
    <el-dialog
      v-if="showComment"
      v-model="showComment"
      draggable
      width="800"
      :title="`文章「${curComment?.title}」的评论`"
    >
      <template #default>
        <el-table :data="curComment?.comments" :border="true" style="width: 100%">
          <el-table-column prop="created_at" label="日期">
            <template #default="scope">
              <p>{{ formatDate(scope.row.created_at) }}</p>
            </template>
          </el-table-column>
          <el-table-column prop="nickname" label="用户"></el-table-column>
          <el-table-column prop="content" label="评论内容"></el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button size="small" @click="checkCommentDetail(scope.row)">查看</el-button>
              <el-popconfirm
                width="250"
                confirm-button-text="确认"
                cancel-button-text="取消"
                placement="left-start"
                :title="`要删除这条评论吗?`"
                @confirm="delComment(scope.row)"
              >
                <template #reference>
                  <el-button size="small" type="danger">删除</el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <template #footer>
        <div>
          <el-button @click="curComment = null; showComment = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import ServerAPI from '@/api/server'
import { ref, reactive, shallowRef, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import type { IDomEditor } from '@wangeditor/editor'
import type { ArticleItem, CategoryItem, CommentItem } from '@/types/api'
import { ElMessage, ElMessageBox, ElImageViewer, type FormInstance, type FormRules, type UploadFile } from 'element-plus'
import { imageAcceptTypes, isValidImageFile } from '@/config/config'
import Cropper from './Widgets/Cropper.vue'
import '@wangeditor/editor/dist/css/style.css'

const BaseUrl = import.meta.env.VITE_MEDIA_URL || ''

const editorRef = shallowRef<IDomEditor | null>(null)
const toolbarConfig = ref({})
const editorConfig = ref({ placeholder: '请输入文章内容...' })
const mode = ref<'default' | 'simple'>('default')

interface ArticleFrom {
  title: string
  category_id: number | null
  cate_name?: string
  description: string
  is_published: string
  is_pinned: string
  content: string
  video_url: string
  cover_url: string
  id?: number
}

const handleCreated = (editor: IDomEditor) => {
  editorRef.value = editor
  editor.getMenuConfig('uploadImage').customUpload = (file: File, insertFn: (...args: unknown[]) => void) => {
    if (!isValidImageFile(file)) {
      ElMessage.warning('只能上传图片文件')
      return
    }
    const tempForm = new FormData()
    tempForm.append('file', file)
    ServerAPI.picUpload(tempForm).then((res) => {
      if (res?.code === 1 && res.data?.imageUrl) {
        insertFn(BaseUrl + res.data.imageUrl)
      } else {
        alert('上传失败!')
      }
    })
  }
}

const handleChange = (editor: IDomEditor) => {
  articleFrom.content = editor.getHtml() as string
}

const articleData = ref<ArticleItem[]>([])
const categoryData = ref<CategoryItem[]>([])
const pageSize = ref(5)
const total = ref(0)
const curPage = ref(1)
const pageSizes = [5, 10, 20, 50]

const filterForm = reactive({
  title: '',
  category_id: null as number | null,
  is_pinned: '' as string,
  is_published: '' as string,
})

const articleFromRef = ref<FormInstance>()
const articleFrom = reactive<ArticleFrom>({
  title: '',
  category_id: null,
  description: '',
  is_published: '0',
  is_pinned: '0',
  content: '',
  video_url: '',
  cover_url: ''
})

const articleFromRules = reactive<FormRules<ArticleFrom>>({
  title: [{ required: true, message: '请填写文章标题', trigger: 'blur' }],
  is_published: [{ required: true }],
  is_pinned: [{ required: true }],
  category_id: [{ required: true, message: '请选择一个分类' }],
  description: [{ required: true, message: '请填写文章描述', trigger: 'blur' }],
  content: [{ required: true, message: '请填写文章内容' }],
  video_url: [{ required: true, message: '请完善视频连接' }],
  cover_url: [{ required: true, message: '请上传一张封面图' }]
})

const showCropper = ref(false)
const cropperFile = ref<string | null>(null)

const showViewer = ref(false)
const previewUrl = computed(() =>
  articleFrom.cover_url?.startsWith('http')
    ? articleFrom.cover_url
    : BaseUrl + articleFrom.cover_url
)

/* **********drawer配置********** */
const drawerTitle = computed(() => {
  return drawerType.value === 'add' ? '添加文章' : '编辑文章'
})
const drawerType = ref<'add' | 'edit'>('add')
const drawerVisible = ref(false)
const isVlogType = computed(() => {
  return categoryData.value.find(v => v.id === articleFrom.category_id)?.name === 'Vlog'
})
/* ***************************** */

const showComment = ref(false)
type ArticleWithComments = ArticleItem & { comments?: CommentItem[] }
const curComment = ref<ArticleWithComments | null>(null)
const ignoreTableSwitchChange = ref(false)

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

function checkComment(row: ArticleItem) {
  ServerAPI.getArticleComment({ id: row.id }).then((res) => {
    curComment.value = row
    const comments = res.data || []
    curComment.value.comments = comments
  }).then(() => {
    showComment.value = true
  })
}

function checkCommentDetail(_row: CommentItem) {
  // 可以扩展查看评论详情
}

function delComment(row: CommentItem) {
  ServerAPI.delArticleComment({ id: row.id }).then(() => {
    ElMessage.success('删除成功')
    if (curComment.value) {
      curComment.value.comments = curComment.value.comments?.filter((v: CommentItem) => v.id !== row.id) || []
      curComment.value.comment_num = Math.max((curComment.value.comment_num || 1) - 1, 0)
    }
  })
}

async function edit(row: ArticleItem) {
  drawerType.value = 'edit'
  drawerVisible.value = true
  Object.assign(articleFrom, row)
  await nextTick()
  editorRef.value?.setHtml(row.content)
}

async function toggleSomeKey(row: ArticleItem, key: 'is_pinned' | 'is_published', newVal: string) {
  if (ignoreTableSwitchChange.value) return
  const oldVal = row[key]
  row[key] = newVal // 乐观更新 UI
  try {
    const res = await ServerAPI.editArticle({ ...row })
    if (res.code === 1) ElMessage.success('修改成功✌️')
  } catch {
    row[key] = oldVal // 失败回滚
  }
}

function del(id: number) {
  ServerAPI.delArticle({ id }).then((res) => {
    if (res.code === 1) {
      ElMessage.success('删除成功')
      getArticleData()
    }
  })
}

function handleCrop(files: UploadFile) {
  if (files.raw && !isValidImageFile(files.raw)) {
    ElMessage.warning('只能上传图片文件')
    return
  }
  // 直接使用本地预览
  if (files.url) {
    cropperFile.value = files.url
    showCropper.value = true
  } else if (files.raw) {
    // 如果没有url，创建本地预览
    const reader = new FileReader()
    reader.onload = (e) => {
      cropperFile.value = e.target?.result as string
      showCropper.value = true
    }
    reader.readAsDataURL(files.raw)
  }
}

function uploadHandler(file: Blob) {
  const ext = file.type.split('/')[1] || 'jpg'
  const filename = `cover_${Date.now()}.${ext}`
  const uploadFile = new File([file], filename, { type: file.type || 'image/jpeg' })
  const formData = new FormData()
  formData.append('file', uploadFile)
  ServerAPI.picUpload(formData)
    .then((res) => {
      const url = res.data?.imageUrl
      if (res.code === 1 && url) {
        ElMessage.success('封面上传成功~')
        articleFrom.cover_url = url
        closeCropper()
      }
    })
    .catch(() => {
      ElMessage.error('封面上传失败')
    })
}

function closeCropper() {
  showCropper.value = false
  cropperFile.value = null
}

function normalizeArticleRow(row: ArticleItem): ArticleItem {
  const toSwitch = (v: unknown): string => {
    return v === 1 || v === '1' || v === true ? '1' : '0'
  }
  return {
    ...row,
    is_pinned: toSwitch(row.is_pinned),
    is_published: toSwitch(row.is_published)
  }
}

async function getArticleData() {
  ignoreTableSwitchChange.value = true
  try {
    const params: Record<string, unknown> = {
      pageNo: curPage.value,
      pageSize: pageSize.value,
    }
    if (filterForm.title) params.title = filterForm.title
    if (filterForm.category_id != null) params.category_id = filterForm.category_id
    if (filterForm.is_pinned !== '') params.is_pinned = filterForm.is_pinned
    if (filterForm.is_published !== '') params.is_published = filterForm.is_published
    // 去掉值为 undefined 的参数
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key])
    await ServerAPI.getArticleList(params).then((res) => {
      const apiData = res.data || []
      total.value = apiData?.[0]?.total || 0
      articleData.value = apiData.map(normalizeArticleRow)
    })
    await nextTick()
  } finally {
    ignoreTableSwitchChange.value = false
  }
}

function onFilter() {
  curPage.value = 1
  getArticleData()
}

function onResetFilter() {
  filterForm.title = ''
  filterForm.category_id = null
  filterForm.is_pinned = ''
  filterForm.is_published = ''
  curPage.value = 1
  getArticleData()
}

async function getCateData() {
  await ServerAPI.getCategoryList().then((res) => {
    const apiData = res.data || []
    categoryData.value = apiData || []
  })
}

function pageChange(currentPage: number) {
  curPage.value = currentPage
  getArticleData()
}

function pageSizeChange() {
  curPage.value = 1
  getArticleData()
}

function openEditor() {
  resetArticleForm()
  drawerVisible.value = true
}

function saveHandler() {
  articleFromRef.value?.validate(async (valid, fields) => {
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
        ? await ServerAPI.addArticle(articleFrom)
        : await ServerAPI.editArticle(articleFrom)
    const successMsg = {
      add: '添加文章成功✌️',
      edit: '文章修改成功✌️'
    }
    if (res.code === 1) {
      ElMessage.success(successMsg[drawerType.value])
      drawerVisible.value = false
      resetArticleForm()
      getArticleData()
    }
  })
}

function resetArticleForm() {
  Object.assign(articleFrom, {
    title: '',
    category_id: null,
    description: '',
    is_published: '0',
    is_pinned: '0',
    content: '',
    video_url: '',
    cover_url: ''
  })
}

function confirmClose(done?: () => void) {
  ElMessageBox.confirm('内容尚未保存，确定要关闭吗？', '温馨提示', {
    confirmButtonText: '狠心离开',
    cancelButtonText: '继续编辑',
    type: 'warning',
  }).then(() => {
    done ? done() : (drawerVisible.value = false)
    resetArticleForm()
  }).catch(() => {})
}

onMounted(async () => {
  await getCateData()
  await getArticleData()
})

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})
</script>

<style lang="scss" scoped>
#articleManager {
  margin: 10px;

  .filter-form {
    padding: 12px 16px;
    border-radius: 4px;
  }

  .el-form-item.item_title {
    width: 30%;
  }

  .el-form-item.item_category {
    width: 300px;
  }

  .el-form-item.item_description {
    width: 80%;
  }

  .article_minpic_uploader {
    :deep(.el-upload) {
      width: 148px;
      height: 96px;
    }
  }

  .article_minpic_previewer {
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
