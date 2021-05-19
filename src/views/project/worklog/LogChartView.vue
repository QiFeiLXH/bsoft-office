<template>
  <a-card :bordered="false" :bodyStyle="{ height: '2000px', padding: '0 10px' }">

    <a-row :gutter="8">
      <a-col :span="14">
        <!--筛选框-->
        <a-card :bordered="false" :bodyStyle="{ height: '50px', padding: '10px 0' }">
          <template v-if="chartType === 1">
            <span style="margin-right: 10px;">年份：</span>
            <a-input-number v-model="chartYear" @change="onYearChange" :bodyStyle="{ width: '88px' }" style="width: 88px"/>
          </template>
          <template v-if="chartType === 2">
            <span style="margin-right: 10px;">月份：</span>
            <a-month-picker :allowClear="false"
                            :default-value="monthPickerDefault()"
                            :disabled-date="monthPickerDisabled"
                            @change="onMonthPickerChange" />
          </template>
          <a-radio-group default-value="1" @change="onRadioChange" style="margin-left: 15px">
            <a-radio value="1">按月</a-radio>
            <a-radio value="2">按日</a-radio>
          </a-radio-group>

        </a-card>
        <!--饼图-->
        <div ref="chart" style="width: 100%; height: 500px; margin: auto  "></div>

      </a-col>

      <a-col :span="10">
        <!--表格-->
        <a-card :bordered="false" :bodyStyle="{ height: tableHeight + 'px', padding: '0', marginTop: '50px'}">
          <a-table :columns="column"
                   :data-source="data"
                   :row-key="record => record.date"
                   :pagination="false"
                   :loading="loading"
                   :scroll="{ x:false,  y:tableHeight + 'px'}"
                   :bodyStyle="{ height: tableHeight + 'px'}"
                   size="small">
            <!--@change="onTableChange"-->
            <template slot="rowIndex" slot-scope="text, record, index">
              <span style="margin: auto"> {{ index + 1 }} </span>
            </template>
            <template slot="projectLogRate" slot-scope="text, record">
              <span style="margin: auto"> {{ record.projectLogRate + '%'}} </span>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>
  </a-card>
</template>

<script>
    import { getLogChartList, getLogChartMonthList } from '@/api/logchart'
    import moment from 'moment/moment'
    import 'moment/locale/zh-cn'
    import { Decimal } from 'decimal.js'
    export default {
      name: "LogChartView",
      components: { moment },
      data() {
        return {
          loading: false,
          chartHeight: 0,
          tableHeight: 0,
          chartType: 1, // 1: 按年份统计每月平均结构化日志填写情况 2: 按月份统计每天结构化日志具体填写情况
          chartYear: 2020,
          chartMonth: '2020-01',
          queryParam: { startDate: null, endDate: null },
          data: [],
          column: [
            {
              title: '序号',
              dataIndex:'rowIndex',
              width:'10%',
              align: 'center',
              scopedSlots: { customRender: 'rowIndex' },
            },
            {
              title: () => this.chartType === 1 ? '月份' : '日期' ,
              dataIndex: 'date',
              key: 'date',
              width: '18%',
              align: 'center',
            },
            {
              title: () => this.chartType === 1 ? '平均结构化日志数量' : '结构化日志数量' ,
              dataIndex: 'projectLogCount',
              key: 'projectLogCount',
              width: '18%',
              align: 'center',
            },
            {
              title: () => this.chartType === 1 ? '平均普通日志数量' : '普通日志数量',
              dataIndex: 'workLogCount',
              key: 'workLogCount',
              width: '18%',
              align: 'center',
            },
            {
              title: () => this.chartType === 1 ? '平均APP日志数量' : 'APP日志数量',
              dataIndex: 'appLogCount',
              key: 'appLogCount',
              width: '18%',
              align: 'center',
            },
            {
              title: () => this.chartType === 1 ? '平均结构化日志占比' : '结构化日志占比',
              dataIndex: 'projectLogRate',
              key: 'projectLogRate',
              align: 'center',
              width: '18%',
              scopedSlots: { customRender: 'projectLogRate' }
            },
          ],
          chartOption:{
            //color: ['#32C5E9','#9FE6B8', '#FFDB5C', '#FF9F7F', '#E062AE', '#9D96F5'],
            title: {
              text: '构化日志填写情况',
              left: 'center'
            },
            tooltip: {
              trigger: 'axis',
              axisPointer: { type: 'shadow' },
              formatter: '{b0} <br/> {a0}: {c0} <br/> {a1}: {c1} <br/> {a2}: {c2} <br/> {a3}: {c3}% <br/>'
            },
            legend: {
              top: '40px',
              orient: 'horizontal',// horizontal横向  vertical纵向
              left: '20px',
              data: [ '全部日志', '结构化日志', '月平均全部日志', '月平均结构化日志', '月平均APP日志', 'APP日志', '结构化日志占比'],
            },
            grid: {
              top: '90px',
              left: '40px',
              right: '40px',
              width: 'auto',
            },
            dataZoom:[{
              type: 'slider',//图表下方的伸缩条
              show : true, //是否显示
              realtime : true, //拖动时，是否实时更新系列的视图
              start : 0, //伸缩条开始位置（1-100），可以随时更改
              end : 100, //伸缩条结束位置（1-100），可以随时更改
              filterMode: 'empty',// 解决修改start大于0的时候，会出现折线混乱，变成竖直的线的绘制问题
        　　}],
            xAxis: [
              { type: 'category', data: [], }
            ],
            yAxis: [
              { type: 'value' },
              { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } }
            ],
            series: [
              {
                name: '全部日志',
                type: 'bar',
                yAxisIndex: 0,
                barGap:'0%',/*多个并排柱子设置柱子之间的间距*/
                barCategoryGap:'30%',/*多个并排柱子设置柱子之间的间距*/
                data: [],
              },
              {
                name: '结构化日志',
                type: 'bar',
                yAxisIndex: 0,
                barGap:'0%',
                data: [],
              },
              {
                name: 'APP日志',
                type: 'bar',
                yAxisIndex: 0,
                barGap:'0%',
                data: [],
              },
              {
                name: '结构化日志占比',
                type: 'line',
                lineStyle: { width:5 },
                symbolSize: 10,
                yAxisIndex: 1,
                data: [],
              }
            ],
          }
        }
      },
      created() {
        this.initPage()
      },
      mounted () {
        this.drawMonthChart()
      },
      methods: {
        drawChart(){
          const myChart = this.$echarts.init(this.$refs.chart)
          const chartOption = this.chartOption

          // 设置加载状态
          this.loading = true
          myChart.showLoading({
            text: 'loading',
            color: '#c23531',
            textColor: '#000',
            maskColor: 'rgba(255, 255, 255, 0.2)',
            zlevel: 0,
          })

          // 请求参数
          const params = {
            startDate: this.queryParam.startDate,
            endDate: this.queryParam.endDate,
          }

          getLogChartList(params).then(res => {
            const tableData = res.body.items.map(item => ({ ...item }));
            const chartData = res.body.items.map(item => ({ ...item }));

            // 设置表格数据
            tableData.forEach(item => {
              item.projectLogRate = new Decimal( new Decimal(item.projectLogRate).toNumber().toFixed(4) ).mul(100).toNumber()
            })
            this.data = tableData
            this.loading = false

            // 设置柱状图数据
            const xAxisData = []
            const allLogData = []
            const proLogData = []
            const appLogData = []
            const rateData = []
            chartData.forEach(item => {
              xAxisData.push(item.date)
              allLogData.push(new Decimal(item.workLogCount).add(new Decimal(item.projectLogCount)).toNumber())
              proLogData.push(item.projectLogCount)
              appLogData.push(item.appLogCount)
              rateData.push(new Decimal(item.projectLogRate).mul(100).toNumber())
            })
            chartOption.xAxis[0].data = xAxisData
            chartOption.series[0].data = allLogData
            chartOption.series[1].data = proLogData
            chartOption.series[2].data = appLogData
            chartOption.series[3].data = rateData
            // 设置标题
            chartOption.title.text = '结构化日志填写情况（'+ this.chartMonth +'）'
            chartOption.series[0].name = '全部日志'
            chartOption.series[1].name = '结构化日志'
            chartOption.series[2].name = 'APP日志'
            // 设置滚动条长度
            if (chartData.length <= 7) {
              chartOption.dataZoom[0].start = 0
            } else {
              chartOption.dataZoom[0].start = (1 - 7 / chartData.length) * 100 + 2// 此处加2只为页面效果
            }
            // 隐藏加载状态
            myChart.hideLoading();
            // 渲染图表
            myChart.setOption(chartOption)
          })
        },
        drawMonthChart(){
          const myChart = this.$echarts.init(this.$refs.chart)
          const chartOption = this.chartOption

          // 显示加载状态
          myChart.showLoading({
            text: 'loading',
            color: '#c23531',
            textColor: '#000',
            maskColor: 'rgba(255, 255, 255, 0.2)',
            zlevel: 0,
          })
          this.loading = true

          // 请求参数
          const params = {
            year: this.chartYear,
          }
          getLogChartMonthList(params).then(res => {
            const tableData = res.body.items.map(item => ({ ...item }));
            const chartData = res.body.items.map(item => ({ ...item }));

            // 处理表格数据
            tableData.forEach(item => {
              item.date = (item.date + '').substring(0, 4) +'-'+ (item.date + '').substring(4, 6)
              item.projectLogCount = new Decimal(item.projectLogCount).round().toNumber()
              item.workLogCount = new Decimal(item.workLogCount).round().toNumber()
              item.appLogCount = new Decimal(item.appLogCount).round().toNumber()
              item.projectLogRate = new Decimal( new Decimal(item.projectLogCount / (item.projectLogCount + item.workLogCount)).toNumber().toFixed(4) ).mul(100).toNumber()
            })
            this.data = tableData
            this.loading = false

            // 处理柱图数据
            const xAxisData = []
            const allLogData = []
            const proLogData = []
            const appLogData = []
            const rateData = []
            chartData.forEach(item => {
              const workLog = new Decimal(item.workLogCount).round().toNumber()
              const proLog = new Decimal(item.projectLogCount).round().toNumber()
              const appLog = new Decimal(item.appLogCount).round().toNumber()
              xAxisData.push((item.date + '').substring(0, 4) +'-'+ (item.date + '').substring(4, 6))
              allLogData.push(workLog + proLog)
              proLogData.push(proLog)
              appLogData.push(appLog)
              rateData.push( new Decimal( new Decimal(proLog / (workLog + proLog)).toNumber().toFixed(4) ).mul(100).toNumber() )
            })
            chartOption.xAxis[0].data = xAxisData
            chartOption.series[0].data = allLogData
            chartOption.series[1].data = proLogData
            chartOption.series[2].data = appLogData
            chartOption.series[3].data = rateData
            // 设置标题
            chartOption.title.text = '结构化日志填写情况（'+ this.chartYear +'）'
            chartOption.series[0].name = '月平均全部日志'
            chartOption.series[1].name = '月平均结构化日志'
            chartOption.series[2].name = '月平均APP日志'
            // 设置滚动条长度
            if (chartData.length <= 6) {
              chartOption.dataZoom[0].start = 0
            } else {
              chartOption.dataZoom[0].start = (1 - 6 / chartData.length) * 100
            }
            // 隐藏加载状态
            myChart.hideLoading();
            // 渲染图表
            myChart.setOption(chartOption)
          })


        },
        initPage() {
          const today = moment()
          this.chartYear = parseInt(this.getCurrentMonth().substring(0, 4))
          this.chartMonth = this.getCurrentMonth();
          this.queryParam.startDate = moment(today).startOf('month').format("YYYY-MM-DD").toString()
          this.queryParam.endDate = moment(today).endOf('month').format("YYYY-MM-DD").toString()
          this.tableHeight = window.innerHeight - 230
        },
        onYearChange(){
          this.drawMonthChart();
        },
        onMonthPickerChange(date, dateString) {
          this.chartMonth = dateString
          this.queryParam.startDate = moment(date).startOf('month').format("YYYY-MM-DD").toString()
          this.queryParam.endDate = moment(date).endOf('month').format("YYYY-MM-DD").toString()
          this.drawChart();
        },
        onRadioChange(event) {
          const type = parseInt(event.target.value)
          this.chartType = type
          if(type === 1) {
            this.drawMonthChart()
          }else if(type === 2) {
            this.drawChart();
          }
        },
        monthPickerDefault() {
          return moment(this.getCurrentMonth(), 'yyyy-MM')
        },
        monthPickerDisabled(current) {
          return current && current > moment().endOf('day');
        },
        getCurrentMonth() {
          var myDate = new Date()
          var tYear = myDate.getFullYear()
          var tMonth = myDate.getMonth() + 1
          if ( tMonth.toString().length === 1 ) {
            tMonth = "0" + tMonth
          }
          return tYear +'-'+ tMonth
        },

      }
    }
</script>

<style scoped>

</style>