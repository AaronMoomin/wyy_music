<template>
  <el-container>
    <div class="song_container" ref="context">
      <el-backtop target=".song_container" :bottom="200">
        <div
            style="{
                height: 100%;
                width: 100%;
                background-color: var(--active-color);
                box-shadow: 0 0 6px rgba(0,0,0, .12);
                border-radius: 50%;
                text-align: center;
                line-height: 40px;
                color: #ffffff;
            }"
        >
          up
        </div>
      </el-backtop>
      <div class="top">
        <div class="top_left">
          <img :src="coverImgUrl" alt="">
        </div>
        <div class="top_right">
          <div class="right_top">
            <div class="up">
              <span>歌单</span>
              <h2>{{ name }}</h2>
            </div>
            <div class="down">
              <img :src="creator.avatarUrl" alt="">
              <p class="name">{{ creator.nickname }}</p>
              <p class="time">{{ createTime }}创建</p>
            </div>
          </div>
          <div class="right_mid">
            <el-button class="do_it" type="danger"
                       icon="iconfont icon-xiayishou"
                       @click="playAll">
              播放全部
            </el-button>
          </div>
          <div class="right_down">
            <p>歌曲: {{ trackCount }}</p>
            <p>播放: {{ playCount }}</p>
          </div>
        </div>
      </div>
      <div class="content">
        <el-menu default-active="1"
                 class="el-menu-demo" mode="horizontal"
                 @select="handleSelect">
          <el-menu-item index="1">歌曲列表</el-menu-item>
          <el-menu-item index="2">评论</el-menu-item>
          <el-menu-item index="3">收藏者</el-menu-item>
        </el-menu>
        <el-table
            :data="songData"
            @row-dblclick="rowDblclick"
            :cell-style="cellStyle"
            stripe>
          <el-table-column
              type="index"
              width="50">
          </el-table-column>
          <el-table-column
              width="60"
              label="操作">
            <template slot-scope="scope">
              <i class="iconfont icon-xiai-copy like"
                 @click="handleLike(scope.$index, scope.row)"></i>
            </template>
          </el-table-column>
          <el-table-column
              width="300"
              prop="name"
              label="标题">
          </el-table-column>
          <el-table-column
              width="200"
              prop="ar[0][name]"
              label="歌手">
          </el-table-column>
          <el-table-column
              width="250"
              prop="al[name]"
              label="专辑">
          </el-table-column>
          <el-table-column
              prop="dt"
              label="时间">
          </el-table-column>
        </el-table>
      </div>
    </div>
  </el-container>
</template>

<script>
import moment from "moment";
import {Loading} from 'element-ui';

export default {
  name: "MySong",
  data() {
    return {
      name: '',
      coverImgUrl: '',
      creator: {
        avatarUrl: '',
        nickname: ''
      },
      createTime: '',
      trackCount: 0,
      playCount: 0,
      songData: [],//? 存储当前歌单所有歌曲
      songDataAll: [],//? 存储播放全部歌曲
      currentPage: 0, //? 当前页
      pageSize: 20,
      totalPage: 0, //? 总页数
      isLoading: false, //! 数据节流处理
      songLists: [],//? 用来保存需要播放的可取
      songIndex: 0,
      songInfo: {},
      fullscreenLoading: false,
      isChange: false,//判断有无切换歌单
    }
  },
  methods: {
    handleSelect(key) {
      console.log(key)
    },
    handleLike(index, row) {
      console.log(index, row);
    },
    //? 传输需要播放的音乐
    sendSongLists() {
      this.$bus.$emit("songLists", this.songLists)
    },
    // 记录当前播放歌曲的index
    sendSongIndex() {
      this.$bus.$emit("songIndex", this.songIndex)
    },
    songListsPush(data) {
      this.songLists.push({
        name: data.name,
        singer: data.ar[0].name,
        id: data.id,
        al: data.al,
        album: data.al.name,
        time: data.dt
      })
    },
    async rowDblclick(row) {
      if (row.success) {
        if (this.songLists.length != 0) {
          try {
            this.songLists.forEach(item => {
              if (item.id == row.id) {
                throw new Error(this.songLists.indexOf(item))
              }
            })
          } catch (e) {
            console.log(e.message)
            this.songIndex = e.message * 1
            this.sendSongIndex()
            return
          }
        } else {
          this.playAll()
        }
      } else {
        this.$alert('因版权方要求,该资源暂时无法播放,我们正在争取歌曲回归', '当前歌曲暂无音源', {
          confirmButtonText: '知道了',
          confirmButtonClass: 'confirm',
          center: true,
          callback: () => {
            this.$message({
              type: 'info',
              message: `已取消`
            });
          }
        });
      }
    },
    getUrl(id) {
      return new Promise((resolve, reject) => {
        this.axios.get(`/song/url`, {
          params: {
            id
          }
        }).then(response => {
          resolve(response.data.data[0])
        }).catch(err => {
          reject(err)
        })
      })
    },
    // 判断歌曲是否有版权
    checkSong(id) {
      return new Promise((resolve) => {
        this.axios.get(`/check/music`, {
          params: {
            id
          }
        }).then(response => {
          resolve(response.data.success)
        }).catch((err) => {
          resolve(err.response.data.success)
        })
      })
    },
    cellStyle(row) {
      if (row.column.label === '标题') {
        if (!row.row.success) {
          return 'color: #c3c3d3;'
        }
        return 'cursor:text;'
      }
    },
    //?获取歌单全部歌曲
    getAllPlaylist() {
      this.isLoading = true
      this.$notify.success({
        title: 'Info',
        message: '正在努力请求数据',
        showClose: false,
        duration: 0
      });
      this.axios.get(`/playlist/track/all`, {
        params: {
          id: this.$route.params.id,
          limit: this.pageSize,
          offset: this.currentPage,
          cookie: localStorage.getItem('MUSIC_U')
        }
      }).then(response => {
        this.$notify.closeAll()
        this.isLoading = false
        // console.log(response.data.songs);
        let newArr = [...this.songData, ...response.data.songs]
        let hash = {}; //去重
        let arr = newArr.reduce((preVal, curVal) => {
          hash[curVal.id]		//id就是数组中的id字段
              ? ""
              : (hash[curVal.id] = true && preVal.push(curVal));
          return preVal;
        }, []);
        // 获取新增
        let newAddArr = []
        for (let i = this.songData.length; i < arr.length; i++) {
          newAddArr.push(arr[i])
        }
        this.songData = arr
        for (let item of newAddArr) {
          item.durationTime = item.dt
          item.dt = moment(item.dt).format('mm:ss')
          this.checkSong(item.id).then((res) => {
            res ? this.$set(item, 'success', true) : this.$set(item, 'success', false)
          })
        }
      }).catch(err => {
        this.$notify.closeAll()
        this.isLoading = false
        console.log(err);
      })
    },
    getDetails() {
      this.axios.get(`/playlist/detail`, {
        params: {
          id: this.$route.params.id,
          cookie: localStorage.getItem('MUSIC_U')
        }
      }).then(response => {
        console.log('getDetails', response.data);
        let {playlist} = response.data
        this.name = playlist.name;
        this.coverImgUrl = playlist.coverImgUrl
        this.creator.nickname = playlist.creator.nickname
        this.creator.avatarUrl = playlist.creator.avatarUrl
        this.createTime = moment(playlist.createTime).format("YYYY-MM-DD")
        this.trackCount = playlist.trackCount
        this.playCount = playlist.playCount
        this.totalPage = playlist.tracks.length
        this.songDataAll = playlist.tracks
      }).catch(err => {
        console.log(err);
      })
    },
    playAll() {
      if (this.songLists.length != 0) {
        for (let item1 of this.songDataAll) {
          for (const item2 of this.songLists) {
            if (item1.id == item2.id) {
              this.$message('现在放的已经是这个歌单啦~呆逼')
              return
            }
          }
        }
      }
      this.$confirm('此操作将会覆盖目前的播放列表', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        let loadingInstance = Loading.service({
          lock: true,
          text: '',
          spinner: ''
        });
        //覆盖全部
        this.songLists = []
        this.songIndex = 0
        for (let item of this.songDataAll) {
          item.durationTime = item.dt
          item.dt = moment(item.dt).format('mm:ss')
          await this.checkSong(item.id).then((res) => {
            res ? this.$set(item, 'success', true) : this.$set(item, 'success', false)
          })
        }
        for (let s of this.songDataAll) {
          if (s.success) {
            this.songListsPush(s)
          } else {
            continue
          }
        }
        this.sendSongLists()
        this.sendSongIndex()
        this.isChange = false
        this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
          loadingInstance.close();
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });
    },
  },
  mounted() {
    console.log(this.$route.params.id);
    if (this.$store.state.routeId != this.$route.params.id) {
      this.isChange = true
      this.$store.commit("setRouteId", this.$route.params.id)
    } else {
      this.isChange = false
    }
    this.getDetails()
    this.getAllPlaylist()
    let dom = this.$refs.context
    this.$nextTick(() => {
      dom.addEventListener('scroll', () => {
        // 发请求中不执行
        if (this.isLoading) return
        if (dom.clientHeight + dom.scrollTop >= dom.scrollHeight - 250) {
          // 超过总页数不在发请求
          if (Math.ceil(this.trackCount / this.pageSize) < this.currentPage) return;
          this.currentPage++
          this.getAllPlaylist()
        }
      })
    })
  },
}
</script>

<style scoped lang="less">
.is-active {
  color: var(--active-color) !important;
  border-bottom: 2px solid var(--active-color) !important;
}

.song_container {
  padding: 20px;
  width: 100%;
  height: calc(100vh - 180px);
  overflow-y: scroll;

  .top {
    display: flex;

    .top_left {
      margin-right: 15px;

      img {
        width: 190px;
        height: 190px;
        border-radius: 10px;
      }
    }

    .top_right {
      display: flex;
      flex-direction: column;

      .right_top {
        margin-bottom: 10px;

        .up {
          display: flex;
          margin-bottom: 10px;

          span {
            width: 40px;
            height: 20px;
            text-align: center;
            border-radius: 5px;
            font-size: 13px;
            color: var(--active-color);
            border: 1px solid var(--active-color);
            margin-right: 10px;
            margin-top: 6px;
          }
        }

        .down {
          display: flex;
          height: 30px;
          line-height: 25px;

          img {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            margin-right: 10px;
          }

          .name {
            color: #767db6;
            margin-right: 10px;
          }

          .time {
            font-size: 13px;
          }
        }
      }
    }

    .right_mid {
      .do_it {
        border-radius: 20px;
        background: var(--active-color);
        border: 1px solid var(--active-color);
      }
    }

    .right_down {
      display: flex;
      margin-top: 10px;

      p {
        font-size: 13px;
      }

      & > p:nth-child(1) {
        margin-right: 10px;
      }
    }
  }

  .content {
    width: 100%;

    .like {
      color: var(--active-color);
    }
  }
}
</style>