<template>
  <pro-count-product-module :projectInfo="projectInfo"></pro-count-product-module>
<!--  <a-tabs default-active-key="1">-->
<!--    <a-tab-pane key="1" tab="按公司产品模块">-->
<!--      -->
<!--    </a-tab-pane>-->
<!--    <a-tab-pane key="2" tab="按合同模块">-->
<!--      <pro-count-module-module :projectInfo="projectInfo"></pro-count-module-module>-->
<!--    </a-tab-pane>-->
<!--  </a-tabs>-->
</template>

<script>
import ProCountProductModule from "./projecrtModule/ProCountProductModule";
import ProCountModuleModule from "./projecrtModule/ProCountModuleModule";
export default {
  /**  进度查看-按项目 */
  name: "ProgressCountModule",
  components:{
    ProCountProductModule,
    ProCountModuleModule
  },
  data(){
    return{

    }
  },
  props:{
    projectInfo:{
      type: Object
    }
  },
  mounted() {
    // console.log(this.projectInfo)
  }
}
</script>

<style scoped lang="less">
/*/deep/ .ant-tabs-nav .ant-tabs-tab {*/
/*    position: relative;*/
/*    display: inline-block;*/
/*    -webkit-box-sizing: border-box;*/
/*    box-sizing: border-box;*/
/*    height: 100%;*/
/*    margin: 0 32px 0 0;*/
/*    padding: 8px 16px;*/
/*    text-decoration: none;*/
/*    cursor: pointer;*/
/*    -webkit-transition: color 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);*/
/*    transition: color 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);*/
/*  }*/
</style>