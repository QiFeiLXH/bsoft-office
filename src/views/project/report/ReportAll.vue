<template>
  <div>
    <a-layout>
      <a-layout-sider
        width="280px"
        :style="{ overflow: 'auto', position: 'fixed', height: '87vh',background: '#fff'}"
      >
        <a-menu
          mode="inline"
          style="width: 280px;padding-bottom: 40px;"
          :inlineIndent="10"
          :defaultSelectedKeys="defaultSelectedKeys"
          :selectedKeys="selectedKeys"
        >
          <a-menu-item v-for="menu in menus" :key="menu.key" @click="menuClicked(menu)">
            <a-icon type="file" theme="filled" :style="{color:'RGB(235,184,34)'}"/>
            <a-tooltip placement="right">
              <template slot="title">
                <span>{{ menu.key }}-{{ menu.title }}</span>
              </template>
              {{ menu.key }}-{{ menu.title }}
            </a-tooltip>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout-content :style="{ marginLeft: '286px' }">
        <a-tabs
          hideAdd
          size="small"
          type="editable-card"
          @edit="onEdit"
          v-model="activeKey"
          @change="callback"
        >
          <a-tab-pane v-for="pane in panes" :tab="pane" :key="pane" :closable="panes.length > 1">
            <component :is="pane"></component>
          </a-tab-pane>
        </a-tabs>
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script>
import { A01, A02, A03, A04, A05, A06, A07, A08, A09, A10, A11, A12 } from '@/module/project/report'
const menus = [
  {
    key: 'A01',
    title: '项目级-全部-小计'
  },
  {
    key: 'A02',
    title: '项目级-全部-年度'
  },
  {
    key: 'A03',
    title: '项目级-全部-月度'
  },
  {
    key: 'A04',
    title: '项目级-按产生部门类别-小计'
  },
  {
    key: 'A05',
    title: '项目级-按产生部门类别-年度'
  },
  {
    key: 'A06',
    title: '项目级-按产生部门类别-月度'
  },
  {
    key: 'A07',
    title: '合同级-全部-小计'
  },
  {
    key: 'A08',
    title: '合同级-全部-年度'
  },
  {
    key: 'A09',
    title: '合同级-全部-月度'
  },
  {
    key: 'A10',
    title: '合同级-按产生部门类别-小计'
  },
  {
    key: 'A11',
    title: '合同级-按产生部门类别-年度'
  },
  {
    key: 'A12',
    title: '合同级-按产生部门类别-月度'
  }
]
export default {
  name: 'ReportAll',
  components: {
    A01,
    A02,
    A03,
    A04,
    A05,
    A06,
    A07,
    A08,
    A09,
    A10,
    A11,
    A12
  },
  data () {
    return {
      menus: menus,
      activeKey: 'A01',
      defaultSelectedKeys: ['A01'],
      selectedKeys: ['A01'],
      panes: ['A01']
    }
  },
  methods: {
    menuClicked (record) {
      var panes = this.panes
      if (panes.indexOf(record.key) <= -1) {
        panes = panes.concat(record.key)
      }
      this.panes = panes
      this.activeKey = record.key
      this.selectedKeys = []
      this.selectedKeys = this.selectedKeys.concat(record.key)
    },
    onEdit (targetKey, action) {
      this[action](targetKey)
    },
    remove (targetKey) {
      let activeKey = this.activeKey
      let lastIndex
      this.panes.forEach((pane, i) => {
        if (pane === targetKey) {
          lastIndex = i - 1
        }
      })
      const panes = this.panes.filter(pane => pane !== targetKey)
      if (panes.length && activeKey === targetKey) {
        if (lastIndex >= 0) {
          activeKey = panes[lastIndex]
        } else {
          activeKey = panes[0]
        }
      }
      this.panes = panes
      this.activeKey = activeKey
      this.selectedKeys = []
      this.selectedKeys = this.selectedKeys.concat(activeKey)
    },
    callback (key) {
      this.activeKey = key
      this.selectedKeys = []
      this.selectedKeys = this.selectedKeys.concat(key)
    }
  }
}
</script>

<style scoped lang="less">
/deep/ .ant-tabs-bar {
    margin: 0;
  }

/*/deep/ .ant-menu-vertical > .ant-menu-item, .ant-menu-vertical-left > .ant-menu-item, .ant-menu-vertical-right > .ant-menu-item, .ant-menu-inline > .ant-menu-item, .ant-menu-vertical > .ant-menu-submenu > .ant-menu-submenu-title, .ant-menu-vertical-left > .ant-menu-submenu > .ant-menu-submenu-title, .ant-menu-vertical-right > .ant-menu-submenu > .ant-menu-submenu-title, .ant-menu-inline > .ant-menu-submenu > .ant-menu-submenu-title {*/
/*  height: 30px;*/
/*  line-height: 30px;*/
/*}*/
</style>
