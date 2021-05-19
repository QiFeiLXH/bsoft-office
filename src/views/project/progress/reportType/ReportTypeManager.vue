<template>
<a-card :bordered="false" :bodyStyle="{ height: '1000px', padding: '0px 10px' }">
  <a-row style="height: 45px">
    <a-col :span="12" style="padding-right: 10px">
      <a-row style="padding: 10px 0">
        <span>模块上报分类：</span>
        <a-divider type="vertical" />
        <a-button type="primary" style="margin-left:10px" @click="() => add()">
          新增
        </a-button>
      </a-row>
      <a-table :columns="reportTypeCol"
               :dataSource="reportTypeData"
               :pagination="false"
               :rowKey="record => record.id"
               :expandIconColumnIndex="0"
               :indentSize="50"
               :rowClassName="setRowClassName"
               :customRow="rowClick"
               @change="handleTableChangeDept"
               :scroll="{ x: false,y: listScrollHeight }"
               :bodyStyle="{ height: listScrollHeight + 'px' }"
               v-watermark
               size="small">
        <template slot="rowIndex" slot-scope="text, record, index">
          {{index + 1}}
        </template>

        <template  slot="name"  slot-scope="text, record" >
          <a-input
            v-if="record.editable"
            :styleClass="record.error?'errorClass':'editBtnClass'"
            style="margin: -5px 0;width:140px"
            size="small"
            :value="text"
            @change="e => handleInputChange(e.target.value, record.id)"
          />
          <template v-else>
            {{ text }}
          </template>
        </template>

        <template
          slot="type"
          slot-scope="text, record"
        >
          <template v-if="record.editable">
            <a-select v-model="record.type"
                      style="margin: -5px 0;width:140px"
                      @change="handleReportTypeChange"  size="small">
              <a-select-option v-for="d in typeList" :key="d.id">
                {{ d.name }}
              </a-select-option>
            </a-select>
          </template>
          <template v-else>
            {{ text | typeFilter}}
          </template>
        </template>

        <template slot="operation" slot-scope="text, record, index">
            <span v-if="record.editable">
            <a type="primary" @click="() => save(record,index)" style="margin-right: 10px">保存</a>
              <a @click="() =>cancel(index)">取消</a>
          </span>
          <span v-else>
            <a :disabled="editingKey !== ''" @click="() => edit(index)" style="margin-right: 10px">编辑</a>
<!--            <a :disabled="editingKey !== ''" @click="() =>logout(record,index)">注销</a>-->

<!--             <a-popconfirm  :disabled="editingKey !== ''"-->
<!--                            title="确定注销?"-->
<!--                            @confirm="() => logout(record,index)">-->
<!--            <a :disabled="editingKey !== ''"  >注销</a>-->
<!--             </a-popconfirm>-->
                        <a :disabled="editingKey !== ''" @click="() => logout(record,index)">注销</a>
          </span>
        </template>

      </a-table>
    </a-col>
    <a-col :span="12" v-if="selectedType===1">
      <a-row style="padding: 10px 0">
        <span >{{selectedReportName}}-进度节点维护：</span>
        <a-divider type="vertical" />
        <a-button type="primary" v-if="selectedReportTypeId>0" style="margin-left:10px" @click="() => addNode()">
          新增
        </a-button>
        <a-divider type="vertical" />
        <a-button type="primary"v-if="selectedReportTypeId>0" style="margin-left:10px" @click="() => saveNode()">
          保存
        </a-button>
      </a-row>
      <a-table :columns="nodeCol"
               :dataSource="nodeData"
               size="small"
               :rowKey="(record,index)=> record.id"
               :showPagination = 'false'
               :pagination = 'false'
               :scroll="{ x: false,y: listScrollHeightNode }"
               :bodyStyle="{ height: listScrollHeightNode + 'px' }"
               :rowClassName="setRowClassNameNode"
               :customRow="rowClickNode"
               @change="handleTableChangeProgress"
               v-watermark
      >

        <template slot="rowIndex" slot-scope="text, record, index">
          {{index + 1}}
        </template>

        <template  slot="planName"  slot-scope="text, record" >
          <a-input
            v-if="record.editableNode"
            :styleClass="record.error?'errorClass':'editBtnClass'"
            style="margin: -5px 0"
            size="small"
            :value="text"
            @change="e => planNameInputChange(e.target.value, record.id)"
          />
          <template v-else>
            {{ text }}
          </template>
        </template>
        <template  slot="proportion"  slot-scope="text, record" >
          <a-input-number
            v-if="record.editableNode"
            :styleClass="record.error?'errorClass':'editBtnClass'"
            style="margin: -5px 0"
            size="small"
            :max="100"
            :min="0"
            :step="1"
            :precision="0"
            v-model="record.proportion"
            @change="proportionInputChange"
          /><span v-if="record.editableNode">%</span>

<!--
     :value="text"
                 @change="e => proportionInputChange(e.target.value, record.id)"

 onkeyup="value=value.replace(/[^\d]/g,'')"-->
          <template v-if="!record.editableNode">
            {{ text  }}%
          </template>
        </template>


        <template  slot="sort"  slot-scope="text, record" >
          <a-input-number
            v-if="record.editableNode"
            :styleClass="record.error?'errorClass':'editBtnClass'"
            style="margin: -5px 0"
            size="small"
            :max="999"
            :min="0"
            :step="1"
            :precision="0"
            v-model="record.sort"
          />
<!--          @change="e => sortInputChange(e.target.value, record.id)"-->
          <template v-else>
            {{ text }}
          </template>
        </template>
        <template slot="operation" slot-scope="text, record, index">
            <span v-if="record.editableNode">
              <a :disabled="editingKey !== ''" @click="() => cancelNode(index)" style="margin-right: 10px">取消</a>
          </span>
          <span v-else>
            <a :disabled="editingKey !== ''" @click="() => editNode(index)" style="margin-right: 10px">编辑</a>
             <a-popconfirm  :disabled="editingKey !== ''"
                            v-if="record.logout  === 0 ? { color: 'rgba(0, 0, 0, 0.25)' } : null"
                            title="确定注销?"
                            @confirm="() => logoutNode(record,index)">
            <a :disabled="editingKey !== ''"  >注销</a>
<!--            <a :disabled="editingKey !== ''" @click="() =>logoutNode(record,index)">注销</a>-->
             </a-popconfirm>
          </span>
        </template>
      </a-table>
      <span v-if="selectedType===1" style="margin-left: 40%" >合计：{{this.Sums}}%</span>
<!--      <progress-node-moudle ref="progressNode" :reportTypeId="selectReportTypeId" v-if="selectedType===1"></progress-node-moudle>-->
<!--      <span v-else>该运维算法不存在节点维护</span>-->
    </a-col>
    <a-col v-if="selectedType===2">
      该进度算法无需维护进度节点
    </a-col>

  </a-row>


</a-card>

</template>

<script>
  import { getproreporttypelist,saveproreporttypelist,logoutproreporttype } from '@/api/reportType'
  import { Decimal } from 'decimal.js'
  import {getproprogressnodelist, saveproprogressnodelist,logoutproprogressnode} from "@/api/proportionNode";
  const typeMap = {
    1: { id: 1, name: "按节点进度" },
    2: { id: 2, name: "按运维时间" }
  }
  export default {
    components: {},
    name: "ReportTypeManager",
      data() {
        return {
          listScrollHeight: window.innerHeight - 210,
          reportTypeData:[],
          flag:false,
          editingKey: '',
          customId:-1,
          logoutId:-1,
          selectedReportTypeId:-1,
          selectedReportName:'',
          selectedReportFlag:true,
          selectedType:-1,
          typeList:[
            { id: 1, name: "按节点进度" },
            { id: 2, name: "按时间进度" }
          ],
          reportTypeCol: [
            {
              title: '序号',
              dataIndex:'rowIndex',
              ellipsis: true,
              width:'15%',
              scopedSlots: { customRender: 'rowIndex' },
            },
            {
              title: '模块上报分类',
              dataIndex:'name',
              ellipsis: true,
              width:'30%',
              scopedSlots: { customRender: 'name' },
            },
            {
              title: '进度算法',
              dataIndex:'type',
              width:'30%',
              scopedSlots: { customRender: 'type' },
            },
            {
              title: '操作',
              dataIndex: 'operation',
              width:'20%',
              scopedSlots: { customRender: 'operation' },
            },
          ],


          customNodeId:-1,
          logoutNodeId:-1,
          proportionSum:0,
          Sums:0,
          nodeData:[],
          oldNodeData:[],
          editingNodeKey: '',
          buttonLoading: false,
          changedNodeRows: [],// 记录修改过的节点
          deptButtonLoading: false,
          currentNodeRecord: {Id: null,reportTypeId:null,planName:null,proportion:2,logout:null},
          selectProportion:null,
          changedNodeId: -1,// 标记修改过的节点
          nodeCol : [
            {
              title: '序号',
              width:'8%',
              dataIndex:'rowIndex',
              align: 'left',
              scopedSlots: { customRender: 'rowIndex' },
            },
            {
              title: '节点名称',
              width:'20%',
              dataIndex: 'planName',
              scopedSlots: { customRender: 'planName' },
            },
            {
              title: '节点比例',
              width:'15%',
              dataIndex: 'proportion',
              scopedSlots: { customRender: 'proportion' },
            },
            {
              title: '排序顺序',
              width:'15%',
              dataIndex:'sort',
              align: 'left',
              scopedSlots: { customRender: 'sort' },
            },
            {
              title: '操作',
              dataIndex: 'operation',
              width:'15%',
              scopedSlots: { customRender: 'operation' },
            },
          ],



        }
      },

    created() {
      this.initPage()
    },
    filters: {
      typeFilter(type) {
        return typeMap[type].name
      }
    },
    methods:{
        initPage(){
          this.loadReportTypeListData();
          this.listScrollHeight = window.innerHeight - 210
          this.listScrollHeightNode = window.innerHeight - 250

        },
        loadReportTypeListData(){
          this.editingKey = ''
          getproreporttypelist().then((res) => {
            if (res.code === 200) {
              this.reportTypeData=res.body
            }
          })
        },
        rowClick(record) {
          return {
            on: {
              click: ()=> {
                this.selectedReportTypeId = record.id
                this.selectedType = record.type
                this.selectedReportName = record.name
                this.flag = false
                this.nodeData=[]
                this.oldNodeData=[]
                this.Sums = 0
                // this.editingKey = this.reportTypeData.indexOf(record)
                if(this.selectedReportTypeId>0&&this.selectedType===1){
                  this.loadListNodeData(this.selectedReportTypeId)
                }
              },
              dblclick: () => {
                this.selectedReportTypeId = record.id
                this.selectedType = record.type
                this.selectedReportName = record.name
                this.nodeData=[]
                this.oldNodeData=[]
                this.Sums = 0
                this.flag = false
                if(this.selectedReportTypeId>0&&this.selectedType===1){
                  this.loadListNodeData(this.selectedReportTypeId)
                }
              }
            }
          }
        },
        setRowClassName(record) {
          if (this.selectedReportTypeId == record.id) {
            return 'clickRowStyle'
          }
        },
        handleReportTypeChange(value){
          var index = this.editingKey;
          const newData = [...this.reportTypeData]
          const target = newData[index]
          if(target){
            // target["name"] = value.label;
            target["type"] = value;
          }
          this.reportTypeData[index] = target
        },
        add(){
          this.customId -= 1
          if(this.reportTypeData.length!=0&&this.reportTypeData[this.reportTypeData.length-1].id<0){
            return
          }
          this.reportTypeData.push(
            {
              editable:true,
              id: this.customId,
              name:null,
              type:1,
              logout:0
            }
          );
          this.editingKey = this.reportTypeData.length - 1;
            console.log(this.reportTypeData)
        },

        handleInputChange (val, key) {
          if(val.length>20){
            this.$message.warning("模块上报分类名称长度不能大于二十个字");
            return
          }
            const newData = [...this.reportTypeData];
          const target = newData.filter(item => key === item.id)[0];
          if (target) {
            target.name = val;
            this.data = newData;
          }
        },

        save(record,index) {
          const newData = [...this.reportTypeData];
          const target = newData[index];
          if(record.name == null||record.name ==''){
            this.$message.info('模块上报分类不能为空');
            return;
          }

          if(record.type<1){
            this.$message.info('节点分类不能为空');
            return;
          }
          var data = { ...record }
          if(data.id<0){
            data.id = null
            delete data.editable;
          }
            saveproreporttypelist(data).then(
              res => {
                if (res.code === 200) {
                  this.reportTypeData = newData;
                  this.editingKey = '';
                  const target = newData[index];
                  delete target.editable;
                  this.$message.success('保存成功');
                  this.editingKey = ''
                  getproreporttypelist().then((res) => {
                    if (res.code === 200) {
                      this.reportTypeData=res.body
                      this.selectedReportTypeId = this.reportTypeData[index].id
                    }
                  })
                }
              })
        },


        edit(index) {
          const newData = [...this.reportTypeData];
          const target = newData[index];
          if (target.logout  === 1) {
            return
          }
          if (target) {
            target.editable = true;
            this.reportTypeData = newData;
          }
          this.editingKey = index;
        },
        logout(record,index){
          const me = this
            this.$confirm({
              title: '注销后无法恢复,是否注销?',
              onOk () {
                me.onlogout(record,index)
              },
              onCancel () {
              }
            })

        },

       onlogout(record,index){
         const newData = [...this.reportTypeData];
         const target = newData[index];
         if(target.id!=null&&target.logout!=1){
           this.logoutId = target.id;
           logoutproreporttype({id:this.logoutId}).then(
             res=>{
               this.$message.success('注销成功');
               this.loadReportTypeListData();
               this.selectedType=3
             })}
       },

        cancel(index) {
          const newData = [...this.reportTypeData];
          const target = newData[index];
          if(target.id < 0){
            newData.splice(index,1);
          }
          this.editingKey = '';
          if (target) {
            delete target.editable;
            this.reportTypeData = newData;
          }
          this.loadReportTypeListData()
        },

      handleTableChangeDept(pagination) {
        // this.queryParam.dept = null
        // this.selectedDept = null
        // this.changedDept = []
        // this.changedDeptRows = []
        this.loadReportTypeListData()
      },



      loadListNodeData(reportTypeId){
        getproprogressnodelist({ id: reportTypeId })
          .then(res => {
            if (res.code === 200) {
              this.nodeData=[]
              this.Sums=0
              this.nodeData = res.body
              this.nodeData.forEach(item=>{
                item.proportion = new Decimal( new Decimal(item.proportion).toNumber().toFixed(2) ).mul(100).toNumber()
                this.Sums  =this.Sums*1+item.proportion*1
              })
              this.oldNodeData = this.nodeData.map(item => ({ ...item }))
            }

          })
      },

      setRowClassNameNode(record) {
        if (this.changedNodeId === record.id) {
          return 'clickRowStyle'
        }
      },
      rowClickNode(record) {
        return {
          on: {
            click: ()=> {
              this.changedNodeId = record.id

              this.changedNodeRows = []
            },
            dblclick: () => {
              this.changedNodeId = record.id
              this.changedNodeRows = []
            }
          }
        }
      },

      handleTableChangeProgress(pagination) {
              this.changedNodeId = -1
              this.changedNodeRows = []
              this.loadListNodeData()
      },

      addNode(){
        this.customNodeId -= 1
        this.nodeData.push(
          {
            editableNode:true,
            id: this.customNodeId,
            reportTypeId:this.selectedReportTypeId,
            logout:0,
            proportion:null,
            sort:this.nodeData.length+1
          }
        );
        this.editingNodeKey = this.reportTypeData.length - 1;
      },

      cancelNode(index) {
        const newData = this.nodeData.map(item => ({...item}));
        let target = newData[index];
        if(target.id < 0){
          newData.splice(index,1);
        }else {
          if (target) {
            delete target.editableNode;
          }
          console.log(index)
          target = this.oldNodeData[index]
          newData[index] = target
          console.log(target)
        }
        this.editingKey = '';
        this.nodeData=newData
        this.proportionSums()
      },

      editNode(index) {
        const newData = this.nodeData.map(item => ({...item}));
        const target = newData[index];
        if (target.logout  === 1) {
          return
        }
        if (target) {
          target.editableNode = true;
          this.nodeData = newData;
        }
        this.editingNodeKey = index;
      },

      logoutNode(record,index){
        const newData = this.nodeData.map(item => ({...item}));
        const target = newData[index];
        if(target.id!=null&&target.logout!=1){
          this.logoutNodeId = target.id;
          logoutproprogressnode({id:this.logoutNodeId}).then(
            res=>{
              this.$message.success('注销成功,请维护节点比例,确保节点比例之和维护为100%');
              this.loadListNodeData(this.selectedReportTypeId);
            })}
      },

      proportionSums(){
        this.proportionSum = 0
        this.Sums=0
        this.nodeData.forEach(item=>{
          this.proportionSum  =this.proportionSum*1+item.proportion*1
        })
        this.Sums= this.proportionSum
      },

      saveNode() {
        this.proportionSums()
        var notSortName = this.nodeData.filter(item => !item.planName||item.sort===null||item.planName.length>20)
        if(notSortName.length>0){
          this.$message.info("节点名称或排序顺序不能为空,且节点名称不能多于二十个字");
          return;
        }
        this.nodeData.forEach(item=>{
          var temp = this.nodeData.filter(x => x.planName===item.planName||x.sort===item.sort)
          if(temp.length>1){
            this.flag = true;
          }
        })
        console.log(this.nodeData)
        if(this.flag){
          this.$message.info("节点名称或排序顺序不能重复");
          this.flag = false
          return
        }

        var temp2 = this.nodeData.filter(item => item.proportion==null||item.proportion<0)
        if(temp2.length>0){
          this.$message.info("节点比例不能为空且不能为负数");
          return;
        }

        if(this.proportionSum*0.01!==1){
          this.$message.info("节点比例总和必须为百分之百");
          return;
        }


        this.buttonLoading=true
        this.nodeData.forEach(item=>{
          var pro = item.proportion*0.01
          item.proportion=pro
        })
        saveproprogressnodelist(this.nodeData).then(res => {
          this.proportionSum = 0
          this.buttonLoading=false
          if (res.code === 200) {
              this.$message.success("保存成功")
              this.nodeData.forEach(item=>{
              if(item.id<0){
                delete item.editableNode
              }})
              this.loadListNodeData(this.selectedReportTypeId)
          }
        })
      },

      planNameInputChange (val, key) {
        const newData = [...this.nodeData];
        const target = newData.filter(item => key === item.id)[0];
        if (target) {
          target.planName = val;
          this.nodeData = newData;
        }
      },

      proportionInputChange (val, key) {
        // const newData = [...this.nodeData];
        // const target = newData.filter(item => key === item.id)[0];
        // if (target) {
        //   target.proportion = val;
        //   this.nodeData = newData;
        // }

        this.Sums = 0
        this.nodeData.forEach(item=>{
          // item.proportion = item.proportion*100
          this.Sums  =this.Sums*1+item.proportion*1
        })
      },

      sortInputChange (val, key) {
        const newData = [...this.nodeData];
        const target = newData.filter(item => key === item.id)[0];
        if (target) {
          target.sort = val*1;
          this.nodeData = newData;
        }
      },


      }
    }
</script>

<style>
  /*.typeClass .ant-select-sm .ant-select-selection--single{*/
  /*  height: 24px;*/
  /*  width: 168px;*/
  /*}*/

  /*.typeClass .ant-select.ant-select-enabled.ant-select-sm{*/
  /*  width: 168px;*/
  /*}*/

  /deep/ .clickRowStyle {
    background-color: #E8F7FF;
    color: #1890FF
  }

</style>