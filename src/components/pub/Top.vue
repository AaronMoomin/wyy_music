<template>
  <div class="top">
    <el-row type="flex" class="row-bg" justify="space-between">
      <el-col :span="12">
        <div class="main_left">
          <!--  logo  -->
          <img src="../../assets/images/logo.png" class="logo" alt="">
          <!--    搜索框    -->
          <div class="search_box">
            <i class="iconfont icon-search"></i>
            <input type="text" class="search" placeholder="一点点喜欢">
          </div>
        </div>
      </el-col>
      <!--   个人信息 信息   -->
      <el-col :span="12">
        <div class="main_right">
          
          <transition
              enter-active-class="animate__animated animate__bounceIn"
              leave-active-class="animate__animated animate__fadeOutLeft">
            <div class="tx_box" v-if="isLogin" :key="0">
            <img :src="txImg" alt="">
            <span>{{ username }}</span>
            <span @click="Logout">退出登录</span>
          </div>
           <div class="tx_box" v-else @click="primgLogin" :key="1">
            <span>点击登录</span>
          </div>
          </transition>
          <div class="mail">
            <i class="iconfont icon-icon-mail"></i>
          </div>
        </div>
      </el-col>
    </el-row>
    <!--  ?二维码登录  -->
    <el-dialog title="扫码登录" class="login_box"
               width="30%"
               :visible.sync="dialogLoginVisible"
               :modal-append-to-body="false">
      <div class="info">
        <img :src="qrimg" alt="">
        <p class="tip" style="color: #9f9f9f">{{ waitInfo }}</p>
        <p>
          使用<span>网易云app</span> <br>扫码登录
        </p>
        <span class="to_next"
              @click="changeLogin">使用其他方式登录 ></span>
      </div>
    </el-dialog>
    <!--  ?手机  -->
    <el-dialog
        width="400px"
        :visible.sync="dialogLoginFormVisible"
        :modal-append-to-body="false">
      <div class="login-form">
        <img src="../../assets/images/loginBac.png" alt="">
        <el-form :model="form">
          <el-input class="login_form_input" placeholder="请输入手机号/邮箱" v-model="form.number"></el-input>
          <el-input type="password" class="login_form_input" placeholder="密码" v-model="form.password"  @keydown.enter.native="login"></el-input>
          <el-button class="login" @click="login">登录</el-button>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import md5 from 'js-md5'

export default {
  name: "Top",
  data() {
    return {
      uid: '',
      //?判断是否登录
      isLogin: false,
      //?登录对话框显示
      dialogLoginVisible: false,
      dialogLoginFormVisible: false,
      //?二维码
      qrimg: '',
      unikey: '',
      //?扫码提示信息
      waitInfo: '',
      //?头像
      txImg: '',
      //?用户名
      username: '',
      //?登录表单
      form: {
        number: '18318199503',
        password: '141948253'
        // number: '13434299732',
        // password: '147359862'
      },
      timer: ''
    }
  },
  methods: {
    setUid(uid) {
      this.$bus.$emit('uid', uid)
      this.$store.commit('getUid', {uid})
    },
    //?二维码登录
    primgLogin() {
      this.dialogLoginVisible = true
      this.axios.get(`/login/qr/key`, {
        params: {
          timestamp: Date.parse(new Date())
        }
      }).then(response => {
        console.log(1, response);
        this.unikey = response.data.data.unikey
        this.axios.get(`/login/qr/create`, {
          params: {
            key: this.unikey,
            qrimg: true
          }
        }).then(response2 => {
          console.log(2, response2)
          this.qrimg = response2.data.data.qrimg

          this.timer = setInterval(() => {
            if (!this.dialogLoginVisible) {
              clearInterval(this.timer)
            }
            this.axios.get(`/login/qr/check`, {
              params: {
                key: this.unikey,
              }
            }).then(response3 => {
              console.log(response3.data.message, response3);
              this.waitInfo = response3.data.message
              if (response3.data.code == 803) {
                clearInterval(this.timer)
                console.log('success')
                this.qrimg = response3.data.avatarUrl
                this.dialogLoginVisible = false
                this.axios.get(`/login/refresh`).then(response4 => {
                  console.log(response4)
                }).catch(err => console.log(err))
              }
            }).catch(err => console.log(err))
          }, 2000)
        }).catch(err => console.log(err))
      }).catch(err => console.log(err))
    },
    changeLogin() {
      this.dialogLoginVisible = false
      this.dialogLoginFormVisible = true
      clearInterval(this.timer)
    },
    //?获取用户信息
    getUserDetail() {
      this.axios.get(`/user/detail`, {
        params: {
          uid: this.uid
        }
      }).then(response => {
        console.log(response)
        this.dialogLoginFormVisible = false
        this.isLogin = true
        this.txImg = response.data.profile.avatarUrl
        this.username = response.data.profile.nickname
      }).catch(err => {
        console.log(err)
      })
    },
    //?手机号登录
    loginByPhone(md5_password) {
      this.axios.post(`/login/cellphone`, {
        phone: this.form.number,
        md5_password,
        timestamp: Date.parse(new Date())
      }).then(response => {
        console.log(response)
        
        // 谷歌94版本以后不支持
        // this.$cookies.set('MUSIC_U', response.data.cookie, 7)
        localStorage.setItem('MUSIC_U', response.data.cookie)
        this.uid = response.data.account.id
        this.setUid(this.uid)
        if (response.data.code == 200) {
          this.$message({
            message: '登录成功',
            type: 'success'
          });
        } else {
          this.$message.error(response.data.message);
          return
        }
        this.getUserDetail()
      }).catch(err => {
        console.error(err)
        this.$message.error('登录失败');
      })
    },
    //?邮箱登录
    loginByEmail(md5_password) {
      this.axios.post(`/login`, {
        email: this.form.number,
        md5_password,
        timestamp: Date.parse(new Date())
      }).then(response => {
        console.log(response)
        this.uid = response.data.account.id
        this.setUid(this.uid)
        if (response.data.code == 200) {
          this.$message({
            message: '登录成功',
            type: 'success'
          });
        } else {
          this.$message.error(response.data.message);
          return
        }
        this.getUserDetail()
      }).catch(err => {
        console.error(err)
        this.$message.error('登录失败');
      })
    },
    //?登录
    async login() {
      let md5_password = md5(this.form.password)
      if (this.form.number.indexOf('@') == -1) {
        await this.loginByPhone(md5_password)
      } else {
        await this.loginByEmail(md5_password)
      }
      // this.getUserSubCount()
      this.$emit('isLogin')
    },
    //?获取用户信息 , 歌单，收藏，mv, dj 数量
    getUserSubCount() {
      this.axios.get(`/user/subcount`).then(response => {
        console.log(response)
      }).catch(err => {
        console.error(err)
      })
    },
    //?获取用户歌单
    getUserPlaylist() {
      this.axios.get(`/user/playlist`, {
        params: {
          uid: this.uid
        }
      }).then(response => {
        console.log(response)
        this.$bus.$emit('playList', response.data.playlist)
      }).catch(err => {
        console.error(err)
      })
    },
    //?获取账号信息
    getAccount() {
      if (localStorage.getItem('MUSIC_U')) {
        this.$message('已登录')
        this.axios.get(`/user/account`, {
          params: {
            cookie: localStorage.getItem('MUSIC_U')
          }
        }).then(response => {
          console.log(response)
          this.uid = response.data.account.id
          this.setUid(this.uid)
          this.getUserDetail()
          this.getUserPlaylist()
        }).catch(err => {
          console.error(err)
        })
      } else {
        this.$message.error('还未登录')
      }
    },
    // 退出登录
    Logout(){
      this.axios.get(`/logout`).then(response => {
        if (response.data.code == 200){
          this.$message('退出成功')
          this.$cookie.delete('MUSIC_U')
          this.isLogin = false
          this.uid = ''
          this.setUid(this.uid)
          this.getAccount()
          this.$router.push('/discoverMusic/recommend')
        }
      }).catch(err => {
        console.log(err)
      })
    }
  },
  mounted() {
    this.getAccount()
  }
}
</script>

<style scoped lang="less">
.top {
  padding: 10px;
  background: #f5f5f5;
  height: 40px;
  position: sticky;
  top: 0;

  .main_left {
    display: flex;
    justify-content: space-around;

    img {
      width: 116px;
      height: 40px;
    }

    .search_box {
      display: flex;
      height: 20px;
      line-height: 20px;
      margin: 5px auto;
      padding: 5px;
      background: #eaeaea;
      border-radius: 20px;

      .iconfont {
        margin-right: 5px;
      }

      .search {
        font-size: 13px;
      }
    }
  }

  .main_right {
    display: flex;
    float: right;
    line-height: 40px;

    .tx_box {
      display: flex;

      img {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        margin: 5px 10px 5px auto;
      }

      span {
        margin: 0 10px 0 0;
      }
    }
  }

  //  ?登录框
  .login_box {
    display: flex;
    flex-direction: column;
    text-align: center;

    img {
      width: 150px;
      height: 150px;
    }

    .info {
      font-size: 16px;

      .tip {
        margin: 20px 0;
      }

      span {
        color: #1b7cc4;
        font-size: 16px;
        font-weight: bold;
      }

      .to_next {
        margin: 5px;
        font-size: 12px;
        color: #9f9f9f
      }

      .to_next:hover {
        cursor: pointer;
      }
    }
  }

  .login-form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;

    .login_form_input {
      margin-bottom: 4px;
      width: 300px;
    }

    .login {
      width: 300px;
      letter-spacing: 1em;
      font-weight: bold;
      background: #ea4848;
      color: #fff;
    }
  }
}
</style>