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
import { D01, D02, D03, D04, D05, D06, D07, D08, D09, D10, D11, D12 } from '@/module/project/report'
const menus = [
  {
    key: 'D01',
    title: '项目级-全部-小计'
  },
  {
    key: 'D02',
    title: '项目级-全部-年度'
  },
  {
    key: 'D03',
    title: '项目级-全部-月度'
  },
  {
    key: 'D04',
    title: '项目级-按产生部门类别-小计'
  },
  {
    key: 'D05',
    title: '项目级-按产生部门类别-年度'
  },
  {
    key: 'D06',
    title: '项目级-按产生部门类别-月度'
  },
  {
    key: 'D07',
    title: '合同级-全部-小计'
  },
  {
    key: 'D08',
    title: '合同级-全部-年度'
  },
  {
    key: 'D09',
    title: '合同级-全部-月度'
  },
  {
    key: 'D10',
    title: '合同级-按产生部门类别-小计'
  },
  {
    key: 'D11',
    title: '合同级-按产生部门类别-年度'
  },
  {
    key: 'D12',
    title: '合同级-按产生部门类别-月度'
  }
]
export default {
  name: 'Expenses',
  components: {
    D01,
    D02,
    D03,
    D04,
    D05,
    D06,
    D07,
    D08,
    D09,
    D10,
    D11,
    D12
  },
  data () {
    return {
      menus: menus,
      activeKey: 'D01',
      defaultSelectedKeys: ['D01'],
      selectedKeys: ['D01'],
      panes: ['D01']
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
</style>
