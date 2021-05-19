<template>
  <div>
    <a-row v-if="tableData.length">
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
      <a-button class="editable-add-btn" @click="doSaveAuth" type="primary" style="margin-left: 8px">保存权限</a-button>
    </a-row>
    <a-table
      :loading="isLoading"
      v-if="tableData.length"
      :columns="columns"
      :rowKey="record => record.id"
      :dataSource="tableData"
      bordered
      defaultExpandAllRows
      size="small"
      :pagination="false"
      style="padding-top: 5px"
      :scroll="{ x: false, y: listScrollHeight }"
      :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onChangeSelect, onSelect: onSelectChange, columnWidth:20 }"
    >
      <template slot="pubFlag" slot-scope="pubFlag" style="text-align: left;">
        <span v-if="pubFlag === 1">
          <a-icon type="check"></a-icon>
        </span>
      </template>
      <template slot="actionEntitySet" slot-scope="text, record">
        <a-checkbox-group
          @change="onChange(record.actionData, record.id)"
          :options="record.actionEntitySet"
          v-model="record.actionData">
        </a-checkbox-group>
      </template>
    </a-table>
  </div>
</template>

<script>
import { getRoleAuthList, saveRoleAuth } from '@/api/role'

const columns = [
  {
    title: '菜单名称',
    dataIndex: 'routetitle',
    key: 'routetitle',
    align: 'left',
    width: 200,
    className: "center-th-header"
  },
  {
    title: '公共',
    dataIndex: 'pubFlag',
    key: 'pubFlag',
    align: 'center',
    width: 50,
    scopedSlots: { customRender: 'pubFlag' }
  },
  {
    title: '操作权限',
    dataIndex: 'actionEntitySet',
    key: 'actionEntitySet',
    align: 'left',
    scopedSlots: { customRender: 'actionEntitySet' },
    className: "center-th-header"
  }
]

export default {
  name: 'RoleAuth',
  data () {
    return {
      systemName:'结构化日志',
      systemid: 13,
      isLoading: false,
      tableData: [],
      columns,
      selectedRowKeys: [],
      selectedAction: [],
      SelectActionIdList: [],
      roleId: '',
      menuList: [],
      listScrollHeight: 0,
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
      ]
    }
  },
  created () {
    this.getWidthAndHeight()
  },
  methods: {
    chooseSystem(record) {
      this.systemName = record.name
      this.systemid = record.id
      this.tableData = []
      this.getList(this.roleId)
    },
    getList (roleId) {
      if (roleId == null) {
        this.tableData = []
        this.selectedRowKeys = []
        this.selectedAction = []
        this.SelectActionIdList = []
        return
      }
      this.isLoading = true
      this.roleId = roleId
      const params = { 'roleId': roleId,'system': this.systemid }
      getRoleAuthList(params).then(response => {
        this.tableData = []
        this.selectedRowKeys = []
        this.selectedAction = []
        this.SelectActionIdList = []
        const result = response.body
        const menuIdList = response.properties.menuIdList
        const actionList = response.properties.actionList
        this.SelectActionIdList = actionList
        this.selectedRowKeys = this.selectedRowKeys.concat(menuIdList)
        this.tableData = this.tableData.concat(result)
        this.processTreeData()
      }).catch(error => {
        console.log(error)
      }).finally(
        setTimeout(()=>{
          this.isLoading = false
        },500)
      )
    },
    onChangeSelect (selectedRowKeys, selectedRows) {
      // 选中菜单
      this.selectedRowKeys = selectedRowKeys
    },
    onSelectChange (record, selected, selectedRows, nativeEvent) {
      const selectMenuId = this.selectedRowKeys
      const id = record.id
      const parentId = record.parentId
      if (selected) {
        // 选上
        if (parentId !== 0) {
          if (selectMenuId.indexOf(parentId) <= -1) {
            selectMenuId.push(parentId)
            this.selectedRowKeys = selectMenuId
            this.autoSelectMenu(parentId)
          } else {
            this.autoSelectMenu(parentId)
          }
        }
      } else {
        const menuList = this.menuList
        // 取消选择
        if (id !== 0) {
          const target = menuList.filter(item => id === item.parentId)
          if (target) {
            for (var i = 0; i < target.length; i++) {
              if (selectMenuId.indexOf(target[i].id) > -1) {
                selectMenuId.splice(selectMenuId.indexOf(target[i].id), 1)
                this.autoCancleSelectMenu(target[i].id)
              }
            }
          }
        }
      }
    },
    autoCancleSelectMenu (id) {
      const menuList = this.menuList
      const selectMenuId = this.selectedRowKeys
      if (id !== 0) {
        const target = menuList.filter(item => id === item.parentId)
        if (target) {
          for (var i = 0; i < target.length; i++) {
            if (selectMenuId.indexOf(target[i].id) > -1) {
              selectMenuId.splice(selectMenuId.indexOf(target[i].id), 1)
              this.autoCancleSelectMenu(target[i].id)
            }
          }
        }
      }
    },
    autoSelectMenu (parentId) {
      const menuList = this.menuList
      const selectMenuId = this.selectedRowKeys
      if (parentId !== 0) {
        for (var i = 0; i < menuList.length; i++) {
          if (menuList[i].id === parentId) {
            if (selectMenuId.indexOf(parentId) <= -1) {
              selectMenuId.push(menuList[i].id)
              this.selectedRowKeys = selectMenuId
              this.autoSelectMenu(menuList[i].parentId)
            } else {
              this.autoSelectMenu(menuList[i].parentId)
            }
          }
        }
      }
    },
    doSaveAuth () {
      const params = {
        'roleId': this.roleId,
        'menuIds': this.selectedRowKeys,
        'authInfo': this.SelectActionIdList,
        'system': this.systemid
      }
      saveRoleAuth(params).then(response => {
        if (response.code === 200) {
          this.$notification['success']({
            message: '提示',
            description: '权限维护成功！'
          })
          this.getList(this.roleId)
        } else {
          this.$notification['error']({
            message: '提示',
            description: '权限维护失败！'
          })
        }
      }).catch(error => {
        console.log(error)
      })
    },
    onChange (checkedList, SelectMenuId) {
      // 选中权限
      const list = this.SelectActionIdList
      const actionMap = {
        'menuId': SelectMenuId,
        'actionList': checkedList
      }
      if (list.length > 0) {
        var target = list.filter(item => SelectMenuId === item.menuId)
        if (target.length > 0) {
          for (var i = 0; i < list.length; i++) {
            if (list[i].menuId === SelectMenuId) {
              list.splice(i, 1)
              if (checkedList.length > 0) {
                list.push(actionMap)
              }
            }
          }
        } else {
          if (checkedList.length > 0) {
            list.push(actionMap)
          }
        }
      } else {
        if (checkedList.length > 0) {
          list.push(actionMap)
        }
      }
      this.SelectActionIdList = list
    },
    processTreeData () {
      const listData = []
      const treeData = this.tableData
      treeData.forEach(item => {
        listData.push(item)
        if (item.children && item.children.length > 0) {
          this.treeToList(item.children, listData)
        }
      })
      this.menuList = listData
    },
    treeToList (treeData, listData) {
      treeData.forEach(item => {
        listData.push(item)
        if (item.children && item.children.length > 0) {
          this.treeToList(item.children, listData)
        }
      })
    },
    getWidthAndHeight () {
      this.listScrollHeight =  window.innerHeight - 230
    }
  }
}
</script>

<style scoped>

</style>
