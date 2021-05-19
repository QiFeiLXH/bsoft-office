<template>
  <a-card :bordered="false"
          :bodyStyle="{
            padding: '0px 0px',
          }"
  >
    <a-layout :style="{ background: 'white',}">
      <a-layout-sider width="180px" :style="{ background: 'white' }">
        <progress-count-project-list-module :contractNo="projectInfo.contractNo" :progressMonth="projectInfo.progressMonth" @selectProject="doSelectProject"></progress-count-project-list-module>
      </a-layout-sider>
      <a-layout :style="{ background: 'white','overflow-y': 'hidden' }">
        <a-layout-header :style="{ background: 'white' }">
          <progress-count-base-module :projectInfo="selectProjectInfo"></progress-count-base-module>
        </a-layout-header>
        <a-layout-content :style="{'margin-top': '10px','overflow-y': 'auto','height':scrollheight}">
          <a-row v-if="reportTypes.length <= 0" style="margin-top: 20px;color: red;font-weight: bold;text-align: center">
            {{warnText}}
          </a-row>
          <a-card v-else v-for="(item,index) in reportTypes" :title="item.name + '进度'" size="small" :bordered="false" :key="item.id">
            <span v-if="reportData.length > 0 && reportData[index][0].reportTypeProgress != undefined" slot="extra" style="font-weight: bold">小计：{{ (reportData[index][0].reportTypeProgress * 100).toFixed(2) }} %</span>
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
              <template slot="businessownerName" slot-scope="text, record, index">
                <a-tooltip placement="topLeft">
                  <template slot="title">
                    {{ text }}
                  </template>
                  {{ text }}
                </a-tooltip>
              </template>
              <template slot="moduleName" slot-scope="text, record, index">
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
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-card>
</template>

<script>
import ProgressCountProjectListModule from "./ProgressCountProjectListModule";
import ProgressCountBaseModule from "./ProgressCountBaseModule";
import { gettypeandheader,getmonthreport } from '@/api/progress/progressCount'
import moment from "moment";
export default {
  /** 进度查看-按项目   按公司产品模块 */
  name: "ProCountProductModule",
  components:{
    ProgressCountBaseModule,
    ProgressCountProjectListModule
  },
  data(){
    return{
      warnText:'该项目进度未上报!',
      scrollheight:0,
      isLoading:false,
      progressMonth:null,
      contractNo:null,
      selectProjectInfo:null,
      reportTypes:[],
      reportTypeIds:[],
      columns:[],
      reportData:[],
      progressDate:null,
    }
  },
  props:{
    projectInfo:{
      type: Object
    }
  },
  mounted() {
    this.scrollheight = window.innerHeight - 120
  },
  methods:{
    doSelectProject(record,progressDate){
      if (record.progressMonth == undefined){
        // this.$message.warn("该月份还未上报进度,无法查看!")
        this.reportTypes = []
        this.reportTypeIds = []
        this.columns = []
        this.reportData = []
        this.selectProjectInfo = record
        this.projectInfo = record
        this.progressDate = progressDate
        this.warnText = '该项目'+moment(this.progressDate).format("MM")+'月份进度未上报!'
      }else{
        this.selectProjectInfo = record
        this.projectInfo = record
        this.progressDate = progressDate
        this.gettypeandheader()
      }
    },
    gettypeandheader(){
      const params = {
        'projectId' : this.selectProjectInfo.projectId,
        'month':moment(this.progressDate).format("YYYY-MM") + '-01'
      }
      gettypeandheader(params).then(res=>{
        if (res.code === 200){
          this.reportTypes = []
          this.reportTypeIds = []
          this.reportTypes = this.reportTypes.concat(res.body)
          this.reportTypes.forEach(item=>{
            this.reportTypeIds.push(item.reportType)
          })
          if (this.reportTypes.length > 0){
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
        'projectId':this.selectProjectInfo.projectId,
        'month' : moment(this.progressDate).format("YYYY-MM") + '-01',
        'reportType':this.reportTypeIds,
        'inputContent':''
      }
      getmonthreport(params).then(res=>{
        console.log(res)
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
            title: '最早上线日期',
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
/deep/ .ant-layout-header {
          height: 64px;
          padding: 0 10px;
          line-height: 64px;
          background: #001529;
        }
</style>