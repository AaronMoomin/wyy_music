import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './assets/iconfont/iconfont.css'
import less from 'less'
import router from "@/router";
import axios from 'axios'
import VueAxios from "vue-axios";
import {basePath} from "@/http";
import VueCookie from 'vue-cookie'
import store from "@/store";
import animate from 'animate.css'

Vue.use(VueAxios, axios)
Vue.use(VueCookie)
Vue.use(animate)
Vue.config.productionTip = false
axios.defaults.baseURL = basePath


Vue.use(ElementUI);
Vue.use(less)

new Vue({
    beforeCreate() {
        Vue.prototype.$bus = this
    },
    store,
    router,
    render: h => h(App),
}).$mount('#app')
