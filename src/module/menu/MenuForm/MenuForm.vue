<template>
  <a-spin tip="Loading..." :spinning="spinning">
    <a-card :title = pageTitle :bodyStyle = "{ padding : '5px 5px 0px 0px'}">
      <a-row slot="extra">
        <a-button style="margin-right: 25px" type="primary" @click.stop="doSave">保存</a-button>
        <a-button @click.stop="doCancle">取消</a-button>
      </a-row>
      <a-form :form="form">
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="标题" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
              <a-input
                v-decorator="[
                  'routetitle',
                  { rules: [{ required: true, message: '请填写标题!' }] }
                  ]"
              />
            </a-form-item>
          </a-col>
          <a-col :span="3">
            <a-form-item>
              <a-checkbox v-model="pubChecked">公用</a-checkbox>
            </a-form-item>
          </a-col>
          <a-col :span="3">
            <a-form-item>
              <a-switch checkedChildren="启用" unCheckedChildren="禁用" v-model="activeStatus"/>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="排序" :min="1" :label-col="{ span: 6 }" :wrapper-col="{ span: 10 }">
              <a-input-number v-decorator="[ 'sort' ]"/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="组件" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
              <a-input
                v-decorator="[
                  'component',
                  {
                    initialValue: 'RouteView',
                    rules: [{ required: true, message: '请填写组件!' }]
                  }
                  ]"
                @change="componentchange"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="属性(和权限相关)" :label-col="{ span: 10 }" :wrapper-col="{ span: 14 }">
              <a-input v-decorator="[ 'name',{ rules: [{ required: true, message: '请填写属性!' }] } ]" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="路径" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
              <a-input v-decorator="[ 'path' ]" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="图标" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
              <a-input v-decorator="[ 'icon' ]"/>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <a-card title="权限信息" :body-style="{padding: 0}" style="margin-top: 0px">
      <a-button size="small" type="primary" ghost icon="plus" @click="add" style="margin-top: 10px;margin-left: 5px" slot="extra">添加权限</a-button>
      <a-table
        :columns="columns"
        :rowKey="(record,index)=> index"
        :dataSource="Actions"
        bordered
        defaultExpandAllRows
        size="small"
        :scroll="{ x: 260, y: listScrollHeight }"
        :pagination="false"
      >
        <template slot="index" slot-scope="text, record, index">
          {{index + 1}}
        </template>
        <template
          v-for="col in ['name', 'describe']"
          :slot="col"
          slot-scope="text, record, index"
        >
        <span :key="col">
          <a-input
            v-if="record.editable"
            :value="text"
            @change="e => handleChange(e.target.value, record.id, col, index)"
          />
          <span v-else>{{ text }}</span>
        </span>
        </template>
        <template slot="action" slot-scope="text, record">
          <a-tooltip>
            <template slot="title">
              修改
            </template>
            <a-icon
              theme="twoTone"
              twoToneColor="#52c41a"
              type="edit"
              @click="() => modify(record)"
            />
          </a-tooltip>
          <a-divider type="vertical" />
          <a-tooltip>
            <template slot="title">
              删除
            </template>
            <a-icon
              theme="twoTone"
              twoToneColor="#52c41a"
              type="delete"
              sty
              @click="() => remove(record)"
            />
          </a-tooltip>
        </template>
      </a-table>
    </a-card>
  </a-spin>
</template>

<script>
import { getMenuInfo, updateMenu } from '@/api/menu'
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
    title: '权限',
    dataIndex: 'name',
    key: 'name',
    className: 'center-th-header',
    width: 80,
    scopedSlots: { customRender: 'name' }
  },
  {
    title: '描述',
    dataIndex: 'describe',
    key: 'describe',
    width: 80,
    className: 'center-th-header',
    scopedSlots: { customRender: 'describe' }
  },
  {
    title: '操作',
    key: 'action',
    align: 'center',
    scopedSlots: { customRender: 'action' },
    width: 50
  }
]
export default {
  name: 'MenuForm',
  data () {
    return {
      listScrollHeight: 0,
      columns,
      spinning: false,
      formData: {
        id: null,
        routetitle: '',
        parentId: null,
        sort: null,
        icon: '',
        path: '',
        component: '',
        name: '',
        active: null,
        pubFlag: null,
        system: 13
      },
      Actions: [],
      pubChecked: false,
      activeStatus: true,
      flag: '',
      systemid: 0,
      pageTitle: '菜单详细信息维护',
      form: this.$form.createForm(this)
    }
  },
  created () {
    this.getWidthAndHeight()
  },
  watch: {
    pubChecked (value) {
      if (value) {
        this.formData.pubFlag = 1
      } else {
        this.formData.pubFlag = 0
      }
    },
    activeStatus (value) {
      if (value) {
        this.formData.active = 1
      } else {
        this.formData.active = 0
      }
    }
  },
  methods: {
    getWidthAndHeight () {
      this.listScrollHeight =  window.innerHeight - 500
    },
    getMenuInfo(id) {
      const params = { menuId: id }
      this.spinning = true
      getMenuInfo(params).then(response => {
        this.spinning = false
        if (response.code === 200){
          this.formData = {}
          this.Actions = []
          this.formData = response.body
          this.Actions = response.body.actionEntitySet
          if (this.formData.pubFlag === 1){
            this.pubChecked = true
          } else {
            this.pubChecked = false
          }
          if (this.formData.active === 1){
            this.activeStatus = true
          } else {
            this.activeStatus = false
          }
          this.form.setFieldsValue({
            'routetitle': this.formData.routetitle,
            'component': this.formData.component,
            'name': this.formData.name,
            'path': this.formData.path,
            'icon': this.formData.icon,
            'sort': this.formData.sort
          })
        }
      }).catch(error => {
        this.spinning = false
      })
    },
    modify(k){
      const _Actions = this.Actions
      const target = _Actions.filter(item => item === k)[0]
      if (target) {
        target.editable = 'true'
      }
      this.Actions = []
      this.Actions = _Actions
    },
    remove(item){
      const _Actions = this.Actions
      const xx = _Actions.filter(k => k !== item)
      this.Actions = xx
    },
    handleChange (value, id, column, index) {
      const _Actions = [...this.Actions]
      if (id != null){
        const target = _Actions.filter(item => id === item.id)[0]
        if (target) {
          target[column] = value
          this.Actions = _Actions
        }
      } else {
        _Actions[index][column] = value
        this.Actions = _Actions
      }
    },
    add () {
      const _Actions = this.Actions
      const record = {
        id: null,
        menuId: this.formData.id,
        name: '',
        describe: '',
        editable: 'true'
      }
      _Actions.push(record)
      this.Actions = _Actions
    },
    loadData (record, flag, systemid) {
      this.flag = flag
      this.systemid = systemid
      if (flag === 'add'){
        this.pageTitle = '新增一级菜单'
        this.form.resetFields()
        this.formData = {}
        this.formData.parentId = 0
        this.formData.pubFlag = 1
        this.formData.active = 1
        this.pubChecked = true
        this.activeStatus = true
        this.Actions = []
      } else if (flag === 'addSub') {
        this.pageTitle = '新增 ' + record.routetitle + ' 的子菜单'
        this.form.resetFields()
        this.formData = {}
        this.formData.parentId = record.id
        this.formData.pubFlag = 1
        this.formData.active = 1
        this.pubChecked = true
        this.activeStatus = true
        this.Actions = []
      } else if (flag === 'modify'){
        this.pageTitle = '修改菜单 - ' + record.routetitle
        this.getMenuInfo(record.id)
      }
    },
    doCancle () {
      this.Actions = []
      this.formData = {}
      this.flag = ''
      this.pageTitle = ''
      this.form.resetFields()
    },
    doSave (e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          this.formData.routetitle = this.form.getFieldValue('routetitle')
          this.formData.component = this.form.getFieldValue('component')
          this.formData.name = this.form.getFieldValue('name')
          this.formData.path = this.form.getFieldValue('path')
          this.formData.icon = this.form.getFieldValue('icon')
          this.formData.sort = this.form.getFieldValue('sort')
          this.formData.system = this.systemid
          const params = {
            'officeMenuVO': this.formData,
            'authorityVOList': this.Actions
          }
          updateMenu(params).then(response => {
            if (response.code === 200 && response.body != null){
              var menuId = response.body
              this.$notification['success']({
                message: '提示',
                description: '菜单维护成功'
              })
              this.getMenuInfo(menuId)
              this.$emit('formrowclick',this.systemid)
            } else {
              this.$notification['error']({
                message: '提示',
                description: response.msg
              })
              console.log(response.msg)
            }
          }).catch(error => {
            this.$notification['error']({
              message: '提示',
              description: '菜单维护失败！'
            })
            console.log(error)
          })
        }
      })
    },
    componentchange(e){
      const value = e.target.value
      this.form.setFieldsValue({
        'name': value,
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .item-group {
    padding: 20px 0 8px 24px;
    font-size: 0;
    a {
      color: rgba(0, 0, 0, 0.65);
      display: inline-block;
      font-size: 14px;
      margin-bottom: 13px;
      width: 25%;
    }
  }
/*/deep/ .ant-card-head {*/
/*    min-height: 48px;*/
/*    margin-bottom: -1px;*/
/*    padding: 0 24px;*/
/*    color: rgba(0, 0, 0, 0.85);*/
/*    font-weight: 500;*/
/*    font-size: 16px;*/
/*    background: transparent;*/
/*    border-bottom: 1px solid #e8e8e8;*/
/*    border-radius: 2px 2px 0 0;*/
/*    border-top: 1px solid #e8e8e8;*/
/*    zoom: 1;*/
/*  }*/
</style>