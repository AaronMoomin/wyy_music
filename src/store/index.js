import Vue from 'vue'
import Vuex from 'vuex'
import { mutations } from './mutations'

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        uid: 0,//歌单id
        lyric:[],//歌词
    },
    mutations,
})

export default store