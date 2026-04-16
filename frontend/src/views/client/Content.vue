<template>
  <div id="log_content">
    <el-row>
      <el-col :span="16" :offset="4" :xs="{span:24, offset:0}">
        <div id="content_banner">
          <span style="display: none;">{{ BaseUrl + contentObj.cover_url }}</span>
          <el-image :src="BaseUrl + contentObj.cover_url" style="width: 100%; height: 120px;" fit="contain"></el-image>
        </div>
        <PageTitle :title="contentObj.title" />
        <div class="content_info">
          <div class="c_i_icon view">
            <el-icon size="14"><View /></el-icon>
            <span>{{ contentObj?.view_count || 0 }}</span>
          </div>
          <span class="split"></span>
          <div class="c_i_icon comment">
            <el-icon size="14"><Comment /></el-icon>
            <span>{{ contentObj?.comment?.length || 0 }}</span>
          </div>
          <span class="split"></span>
          <div class="c_i_icon category">
            <el-icon size="14"><CollectionTag /></el-icon>
            <span>{{ contentObj?.category || '-' }}</span>
          </div>
          <span class="split"></span>
          <div class="c_i_icon time">
            <el-icon size="14"><Clock /></el-icon>
            <span>{{ new Date(contentObj?.created_at||0).Format('yyyy-MM-dd hh:mm:ss') }}</span>
          </div>
        </div>
        <div ref="contentRef" class="content_html" v-html="contentObj?.content"></div>

        <!-- 视频部分 -->
        <div class="plyr-wrapper" v-if="contentObj.category == 'Vlog' && showPlayer">
          <vue-plyr>
            <video :key="contentObj.video_url" controls crossorigin playsinline :poster="BaseUrl + contentObj.cover_url">
              <source :src="BaseUrl + contentObj.video_url" type="video/mp4" />
            </video>
          </vue-plyr>
        </div>

        <el-divider />

        <div class="content_nav">
          <el-row>
            <el-col :xs="24" :sm="24" :md="12" :lg="12">
              <div class="c_n_pre" v-show="prevObj" @click="checkPrevOrNext(prevObj?.id)">
                <el-icon size="20"><Back /></el-icon>
                <span>「{{ prevObj?.title }}」</span>
              </div>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="12">
              <div class="c_n_next" v-show="nextObj" @click="checkPrevOrNext(nextObj?.id)">
                <span>「{{ nextObj?.title }}」</span>
                <el-icon size="20"><Right /></el-icon>
              </div>
            </el-col>
          </el-row>
        </div>

        <el-divider />

        <!-- 评论表单 -->
         <el-form
          ref="commentFormRef"
          :model="commentForm"
          :rules="commentRules"
          class="comment_form"
          @submit.prevent
        >
          <el-form-item prop="comment">
            <el-input v-model="commentForm.comment" :maxlength="200" show-word-limit type="textarea" :placeholder="texts.commentPlaceHolder" />
          </el-form-item>

          <el-form-item class="comment_name" :label="texts.visitorName" prop="name">
            <el-input v-model="commentForm.name" :maxlength="50" type="text" :placeholder="texts.namePlaceHolder" />
            <el-button type="info" plain @click="sendComment(commentForm)">{{ texts.sendButton }}</el-button>
          </el-form-item>
        </el-form>

        <el-divider />

        <!-- 评论列表 -->
         <el-row>
          <el-col :span="23" :offset=1>
            <div class="content_comment_list">
              <div class="content_comment_item" v-for="(item, index) in contentObj?.comment || []" :key="index">
                <div class="c_m_i_detail mail">{{ item.nickname }}:</div>
                <div class="c_m_i_detail content">{{ item.content }}</div>
                <div class="c_m_i_detail time">{{ new Date(item.created_at).Format('yyyy-MM-dd hh:mm:ss') }}</div>
                <el-divider />
              </div>
            </div>
          </el-col>
         </el-row>
      </el-col>
    </el-row>

    <!-- 图片预览 -->
    <el-image-viewer
      v-if="showPreview"
      :url-list="previewImgList"
      show-progress
      :initial-index="previewIndex"
      :hide-on-click-modal="true"
      @close="showPreview = false"
    />
  </div>
</template>

<script setup>
defineOptions({ name: 'content' })
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ClientAPI from '@/api/client/index'
import { hljs } from '@/utils/config'
import { useLangStore } from '@/stores/langStore'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const texts = computed(() => ({
  commentPlaceHolder: t('logContent.commentPlaceHolder'),
  namePlaceHolder: t('logContent.namePlaceHolder'),
  sendButton: t('logContent.sendButton'),
  visitorName: t('logContent.visitorName')
}))
const emptyCommentTip = computed(() => t('logContent.emptyCommentTip'))
const emptyVisitor = computed(() => t('logContent.emptyVisitor'))
const langStore = useLangStore()
const BaseUrl = import.meta.env.VITE_MEDIA_URL
const contentObj = ref({})
const prevObj = ref({})
const nextObj = ref({})
const showPlayer = ref(false)
const showPreview = ref(false)
const previewIndex = ref(0)
const commentFormRef = ref(null)
const route = useRoute()
const router = useRouter()
const commentForm = reactive({
  comment: '',
  name: '',
})
const commentRules = reactive({
  comment: [{ required: true, message: emptyCommentTip, trigger: 'blur' }],
  name: [{ required: true, message: emptyVisitor, trigger: 'blur' }]
})
const contentRef = ref(null)
const previewImgList = reactive([])
function resetForm() {
  commentFormRef.value.resetFields()
}
function sendComment(data) {
  commentFormRef.value.validate(valid => {
    if (valid) {
      const { id: contentid } = contentObj.value
      const { comment, name: visitor } = data
      const params = { contentid, nickname: visitor, content: comment }
      ClientAPI.postBlogComment(params)
        .then(res => {
          contentObj.value.comment.unshift({
            nickname: visitor,
            content: comment,
            created_at: new Date().Format('yyyy-MM-dd hh:mm:ss')
          })
          resetForm()
          ElMessage({
            message: 'Thanks for your comment',
            type: 'success'
          })
        })
    }
    else {

    }
  })
}
function getContentData() {
  let { id } = route.params
  ClientAPI.getBlogContent({ contentid: Number(id) })
    .then(async res => {
      if (res.code == 0) {
        alert(res.msg)
      }
      else {
        const { prev, cur, next } = res
        contentObj.value = cur
        prevObj.value = prev
        nextObj.value = next
        showPlayer.value = false
        setTimeout(() => {
          if (cur.category == 'Vlog') showPlayer.value = true
        }, 0);
        await nextTick()
        previewImgList.length = 0
        const imgs = contentRef.value.querySelectorAll('img')
        imgs.forEach((v, i) => {
          previewImgList.push(v.src)
          v.onclick = () => {
            previewIndex.value = i
            showPreview.value = true
          }
        })
      }
    })
    .catch(err => {
      console.log(err)
    })
}
function checkPrevOrNext(id) {
  router.push(`/content/${id}`)
}
onMounted(() => {
  getContentData()
})
watch(
  () => contentObj.value?.content,
  async () => {
    await nextTick()
    contentRef.value
      .querySelectorAll('.content_html pre code')
      .forEach((el) => hljs.highlightElement(el))

    const pTags = contentRef.value.querySelectorAll('.content_html p')
    pTags.forEach(p => {
      if (p.querySelector('img')) {
        p.classList.add('has_image')
      }
    });
  },
  { immediate: true }
)
watch( () => route.params, getContentData)
watch(() => langStore.currentLang, resetForm)
</script>

<style lang="scss" scoped>
#log_content {
  .content_info {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
    .c_i_icon {
      display: flex;
      align-items: center;
      justify-content: center;
      span {
        margin-left: 8px;
        font-size: 13px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    .split{
      display: inline-block;
      width: 1px;
      height: 15px;
      background-color: #000;
      margin: 0 15px;
    }
  }
  :deep(.content_html) {
    a {
      color: #032666;
      text-decoration: underline;
    }
    p.has_image {
      display: flex;
      justify-content: flex-start;
      flex-wrap: wrap;
      align-items: center;
      img {
        height: 200px;
        object-fit: contain;
        margin-bottom: 10px;
        margin-right: 10px;
      }
    }
  }
  .content_nav{
    margin: 10px 0;
    .c_n_pre,.c_n_next{
      text-align: center;
      height: 30px;
      line-height: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: font-weight .2s;
      &:hover{
        font-weight: bold;
      }
    }
  }

  :deep(.comment_form) {
    .comment_name {
      .el-input {
        width: 250px;
        margin-right: 15px;
      }
      .el-form-item__content {
        flex-wrap: nowrap;
      }
    }
  }

  .content_comment_list{
    .content_comment_item{
      .c_m_i_detail{
        margin-bottom: 10px;
        color: #666;
        &.mail {
          font-weight: bold;
          color: #000;
        }
      }
    }
  }
  .plyr-wrapper {
    width: 100%;
    max-width: 100%;
    aspect-ratio: 16 / 9; /* 或者使用固定高度：height: 220px; */
    background-color: black; /* 可选，让加载时更平滑 */
  }

  .plyr-wrapper .plyr {
    width: 100%;
    height: 100%;
  }
}
</style>
