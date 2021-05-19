<template>
  <a-card :bordered="false" :bodyStyle="{height:'2000px',padding: '10px 10px'}">

    <template>
      <div style="margin-bottom:10px">
        <memory-dept-select style="width:200px"
                            :storageKey="'ProjectProgressCountView_deptUseful_01'"
                            ref="dept" :disabled="false"
                            :dept-type="queryParam.deptInput"
                            placeholder="按部门查询" @change="handleDeptChange">
        </memory-dept-select>
        <a-divider type="vertical" />
        <span>进度月份:</span>
        <a-month-picker style="width: 110px;margin-left:10px"
                        placeholder="进度月份"
                        v-model="queryParam.progressMonthStr"
                        @change="doChangeMonth"
                       />
        <a-divider type="vertical" />
        <a-button type="primary" icon="search" style="margin-left:10px" @click="doClickQuery">查询上报情况</a-button>
      </div>
    </template>

    <a-table :columns="reportCountCol"
             :dataSource="data"
             :loading="loading"
             size="small"
             :rowKey="(record,index)=> record.id"
             :showPagination = 'false'
             :pagination = 'false'
             :rowClassName="setRowClassNameProject"
             :customRow="rowClickProject"
             v-watermark
             :scroll="{ x: false,y: listScrollHeight }"
             :bodyStyle="{ height: listScrollHeight + 'px' }">

      <template slot="rowIndex" slot-scope="text, record, index">
        {{ (page.pageNo-1) * page.pageSize + index + 1}}
      </template>
    </a-table>
    <footer-tool-bar>
      <a-pagination
        :total="page.totalCount"
        :pageSize.sync="page.pageSize"
        v-model="page.pageNo"
        @change="pageChange"
        :showTotal="total => `共 ${total} 条`"
        style="margin-top: 10px"/>
    </footer-tool-bar>

  </a-card>
</template>
<script>
  import FooterToolBar from '@/components/FooterToolbar'
  import {PersonSelect } from '@/module'
  import MemoryDeptSelect from "@/components/MemorySelect/MemoryDeptSelect";
  import {getreportcountview } from '@/api/projectReportCountView'
  import moment from 'moment'
  import store from "@/store";



  const reportCountCol = [
    {
      title: '序号',
      width:'10%',
      dataIndex:'rowIndex',
      align: 'left',
      scopedSlots: { customRender: 'rowIndex' },
    },
    {
      title: '回款业绩一级部门',
      width:'15%',
      dataIndex: 'collDeptParentName',
      scopedSlots: { customRender: 'collDeptParentName' },
    },
    {
      title: '需上报项目总数',
      width:'10%',
      dataIndex: 'collDeptParentNeedMaintain',
      scopedSlots: { customRender: 'collDeptParentNeedMaintain' },
    },
    {
      title: '已上报',
      width:'10%',
      dataIndex: 'collDeptParentMaintain',
      scopedSlots: { customRender: 'collDeptParentMaintain' },
    },
    {
      title: '未上报',
      width:'10%',
      dataIndex: 'collDeptParentNotMaintain',
      scopedSlots: { customRender: 'collDeptParentNotMaintain' },
    },
    {
      title: '回款业绩部门',
      width:'15%',
      dataIndex: 'collectionDeptName',
      scopedSlots: { customRender: 'collectionDeptName' },
    },
    {
      title: '需上报项目总数',
      dataIndex: 'collectionDeptNeedMaintain',
      width:'10%',
      scopedSlots: { customRender: 'collectionDeptNeedMaintain' },
    },
    {
      title: '已上报',
      dataIndex: 'collectionDeptMaintain',
      width:'10%',
      scopedSlots: { customRender: 'collectionDeptMaintain' },
    },
    {
      title: '未上报',
      dataIndex: 'collectionDeptNotMaintain',
      width:'10%',
      scopedSlots: { customRender: 'collectionDeptNotMaintain' },
    },
  ];


  export default {
    components:{
      FooterToolBar,
      PersonSelect,
      MemoryDeptSelect,

    },
    name: "ProjectReportCountView",
    data() {
      return {
        data:[],
        reportCountCol,
        selectRecordId:0,//抽屉查找修改ID
        listScrollHeight:window.innerHeight - 10,
        queryParam: {deptInput:null,progressMonthStr:null,pageNo:1,pageSize:25,},
        page: { pageNo: 1, pageSize: 25, totalCount: 0 },
        formLayout: 'horizontal',
        findFlag:false,
        loading: false,



      };
    },

    computed: {
      rowSelection() {
        return {
          onChange: (selectedRowKeys, selectedRows) => {
            console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
          },


          getCheckboxProps: record => ({
            props: {
              disabled: record.name === 'Disabled User', // Column configuration not to be checked
              name: record.name,
            },
          }),
        };
      },

    },

    mounted(){
      this.queryParam.progressMonthStr = moment(new Date(), 'YYYY-MM')
      this.doQuery();
      this.listScrollHeight = window.innerHeight - 258
    },


    methods: {
      rowClickProject(record) {
        return {
          on: {
            click: ()=> {
              this.selectRecordId =  record.id
            },
            dblclick: () => {
              this.selectRecordId = record.id
            }
          }
        }
      },
      setRowClassNameProject(record) {
        if (this.selectRecordId == record.id) {
          return 'clickRowStyle'
        }
      },
      doQuery() {
        getreportcountview(this.queryParam).then(res => {
          if(res.code===200){
            this.page.totalCount = res.body.totalCount;
            this.data = res.body.items;
          }
        })
      },
      handleDeptChange(value) {
        this.queryParam.deptInput=value
        this.doQuery()
      },

      pageChange(current) {
        this.queryParam.pageNo = current;
        this.queryParam.pageSize = this.page.pageSize;
        this.queryParam.companyType = this.value;
        getreportcountview(this.queryParam)
          .then(res => {
            if (res.code === 200) {
              this.data = res.body.items;
              this.page.totalCount = res.body.totalCount;
            }
          })
      },

      onfindProjectChange(){
        this.queryParam.pageNo=1
        getreportcountview(this.queryParam).then(res => {
          if(res.code===200){
            this.page.totalCount = res.body.totalCount;
            this.data = res.body.items;
            this.page.pageNo=1
          }
        })
      },

      // find(record, index){
      //   this.readOnly = false
      //   this.editingKey=''
      //   this.queryProductParam.moduleName=null
      //   this.queryProductParam.projectId=record.projectId
      //   this.queryProductParam.maintain=[0]
      //   this.queryProductParam.pageNo=1
      //   this.pagination.current=1
      //   if(this.queryProductParam.projectId!=null){
      //     getreportcountview(this.queryProductParam).then(res => {
      //       if (res.code === 200) {
      //         this.pagination.total = res.body.totalCount;
      //         this.productData = Object.assign([],res.body.items)
      //         this.oldProductData = this.productData.map(item => ({ ...item }))
      //         this.drawerVisible = true
      //       }
      //     })
      //   }
      // },

      doClickQuery(){
        this.queryParam.pageNo=1
        this.page.pageNo=1
        this.doQuery()
      },
      doChangeMonth(){
        this.queryParam.progressMonthStr=moment(this.queryParam.progressMonthStr).format("YYYY-MM") + '-01'
        this.doQuery()
      },

      loadListProductData(){
        this.onfindProductChange();
      },


    }
  };

</script>
<style>
  components-table-demo-size h4 {
    margin-bottom: 16px;
  }
  .editable-row-operations a {
    margin-right: 8px;
  }
  .ant-select-disabled .ant-select-selection {
    background: #ffffff;
    cursor: not-allowed;
    color: #000000;
  }
  .ant-checkbox-disabled + span {
    color: #000000;
    cursor: not-allowed;
  }
  .ant-radio-disabled + span {
    color: #000000;
    cursor: not-allowed;
  }

  .ant-input {
    color: #000000;
  }
  .ant-select{
    color: #000000;
  }
  .ant-radio-group{
    margin-top: 18px;
  }


  /deep/ .clickRowStyle {
    background-color: #E8F7FF;
    color: #1890FF
  }
  .greyStyle {
    color: #808080
  }

  .ant-table-placeholder{
    display:none;
  }
</style>
