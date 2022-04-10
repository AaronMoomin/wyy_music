import Vue from 'vue';
import VueRouter from 'vue-router';

import DiscoverMusic from "@/components/content/DiscoverMusic";
import Blog from "@/components/content/Blog";
import Mv from "@/components/content/Mv";
import Follow from "@/components/content/Follow";
import Live from "@/components/content/Live";
import PersonalFM from "@/components/content/PersonalFM";

import LocalDownload from "@/components/content/myMusic/LocalDownload";
import RecentPlay from "@/components/content/myMusic/RecentPlay";
import MyMusicCloud from "@/components/content/myMusic/MyMusicCloud";
import MyBlog from "@/components/content/myMusic/MyBlog";
import MyCollection from "@/components/content/myMusic/MyCollection";
import MySong from "@/components/content/myMusic/MySong";
import Lyric from "@/components/content/myMusic/Lyric";

import Recommend from "@/components/content/discoverMusic/Recommend";
import Customization from "@/components/content/discoverMusic/Customization";
import SongList from "@/components/content/discoverMusic/SongList";
import RankingList from "@/components/content/discoverMusic/RankingList";
import Singer from "@/components/content/discoverMusic/Singer";
import NewMusic from "@/components/content/discoverMusic/NewMusic";

Vue.use(VueRouter)

const routes = [
    { path: '/', redirect: '/discoverMusic/recommend', component: Recommend },
    //?发现音乐
    {
        path: '/discoverMusic',
        component: DiscoverMusic,
        children: [{
                path: 'recommend',
                component: Recommend,
            },
            {
                path: 'customization',
                component: Customization,
            },
            {
                path: 'songList',
                component: SongList,
            },
            {
                path: 'rankingList',
                component: RankingList,
            },
            {
                path: 'singer',
                component: Singer,
            },
            {
                path: 'newMusic',
                component: NewMusic,
            }
        ]
    },
    //?博客
    { path: '/blog', component: Blog },
    //?mv
    { path: '/mv', component: Mv },
    //?关注
    { path: '/follow', component: Follow },
    //?直播
    { path: '/live', component: Live },
    //?私人FM
    { path: '/personalFM', component: PersonalFM },
    //?我的音乐
    //?本地下载
    { path: '/my/localDownload', component: LocalDownload },
    //?最近播放
    { path: '/my/recentPlay', component: RecentPlay },
    //?我的音乐云盘
    { path: '/my/myMusicCloud', component: MyMusicCloud },
    //?我的博客
    { path: '/my/myBlog', component: MyBlog },
    //?我的收藏
    { path: '/my/myCollection', component: MyCollection },
    { path: '/my/lyric', component: Lyric },
    //?创建的歌单
    { path: '/my/mySong/:id', component: MySong },
]

//获取原型对象上的push函数
const originalPush = VueRouter.prototype.push
    //修改原型对象中的push方法
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err)
}
const router = new VueRouter({
    routes
});

//抛出这个这个实例对象方便外部读取以及访问
export default router