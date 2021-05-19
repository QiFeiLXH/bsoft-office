<template>
  <a-card :bordered="false"
          :bodyStyle="{
            padding: '0px 0px'
          }"
          v-watermark
  >
    <a-row style="margin-bottom: 5px;margin-top: 5px;line-height: 33px;">
<!--      <a-col :span="6">-->
<!--        进度月份：-->
<!--        <a-month-picker style="width:120px" placeholder="进度月份" v-model="projectInfo.progressMonth"/>-->
<!--      </a-col>-->
      <a-col :span="6">
        合同号：
        <span>{{ projectInfo != null ? projectInfo.contractNo : null}}</span>
      </a-col>
      <a-col :span="12">
        合同名称：
        <span>{{ projectInfo != null ? projectInfo.contractName : null}}</span>
      </a-col>
      <a-col :span="6">
        合同进度：
        <span v-if="projectInfo != null && projectInfo.contractProgress != undefined">{{(projectInfo.contractProgress* 100).toFixed(2) }} %</span>
        <span v-else>0.00 %</span>
      </a-col>
    </a-row>
    <a-row style="margin-bottom: 5px;margin-top: 5px;line-height: 33px;">
      <a-col :span="10">
        项目名称
        <span>
          {{ projectInfo != null ? projectInfo.projectName : null}}
        </span>
      </a-col>
      <a-col :span="4">
        项目经理：
        <span>
          {{ projectInfo != null ? projectInfo.projectManagerName : null}}
        </span>
      </a-col>
      <a-col :span="4">
        进度经理：
        <span>
          {{ projectInfo != null ? projectInfo.progressManagerName : null}}
        </span>
      </a-col>
      <a-col :span="6">
        项目进度：
        <span v-if="projectInfo != null && projectInfo.progress != undefined">
            {{(projectInfo.progress * 100).toFixed(2) }} %
          </span>
        <span v-else>
          0.00 %
        </span>
      </a-col>
    </a-row>
  </a-card>
</template>

<script>
export default {
  name: "ProgressCountBaseModule",
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
  }
}
</script>

<style scoped>

</style>