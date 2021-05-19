<template>
  <a-card
    :bordered="false"
    :bodyStyle="{
      height:cardHeight+'px',
      padding: '0px 10px'
    }">
    <a-col :span="4">
      <div class="treeStyle" :style="{height: treeHeight}" id="left">
        <a-tree
          :tree-data="taskGrouopTree"
          show-icon default-expand-all
          @rightClick="onRightClick"
          @select="onTreeClick"
        >
          <span slot="meh">
            <img src="../../../../public/folder.png" style="width: 15px;margin-bottom: 3px;"/>
          </span>
          <span slot="meho">
            <img src="../../../../public/file.png" style="width: 15px;margin-bottom: 3px;"/>
          </span>
<!--          <a-icon slot="meho" type="file" theme="twoTone" twoToneColor="rgb(255, 202, 40)"/>-->
        </a-tree>
        <v-contextmenu ref="contextmenu">
          <v-contextmenu-item @click="addNode">新增同级节点</v-contextmenu-item>
          <v-contextmenu-item @click="addChildNode">新增子节点</v-contextmenu-item>
          <v-contextmenu-item @click="editNode">编辑节点</v-contextmenu-item>
          <v-contextmenu-item @click="deleteNode">删除节点</v-contextmenu-item>
        </v-contextmenu>
        <time-task-group-form ref="createModal" @ok="handleOk"></time-task-group-form>
      </div>
    </a-col>
    <a-col :span="20">
      <div class="table-page-search-wrapper">
        <a-form-model layout="inline">
          <a-row style="margin-bottom: 10px;margin-top:10px;">
            <a-col>
              <a-input-search :pressEnter="onSearch" :allowClear="true" placeholder="任务名称/任务描述" style="width: 600px;margin-bottom: 10px;margin-top:10px;" @search="onSearch"/>
              <!--            <a-button type="primary" icon="search" @click="onSearch" style="margin-left: 30px">查询</a-button>-->
              <a-divider type="vertical" />
              <a-button type="primary" @click="doOperate('create')">创建</a-button>
            </a-col>
          </a-row>
        </a-form-model>
      </div>
      <s-table
        ref="table"
        size="default"
        rowKey="id"
        :columns="taskColumns"
        :height="tableHeight"
        :data="loadTableList"
        :customRow="onClickRow"
        :rowClassName="setCurrentRow"
        :showSizeChanger="false"
        :pageSize="pagination.pageSize"
        :pageNum="pagination.pageNumber"
        :showPagination="true"
        :bodyStyle="{ minHeight:listScrollHeight+'px' }"
        :scroll="{ x: false, y: listScrollHeight }"
      >
        <template slot="rowIndex" slot-scope="text, record, index">
        <span>
          {{ (pagination.pageNumber - 1) * pagination.pageSize + index + 1 }}
        </span>
        </template>
        <template slot="status" slot-scope="text,record">
          <a-switch checked-children="启用" un-checked-children="禁用" :default-checked="text === '1'"  @change="onChangeStatus(record,$event)"/>
        </template>
        <span slot="operation" slot-scope="text, record">
        <template>
          <a @click="doOperate('modify', record)" v-if="record.status !== '1'">修改</a>
          <a-divider type="vertical" v-if="record.status !== '1'"/>
          <a @click="doOperate('remove', record)">删除</a>
        </template>
      </span>
      </s-table>
      <a-drawer
        title="定时器配置"
        :wrapStyle="{overflow: 'hidden'}"
        placement="right"
        :closable="false"
        :width="950"
        @close="onDrawerClose"
        :visible="drawerVisible"
        :bodyStyle="{ padding: '0px 0px 0px 0px' }"
      >
        <a-card :bordered="false" :body-style="{padding:'0px 24px 0px 24px'}" :style="{height: formHeight+'px'}" >
          <!--        <a-form-model :form="form">-->
          <a-form-model :model="timeTaskForm">
            <a-form-model-item
              label="任 务 名 称"
              :labelCol="{lg: {span: 3}, sm: {span: 7}}"
              :wrapperCol="{lg: {span: 21}, sm: {span: 17} }"
              :required="false"
              prop="taskName"
              style="margin-bottom: 10px;"
            >
              <a-input  rows="4" v-model="timeTaskForm.taskName" />
            </a-form-model-item>
            <a-form-model-item
              label="任 务 分 组"
              :labelCol="{lg: {span: 3}, sm: {span: 7}}"
              :wrapperCol="{lg: {span: 21}, sm: {span: 17} }"
              :required="false"
              prop="taskGroup"
              style="margin-bottom: 10px;"
            >
              <a-tree-select
                v-model="timeTaskForm.taskGroup"
                style="width: 100%"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                :tree-data="taskGrouopTree"
                placeholder="请选择分组"
                tree-default-expand-all
                @select="onGroupSelect"
              >
              </a-tree-select>
            </a-form-model-item>
            <a-form-model-item
              label="调用类名称"
              :labelCol="{lg: {span: 3}, sm: {span: 7}}"
              :wrapperCol="{lg: {span: 21}, sm: {span: 17} }"
              :required="false"
              prop="beanClass"
              style="margin-bottom: 10px;"
            >
              <a-input  rows="4" v-model="timeTaskForm.beanClass" />
            </a-form-model-item>
            <a-form-model-item
              label="执行表达式"
              :labelCol="{lg: {span: 3}, sm: {span: 7}}"
              :wrapperCol="{lg: {span: 21}, sm: {span: 17} }"
              :required="false"
              style="margin-bottom: 10px;"
            >
              <a-input  rows="4" v-model="timeTaskForm.expression" />
            </a-form-model-item>
            <a-form-model-item
              label="任 务 状 态"
              :labelCol="{lg: {span: 3}, sm: {span: 7}}"
              :wrapperCol="{lg: {span: 21}, sm: {span: 17} }"
              :required="false"
              prop="status"
              style="margin-bottom: 10px;"
            >
              <a-switch checked-children="启用" un-checked-children="禁用" :checked="timeTaskForm.status === '1'"  @change="onChangeStatusFrom"/>
            </a-form-model-item>
            <a-form-model-item
              label="任 务 描 述"
              :labelCol="{lg: {span: 3}, sm: {span: 7}}"
              :wrapperCol="{lg: {span: 21}, sm: {span: 17} }"
              :required="false"
              prop="description"
              style="margin-bottom: 10px;"
            >
              <a-textarea  rows="4" v-model="timeTaskForm.description" />
            </a-form-model-item>
            <a-form-model-item
              label="接收人"
              :labelCol="{lg: {span: 3}, sm: {span: 7}}"
              :wrapperCol="{lg: {span: 21}, sm: {span: 17} }"
              :required="false"
              prop="receiver"
              style="margin-bottom: 10px;"
            >
              <multipe-person-search-select :record="timeTaskForm" customKey="receiver" customLabel="receiverName"></multipe-person-search-select>
            </a-form-model-item>

            <a-form-model-item
              label="抄送人"
              :labelCol="{lg: {span: 3}, sm: {span: 7}}"
              :wrapperCol="{lg: {span: 21}, sm: {span: 17} }"
              :required="false"
              prop="receiver"
              style="margin-bottom: 10px;"
            >
              <multipe-person-search-select :record="timeTaskForm" customKey="ccPerson" customLabel="ccPersonName"></multipe-person-search-select>
            </a-form-model-item>
          </a-form-model>
        </a-card>
        <footer-tool-bar style="width:950px">
          <a-button type="primary" style="margin-right: 25px" @click="handleSubmit">保存</a-button>
          <a-button key="back" @click="onDrawerClose">关闭</a-button>
        </footer-tool-bar>
      </a-drawer>
    </a-col>
  </a-card>
</template>

<script>
  import { getTaskList,changeStatus,getTimeTaskInfo,saveTask,removeTask,saveTaskGroup,removeTaskGroup,getTimeTaskGroupTree } from '@/api/timeTask'
  import { STable } from '@/components'
  import moment from 'moment/moment'
  import FooterToolBar from '@/components/FooterToolbar'
  import TimeTaskGroupForm from './TimeTaskGroupForm'
  import MultipePersonSearchSelect from '@/module/person/MultipePersonSearchSelect/MultipePersonSearchSelect'
  export default {
    name: "TimeTaskList",
    components: {
      STable,
      FooterToolBar,
      TimeTaskGroupForm,
      MultipePersonSearchSelect
    },
    computed: {
      treeHeight: function () {
        return (window.innerHeight - 230) + 'px'
      },
    },
    created () {
      this.getWidthAndHeight()
      this.getTimeTaskGroupTreeData()
    },
    data () {
      return {
        timeTaskForm:{},
        moment,
        taskGroup:[
          {id:1,name:'kernel'},
          {id:2,name:'eoffice'},
          {id:3,name:'webTime'},
        ],
        taskGrouopTree:[],
        // taskGrouopTree:[
        //   {key:0,title:'定时器',children:
        //       [{key:1,title:'kernel',children:[{key:11,title:'财务',parentId:1}]},
        //       {key:2,title:'eoffice',children:[{key:21,title:'报销',parentId:2}]},
        //       {key:3,title:'webTime',children:[{key:31,title:'邮件',parentId:3}]}
        //       ]}],
        taskColumns: [
          {
            dataIndex: 'rowIndex',
            title: '',
            width: '4%',
            scopedSlots: { customRender: 'rowIndex' }
          },
          {
            dataIndex: 'taskName',
            width: '10%',
            title: '任务名称'
          },
          {
            dataIndex: 'taskGroup',
            width: '8%',
            title: '任务分组'
          },
          {
            dataIndex: 'beanClass',
            width: '15%',
            title: '调用类'
          },
          {
            dataIndex: 'expression',
            width: '10%',
            title: '执行表达式'
          },
          {
            dataIndex: 'status',
            width: '9%',
            title: '任务状态',
            scopedSlots: { customRender: 'status' }
          },
          {
            dataIndex: 'operation',
            width: '13%',
            title: '操作',
            scopedSlots: { customRender: 'operation' }
          }
        ],
        loadTableList: parameter => {
          return getTaskList(Object.assign(parameter, this.queryParam)).then(res => {
            if (res.code === 200) {
              this.pagination.pageNumber = res.body.pageNumber + 1
              this.pagination.totalCount = res.body.totalCount
              return res.body
            }
          })
        },
        cardHeight: 0,
        tableHeight: 0,
        listScrollHeight: 0,
        rowSelected: '',
        rowSelectedInfo: {},
        dutyYear: undefined,
        queryParam: { pageSize: 25},
        pagination: { pageNumber: 1, pageSize: 25, totalCount: 1 },
        drawerVisible: false,
        NodeTreeItem:null
      }
    },
    methods:{
      initFormFields () {
        this.timeTaskForm = {
          taskName: null,
          taskGroup: null,
          status: null,
          description: null,
          expression: null,
          beanClass: null,
          receiver: null,
          receiverName: null,
          ccPerson: null,
          ccPersonName: null,
        }
      },
      onClickRow (record, index) {
        return {
          on: {
            click: () => {
              this.rowSelected = record.id
              this.rowSelectedInfo = record
              this.dutyId = record.id
            }
          }
        }
      },
      setCurrentRow (record, index) {
        var styleClassName = ''
        if (record.id === this.rowSelected) {
          styleClassName = 'clickRowStyle hoverRowStyle'
        }
        return styleClassName
      },
      getWidthAndHeight () {
        this.listScrollHeight = window.innerHeight - 270
        this.cardHeight = window.innerHeight - 85
        this.formHeight = window.innerHeight - 100
      },
      handleSubmit(){
        var parameter = this.timeTaskForm
        saveTask(parameter).then(res => {
          if (res.code === 200) {
            this.$message.success('保存成功')
            this.$refs.table.refresh(true) // refresh() 不传参默认值 false 不刷新到分页第一页
            this.drawerVisible = false
          } else {
            this.$message.error(res.msg)
          }
        })
      },
      doRemoveTask(record){
        removeTask(record).then(res => {
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.$refs.table.refresh(true) // refresh() 不传参默认值 false 不刷新到分页第一页
          } else {
            this.$message.error(res.msg)
          }
        })
      },
      doOperate (op, record) {
        if(op === 'create'){
          this.initFormFields()
          this.drawerVisible = true
        }else if(op === 'modify'){
          this.drawerVisible = true
          this.initFormFields()
          getTimeTaskInfo({
            id:record.id
          }).then(res => {
            if (res.code === 200) {
              this.timeTaskForm = { ...res.body }
            }
          })
        }else if (op === 'remove') {
          const me = this
          this.$confirm({
            title: '是否确认删除该定时器?',
            // 确认 与 关闭位置对调
            cancelText: '确定',
            okText: '关闭',
            okButtonProps: {
              props: {
                type: 'default'
              }
            },
            cancelButtonProps: {
              props: {
                type: 'primary'
              }
            },
            onOk () {
            },
            onCancel () {
              me.doRemoveTask(record)
            }
          })
        }
      },
      onChangeStatus(record,value){
        if(value){
          record.status = '1'
        }else{
          record.status = '0'
        }
        changeStatus({
          jobId:record.id,
          status:record.status
        })
          .then(res => {
            if (res.code === 200) {
              this.$message.success('成功')
            } else {
              this.$message.error(res.msg)
              this.loading = false
            }
          })
      },
      onChangeStatusFrom(checked){
        if(checked){
          this.timeTaskForm.status = '1'
        }else {
          this.timeTaskForm.status = '0'
        }
      },
      onDrawerClose(){
        this.drawerVisible = false
      },
      onSearch (value) {
        this.queryParam.context = value.trim()
        this.queryParam.pageNo = 1
        setTimeout(() => {
          this.$refs.table.refresh(true) // refresh() 不传参默认值 false 不刷新到分页第一页
        }, 100)
      },
      filterOption (input, option) {
        return (
          option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
        )
      },
      onGroupSelect(value, node, extra){
        this.timeTaskForm.taskType = node.dataRef.key
        this.timeTaskForm.taskGroup = node.dataRef.title
      },
      onTreeClick(selectedKeys, e){
        this.queryParam.taskType = selectedKeys[0]
        this.queryParam.pageNo = 1
        setTimeout(() => {
          this.$refs.table.refresh(true) // refresh() 不传参默认值 false 不刷新到分页第一页
        }, 100)
      },
      onRightClick ({ event, node }) {
        const answer = node._props.dataRef.anwer;
        if (answer) {
          this.$refs.contextmenu.hide()
          this.answer = answer;
          return;
        };
        this.NodeTreeItem = {
          key: node._props.eventKey,
          title: node._props.title,
          parentId: node._props.dataRef.parentId
        };
        const x =
          event.currentTarget.offsetLeft + event.currentTarget.clientWidth + 280;
        // 因为我放在页面上的box有滚动条，所以需要减掉该盒子的scrollTop
        const y = event.currentTarget.offsetTop - document.getElementById('left').scrollTop+90;
        const postition = {
          top: y,
          left: x
        };
        this.$refs.contextmenu.show(postition);
      },
      // 用于点击空白处隐藏增删改菜单
      clearMenu () {
        this.NodeTreeItem = null;
      },
      addNode () {
        this.$refs.createModal.add(this.NodeTreeItem,'add')
      },
      addChildNode () {
        this.$refs.createModal.add(this.NodeTreeItem,'addChild')
      },
      editNode () {
        this.$refs.createModal.add(this.NodeTreeItem,'edit')
      },
      deleteNode () {
        // 写自己的业务逻辑
        removeTaskGroup({
          id:this.NodeTreeItem.key
        }).then(res => {
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.getTimeTaskGroupTreeData()
          } else {
            this.$message.error(res.msg)
          }
        })
      },
      handleOk (returnData) {
        //保存
        saveTaskGroup(returnData).then(res => {
          if (res.code === 200) {
            this.$message.success('保存成功')
            this.getTimeTaskGroupTreeData()
          } else {
            this.$message.error(res.msg)
          }
        })
      },
      getTimeTaskGroupTreeData(){
        getTimeTaskGroupTree().then(res => {
          if (res.code === 200) {
            this.taskGrouopTree = res.body
            this.setIcons(this.taskGrouopTree)
          } else {
            this.$message.error(res.msg)
          }
        })
      },
      setIcons(taskGrouopTree){
        for(var data of taskGrouopTree){
          if(data.children && data.children.length > 0){
            data.slots={
              icon:'meh'
            }
            data.isLeaf = false
            this.setIcons(data.children)
          }else{
            data.slots={
              icon:'meho'
            }
            data.isLeaf = true
          }
        }
      }
    }
  }
</script>

<style scoped>

</style>