<template>
  <div>
    <a-row>
      请选择系统：
      <a-dropdown>
        <a class="ant-dropdown-link" @click="e => e.preventDefault()">
          {{systemName}}<a-icon type="down" />
        </a>
        <a-menu slot="overlay">
          <a-menu-item v-for="record in systemList" :key="record.id">
            <a href="javascript:;" @click="chooseSystem(record)">{{record.name}}</a>
          </a-menu-item>
        </a-menu>
      </a-dropdown>
      <a-button type="primary" @click.stop="doAdd" style="margin-top: 5px;margin-left: 8px">新增一级菜单</a-button>
    </a-row>
    <a-table
      :loading="isLoading"
      v-if="data.length"
      :columns="columns"
      :rowKey="record => record.id"
      :dataSource="data"
      :defaultExpandAllRows="true"
      size="small"
      style="padding-top: 5px"
      :showHeader="false"
      :pagination="false"
      :scroll="{ x: false, y: listScrollHeight }"
      :customRow="handleCheck"
      :rowClassName="setRowClassName"
    >
      <template slot="action" slot-scope="text, record">
        <span v-if="record.active === 1">
          <a-tooltip>
            <template slot="title">
              新建子菜单
            </template>
            <a-icon type="plus-circle" @click.stop="doAddSub(record)" />
          </a-tooltip>
          <a-divider type="vertical" />
          <a-tooltip>
            <template slot="title">
              禁用菜单
            </template>
            <a-icon type="stop" theme="twoTone" twoToneColor="#52c41a" @click.stop="doDelete(record,'stop')"/>
          </a-tooltip>
          <a-divider type="vertical" />
          <a-tooltip>
            <template slot="title">
              删除菜单
            </template>
            <a-icon type="minus-circle" theme="twoTone" twoToneColor="#52c41a" @click.stop="doDelete(record,'delete')"/>
          </a-tooltip>
        </span>
        <span v-else>
          <span>已禁用</span>
        </span>
      </template>
    </a-table>
  </div>
</template>

<script>
import { getMenuList, deleteMenu } from '@/api/menu'

const columns = [
  {
    title: '菜单名称',
    dataIndex: 'routetitle',
    key: 'routetitle',
    width: 220,
    scopedSlots: { customRender: 'routetitle' }
  },
  {
    title: '操作',
    key: 'action',
    align: 'center',
    scopedSlots: { customRender: 'action' },
    width: 150
  },
  {
    title: '排序',
    dataIndex: 'sort',
    key: 'sort',
    width: 20
  }
]

export default {
  name: 'MenuTree',
  data () {
    const _this = this
    return {
      isLoading: false,
      listScrollHeight: 0,
      flag: null,
      selectId: null,
      data: [],
      systemName:'结构化日志',
      systemid: 13,
      columns,
      systemList:[
        {
          id: 18,
          name: '慧康办公'
        },
        {
          id: 13,
          name: '结构化日志'
        },
        {
          id: 14,
          name: '财务管理'
        },
        {
          id: 19,
          name: '信息中心管理'
        },
        {
          id: 16,
          name: '销管系统'
        },
        {
          id: 15,
            name: '人事管理'
        }
      ],
      handleCheck (record, index) {
        return {
          on: {
            click: (event) => {
              _this.selectId = record.id
              var flag = 'modify'
              _this.flag = flag
              _this.$emit('rowclick', record, flag, _this.systemid)
            }
          }
        }
      }
    }
  },
  created () {
    this.getList(13)
    this.getWidthAndHeight()
  },
  methods: {
    getWidthAndHeight () {
      this.listScrollHeight =  window.innerHeight - 230
    },
    getList (systemid) {
      this.isLoading = true
      const params = { 'system' : systemid}
      getMenuList(params).then(response => {
        this.data = []
        this.data.length = 0
        const result = response.body
        this.data = this.data.concat(result)
      }).catch(error => {
        console.log(error)
      }).finally(
        this.isLoading = false
      )
    },
    chooseSystem(record) {
      this.systemName = record.name
      this.systemid = record.id
      this.data = []
      this.data.length = 0
      this.getList(record.id)
      var flag = 'add'
      this.flag = flag
      this.$emit('rowclick', '', flag,this.systemid)
    },
    doAdd () {
      var flag = 'add'
      this.flag = flag
      this.$emit('rowclick', '', flag,this.systemid)
    },
    doDelete (record,type) {
      const _this = this
      this.$confirm({
        title: '警告',
        content: type === 'stop'?"真的要禁用吗?":"真的要删除吗?",
        okText: type === 'stop'?"禁用":"删除",
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          const params = { 'menuId': record.id, flag: type }
          deleteMenu(params).then(response => {
            if(response.code === 200){
              _this.$notification['success']({
                message: '提示',
                description: type === 'stop'?"菜单禁用成功":"菜单删除成功",
              })
              _this.getList(_this.systemid)
            }
          }).catch(error => {
            console.log(error)
          })
        },
        onCancel () {

        }
      })
    },
    setRowClassName (record) {
      return record.id === this.selectId ? 'clickRowStyl' : ''
    },
    doAddSub (record) {
      var flag = 'addSub'
      this.flag = flag
      this.$emit('rowclick', record, flag,this.systemid)
    }
  }
}
</script>

<style lang="less" scoped>
  .icons-list .anticon {
    margin-right: 6px;
    font-size: 18px;
  }
  /deep/ .clickRowStyl {
    background-color: #E8F7FF;
    color: #1890FF
  }
  /deep/ .ant-table-fixed-header > .ant-table-content > .ant-table-scroll > .ant-table-body {
    position: relative;
    background: transparent !important;
    margin-top: 0px;
  }
</style>