<template>
  <a-card
    :bordered="false"
    :bodyStyle="{
      height:cardHeight+'px',
      padding: '0px 10px'
    }">
    <a-row>
      <a-input-search
        :pressEnter="doRefresh"
        :allowClear="true"
        v-model="params.inputContent"
        placeholder="合同号或项目名称"
        style="width: 250px;margin-left:0px;margin-bottom: 5px;margin-top: 5px"
        @search="doRefresh" />
      <a-divider type="vertical"/>
      <a-button type="primary" @click="doRefresh">查询</a-button>
    </a-row>
    <a-table
      v-watermark
      :pagination="false"
      :loading="isLoading"
      size="small"
      :columns="columns"
      :dataSource="tableData"
      :bodyStyle="{ height: recordListScrollHeight + 'px' }"
      :rowKey="(record) => record.projectId"
      :customRow="onClickRow"
      :rowClassName="setCurrentRow"
      :scroll="{ x: false, y: listScrollHeight }">
      <template slot="index" slot-scope="text, record, index">
        <span>
          {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
        </span>
      </template>
      <template slot="collectionDeptName" slot-scope="text, record, index">
        <a-tooltip placement="topLeft">
          <template slot="title">
            {{ text }}
          </template>
          {{ text }}
        </a-tooltip>
      </template>
      <template slot="projectName" slot-scope="text, record, index">
        <a-tooltip placement="topLeft">
          <template slot="title">
            {{ text }}
          </template>
          {{ text }}
        </a-tooltip>
      </template>
      <template slot="contractNo" slot-scope="text, record, index">
        <a-tooltip placement="topLeft">
          <template slot="title">
            {{ text }}
          </template>
          {{ text }}
        </a-tooltip>
      </template>
      <template slot="lastProgressMonth" slot-scope="text, record, index">
        <span v-if="text != null">{{ text.substring(0,7) }}</span>
      </template>
      <template slot="actions" slot-scope="text, record, index">
        <a type="link" @click.stop="doReport(record)" style="padding-left: 2px;padding-right: 2px">报进度</a>
        <a-divider type="vertical"/>
        <a type="link" @click.stop="doUpload(record)" style="padding-left: 2px;padding-right: 2px">传文档</a>
      </template>
      <template slot="projectProgress" slot-scope="text, record, index">
        <a-progress v-if="text != null" :percent="Number((text * 100).toFixed(2))" size="small" status="active" />
        <a-progress v-else-if="text == null" :percent="0.00" size="small" status="active" />
        <span v-else>
        </span>
      </template>
    </a-table>
    <footer-tool-bar>
      <a-pagination
        :total="pagination.totalCount"
        :pageSize.sync="pagination.pageSize"
        v-model="pagination.current"
        @change="handleCurrentPageChange"
        :showTotal="total => `共 ${total} 条`"
        style="margin-top: 10px"/>
    </footer-tool-bar>
    <a-drawer
      width="90%"
      :title="drawertitle"
      @close="closeReport"
      :destroyOnClose="true"
      :visible="showReport">
      <report-module ref="reportModule" :projectInfo="projectInfo" @closeParentReport="closeReport" @getNewProjectProgress="getNew"> </report-module>
      <div
        :style="{
          position: 'absolute',
          height: '56px',
          bottom: 0,
          width: '100%',
          borderTop: '0px solid #e8e8e8',
          padding: '0px 16px 8px 16px',
          textAlign: 'left',
          left: 0,
          background: '#fff',
          borderRadius: '0 0 4px 4px',
        }"
      >
        <div style="display: flex;justify-content: space-between;">
          <div>
            <div><span style="color: red;margin-left: 5px;">1.需要批量维护时，请先勾选产品清单！</span></div>
            <div><span style="color: red;margin-left: 5px;">2.次月6号之前可修改上月份进度；6号及6号以后上报当月进度，无法修改上月份进度！</span></div>
          </div>
          <div style="margin-top: 5px;">
            <a-button type="primary" style="margin-right: 10px" @click="doSaveReport">
              保存
            </a-button>
            <a-button @click="doCancleReport">
              退出
            </a-button>
          </div>
        </div>
      </div>
    </a-drawer>

    <file-upload :contract-no="fileUploadContractNo" :project-id="fileUploadProjectId" v-if="fileUploadVisible" :visible="fileUploadVisible" @cancel="fileUploadVisible = false"></file-upload>
  </a-card>
</template>

<script>
  import ReportModule from "@/module/project/progress/ReportModule";
  import FooterToolBar from '@/components/FooterToolbar'
  import { findlist,getprogress } from "@/api/progress/progressReport";
  import fileUpload from "@/views/project/progress/component/FileUpload";
  export default {
  name: "ProgressReportListView",
  components:{
    FooterToolBar,
    ReportModule,
    fileUpload
  },
  data(){
    return{
      drawertitle:'项目进度上报',
      isLoading:false,
      cardHeight: 0,
      listScrollHeight: 0,
      params:{
        pageNo: 1,
        pageSize: 25,
        inputContent: ''
      },
      pagination: { current: 1, pageSize: 25, totalCount: 1 },
      tableData:[],
      columns:[
        {
          title: '序号',
          width: '6%',
          scopedSlots: { customRender: 'index' },
          align:'left'
        },

        {
          title: '回款业绩部门',
          width: '10%',
          dataIndex: 'collectionDeptName',
          scopedSlots: { customRender: 'collectionDeptName' },
          ellipsis:"true"
        },
        {
          title: '合同号',
          dataIndex: 'contractNo',
          width: '12%',
          scopedSlots: { customRender: 'contractNo' },
          ellipsis:"true"
        },
        {
          title: '项目名称',
          dataIndex: 'projectName',
          width: '15%',
          scopedSlots: { customRender: 'projectName' },
          ellipsis:"true"
        },
        {
          title: '业务大类',
          dataIndex: 'businessTypeName',
          width: '9%',
          align:'center'
        },
        {
          title: '项目经理',
          dataIndex: 'projectManagerName',
          width: '10%'
        },
        {
          title: '最新进度',
          dataIndex: 'projectProgress',
          width: '10%',
          scopedSlots: { customRender: 'projectProgress' },
          align:'center'
        },
        {
          title: '最新进度月份',
          dataIndex: 'lastProgressMonth',
          scopedSlots: { customRender: 'lastProgressMonth' },
          width: '13%',
          align:'center'
        },
        {
          title: '操作',
          dataIndex: 'actions',
          width: '15%',
          scopedSlots: { customRender: 'actions' },
          align:'center'
        },
      ],
      selectedRow:null,
      showReport:false,
      projectInfo:null,
      recordListScrollHeight:0,
      fileUploadVisible: false,
      fileUploadContractNo: null,
      fileUploadProjectId: null
    }
  },
  created () {
    this.cardHeight = window.innerHeight - 90
    this.listScrollHeight = window.innerHeight - 247
    this.recordListScrollHeight =  window.innerHeight - 247
  },
  mounted() {
    this.doRefresh()
  },
  methods: {
    getNew(){
      //进度上报完成后显示最新的项目进度
      const params = {
        'projectId':this.selectedRow
      }
      getprogress(params).then(res=>{
        if (res.code === 200){
          let index = this.tableData.map((item) => item.projectId).indexOf(this.selectedRow)
          if(index > -1){
            this.tableData[index] = res.body
            this.drawertitle = "项目进度上报("+res.body.projectName+"     【最新进度:"+ (res.body.projectProgress != undefined ? res.body.projectProgress*100 : 0).toFixed(2) + "%      "+ res.body.lastProgressMonth.substring(0,7)  +"】)"
            this.projectInfo = Object.assign(res.body,{})
          }
        }
      }).catch(err=>{
        console.log(err)
      })
    },
    doSaveReport(){
      this.$refs.reportModule.showModel()
    },
    doCancleReport(){
      this.closeReport()
    },
    closeReport(){
      this.showReport = false
    },
    doReport(record){
      this.selectedRow = record.projectId
      if (record.submited === 0){//上报类型、机构数、承建分工全都已维护的数量
        this.$message.warn("请先维护项目上报类型!")
        return
      }
      if (record.total > record.submited){
        var n = record.total - record.submited
        this.$message.info("还有 "+ n + " 份产品清单的上报类型、承建分工、目标机构数未维护!")
      }
      this.projectInfo = Object.assign(record,{})
      this.showReport = true
      if (record.projectProgress == null || record.projectProgress == undefined){
        this.drawertitle = "项目进度上报("+record.projectName+")"
      }else{
        this.drawertitle = "项目进度上报("+record.projectName+"     【最新进度:"+ (record.projectProgress != undefined ?record.projectProgress*100 : 0).toFixed(2) + "%           "+ record.lastProgressMonth.substring(0,7)  +"】)"
      }
    },
    doUpload(record){
      this.selectedRow = record.projectId
      this.fileUploadVisible = true
      this.fileUploadContractNo = record.contractNo
      this.fileUploadProjectId = record.projectId
    },
    doRefresh(){
      this.params.pageNo = 1
      this.pagination.current = 1
      this.doQuery()
    },
    doQuery(){
      this.isLoading = true
      findlist(this.params).then(res=>{
        if (res.code === 200){
          this.tableData = []
          this.selectedRow = null
          this.tableData = this.tableData.concat(res.body.items)
          this.pagination.totalCount = res.body.totalCount
          this.pagination.pageSize = this.params.pageSize
          this.pagination.current = this.params.pageNo
        }
        this.isLoading = false
      }).catch(err=>{
        this.isLoading = false
        console.log(err)
      })
    },
    handleCurrentPageChange(pageNo){
      this.params.pageNo = pageNo
      this.doQuery()
    },
    onClickRow (record, index) {
      return {
        on: {
          click: () => {
            this.selectedRow = record.projectId
          },
          dblclick: () => {
            this.selectedRow = record.projectId
            this.doReport(record)
          }
        }
      }
    },
    setCurrentRow (record, index) {
      var styleClassName = ''
      if (record.projectId === this.selectedRow) {
        styleClassName = 'clickRowStyle hoverRowStyle'
      }
      return styleClassName
    },
  }
}
</script>

<style scoped lang="less">
/deep/  .ant-drawer-body {
          padding: 0px;
          font-size: 14px;
          line-height: 1.5;
          word-wrap: break-word;
        }
/deep/ .ant-drawer-wrapper-body {
          height: 100%;
          overflow: hidden;
        }
</style>