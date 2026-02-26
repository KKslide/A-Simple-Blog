<template>
  <div id="articleManager">
    <el-table :data="articleData" :border="true" style="width: 100%">
      <el-table-column prop="id" label="文章ID" min-width="80"></el-table-column>
      <el-table-column prop="title" label="分文章标题" min-width="300"></el-table-column>
      <el-table-column prop="cate_name" label="文章分类" min-width="100"></el-table-column>
      <el-table-column prop="addtime" label="添加时间" min-width="200">
        <template #default="scope">
          <p>{{ new Date(scope.row.addtime).Format('yyyy-MM-dd hh:mm:ss') }}</p>
        </template>
      </el-table-column>
      <el-table-column prop="viewnum" label="阅读量" min-width="100"></el-table-column>
      <el-table-column prop="comment_num" label="评论" min-width="100">
        <template #default="scope">
          <el-button v-if="!!scope.row.comment_num" type="primary" text @click="checkComment(scope.row)">
            {{ scope.row.comment_num }}
          </el-button>
          <el-button v-else type="info" text disabled>0</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="is_top" label="置顶" min-width="100">
        <template #default="scope">
           <el-switch
            v-model="scope.row.is_top"
            inline-prompt
            style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
            active-value="1"
            inactive-value="0"
            active-text="是"
            inactive-text="否"
            @change="toggleSomeKey(scope.row)"
          />
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
            @change="toggleSomeKey(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="150">
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

    <br>
    <el-button type="default" :text="true" bg @click='drawerType="add";openEditor()'>添加文章</el-button>

    <el-divider></el-divider>
    <el-pagination
      v-if="articleData.length"
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
      ref="drawer"
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
          <el-form-item label="文章分类"  prop="category" class="item_category">
            <el-select v-model="articleFrom.category" placeholder="请选文章分类">
              <el-option v-for="(v,i) in categoryData" :key="v.id" :label="v.name" :value="'' +v.id" ></el-option>
            </el-select>
          </el-form-item>
          <!-- 是否显示 -->
          <el-form-item label="是否显示" prop="is_show">
            <el-switch
              v-model="articleFrom.is_show"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-value="1"
              inactive-value="0"
            ></el-switch>
          </el-form-item>
          <!-- 是否置顶 -->
          <el-form-item label="是否置顶" prop="is_top">
            <el-switch
              v-model="articleFrom.is_top"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-value="1"
              inactive-value="0"
            ></el-switch>
          </el-form-item>
          <!-- 是否为内置页 -->
          <!-- <el-form-item label="是否设为内置页" prop="is_built_in">
            <el-switch
              v-model="articleFrom.is_built_in"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-value="1"
              inactive-value="0"
            ></el-switch>
          </el-form-item> -->
          <!-- 文章简介 -->
          <el-form-item label="文章简介" prop="description" class="item_description">
            <el-input v-model="articleFrom.description" autocomplete="off"></el-input>
          </el-form-item>
          <!-- 视频链接 -->
          <el-form-item v-if="articleFrom.category==34" label="视频链接" prop="video_src">
            <el-input v-model="articleFrom.video_src" autocomplete="off"></el-input>
          </el-form-item>
          <!-- 文章封面图 -->
          <el-form-item label="文章封面" prop="minpic_url">
            <el-upload
              action="#"
              class="article_minpic_uploader"
              v-model="articleFrom.minpic_url"
              list-type="picture-card"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleCrop"
            >
              <template #default>
                <img
                  v-if="articleFrom.minpic_url"
                  :src="BaseUrl + articleFrom.minpic_url"
                  style="width:146px;height:94px;border-radius:5px;object-fit:cover;"
                />
                <div v-else>
                  <el-icon><Plus /></el-icon>
                </div>
              </template>
            </el-upload>
            <div v-if="articleFrom.minpic_url" class="article_minpic_previewer">
              <el-icon size="20"><zoom-in /></el-icon>
              <el-icon size="20" @click="articleFrom.minpic_url=''"><Delete /></el-icon>
            </div>
          </el-form-item>
          <!-- 文章内容 -->
          <el-form-item label="文章内容" prop="composition">
            <el-input v-show="false" v-model="articleFrom.composition"></el-input>
            <div style="border: 1px solid #ccc;width:100%">
              <Toolbar
                style="border-bottom: 1px solid #ccc;"
                :editor="editorRef"
                :defaultConfig="toolbarConfig"
                :mode="mode"
              />
              <Editor
                style="height: 300px; overflow-y: hidden;"
                v-model="articleFrom.composition"
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
        <el-button @click="closeHandler">关  闭</el-button>
        <el-button type="primary" @click="saveHandler" >保  存</el-button>
      </template>
    </el-drawer>

    <!-- vue-cropper -->
    <el-dialog
      v-if="showCropper"
      v-model="showCropper"
      draggable
      width="800"
    >
      <Cropper :img-file="cropperFile" @cropperDone="uploadHandler" />
    </el-dialog>

    <!-- comments -->
    <el-dialog
      v-if="showComment"
      v-model="showComment"
      draggable
      width="800"
      :title="`文章「${curComment.title}」的评论`"
    >
      <template #default>
        <el-table :data="curComment.comments" :border="true" style="width: 100%">
          <el-table-column prop="time" label="日期">
            <template #default="scope">
              <p>{{ new Date(scope.row.time).Format('yyyy-MM-dd hh:mm:ss') }}</p>
            </template>
          </el-table-column>
          <el-table-column prop="user" label="用户"></el-table-column>
          <el-table-column prop="comment" label="评论内容"></el-table-column>
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
          <el-button @click="curComment=null;showComment=false;">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import ServerAPI from '@/api/server'
import { ref, reactive, shallowRef, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { ElMessage } from 'element-plus'
import Cropper from './Widgets/Cropper.vue'
import '@wangeditor/editor/dist/css/style.css' // 引入 css
const BaseUrl = import.meta.env.VITE_MEDIA_URL
const editorRef = shallowRef()
const toolbarConfig = ref({})
const editorConfig = ref({ placeholder: '请输入文章内容...' })
const mode = ref('default')
const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
  editor.getMenuConfig("uploadImage").customUpload = (file, insertFn) => {
    let tempForm = new FormData();
    tempForm.append('file', file);
    ServerAPI.picUpload(tempForm).then(res => {
      if (res.code==1) {
        insertFn(BaseUrl + res.imageUrl)
      } else {
        alert('上传失败!')
      }
    })
  }
}
const handleChange = (editor) => {
  const html = editor.getHtml();
  articleFrom.composition = html
}
const articleData = ref([])
const categoryData = ref([])
const pageSize = ref(5)
const total = ref(1) // 总条数
const pages = ref(1) // 总页数
const curPage = ref(1) // 当前页
const articleFromRef = ref(null)
const articleFrom = reactive({
  title: '',
  category: null,
  description: '',
  is_show: '0',
  is_top: '0',
  // is_built_in: '0',
  composition: '',
  video_src: '',
  minpic_url: ''
})
const articleFromRules = reactive({
  title: [{ required: true, message: '请填写文章标题', trigger: 'blur' }],
  is_show: [{ required: true }],
  is_top: [{ required: true }],
  category: [{ required: true, message: '请选择一个分类' }],
  description: [{ required: true, message: '请填写文章描述', trigger: 'blur' }],
  composition: [{ required: true, message: '请填写文章内容' }],
  video_src: [{ required: true, message: '请完善视频连接' }],
  minpic_url: [{ required: true, message: '请上传一张封面图' }]
})
const showCropper = ref(false)
const cropperFile = ref(null)
/* **********drawer配置********** */
const drawerTitle = computed(() => {
  return drawerType.value == 'add' ? '添加文章' : '编辑文章'
})
const drawerType = ref('add')
const drawerVisible = ref(false)
/* ***************************** */
const showComment = ref(false)
const curComment = ref({})
function checkComment(row) {
  ServerAPI.getArticleComment({ id: row.id })
    .then(res => {
      curComment.value = row
      curComment.value.comments = res
    })
    .then(() => {
      showComment.value = true
    })
}
function checkCommentDetail(row) {}
function delComment(row) {
  ServerAPI.delArticleComment({id: row.t_id})
    .then(() => {
      ElMessage.success('删除成功')
      curComment.value.comments = curComment.value.comments.filter(v => v.t_id != row.t_id)
      curComment.value.comment_num--
    })
}
async function edit(row) {
  drawerType.value = 'edit'
  drawerVisible.value = true
  Object.assign(articleFrom, row)
  await nextTick()
  editorRef.value.setHtml(row.composition)
}
async function toggleSomeKey(row) {
  Object.assign(articleFrom, row)
  const res = await ServerAPI.editArticle(articleFrom)
  if (res.code == 1) {
    ElMessage.success('修改成功✌️')
  }
}
function del(id) {
  ServerAPI.delArticle({ id })
    .then(res => {
      if (res.code == 1) {
        ElMessage.success('删除成功')
        getArticleData()
      }
    })
}
function handleCrop (files) {
  cropperFile.value = files.url
  showCropper.value = true
}
function uploadHandler (file) {
  const imgData = new FormData();
  const fileName = 'minpic_' + new Date().Format('yyyy_MM_dd_hh_mm_ss') + '.'
  const fileOfBlob = new File([file], fileName + file.type.split('/')[1]);
  imgData.append('file', fileOfBlob);
  imgData.image = fileOfBlob;
  ServerAPI.picUpload(imgData)
    .then(res => {
      ElMessage.success('封面上传成功~')
      articleFrom.minpic_url = res.imageUrl
      showCropper.value = false
      cropperFile.value = null
    })
    .catch(err => {
      console.log(err)
    })
}
async function getArticleData() {
  const params = { pageNo: curPage.value, pageSize: pageSize.value }
  await ServerAPI.getArticleList(params)
    .then(res => {
      total.value = res.data[0]?.total || 0 // 总共的数量
      pages.value = Math.floor(total.value/5)
      articleData.value = res.data
    })
}
async function getCateData() {
  await ServerAPI.getCategoryList()
    .then(res => {
      categoryData.value = res.data
    })
}
function pageChange(currentPage) { // 点击分页按钮
  curPage.value = currentPage
  getArticleData()
}
function openEditor() {
  drawerVisible.value = true
}
function saveHandler() {
  articleFromRef.value.validate(async (valid, fields) => {
    if (!valid) {
      for (const key in fields) {
        if (Object.prototype.hasOwnProperty.call(fields, key)) {
          const item = fields[key];
          ElMessage.error(item[0]?.message)
        }
      }
      return
    }
    const res = drawerType.value=='add'
      ? await ServerAPI.addArticle(articleFrom)
      : await ServerAPI.editArticle(articleFrom)
    const successMsg = {
      'add': '添加文章成功✌️',
      'edit': '文章修改成功✌️'
    }
    if (res.code == 1) {
      ElMessage.success(successMsg[drawerType.value])
      closeHandler()
      getArticleData()
    }
  })
}
function closeHandler() {
  drawerVisible.value = false
  Object.assign(articleFrom, {
    title: '',
    category: null,
    description: '',
    is_show: '0',
    composition: '',
    video_src: '',
    minpic_url: ''
  })
}
onMounted(async () => {
  await getCateData()
  await getArticleData()
})
// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})
</script>

<style lang="scss" scoped>
#articleManager {
  margin: 10px;
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
      background-color: rgba(0,0,0,.5);
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
