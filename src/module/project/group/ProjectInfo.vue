<template>
  <div v-if="projectInfo">
    <detail-list :col="2">
      <div>
        <div class="term">项目名称</div>
        <div class="content" style="text-overflow:ellipsis;">
          <span v-if="projectInfo.contractName && projectInfo.contractName.length < 48">{{ projectInfo.contractName }}</span>
          <a-tooltip v-else :title="projectInfo.contractName">
            <div style="width:90%;overflow: hidden;text-overflow: ellipsis;white-space:nowrap;">{{ projectInfo.contractName }}</div>
          </a-tooltip>
        </div>
      </div>
      <detail-list-item term="合同金额">{{ projectInfo.amount }}</detail-list-item>
      <detail-list-item term="签订日期">{{ projectInfo.signDate}}</detail-list-item>
      <detail-list-item term="工程区域">{{ projectInfo.areaText }}</detail-list-item>
      <detail-list-item term="项目经理">{{ projectInfo.managerText }}</detail-list-item>
    </detail-list>
    <a-divider style="margin-top: 0;margin-bottom: 12px;"/>
    <detail-list :col="2">
      <div>
        <div class="term">客户名称</div>
        <div class="content" style="text-overflow:ellipsis;">
          <span v-if="projectInfo.customerName && projectInfo.customerName.length < 50">{{ projectInfo.customerName }}</span>
          <a-tooltip v-else :title="projectInfo.customerName">
            <div style="width:90%;overflow: hidden;text-overflow: ellipsis;white-space:nowrap;">{{ projectInfo.customerName }}</div>
          </a-tooltip>
        </div>
      </div>
      <detail-list-item term="客户分类">{{ projectInfo.customerClass }}</detail-list-item>
      <detail-list-item term="客户等级">{{ projectInfo.customerState }}</detail-list-item>
      <detail-list-item term="所属区域">{{ projectInfo.respectiveRegion }}</detail-list-item>
    </detail-list>
  </div>
</template>

<script>
import DetailList from '@/components/tools/DetailList'
import { Ellipsis } from '@/components'
const DetailListItem = DetailList.Item

export default {
  name: 'ProjectInfo',
  components: {
    DetailList,
    DetailListItem,
    Ellipsis
  },
  props: {
    projectInfo: {
      type: Object,
      default: null,
      required: true
    }
  }
}
</script>

<style lang="less" scoped>
  /deep/ .term{
    color: grey;
  }
</style>
