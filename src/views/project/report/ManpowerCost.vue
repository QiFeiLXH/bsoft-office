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
import { B01, B02, B03, B04, B05, B06, B07, B08, B09, B10, B11, B12, C01, C02, C03, C04, C05, C06, C07, C08, C09, C10, C11, C12} from '@/module/project/report'
const menus = [
    {
      key: 'B01',
      title: '工作量-项目级-全部-小计'
    },
    {
      key: 'B02',
      title: '工作量-项目级-全部-年度'
    },
    {
      key: 'B03',
      title: '工作量-项目级-全部-月度'
    },
    {
      key: 'B04',
      title: '工作量-项目级-按产生部门类别-小计'
    },
    {
      key: 'B05',
      title: '工作量-项目级-按产生部门类别-年度'
    },
    {
      key: 'B06',
      title: '工作量-项目级-按产生部门类别-月度'
    },
    {
      key: 'B07',
      title: '工作量-合同级-全部-小计'
    },
    {
      key: 'B08',
      title: '工作量-合同级-全部-年度'
    },
    {
      key: 'B09',
      title: '工作量-合同级-全部-月度'
    },
    {
      key: 'B10',
      title: '工作量-合同级-按产生部门类别-小计'
    },
    {
      key: 'B11',
      title: '工作量-合同级-按产生部门类别-年度'
    },
    {
      key: 'B12',
      title: '工作量-合同级-按产生部门类别-月度'
    },
    {
      key: 'C01',
      title: '金额-项目级-全部-小计'
    },
    {
      key: 'C02',
      title: '金额-项目级-全部-年度'
    },
    {
      key: 'C03',
      title: '金额-项目级-全部-月度'
    },
    {
      key: 'C04',
      title: '金额-项目级-按产生部门类别-小计'
    },
    {
      key: 'C05',
      title: '金额-项目级-按产生部门类别-年度'
    },
    {
      key: 'C06',
      title: '金额-项目级-按产生部门类别-月度'
    },
    {
      key: 'C07',
      title: '金额-合同级-全部-小计'
    },
    {
      key: 'C08',
      title: '金额-合同级-全部-年度'
    },
    {
      key: 'C09',
      title: '金额-合同级-全部-月度'
    },
    {
      key: 'C10',
      title: '金额-合同级-按产生部门类别-小计'
    },
    {
      key: 'C11',
      title: '金额-合同级-按产生部门类别-年度'
    },
    {
      key: 'C12',
      title: '金额-合同级-按产生部门类别-月度'
    }
]
export default {
  name: 'ManpowerCost',
  components: {
    B01,
    B02,
    B03,
    B04,
    B05,
    B06,
    B07,
    B08,
    B09,
    B10,
    B11,
    B12,
    C01,
    C02,
    C03,
    C04,
    C05,
    C06,
    C07,
    C08,
    C09,
    C10,
    C11,
    C12
  },
  data () {
    return {
      menus: menus,
      activeKey: 'B01',
      defaultSelectedKeys: ['B01'],
      selectedKeys:['B01'],
      panes: ['B01']
    }
  },
  mounted() {
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
          lastIndex = i - 1;
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
    callback(key){
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
