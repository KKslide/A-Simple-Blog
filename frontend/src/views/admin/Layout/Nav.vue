<template>
  <div>
    <el-menu
      :default-active="activeIndex"
      mode="horizontal"
      @select="handleSelect"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
      :ellipsis="false"
    >
      <el-menu-item index="dashboard">首页</el-menu-item>
      <el-menu-item index="category">分类管理</el-menu-item>
      <el-menu-item index="article">文章管理</el-menu-item>
      <el-menu-item index="message">留言管理</el-menu-item>
      <el-sub-menu index="options" popper-class="nav_opt_menu">
        <template #title>选项</template>
        <a href="/home" target="_blank">
          <li class="el-menu-item">
            <el-icon><HomeFilled /></el-icon>
            <span>去到主页</span>
          </li>
        </a>
        <li class="el-menu-item" @click="changePassword">
          <el-icon><EditPen /></el-icon>
          <span>修改密码</span>
        </li>
        <el-menu-item index="logout">
          <el-icon><SwitchButton /></el-icon>
          退出登录
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>

  <!-- 修改密码弹窗 -->
  <el-dialog
    v-if="dialogVisible"
    v-model="dialogVisible"
    title="修改密码"
    width="600"
    draggable
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :before-close="handleClose"
  >
    <el-steps
      style="width:60%;margin:0 auto 20px;"
      :active="formStepIndex"
      align-center
      finish-status="success"
    >
      <el-step title="输入原始账号密码" />
      <el-step title="输入新账号密码" />
    </el-steps>
    <el-form
      ref="userFormRef"
      :model="userForm"
      :rules="userFormRules"
      @submit.prevent
      @keyup.enter="saveHandler"
    >
      <el-form-item :label="userFormLabel.name" prop="username" :label-width="100">
        <el-input v-model="userForm.username" autocomplete="off" />
      </el-form-item>
      <el-form-item :label="userFormLabel.password" prop="password" :label-width="100">
        <el-input v-model="userForm.password" autocomplete="off" show-password />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="saveHandler">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ServerAPI from '@/api/server'
import { md5 } from 'js-md5'
import { ElMessage, ElNotification, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/userStore'

interface UserForm {
  username: string
  password: string
}

const UserStore = useUserStore()
const route = useRoute()
const router = useRouter()

const activeIndex = computed(() => route.name as string)

const dialogVisible = ref(false)
const formStepIndex = ref(0)
const userFormRef = ref<FormInstance>()
const userForm = reactive<UserForm>({
  username: '',
  password: ''
})

const userFormLabel = computed(() => ({
  name: formStepIndex.value === 0 ? '初始用户名:' : '新用户名:',
  password: formStepIndex.value === 0 ? '初始密码:' : '新密码'
}))

const userFormRules = reactive<FormRules<UserForm>>({
  username: [{ required: true, message: '请填写用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请填写密码', trigger: 'blur' }]
})

function handleSelect(key: string) {
  if (key === 'home') {
    router.push({ name: 'home' })
  } else if (key === 'logout') {
    logoutHandler()
  } else {
    router.push({ name: key })
  }
}

function logoutHandler() {
  ServerAPI.userLogout()
    .then(() => {
      UserStore.clearUserInfo()
      ElMessage.info('已退出登陆🫨')
      router.push({ name: 'login' })
    })
}

function changePassword() {
  dialogVisible.value = true
}

function handleClose() {
  dialogVisible.value = false
  formStepIndex.value = 0
  userFormRef.value?.resetFields()
}

function saveHandler() {
  const activeEl = document.activeElement as HTMLElement
  activeEl?.blur()

  userFormRef.value?.validate((valid) => {
    if (valid) {
      const { id = 1 } = UserStore.$state
      const { username, password: o_pwd } = userForm
      const password = md5(o_pwd)

      if (formStepIndex.value === 0) {
        ServerAPI.userEdit({ type: 'check', username, password })
          .then((res) => {
            if (res.code === 1) {
              ElMessage.success('验证通过👌')
              formStepIndex.value++
              userFormRef.value?.resetFields()
            }
          })
      } else if (formStepIndex.value === 1) {
        const params = { type: 'edit', id, username, password }
        ServerAPI.userEdit(params)
          .then(() => {
            formStepIndex.value = 0
            handleClose()
            ElMessage.success('密码修改成功👌')
            ElNotification({
              title: '密码修改成功! 即将重新登陆👌',
              type: 'warning',
              duration: 3000,
              onClose: () => {
                logoutHandler()
              }
            })
          })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.el-menu--horizontal {
  .el-sub-menu {
    margin-left: auto;
  }
}
.el-menu {
  border-bottom: 1px solid #000;
}
</style>
