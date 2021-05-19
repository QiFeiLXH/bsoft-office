<template>
  <a-card :bordered="false">
    <a-range-picker
      :format="dateFormat"
      :defaultValue="[moment(new Date(), dateFormat), moment(new Date(), dateFormat)]"
      @change="onChange"/>
    <a-button type="primary" icon="search" style="margin-left: 15px" @click.stop="refreshReport"></a-button>
    <a-table
      size="small"
      style="margin-top: 10px"
      :columns="columns"
      :rowKey="record => record.menuId"
      :dataSource="data"
    >
    </a-table>
  </a-card>
</template>

<script>
import { usageLogReport} from '@/api/usageLog'
import moment from 'moment'

const columns = [
  {
    title: '菜单名称',
    dataIndex: 'name',
    key: 'name',
    // scopedSlots: { customRender: 'name' }
  },
  {
    title: '使用次数',
    dataIndex: 'sl',
    key: 'sl',
    // scopedSlots: { customRender: 'roleName' }
  }
]
export default {
  name: 'UsageLog',
  data () {
    return {
      columns,
      data: [],
      startDate: null,
      endDate: null,
      dateFormat: 'YYYY/MM/DD'
    }
  },
  mounted() {
    this.data = []
    this.refreshReport()
  },
  methods: {
    moment,
    refreshReport() {
      if (this.startDate == null){
        this.startDate = this.Time(new Date()) + ' 00:00:00'
        this.endDate = this.Time(new Date()) + ' 23:59:59'
      }
      const params = {
        'startDate': this.startDate,
        'endDate': this.endDate
      }
      this.data = []
      usageLogReport(params).then(res=>{
        if (res.code === 200){
          this.data = this.data.concat(res.body)
        }
      }).catch(err=>{

      })
    },
    onChange(date, dateString) {
      const start = this.Time(date[0]) + ' 00:00:00'
      const end =   this.Time(date[1]) + ' 23:59:59'
      this.startDate = start
      this.endDate = end
      this.refreshReport()
    },
    Time(value) {
      const dateee = new Date(value).toJSON();
      const date = new Date(+new Date(dateee)+8*3600*1000).toISOString().replace(/T/g,' ').replace(/\.[\d]{3}Z/,'')
      return date.substring(0, 10)
    }
  }
}
</script>

<style scoped>

</style>