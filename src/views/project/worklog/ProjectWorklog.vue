<template>
  <div>
    <a-spin tip="加载中..." :spinning="spinning">
      <a-layout>
        <a-layout-header style="background: white;padding-left: 10px;font-size: 16px;font-weight: bold;color: rgba(0,0,0,.85);">

          <a-popover trigger="hover" placement="bottom">
            <template slot="content">
              <project-info :projectInfo="projectInfo" :userId="userId"/>
            </template>
            <span v-if="projectInfo != null " style="cursor:default">{{ projectInfo.projectName }}</span>
            <span v-else style="cursor:default">请选择项目</span>
          </a-popover>

          <div class="project-check">
            <a-button type="primary" @click="showModal">选择项目</a-button>
            <a-modal
              style="top: 30px"
              v-model="visible"
              :width="1300"
              :maskClosable="false"
              :bodyStyle="{height: modalHeight}"
              :destroyOnClose="true">
              <a-input-search :pressEnter="onSearch" :allowClear="true" placeholder="项目名称" style="width: 600px;margin-bottom: 10px" @search="onSearch" />
              <a-table
                size="small"
                v-watermark
                :loading="isLoading"
                :scroll="{ x: false,y: tableHeight }"
                :rowKey="(record) => record.projectId"
                :columns="modalColumns"
                :dataSource="projectList"
                :customRow="onModalClickRow"
                :rowClassName="setModalCurrentRow"
                :pagination="false"
              >
                <span slot="serial" slot-scope="text, record, index" v-if="page.pageNumber === 0">
                  {{ index + 1 }}
                </span>
                <span slot="serial" slot-scope="text, record, index" v-else>
                  {{ (currentPage-1)*page.pageSize +index + 1 }}
                </span>
                <span slot="renderCheck" slot-scope="text, record, index">
                  <div v-if="record.isCommon === 1">√</div>
                </span>
              </a-table>
              <template slot="footer">
                <a-pagination
                  :total="page.totalCount"
                  :pageSize.sync="page.pageSize"
                  v-model="page.pageNumber"
                  @change="onChange"
                  style="margin-bottom: 10px"/>
                <a-alert
                  v-if="modalError"
                  closable
                  type="warning"
                  style="margin-bottom: 10px;width: 20%;margin:0 auto;text-align: left"
                  showIcon
                  message="请选择一个项目"
                  @close="onErrorClose"/>
                <a-button key="submit" type="primary" @click="handleOk">
                  确定
                </a-button>
                <a-button key="back" @click="handleCancel">关闭</a-button>
              </template>
            </a-modal>
          </div>
        </a-layout-header>

        <a-row v-if="orgTree !== null && orgTree.length > 0" style="margin-bottom: 50px">
          <a-col :span="10">
            <div class="treeStyle" :style="{height: treeHeight}">
              <s-tree
                ref="tree"
                :dataSource="orgTree"
                :openKeys.sync="openKeys"
                :search="false"
                :showTitle="true"
                :showTime="true"
                :time="time"
                :selectKey="selectKey"
                :noPlan="noPlan"
                :checkTime="checkTime"
                @click="handleClick"
                @parentClick="parentClick"
                @timeItemClick="timeItemClick"
              />
            </div>
          </a-col>
          <a-col :span="14">
            <div id="rightPanel">
              <a-card :bordered="false">
                <a-form :form="houseForm" hideRequiredMark>
                  <a-row>
                    <a-col span="12">
                      <a-form-item
                        label="住宿情况"
                        :labelCol="{lg: {span: 6}, sm: {span: 2}}"
                        :wrapperCol="{lg: {span: 18}, sm: {span: 20} }"
                        :required="false"
                        style="margin-bottom: 0"
                      >
                        <a-radio-group @change="changeHouseTypeValue" v-decorator="['houseType', {rules: [{required: true, message: '请选择住宿情况' }], initialValue:houseInfo.houseType }]">
                          <a-radio :value="1" >非住宿</a-radio>
                          <a-radio :value="2" >宿舍</a-radio>
                          <a-radio :value="3" >宾馆</a-radio>
                        </a-radio-group>
                      </a-form-item>
                    </a-col>
                    <a-col span="12">
                      <a-form-item
                        label="是否出差"
                        :labelCol="{lg: {span: 6}, sm: {span: 2}}"
                        :wrapperCol="{lg: {span: 18}, sm: {span: 20} }"
                        :required="false"
                        style="margin-bottom: 0"
                      >
                        <a-checkbox :checked="evection === 1" @change="onEvectionChange"/>
                      </a-form-item>

                    </a-col>
                    <a-modal
                      style="top: 30px"
                      v-model="showHouseModal"
                      :width="1300"
                      :maskClosable="false"
                      :bodyStyle="{height: modalHeight}"
                      :destroyOnClose="true">
                      <a-input-search :pressEnter="onHousesSearch" :allowClear="true" placeholder="宿舍名称/地址" style="width: 600px;margin-bottom: 10px" @search="onHousesSearch" />
                      <a-table
                        v-watermark
                        :loading="isHouseLoading"
                        size="small"
                        :scroll="{ x: false,y: tableHeight }"
                        :rowKey="(record) => record.id"
                        :columns="houseModalColumns"
                        :dataSource="houseList"
                        :customRow="onHouseModalClickRow"
                        :rowClassName="setHouseModalCurrentRow"
                        :pagination="false"
                      >
                        <span slot="serial" slot-scope="text, record, index" v-if="housePage.pageNumber === 0">
                          {{ index + 1 }}
                        </span>
                        <span slot="serial" slot-scope="text, record, index" v-else>
                          {{ (houseCurrentPage-1)*housePage.pageSize +index + 1 }}
                        </span>
                        <span slot="renderCheck" slot-scope="text, record, index">
                          <div v-if="record.isCommon === 1">√</div>
                        </span>
                      </a-table>
                      <template slot="footer">
                        <a-pagination
                          :total="housePage.totalCount"
                          :pageSize.sync="housePage.pageSize"
                          v-model="housePage.pageNumber"
                          @change="onHouseChange"
                          style="margin-bottom: 10px"/>
                        <a-alert
                          v-if="modalHouseError"
                          closable
                          type="warning"
                          style="margin-bottom: 10px;width: 20%;margin:0 auto;text-align: left"
                          showIcon
                          message="请选择宿舍"
                          @close="onHouseErrorClose"/>
                        <a-button key="submit" type="primary" @click="handleHouseOk">
                          确定
                        </a-button>
                        <a-button key="back" @click="handleHouseCancel">关闭</a-button>
                      </template>
                    </a-modal>
                  </a-row>
                  <a-row v-if="houseInfo.houseType === 2">
                    <a-col span="18">
                      <a-form-item
                        label="宿舍名称"
                        :labelCol="{lg: {span: 4}, sm: {span: 6}}"
                        :wrapperCol="{lg: {span: 17}, sm: {span: 18} }"
                        :required="false"
                        style="margin-bottom: 0"
                      >
                        <a-input-search v-decorator="['houseInfoName',{rules: [{required: true, message: '请选择宿舍' }],initialValue:houseInfo.houseName}]" placeholder="请选择宿舍" readOnly @search="openHouseSearch"/>
                      </a-form-item>
                    </a-col>
                  </a-row>
                </a-form>
              </a-card>
              <div :style="{height: formHeight}" class="form-style" id="logForm">
                <div v-for="(item,index) in workLogs">
                  <work-log-info
                    :finished="finished"
                    ref="formList"
                    :showStatus="true"
                    @deleteWorkLog="deleteWorkLog"
                    :modalHeight="modalHeight"
                    :tableHeight="tableHeight"
                    :formDisabled="formDisabled"
                    :workLog="item"
                    :roles = "roles"
                    :types = "types"
                    :planName="selectItem.milepostName"
                    :titleIndex="index"/>
                </div>
                <span id="formBottom"></span>
              </div>
            </div>
            <footer-tool-bar  :style="{ width: isSideMenu() && isDesktop() ? `calc(100% - ${sidebarOpened ? 256 : 80}px)` : '100%'}">
              <template slot="left" v-if="!noPlan">
                <a-radio-group v-model="checkStatus" @change="planChange">
                  <a-radio :value="0">
                    未完成计划
                  </a-radio>
                  <a-radio :value="1">
                    全部计划
                  </a-radio>
                </a-radio-group>
              </template>

              <template slot="content" v-if="showFooter">
                <a-button type="primary" style="margin-left: 45%" @click="addForm">新增事件</a-button>
              </template>
              <a-button type="primary" style="margin-right: 10px" @click="validate" :loading="loading" v-if="showFooter">保存</a-button>
              <a-button type="primary" @click="openFileModal" v-if="showUpload && selectItem.id !== -1" >提交文档</a-button>
              <project-log-file ref="file" :modalHeight="modalHeight" :tableHeight="tableHeight" :uploadTypes="uploadTypes" :selectItem="selectItem" :projectInfo="projectInfo" :show="fileModalVisible" @closeFileModal="closeFileModal"/>
              <!--
                            <project-new-log-file ref="file" :uploadTypes="uploadTypes" :selectItem="selectItem" :projectInfo="projectInfo" :show="fileModalVisible" @closeFileModal="closeFileModal"/>
              -->
            </footer-tool-bar>
          </a-col>
        </a-row>
      </a-layout>
    </a-spin>
  </div>
</template>

<script>
  import './style.less'
  import STable from '@/components/Table'
  import {
    deleteProjectLog,
    getOwnWorkLogs,
    initPage,
    ownAttendance,
    refreshPlanTree,
    saveWorkLogs,
    searchHouses,
    searchProjects
  } from '@/api/project'
  import FooterToolBar from '@/components/FooterToolbar'
  import ProjectInfo from '@/module/project/worklog/ProjectInfo'
  import STree from '@/components/PlanTree/Tree'
  import WorkLogInfo from '@/module/project/worklog/WorkLogInfo'
  import ProjectLogFile from './ProjectLogFile'
  import {mixin, mixinDevice} from '@/utils/mixin'

  const modalColumns = [
    {
      title: '序号',
      scopedSlots: { customRender: 'serial' },
      width: '3%'
    },
    {
      title: '常用',
      scopedSlots: { customRender: 'renderCheck' },
      width: '3%'
    },
    {
      title: '合同号',
      dataIndex: 'contractNo',
      width: '10%'
    },
    {
      title: '项目名称',
      dataIndex: 'projectName',
      width: '30%'
    },
    {
      title: '项目经理',
      dataIndex: 'projectManagerText',
      width: '5%'
    },
    {
      title: '归属部门',
      dataIndex: 'areaText',
      width: '10%'
    },
    {
      title: '归属类别',
      dataIndex: 'flagText',
      width: '5%'
    }
  ]
  const houseModalColumns = [
    {
      title: '序号',
      scopedSlots: { customRender: 'serial' },
      width: '8%'
    },
    {
      title: '常用',
      scopedSlots: { customRender: 'renderCheck' },
      width: '8%'
    },
    {
      title: '宿舍名称',
      dataIndex: 'name',
      width: '30%'
    },
    {
      title: '宿舍地址',
      dataIndex: 'address',
      width: '40%'
    },
    {
      title: '宿舍长',
      dataIndex: 'houseMasterText',
      width: '15%'
    }
  ]

  export default {
    name: 'ProjectWorklog',
    mixins: [mixin, mixinDevice],
    components: {
      ProjectLogFile,
      STable,
      STree,
      ProjectInfo,
      FooterToolBar,
      WorkLogInfo
    },
    data () {
      return {
        finished:false,
        isLoading: false,
        isHouseLoading: false,
        projectList: [],
        houseList: [],
        loading: false,
        showFooter: true,
        showUpload: false,
        openKeys: [],
        selectKey: [],
        projectInfo: {},
        workLogs: [],
        uploadTypes:[],
        formDisabled: false,
        noPlan: false,
        currentPage: 1,
        houseCurrentPage: 1,
        evection: 0 ,
        fileModalVisible: false,
        houseForm: this.$form.createForm(this),
        page: { pageNumber: 1, pageSize: 25, totalCount: 1 },
        // 查询参数
        queryParam: { 'context': '', pageSize: 25 },
        housePage: { pageNumber: 1, pageSize: 25, totalCount: 1 },
        houseQueryParam: { 'context': '', pageSize: 25 },
        modalProjectInfo: {},
        modalHouseInfo: {},
        houseInfo: { id: null, houseName: '', houseType: 1 },
        houseModalColumns,
        modalColumns,
        treeTitle: '项目计划',
        orgTree: [],
        time: [],
        modalSelectedRow: '',
        houseModalSelectedRow: '',
        visible: false,
        modalError: false,
        modalHouseError: false,
        colTitle: '',
        customStyle:
          'margin-bottom: 24px;border: 0;overflow: hidden',
        checkTime: '',
        collapse: true,
        userId: '',
        selectItem: { id: null, milepostName: '',range: null},
        init: true,
        initForm: {},
        initIndex: 0,
        spinning: true,
        roles:[],
        types:[],
        showHouseModal: false,
        checkStatus: 0
      }
    },
    computed: {
      treeHeight: function () {
        return (window.innerHeight - 230) + 'px'
      },
      formHeight: function () {
        return this.houseInfo.houseType === 2 ?(window.innerHeight - 230 - 100) + 'px' : (window.innerHeight - 230 - 60) + 'px'
      },
      modalHeight: function () {
        return (window.innerHeight - 190) + 'px'
      },
      tableHeight: function () {
        return window.innerHeight - 180 - 140
      }
    },

    mounted () {
      initPage().then(res => {
        const me = this
        if (res.code === 200) {
          const baseWorkLog = this.getBaseWorkLog()
          me.orgTree = res.body.planTree
          me.projectInfo = res.body.customerProject
          me.time = res.body.time
          me.openKeys = res.body.openKeys
          me.userId = res.body.userId
          me.noPlan = res.body.noPlan
          me.initForm = baseWorkLog
          if(me.projectInfo !== null && me.projectInfo !== undefined){
            if(me.projectInfo.projectManager !== null && me.projectInfo.projectManager !== undefined){
              me.showUpload = me.userId === me.projectInfo.projectManager
            }
          }
          if (res.body.time.length > 0) {
            me.checkTime = res.body.time[0].attendanceDate.substring(0, 10)
          }
          me.uploadTypes = res.body.fileTypes
          me.roles = res.body.roles
          me.types = res.body.types
          const query = { attendanceDate: me.checkTime }
          ownAttendance(query).then(res => {
            if (res.code === 200) {
              this.houseInfo = { id: res.body.rentId, houseName: res.body.rentName, houseType: res.body.stay }
              this.evection = res.body.evection
            }
          })
          if(me.customerProject !== null){
            if (me.noPlan) {
              me.selectKey = [-1]
              me.selectItem.milepostName = '计划外'
              me.selectItem.id = -1
              me.loadWorkLogs(0)
            } else {
              me.selectItem.milepostName = '请选择左侧项目计划'
              me.selectItem.id = null
              me.workLogs = me.workLogs.concat([baseWorkLog])
            }
          }
        }
        me.spinning = false
      })
    },

    methods: {
      getBaseWorkLog () {
        let range = null
        if(this.selectItem.id !== null){
          range = this.selectItem.range
        }
        return {
          id: null,
          attendanceId: null,
          milepostId: null,
          range: range,
          plan: 1,
          role: null,
          model: null,
          type: null,
          workLog: '',
          workload: null,
          workLogId: null,
          auditter: null,
          nextAuditter: null,
          auditDate: null,
          auditFlag: null,
          remark: null,
          auditType: 1,
          submitter: null,
          submitDate: null,
          refuse: null,
          result: null,
          attendanceDate: null,
          technumid: null,
          auditCount: 0,
          sourceType: 2,
          houseType: 1
        }
      },
      changeHouseTypeValue (e) {
        this.houseInfo.houseType = e.target.value
        if (e.target.value !== 2) {
          this.houseInfo.id =  null
          this.houseInfo.houseName = null
        }
      },
      onEvectionChange (e) {
        this.evection = e.target.checked ? 1:0
      },
      planChange (e) {
        this.checkStatus = e.target.value
        this.reloadPlanTree(e.target.value)
        this.selectKey = []
        this.selectItem.milepostName = '请选择左侧项目计划'
        this.selectItem.id = null
        this.formDisabled = false
        this.showFooter = true
        const baseWorkLog = this.getBaseWorkLog()
        this.workLogs = [baseWorkLog]
        this.initIndex = 0
        this.initForm = baseWorkLog
      },
      openHouseSearch () {
        this.showHouseModal = true
        this.modalHouseError = false
        this.housePage.pageNumber = 1
        this.houseQueryParam.context = ''
        this.houseQueryParam.pageNo = 1
        this.houseCurrentPage = 1
        this.houseList = []
        this.loadHouseList()
      },
      loadProjectList () {
        this.isLoading = true
        searchProjects(this.queryParam)
          .then(res => {
            if (res.code === 200) {
              this.page.pageNumber = res.body.pageNumber
              this.page.pageSize = res.body.pageSize
              this.page.totalCount = res.body.totalCount
              this.projectList = res.body.items
              this.currentPage = res.body.pageNumber
            }
            this.isLoading = false
          })
      },
      // jpa 分页从0开始  mybatis 分页从1开始
      loadHouseList () {
        this.isHouseLoading = true
        this.houseQueryParam.area = this.projectInfo.area
        searchHouses( this.houseQueryParam)
          .then(res => {
            if (res.code === 200) {
              this.housePage.pageNumber = res.body.pageNumber
              this.housePage.pageSize = res.body.pageSize
              this.housePage.totalCount = res.body.totalCount
              this.houseCurrentPage = res.body.pageNumber
              this.houseList = res.body.items
            }
            this.isHouseLoading = false
          })
      },
      onChange (current) {
        this.queryParam.pageNo = current
        this.loadProjectList();
      },
      onHouseChange (current) {
        this.houseQueryParam.pageNo = current
        this.loadHouseList()
      },

      deleteWorkLog (index) {
        const me = this
        this.$confirm({
          title: '是否确认删除该条日志?',
          onOk () {
            if (me.workLogs[index].id != null) {
              const param = { 'id': me.workLogs[index].id }
              deleteProjectLog(param).then(res => {
                if (res.code === 200) {
                  if (me.initIndex === index) {
                    me.initIndex = -1
                  } else if (me.initIndex > index) {
                    me.initIndex--
                  }
                  me.$message.success('删除成功')
                  me.workLogs.splice(index, 1)
                  me.reloadPlanTree(me.checkStatus)
                } else {
                  me.$message.error(res.msg)
                  me.loadWorkLogs(0)
                }
              })
            } else {
              if (me.initIndex === index) {
                me.initIndex = -1
              }
              me.workLogs.splice(index, 1)
            }
          },
          onCancel () {}
        })
      },

      // 树 叶子节点选中方法
      handleClick: function (e) {
        this.spinning = true
        if (this.initIndex === -1) {
          const baseWorkLog = this.getBaseWorkLog()
          this.initIndex = 0
          this.initForm = baseWorkLog
        } else {
          if (this.initForm.id === null && this.selectItem.finishFlag !== 1) {
            this.initForm = this.getLastForm()
          }
        }
        this.finished = e.item.value.logoff === 1 || e.item.value.finishFlag === 1
        this.selectKey = [e.key]
        this.selectItem = e.item.value
        this.selectItem.stage = e.item.stage

        let check = e.item.value.logoff === 1 || e.item.value.finishFlag === 1 ? 1 : 0
        this.loadWorkLogs(check,e.item.value)
      },
      // 树 父节点选中方法
      parentClick: function (item) {
        this.spinning = true
        if (this.initIndex === -1) {
          const baseWorkLog = this.getBaseWorkLog()
          this.initIndex = 0
          this.initForm = baseWorkLog
        } else {
          if (this.initForm.id === null && this.selectItem.finishFlag !== 1) {
            this.initForm = this.getLastForm()
          }
        }
        this.finished = item.logoff === 1 || item.finishFlag === 1
        this.selectKey = [item.id]
        this.selectItem = item
        this.selectItem.stage = item.stage

        let check = item.logoff === 1 || item.finishFlag === 1 ? 1 : 0
        this.loadWorkLogs(check,item)
      },
      // 树时间组件点击事件
      timeItemClick (record) {
        this.checkTime = record.attendanceDate.substring(0, 10)
        const query = { attendanceDate: this.checkTime }
        ownAttendance(query).then(res => {
          if (res.code === 200) {
            this.houseInfo = { id: res.body.rentId, houseName: res.body.rentName, houseType: res.body.stay }
            this.evection = res.body.evection
            this.houseForm.setFieldsValue({
              'houseType': res.body.stay, 'houseName': res.body.rentName
            })
          }
        })
        this.showFooter = record.submitDate === null || (record.submitDate != null && record.submitDate.substring(0, 10) === this.time[0].attendanceDate.substring(0, 10));
        this.reloadPlanTree(0)
        this.initIndex = 0
        const baseWorkLog = this.getBaseWorkLog()
        this.initForm = baseWorkLog
        if (this.selectItem.id === null) {
          this.workLogs = []
          this.selectItem.milepostName = '请选择左侧项目计划'
          this.selectItem.range = null
          this.workLogs = this.workLogs.concat([baseWorkLog])
          return
        }
        this.loadWorkLogs(this.selectItem.logoff)
      },
      // 全部项目弹窗
      showModal () {
        this.visible = true
        this.queryParam.context = ''
        this.modalError = false
        this.modalSelectedRow = ''
        this.page.pageNumber = 1
        this.queryParam.pageNo = 1
        this.projectList = []
        this.loadProjectList();
      },
      // 项目弹窗搜索方法
      onSearch (value) {
        this.queryParam.context = value.trim()
        this.queryParam.pageNo = 1
        this.loadProjectList();
      },
      onHousesSearch (value) {
        this.houseQueryParam.context = value.trim()
        this.houseQueryParam.pageNo = 1
        this.loadHouseList()
      },
      // 弹窗确定按钮
      handleOk (e) {
        if (this.modalSelectedRow === '') {
          this.modalError = true
          return
        }
        this.selectKey = []
        this.selectItem = {}
        this.workLogs = []
        this.visible = false
        const me = this
        me.spinning = true
        me.checkStatus = 0
        const param = { 'projectId': me.modalProjectInfo.projectId, 'attendanceDate': me.checkTime ,'part':0}
        refreshPlanTree(param).then(res => {
          if (res.code === 200) {
            me.formDisabled = false
            me.showFooter = true
            me.time = res.body.time
            me.orgTree = res.body.planTree
            me.openKeys = res.body.openKeys
            me.noPlan = res.body.noPlan
            me.initIndex = 0
            const baseWorkLog = this.getBaseWorkLog()
            me.initForm = baseWorkLog
            if (res.body.time.length > 0) {
              me.checkTime = res.body.time[0].attendanceDate.substring(0, 10)
            }
            if (me.noPlan) {
              me.selectKey = [-1]
              me.selectItem.milepostName = '计划外'
              me.selectItem.id = -1
              me.selectItem.range = null
              me.loadWorkLogs(0)
            } else {
              me.selectItem.milepostName = '请选择左侧项目计划'
              me.selectItem.id = null
              me.selectItem.range = null
              me.workLogs = me.workLogs.concat([baseWorkLog])
            }
          }
          me.spinning = false
        })
        me.projectInfo = me.modalProjectInfo
        me.showUpload = me.userId === me.projectInfo.projectManager
      },
      // 弹窗取消按钮
      handleCancel (e) {
        this.visible = false
      },
      handleHouseCancel (e) {
        this.showHouseModal = false
      },
      // 弹窗数据选中
      onModalClickRow (record) {
        const me = this
        return {
          on: {
            click: () => {
              me.modalSelectedRow = record.projectId
              me.modalError = false
              me.modalProjectInfo = record
            },
            dblclick: () => {
              me.modalSelectedRow = record.projectId
              me.modalProjectInfo = record
              me.handleOk()
            }
          }
        }
      },
      handleHouseOk () {
        if (this.houseModalSelectedRow === '') {
          this.modalHouseError = true
          return
        }
        this.houseInfo = { id: this.modalHouseInfo.id, houseName: this.modalHouseInfo.name, houseType: 2 }
        this.houseForm.resetFields('houseInfoName',[])
        this.showHouseModal = false
      },
      setModalCurrentRow (record, index) {
        let styleClassName = ''
        if (record.projectId === this.modalSelectedRow) {
          styleClassName = 'clickRowStyle'
        }
        return styleClassName
      },
      onHouseModalClickRow (record) {
        const me = this
        return {
          on: {
            click: () => {
              me.houseModalSelectedRow = record.id
              me.modalHouseError = false
              me.modalHouseInfo = record
            },
            dblclick: () => {
              me.houseModalSelectedRow = record.id
              me.modalHouseInfo = record
              me.handleHouseOk()
            }
          }
        }
      },
      setHouseModalCurrentRow (record, index) {
        let styleClassName = ''
        if (record.id === this.houseModalSelectedRow) {
          styleClassName = 'clickRowStyle'
        }
        return styleClassName
      },
      onErrorClose () {
        this.modalError = false
      },
      onHouseErrorClose () {
        this.modalHouseError = false
      },
      // flag  1 不可编辑  0 可编辑
      loadWorkLogs (flag,item) {
        this.workLogs = []
        const me = this
        if(this.projectInfo === null || this.projectInfo === undefined) return;
        const param = { 'projectId': this.projectInfo.projectId, 'milepostId': this.selectItem.id, 'attendanceDate': this.checkTime }
        getOwnWorkLogs(param).then(res => {
          if (res.code === 200) {
            const baseWorkLog = this.getBaseWorkLog()
            baseWorkLog.range = me.selectItem.range
            me.initForm.range = me.selectItem.range
            baseWorkLog.milepostId = me.selectItem.id
            me.initForm.milepostId = me.selectItem.id
            baseWorkLog.plan = me.selectItem.id === -1 ? 2 : 1
            me.initForm.plan = me.selectItem.id === -1 ? 2 : 1
            const checkItem = me.time.find(item => item.attendanceDate.substring(0, 10) === me.checkTime)
            if (flag === 1 || (checkItem.submitDate !== null && checkItem.submitDate !== undefined && checkItem.submitDate.substring(0,10) !== me.time[0].attendanceDate.substring(0,10))) {
              me.formDisabled = true
              me.showFooter = false
            } else {
              me.formDisabled = false
              me.showFooter = true
            }
            if (res.body.length === 0) {
              if (me.initForm.id === null && item !== undefined && item.finishFlag !== 1 && item.logoff !== 1) {
                this.initIndex = 0
                me.workLogs = me.workLogs.concat(me.initForm)
              } else {
                this.initIndex = 0
                me.workLogs = me.workLogs.concat([baseWorkLog])
              }
            } else {
              if (me.initForm.id === null && !me.formDisabled) {
                me.initIndex = res.body.length
                me.workLogs = res.body.concat(me.initForm)
                me.scrollToBottom()
              } else {
                me.workLogs = res.body
              }
            }
          }
          me.spinning = false
        })
      },
      getLastForm () {
        const { $refs: { formList } } = this
        if (formList.length === 0) {
          return
        }
        return formList[this.initIndex].form.getFieldsValue()
      },
      addForm () {
        if (this.selectItem.id === null) {
          this.selectItem.milepostName = '请选择左侧项目计划'
          return
        }
        const baseWorkLog = this.getBaseWorkLog()
        if (this.selectItem.id === -1) {
          baseWorkLog.milepostId = -1
          baseWorkLog.plan = 2
        }
        this.workLogs = this.workLogs.concat([baseWorkLog])
        this.scrollToBottom()
      },
      // 表单验证
      validate () {
        const { $refs: { formList } } = this
        if (formList.length === 0) {
          return
        }
        const projectLogs = []
        const houseType = this.houseForm.getFieldValue('houseType')
        let errorCount = 0
        this.houseForm.validateFields((err, values) => {
          if (err) {
            // eslint-disable-next-line no-console
            errorCount++
          }
        })
        if (errorCount > 0) {
          return
        }
        let i = 0
        formList.every(f => f.form.validateFields((err, values) => {
            if (!err) {
              if (values.plan === 2) {
                // this.selectItem.id = -1
                this.selectItem.milepostName = '计划外'
              } else {
                if (this.selectItem.id === null) {
                  this.selectItem.milepostName = '请选择左侧项目计划'
                  return false
                }
              }
              i++
              // eslint-disable-next-line no-console
            }
          })
        )

        if (i !== 0 && i === formList.length) {
          this.loading = true
          this.spinning = true
          formList.forEach(f => projectLogs.push(f.form.getFieldsValue()))
          projectLogs.forEach((value) => {
            value.milepostId = value.plan === 1 ? this.selectItem.id : -1
            value.projectId = this.projectInfo.projectId
            value.projectType = this.projectInfo.flag
            value.submitter = this.userId
            value.projectDept = this.projectInfo.area
            value.projectName = this.projectInfo.projectName
          })

          const param = {
            'projectId': this.projectInfo.projectId,
            'contractNo': this.projectInfo.contractNo,
            'attendanceDate': this.checkTime,
            'projectLogs': projectLogs,
            'projectName': this.projectInfo.projectName,
            'houseId': this.houseInfo.id,
            'houseType': houseType,
            'evection':this.evection
          }
          const me = this
          saveWorkLogs(param).then(res => {
            if (res.code === 200) {
              const me = this
              if(res.body.length > 0){
                me.initForm.id = res.body[res.body.length - 1].id
                me.reloadPlanTree(me.checkStatus)
                // 支持结算的日志不保存，防止支持结算日志未显示
                if (me.selectItem.id !== null) {
                  me.loadWorkLogs(0)
                } else {
                  me.workLogs = res.body
                }
              }
              me.$message.success('保存成功')
            }
            me.loading = false
            me.spinning = false
          })
        }
      },
      reloadPlanTree (part) {
        this.spinning = true
        const treeParam = {
          'projectId': this.projectInfo.projectId,
          'attendanceDate': this.checkTime,
          'part':part
        }
        const me = this
        refreshPlanTree(treeParam).then(res => {
          if (res.code === 200) {
            me.time = res.body.time
            me.orgTree = res.body.planTree
            me.noPlan = res.body.noPlan
            me.openKeys = res.body.openKeys
          }
          me.spinning = false
        })
      },
      scrollToBottom () {
        const labelNode = document.querySelector('#logForm')
        if (labelNode) {
          this.$nextTick(() => {
            labelNode.scrollTop = labelNode.scrollHeight
          })
        }
      },
      openFileModal () {
        /*if(this.selectItem.id === null){
          this.$message.error('请选择左侧阶段')
          return
        }
        if(this.selectItem.id === -1){
          return
        }*/
        this.fileModalVisible = true
        this.$refs.file.initPage()
      },
      closeFileModal () {
        this.fileModalVisible = false
      }
    }

  }
</script>
<style lang="less" scoped>

  .treeStyle {
    padding-top: 24px;
    background: white;
    overflow-x:hidden;
    overflow-y:scroll;
  }

  .form-style {
    overflow-x:hidden;
    overflow-y:scroll;
  }

  .project-check {
    float: right
  }

  .clickRowStyle {
    background-color: #00b4ed;
  }

  /deep/ .ant-card-body{
    padding: 24px 0 24px 24px;
    zoom: 1
  }

  /deep/ #rightPanel .ant-card-body{
    padding: 12px 0 0 24px;
  }

  /deep/ #rightPanel .ant-collapse-content > .ant-collapse-content-box{
    padding-bottom: 0;
  }

  /deep/ .ant-collapse .ant-collapse-item .ant-collapse-header .anticon {
    left: initial;
    right: 16px;
    padding-bottom: 10px;
  }

  /deep/ .ant-collapse > .ant-collapse-item > .ant-collapse-header{
    position: relative;
    padding: 0 0 12px 0;
    line-height: 22px;
    cursor: pointer;
    -webkit-transition: all 0.3s;
    transition: all 0.3s;
    font-size: 16px;
    font-weight: bold;
    color: rgba(0,0,0,.85);
  }

  .popover-wrapper {
    /deep/ .antd-pro-pages-forms-style-errorPopover .ant-popover-inner-content {
      min-width: 256px;
      max-height: 290px;
      padding: 0;
      overflow: auto;
    }
  }
  .antd-pro-pages-forms-style-errorIcon {
    user-select: none;
    margin-right: 24px;
    color: #f5222d;
    cursor: pointer;
    i {
      margin-right: 4px;
    }
  }
  .antd-pro-pages-forms-style-errorListItem {
    padding: 8px 16px;
    list-style: none;
    border-bottom: 1px solid #e8e8e8;
    cursor: pointer;
    transition: all .3s;

    &:hover {
      background: #e6f7ff;
    }
    .antd-pro-pages-forms-style-errorIcon {
      float: left;
      margin-top: 4px;
      margin-right: 12px;
      padding-bottom: 22px;
      color: #f5222d;
    }
    .antd-pro-pages-forms-style-errorField {
      margin-top: 2px;
      color: rgba(0,0,0,.45);
      font-size: 12px;
    }
  }
</style>
