<template>
  <a-card :body-style="{height: cardHeight + 'px', padding: '10px'}">
    <a-row style="margin-bottom: 10px">
      <span>签订日期：</span>
      <a-range-picker style="width: 220px" v-model="defaultSignDateRange" :allow-clear="false" @change="onSignDateChange"></a-range-picker>
      <a-divider type="vertical"></a-divider>
      <memory-dept-select v-model="queryParam.dept" @change="onSearch" style="width: 180px"></memory-dept-select>
      <a-divider type="vertical"></a-divider>
      <a-input-search v-model="queryParam.inputContent" @search="onSearch" allow-clear style="width: 180px" placeholder="合同号或项目名称"></a-input-search>
      <a-divider type="vertical"></a-divider>
      <person-select v-model="queryParam.progressManager" :allow-clear="true" @change="onSearch" :placeholder="placeholder" style="width: 230px"></person-select>
      <a-divider type="vertical"></a-divider>
      <a-button @click="onSearch" type="primary" icon="search">查询</a-button>
    </a-row>
    <a-row style="margin-bottom: 10px">
      <a-checkbox-group v-model="queryParam.requireList" :options="options" @change="onSearch"></a-checkbox-group>
    </a-row>
    <a-table :columns="columns"
             :data-source="list"
             :rowKey="record => record.contractNo"
             :customRow="onRowClick"
             :rowClassName="setRowClassName"
             :pagination="page"
             @change="onPageChange"
             :loading="loading"
             :scroll="{ x: 2100, y: listScrollHeight }"
             :body-style="{height: listScrollHeight + 'px'}"
             size="small"
             v-watermark
             bordered>
      <template slot="rowIndex" slot-scope="text, record, index">
        <span>{{(page.current - 1) * page.pageSize + index + 1}}</span>
      </template>
    </a-table>

    <file-upload v-model="fileUploadVisible"
                 v-if="fileUploadVisible"
                 :contract-no="fileUploadContractNo"
                 :project-id="fileUploadProjectId"
                 read-only></file-upload>

    <!--<footer-tool-bar>
      <a-pagination
        :total="page.totalCount"
        :pageSize.sync="page.pageSize"
        v-model="page.pageNo"
        @change="onPageChange"
        :showTotal="total => `共 ${total} 条`"
        style="margin-top: 10px"/>
    </footer-tool-bar>-->
  </a-card>


</template>

<script>
  const options = [
    {value: "wd11",label: "有系统上线确认函"},
    {value: "wd15",label: "有终验报告"},
    {value: "wd4",label: "有项目启动会议纪要"},
  ]
  const columns = [
    {
      title: '序号',
      dataIndex:'rowIndex',
      width: 60,
      align: 'left',
      fixed: 'left',
      scopedSlots: { customRender: 'rowIndex' },
    },
    {
      title: '回款业绩一级区域',
      dataIndex:'parentDeptName',
      width: 80,
      align: 'left',
      fixed: 'left'
    },
    {
      title: '回款业绩部门',
      dataIndex:'deptName',
      width: 80,
      align: 'left',
      fixed: 'left'
    },
    {
      title: '合同号',
      dataIndex:'contractNo',
      width: 120,
      align: 'left',
      fixed: 'left'
    },
    {
      title: '合同名称',
      dataIndex:'contractName',
      width: 240,
      align: 'left',
      fixed: 'left'
    },
    {
      title: "启动",
      align: 'center',
      children: [
        {
          title: '《程序释放申请单》',
          dataIndex:'wd1',
          width: 100,
          align: 'center',
        },
      ],
    },
    {
      title: "计划",
      children: [
        {
          title: '《客户关系情况表》',
          dataIndex:'wd2',
          width: 100,
          align: 'center',
        },
        {
          title: '《项目计划》',
          dataIndex:'wd3',
          width: 100,
          align: 'center',
        },
      ],
    },
    {
      title: "实施",
      children: [
        {
          title: '《项目启动会议纪要》',
          dataIndex:'wd4',
          width: 100,
          align: 'center',
        },
        {
          title: '《调研工作汇报》',
          dataIndex:'wd5',
          width: 100,
          align: 'center',
        },
        {
          title: '《需求分析说明书》',
          dataIndex:'wd6',
          width: 100,
          align: 'center',
        },
        {
          title: '《项目实施方案》',
          dataIndex:'wd7',
          width: 100,
          align: 'center',
        },
        {
          title: '《需求确认表》',
          dataIndex:'wd8',
          width: 100,
          align: 'center',
        },
        {
          title: '《客户培训记录》',
          dataIndex:'wd9',
          width:100,
          align: 'center',
        },
        {
          title: '《系统数据确认表》',
          dataIndex:'wd10',
          width:100,
          align: 'center',
        },
        {
          title: '《系统上线确认函》',
          dataIndex:'wd11',
          width:100,
          align: 'center',
        },
        {
          title: '《项目试点实施计划》',
          dataIndex:'wd12',
          width:100,
          align: 'center',
        },
        {
          title: '《项目推广计划》',
          dataIndex:'wd13',
          width:100,
          align: 'center',
        },
      ],
    },
    {
      title: "验收",
      children: [
        {
          title: '《其他验收报告》',
          dataIndex:'wd14',
          width:100,
          align: 'center',
        },
        {
          title: '《终验报告》',
          dataIndex:'wd15',
          width:100,
          align: 'center',
        },
      ],
    },
  ]

  import MemoryDeptSelect from "@/components/MemorySelect/MemoryDeptSelect";
  import PersonSelect from "@/module/person/PersonSelect/PersonSelect";
  import FooterToolBar from "@/components/FooterToolbar/FooterToolBar";
  import {getProjectWordCountViewList} from "@/api/progress/projectWordCount";
  import FileUpload from "@/views/project/progress/component/FileUpload";
  import moment from "moment";

  export default {
    name: "ProjectWordCountView",
    components: {FileUpload, MemoryDeptSelect, PersonSelect, FooterToolBar},
    data() {
      return {
        cardHeight: window.innerHeight - 115,
        listScrollHeight: window.innerHeight - 355,
        defaultSignDateRange: [],
        placeholder: '进度经理工号、姓名、简拼检索',
        queryParam: {
          signDateStart: "",
          signDateEnd: "",
          dept: null,
          inputContent: null,
          progressManager: null,
          pageNo: 1,
          pageSize: 25,
          requireList: [],
        },
        page:{current: 1, pageSize: 25, total: 0 },
        options,
        list: [],
        columns,
        loading: false,

        fileUploadVisible: false,
        fileUploadContractNo: null,
        fileUploadProjectId: null,
      }
    },
    mounted() {
      this.initSignDateRange()
      this.onSearch()
    },
    methods: {
      moment,
      initSignDateRange() {
        var start = moment().startOf("year")
        var end = moment()
        this.defaultSignDateRange.push(start, end)
        this.queryParam.signDateStart = start.format("YYYY-MM-DD HH:mm:ss").toString()
        this.queryParam.signDateEnd = end.format("YYYY-MM-DD 23:59:59").toString()
        console.log(this.defaultSignDateRange)
        console.log(this.queryParam)
      },
      onSearch() {
        console.log(this.queryParam)
        this.page.current = 1
        this.queryParam.pageNo = 1
        this.getProjectWordCountViewList()
      },
      getProjectWordCountViewList() {
        this.loading = true
        getProjectWordCountViewList(this.queryParam).then(res => {
          this.loading = false
          this.list = res.body.items
          this.page.total = res.body.totalCount
          console.log(res)
        })
      },
      onSignDateChange(dateRage, dateRageStr) {
        /*console.log(dateRageStr)
        if (dateRageStr && dateRageStr.length != 0 && dateRageStr[0] != '' && dateRageStr[1] !='') {
          this.queryParam.signDateStart = dateRageStr[0]
          this.queryParam.signDateEnd = dateRageStr[1];
        } else {
          this.initSignDateRange()
        }*/
        this.queryParam.signDateStart = moment(dateRage[0]).format("YYYY-MM-DD HH:mm:ss").toString()
        this.queryParam.signDateEnd = moment(dateRage[1]).format("YYYY-MM-DD 23:59:59").toString()
        this.onSearch()
      },
      onRowClick(record) {
        return {
          on: {
            click: () => {
              this.selectedRow = {...record}
            },
            dblclick: () => {
              this.selectedRow = {...record}
              this.fileUploadContractNo = this.selectedRow.contractNo
              this.fileUploadProjectId = this.selectedRow.projectId
              this.fileUploadVisible = true
            }
          }
        }
      },
      setRowClassName (record) {
        return this.selectedRow && record.contractNo == this.selectedRow.contractNo ? 'clickRowStyle' : ''
      },
      onPageChange(pageNo, pageSize) {
        this.queryParam.pageNo = pageNo
        this.getProjectWordCountViewList()
      }
    }
  }
</script>

<style scoped>
  /deep/ .clickRowStyle {
    background-color: #E8F7FF;
    color: #1890FF
  }
  /deep/ .ant-table-placeholder{
    display:none;
  }
</style>