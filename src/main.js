import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/styles/viewport.less'
import App from './App'
import router from './router'
import store from './store'

Vue.config.productionTip = false

Vue.use(Vuex)
Vue.use(ElementUI)
Vue.prototype.$ajax = axios
Vue.prototype.$ajax.defaults.baseURL = 'http://192.168.2.112:9080';

new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>'
})
