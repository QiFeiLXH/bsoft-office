<template>
  <a-card :bordered="false"
          :bodyStyle="{
            padding: '0px 10px'
          }"
  >
    <a-layout :style="{ background: 'white',}">
      <a-layout-sider width="180px" :style="{ background: 'white' }">
        <progress-count-project-list-module :contractNo="projectInfo.contractNo" :progressMonth="projectInfo.progressMonth" @selectProject="doSelectProject"></progress-count-project-list-module>
      </a-layout-sider>
      <a-layout :style="{ background: 'white' }">
        <a-layout-header :style="{ background: 'white' }">
          <progress-count-base-module :projectInfo="selectProjectInfo"></progress-count-base-module>
        </a-layout-header>
        <a-layout-content>Content</a-layout-content>
      </a-layout>
    </a-layout>
  </a-card>
</template>

<script>
import ProgressCountProjectListModule from "./ProgressCountProjectListModule";
import ProgressCountBaseModule from "./ProgressCountBaseModule";
  /** 进度查看-按项目   按合同模块 */
export default {
  name: "ProCountModuleModule",
  components:{
    ProgressCountBaseModule,
    ProgressCountProjectListModule
  },
  data(){
    return{
      progressMonth:null,
      contractNo:null,
      selectProjectInfo:null
    }
  },
  props:{
    projectInfo:{
      type: Object
    }
  },
  mounted() {
  },
  methods:{
    doSelectProject(record){
      this.selectProjectInfo = record
      // this.projectInfo = record
    }
  }
}
</script>

<style scoped>

</style>