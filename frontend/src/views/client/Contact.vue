<template>
  <div id="contact_me">
    <PageTitle :title="'Contact Me'" />

    <div class="contact_content">
      <el-row>
        <el-col :span="16" :offset="4">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
              <el-form ref="contactFormRef" style="max-width: 600px" :model="contactForm" :rules="rules"
                label-width="auto">
                <el-form-item prop="nickname">
                  <el-input v-model="contactForm.nickname" :maxlength="50" type="text" :placeholder="namePlaceHolder" />
                </el-form-item>
                <el-form-item prop="content">
                  <el-input v-model="contactForm.content" :maxlength="200" show-word-limit type="textarea"
                    :placeholder="messagePlaceHolder" />
                </el-form-item>
                <el-form-item>
                  <el-button type="info" plain @click="sendMessage(contactForm)">{{ sendText }}</el-button>
                </el-form-item>
              </el-form>
            </el-col>
            <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
              <div class="contact_social">
                <div class="c_s_icon num">
                  <el-icon>
                    <Phone />
                  </el-icon>
                  <span>+86 131 4335 2449</span>
                </div>
                <div class="c_s_icon email">
                  <el-icon>
                    <Message />
                  </el-icon>
                  <span>kangyouknowwho@qq.com</span>
                </div>
                <div class="c_s_icon location">
                  <el-icon>
                    <Location />
                  </el-icon>
                  <span>{{ location }}</span>
                </div>
                <h2>{{ socialText }}</h2>
                <div class="c_s_icon link">
                  <a href="https://github.com/KKslide" target="_blank"><i class="iconfont icon-github"></i></a>
                  <a href="https://x.com/KK_slide" target="_blank"><i class="iconfont icon-X"></i></a>
                  <a href="https://www.instagram.com/kangyouknowwho/" target="_blank"><i
                      class="iconfont icon-instagram"></i></a>
                  <a href="https://weibo.com/u/1915491875" target="_blank"><i class="iconfont icon-weibo"></i></a>
                  <a href="https://space.bilibili.com/334163601" target="_blank"><i
                      class="iconfont icon-icon_bilibili"></i></a>
                  <a href="https://www.xiaohongshu.com/user/profile/5fb3dfea0000000001005512" target="_blank"><i
                      class="iconfont icon-XiaoHongShu"></i></a>
                </div>
              </div>
            </el-col>
          </el-row>

          <el-divider />

          <el-row>
            <el-col :span="23" :offset="1">
              <div class="contact_msg_list">
                <div class="contact_msg_item" v-for="item in messageList" :key="item.id">
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
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ContactPage' })
import type { MsgDataConfig, MsgSendConfig } from '@/interfaces'
import { reactive, ref, computed, watch, onMounted, onActivated } from 'vue'
import dayjs from 'dayjs' // 导入 Day.js
import { ElMessage } from 'element-plus'
import ClientAPI from '@/api/client/index'
import { useLangStore } from '@/stores/langStore'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const namePlaceHolder = computed(() => t('contact.namePlaceHolder'))
const nameEmptyWarning = computed(() => t('contact.nameEmptyWarning'))
const messagePlaceHolder = computed(() => t('contact.messagePlaceHolder'))
const messageEmptyWarning = computed(() => t('contact.messageEmptyWarning'))
const sendText = computed(() => t('contact.sendText'))
const location = computed(() => t('contact.location'))
const socialText = computed(() => t('contact.socialText'))
const langStore = useLangStore()
const messageList = ref<Array<MsgDataConfig>>([])
const contactFormRef = ref()
const contactForm = reactive<MsgSendConfig>({
  nickname: '',
  content: '',
})
const rules = ({
  nickname: [{ required: true, message: nameEmptyWarning, trigger: 'blur' }],
  content: [{ required: true, message: messageEmptyWarning, trigger: 'blur' }]
})
function resetForm() {
  contactFormRef.value.resetFields()
}
function getMessageList() {
  ClientAPI.getMessage().then((res) => {
    messageList.value = res.sort((n, m) => {
      const nTime = new Date(n.created_at).getTime()
      const mTime = new Date(m.created_at).getTime()
      return mTime - nTime
    })
  })
}
function sendMessage(data: MsgSendConfig) {
  contactFormRef.value.validate((valid: boolean) => {
    if (valid) {
      const { nickname, content } = data
      const params = { nickname, content }
      ClientAPI.postMessage(params)
        .then(() => {
          getMessageList()
          resetForm()
          ElMessage({
            message: 'Thanks for your message',
            type: 'success'
          })
        })
    }
  })

}
onMounted(() => {
  getMessageList()
})
onActivated(() => {
  resetForm()
})
watch(() => langStore.currentLang, () => resetForm())
</script>

<style lang="scss" scoped>
.contact_social {
  .c_s_icon {
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    span {
      margin-left: 10px;
    }

    a {
      margin-right: 10px;

      .iconfont {
        font-size: 20px;
        color: #333;
      }
    }
  }
}

.contact_msg_list {
  .contact_msg_item {
    .c_m_i_detail {
      margin-bottom: 10px;
      color: #666;

      &.mail {
        font-weight: bold;
        color: #000;
      }
    }
  }
}
</style>
