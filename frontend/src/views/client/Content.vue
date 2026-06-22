<template>
  <div id="log_content">
    <el-row>
      <el-col :span="16" :offset="4" :xs="{span:24, offset:0}">
        <div id="content_banner">
          <span style="display: none;">{{ utils.mediaUrl(contentObj.cover_url) }}</span>
          <el-image :src="categoryBannerUrl" style="width: 100%; height: 120px;" fit="contain"></el-image>
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
            <span>{{ Array.isArray(contentObj?.comment) ? contentObj.comment.length : 0 }}</span>
          </div>
          <span class="split"></span>
          <div class="c_i_icon category">
            <el-icon size="14"><CollectionTag /></el-icon>
            <span>{{ contentObj?.category || '-' }}</span>
          </div>
          <span class="split"></span>
          <div class="c_i_icon time">
            <el-icon size="14"><Clock /></el-icon>
            <span>{{ dayjs(contentObj?.created_at || 0).format('YYYY-MM-DD HH:mm:ss') }}</span>
          </div>
        </div>
        <div ref="contentRef" class="content_html" v-html="contentObj?.content"></div>

        <!-- 视频部分 -->
        <div class="plyr-wrapper" v-if="contentObj.category == 'Vlog' && showPlayer">
          <vue-plyr>
            <video
              :key="contentObj.video_url"
              controls
              crossorigin="anonymous"
              playsinline
              :poster="utils.mediaUrl(contentObj.cover_url)"
            >
              <source :src="vlogVideoUrl" type="video/mp4" />
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
              <div class="content_comment_item" v-for="(item, index) in (Array.isArray(contentObj?.comment) ? contentObj.comment : [])" :key="index">
                <div class="c_m_i_detail mail">{{ item.nickname }}:</div>
                <div class="c_m_i_detail content">{{ item.content }}</div>
                <div class="c_m_i_detail time">{{ dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss') }}</div>
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

<script setup lang="ts">
defineOptions({ name: 'ContentPage' })
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance } from 'element-plus'
import ClientAPI, { type ArticleViewResult } from '@/api/client/index'
import utils from '@/utils'
import 'vue-plyr/dist/vue-plyr.css'
import { usePageStore } from '@/stores/pageStore'
import { hljs } from '@/config/config'
import { useLangStore } from '@/stores/langStore'
import { useI18n } from 'vue-i18n'
import type { ContentConfig, ContentData, CommentItemConfig, ApiResponse } from '@/types/api'
import { dayjs } from '@/config/config'
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
const pageStore = usePageStore()
const contentObj = ref<ContentConfig>({
  id: 0,
  title: '',
  category: '',
  category_id: 0,
  content: '',
  description: '',
  created_at: '',
  view_count: 0,
  cover_url: '',
  video_url: '',
  is_published: 0,
  is_del: 0,
  comment: []
})
const prevObj = ref<ContentConfig | undefined>(undefined)
const nextObj = ref<ContentConfig | undefined>(undefined)
const showPlayer = ref(false)
const showPreview = ref(false)
const previewIndex = ref(0)
const commentFormRef = ref<FormInstance | null>(null)
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
const contentRef = ref<HTMLElement | null>(null)
const previewImgList = reactive<string[]>([])
const categoryBannerUrl = computed(() => utils.mediaUrl(contentObj.value.category_banner_url || ''))
const vlogVideoUrl = computed(() => utils.mediaUrl(contentObj.value.video_url || ''))
function resetForm() {
  commentFormRef.value?.resetFields()
}
function sendComment(data: { comment: string; name: string }) {
  commentFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      const { id: contentid } = contentObj.value as ContentConfig
      const { comment, name: visitor } = data
      const params = { comment: comment ?? '', nickname: visitor ?? '' }
      ClientAPI.postBlogComment(contentid, params)
        .then(() => {
          if (Array.isArray(contentObj.value.comment)) {
            const localComment: CommentItemConfig = {
              id: Date.now(),
              article_id: contentid,
              nickname: visitor ?? '',
              content: comment ?? '',
              created_at: dayjs().format('YYYY-MM-DD HH:mm:ss')
            }
            contentObj.value.comment.unshift(localComment)
          }
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

/** 防止同篇文章在短时间内重复请求统计接口 */
let lastViewArticleId = 0
let lastViewRequestAt = 0

function syncViewCountToUi(articleId: number, viewCount: number) {
  if (Number(contentObj.value.id) !== articleId) return
  contentObj.value.view_count = viewCount
  pageStore.updateArticleViewCount(articleId, viewCount)
}

/** 解析统计接口返回值并刷新详情页/列表缓存中的阅读量 */
function applyViewCountFromResponse(res: ArticleViewResult, articleId: number, baseViewCount: number) {
  const payload = res?.data
  if (!payload) return

  let next = baseViewCount
  if (payload.view_count != null && !Number.isNaN(Number(payload.view_count))) {
    next = Number(payload.view_count)
  } else if (payload.counted) {
    next = baseViewCount + 1
  }

  if (!Number.isFinite(next)) return
  syncViewCountToUi(articleId, next)
}

function recordArticleView(articleId: number, baseViewCount?: number) {
  const id = Number(articleId)
  if (!id) return
  const now = Date.now()
  if (id === lastViewArticleId && now - lastViewRequestAt < 2000) return
  lastViewArticleId = id
  lastViewRequestAt = now

  const base = Number(baseViewCount ?? contentObj.value.view_count ?? 0)
  // 先乐观 +1, 接口返回后再校准 (同日重复访问会回退为服务端值)
  syncViewCountToUi(id, base + 1)

  ClientAPI.recordArticleView(id)
    .then((res) => {
      if (Number(route.params.id) !== id) return
      applyViewCountFromResponse(res, id, base)
    })
    .catch((err) => {
      console.warn('recordArticleView failed', err)
      if (Number(route.params.id) === id) {
        syncViewCountToUi(id, base)
      }
    })
}

function getContentData() {
  const { id } = route.params as { id: string }
  const articleId = Number(id)
  ClientAPI.getBlogContent(articleId)
    .then(async res => {
      const { code, data, msg } = res as ApiResponse<ContentData>
      if (!data?.cur) {
        if (code === 0 && msg) alert(msg)
        return
      }
      const { prev, cur, next } = data
      const baseViewCount = Number(cur.view_count ?? 0)
      contentObj.value = cur
      recordArticleView(cur.id ?? articleId, baseViewCount)
      prevObj.value = prev as ContentConfig | undefined
      nextObj.value = next as ContentConfig | undefined
      showPlayer.value = false
      setTimeout(() => {
        if (cur.category == 'Vlog') showPlayer.value = true
      }, 0)
      await nextTick()
      previewImgList.length = 0
      const imgs = contentRef.value?.querySelectorAll('img')
      imgs?.forEach((v, i) => {
        previewImgList.push(v.src as string)
        v.onclick = () => {
          previewIndex.value = i
          showPreview.value = true
        }
      })
    })
    .catch(err => {
      console.log(err)
    })
}
function checkPrevOrNext(id: number | undefined) {
  if (id) {
    router.push(`/content/${id}`)
  }
}
onMounted(() => {
  getContentData()
})
watch(
  () => contentObj.value?.content,
  async () => {
    await nextTick()
    contentRef.value
      ?.querySelectorAll('.content_html pre code')
      .forEach((el) => hljs.highlightElement(el as HTMLElement))
    // 为代码块添加复制按钮
    contentRef.value
      ?.querySelectorAll('.content_html pre')
      .forEach((pre) => {
        if (pre.querySelector('.copy-btn')) return
        const btn = document.createElement('span')
        btn.className = 'copy-btn'
        btn.innerHTML = '<svg viewBox="0 0 1024 1024" width="14" height="14" fill="currentColor"><path d="M832 64H296c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h496v688c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V96c0-17.7-14.3-32-32-32zM704 192H192c-17.7 0-32 14.3-32 32v530.7c0 8.5 3.4 16.6 9.4 22.6l173.3 173.3c2.2 2.2 4.7 4 7.4 5.5v1.9h4.2c3.5 1.3 7.2 2 11 2H704c17.7 0 32-14.3 32-32V224c0-17.7-14.3-32-32-32zM350 856.2L263.9 770H350v86.2zM638.7 787.3c-2 2-4.5 3.5-7.1 4.5-1.4.6-2.8.9-4.3 1H416V664h222.7c1.5 0 2.9-.3 4.3-1 2.6-1 5.1-2.5 7.1-4.5l113.3-113.3c3.9-3.9 3.9-10.2 0-14.1l-113.3-113.3c-3.9-3.9-10.2-3.9-14.1 0l-130 130c-3.9 3.9-3.9 10.2 0 14.1l130 130c3.9 3.9 10.2 3.9 14.1 0z"></path></svg> Copy'
        btn.onclick = () => {
          const code = pre.querySelector('code')
          if (!code) return
          navigator.clipboard.writeText(code.textContent || '').then(() => {
            btn.innerHTML = '<svg viewBox="0 0 1024 1024" width="14" height="14" fill="currentColor"><path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474c-6.1-7.7-15.3-12.2-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1 0.4-12.8-6.3-12.8z"></path></svg> Done'
            btn.classList.add('copied')
            setTimeout(() => {
              btn.innerHTML = '<svg viewBox="0 0 1024 1024" width="14" height="14" fill="currentColor"><path d="M832 64H296c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h496v688c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V96c0-17.7-14.3-32-32-32zM704 192H192c-17.7 0-32 14.3-32 32v530.7c0 8.5 3.4 16.6 9.4 22.6l173.3 173.3c2.2 2.2 4.7 4 7.4 5.5v1.9h4.2c3.5 1.3 7.2 2 11 2H704c17.7 0 32-14.3 32-32V224c0-17.7-14.3-32-32-32zM350 856.2L263.9 770H350v86.2zM638.7 787.3c-2 2-4.5 3.5-7.1 4.5-1.4.6-2.8.9-4.3 1H416V664h222.7c1.5 0 2.9-.3 4.3-1 2.6-1 5.1-2.5 7.1-4.5l113.3-113.3c3.9-3.9 3.9-10.2 0-14.1l-113.3-113.3c-3.9-3.9-10.2-3.9-14.1 0l-130 130c-3.9 3.9-3.9 10.2 0 14.1l130 130c3.9 3.9 10.2 3.9 14.1 0z"></path></svg> Copy'
              btn.classList.remove('copied')
            }, 2000)
          })
        }
        (pre as HTMLElement).style.position = 'relative'
        pre.appendChild(btn)
      })

    const pTags = contentRef.value?.querySelectorAll('.content_html p')
    pTags?.forEach(p => {
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
    pre {
      position: relative;
      &:hover .copy-btn {
        opacity: 1;
      }
    }
    .copy-btn {
      position: absolute;
      top: 6px;
      right: 6px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      font-size: 12px;
      line-height: 1;
      color: #999;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 4px;
      cursor: pointer;
      opacity: 0;
      transition: opacity .2s, color .2s, background .2s, border-color .2s;
      z-index: 10;
      &:hover {
        color: #fff;
        background: rgba(255,255,255,0.15);
        border-color: rgba(255,255,255,0.3);
      }
      &.copied {
        color: #67c23a;
        border-color: rgba(103,194,58,0.3);
        background: rgba(103,194,58,0.08);
      }
    }
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
