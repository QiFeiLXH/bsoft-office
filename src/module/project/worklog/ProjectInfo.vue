<template>
  <div v-if="projectInfo" :style=widthStyle>
    <detail-list :col="2">
      <detail-list-item term="合同金额" v-if="projectInfo.projectManager === userId">{{ projectInfo.contractAmount }}</detail-list-item>
      <detail-list-item term="签订日期">{{ projectInfo.signDate.substring(0,10) }}</detail-list-item>
      <detail-list-item term="工程区域">{{ projectInfo.areaText }}</detail-list-item>
      <detail-list-item term="项目经理">{{ projectInfo.projectManagerText }}</detail-list-item>
    </detail-list>
    <a-divider style="margin-top: 0;margin-bottom: 12px;"/>
    <detail-list :col="2">
      <detail-list-item term="客户名称">{{ projectInfo.customerName }}</detail-list-item>
      <detail-list-item term="客户分类">{{ projectInfo.classification }}</detail-list-item>
      <detail-list-item term="客户等级">{{ projectInfo.grade }}</detail-list-item>
      <detail-list-item term="所属区域">{{ projectInfo.region }}</detail-list-item>
    </detail-list>
  </div>
</template>

<script>
import DetailList from '@/components/tools/DetailList'
const DetailListItem = DetailList.Item

export default {
  name: 'ProjectInfo',
  components: {
    DetailList,
    DetailListItem
  },
  props: {
    projectInfo: {
      type: Object,
      default: null,
      required: true
    },
    userId: {
      type: String,
      default: '',
      required: true
    },
    widthStyle: {
      type: String,
      default: "width: 500px",
      required: false
    }
  }
}
</script>

<style lang="less" scoped>
  /deep/ .term{
    color: grey;
  }
</style>
