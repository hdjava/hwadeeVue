<template>
  <div class="app-wrapper" :class="{hideSidebar:!sidebar.opened}">
    <left class="el-left"></left>
    <div class="el-main">
      <right></right>
      <el-main></el-main>
    </div>
  </div>
</template>
<!-- 整个页面的布局-->
<script>
import { Right,Left,ElMain } from '@/views/layout/components'

export default {
  name: 'layout',
  components: {
    Left,
    Right,
    ElMain
  },
  computed: {
    sidebar() {
      return this.$store.state.app.sidebar
    }
  }
}
</script>

<!-- 整个页面的布局 css-->
<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/styles/el-scroll.scss";
.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100%;
  width: 100%;
}
</style>
