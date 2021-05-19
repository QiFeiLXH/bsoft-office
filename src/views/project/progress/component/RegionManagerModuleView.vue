<template>
  <a-card
    :bordered="false"
    :bodyStyle="{
      height:cardHeight+'px',
      padding: '0px 10px'
    }">
    <a-row style="margin-bottom: 10px;margin-top:10px;">
      <a-col>
        <a-input-search
          :pressEnter="doQuery"
          :allowClear="true"
          v-model="queryParam.inputContent"
          placeholder="一级区域名称"
          style="width: 300px;"
          @search="doQuery"/>
        <a-divider type="vertical"/>
        <!--<a-checkbox-group :value="queryParam.logout" :options="plainOptions" @change="handleLogoutChange"/>
        <a-divider type="vertical"/>-->
        <a-button type="primary" icon="search" @click="doQuery">查询</a-button>
        <a-divider type="vertical"/>
        <a-button type="primary" @click="doSave">保存</a-button>
      </a-col>
    </a-row>
    <a-table
      class="watermarkClass"
      v-watermark
      :loading="loading"
      size="small"
      ref="table"
      :rowKey="(record) => record.rowKey"
      :row-selection="{ columnTitle: '选择', selectedRowKeys: selectedRowKeys, onChange: onRowChange, onSelect: onRowSelect,
                        getCheckboxProps: record => ({
                          props: {
                            disabled: record.logout === 1
                          }
                        }) }"
      :columns="columns"
      :dataSource="regionList"
      :customRow="onClickRow"
      :rowClassName="setCurrentRow"
      :scroll="{ x: false, y: listScrollHeight }"
      :pagination="pagination"
      @change="handleCurrentPageChange"
      :bodyStyle="{ height:listScrollHeight+'px' }"
    >
      <template slot="deptName" slot-scope="text, record">
        <template v-if="record.isNew">
          <a-select
            style="width: 200px"
            @change="(val, option) => handleRegionChange(val, option, record)"
            option-filter-prop="children"
            :filter-option="filterOption"
            placeholder="请选择一级区域"
            :allowClear="true"
            :value="record.deptId"
            show-search>
            <a-select-option v-for="item in regionDic" :key="item.value" :value="item.value" :detail="item" :disabled="regionList.map(item => item.deptId).includes(item.value)">
              {{item.title}}
            </a-select-option>
          </a-select>
        </template>
        <template v-else>
          <span :style="record.logout === 1 ? { color: 'red' } : ''">{{ text }}</span>
        </template>
      </template>
      <template slot="managerName" slot-scope="text, record">
        <template v-if="record.isModified || record.isNew">
          <multipe-person-search-select :record="record" customKey="manager" customLabel="managerName"></multipe-person-search-select>
        </template>
        <template v-else>
          {{ text }}
        </template>
      </template>
      <template slot="remark" slot-scope="text, record">
        <template v-if="record.isModified || record.isNew">
          <a-textarea
            placeholder="请输入备注"
            :maxLength="160"
            v-model="record.remark"
            :autoSize="{ minRows: 2, maxRows: 2 }"/>
        </template>
        <template v-else>
          <a-tooltip>
            <template slot="title">
              {{ text }}
            </template>
            {{ text }}
          </a-tooltip>
        </template>
      </template>
      <template slot="operation" slot-scope="text, record">
        <template v-if="record.logout === 1">
          <a-tooltip>
            <template slot="title">
              启用
            </template>
            <a>
              <a-icon type="play-circle" @click="handleEnable(record)"/>
            </a>
          </a-tooltip>
        </template>
        <template v-else>
          <a-tooltip>
            <template slot="title">
              注销
            </template>
            <a-icon type="stop" :style="record.deptId ? { color: 'red' } : { color: 'grey',cursor: 'not-allowed' }" @click="handleLogout(record)"/>
          </a-tooltip>
        </template>
      </template>
      <template slot="footer">
        <div style="text-align: left">
          <a-button type="primary" icon="plus" style="width: 100px" @click="addRegion">
            新增
          </a-button>
        </div>
      </template>
    </a-table>
  </a-card>
</template>

<script>
import { MultipePersonSearchSelect } from '@/module'
import { loadRegionManagerList, logoutRegion, enableRegion, saveRegions, doLoadRegionDic } from '@/api/regionProgressManager'

const columns = [
  {
    dataIndex: 'deptName',
    title: '一级区域',
    width: '33%',
    scopedSlots: { customRender: 'deptName' }
  }, {
    dataIndex: 'managerName',
    title: '区域进度管理员',
    width: '33%',
    scopedSlots: { customRender: 'managerName' }
  }, {
    dataIndex: 'remark',
    title: '备注',
    width: '34%',
    scopedSlots: { customRender: 'remark' },
    ellipsis: true
  }]
export default {
  name: 'RegionManagerModuleView',
  components: {
    MultipePersonSearchSelect
  },
  data () {
    return {
      columns,
      cardHeight: 0,
      listScrollHeight: 0,
      rowSelected: '',
      currentPage: 0,
      pagination: {
        total: 0,
        size: 'small',
        current: 0,
        pageSize: 0
      },
      plainOptions: [
        { label: '未注销', value: 0 },
        { label: '已注销', value: 1 }
      ],
      queryParam: { pageSize: 25, inputContent: '', logout: [0] },
      loading: false,
      regionDic: [],
      regionList: [],
      selectedRowKeys: [],
      countNumber: 0
    }
  },
  methods: {
    doQuery (noLoading) {
      this.rowSelected = ''
      this.queryParam.pageNo = 1
      this.selectedRowKeys = []
      if (noLoading) {
        this.doQueryRegionWithoutLoading()
      } else {
        this.doQueryRegion()
      }
    },
    doSave () {
      if (this.selectedRowKeys.length === 0) {
        this.$message.warning('暂无可保存的数据！')
        return
      }
      var data = this.regionList.filter(item => this.selectedRowKeys.includes(item.rowKey) && item.deptId)
      this.doSaveRegions(data)
    },
    handleLogoutChange (val) {
      this.queryParam.logout = val
      this.doQuery()
    },
    handleRegionChange (val, option, record) {
      const data = [...this.regionList]
      var target = this.regionList.find(item => item.rowKey === record.rowKey)
      var dept = this.regionDic.find(item => item.value === val)
      if (target) {
        target.deptId = val
        target.deptName = dept.title
        target.sortBy = dept.sortBy
      }
      this.regionList = data
    },
    onRowSelect (record, selected, selectedRows, nativeEvent) {
      this.rowSelected = record.rowKey
      const data = [...this.regionList]
      if (!selected && record.isNew) {
        this.regionList = this.regionList.filter(item => item.rowKey !== record.rowKey)
      } else {
        var target = data.find(item => item.rowKey === record.rowKey)
        if (!selected) {
          if (target) {
            if (target._originData) {
              target.manager = target._originData.manager
              target.managerName = target._originData.managerName
              target.remark = target._originData.remark
            }
            target.isModified = false
          }
        } else {
          if (target) {
            target._originData = { ...target }
            target.isModified = true
          }
        }
        this.regionList = data
      }
    },
    onRowChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
    },
    handleLogout (record) {
      if (!record.deptId) {
        return
      }
      const me = this
      this.$confirm({
        title: '是否注销' + record.deptName + '？',
        // 确认 与 关闭位置对调
        cancelText: '确定',
        okText: '取消',
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
          me.doLogoutRegion(record.deptId)
        }
      })
    },
    handleEnable (record) {
      this.rowSelected = record.id
      const me = this
      this.$confirm({
        title: '是否启用' + record.deptName + '？',
        // 确认 与 关闭位置对调
        cancelText: '确定',
        okText: '取消',
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
          me.doEnableRegion(record.deptId)
        }
      })
    },
    handleCurrentPageChange (pagination) {
      this.queryParam.pageNo = pagination.current
      this.rowSelected = ''
      this.selectedRowKeys = []
      this.doQueryRegion()
    },
    doQueryRegion () {
      this.loading = true
      var parameter = {}
      loadRegionManagerList(Object.assign(parameter, this.queryParam)).then((res) => {
        if (res.code === 200) {
          this.currentPage = res.body.pageNumber + 1
          this.pagination.current = res.body.pageNumber + 1
          this.pagination.pageSize = res.body.pageSize
          this.pagination.total = res.body.totalCount
          this.regionList = res.body.items
          this.regionList.forEach(item => {
            item.rowKey = item.deptId
          })
          this.loading = false
        }
        this.loading = false
      })
    },
    doQueryRegionWithoutLoading () {
      var parameter = {}
      loadRegionManagerList(Object.assign(parameter, this.queryParam)).then((res) => {
        if (res.code === 200) {
          this.currentPage = res.body.pageNumber + 1
          this.pagination.current = res.body.pageNumber + 1
          this.pagination.pageSize = res.body.pageSize
          this.pagination.total = res.body.totalCount
          this.regionList = res.body.items
          this.regionList.forEach(item => {
            item.rowKey = item.deptId
          })
        }
      })
    },
    doLoadRegionSelect () {
      doLoadRegionDic().then((res) => {
        if (res.code === 200) {
          this.regionDic = res.body
        }
      })
    },
    doSaveRegions (regions) {
      saveRegions(regions).then((res) => {
        if (res.code === 200) {
          this.$message.success('保存成功！')
          this.doQuery(true)
        }
      })
    },
    doLogoutRegion (deptId) {
      this.loading = true
      logoutRegion({ deptId: deptId }).then((res) => {
        if (res.code === 200) {
          this.$message.success('注销成功！')
          this.doQuery()
          this.loading = false
        }
        this.loading = false
      })
    },
    doEnableRegion (deptId) {
      this.loading = true
      enableRegion({ deptId: deptId }).then((res) => {
        if (res.code === 200) {
          this.$message.success('启用成功！')
          this.doQuery()
          this.loading = false
        }
        this.loading = false
      })
    },
    addRegion () {
      this.countNumber -= 1
      this.regionList.push({
        rowKey: this.countNumber.toString(),
        deptId: undefined,
        parentDeptId: null,
        deptName: null,
        manager: null,
        managerName: null,
        logout: 0,
        type: 1,
        remark: null,
        sortBy: null,
        isNew: true
      })
      this.rowSelected = this.countNumber.toString()
      this.selectedRowKeys.push(this.rowSelected)
      this.scrollToBottom()
    },
    onClickRow (record, index) {
      return {
        on: {
          click: () => {
            this.rowSelected = record.rowKey
          }
        }
      }
    },
    setCurrentRow (record, index) {
      var styleClassName = ''
      if (record.rowKey === this.rowSelected) {
        styleClassName = 'clickRowStyle hoverRowStyle'
      }
      return styleClassName
    },
    getWidthAndHeight () {
      this.listScrollHeight = window.innerHeight - 380
      this.cardHeight = window.innerHeight - 85
    },
    filterOption (input, option) {
      return (
        option.data.attrs.detail.title.includes(input) ||
        (option.data.attrs.detail.simpleCode && (option.data.attrs.detail.simpleCode.toLowerCase().includes(input) || option.data.attrs.detail.simpleCode.toUpperCase().includes(input)))
      )
    },
    scrollToBottom () {
      const table = this.$refs.table.$el
      // 获取到具有 'scroll' 属性的这一层dom元素
      const tableBody = table.querySelector('.ant-table-body')
      if (tableBody) {
        this.$nextTick(() => {
          tableBody.scrollTop = tableBody.scrollHeight
        })
      }
    },
    loadPage () {
      this.doQuery()
      this.doLoadRegionSelect()
    }
  },
  created () {
    this.getWidthAndHeight()
    this.loadPage()
  }
}
</script>

<style scoped>
  /deep/ .ant-table-placeholder {
    position: absolute;
    z-index: 1;
    padding: 16px 16px;
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px;
    text-align: center;
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
    border-radius: 0 0 4px 4px;
    margin-top: 1px;
    top: 36px;
    width: 100%
  }

  /deep/ .ant-table-row:last-child td {
    border-bottom: 1px solid #e8e8e8 !important;
  }

  /deep/ .ant-table-footer {
    position: relative;
    padding: 8px 8px;
    color: rgba(0, 0, 0, 0.85);
    background: #fafafa;
    border-top: 1px solid #e8e8e8;
    border-radius: 0 0 4px 4px;
  }
</style>
