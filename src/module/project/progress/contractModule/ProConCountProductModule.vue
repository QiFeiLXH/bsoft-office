<template>
  <a-card :bordered="false"
          :bodyStyle="{
          padding: '0px 0px'
          }"
          v-watermark
  >
    <a-row style="margin-bottom: 5px;line-height: 33px;">
      <a-col :span="6">
        进度月份：
        <a-month-picker placeholder="进度月份" v-model="progressDate" @change="doChange"/>
      </a-col>
      <a-col :span="6">
        合同号：
        <span>{{ projectInfo != null ? projectInfo.contractNo : null}}</span>
      </a-col>
      <a-col :span="6">
        合同名称：
        <span>{{ projectInfo != null ? projectInfo.contractName : null}}</span>
      </a-col>
      <a-col :span="6">
        合同进度：
        <span v-if="projectInfo != null && projectInfo.contractProgress != undefined">{{(projectInfo.contractProgress* 100).toFixed(2) }} %</span>
        <span v-else>0.00 %</span>
      </a-col>
    </a-row>
    <a-card :bordered="false"
            :bodyStyle="{
                padding: '0px 0px',
                overflow: 'auto',
                height: scrollheight + 'px'
          }">
      <a-card v-for="(item,index) in reportTypes" :title="item.name + '进度'" size="small" :bordered="false" :key="item.id">
        <span v-if="reportData.length > 0 && reportData[index][0].reportTypeProgress != undefined" slot="extra" style="font-weight: bold">{{ (reportData[index][0].reportTypeProgress * 100).toFixed(2) }} %</span>
        <span v-else-if="reportData.length > 0" slot="extra" style="font-weight: bold">小计： 0.00 %</span>
        <a-table
          v-watermark
          :loading="isLoading"
          v-if="item.type === 1"
          :pagination="false"
          size="small"
          :columns="columns[index]"
          :data-source="reportData[index]"
          :rowKey="(record) => record.id">
          <template slot="rowIndex" slot-scope="text, record, index">
                <span>
                  {{ index + 1 }}
                </span>
          </template>
          <template v-for="(item2,headerIndex) in item.headers" :slot="'NODE_' + item2.id"  slot-scope="text, record, index">
            <span>{{ record.progressNums == undefined ? null : record.progressNums.split(',')[headerIndex] < 0 ? null : record.progressNums.split(',')[headerIndex] }}</span>
          </template>
          <template slot="moduleName" slot-scope="text, record, index">
            <a-tooltip placement="topLeft">
              <template slot="title">
                {{ text }}
              </template>
              {{ text }}
            </a-tooltip>
          </template>
          <template slot="businessownerName" slot-scope="text, record, index">
            <a-tooltip placement="topLeft">
              <template slot="title">
                {{ text }}
              </template>
              {{ text }}
            </a-tooltip>
          </template>
          <template slot="productName" slot-scope="text, record, index">
            <a-tooltip placement="topLeft">
              <template slot="title">
                {{ text }}
              </template>
              {{ text }}
            </a-tooltip>
          </template>
          <template slot="constructionTypeName" slot-scope="text, record, index">
            <a-tooltip placement="topLeft">
              <template slot="title">
                {{ text }}
              </template>
              {{ text }}
            </a-tooltip>
          </template>
          <template slot="productProgress" slot-scope="text, record, index">
            <span v-if="text == null || text == undefined"></span>
            <span v-else> {{(text * 100).toFixed(2) }} %</span>
          </template>
        </a-table>
        <a-table
          v-watermark
          v-else
          :loading="isLoading"
          :pagination="false"
          size="small"
          :columns="columns[index]"
          :data-source="reportData[index]"
          :rowKey="(record) => record.id">
          <template slot="rowIndex" slot-scope="text, record, index">
                <span>
                  {{ index + 1 }}
                </span>
          </template>
          <template slot="productProgress" slot-scope="text, record, index">
            <span v-if="text == null || text == undefined"></span>
            <span v-else> {{(text * 100).toFixed(2) }} %</span>
          </template>
          <template slot="moduleName" slot-scope="text, record, index">
            <a-tooltip placement="topLeft">
              <template slot="title">
                {{ text }}
              </template>
              {{ text }}
            </a-tooltip>
          </template>
          <template slot="businessownerName" slot-scope="text, record, index">
            <a-tooltip placement="topLeft">
              <template slot="title">
                {{ text }}
              </template>
              {{ text }}
            </a-tooltip>
          </template>
          <template slot="productName" slot-scope="text, record, index">
            <a-tooltip placement="topLeft">
              <template slot="title">
                {{ text }}
              </template>
              {{ text }}
            </a-tooltip>
          </template>
          <template slot="constructionTypeName" slot-scope="text, record, index">
            <a-tooltip placement="topLeft">
              <template slot="title">
                {{ text }}
              </template>
              {{ text }}
            </a-tooltip>
          </template>
        </a-table>
      </a-card>
    </a-card>
  </a-card>
</template>

<script>
  import { getcontypeandheader,getconmonthreport } from  '@/api/progress/progressCount'
  import moment from "moment";
  export default {
  name: "ProConCountProductModule",
  props:{
    projectInfo:{
      type: Object
    }
  },
  data(){
    return{
      isLoading:false,
      reportTypes:[],
      reportTypeIds:[],
      columns:[],
      reportData:[],
      progressDate:null,
      scrollheight:0
    }
  },
  mounted() {
    this.progressDate = moment(this.projectInfo.progressMonth).format("YYYY-MM-01")
    this.gettypeandheader()
    this.scrollheight = window.innerHeight - 190
  },
  methods:{
    doChange(value){
      this.progressDate = moment(value).format("YYYY-MM-01")
      this.gettypeandheader()
    },
    gettypeandheader(){
      const params = {
        'contractNo' : this.projectInfo.contractNo,
        'month':moment(this.progressDate).format("YYYY-MM") + '-01'
      }
      getcontypeandheader(params).then(res=>{
        if (res.code === 200){
          this.reportTypes = []
          this.reportTypeIds = []
          this.reportTypes = this.reportTypes.concat(res.body)
          this.reportTypes.forEach(item=>{
            this.reportTypeIds.push(item.reportType)
          })
          if(this.reportTypes.length > 0){
            this.getColumns()
            this.getMonthReport()
          }
        }
      }).catch(err=>{
        console.log(err)
      })
    },
    getMonthReport(){
      this.isLoading = true
      const params = {
        'contractNo':this.projectInfo.contractNo,
        'month' : moment(this.progressDate).format("YYYY-MM-01"),
        'reportType':this.reportTypeIds,
        'inputContent':''
      }
      getconmonthreport(params).then(res=>{
        this.isLoading = false
        if(res.code === 200 && res.body.length > 0){
          this.reportData = []
          this.reportData = this.reportData.concat(res.body)
        }
      }).catch(err=>{
        this.isLoading = false
        console.log(err)
      })
    },
    getColumns(){
      this.columns = []
      for (var i=0;i<this.reportTypes.length;i++){
        var item = this.reportTypes[i]
        if(item.type === 1){
          var columns = [
            {
              key: 'rowIndex',
              width: 50,
              dataIndex: 'rowIndex',
              title: '序号',
              scopedSlots: { customRender: 'rowIndex' },
              align: 'center',
              // fixed: 'left'
            },
            {
              key: 'moduleName',
              width: 150,
              dataIndex: 'moduleName',
              title: '合同模块名称',
              align: 'left',
              // fixed: 'left',
              scopedSlots: { customRender: 'moduleName' },
              // ellipsis:"true"
            },
            {
              key: 'productName',
              width: 200,
              dataIndex: 'productName',
              title: '产品模块名称',
              align: 'left',
              // fixed: 'left',
              scopedSlots: { customRender: 'productName' },
              // ellipsis:"true"
            },
            {
              key: 'businessownerName',
              width: 200,
              dataIndex: 'businessownerName',
              title: '业务归属',
              align: 'left',
              // fixed: 'left',
              scopedSlots: { customRender: 'businessownerName' },
              // ellipsis:"true"
            },
            {
              key: 'constructionTypeName',
              width: 200,
              dataIndex: 'constructionTypeName',
              title: '承建类型',
              align: 'left',
              // fixed: 'left',
              scopedSlots: { customRender: 'constructionTypeName' },
              // ellipsis:"true"
            },
            {
              key: 'orgNum',
              width: 100,
              dataIndex: 'orgNum',
              title: '目标机构数',
              align: 'center',
              // fixed: 'left'
            }
          ]
          item.headers.forEach(item => {
            // if (item.planName === '上线'){
            //   this.onLineIndex = i
            // }
            // i++
            columns.push({
              key: 'NODE_' + item.id,
              width: 100,
              align: 'center',
              dataIndex: 'NODE_' + item.id,
              title: item.planName,
              scopedSlots: { customRender: 'NODE_' + item.id },
            })
          })
          columns.push({
            key: 'firstOnLineDate',
            width: 130,
            dataIndex: 'firstOnLineDate',
            title: '预测首次上线日期',
            align: 'center',
            scopedSlots: { customRender: 'firstOnLineDate' },
          })
          columns.push({
            key: 'productProgress',
            width: 100,
            align: 'center',
            dataIndex: 'productProgress',
            scopedSlots: { customRender: 'productProgress' },
            title: '模块进度'
          })
          columns.push({
            key: 'remarks',
            width: 200,
            align: 'left',
            dataIndex: 'remarks',
            title: '备注'
          })
          this.columns.push(columns)
        }else{
          var columns = [
            {
              key: 'rowIndex',
              // width: 50,
              dataIndex: 'rowIndex',
              title: '序号',
              scopedSlots: { customRender: 'rowIndex' },
              align: 'center',
              // fixed: 'left'
            },
            {
              key: 'moduleName',
              // width: 150,
              dataIndex: 'moduleName',
              title: '合同模块名称',
              align: 'left',
              // fixed: 'left',
              scopedSlots: { customRender: 'moduleName' },
              ellipsis:"true"
            },
            {
              key: 'productName',
              // width: 200,
              dataIndex: 'productName',
              title: '产品模块名称',
              align: 'left',
              // fixed: 'left',
              scopedSlots: { customRender: 'productName' },
              ellipsis:"true"
            },
            {
              key: 'businessownerName',
              width: 200,
              dataIndex: 'businessownerName',
              title: '业务归属',
              align: 'left',
              // fixed: 'left',
              scopedSlots: { customRender: 'businessownerName' },
              // ellipsis:"true"
            },
            {
              key: 'constructionTypeName',
              width: 200,
              dataIndex: 'constructionTypeName',
              title: '承建类型',
              align: 'left',
              // fixed: 'left',
              scopedSlots: { customRender: 'constructionTypeName' },
              // ellipsis:"true"
            },
            {
              key: 'checkDate',
              // width: 200,
              dataIndex: 'checkDate',
              title: '终验日期',
              align: 'center'
            },
            {
              key: 'termOfService',
              // width: 200,
              dataIndex: 'termOfService',
              title: '服务期限(月)',
              align: 'center'
            },
            {
              key: 'startDate',
              // width: 200,
              dataIndex: 'startDate',
              title: '开始日期',
              align: 'center'
            },
            {
              key: 'endDate',
              // width: 200,
              dataIndex: 'endDate',
              title: '结束日期',
              align: 'center'
            },
            {
              key: 'productProgress',
              // width: 200,
              dataIndex: 'productProgress',
              align: 'center',
              scopedSlots: { customRender: 'productProgress' },
              title: '模块进度'
            }
          ]
          this.columns.push(columns)
        }
      }
    }
  }
}
</script>

<style scoped lang="less">
  /deep/ .ant-card-small > .ant-card-body {
    padding: 0px;
  }
  /deep/ .ant-card-small > .ant-card-head > .ant-card-head-wrapper > .ant-card-head-title {
    padding: 8px 0;
    font-weight: bold;
  }
</style>