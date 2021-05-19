<template>
  <a-modal
    style="top: 30px"
    v-model="standardWordVisible"
    :width="1300"
    :maskClosable="false"
    :closable="false"
    :bodyStyle="{height: modalHeight}"
    :destroyOnClose="true">
    <s-table
      ref="table"
      size="small"
      :scroll="{ x: false,y: tableHeight }"
      :rowKey="(record) => record.fileKey"
      :columns="wordColumns"
      :data="search"
      :customRow="onModalClickRow"
      :rowClassName="setModalCurrentRow"
      :showPagination="false"
      :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange, getCheckboxProps: record => ({
                    props: {
                      disabled: record.disabled, // Column configuration not to be checked
                      name: 's' + record.fileKey
                    }
                })
      }">
       <span slot="serial" slot-scope="text, record, index" v-if="page.pageNumber === 0">
          {{ index + 1 }}
       </span>
       <span slot="serial" slot-scope="text, record, index" v-else>
          {{ (currentPage-1)*page.pageSize +index + 1 }}
       </span>
       <span slot="renderScale" slot-scope="text, record, index">
          <div v-if="text === 1">√</div>
       </span>
       <span slot="renderRequired" slot-scope="text, record, index">
          <div v-if="text === 1">是</div>
          <div v-else>否</div>
       </span>
    </s-table>
    <template slot="footer">
      <a-pagination
        :total="page.totalCount"
        :pageSize.sync="page.pageSize"
        v-model="page.pageNumber"
        @change="onChange"
        style="margin-bottom: 10px"/>
      <a-button key="submit" type="primary" @click="handleOk">
        确定
      </a-button>
      <a-button key="back" @click="handleCancel">关闭</a-button>
    </template>
  </a-modal>
</template>

<script>
  import { getStandardWord } from '@/api/projectPlan'
  import STable from '@/components/Table'
    export default {
      components: {
        STable,
      },
      name: "ProjectStandardWord",
      props:{
        standardWordVisible:{
          type:Boolean,
          default:true
        },
        idStr:{
          type:String,
          default:''
        },
        projectInfo:{},
        wordRecord:{}
      },
      data () {
        return {
          selectedRowKeys: [],
          selectedRows: [],
          pageSizeOptions: ['10', '25', '50', '75', '100'],
          modalSelectedRow:'',
          modalWordInfo:{},
          page: { pageNumber: 1, pageSize: 25, totalCount: 1 },
          // 查询参数
          queryParam: { 'context': '', pageSize: 999 },
          search: parameter => {
            parameter.pageNo -= 1
            parameter.pageSize = 999
            parameter.stage = this.wordRecord.stage
            return getStandardWord(Object.assign(parameter, this.queryParam))
              .then(res => {
                if (res.code === 200) {
                  this.page.pageNumber = res.body.pageNumber + 1
                  this.page.pageSize = res.body.pageSize
                  this.page.totalCount = res.body.totalCount
                  this.currentPage = res.body.pageNumber + 1
                  if(this.idStr){
                    var ids = this.idStr.split(",")
                    for(var id of ids){
                      if(this.selectedRowKeys.indexOf(parseInt(id)) < 0){
                        this.selectedRowKeys.push(parseInt(id))
                      }
                    }
                  }else{
                    this.selectedRowKeys = []
                  }
                  var dataList = res.body.items
                  for(var data of dataList){
                    data.disabled = false
                    if(data.isRequired === 1){
                      if(this.projectInfo.scale === 1 && data.scaleLarge === 1){
                        data.disabled = true
                        if(this.selectedRowKeys.indexOf(parseInt(data.fileKey)) < 0) {
                          this.selectedRowKeys.push(parseInt(data.fileKey))
                        }
                      }
                      if(this.projectInfo.scale === 2 && data.scaleMiddle === 1){
                        data.disabled = true
                        if(this.selectedRowKeys.indexOf(parseInt(data.fileKey)) < 0) {
                          this.selectedRowKeys.push(parseInt(data.fileKey))
                        }
                      }
                      if(this.projectInfo.scale === 3 && data.scaleSmall === 1){
                        data.disabled = true
                        if(this.selectedRowKeys.indexOf(parseInt(data.fileKey)) < 0) {
                          this.selectedRowKeys.push(parseInt(data.fileKey))
                        }
                      }
                      if(this.projectInfo.scale === 4 && data.scaleTiny === 1){
                        data.disabled = true
                        if(this.selectedRowKeys.indexOf(parseInt(data.fileKey)) < 0) {
                          this.selectedRowKeys.push(parseInt(data.fileKey))
                        }
                      }
                    }
                  }
                  return res.body
                }
              })
          },
          wordColumns:[
            // {
            //   title: '序号',
            //   scopedSlots: { customRender: 'serial' },
            //   width: '5%'
            // },
            {
              title: '文档编号',
              dataIndex: 'fileKey',
              width: '10%'
            },
            {
              title: '文档名称',
              dataIndex: 'fileName',
              width: '40%'
            },
            {
              title: '项目规模',
              children: [
                {
                  title: '大',
                  dataIndex: 'scaleLarge',
                  scopedSlots: { customRender: 'renderScale' },
                  width: '5%'
                },
                {
                  title: '中',
                  dataIndex: 'scaleMiddle',
                  scopedSlots: { customRender: 'renderScale' },
                  width: '5%'
                },
                {
                  title: '小',
                  dataIndex: 'scaleSmall',
                  scopedSlots: { customRender: 'renderScale' },
                  width: '5%'
                },
                {
                  title: '微',
                  dataIndex: 'scaleTiny',
                  scopedSlots: { customRender: 'renderScale' },
                  width: '5%'
                }
              ]
            },
            {
              title: '是否必须',
              dataIndex: 'isRequired',
              width: '10%',
              scopedSlots: { customRender: 'renderRequired' },
            },
          ]
        }
      },
      computed: {
        modalHeight: function () {
          return (window.innerHeight - 190) + 'px'
        },
        tableHeight: function () {
          return window.innerHeight - 180 - 140
        }
      },
      methods:{
        onSelectChange (selectedRowKeys, selectedRows) {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
        handleOk (e) {
          this.$emit("on-change-visible", false);
          var idStr = ''
          if(this.selectedRowKeys.length > 0){
            for(var id of this.selectedRowKeys){
              idStr += id + ','
            }
            idStr = idStr.substring(0,idStr.length - 1)
          }
          this.$emit("setPlanWords", idStr);
          // this.standardWordVisible = false;
        },
        handleCancel (e) {
          this.$emit("on-change-visible", false);
          // this.standardWordVisible = false
        },
        // 弹窗数据选中
        onModalClickRow (record) {
          const me = this
          return {
            on: {
              click: () => {
                me.modalSelectedRow = record.fileKey
                me.modalWordInfo = record
              },
              dblclick: () => {
                me.modalSelectedRow = record.fileKey
                me.modalWordInfo = record
                me.handleOk();
              }
            }
          }
        },
        setModalCurrentRow (record, index) {
          let styleClassName = ''
          if (record.fileKey === this.modalSelectedRow) {
            styleClassName = 'clickRowStyle'
          }
          return styleClassName
        },
        onChange (current) {
          this.queryParam.pageNo = current-1 > 0 ? current-1 : 0
          setTimeout(() => {
            this.$refs.table.refresh(true) // refresh() 不传参默认值 false 不刷新到分页第一页
          }, 100)
        },
      }
    }
</script>

<style scoped>

</style>