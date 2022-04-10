<template>
  <div>
    <el-carousel :interval="4000" type="card" height="280px" style="width: 79%;">
        <el-carousel-item v-for="item in imgList" :key="item" style="border-radius: 5px; margin-top:5px" >
            <img style="width:100%;height:100%" :src="item" alt="">
        </el-carousel-item>
    </el-carousel>

    <ul class="recommenu" @click="toSongList">推荐歌单></ul>

    <el-row>

  </el-row>
  </div>
</template>

<script>
    export default {
        name: "Recommend",
        data(){
          return {
            toList : '3',
            Lists:[],
            imgList: [],
          }          
        },
        methods:{
          toSongList(){
            this.$bus.$emit('toList',this.toList)
            this.$router.push('SongList');
          }
        },
        mounted(){
          // 获取轮播图图片
          this.axios.get(`/banner`).then(response => {
            // console.log(response.data.banners[0].imageUrl);
            this.Lists = response.data.banners
            // console.log("Lists",this.Lists);
            this.Lists.forEach(item => {
                this.imgList.push(item.imageUrl)
            })
          }).catch(err => {
            console.log(err)
          })
        }
    }
</script>

<style>
  .recommenu{
    font-size: 20px;
    font-weight: bold;
    padding: 20px;
  }
  .el-carousel__item h3 {
    color: #475669;
    font-size: 14px;
    opacity: 0.75;
    line-height: 200px;
    margin: 0;
  }
  
  .el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
  }
  
  .el-carousel__item:nth-child(2n+1) {
    background-color: #d3dce6;
  }

  .bottom {
    margin-top: 13px;
    line-height: 12px;
  }
  .image {
    width: 100%;
    display: block;
  }

  .clearfix:before,
  .clearfix:after {
      display: table;
      content: "";
  }
  
  .clearfix:after {
      clear: both
  }

</style>