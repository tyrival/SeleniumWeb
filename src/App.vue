<template>
  <el-container>
    <el-menu
      :default-active="getRouterPath"
      :router="router"
      class="el-menu-demo"
      mode="horizontal"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b">
      <div class="logo"></div>
      <div class="title">Selenium Manager</div>
      <div class="space"></div>
      <el-menu-item index="task">任务管理</el-menu-item>
      <el-menu-item index="log">测试日志</el-menu-item>
      <el-menu-item index="source">系统设置</el-menu-item>
      <a href="/readme.html" target="_blank" class="menu-link float-right">系统说明</a>
    </el-menu>
    <el-main class="main-container">
      <keep-alive>
        <router-view/>
      </keep-alive>
    </el-main>
  </el-container>
</template>

<script>
  export default {
    name: 'App',
    data() {
      return {
        router: true,
      };
    },
    computed: {
      getRouterPath() {
        return this.$route.path.replace("/", "")
      }
    }
  }
</script>
