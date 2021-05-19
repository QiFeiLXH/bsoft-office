<template>
  <div>
    <a-row>
      <a-button class="editable-add-btn" @click="addRole" type="primary" style="margin-left: 8px">新增角色</a-button>
    </a-row>
    <a-table
      ref="roleSetTable"
      :loading="isLoading"
      :columns="columns"
      :rowKey="(record,index)=> index"
      :dataSource="tableData"
      bordered
      defaultExpandAllRows
      size="small"
      style="padding-top: 5px"
      :pagination="false"
      :customRow="handleCheck"
      :rowClassName="setRowClassName"
      :scroll="{ x: false, y: listScrollHeight }"
    >
      <template slot="index" slot-scope="text, record, index">
        {{index + 1}}
      </template>
      <template
        v-for="col in ['name', 'roleName']"
        :slot="col"
        slot-scope="text, record, index"
      >
        <span :key="col">
          <a-input
            v-if="record.editable"
            :value="text"
            style="margin: -5px 0"
            @change="e => handleChange(e.target.value, record.id, col,index)"
          />
          <span v-else>{{ text }}</span>
        </span>
      </template>
      <template slot="keyaction" slot-scope="text, record">
        <div class="editable-row-operations">
          <span v-if="record.editable">
            <a @click.stop="() => doSave(record)">保存</a>
            <a-divider type="vertical"/>
            <a-popconfirm title="是否确定取消修改?" @confirm.stop="() => doCancle(record)">
              <a>取消</a>
            </a-popconfirm>
          </span>
          <span v-else>
            <a-tooltip>
              <template slot="title">
                配置人员
              </template>
              <a-icon type="setting" @click.stop="() => doConfig(record)" theme="twoTone" twoToneColor="#52c41a"/>
            </a-tooltip>
            <a-divider type="vertical" />
            <a-tooltip>
            <template slot="title">
              删除角色
            </template>
            <a-icon type="minus-circle" theme="twoTone" twoToneColor="#52c41a" @click.stop="doDelete(record)"/>
          </a-tooltip>
          </span>
        </div>
      </template>
    </a-table>
    <a-modal title="选择人员" v-model="visible" @ok="handleOk" :destroyOnClose="true" :width="800" :bodyStyle="{padding : 0}">
      <dept-and-person-transfer :value="roleId" ref="personTransfer" @closeModal="closeModal"></dept-and-person-transfer>
      <template slot="footer">
        <a-button key="submit" type="primary" @click="handleOk">保存</a-button>
        <a-button key="back" @click="handleCancel">关闭</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script>
import { getRoleList, addRole, deleteRole } from '@/api/role'
import DeptAndPersonTransfer from "@/module/person/DeptAndPersonTransfer/DeptAndPersonTransfer";

const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    align: 'center',
    width: 50,
    scopedSlots: { customRender: 'index' }
  },
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    title: '属性(和权限关联)',
    dataIndex: 'roleName',
    key: 'roleName',
    scopedSlots: { customRender: 'roleName' }
  },
  {
    title: '操作',
    key: 'keyaction',
    align: 'center',
    width: 100,
    scopedSlots: { customRender: 'keyaction' }
  }
]

export default {
  name: 'RoleSet',
  components: {
    DeptAndPersonTransfer
  },
  data () {
    const _this = this
    return {
      isLoading: false,
      roleId: null,
      visible: false,
      selectId: null,
      tableData: [],
      selectedRowKeys: [],
      columns,
      handleCheck (record, index) {
        return {
          on: {
            click: () => {
              _this.selectId = record.id
              if (_this.selectId === undefined || _this.selectId === null || _this.selectId <=0){
                return
              }
              _this.$emit('rowclick', record)
            }
          }
        }
      },
      listScrollHeight: window.innerHeight - 230
    }
  },
  created () {
    this.getList()
  },
  methods: {
    getList () {
      this.isLoading = true
      getRoleList().then(response => {
        this.tableData = []
        const result = response.body
        this.tableData = this.tableData.concat(result)
      }).catch(error => {
        console.log(error)
      }).finally(
        this.isLoading = false
      )
    },
    doDelete (record) {
      const _this = this
      this.$confirm({
        title: '警告',
        content: "真的要删除吗?",
        okText: "删除",
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          const params = { 'roleId': record.id}
          deleteRole(params).then(res=>{
            this.getList()
          }).catch(err=>{
          })
        },
        onCancel () {

        }
      })
    },
    setRowClassName (record) {
      return record.id === this.selectId ? 'clickRowStyl' : ''
    },
    addRole () {
      const newData = [...this.tableData]
      const record = {
        editable: 'true'
      }
      newData.push(record)
      this.tableData = newData
      this.scrollToBottom()
    },
    handleChange (value, id, column,index) {
      const newData = [...this.tableData]
      if (id != null){
        const target = newData.filter(item => id === item.id)[0]
        if (target) {
          target[column] = value
          this.tableData = newData
        }
      }else{
        newData[index][column] = value
        this.tableData = newData
      }
    },
    doSave (record) {
      const params = {
        'name': record.name,
        'roleName': record.roleName
      }
      addRole(params).then(response => {
        this.tableData = []
        const result = response.body
        this.tableData = this.tableData.concat(result)
      }).catch(error => {
        console.log(error)
      })
    },
    doCancle (record) {
      const newData = [...this.tableData]
      const target = newData.filter(item => undefined === item.id)[0]
      if (target) {
        for (var i = 0; i < newData.length; i++) {
          if (newData[i].id === undefined) {
            newData.splice(i, 1)
          }
        }
        this.tableData = newData
      }
    },
    // 配置角色人员信息
    doConfig (record) {
      this.roleId = record.id
      this.visible = true
    },
    handleOk () {
      this.$refs.personTransfer.doSave()
    },
    closeModal () {
      this.visible = false
    },
    handleCancel(e) {
      this.visible = false
    },
    scrollToBottom () {
      const table = this.$refs.roleSetTable.$el
      // 获取到具有 'scroll' 属性的这一层dom元素
      const tableBody = table.querySelector('.ant-table-body')
      if (tableBody) {
        this.$nextTick(() => {
          tableBody.scrollTop = tableBody.scrollHeight
        })
      }
    }
  }
}
</script>

<style lang="less" scoped>
  /deep/ .clickRowStyl {
    background-color: #E8F7FF;
    color: #1890FF
  }
</style>
