<template>
  <a-card
    :bordered="false"
    :bodyStyle="{
      height:cardHeight+'px',
      padding: '0px 10px'
    }">
    <a-tabs :activeKey="activeKey" @change="onChange">
      <a-tab-pane key="maintain" tab="进度管理员维护" >
        <region-manager-module-view ref="region"></region-manager-module-view>
      </a-tab-pane>
      <a-tab-pane key="look" tab="进度管理员查看">
        <dept-manager-module-view ref="dept"></dept-manager-module-view>
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>

<script>
import RegionManagerModuleView from './component/RegionManagerModuleView'
import DeptManagerModuleView from './component/DeptManagerModuleView'

export default {
  name: 'RegionManager',
  components: {
    RegionManagerModuleView,
    DeptManagerModuleView
  },
  data () {
    return {
      activeKey: 'maintain',
      cardHeight: 0
    }
  },
  methods: {
    onChange (key) {
      this.activeKey = key
      if (key === 'maintain') {
        this.$nextTick(() => {
          this.$refs.region.loadPage()
        })
      }
      if (key === 'look') {
        this.$nextTick(() => {
          this.$refs.dept.loadPage()
        })
      }
    }
  },
  created () {
    this.cardHeight = window.innerHeight - 85
  }
}
</script>

<style scoped>
</style>
