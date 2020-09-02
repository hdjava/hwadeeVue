<template>
  <scroll-bar>
    <el-menu mode="vertical" unique-opened :default-active="$route.path" :collapse="isCollapse"
             background-color="#304156" text-color="#fff" active-text-color="#F5222D">
      <nav-left :routes="permission_routers"></nav-left>
    </el-menu>
  </scroll-bar>
</template>
<script>
  import {mapGetters} from 'vuex'
  import NavLeft from './NavLeft'
  import ScrollBar from '@/components/ScrollBar'

  export default {
    components: {NavLeft, ScrollBar},    // 一些固定的界面设置，例如布局左中右
    computed: {
      ...mapGetters([
        'permission_routers',
        'sidebar'
      ]),
      isCollapse() {
        return !this.sidebar.opened
      }
    }
  }
</script>
