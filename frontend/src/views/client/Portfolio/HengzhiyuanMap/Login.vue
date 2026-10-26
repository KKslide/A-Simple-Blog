<template>
  <div class="login">
    <div class="login_box">
      <div class="login_content">
        <div class="login_logo">
          <div class="login_title">餐饮油烟管家</div>
          <div class="login_sub_title">CATERING LAMPBLACK BUTLER</div>
        </div>
        <form @submit.prevent="loginHandler">
          <input type="text" name="account" placeholder="请输入您的账号" v-model="loginForm.account" autofocus />
          <input type="password" name="pwd" placeholder="请输入您的密码" v-model="loginForm.pwd" autocomplete="off" />
          <input type="submit" value="登录" />
        </form>
      </div>
    </div>
    <div class="login_footer">
      <p>
        <a href="https://beian.miit.gov.cn/" target="_blank">粤ICP备18051891号 </a>
        <span class="mr-8">Copyright</span>
        <a href="http://www.hzy-sz.com" target="_blank">©衡智远科技（深圳）有限公司</a>
      </p>
    </div>
    <div class="login_success_tip" ref="login_tip" v-show="islogin">
      登录成功!
    </div>
  </div>
</template>

<script setup lang="ts">
import { setCookie } from '@/views/client/Portfolio/HengzhiyuanMap/utils'
import { ref, reactive, toRaw, onMounted } from 'vue'
import { login, isLogin, HZY_TOKEN_KEY, HZY_TOKEN_TIME_KEY, HZY_COMPANY_INFO_KEY } from '@/api/hengzhiyuan'
import { useRouter } from 'vue-router'
const islogin = ref(false)
const loginForm = reactive({
  account: 'admin',
  pwd: '123',
})
const router = useRouter()
function loginHandler () {
  if (!loginForm.account || !loginForm.pwd) return
  doLogin()
}
function doLogin () {
  let form = toRaw(loginForm)
  form = {
    account: '13632648445',
    pwd: '8445',
  }
  login(form).then(res => {
    if (res.status == 200 && res.data.code == 2000) {
      setCookie('hzy_token', res.data.data, 1)
      // alert("登陆成功!")
      islogin.value = true
      localStorage.setItem(HZY_TOKEN_KEY, res.data.data)
      localStorage.setItem(HZY_TOKEN_TIME_KEY, String(new Date().getTime()))

      isLogin()
        .then(loginRes => {
          if (loginRes.status == 200 && loginRes.data.code == 2000) {
            localStorage.setItem(HZY_COMPANY_INFO_KEY, JSON.stringify(loginRes.data.is_login))

            if (res.data.isDF == 1 || res.data.isDF == "1") {
              //显示动画
              setTimeout(() => {
                router.replace({ name: 'hzyMap' })
              }, 2000);
            } else {
              //跳过动画
              router.replace({ name: 'hzyMap' })
            }

          } else {
            alert("请求错误!")
          }
        })
        .catch(err => {
          console.log(err);
        })
    } else {
      alert(res.data.msg)
    }
  }).catch(err => {
    alert(err)
    console.log(err);
  })
}
onMounted(() => {
  isLogin().then(res => {
    const { data: { code, is_login } = {} } = res
    if (code == 2000 && !!is_login) {
      localStorage.setItem(HZY_COMPANY_INFO_KEY, JSON.stringify(is_login))
      router.push({ name: 'hzyMap' })
    }
  })
})
</script>

<style lang="scss" scoped>
input::-ms-clear {
  display: none !important;
}

input,
select,
textarea,
button {
  vertical-align: middle;
  outline: none;
  border: 0;
}

input {
  border-radius: 0;
  box-shadow: none;
}

input[type="button"],
input[type="submit"],
input[type="reset"],
button {
  appearance: none;
  -webkit-appearance: none;
}

textarea {
  appearance: none;
  -webkit-appearance: none;
  overflow-y: auto;
  overflow-x: hidden;
  resize: none;
}

.login {
  width: 100%;
  height: 100%;
  background-image: url("https://video.kangyouknowwho.space/login_bg_s.png");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  position: relative;

  img.login_gif {
    position: absolute;
    right: 0%;
    bottom: 3%;
  }

  .login_box {
    position: absolute;
    top: 50%;
    left: 15%;
    transform: translateY(-50%);
    // background-color: rgba(10, 84, 168, 0.8);
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    .login_content {
      width: 600px;
      height: 380px;
      padding: 5vh 5vw;
      position: relative;
      &::before {
        content: '';
        width: calc(100% + 10px);
        height: calc(100% + 50px);
        background-image: url('https://video.kangyouknowwho.space/dialog_bg_2_2.png');
        background-size: 100% 100%;
        background-position: left center;
        background-repeat: no-repeat;
        position: absolute;
        left: -5px;
        top: -45px;
      }
      .login_logo {
        position: absolute;
        top: -35px;
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
        .login_title {
          font-size: 30px;
          color: #fff;
        }

        .login_sub_title {
          font-size: 12px;
          color: #ffffffba;
          margin-top: -3px;
        }
      }

      form {
        position: absolute;
        width: 70%;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
        justify-content: space-around;

        input {
          height: 45px;
          border-bottom: 1px solid #ccc;
          background-color: #dbf6ff;
          color: #666;
          margin: 2vh 0;
          font-size: 20px;
          border-radius: 1vh;
          text-indent: 1em;
        }

        input[type="submit"] {
          text-align: center;
          text-indent: 0;
          background-color: #24b4d9;
          color: #fff;
          line-height: 45px;
          border-bottom: none;
          margin-top: 2vh;
          cursor: pointer;
        }
      }
    }
  }

  .login_success_tip {
    background-color: rgba(0, 0, 0, 0.8);
    color: #fff;
    width: 20vw;
    height: 15vh;
    line-height: 15vh;
    font-size: 20px;
    text-align: center;
    border-radius: 15px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
  }

  .login_footer {
    position: fixed;
    bottom: 5vh;
    left: 6%;
    font-size: 20px;
    color: #fff;

    a {
      text-decoration: none;
      color: #65e3ff;
    }
  }
}

</style>
