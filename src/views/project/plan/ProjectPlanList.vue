<template>
  <a-card
    :bordered="false"
    :bodyStyle="{
      height:cardHeight+'px',
      padding: '0px 10px'
    }">
    <a-input-search :pressEnter="onSearch" :allowClear="true" placeholder="项目名称" style="width: 600px;margin-bottom: 10px;margin-top:10px;" @search="onSearch" />
    <s-table
      ref="table"
      size="small"
      rowKey="contractNo"
      :columns="columns"
      :data="loadData"
      :showPagination="false"
      :customRow="onClickRow"
      :rowClassName="setCurrentRow"
      :bodyStyle="{
        minHeight:listScrollHeight+'px'
      }"
      :scroll="{ x: false, y: listScrollHeight }"
    >
      <span slot="serial" slot-scope="text, record, index" v-if="page.pageNumber === 0">
        {{ index + 1 }}
      </span>
      <span slot="serial" slot-scope="text, record, index" v-else>
        {{ (pageNo-1)*page.pageSize +index + 1 }}
      </span>
      <span slot="status" slot-scope="text">
        <a-badge :status="text | statusTypeFilter" :text="text | statusFilter" />
      </span>
      <span slot="modifyDate" slot-scope="text">
        {{ text == null ? text : text.substring(0,10) }}
      </span>
      <span slot="description" slot-scope="text">
        <ellipsis :length="4" tooltip>{{ text }}</ellipsis>
      </span>

      <span slot="action" slot-scope="text, record">
        <template>
          <a @click="handleEdit(record)" v-if="record.planFlag == 0">创建</a>
          <a @click="handleEdit(record)" v-if="record.planFlag == 1">修改</a>
          <a-divider type="vertical" />
          <a @click="membersManageShow(record)" >成员</a>
        </template>
      </span>
    </s-table>
    <footer-tool-bar>
      <a-pagination
        :total="page.totalCount"
        :pageSize.sync="page.pageSize"
        v-model="page.pageNumber"
        @change="onChange"
        style="margin-top: 10px"/>
    </footer-tool-bar>
    <project-standard-word :standardWordVisible="standardWordVisible" @on-change-visible="changeVisible" :projectInfo="projectInfo" :wordRecord="wordRecord" :idStr="wordIdStr" @setPlanWords="setPlanWords"></project-standard-word>
<!--    <a-modal-->
<!--      style="top: 30px"-->
<!--      v-model="standardWordVisible"-->
<!--      :width="1300"-->
<!--      :maskClosable="false"-->
<!--      :bodyStyle="{height: modalHeight}"-->
<!--      :destroyOnClose="true">-->
<!--      111111-->
<!--    </a-modal>-->
    <a-drawer
      ref="modalDrawer"
      title="计划维护"
      placement="right"
      :closable="false"
      :width="modalDrawerWidth"
      :bodyStyle="{padding: '12px 24px'}"
      @close="onClose"
      :visible="visible">
      <div>
        <detail-list :col="2">
          <detail-list-item term="合同编号" style="width:30%">{{ projectInfo.contractNo }}</detail-list-item>
          <detail-list-item term="项目名称" style="width:70%">{{ projectInfo.contractName }}</detail-list-item>
        </detail-list>
      </div>
      <a-modal
        style="top: 30px"
        v-model="showDuty"
        title="里程碑完成情况维护"
        :width="1300"
        :maskClosable="false"
        :closable="false"
        :keyboard="false"
        :bodyStyle="{height: modalHeight}"
        :destroyOnClose="true">
        <duty-milepost :DutyMilepostData="DutyMilepostData" :selectedMilepostDutyName="selectedMilepostDutyName"></duty-milepost>
        <template slot="footer">
          <a-alert
            v-if="modalError"
            closable
            type="error"
            style="margin-bottom: 10px;max-width: 80%;text-align: left;float:left"
            showIcon
            :message="'本里程碑要求的文档未全部提交，如（'+documentNameNeedUpLoad+'）'"
            @close="onErrorClose"/>
          <a-button key="submitWord" type="primary" @click="openFileModal">
            提交文档
          </a-button>
          <a-button key="submit" type="primary" @click="handleOkDuty">
            确定
          </a-button>
          <a-button key="back" @click="handleCancelDuty">关闭</a-button>
          <project-log-file ref="file" :dutyMilepostId="selectedMilepostDutyId" :planFlag="true" :modalHeight="modalHeight" :tableHeight="tableHeight" :uploadTypes="uploadTypes" :selectItem="selectItem" :projectInfo="projectInfo" :show="fileModalVisible" @closeFileModal="closeFileModal"/>
        </template>
      </a-modal>
      <a-table
        ref="treeTable"
        rowKey="treeId"
        size="default"
        :border="false"
        :loading="planTreeLoading"
        :columns="planColumns"
        :dataSource="planModel"
        :defaultExpandAll="true"
        :expandedRowKeys="expandedRowKeys"
        :pagination="false"
        :row-class-name="status_change"
        :scroll="{ x: 1110, y: scrollHeight }"
        @expand="expand">
        <template slot="milepostName" slot-scope="text, record">
          <editable-cell :style="{fontWeight:record.milepostLevel == 1 ? 'bold' : ''}" :text="text" @change="onCellChange(record, 'milepostName',planModel , $event)" :record="record"/>
          <!--          <a-input v-if="record.editable" :value="text"></a-input>-->
          <!--          <a-icon type="plus-circle" @click="handleAdd(record)" style="position: absolute;right: 40px;top: 20px;"/>-->
          <!--          <a-icon type="minus-circle" @click="handleDelete(record)" style="position: absolute;right: 20px;top: 20px;"/>-->
          <a-icon type="plus-circle" theme="twoTone" twoToneColor="#52c41a" v-if="record.milepostLevel < 5 && record.logoff === 0 && record.finishFlag !== 1" @click="handleAdd(record,planModel)"/>
          <!--          {{ ' ' }}-->
          {{ '\xa0\xa0\xa0' }}
          <a-icon type="minus-circle" theme="twoTone" twoToneColor="#ff0000" v-if="record.milepostLevel !== 1 && record.logoff === 0 && record.finishFlag !== 1" @click="cancelOrDelete(record, planModel)"/>
        </template>
        <template slot="milepostDutyId" slot-scope="text, record">
<!--          <a-checkbox v-show="record.milepostLevel == 2" :disabled="record.logoff == 1" :checked="record.milepostFlag === 1" @change="onCellChange(record, 'milepostFlag',planModel , $event)"/>-->
          <a-select
            v-show="record.milepostLevel == 2"
            :disabled="record.logoff == 1 || record.finishFlag == 1"
            v-model="record.milepostDutyId"
            show-search
            placeholder="请选择里程碑"
            option-filter-prop="children"
            :filter-option="filterOption"
            style="width:150px"
            size="small"
            :dropdownMatchSelectWidth="false"
            option-label-prop="label"
            @change="onCellChange(record, 'milepostDutyId',planModel , $event)">
            <a-select-option :label="item.name"  v-for="item in milepostDutyList" :key="item.id" :value="item.id" :title="item.name">
              <div style="white-space:normal;width:250px">
                {{ item.name }}
              </div>
            </a-select-option>
          </a-select>
        </template>
        <template slot="finishFlag" slot-scope="text, record">
          <a-checkbox :disabled="record.logoff == 1" :checked="record.finishFlag === 1" @change="onCellChange(record, 'finishFlag',planModel , $event)"/>
        </template>
        <template slot="range" slot-scope="text, record">
          <a-radio-group v-model="text" @change="onCellChange(record, 'range', planModel , $event.target.value)">
            <a-radio :disabled="record.logoff == 1 || record.finishFlag === 1" :value="1">内</a-radio>
            <a-radio :disabled="record.logoff == 1 || record.finishFlag === 1" :value="2">外</a-radio>
          </a-radio-group>
        </template>
        <template slot="finishDate" slot-scope="text, record">
          <a-date-picker style="width: 120px" :disabled="record.logoff == 1 || record.finishFlag === 1" :value="text ? moment(text, 'YYYY-MM-DD') : null" @change="onCellChange(record, 'finishDate',planModel , $event)"/>
        </template>
        <template slot="actualFinishDate" slot-scope="text, record">
          <a-date-picker v-if="record.milepostLevel === 2" style="width: 120px"
            :disabled="record.logoff == 1 || (record.milepostFlag !== 1 && record.milepostLevel == 2) || record.finishFlag === 1"
            :value="text ? moment(text, 'YYYY-MM-DD') : null"
            :open="false"
            :disabledDate="disabledDate"
            @change="onCellChange(record, 'actualFinishDate',planModel , $event)"
            @openChange="openDutyMilepost(record,$event)"
          />
          <a-date-picker v-else style="width: 120px"
                         :disabled="record.logoff == 1 || (record.milepostFlag !== 1 && record.milepostLevel == 2) || record.finishFlag === 1"
                         :value="text ? moment(text, 'YYYY-MM-DD') : null"
                         :disabledDate="disabledDate"
                         @change="onCellChange(record, 'actualFinishDate',planModel , $event)"
                         @openChange="openDutyMilepost(record,$event)"
          />
        </template>
        <template slot="words" slot-scope="text, record">
          <div v-if="record.milepostFlag === 1" class="wordCount" :disabled="record.logoff == 1" @click="showStandardWordModal(text,record)">{{ text == null ?  0 : text.split(",").length }}</div>
        </template>
      </a-table>
      <big-img v-if="showImg" @clickit="viewImg" :imgSrc="imgSrc"></big-img>
      <footer-tool-bar :style="{width:modalDrawerWidth+'px'}" v-if="visible">
        <template slot="content">
          <span style="float:left;color: #f5222d">项目计划样例：</span>
          <div style="float:left;height:50px;width:100px">
            <img :src="imgSrc" style="width: 100%" @click="clickImg($event)"/>
          </div>
        </template>
        <a-button type="primary" style="margin-right: 25px" @click="handleSubmit" :loading="loading">保存</a-button>
        <a-button key="back" @click="onClose">关闭</a-button>
      </footer-tool-bar>
    </a-drawer>
    <a-drawer
      :wrapStyle="{overflow: 'hidden'}"
      ref="memberModalDrawer"
      title="成员管理"
      placement="right"
      :closable="false"
      :width="900"
      @close="onMemberClose"
      :visible="memberVisible"
      :bodyStyle="{ padding: '0px 0px 24px 10px' }">
      <a-row>
        <a-col :span="7">
          <div class="treeStyle" :style="{ height: treeHeight, borderRight: '1px solid #e8e8e8' }">
            <a-tree
              ref="groupTree"
              :replaceFields="replaceFields"
              :treeData="projectGroupTree"
              :selectedKeys="selectedKeys"
              :expandedKeys="expandedKeys"
              @expand="onExpand"
              @select="handleNodeClick"
              @rightClick="handleNodeRightClick">
              <template slot="custom" slot-scope="item">
                <a-tooltip placement="right" :title="!item.leaderKey ? '':item.groupName + ': ' + item.leaderName + ' (组长)'">
                  <template v-if="treeFilterNode.indexOf(item.groupId) > -1 && inputContent">
                    <span v-if="item.membersNum" style="color: #f50;">{{ item.groupName + '   (' + item.membersNum + '人)' }}</span>
                    <span v-else style="color: #f50;">{{ item.groupName }}</span>
                  </template>
                  <template v-else>
                    <span v-if="item.membersNum">{{ item.groupName + '   (' + item.membersNum + '人)' }}</span>
                    <span v-else>{{ item.groupName }}</span>
                  </template>
                </a-tooltip>
              </template>
            </a-tree>
            <div :style="{ position: 'absolute',bottom: '20px',color: '#f50'}">选中组右键可添加小组</div>
          </div>
        </a-col>
        <a-col :span="17" style="margin-bottom: 50px">
          <a-layout :style="{ background: 'white' }">
            <a-layout-header style="background:white;padding:0 0 0 20px">
              <a-row>
                <a-col>
                  <a-input-search
                    placeholder="请输入姓名（或拼音简码）"
                    :allowClear="true"
                    size="small"
                    style="width: 250px"
                    v-model="inputContent"
                    @search="doQueryGroupMembers(initPageNo)"
                    @pressEnter="doQueryGroupMembers(initPageNo)"/>
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
                :customRow="onMemberClickRow"
                :rowClassName="setMemberCurrentRow"
                :scroll="{ x: false, y: memberListScrollHeight }"
                :style="{ background: 'white', margin: '0 20px 0', height: memberTableHeight + 'px' }">
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
                    :disabled="true"
                    v-if="record.editable"
                    :value="text"/>
                  <template v-else>{{ text }}</template>
                </template>
                <template slot="deptName" slot-scope="text, record">
                  <a-input
                    class="editBtnClass"
                    size="small"
                    placeholder="二级部门"
                    :disabled="true"
                    v-if="record.editable"
                    :value="text"/>
                  <template v-else>{{ text }}</template>
                </template>
                <template slot="personName" slot-scope="text, record">
                  <template v-if="record.editable">
                    <v-personselect
                      :personName="text"
                      size="small"
                      style="width:100px"
                      :styleClass="record.error?'errorClass':'editBtnClass'"
                      :disabled="memberSelectedRow != record.detailKey"
                      @setPerson="handlePersonChange">
                    </v-personselect>
                    <template v-if="!record.personId">
                      <a-popconfirm title="是否要删除此行？" @confirm="remove(record.detailKey)">
                        <a-button
                          icon="delete"
                          type="link"
                          size="small"
                          v-if="memberSelectedRow === record.detailKey"
                          class="editBtnClass"></a-button>
                      </a-popconfirm>
                    </template>
                    <template v-else>
                      <a-button
                        icon="close"
                        class="editBtnClass"
                        type="link"
                        size="small"
                        v-if="memberSelectedRow === record.detailKey"
                        @click="cancel(record.detailKey)"></a-button>
                    </template>
                  </template>
                  <template v-else>
                    <span v-if="record.isValid === '1'" style="color: #f50;">
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
                      v-if="editMembersShow && memberSelectedRow === record.detailKey"></a-button>
                    <a-popconfirm title="是否要删除此行？" @confirm="remove(record.detailKey)">
                      <a-button
                        icon="delete"
                        type="link"
                        size="small"
                        class="editBtnClass"
                        v-if="editMembersShow && memberSelectedRow === record.detailKey"></a-button>
                    </a-popconfirm>
                  </template>
                </template>
                <template slot="leader" slot-scope="text, record">
                  <a-checkbox :checked="record.leader === 1" @change="handleLeaderChange(record)"/>
                </template>
              </a-table>
            </a-layout-content>
            <div style="text-align:center;">
              <a-pagination
                showQuickJumper
                :pageSize.sync="pageSize"
                :current="currentPage"
                :total="total"
                size="small"
                @change="handleCurrentPageChange"
                :showTotal="total => `共 ${total} 条`"/>
            </div>
          </a-layout>
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
              <a-button icon="plus-circle" type="link" :disabled="btnDisabled1" @click="doModifyNode">修改本节点</a-button><br />
              <a-button icon="plus-circle" type="link" :disabled="btnDisabled1" @click="doDeleteNode">删除本节点</a-button>
            </div>
          </v-popup>
          <a-modal v-model="editGroupShow" :footer="null" width="30%" :bodyStyle="{ 'padding-bottom': '2px' }" :maskClosable="false">
            <div style="margin-top: 20px">
              <a-form :form="groupsForm">
                <a-form-item label="组名" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
                  <a-input
                    @pressEnter="handleSubmitMember"
                    placeholder="请输入组名"
                    v-decorator="['groupName', { rules: [{ required: true, message: '组名不能为空!' }], validateTrigger: 'blur' }]"
                  />
                </a-form-item>
                <a-form-item :wrapper-col="{ span: 23 }" style="text-align: right;margin-bottom: 10px">
                  <a-button key="submit" type="primary" @click="handleSubmitMember" :loading="groupConfirmLoading">保存</a-button>
                  <a-button key="back" style="margin-left: 20px" @click="handleCancel">关闭</a-button>
                </a-form-item>
              </a-form>
            </div>
          </a-modal>
        </a-col>
      </a-row>
      <div
        :style="{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: '70%',
          borderTop: '0px solid #e9e9e9',
          padding: '9px 16px',
          background: '#fff',
          textAlign: 'right',
        }"
      >
        <a-button type="primary" @click="doSaveGroupMembers" :loading="memberSaveLoading" style="margin-right: 20px">保存</a-button>
        <a-button type="primary" :disabled="newMemberDisabled" @click="newMember">新增成员</a-button>
        <a-button key="back" @click="onMemberClose " style="margin-left: 20px">关闭</a-button>
      </div>
    </a-drawer>
  </a-card>
</template>

<script>
import '@/assets/style/style.less'
import moment from 'moment'
import { STable, Ellipsis, EditableCell } from '@/components'
import FooterToolBar from '@/components/FooterToolbar'
import DutyMilepost from './DutyMilepostList'
import {
  findPlanDetailByPlanId,
  saveAllProjectPlanDetail,
  planHaveWorkLog,
  getProjectHavePlanList,
  doLoadProjectGroupTree,
  doQueryGroupMemebersList,
  doSaveProjectGroupMembers,
  doSaveProjectGroupNode,
  doDeleteProjectGroupNode,
  doQueryGroupMemebers,
  getDutyMilepostList,
  getMilepostWordNums,
  getFileTypes} from '@/api/projectPlan'
import { mixin, mixinDevice } from '@/utils/mixin'
import DetailList from '@/components/tools/DetailList'
import popup from '@/module/project/group/Popup/popup'
import personselect from '@/module/person/PersonSelect/PersonSearchSelect'
import ProjectStandardWord from '@/module/project/plan/ProjectStandardWord'
import BigImg from '@/module/project/plan/BigImg'
import ProjectLogFile from '../worklog/ProjectLogFile'

const DetailListItem = DetailList.Item

const statusMap = {
  0: {
    status: 'default',
    text: '未创建'
  },
  1: {
    status: 'success',
    text: '已创建'
  }
}

export default {
  name: 'ProjectPlanList',
  mixins: [mixin, mixinDevice],
  components: {
    DutyMilepost,
    STable,
    Ellipsis,
    EditableCell,
    FooterToolBar,
    DetailList,
    DetailListItem,
    ProjectStandardWord,
    BigImg,
    'v-popup': popup,
    'v-personselect': personselect,
    ProjectLogFile
  },
  data () {
    return {
      documentNameNeedUpLoad:'',
      modalError:false,
      showDuty:false,
      showImg:false,
      imgSrc: require('../../../assets/examplePlan.png'),
      wordIdStr:'',//标准文档id的字符串
      wordRecord:{},
      pageNo: 1,
      treeIndex: 0,
      pageSizeOptions: ['10', '25', '50', '75', '100'],
      page: { pageNumber: 1, pageSize: 10, totalCount: 1 },
      planMilePostIdList: [],
      planId: null,
      modalDrawerWidth: window.innerWidth * 0.9,
      // tableHeight: window.innerHeight - 100,
      memberTableHeight: window.innerHeight - 210,
      listScrollHeight: 0,
      cardHeight: 0,
      scrollHeight: 0,
      loading: false,
      visible: false,
      memberVisible: false,
      editGroupShow: false,
      mdl: {},
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: { 'context': '', pageSize: 25 },
      // 表头
      columns: [
        {
          title: '',
          width: '3%',
          scopedSlots: { customRender: 'serial' }
        },
        {
          title: '合同编号',
          width: '10%',
          dataIndex: 'contractNo'
        },
        {
          title: '工程区域',
          width: '8%',
          dataIndex: 'areaText'
        },
        {
          title: '项目名称',
          width: '30%',
          dataIndex: 'contractName'
        },
        {
          title: '项目计划',
          width: '10%',
          dataIndex: 'planFlag',
          scopedSlots: { customRender: 'status' }
        },
        {
          title: '修改日期',
          width: '10%',
          dataIndex: 'modifyDate',
          sorter: true,
          scopedSlots: { customRender: 'modifyDate' }
        },
        {
          title: '成员数量',
          width: '8%',
          dataIndex: 'memberNum'
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: '10%',
          // fixed: 'right',
          scopedSlots: { customRender: 'action' }
        }
      ],
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        return getProjectHavePlanList(Object.assign(parameter, this.queryParam))
          .then(res => {
            if (res.code === 200) {
              this.page.pageNumber = res.body.pageNumber + 1
              this.pageNo = res.body.pageNumber + 1
              this.page.pageSize = res.body.pageSize
              this.page.totalCount = res.body.totalCount
              return res.body
            }
          })
      },
      selectedRowKeys: [],
      selectedRows: [],
      // 当前行
      selectedRow: '',
      selectedRowInfo: '',
      deleteIds: [],
      initTemplate: [], // 初始化计划模板
      saveData: [],
      expandedRowKeys: [],
      planModel: null,
      planTreeLoading: false,
      treeChangeFlag: false,
      readOnly: false,
      selectedMilepostDutyName:'',
      selectedMilepostDutyId:null,
      selectedContractno:'',
      selectedProjectId:'',
      milepostDutyList:[
        // {id:1,name:'里程碑测'},
        // {id:2,name:'启动里程碑'},
        // {id:3,name:'阶段里程碑'},
        // {id:4,name:'结束里程碑'},
      ],
      planColumns: [
        {
          title: '项目计划',
          width: 600,
          dataIndex: 'milepostName',
          fixed:true,
          scopedSlots: { customRender: 'milepostName' }
        },
        {
          title: '里程碑设置',
          width: 150,
          dataIndex: 'milepostDutyId',
          scopedSlots: { customRender: 'milepostDutyId' }
        },
        {
          title: '合同范围',
          width: 120,
          dataIndex: 'range',
          scopedSlots: { customRender: 'range' }
        },
        {
          title: '计划完成日期',
          width: 120,
          dataIndex: 'finishDate',
          scopedSlots: { customRender: 'finishDate' }
        },
        // {
        //   title: '完成',
        //   width: 50,
        //   dataIndex: 'finishFlag',
        //   scopedSlots: { customRender: 'finishFlag' }
        // },
        {
          title: '实际完成日期',
          width: 120,
          dataIndex: 'actualFinishDate',
          scopedSlots: { customRender: 'actualFinishDate' }
        },
        // {
        //   title: '需上传文档',
        //   dataIndex: 'words',
        //   scopedSlots: { customRender: 'words' }
        // }
      ],
      standardWordVisible:false,//是否显示标准文档列表
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 }
      },
      formWidth: 640,
      confirmLoading: false,
      projectInfo: {
        contractno: '',
        projectName: '',
        contractId:''
      },
      form: this.$form.createForm(this),
      memberListScrollHeight: 0,
      treeFilterNode: [],
      selectedKeys: [],
      expandedKeys: [],
      selectedTreeNode: '',
      projectGroupTree: [],
      theWholeGroups: [],
      contractNo: '',
      replaceFields: {
        key: 'groupId',
        title: 'groupName'
      },
      isLoading: false,
      memberSelectedRow: '',
      memberSelectedRowInfo: {},
      groupMembersList: [],
      deleteIdList: [],
      needChangeLeader: [],
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
          width: '25%',
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
          width: '27%',
          scopedSlots: { customRender: 'personName' }
        },
        {
          title: '组长',
          key: 'leader',
          dataIndex: 'leader',
          width: '10%',
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
      editGroupMemberShow: false,
      groupConfirmLoading: false,
      modifyBtnVisible: true,
      modifyBtnDisabled: false,
      groupsForm: this.$form.createForm(this, { name: 'projectGroupForm' }),
      countNumber: 0,
      repeatMembers: [],
      isModify: false,
      memberSaveLoading: false,
      newMemberDisabled: false,
      maintainId: '',
      initPageNo: 1,
      DutyMilepostData:[],
      fileModalVisible:false,
      uploadTypes:[],
      selectItem:{}
    }
  },
  filters: {
    statusFilter (type) {
      return statusMap[type].text
    },
    statusTypeFilter (type) {
      return statusMap[type].status
    }
  },
  created () {
    this.tableOption()
    this.getWidthAndHeight()
  },
  methods: {
    disabledDate (current) {
        return  current > new Date()
    },
    onErrorClose () {
      this.modalError = false
    },
    initDutyMilepostData (planModel, DutyMilepostData ,milepostDutyId) { // 初始化实际完成日期打开的里程碑列表
      var len = planModel.length
      for (var i = 0; i < len; i++) {
        var item = planModel[i]
        if(item.milepostDutyId === milepostDutyId){
          DutyMilepostData.push(item)
        }
        if (item.children && item.children.length !== 0) {
          this.initDutyMilepostData(item.children, DutyMilepostData,milepostDutyId)
        }
      }
      this.DutyMilepostData = DutyMilepostData
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
    },
    // 弹窗确定按钮
    handleOkDuty: function (e) {
      this.modalError = false
      this.documentNameNeedUpLoad = ''
      const parameter = {
        contractNo: this.selectedContractno,
        projectId:this.selectedProjectId,
        milepostId: this.selectedMilepostDutyId,
      }
      let flag = true;
      let documentName = ''
      for(var data of this.DutyMilepostData){ //当里程碑所属阶段没有全部完成，不判断文档是否上传完全
        if(!data.selected){
          this.showDuty = false
          this.modalError = false
          return
        }
      }
      getMilepostWordNums(parameter)
        .then(res => {
          if (res.code === 200) {
            for (const data of res.body) {
              let wordsNumber = data.wordsNumber0
              let numbers = wordsNumber.split(",")[0]
              let checkFlag = wordsNumber.split(",")[2]
              if(parseInt(checkFlag) === 1 && parseInt(numbers) === 0){
                flag = false;
                documentName += data.documentName + '、';
              }
            }
            if(flag){
              this.showDuty = false
              this.modalError = false
            }else{
              this.modalError = true
              if(documentName.length > 30){
                this.documentNameNeedUpLoad = documentName.substring(0,30)+'...'
              }else{
                this.documentNameNeedUpLoad = documentName.substring(0,documentName.length-1)
              }

              // this.$message.error(documentName+"需要至少提交一个文档！")
            }
          }
        })
    },
    // 弹窗取消按钮
    handleCancelDuty (e) {
      this.showDuty = false
      this.modalError = false
      for(const data of this.DutyMilepostData){
        if(data.finishFlag !== 1){
          data.actualFinishDate = null
          data.selected = false
        }
      }
    },
    openDutyMilepost(record,status){
      if(status && record.milepostLevel === 2){
        this.showDuty = true
        for(const data of this.milepostDutyList){
          if(data.id === record.milepostDutyId){
            this.selectedMilepostDutyName = data.name
            this.selectedMilepostDutyId = record.milepostDutyId
          }
        }
        this.initDutyMilepostData (this.planModel, [] ,record.milepostDutyId)
        getFileTypes()
          .then(res => {
            if (res.code === 200) {
              this.uploadTypes = res.body
            }
          })
      }else{
        this.showDuty = false
      }
    },
    filterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
    // handleMilepostChange (record, dataIndex, planModel, value) {
    //   this.treeChangeFlag = true
    //   record.dataIndex = value
    // },
    clickImg(e) {
      this.showImg = true;
    },
    viewImg(){
      this.showImg = false;
    },
    changeVisible(val){
      this.standardWordVisible = val;
    },
    setPlanWords(val){
      this.wordRecord.words = val
    },
    showStandardWordModal(text,record){
      this.standardWordVisible = true;
      this.wordIdStr = text
      this.wordRecord = record
    },
    // 项目搜索功能
    onSearch (value) {
      this.queryParam.context = value.trim()
      this.queryParam.pageNo = 1
      setTimeout(() => {
        this.$refs.table.refresh(true) // refresh() 不传参默认值 false 不刷新到分页第一页
      }, 100)
    },
    onChange (current) {
      this.queryParam.pageNo = current
      setTimeout(() => {
        this.$refs.table.refresh(true) // refresh() 不传参默认值 false 不刷新到分页第一页
      }, 100)
    },
    onShowSizeChange (current, pageSize) {
      this.page.pageSize = pageSize
      this.page.pageNumber = 1
      this.pageNo = 1
      this.queryParam.pageNo = 1
      this.queryParam.pageSize = pageSize
      setTimeout(() => {
        this.$refs.table.refresh(true) // refresh() 不传参默认值 false 不刷新到分页第一页
      }, 100)
    },
    Time (value) {
      const dateee = new Date(value).toJSON()
      const date = new Date(+new Date(dateee) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '')
      return date.substring(0, 10)
    },
    DateTime (value) {
      const dateee = new Date(value).toJSON()
      const date = new Date(+new Date(dateee) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '')
      return date
    },
    tableOption () {
      if (!this.optionAlertShow) {
        this.options = {
          alert: { show: true, clear: () => { this.selectedRowKeys = [] } },
          rowSelection: {
            selectedRowKeys: this.selectedRowKeys,
            onChange: this.onSelectChange,
            getCheckboxProps: record => ({
              props: {
                disabled: record.no === 'No 2', // Column configuration not to be checked
                name: record.no
              }
            })
          }
        }
        this.optionAlertShow = true
      } else {
        this.options = {
          alert: false,
          rowSelection: null
        }
        this.optionAlertShow = false
      }
    },
    onClose () {
      var me = this
      if (this.treeChangeFlag) {
        this.$confirm({ // 确定和关闭按钮 调换位置（只是调换了样式，和方法）
          title: '计划维护后未保存，是否继续？',
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
            me.visible = false
            me.treeChangeFlag = false
          }
        })
      } else {
        me.visible = false
        me.treeChangeFlag = false
      }
    },
    onMemberClose () {
      var me = this
      if (this.isModify) {
        this.$confirm({
          title: '组员维护后未保存，是否继续？',
          onOk () {
            me.memberVisible = false
            me.resetModal()
          },
          onCancel () {
          }
        })
      } else {
        this.memberVisible = false
        this.resetModal()
      }
    },
    initDutyMilepost(contractNo){
      getDutyMilepostList({ contractNo: contractNo })
        .then(res => {
          console.log(res)
          this.milepostDutyList = res.body
        })
    },
    handleEdit (record) {
      this.visible = true
      this.deleteIds = []
      this.treeIndex = 0
      this.projectInfo = record
      this.projectInfo.contractId = record.htbh
      this.getPlanModelData(record)
      this.initDutyMilepost(record.htbh)
      this.selectedContractno = record.htbh
      this.selectedProjectId = record.projectId
      // this.$refs.modal.edit(record)
      // this.$refs.table.refresh()
    },
    handleSub (record) {
      if (record.status !== 0) {
        this.$message.info(`${record.no} 订阅成功`)
      } else {
        this.$message.error(`${record.no} 订阅失败，规则已关闭`)
      }
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    onClickRow (record, index) {
      return {
        on: {
          click: () => {
            this.selectedRow = record.contractNo
            this.selectedRowInfo = record
            this.planId = record.planId
          }
        }
      }
    },
    setCurrentRow (record, index) {
      var styleClassName = ''
      if (record.contractNo === this.selectedRow) {
        styleClassName = 'clickRowStyle hoverRowStyle'
      }
      return styleClassName
    },
    membersManageShow (record) {
      this.memberVisible = true
      this.contractNo = record.contractNo
      this.maintainId = record.projectManager
      this.projectGroupTree = []
      this.loadProjectGroupTree()
    },
    moment,
    status_change: function (row) {
      if (row.logoff === 1) {
        return 'table-info-row-gray'
      }
    },
    expand (e, item) {
      e = !e
      if (e) {
        this.expandedRowKeys.splice(
          this.expandedRowKeys.findIndex(i => i === item.treeId),
          1
        )
      } else {
        this.expandedRowKeys.push(item.treeId)
      }
    },
    menuIdInit (data, menuId) {
      const planModel = data
      const len = planModel.length
      for (let i = 0; i < len; i++) {
        const item = planModel[i]
        menuId.push(item.treeId)
        if (item.children && item.children.length !== 0) {
          this.menuIdInit(item.children, menuId)
        }
      }
      this.expandedRowKeys = menuId
    },
    getPlanModelData (record) {
      const me = this
      me.planTreeLoading = true
      me.planModel = null
      me.deleteIds = []
      let planId = ''
      if (record.planId) {
        planId = record.planId
      }
      findPlanDetailByPlanId({ planId: planId })
        .then(res => {
          me.planModel = res.body
          me.initPlanModel(me.planModel, 0)
          me.menuIdInit(me.planModel, [])
        })
      me.planTreeLoading = false
    },
    initPlanModel (planModel, parentTreeId) {
      const len = planModel.length
      for (let i = 0; i < len; i++) {
        const item = planModel[i]

        if (item.milepostLevel === 1) {
          item.editable = false
          item.parentTreeId = 0
        } else {
          item.parentTreeId = parentTreeId
        }
        this.treeIndex += 1
        item.treeId = this.treeIndex
        if(item.sort == null){
          item.sort = i+1
        }
        if (item.planId === null || item.planId === undefined) {
          if (item.milepostLevel === 1) {
            item.id = null
          } else {
            item.id = null
            item.parentId = null
          }
        }
        // if (item.children && (item.children == null || item.children.length === 0)) {
        //   delete item['children']
        // }
        if (item.children && item.children.length !== 0) {
          this.initPlanModel(item.children, item.treeId)
        }
      }
      this.planModel = planModel
    },
    handleAdd (record, planModel) {
      // var me = this
      this.treeChangeFlag = true
      if (this.expandedRowKeys.indexOf(record.treeId) < 0) {
        this.expandedRowKeys.push(record.treeId)
      }
      const milepostLevel = record.milepostLevel + 1
      if (milepostLevel > 5) {
        return
      }
      const newData = {
        treeId: record.treeId * 10 + Math.random(),
        id: null,
        milepostLevel: milepostLevel,
        parentTreeId: record.treeId,
        parentId: record.id,
        milepostId: null,
        planId: record.planId,
        milepostName: '',
        logoff: 0,
        range: 1,
        editFlag: true,
        newFlag: true,
        finishDate: null,
        milepostFlag:0,
        // children: []
      }
      if (!record.children) {
        this.$set(record, 'children', [])
      }
      var addIndex = record.children.length
      for(var index in record.children){
        if(record.children[index].logoff == 1 ){
          addIndex = index
        }
      }
      newData.sort = record.children.length + 1
      record.children.splice(addIndex, 0, newData)
    },
    cancelOrDelete (record, planModel) {
      const me = this
      this.treeChangeFlag = true
      this.planMilePostIdList = []
      this.planMilePostIdList.push(record.id)
      if (record.children && record.children.length !== 0) {
        this.getChildId(this.planMilePostIdList, record.children)
      }
      planHaveWorkLog(this.planMilePostIdList)
        .then(res => {
          if (res.body) {
            me.handleCancelPlan(record.treeId, 'logoff', planModel)
          } else {
            if (record.id != null) {
              me.deleteIds.push(record.id)
            }
            if (record.children && record.children.length !== 0) {
              me.getDeleteIds(me.deleteIds, record.children)
            }
            me.handleDelete(record, planModel)
          }
        })
    },
    getDeleteIds (deleteIds, planModel) {
      const len = planModel.length
      for (let i = 0; i < len; i++) {
        const item = planModel[i]
        if (item.id) {
          deleteIds.push(item.id)
        }
        if (item.children && item.children.length !== 0) {
          this.getDeleteIds(deleteIds, item.children)
        }
      }
    },
    getChildId (planMilePostIdList, planModel) {
      const len = planModel.length
      for (let i = 0; i < len; i++) {
        const item = planModel[i]
        planMilePostIdList.push(item.id)
        if (item.children && item.children.length !== 0) {
          this.getChildId(planMilePostIdList, item.children)
        }
      }
    },
    handleDelete (record, planModel) {
      const len = planModel.length
      for (let i = 0; i < len; i++) {
        const item = planModel[i]
        if (planModel[i].children) {
          planModel[i].children = planModel[i].children.filter(item => item.treeId !== record.treeId)
          if (item.children && item.children.length !== 0) {
            this.handleDelete(record, item.children)
          }
        }
      }
      this.planModel = planModel
    },
    handleCancelPlan (treeId, dataIndex, planModel) {
      const len = planModel.length
      const target = planModel.find(item => item.treeId === treeId)
      if (target) {
        target[dataIndex] = 1
        target['editFlag'] = false
      }
      for (let i = 0; i < len; i++) {
        const item = planModel[i]
        if (planModel[i].children) {
          const childrenTarget = planModel[i].children.find(item => item.treeId === treeId)
          if (childrenTarget) {
            childrenTarget[dataIndex] = 1
            childrenTarget['editFlag'] = false
            planModel[i].children = planModel[i].children.filter(item => item.treeId !== treeId)
            planModel[i].children = [...planModel[i].children, childrenTarget]
            if (childrenTarget.children) {
              this.cancelAllChildren(childrenTarget.children)
            }
          }
          if (item.children && item.children.length !== 0) {
            this.handleCancelPlan(treeId, 'logoff', item.children)
          }
        }
      }
      this.planModel = planModel
    },
    cancelAllChildren (planModel) {
      const len = planModel.length
      for (let i = 0; i < len; i++) {
        const item = planModel[i]
        item['logoff'] = 1
        item['editFlag'] = false
        if (item.children) {
          this.cancelAllChildren(item.children)
        }
      }
    },
    onParentCellChange (treeId, dataIndex, planModel, value) {
      if (dataIndex === 'finishDate' || dataIndex === 'actualFinishDate') {
        if (value != null) {
          value = this.DateTime(value.valueOf())
        }
      }
      const len = planModel.length
      const target = planModel.find(item => item.treeId === treeId)
      if (target) {
        target[dataIndex] = value
        if (target.children && target.children.length !== 0) {
          var targetChildren = target.children
          var maxDate = value
          for (var data of targetChildren) {
            if (data.finishDate > maxDate) {
              maxDate = data.finishDate
            }
          }
          if (maxDate != null) {
            target[dataIndex] = maxDate
          }
        }
        if (dataIndex === 'finishDate') {
          if (value != null) {
            this.onParentCellChange(target.parentTreeId, dataIndex, this.planModel, value)
          }
        }
      } else {
        for (let i = 0; i < len; i++) {
          const item = planModel[i]
          if (item.children && item.children.length !== 0) {
            this.onParentCellChange(treeId, dataIndex, item.children, value)
          }
        }
      }
    },
    onCellChange (record, dataIndex, planModel, value) {
      this.treeChangeFlag = true
      if (dataIndex === 'finishDate' || dataIndex === 'actualFinishDate') {
        if (value != null) {
          value = this.DateTime(value.valueOf())
        }
      }
      if (record) {
        record[dataIndex] = value
        if(dataIndex === 'milepostFlag' || dataIndex === 'finishFlag'){
          if(value.target.checked){
            record[dataIndex] = 1
          }else{
            record[dataIndex] = 0
          }
        }
        if(dataIndex === 'milepostDutyId'){
          record['milepostFlag'] = 1
        }
        if (dataIndex === 'finishDate') {
          if (value != null) {
            if (record.parentTreeId !== 0) {
              this.onParentCellChange(record.parentTreeId, dataIndex, this.planModel, value)
            }
          }
        }
      }
    },
    checkInfo: function (planModel) {
      let flag = false
      const len = planModel.length
      for (let i = 0; i < len; i++) {
        const item = planModel[i]
        if (item.milepostName == null || this.milepostName === '') {
          flag = true
          return flag
        } else {
          if (item.children && item.children.length !== 0) {
            this.checkInfo(item.children)
          }
        }
      }
    },
    handleSubmit: function () {
      var me = this
      this.saveData = []
      this.initSaveData(this.planModel, this.saveData)
      for (const data of this.saveData) {
        if (data.milepostName == null || data.milepostName === '') {
          this.$message.error('请输入所有计划名称')
          return
        }
      }
      this.selectedRowInfo.id = this.selectedRowInfo.planId
      var parameter = {
        details: this.planModel,
        plan: this.selectedRowInfo,
        deletes: this.deleteIds
      }
      this.loading = true
      saveAllProjectPlanDetail(parameter)
        .then(res => {
          if (res.code === 200) {
            this.$message.success('保存成功')
            this.$refs.table.refresh()
            me.treeChangeFlag = false
            me.projectInfo.planId = res.body.id
            me.getPlanModelData(me.projectInfo)
            this.loading = false
          } else {
            this.$message.error(res.msg)
            this.loading = false
          }
        })
      setTimeout(() => {
        this.loading = false
      }, 60000)
    },
    initSaveData (planModel, saveData) { // 将所有层级的计划明细归结为一个list，统一进行保存
      var len = planModel.length
      for (var i = 0; i < len; i++) {
        var item = planModel[i]
        saveData.push(item)
        if (item.children && item.children.length !== 0) {
          this.initSaveData(item.children, saveData)
        }
      }
      this.saveData = saveData
    },
    getWidthAndHeight () {
      this.formWidth = window.innerWidth * 0.8
      this.scrollHeight = window.innerHeight - 196
      this.listScrollHeight = window.innerHeight - 250
      this.cardHeight = window.innerHeight - 125
      this.memberListScrollHeight = window.innerHeight - 300
    },
    refreshTable () {
      this.$refs.table.refresh()
    },
    loadProjectGroupTree () {
      var params = { contractNo: this.contractNo }
      doLoadProjectGroupTree(params).then((res) => {
        if (res.code === 200) {
          if (res.result != null || res.body !== undefined) {
            if (!this.selectedKeys[0]) {
              var selectKey = res.body[0].groupId
              this.selectedKeys = [selectKey]
              this.QueryData(selectKey)
              this.selectedTreeNode = res.body[0]
              this.newMemberDisabled = false
            } else {
              this.QueryData(this.selectedKeys[0])
            }
            this.projectGroupTree = res.body
            this.theWholeGroups = []
            this.getAllGroups(this.projectGroupTree)
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
      this.selectedKeys = [groupId]
      this.selectedTreeNode = item
      if (level === 1) {
        this.btnDisabled1 = true
        this.btnDisabled2 = false
      } else if (level === 3) {
        this.btnDisabled1 = false
        this.btnDisabled2 = true
      } else {
        this.btnDisabled1 = false
        this.btnDisabled2 = false
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
    handleSubmitMember () {
      var groupId = this.selectedTreeNode.groupId
      var parentId = this.selectedTreeNode.parentId
      var sortNo = this.selectedTreeNode.sortNo
      this.groupsForm.validateFields((err) => {
        if (err) {
        }
      })
      // 包含groupName
      var groupForm = this.groupsForm.getFieldsValue()
      if (!groupForm.groupName) {
        return
      }
      this.groupConfirmLoading = true
      groupForm.flag = this.flag
      groupForm.sortNo = sortNo
      groupForm.contractNo = this.contractNo
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
        this.groupConfirmLoading = false
      }).catch((res) => {
        console.log(res)
      })
    },
    doQueryGroupMembers (pageNo) {
      var me = this
      if (pageNo) {
        this.currentPage = pageNo
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
            var params = {
              inputContent: inputContent,
              pageSize: me.pageSize,
              pageNo: me.currentPage,
              contractNo: me.contractNo
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
        var inputContent = this.inputContent
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
        var params = {
          inputContent: inputContent,
          pageSize: this.pageSize,
          pageNo: this.currentPage,
          contractNo: this.contractNo
        }
        this.isLoading = true
        doQueryGroupMemebers(params).then((res) => {
          if (res.code === 200) {
            if (res.body != null || res.body !== undefined) {
              this.total = res.body.members.totalCount
              this.groupMembersList = res.body.members.items
              this.getTreeFilterNode(this.groupMembersList)
              this.selectedKeys = []
              this.selectedTreeNode = ''
              this.newMemberDisabled = true
            }
          } else {
            this.$message.error(res.msg)
          }
          this.isLoading = false
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
      this.needChangeLeader = this.needChangeLeader.filter(function (value, index, self) {
        return self.indexOf(value) === index
      })
      var groupMembers = this.groupMembersList.filter(item => item.personId)
      var deleteMembers = this.deleteIdList
      var updateLeader = this.needChangeLeader.filter(item => item > 0)

      var params = { saveList: groupMembers, deleteList: deleteMembers, updateLeaderList: updateLeader, contractNo: this.contractNo }
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
            this.loadProjectGroupTree()
            this.isModify = false
            this.repeatMembers = []
            this.$message.success('保存成功！')
          }
          this.$refs.table.refresh(true)
        } else {
          this.$message.error(res.msg)
        }
        this.memberSaveLoading = false
      }).catch((res) => {
        console.log(res)
      })
    },
    onMemberClickRow (record, index) {
      return {
        on: {
          click: () => {
            this.memberSelectedRow = record.detailKey
            this.memberSelectedRowInfo = record
            this.editMembersShow = true
            this.modifyBtnVisible = true
            this.modifyBtnDisabled = false
          }
        }
      }
    },
    setMemberCurrentRow (record, index) {
      var styleClassName = ''
      if (record.detailKey === this.memberSelectedRow) {
        styleClassName = 'clickRowStyle hoverRowStyle'
      }
      return styleClassName
    },
    handlePersonChange (data) {
      // this.memebersName = data.personName
      this.setPersonData(data)
    },
    setPersonData (value) {
      var detailKey = this.memberSelectedRow
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
              me.doQueryGroupMembers()
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
          this.doQueryGroupMembers()
        }
      }
    },
    handleLeaderChange (record) {
      if (record.detailKey !== this.memberSelectedRow) {
        this.memberSelectedRow = record.detailKey
        this.memberSelectedRowInfo = record
        this.editMembersShow = true
        this.modifyBtnVisible = true
        this.modifyBtnDisabled = false
      }
      const newData = [...this.groupMembersList]
      const newTarget = newData.filter(item => this.memberSelectedRow === item.detailKey)[0]
      var me = this
      if (!newTarget.personId) {
        me.$message.warning('请先选择人员！')
        return
      }
      if (this.memberSelectedRowInfo.isValid === '1') {
        this.$message.warning('该组员已离职，无法选择组长！')
        return
      }
      if (this.memberSelectedRowInfo.leaderKey) {
        if (this.memberSelectedRow === this.memberSelectedRowInfo.leaderKey) {
          this.$confirm({
            title: '是否取消当前组长：' + me.memberSelectedRowInfo.leaderName + '？',
            onOk () {
              if (newData.length > 0) {
                newData.forEach(item => {
                  if (item.groupId === me.memberSelectedRowInfo.groupId) {
                    item.leader = 0
                    item.leaderId = ''
                    item.leaderKey = ''
                    item.leaderName = ''
                    item.maintainId = ''
                  }
                })
              }
              newTarget.isModify = true
              newTarget._originalData = { ...newTarget }
              me.groupMembersList = newData
              me.$message.success('修改成功！')
              me.isModify = true
            },
            onCancel () {
            }
          })
        } else {
          this.$confirm({
            title: me.memberSelectedRowInfo.groupName + '当前组长为' + me.memberSelectedRowInfo.leaderName + '，是否重新选择？',
            onOk () {
              const oldTarget = newData.filter(item => me.memberSelectedRowInfo.leaderKey === item.detailKey)[0]
              if (!oldTarget) {
                me.needChangeLeader.push(me.memberSelectedRowInfo.leaderKey)
              } else {
                oldTarget.isModify = true
              }
              if (newData.length > 0) {
                newData.forEach(item => {
                  if (me.memberSelectedRowInfo.groupId === item.groupId) {
                    item.leader = 0
                    item.leaderId = newTarget.personId
                    item.leaderKey = newTarget.detailKey
                    item.leaderName = newTarget.personName
                    item.maintainId = ''
                  }
                })
              }
              if (newTarget) {
                newTarget.leader = 1
                newTarget.error = false
                newTarget.isModify = true
                newTarget.maintainId = me.maintainId
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
          item.maintainId = ''
        })
        newTarget.leader = 1
        newTarget.isModify = true
        newTarget.maintainId = me.maintainId
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
            this.memberSelectedRow = ''
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
              me.loadProjectGroupTree()
              me.$message.success('删除成功！')
            } else {
              me.$message.error(res.msg)
            }
          }).catch((res) => {
            console.log(res)
          })
        },
        onCancel () {}
      })
    },
    newMember () {
      if (!this.selectedKeys[0]) {
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
      this.memberSelectedRow = this.countNumber
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
      this.memebersName = this.memberSelectedRowInfo.personName
      this.isModify = true
    },
    cancel (detailKey) {
      const newData = [...this.groupMembersList]
      const target = newData.filter(item => detailKey === item.detailKey)[0]
      delete target.editable
      Object.keys(target).forEach(key => { target[key] = target._originalData[key] })
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
    },
    resetModal () {
      this.projectGroupTree = []
      this.theWholeGroups = []
      this.memberSelectedRow = ''
      this.memberSelectedRowInfo = ''
      this.selectedTreeNode = ''
      this.groupMembersList = []
      this.expandedKeys = []
      this.selectedKeys = []
      this.treeFilterNode = []
      this.inputContent = ''
      this.total = 0
      this.currentPage = 1
      this.isModify = false
      this.repeatMembers = []
    }
  },
  computed: {
    treeHeight: function () {
      return (window.innerHeight - 50) + 'px'
    },
    modalHeight: function () {
      return (window.innerHeight - 190) + 'px'
    },
    tableHeight: function () {
      return window.innerHeight - 180 - 140
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
  /deep/ .table-info-row-gray{
    color: lightgray;
  }
  /deep/ .ant-table-thead > tr > th > .center_title {
    color: #000000 !important;
    text-align: center;
  }
  /deep/ .ant-table-thead > tr > th {
    padding: 0px 0px;
  }
  /deep/  .ant-table-tbody > tr > td{
    padding:0
  }
  .wordCount{
    text-align: center;
    width: 70px;
  }
  .wordCount:hover{
    cursor:pointer;
    color:#1890ff
  }
  .anticon {
    font-size: 16px;
  }
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
    overflow-x:hidden;
    overflow-y:auto;
  }
  /deep/ .ant-drawer-header {
    position: relative;
    padding: 0;
    color: rgba(0, 0, 0, 0.65);
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
    border-radius: 4px 4px 0 0;
  }
</style>
