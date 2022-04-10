<template>
  <div class="main">
    <el-menu
        class="el-menu-vertical-demo"
        default-active="1">
      <el-menu-item index="1">
        <router-link to="/discoverMusic/recommend" slot="title">
          发现音乐
        </router-link>
      </el-menu-item>
      <el-menu-item index="2">
        <router-link to="/blog">
          博客
        </router-link>
      </el-menu-item>
      <el-menu-item index="3">
        <router-link to="/mv">
          视频
        </router-link>
      </el-menu-item>
      <el-menu-item index="4">
        <router-link to="/follow">
          关注
        </router-link>
      </el-menu-item>
      <el-menu-item index="5">
        <router-link to="/live">
          直播
        </router-link>
      </el-menu-item>
      <el-menu-item index="6">
        <router-link to="/personalFM">
          私人FM
        </router-link>
      </el-menu-item>
      <!--? 我的音乐 -->
      <p>我的音乐</p>
      <el-menu-item index="7">
        <router-link to="/my/localDownload">
        <i class="iconfont icon-xiazai"></i>
          本地与下载
        </router-link>
      </el-menu-item>
      <el-menu-item index="8">
        <router-link to="/my/recentPlay">
        <i class="iconfont icon-zuijinbofang"></i>
          最近播放
        </router-link>
      </el-menu-item>
      <el-menu-item index="9">
        <router-link to="/my/myMusicCloud">
        <i class="iconfont icon-yunpan"></i>
          我的音乐云盘
        </router-link>
      </el-menu-item>
      <el-menu-item index="10">
        <router-link to="/my/myBlog">
        <i class="iconfont icon-wodeboke"></i>
          我的博客
        </router-link>
      </el-menu-item>
      <el-menu-item index="11">
        <router-link to="/my/myCollection">
        <i class="iconfont icon-shoucang"></i>
          我的收藏
        </router-link>
      </el-menu-item>
      <p v-if="uid!=''">创建的歌单</p>
      <transition-group
          enter-active-class="animate__animated animate__fadeInLeft"
          leave-active-class="animate__animated animate__fadeOutLeft">
        <el-menu-item v-for="(list,index) in createPlayList" :key="'id_'+index">
          <router-link :to="`/my/mySong/${list.id}`" @click.native="routerR" :title="list.name">
            <i :class="['iconfont',index==0?'icon-xihuan1':'icon-gedan']"></i>
            {{ list.name }}
          </router-link>
        </el-menu-item>
      </transition-group>
      <p v-if="uid!=''">收藏的歌单</p>
      <transition-group
          enter-active-class="animate__animated animate__fadeInLeft"
          leave-active-class="animate__animated animate__fadeOutLeft">
        <el-menu-item v-for="(list,index) in collectPlayList" :key="'id2_'+index">
          <router-link :to="`/my/mySong/${list.id}`" @click.native="routerR" :title="list.name">
            <i class="iconfont icon-gedan"></i>
            {{ list.name }}
          </router-link>
        </el-menu-item>
      </transition-group>
    </el-menu>
  </div>
</template>

<script>
export default {
  name: "NavMenu",
  data() {
    return {
      uid: '',
      playLists: [],
      createPlayList: [],
      collectPlayList: [],
    }
  },
  methods: {
    routerR() {
      this.$emit('routerRefresh')
    },
  },
  computed: {
    getuid(){
      return this.$store.state.uid
    }
  },
  watch: {
    // 监听uid变化
    uid:{
      deep:true,
      immediate:true,
      handler(){
        this.playLists = []
        this.createPlayList = []
        this.collectPlayList = []
      }
    },
    getuid(){
      this.uid = this.$store.state.uid
      console.log(this.uid)
      this.axios.get(`/user/playlist`, {
        params: {
          uid: this.uid
        }
      }).then(response => {
        console.log('@',response.data.playlist);
        this.playLists = response.data.playlist
        this.playLists.forEach(item => {
          if (item.creator.userId == this.uid) {
            this.createPlayList.push(item)
          } else {
            this.collectPlayList.push(item)
          }
        })
      }).catch(err => {
        console.error(err)
      })
    }
  },
  mounted() {
    // this.slotPlayLists()
    // this.$bus.$on('uid',(data)=>{
    //   this.uid = data
    // }
    // )
  }
}
</script>

<style scoped lang="less">
.main {
  min-width: 180px;
  min-height: 550px;

  .router-link-active {
    height: 30px;
    line-height: 35px;
    background: #f6f6f7;
    border-radius: 5px;
    font-weight: bold;
    padding: 5px 7px;
  }

  li {
    height: 40px;
  }

  li:hover {
    background: #f6f6f7;
  }

  a {
    display: block;
    width: 100%;
    height: 100%;
    letter-spacing: .2em;
    overflow: hidden; /*设置超出的部分进行影藏*/
    text-overflow: ellipsis; /*设置超出部分使用省略号*/
    white-space: nowrap; /*设置为单行*/
  }

  p {
    color: #9f9f9f;
    font-size: 13px;
    margin: 10px 15px;
  }
}

</style>