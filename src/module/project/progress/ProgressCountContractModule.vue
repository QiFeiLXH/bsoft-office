<template>
  <pro-con-count-product-module :projectInfo="projectInfo"></pro-con-count-product-module>
</template>

<script>
import ProConCountProductModule from "./contractModule/ProConCountProductModule";
export default {
  name: "ProgressCountContractModule",
  components:{
    ProConCountProductModule
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