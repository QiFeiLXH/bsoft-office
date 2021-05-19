<template>
    <a-card
      :bordered="false"
      :bodyStyle="{
        height:cardHeight+'px',
        padding: '0px 10px'
    }">
      <a-row style="margin-top: 5px;margin-bottom: 5px">
        <memory-dept-select style="width:200px"
                            :storageKey="'ProjectProgressCountView_deptUseful_01'"
                            ref="dept" :disabled="false"
                            :dept-type="queryParams.deptNo"
                            placeholder="按部门查询" @change="handleDeptChange">
        </memory-dept-select>
        <a-divider type="vertical"/>
        <a-input-search style="width: 200px"
                        :pressEnter="doQuery"
                        @search="doQuery"
                        :allowClear="true"
                        v-model="queryParams.inputContent"
                        placeholder="合同号或项目名称"></a-input-search>
        <a-divider type="vertical"/>
        <person-select style="width: 200px" :allowClear= "allowClear" :placeholder="placeholder" @change="rogressManagerChange"></person-select>
        <a-divider type="vertical"/>
        <a-checkbox-group @change="onChange" v-model="reportcheck">
          <a-checkbox value="1">
            已上报
          </a-checkbox>
          <a-checkbox value="0">
            未上报
          </a-checkbox>
        </a-checkbox-group>
        <a-divider type="vertical"/>
        <a-button type="primary" @click="doQuery">查询</a-button>
      </a-row>
      <a-table
        v-watermark
        :body-style="{height: listScrollHeight + 'px'}"
        :columns="columns"
        :data-source="tableData"
        size="small"
        :rowKey="(record) => record.projectId"
        :customRow="onClickRow"
        :rowClassName="setCurrentRow"
        :pagination="false"
        :scroll="{ x: false, y: listScrollHeight }">
        <template slot="contractNo" slot-scope="text, record, index">
          <a-tooltip placement="topLeft">
            <template slot="title">
              {{ text }}
            </template>
            {{ text }}
          </a-tooltip>
        </template>
        <template slot="colldeptParentName" slot-scope="text, record, index">
          <a-tooltip placement="topLeft">
            <template slot="title">
              {{ text }}
            </template>
            {{ text }}
          </a-tooltip>
        </template>
        <template slot="businessTypeName" slot-scope="text, record, index">
          <a-tooltip placement="topLeft">
            <template slot="title">
              {{ text }}
            </template>
            {{ text }}
          </a-tooltip>
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
        <template slot="projectManagerName" slot-scope="text, record, index">
          <a-tooltip placement="topLeft">
            <template slot="title">
              {{ text }}
            </template>
            {{ text }}
          </a-tooltip>
        </template>
        <template slot="contractProgress" slot-scope="text, record, index">
          <span v-if="text != null">
            {{(text * 100).toFixed(2) }} %
          </span>
            <span v-else>
          </span>
        </template>
        <template slot="progressMonth" slot-scope="text, record, index">
          <span v-if="text != null">
            {{ text.substring(0,7) }}
          </span>
          <span v-else>
          </span>
        </template>
        <template slot="progress" slot-scope="text, record, index">
          <span v-if="text != null">
            {{(text * 100).toFixed(2) }} %
          </span>
          <span v-else-if="record.progressMonth != undefined && text == null">
            0.00 %
          </span>
          <span v-else></span>
        </template>
        <template slot="action" slot-scope="text, record, index">
          <a type="link" v-if="record.progressNum > 0" @click="doLook(record)">查看</a>
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
        title="进度查看"
        @close="closeReport"
        :destroyOnClose="true"
        :visible="showReport">
        <progress-count-module ref="progressCountModule" :projectInfo="projectInfo"></progress-count-module>
        <div
          :style="{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          borderTop: '0px solid #e8e8e8',
          padding: '10px 16px',
          textAlign: 'right',
          left: 0,
          background: '#fff',
          borderRadius: '0 0 4px 4px',
        }"
        >
          <a-button @click="doCancleReport">
            退出
          </a-button>
        </div>
      </a-drawer>
    </a-card>
</template>

<script>
import ProgressCountModule from "@/module/project/progress/ProgressCountModule";
import ProgressCountProjectModule from "@/module/project/progress/ProgressCountProjectModule";
import MemoryDeptSelect from "@/components/MemorySelect/MemoryDeptSelect";
import PersonSelect from "@/module/person/PersonSelect/PersonSelect";
import { progresslist } from '@/api/progress/progressCount'
import FooterToolBar from '@/components/FooterToolbar'
export default {
  name: "ProjectProgressCountView",
  components:{
    FooterToolBar,
    PersonSelect,
    MemoryDeptSelect,
    ProgressCountProjectModule,
    ProgressCountModule
  },
  data(){
    return{
      allowClear:true,
      placeholder:'进度经理',
      showReport:false,
      projectInfo:null,
      columns:[
        {
          title: '合同号',
          dataIndex: 'contractNo',
          width: '11%',
          align:'left',
          ellipsis:"true",
          scopedSlots: { customRender: 'contractNo' },
        },
        {
          title: '合同进度',
          dataIndex: 'contractProgress',
          width: '9%',
          scopedSlots: { customRender: 'contractProgress' },
          align:'center'
        },
        {
          title: '回款一级部门',
          dataIndex: 'colldeptParentName',
          width: '8%',
          scopedSlots: { customRender: 'colldeptParentName' },
          ellipsis:"true"
        },
        {
          title: '回款部门',
          dataIndex: 'collectionDeptName',
          width: '8%',
          scopedSlots: { customRender: 'collectionDeptName' },
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
          align:'center',
          ellipsis:"true",
          scopedSlots: { customRender: 'businessTypeName' },
        },
        {
          title: '项目经理',
          dataIndex: 'projectManagerName',
          width: '9%',
          ellipsis:"true",
          scopedSlots: { customRender: 'projectManagerName' },
          align:'center'
        },
        {
          title: '最新进度',
          dataIndex: 'progress',
          width: '10%',
          scopedSlots: { customRender: 'progress' },
          align:'center'
        },
        {
          title: '最新进度月份',
          dataIndex: 'progressMonth',
          width: '12%',
          scopedSlots: { customRender: 'progressMonth' },
          align:'center'
        },
        {
          title: '上报日期',
          dataIndex: 'reportDate',
          width: '12%',
          align:'center'
        },
        {
          scopedSlots: { customRender: 'action' },
          width: '7%',
          align:'center'
        },
      ],
      tableData:[],
      cardHeight:0,
      listScrollHeight:0,
      selectedRow:null,
      pagination: { current: 1, pageSize: 25, totalCount: 1 },
      queryParams:{
        pageSize:25,
        pageNo:1,
        inputContent: '',
        progressManager:null,
        deptNo:null,
        reportFlag:1
      },
      reportcheck:['1']
    }
  },
  methods:{
    handleDeptChange(value) {
      this.queryParams.deptNo = value
      this.doQuery()
    },
    rogressManagerChange(personId, personData){
      this.queryParams.progressManager = personId
      this.doQuery()
    },
    doCancleReport(){
      this.closeReport()
    },
    closeReport(){
      this.showReport = false
    },
    findList(){
      progresslist(this.queryParams).then(res=>{
        if (res.code ===200){
          this.tableData = []
          this.tableData = this.tableData.concat(res.body.items)
          this.pagination.totalCount = res.body.totalCount
          this.pagination.pageSize = this.queryParams.pageSize
          this.pagination.current = this.queryParams.pageNo
        }
      }).catch(err=>{
        console.log(err)
      })
    },
    onChange(checkedValues){
      /** 是否上报  0否，1是，2全部,3 全不选中*/
      this.reportcheck = checkedValues
      if (this.reportcheck.length == 2){
        this.queryParams.reportFlag = 2
      }else if(this.reportcheck.length == 0){
        this.queryParams.reportFlag = 3
      }else if (this.reportcheck.length == 1){
        var i = this.reportcheck[0]
        if (i == 1 + ''){
          this.queryParams.reportFlag = 1
        }else{
          this.queryParams.reportFlag = 0
        }
      }
      this.doQuery()
    },
    onClickRow (record, index) {
      return {
        on: {
          click: () => {
            this.selectedRow = record.projectId
          },
          dblclick: () => {
            if (record.progressNum >0){
              this.doLook(record)
            }
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
    doLook(record){
      this.showReport = true
      this.projectInfo = record
    },
    handleCurrentPageChange(pageNo){
      this.queryParams.pageNo = pageNo
      this.findList()
    },
    doQuery(){
      this.queryParams.pageNo = 1
      this.pagination.current = 1
      this.findList()
    }
  },
  mounted() {
    this.cardHeight = window.innerHeight - 85
    this.listScrollHeight = window.innerHeight - 245
    this.doQuery()
  }
}
</script>

<style scoped lang="less">
/deep/ .ant-drawer-body {
    padding: 0px 12px;
    font-size: 14px;
    line-height: 1.5;
    word-wrap: break-word;
  }
/deep/  .ant-drawer-wrapper-body {
  height: 100%;
  overflow: hidden;
}
</style>