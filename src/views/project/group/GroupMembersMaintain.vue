<template>
  <a-row>
    <a-col :span="9">
      <div :style="{height:treeHeight, overflow: 'hidden auto',background:'#f0f2f5' }">
        <div :style="{background:'#f0f2f5',height: divHeight + 'px'}">
          <a-card :bordered="true" :bodyStyle="{padding: '0 0 0 0',height: divHeight + 'px'}">
            <a-table
              :bordered="false"
              size="small"
              :loading="isProjectListLoading"
              :dataSource="leaderSelfProjectsList"
              :rowKey="(record) => record.contractNo"
              :customRow="onProjctClickRow"
              :rowClassName="setProjectCurrentRow"
              :pagination="false"
              :columns="projectColumns"
              :scroll="{ x: false, y: projectScrollHeight }"
              :style="{ background:'white', height: projectTableHeight + 'px' }">
            </a-table>
            <div style="text-align:center;margin: 5px 0 5px 0">
              <a-pagination
                size="small"
                @showSizeChange="onShowSizeChange"
                :pageSize.sync="pagination.pageSize"
                :current="pagination.current"
                :total="pagination.total"
                @change="handleProjectPageChange"
                :showTotal="total => `共 ${total} 条`"/>
            </div>
          </a-card>
        </div>
        <div :style="{background:'#f0f2f5',height: '268px',borderRight: '1px solid #e8e8e8',padding: '20px 0 0 0' }">
          <a-card :bordered="false" :bodyStyle="{padding: '10px 0 0 10px'}">
            <v-projectinfo :projectInfo="leaderSelfProjectInfo"/>
          </a-card>
        </div>
      </div>
    </a-col>
    <a-col :span="15">
      <a-layout>
        <a-layout-sider width="170px">
          <div class="treeStyle" :style="{height: treeHeight, borderRight: '1px solid #e8e8e8'}">
            <a-tree
              :replaceFields="replaceFields"
              :treeData="projectGroupTree"
              :selectedKeys="selectedKeys"
              :expandedKeys="expandedKeys"
              @expand="onExpand"
              @select="handleNodeClick"
              @rightClick="handleNodeRightClick">
              <template slot="custom" slot-scope="item">
                <a-tooltip
                  placement="right"
                  :title="!item.leaderKey ? '':item.groupName + ': ' + item.leaderName + ' (组长)'">
                  <template v-if="treeFilterNode.indexOf(item.groupId) > -1 && inputContent">
                    <span
                      v-if="item.membersNum"
                      style="color: #f50;">{{ item.groupName + '   (' + item.membersNum + '人)' }}</span>
                    <span v-else style="color: #f50;">{{ item.groupName }}</span>
                  </template>
                  <template v-else>
                    <span v-if="item.membersNum">{{ item.groupName + '   (' + item.membersNum + '人)' }}</span>
                    <span v-else>{{ item.groupName }}</span>
                  </template>
                </a-tooltip>
              </template>
            </a-tree>
            <div :style="{ position: 'absolute',left: '5px',bottom: '25px',color: '#f50'}">选中组右键可添加小组</div>
          </div>
        </a-layout-sider>
        <a-layout-content>
          <a-layout :style="{background: 'white', height: treeHeight}">
            <a-layout-header style="background:white;padding:0 0 0 20px">
              <a-row>
                <a-col>
                  <a-input-search
                    :disabled="noneProjects"
                    placeholder="请输入姓名（或拼音简码）"
                    :allowClear="true"
                    size="small"
                    style="width: 250px"
                    v-model="inputContent"
                    @search="doQueryGroupMembers(noneProjects, initPageNo)"
                    @pressEnter="doQueryGroupMembers(noneProjects, initPageNo)"/>
                  <span style="color: red;margin-left: 5px">输入姓名(或拼音简码)回车添加人员！</span>
                </a-col>
              </a-row>
            </a-layout-header>
            <a-layout-content style="background: white">
              <a-table
                ref="memberTable"
                size="small"
                :bordered="false"
                :loading="isLoading"
                :columns="groupMembersColumns"
                :dataSource="groupMembersList"
                :rowKey="(record) => record.detailKey"
                :pagination="false"
                :customRow="onClickRow"
                :rowClassName="setCurrentRow"
                :scroll="{ x: false, y: memberListScrollHeight }"
                :style="{background: 'white', margin: '0 20px 0', height: memberTableHeight + 'px'}">
                <template slot="rowIndex" slot-scope="text, record, index">
                  <span>
                    {{ (currentPage - 1) * pageSize + index + 1 }}
                  </span>
                </template>
                <template slot="largeDeptName" slot-scope="text, record">
                  <a-input
                    class="editBtnClass"
                    size="small"
                    placeholder="一级部门"
                    v-if="record.editable"
                    :disabled="true"
                    :value="text"/>
                  <template v-else>{{ text }}</template>
                </template>
                <template slot="deptName" slot-scope="text, record">
                  <a-input
                    class="editBtnClass"
                    size="small"
                    placeholder="二级部门"
                    v-if="record.editable"
                    :disabled="true"
                    :value="text"/>
                  <template v-else>{{ text }}</template>
                </template>
                <template slot="personName" slot-scope="text, record">
                  <template v-if="record.editable">
                    <v-personselect
                      :personName="text"
                      size="small"
                      style="width:80px"
                      :styleClass="record.error?'errorClass':'editBtnClass'"
                      :disabled="selectedRow != record.detailKey"
                      @setPerson="handlePersonChange">
                    </v-personselect>
                    <template v-if="!record.personId">
                      <a-popconfirm title="是否要删除此行？" @confirm="remove(record.detailKey)">
                        <a-button
                          icon="delete"
                          type="link"
                          size="small"
                          v-if="selectedRow === record.detailKey"
                          class="editBtnClass"></a-button>
                      </a-popconfirm>
                    </template>
                    <template v-else>
                      <a-button
                        icon="close"
                        class="editBtnClass"
                        type="link"
                        size="small"
                        v-if="(selectedRow === record.detailKey) && record.personId"
                        @click="cancel(record.detailKey)"></a-button>
                    </template>
                  </template>
                  <template v-else>
                    <span v-if="record.isValid == '1'" style="color: #f50;">
                      {{ record.personName }}
                    </span>
                    <span v-else>
                      {{ record.personName }}
                    </span>
                    <a-button
                      icon="edit"
                      type="link"
                      size="small"
                      class="editBtnClass"
                      @click="toggle(record.detailKey)"
                      v-if="editMembersShow && selectedRow === record.detailKey"></a-button>
                    <a-popconfirm title="是否要删除此行？" @confirm="remove(record.detailKey)">
                      <a-button
                        icon="delete"
                        type="link"
                        size="small"
                        class="editBtnClass"
                        v-if="editMembersShow && selectedRow === record.detailKey"></a-button>
                    </a-popconfirm>
                  </template>
                </template>
                <template slot="leader" slot-scope="text, record">
                  <a-checkbox :checked="record.leader === 1" @change="handleLeaderChange(record)" :disabled="selectedTreeNode.managerMaintain === 1"/>
                </template>
              </a-table>
              <div style="text-align:center;">
                <a-pagination
                  showQuickJumper
                  :defaultCurrent="1"
                  :pageSize.sync="pageSize"
                  :current="currentPage"
                  :total="total"
                  size="small"
                  @change="handleCurrentPageChange"
                  :showTotal="total => `共 ${total} 条`"/>
              </div>
            </a-layout-content>
          </a-layout>
          <footer-tool-bar :style="{width: '300px',borderTop: '0px', background: 'white'}" v-if="noneProjects">
            <a-button type="primary" :disabled="true">保存</a-button>
            <a-button
              style="width: 100px; margin-top: 16px; margin-bottom: 8px;margin-left: 20px"
              type="primary"
              :disabled="true">新增成员
            </a-button>
          </footer-tool-bar>
          <footer-tool-bar :style="{width: '300px',borderTop: '0px', background: 'white'}" v-else>
            <a-button type="primary" @click="doSaveGroupMembers" :loading="memberSaveLoading">保存</a-button>
            <a-button
              style="width: 100px; margin-top: 16px; margin-bottom: 8px;margin-left: 20px"
              type="primary"
              :disabled="newMemberDisabled"
              @click="newMember">新增成员
            </a-button>
          </footer-tool-bar>
        </a-layout-content>
      </a-layout>
    </a-col>
    <v-popup
      :visible="actionListshow"
      :widNum="150"
      :leftSite="leftSite"
      :topDistance="topDistance"
      @on-close="closeDialog">
      <div slot="main">
        <a-button icon="plus-circle" type="link" :disabled="btnDisabled1" @click="insertBefore">新增同级节点(上)</a-button><br />
        <a-button icon="plus-circle" type="link" :disabled="btnDisabled1" @click="insertAfter">新增同级节点(下)</a-button><br />
        <a-button icon="plus-circle" type="link" :disabled="btnDisabled2" @click="append">新增子节点</a-button><br />
        <a-button icon="plus-circle" type="link" :disabled="btnDisabled3" @click="doModifyNode">修改本节点</a-button><br />
        <a-button icon="plus-circle" type="link" :disabled="btnDisabled3" @click="doDeleteNode">删除本节点</a-button>
      </div>
    </v-popup>
    <a-modal v-model="editGroupShow" :footer="null" width="30%" :bodyStyle="{ 'padding-bottom': '2px' }" :maskClosable="false">
      <div style="margin-top: 20px">
        <a-form :form="groupsForm">
          <a-form-item label="组名" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
            <a-input
              @pressEnter="handleSubmit"
              placeholder="请输入组名"
              v-decorator="['groupName', { rules: [{ required: true, message: '组名不能为空!' }]}]"
            />
          </a-form-item>
          <a-form-item :wrapper-col="{ span: 23 }" style="text-align: right;margin-bottom: 10px">
            <a-button key="submit" type="primary" @click="handleSubmit" :loading="confirmLoading">保存</a-button>
            <a-button key="back" style="margin-left: 20px" @click="handleCancel">关闭</a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </a-row>
</template>

<script>
import '@/assets/style/style.less'
import popup from '@/module/project/group/Popup/popup'
import personselect from '@/module/person/PersonSelect/PersonSearchSelect'
import projectInfo from '@/module/project/group/ProjectInfo'
import FooterToolBar from '@/components/FooterToolbar'
import {
  doLoadLeaderSelfProjectGroupTree,
  doLoadLeaderSelfProjects,
  doQueryGroupMemebersList,
  doSaveProjectGroupMembers,
  doSaveProjectGroupNode,
  doDeleteProjectGroupNode,
  doQueryGroupMemebers
} from '@/api/projectGroup'

export default {
  name: 'MembersManage',
  components: {
    'v-popup': popup,
    'v-personselect': personselect,
    'v-projectinfo': projectInfo,
    FooterToolBar
  },
  data () {
    return {
      contractNo: '',
      treeFilterNode: [],
      selectedKeys: [],
      expandedKeys: [],
      selectedTreeNode: '',
      projectGroupTree: [],
      theWholeGroups: [],
      replaceFields: {
        key: 'groupId',
        title: 'groupName'
      },
      isProjectListLoading: false,
      isLoading: false,
      projectSelectedRow: '',
      selectedRow: '',
      selectedRowInfo: {},
      projectSelectedRowInfo: {},
      leaderSelfProjectInfo: {},
      leaderSelfProjectsList: [],
      groupMembersList: [],
      deleteIdList: [],
      needChangeLeader: [],
      pagination: {
        total: 1,
        current: 1,
        pageSize: 10
      },
      divHeight: window.innerHeight - 372,
      memberTableHeight: window.innerHeight - 270,
      memberListScrollHeight: 0,
      projectScrollHeight: 0,
      projectTableHeight: window.innerHeight - 410,
      projectColumns: [
        {
          title: '合同编号',
          dataIndex: 'contractNo',
          width: '15%'
        },
        {
          title: '项目名称',
          dataIndex: 'contractName',
          width: '37%'
        },
        {
          title: '项目组',
          dataIndex: 'leaderGroups',
          scopedSlots: { customRender: 'leaderGroups' },
          width: '20%'
        },
        {
          title: '人数',
          dataIndex: 'membersNumber',
          width: '13%'
        }
      ],
      groupMembersColumns: [
        {
          title: '',
          dataIndex: 'rowIndex',
          key: 'rowIndex',
          width: '8%',
          scopedSlots: { customRender: 'rowIndex' }
        },
        {
          title: '一级部门',
          dataIndex: 'largeDeptName',
          key: 'largeDeptName',
          width: '28%',
          scopedSlots: { customRender: 'largeDeptName' }
        },
        {
          title: '二级部门',
          dataIndex: 'deptName',
          key: 'deptName',
          width: '30%',
          scopedSlots: { customRender: 'deptName' }
        },
        {
          title: '姓名',
          dataIndex: 'personName',
          key: 'personName',
          width: '28%',
          scopedSlots: { customRender: 'personName' }
        },
        {
          title: '组长',
          key: 'leader',
          dataIndex: 'leader',
          width: '6%',
          scopedSlots: { customRender: 'leader' }
        }
      ],
      memebersName: undefined,
      editMembersShow: false,
      total: 1,
      currentPage: 1,
      pageSize: 50,
      flag: 0, // 修改树节点标志
      inputContent: '',
      actionListshow: false,
      leftSite: 0,
      topDistance: 0,
      btnDisabled1: false,
      btnDisabled2: false,
      btnDisabled3: false,
      editGroupShow: false,
      editGroupMemberShow: false,
      confirmLoading: false,
      modifyBtnVisible: true,
      modifyBtnDisabled: false,
      groupsForm: this.$form.createForm(this, { name: 'projectGroupForm' }),
      countNumber: 0,
      queryParam: {},
      repeatMembers: [],
      isModify: false,
      memberSaveLoading: false,
      newMemberDisabled: false,
      noneProjects: false,
      initPageNo: 1
    }
  },
  created () {
    this.getWidthAndHeight()
  },
  methods: {
    getWidthAndHeight () {
      this.projectScrollHeight = window.innerHeight - 470
      this.memberListScrollHeight = window.innerHeight - 380
    },
    loadProjectGroupTree (refreshFlag) {
      var params = { contractNo: this.contractNo }
      doLoadLeaderSelfProjectGroupTree(params).then((res) => {
        if (res.code === 200) {
          if (res.result != null || res.body !== undefined) {
            this.projectGroupTree = res.body
            this.currentPage = 1
            this.theWholeGroups = []
            this.getAllGroups(this.projectGroupTree)
            var groupIds = []
            this.theWholeGroups.forEach(item => {
              groupIds.push(item.groupId)
            })
            this.expandedKeys = groupIds
            if (!refreshFlag) {
              var selectKey = res.body[0].groupId
              this.selectedKeys = [selectKey]
              this.QueryData(selectKey)
              this.selectedTreeNode = res.body[0]
              this.newMemberDisabled = false
            } else {
              var targetGroup = this.theWholeGroups.find(item => item.groupId === this.selectedTreeNode.groupId)
              if (!targetGroup) {
                this.selectedTreeNode = this.projectGroupTree[0]
                this.selectedKeys = [this.selectedTreeNode.groupId]
                this.newMemberDisabled = false
              }
              this.QueryData(this.selectedTreeNode.groupId)
            }
          }
        } else {
          this.$message.error(res.msg)
        }
      }).catch((res) => {
        console.log(res)
      })
    },
    getAllGroups (arr) {
      arr.forEach(item => {
        this.theWholeGroups.push(item)
        if (item.children) {
          this.getAllGroups(item.children)
        }
      })
    },
    loadLeaderSelfProjects (switchPage, saveFlag) {
      var param = { pageNo: this.pagination.current, pageSize: this.pagination.pageSize }
      this.isProjectListLoading = true
      doLoadLeaderSelfProjects(param).then((res) => {
        if (res.code === 200) {
          if (res.body != null || res.body !== undefined) {
            this.leaderSelfProjectsList = res.body.items
            this.pagination.total = res.body.totalCount
            if (res.body.totalCount === 0) {
              this.noneProjects = true
              this.leaderSelfProjectInfo = {}
              this.projectGroupTree = []
              this.groupMembersList = []
              this.selectedTreeNode = ''
              this.contractNo = ''
              this.pageSize = 50
              this.currentPage = 1
              this.total = 0
            }
            if (this.leaderSelfProjectsList.length > 0) {
              if (!switchPage) {
                if (!this.projectSelectedRow) {
                  this.projectSelectedRow = this.leaderSelfProjectsList[0].contractNo
                  this.projectSelectedRowInfo = this.leaderSelfProjectsList[0]
                  this.leaderSelfProjectInfo = this.projectSelectedRowInfo
                  this.contractNo = this.leaderSelfProjectsList[0].contractNo
                } else {
                  var targetProject = this.leaderSelfProjectsList.find(item => item.contractNo === this.projectSelectedRow)
                  if (!targetProject) {
                    this.projectSelectedRow = this.leaderSelfProjectsList[0].contractNo
                    this.projectSelectedRowInfo = this.leaderSelfProjectsList[0]
                    this.leaderSelfProjectInfo = this.projectSelectedRowInfo
                    this.contractNo = this.leaderSelfProjectsList[0].contractNo
                  }
                }
              } else {
                this.projectSelectedRow = this.leaderSelfProjectsList[0].contractNo
                this.projectSelectedRowInfo = this.leaderSelfProjectsList[0]
                this.leaderSelfProjectInfo = this.projectSelectedRowInfo
                this.contractNo = this.leaderSelfProjectsList[0].contractNo
              }
              this.loadProjectGroupTree(saveFlag)
            }
          }
        } else {
          this.$message.error(res.msg)
        }
        this.isProjectListLoading = false
      }).catch((res) => {
        console.log(res)
      })
    },
    onExpand (expandedKeys) {
      this.expandedKeys = expandedKeys
    },
    // 树节点点击
    handleNodeClick (selectedKeys, info) {
      var me = this
      if (this.isModify) {
        if (me.selectedTreeNode.groupName) {
          this.$confirm({
            title: me.selectedTreeNode.groupName + '组员维护后未保存，是否继续？',
            onOk () {
              me.selectedTreeNode = info.node.dataRef
              var groupId = me.selectedTreeNode.groupId
              me.currentPage = 1
              me.QueryData(groupId)
              me.selectedKeys = selectedKeys
              me.isModify = false
              me.repeatMembers = []
              me.newMemberDisabled = false
            },
            onCancel () {
            }
          })
        } else {
          this.$confirm({
            title: '组员维护后未保存，是否继续？',
            onOk () {
              me.selectedTreeNode = info.node.dataRef
              var groupId = me.selectedTreeNode.groupId
              me.currentPage = 1
              me.QueryData(groupId)
              me.selectedKeys = selectedKeys
              me.isModify = false
              me.repeatMembers = []
              me.newMemberDisabled = false
            },
            onCancel () {
            }
          })
        }
        return
      }
      this.selectedTreeNode = info.node.dataRef
      var groupId = this.selectedTreeNode.groupId
      this.currentPage = 1
      this.QueryData(groupId)
      this.selectedKeys = selectedKeys
      this.isModify = false
      this.repeatMembers = []
      this.newMemberDisabled = false
    },
    handleNodeRightClick (object) {
      var event = object.event
      var item = object.node.dataRef
      var level = item.levelNo
      var groupId = item.groupId
      var parentGroup = this.theWholeGroups.find(group => group.groupId === item.parentId)

      this.selectedKeys = [groupId]
      this.selectedTreeNode = item
      if (level === 1) {
        this.btnDisabled1 = true
        this.btnDisabled2 = false
        this.btnDisabled3 = true
      } else if (level === 2) {
        if (!parentGroup) {
          this.btnDisabled1 = true
          this.btnDisabled2 = false
          this.btnDisabled3 = false
        } else {
          this.btnDisabled1 = false
          this.btnDisabled2 = false
          this.btnDisabled3 = false
        }
      } else {
        if (!parentGroup) {
          this.btnDisabled1 = true
          this.btnDisabled2 = true
          this.btnDisabled3 = false
        } else {
          this.btnDisabled1 = false
          this.btnDisabled2 = true
          this.btnDisabled3 = false
        }
      }
      this.leftSite = event.clientX + 50
      this.topDistance = event.clientY - 10
      this.actionListshow = true
    },
    closeDialog () {
      this.actionListshow = false
    },
    handleCancel () {
      this.groupsForm.resetFields()
      this.actionListshow = false
      this.editGroupShow = false
    },
    handleSubmit () {
      var groupId = this.selectedTreeNode.groupId
      var parentId = this.selectedTreeNode.parentId
      var sortNo = this.selectedTreeNode.sortNo
      // 包含groupName
      this.groupsForm.validateFields((err) => {
        if (err) {
        }
      })
      var groupForm = this.groupsForm.getFieldsValue()
      if (!groupForm.groupName) {
        return
      }
      this.confirmLoading = true
      groupForm.flag = this.flag
      groupForm.sortNo = sortNo
      groupForm.contractNo = this.selectedTreeNode.contractNo
      groupForm.parentId = parentId
      // 新增子节点
      if (this.flag === 3) {
        groupForm.parentId = groupId
      }// 修改本节点
      if (this.flag === 4) {
        groupForm.id = groupId
      }
      doSaveProjectGroupNode(groupForm).then((res) => {
        if (res.code === 200) {
          this.editGroupShow = false
          this.flag = 0
          this.loadProjectGroupTree()
          this.$message.success('保存成功！')
        } else {
          this.$message.error(res.msg)
        }
        this.confirmLoading = false
      }).catch((res) => {
        console.log(res)
      })
    },
    doQueryGroupMembers (noneProjects, initPageNo) {
      if (noneProjects) {
        return
      }
      var me = this
      if (initPageNo) {
        this.currentPage = 1
      }
      if (this.isModify) {
        this.$confirm({
          title: '组员维护后未保存，是否继续？',
          onOk () {
            var inputContent = me.inputContent
            if (!inputContent) {
              me.QueryData(me.selectedKeys[0])
              me.isModify = false
              return
            }
            me.treeFilterNode = []
            var params = {
              contractNo: me.contractNo,
              inputContent: inputContent,
              pageSize: me.pageSize,
              pageNo: me.currentPage
            }
            me.isLoading = true
            doQueryGroupMemebers(params).then((res) => {
              if (res.code === 200) {
                if (res.body != null || res.body !== undefined) {
                  me.total = res.body.members.totalCount
                  me.groupMembersList = res.body.members.items
                  me.getTreeFilterNode(me.groupMembersList)
                  me.selectedKeys = []
                  me.selectedTreeNode = ''
                  me.newMemberDisabled = true
                }
              } else {
                me.$message.error(res.msg)
              }
              me.isLoading = false
            }).catch((res) => {
              console.log(res)
            })
            me.isModify = false
          },
          onCancel () {
          }
        })
      } else {
        var inputContent = me.inputContent
        if (!inputContent) {
          if (!this.selectedKeys[0]) {
            this.selectedKeys = [this.projectGroupTree[0].groupId]
            this.selectedTreeNode = this.projectGroupTree[0]
            this.QueryData(this.selectedKeys[0])
            this.treeFilterNode = []
            this.newMemberDisabled = false
          }
          return
        }
        me.treeFilterNode = []
        var params = {
          contractNo: me.contractNo,
          inputContent: inputContent,
          pageSize: me.pageSize,
          pageNo: me.currentPage
        }
        me.isLoading = true
        doQueryGroupMemebers(params).then((res) => {
          if (res.code === 200) {
            if (res.body != null || res.body !== undefined) {
              me.total = res.body.members.totalCount
              me.groupMembersList = res.body.members.items
              me.getTreeFilterNode(me.groupMembersList)
              me.selectedKeys = []
              me.selectedTreeNode = ''
              me.newMemberDisabled = true
            }
          } else {
            me.$message.error(res.msg)
          }
          me.isLoading = false
        }).catch((res) => {
          console.log(res)
        })
      }
    },
    getTreeFilterNode (arry) {
      if (arry.length > 0) {
        arry.forEach(item => {
          this.treeFilterNode.push(item.groupId)
        })
      }
      var newUniqueArry = Array.from(new Set(this.treeFilterNode))
      newUniqueArry.forEach(groupId => {
        this.getExpandKeys(groupId)
      })
    },
    getExpandKeys (groupId) {
      if (!this.expandedKeys.indexOf(groupId) > -1) {
        for (let i = 0; i < this.theWholeGroups.length; i++) {
          if (groupId === this.theWholeGroups[i].groupId) {
            this.expandedKeys.push(groupId)
            groupId = this.theWholeGroups[i].parentId
            this.getExpandKeys(groupId)
            break
          }
        }
      }
    },
    doSaveGroupMembers () {
      if (!this.contractNo) {
        return
      }
      this.needChangeLeader = this.needChangeLeader.filter(function (value, index, self) {
        return self.indexOf(value) === index
      })
      var groupMembers = this.groupMembersList.filter(item => item.personId)
      var deleteMembers = this.deleteIdList
      var updateLeader = this.needChangeLeader.filter(item => item > 0)
      var params = {
        saveList: groupMembers,
        deleteList: deleteMembers,
        updateLeaderList: updateLeader,
        contractNo: this.contractNo
      }
      this.memberSaveLoading = true
      doSaveProjectGroupMembers(params).then((res) => {
        if (res.code === 200) {
          if (res.body.length > 0) {
            this.repeatMembers = res.body
            this.$message.error('组员已存在本组（或其他组），无法保存非组长组员！')
            const newData = [...this.groupMembersList]
            newData.forEach(item => {
              if (this.repeatMembers.indexOf(item.personId) > -1 && item.isModify) {
                item.editable = true
                item.error = true
                item._originalData = { ...item }
              }
            })
            this.groupMembersList = newData
          } else {
            this.loadLeaderSelfProjects(false, true)
            this.isModify = false
            this.repeatMembers = []
            this.$message.success('保存成功！')
          }
        } else {
          this.$message.error(res.msg)
        }
        this.memberSaveLoading = false
      }).catch((res) => {
        console.log(res)
      })
    },
    onClickRow (record, index) {
      return {
        on: {
          click: () => {
            this.selectedRow = record.detailKey
            this.selectedRowInfo = record
            if (record.maintainId) {
              this.editMembersShow = false
              this.modifyBtnVisible = false
              this.modifyBtnDisabled = true
            } else {
              this.editMembersShow = true
              this.modifyBtnVisible = true
              this.modifyBtnDisabled = false
            }
          }
        }
      }
    },
    onProjctClickRow (record, index) {
      return {
        on: {
          click: () => {
            var me = this
            if (this.isModify) {
              this.$confirm({
                title: '组员维护后未保存，是否继续？',
                onOk () {
                  me.projectSelectedRow = record.contractNo
                  me.projectSelectedRowInfo = record
                  me.leaderSelfProjectInfo = me.projectSelectedRowInfo
                  me.contractNo = record.contractNo
                  me.loadProjectGroupTree(false)
                  me.isModify = false
                },
                onCancel () {
                }
              })
            } else {
              this.projectSelectedRow = record.contractNo
              this.projectSelectedRowInfo = record
              this.leaderSelfProjectInfo = this.projectSelectedRowInfo
              this.contractNo = record.contractNo
              this.loadProjectGroupTree(false)
            }
          }
        }
      }
    },
    setCurrentRow (record, index) {
      var styleClassName = ''
      if (record.detailKey === this.selectedRow) {
        styleClassName = 'clickRowStyle hoverRowStyle'
      }
      return styleClassName
    },
    setProjectCurrentRow (record, index) {
      var styleClassName = ''
      if (record.contractNo === this.projectSelectedRow) {
        styleClassName = 'clickRowStyle hoverRowStyle'
      }
      return styleClassName
    },
    handlePersonChange (data) {
      // this.memebersName = data.personName
      this.setPersonData(data)
    },
    setPersonData (value) {
      var detailKey = this.selectedRow
      const newData = [...this.groupMembersList]
      const target = newData.find(item => detailKey === item.detailKey)
      if (target) {
        target['largeDeptName'] = value.largeDeptName
        target['deptName'] = value.deptName
        target['personId'] = value.personId
        target['personName'] = value.personName
        target['isValid'] = value.isValid
        target.editable = false
        target.isModify = true
        target.error = false
        this.groupMembersList = newData
        this.isModify = true
      }
    },
    handleProjectPageChange (pageNo, pageSize) {
      this.pagination.current = pageNo
      this.pagination.pageSize = pageSize
      this.loadLeaderSelfProjects(true)
    },
    onShowSizeChange (current, pageSize) {
      this.pagination.pageSize = pageSize
      this.pagination.current = 1
      this.loadLeaderSelfProjects()
    },
    handleCurrentPageChange (pageNumber) {
      var groupId = this.selectedTreeNode.groupId
      var me = this
      if (this.isModify) {
        this.$confirm({
          title: '当前页面修改后未保存,是否继续？',
          onOk () {
            me.currentPage = pageNumber
            if (groupId) {
              me.QueryData(groupId)
            } else {
              me.doQueryGroupMembers(false)
            }
            me.isModify = false
          },
          onCancel () {
          }
        })
      } else {
        this.currentPage = pageNumber
        if (groupId) {
          this.QueryData(groupId)
        } else {
          this.doQueryGroupMembers(false)
        }
      }
    },
    handleLeaderChange (record) {
      if (record.detailKey !== this.selectedRow) {
        this.selectedRow = record.detailKey
        this.selectedRowInfo = record
        this.editMembersShow = true
        this.modifyBtnVisible = true
        this.modifyBtnDisabled = false
      }
      const newData = [...this.groupMembersList]
      const newTarget = newData.filter(item => this.selectedRow === item.detailKey)[0]
      var me = this
      if (!newTarget.personId) {
        me.$message.warning('请先选择人员！')
        return
      }
      if (this.selectedRowInfo.isValid === '1') {
        this.$message.warning('该组员已离职，无法选择组长！')
        return
      }
      if (this.selectedRowInfo.leaderKey) {
        if (this.selectedRow === this.selectedRowInfo.leaderKey) {
          this.$confirm({
            title: '是否取消当前组长：' + me.selectedRowInfo.leaderName + '？',
            onOk () {
              if (newData.length > 0) {
                newData.forEach(item => {
                  if (item.groupId === me.selectedRowInfo.groupId) {
                    item.leader = 0
                    item.leaderId = ''
                    item.leaderKey = ''
                    item.leaderName = ''
                  }
                })
              }
              newTarget.isModify = true
              newTarget._originalData = { ...newTarget }
              me.groupMembersList = newData
              me.isModify = true
              me.$message.success('修改成功！')
            },
            onCancel () {
            }
          })
        } else {
          this.$confirm({
            title: me.selectedRowInfo.groupName + '当前组长为' + me.selectedRowInfo.leaderName + '，是否重新选择？',
            onOk () {
              const oldTarget = newData.filter(item => me.selectedRowInfo.leaderKey === item.detailKey)[0]
              if (!oldTarget) {
                me.needChangeLeader.push(me.selectedRowInfo.leaderKey)
              } else {
                oldTarget.isModify = true
              }
              if (newData.length > 0) {
                newData.forEach(item => {
                  if (me.selectedRowInfo.groupId === item.groupId) {
                    item.leader = 0
                    item.leaderId = newTarget.personId
                    item.leaderKey = newTarget.detailKey
                    item.leaderName = newTarget.personName
                  }
                })
              }
              if (newTarget) {
                newTarget.leader = 1
                newTarget.error = false
                newTarget.isModify = true
                newTarget._originalData = { ...newTarget }
              }
              me.groupMembersList = newData
              me.isModify = true
              me.$message.success('修改成功！')
            },
            onCancel () {
            }
          })
        }
      } else {
        me.groupMembersList.forEach(item => {
          item.leaderId = newTarget.personId
          item.leaderKey = newTarget.detailKey
          item.leaderName = newTarget.personName
        })
        newTarget.leader = 1
        newTarget.isModify = true
        newTarget.error = false
        newTarget._originalData = { ...newTarget }
        me.groupMembersList = newData
        me.isModify = true
        me.$message.success('选择成功！')
      }
    },
    QueryData (groupId) {
      this.isLoading = true
      this.groupMembersList = []
      var params = { groupId: groupId, pageSize: this.pageSize, pageNo: this.currentPage }
      doQueryGroupMemebersList(params).then((res) => {
        if (res.code === 200) {
          if (res.body != null || res.body !== undefined) {
            this.total = res.body.totalCount
            this.groupMembersList = res.body.items
            if (this.groupMembersList.length > 0) {
              this.selectedRow = ''
            }
            this.deleteIdList = []
            this.needChangeLeader = []
          }
        } else {
          this.$message.error(res.msg)
        }
        this.isLoading = false
      }).catch((res) => {
        console.log(res)
      })
    },
    // 前面增加节点
    insertBefore () {
      this.flag = 1
      this.groupsForm.resetFields()
      this.actionListshow = false
      this.editGroupShow = true
    },
    // 后面添加节点
    insertAfter () {
      this.flag = 2
      this.groupsForm.resetFields()
      this.actionListshow = false
      this.editGroupShow = true
    },
    // 增加子节点
    append () {
      this.flag = 3
      this.groupsForm.resetFields()
      this.actionListshow = false
      this.editGroupShow = true
    },
    doModifyNode () {
      this.flag = 4
      setTimeout(() => {
        this.groupsForm.setFieldsValue({ groupName: this.selectedTreeNode.groupName })
      }, 100)
      this.actionListshow = false
      this.editGroupShow = true
    },
    doDeleteNode () {
      if (this.selectedTreeNode.children.length > 0) {
        this.$message.warning('该节点有子节点，无法删除！')
        return
      }
      if (this.selectedTreeNode.haveMembers > 0) {
        this.$message.warning('该项目组已维护组员，无法删除！')
        return
      }
      var item = this.selectedTreeNode
      var param = { groupId: item.groupId }
      var me = this
      this.$confirm({
        title: '是否确认删除节点-' + item.groupName + '？',
        onOk () {
          doDeleteProjectGroupNode(param).then(res => {
            if (res.code === 200) {
              me.loadProjectGroupTree(me.contractNo)
              me.$message.success('删除成功！')
            } else {
              me.$message.error(res.msg)
            }
          }).catch((res) => {
            console.log(res)
          })
        },
        onCancel () {
        }
      })
    },
    newMember () {
      if (!this.selectedTreeNode.groupId) {
        this.$message.error('请先选择需要维护成员的项目组！')
        return
      }
      this.countNumber = this.countNumber - 1
      var leaderKey = ''
      var leaderId = ''
      var leaderName = ''
      if (this.groupMembersList.length > 0) {
        leaderKey = this.groupMembersList[0].leaderKey
        leaderId = this.groupMembersList[0].leaderId
        leaderName = this.groupMembersList[0].leaderName
      }
      this.groupMembersList.push({
        detailKey: this.countNumber,
        id: null,
        groupId: this.selectedTreeNode.groupId,
        groupName: this.selectedTreeNode.groupName,
        personId: '',
        largeDeptName: '',
        deptName: '',
        editable: true,
        isValid: '0',
        isNew: true,
        leader: 0,
        leaderKey: this.selectedTreeNode.leaderKey || leaderKey,
        leaderId: leaderId,
        leaderName: leaderName,
        maintainId: ''
      })
      this.selectedRow = this.countNumber
      this.memebersName = undefined
      this.isModify = true
      this.scrollToBottom()
    },
    toggle (detailKey) {
      const newData = [...this.groupMembersList]
      const target = newData.filter(item => detailKey === item.detailKey)[0]
      target.isModify = true
      target._originalData = { ...target }
      target.editable = true
      this.groupMembersList = newData
      this.memebersName = this.selectedRowInfo.personName
      this.isModify = true
    },
    cancel (detailKey) {
      const newData = [...this.groupMembersList]
      const target = newData.filter(item => detailKey === item.detailKey)[0]
      delete target.editable
      Object.keys(target).forEach(key => {
        target[key] = target._originalData[key]
      })
      delete target._originalData
      this.groupMembersList = newData
      this.isModify = true
    },
    remove (detailKey) {
      const target = this.groupMembersList.find(item => item.detailKey === detailKey)
      const newData = this.groupMembersList.filter(item => item.detailKey !== detailKey)
      if (target.leader === 1) {
        newData.forEach(item => {
          item.leaderId = ''
          item.leaderKey = ''
          item.leaderName = ''
        })
      }
      this.groupMembersList = newData
      if (detailKey > 0) {
        this.deleteIdList.push(detailKey)
      }
      this.isModify = true
    },
    scrollToBottom () {
      const table = this.$refs.memberTable.$el
      // 获取到具有 'scroll' 属性的这一层dom元素
      const tableBody = table.querySelector('.ant-table-body')
      if (tableBody) {
        this.$nextTick(() => {
          tableBody.scrollTop = tableBody.scrollHeight
        })
      }
    }
  },
  mounted () {
    this.loadLeaderSelfProjects(false, false)
  },
  computed: {
    treeHeight: function () {
      return (window.innerHeight - 90) + 'px'
    },
    tableHeight: function () {
      return (window.innerHeight - 280) + 'px'
    }
  },
  watch: {
    inputContent (val) {
      if (!val) {
        this.inputContent = ''
        this.treeFilterNode = []
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .btnStyle {
    margin-right: 10px;
  }

  .editBtnClass {
    margin-top: -2px;
    margin-bottom: -2px;
  }

  .errorClass {
    margin-top: -2px;
    margin-bottom: -2px;
    border: 1px solid red;
  }

  .treeStyle {
    overflow-x: hidden;
    overflow-y: hidden;
    background: white;
  }
</style>
