import Vue from 'vue'
import Router from 'vue-router'
import Task from '@/views/Task'
import Log from '@/views/Log'
import Source from '@/views/Source'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Task',
      component: Task
    },
    {
      path: '/task',
      name: 'Task',
      component: Task
    },
    {
      path: '/log',
      name: 'Log',
      component: Log
    },
    {
      path: '/source',
      name: 'Source',
      component: Source
    }
  ]
})
