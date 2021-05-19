<template>
  <a-tabs default-active-key="1">
    <a-tab-pane key="1" tab="进度查看-按项目">
      <progress-count-project-module :projectInfo="projectInfo"></progress-count-project-module>
    </a-tab-pane>
    <a-tab-pane key="2" tab="进度查看-按合同">
      <progress-count-contract-module :projectInfo="projectInfo"></progress-count-contract-module>
    </a-tab-pane>
  </a-tabs>
</template>

<script>
import ProgressCountContractModule from "./ProgressCountContractModule";
import ProgressCountProjectModule from "./ProgressCountProjectModule";
export default {
  name: "ProgressCountModule",
  components:{
    ProgressCountContractModule,
    ProgressCountProjectModule
  },
  props:{
    projectInfo:{
      type: Object
    }
  },
}
</script>

<style scoped>

</style>