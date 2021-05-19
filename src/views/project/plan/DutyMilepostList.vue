<template>

      <a-table
        size="default"
        :loading="isLoading"
        :scroll="{ x: false,y: tableHeight }"
        :rowKey="(record) => record.id"
        :columns="modalColumns"
        :dataSource="DutyMilepostData"
        :customRow="onModalClickRow"
        :rowClassName="setModalCurrentRow"
        :pagination="false"
        :rowSelection="{
          selectedRowKeys: selectedRowKeys,
          onChange: onSelectChange,
          onSelect: onSelect,
          onSelectAll:onSelectAll,
          getCheckboxProps: record => {
            return {
              props: {
                disabled: record.finishFlag === 1 || record.milepostLevel !== 2, // Column configuration not to be checked
                defaultChecked: selectedRowKeys.includes(record.id),
              }
            };
          }
        }"
      >
        <template slot="milepostName" slot-scope="text, record">
          <span>{{record.milepostName}}</span>
        </template>
        <template slot="actualFinishDate" slot-scope="text, record">
          <a-date-picker :disabledDate="disabledDate" :value="text ? moment(text, 'YYYY-MM-DD') : null" @change="onCellChange(record, 'actualFinishDate' , $event)" :disabled="!record.selected || record.milepostLevel !== 2 || record.finishFlag === 1"/>
        </template>
      </a-table>
</template>

<script>
  import moment from 'moment'
    export default {
        name: "DutyMilepostList",
        props: {
          DutyMilepostData: {
            type: Array,
            default: [],
            required: true
          },
          selectedMilepostDutyName:{
            type:String,
            default:'',
          }
        },
        mounted () {
          for(const data of this.DutyMilepostData){
            // this.selectedRowKeys.push(data.id)
            if(data.finishFlag === 1 || data.actualFinishDate){
              this.selectedRowKeys.push(data.id)
              data.selected = true
            }else{
              data.selected = false
              // data.actualFinishDate = this.DateTime(new Date())
            }
            // data.children = null
          }
        },
        data () {
          return {
            isLoading: false,
            modalSelectedRow:'',
            modalMilepost:{},
            milepostList:[],
            selectedRowKeys: [],
            selectedRows: [],
            modalColumns: [
              {
                title: '里程碑计划—'+this.selectedMilepostDutyName,
                dataIndex: 'milepostName',
                scopedSlots: { customRender: 'milepostName' },
                width: '40%'
              },
              {
                title: '完成日期',
                dataIndex: 'actualFinishDate',
                scopedSlots: { customRender: 'actualFinishDate' },
                width: '40%'
              },
            ],
          }
        },
        computed: {
          treeHeight: function () {
            return this.showFooter ? (window.innerHeight - 230) + 'px' : (window.innerHeight - 230 + 50) + 'px'
          },
          formHeight: function () {
            return this.showFooter ? (window.innerHeight - 230 - 50) + 'px' : (window.innerHeight - 230 + 50 - 50) + 'px'
          },
          modalHeight: function () {
            return (window.innerHeight - 190) + 'px'
          },
          tableHeight: function () {
            return window.innerHeight - 180 - 140
          }
        },
        methods:{
          disabledDate (current) {
            return  current > new Date()
          },
          DateTime (value) {
            const dateee = new Date(value).toJSON()
            const date = new Date(+new Date(dateee) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '')
            return date
          },
          moment,
          onCellChange(record,dataIndex,value){
            if (value != null) {
              value = this.DateTime(value.valueOf())
            }
            record[dataIndex] = value
          },
          // 弹窗数据选中
          onModalClickRow (record) {
            const me = this
            return {
              on: {
                click: () => {
                  me.modalSelectedRow = record.id
                  me.modalError = false
                  me.modalMilepost = record
                },
                dblclick: () => {
                  me.modalSelectedRow = record.id
                  me.modalMilepost = record
                }
              }
            }
          },
          setModalCurrentRow (record, index) {
            let styleClassName = ''
            if (record.id === this.modalSelectedRow) {
              styleClassName = 'clickRowStyle'
            }
            return styleClassName
          },
          onSelectChange (selectedRowKeys, selectedRows) {
            this.selectedRowKeys = selectedRowKeys
            this.selectedRows = selectedRows
          },
          onSelect(record, selected, selectedRows, nativeEvent){
            if(selected){
              record.actualFinishDate = this.DateTime(new Date())
              record.selected = true
            }else{
              record.actualFinishDate = null
              record.selected = false
            }
          },
          onSelectAll(selected, selectedRows, changeRows){
            if(selected){
              for(var data of this.DutyMilepostData){
                if (data.finishFlag !== 1){
                  data.actualFinishDate = this.DateTime(new Date())
                  data.selected = true
                }
              }
            }else{
              for(var data of this.DutyMilepostData){
                if (data.finishFlag !== 1){
                  data.actualFinishDate = null
                  data.selected = false
                }
              }
            }
          }
        }
    }
</script>

<style scoped>
  /deep/ .ant-table .ant-table-row-indent + .ant-table-row-expand-icon {
    margin-right: 8px;
    visibility: hidden;
  }
</style>