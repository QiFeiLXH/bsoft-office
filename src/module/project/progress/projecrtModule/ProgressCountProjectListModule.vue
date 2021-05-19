<template>
  <a-card :bordered="false"
          :bodyStyle="{
            padding: '0px'
          }">
    <a-row style="margin-bottom: 5px">
      <a-month-picker style="width: 180px" placeholder="进度月份" v-model="progressDate" @change="doChange" :allowClear="false"/>
    </a-row>
    <a-table
      :loading="loading"
      v-watermark
      :body-style="{height: listScrollHeight + 'px'}"
      size="small"
      :columns="columns"
      :pagination="false"
      :rowKey="(record) => record.projectId"
      :data-source="tableData"
      :customRow="onClickRow"
      :scroll="{ x: false,y: listScrollHeight }"
      :rowClassName="setCurrentRow"
    >
      <template slot="projectName" slot-scope="text,record,index">
        {{ text }}
        <a-row style="font-weight: bold;float:right" v-if="record.progress != undefined"> {{(record.progress * 100).toFixed(2) }} % </a-row>
      </template>
    </a-table>
  </a-card>
</template>

<script>
  import moment from 'moment'
  import { getprojectlist } from "@/api/progress/progressCount";
  export default {
  name: "ProgressCountProjectListModule",
  data(){
    return{
      loading:false,
      columns:[
        {
          title: '项目',
          dataIndex: 'projectName',
          scopedSlots: { customRender: 'projectName' },
          align:'left'
        },
      ],
      tableData:[],
      selectedRow:null,
      listScrollHeight:0,
      selectedProjectInfo:null,
      progressDate:null
    }
  },
  props:{
    contractNo:{
      type: String,
      default: null
    },
    progressMonth:{
      type: String,
      default: null
    }
  },
  methods:{
    doChange(value){
      this.progressDate = moment(value).format("YYYY-MM-01")
      this.doQuery()
    },
    doQuery(){
      this.loading = true
      const params = {
        'contractNo': this.contractNo,
        'month': moment(this.progressDate).format("YYYY-MM-01")
      }
      getprojectlist(params).then(res=>{
        if (res.code === 200){
          this.tableData = []
          this.tableData = this.tableData.concat(res.body)
          console.log(this.tableData)
          if (this.selectedRow != null){
            let index = res.body.map((item) => item.projectId).indexOf(this.selectedRow)
            if(index > -1){
              this.selectedProjectInfo = res.body[index]
            }
          }else{
            this.selectedRow = res.body[0].projectId
            this.selectedProjectInfo = res.body[0]
          }
          console.log(this.selectedRow)
          console.log(this.selectedProjectInfo)
          this.$emit('selectProject',this.selectedProjectInfo,this.progressDate)
        }
        setTimeout(()=>{
          this.loading = false
        },500)
      }).catch(err=>{
        setTimeout(()=>{
          this.loading = false
        },500)
      })
      setTimeout(()=>{
        this.loading = false
      },500)
    },
    onClickRow (record, index) {
      return {
        on: {
          click: () => {
            this.selectedRow = record.projectId
            this.selectedProjectInfo = record
            this.$emit('selectProject',record,this.progressDate)
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
  },
  mounted() {
    this.progressDate = moment(this.progressMonth).format("YYYY-MM-01")
    this.listScrollHeight = window.innerHeight - 230
    this.doQuery()
  }
}
</script>

<style scoped>

</style>