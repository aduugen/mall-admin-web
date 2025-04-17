<template>
  <div class="app-container">
    <el-card shadow="never" class="filter-container">
      <div class="filter-title">筛选条件</div>
      <el-form :inline="true" :model="listQuery" size="small" label-width="100px">
        <el-form-item label="操作类型：">
          <el-select v-model="listQuery.operateType" placeholder="全部操作类型" clearable>
            <el-option v-for="item in operationTypes" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item label="操作人：">
          <el-input v-model="listQuery.operateMan" placeholder="操作人" clearable/>
        </el-form-item>
        <el-form-item label="时间范围：">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <div class="chart-section">
      <!-- 统计卡片 -->
      <el-row :gutter="20" class="statistic-cards">
        <el-col :span="6">
          <el-card shadow="hover" class="statistic-card">
            <div class="statistic-value">{{ statistic.totalCount }}</div>
            <div class="statistic-title">总售后单数</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="statistic-card">
            <div class="statistic-value">{{ statistic.pendingCount }}</div>
            <div class="statistic-title">待处理售后单</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="statistic-card">
            <div class="statistic-value">{{ statistic.processingCount }}</div>
            <div class="statistic-title">处理中售后单</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="statistic-card">
            <div class="statistic-value">{{ statistic.completedCount }}</div>
            <div class="statistic-title">已完成售后单</div>
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" class="rate-cards">
        <el-col :span="8">
          <el-card shadow="hover" class="rate-card">
            <div class="progress-container">
              <el-progress type="circle" :percentage="statistic.handledRate || 0" :stroke-width="12"/>
            </div>
            <div class="rate-title">处理率</div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="rate-card">
            <div class="progress-container">
              <el-progress type="circle" :percentage="statistic.completedRate || 0" :stroke-width="12" color="#67c23a"/>
            </div>
            <div class="rate-title">完成率</div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="rate-card">
            <div class="avg-time">
              <span class="time-value">{{ formatAvgTime(statistic.avgProcessTime) }}</span>
            </div>
            <div class="rate-title">平均处理时间</div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 操作类型统计图表 -->
      <el-row :gutter="20" class="chart-row">
        <el-col :span="12">
          <el-card shadow="never" class="chart-card">
            <div slot="header" class="chart-title">
              <i class="el-icon-pie-chart"></i>
              <span>操作类型分布</span>
            </div>
            <div class="chart-container" v-loading="chartLoading">
              <div id="operationTypeChart" class="echarts-container"></div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="never" class="chart-card">
            <div slot="header" class="chart-title">
              <i class="el-icon-data-line"></i>
              <span>状态流转时间</span>
            </div>
            <div class="chart-container" v-loading="chartLoading">
              <div id="transitionTimeChart" class="echarts-container"></div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 日志列表 -->
      <el-card shadow="never" class="log-list-card">
        <div slot="header" class="log-title">
          <i class="el-icon-time"></i>
          <span>操作日志列表</span>
        </div>
        <el-table
          v-loading="listLoading"
          :data="list"
          stripe
          border
          style="width: 100%"
          :default-sort="{prop: 'createTime', order: 'descending'}">
          <el-table-column label="操作类型" align="center" width="120">
            <template slot-scope="scope">
              <el-tag :type="getLogIconType(scope.row.operateType)">
                {{ formatOperationType(scope.row.operateType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态变更" align="center" width="180">
            <template slot-scope="scope">
              {{ formatStatus(scope.row.afterSaleStatus) }}
            </template>
          </el-table-column>
          <el-table-column label="操作人" align="center" width="120">
            <template slot-scope="scope">
              {{ scope.row.operateMan }}
            </template>
          </el-table-column>
          <el-table-column label="备注" align="center">
            <template slot-scope="scope">
              {{ scope.row.note || '无' }}
            </template>
          </el-table-column>
          <el-table-column label="操作详情" align="center" width="300">
            <template slot-scope="scope">
              <div v-if="scope.row.operateType == OPERATION_TYPE.SHIP" class="detail-row">
                <span v-if="scope.row.deliveryCompany">物流公司：{{ scope.row.deliveryCompany }}</span>
                <span v-if="scope.row.deliverySn">物流单号：{{ scope.row.deliverySn }}</span>
              </div>
              <div v-else-if="[OPERATION_TYPE.CHECK_PASS, OPERATION_TYPE.CHECK_FAIL].includes(scope.row.operateType)" class="detail-row">
                <span v-if="scope.row.checkResult !== undefined && scope.row.checkResult !== null">
                  质检结果：
                  <el-tag :type="scope.row.checkResult === 1 ? 'success' : 'danger'">
                    {{ scope.row.checkResult === 1 ? '通过' : '不通过' }}
                  </el-tag>
                </span>
              </div>
              <div v-else-if="[OPERATION_TYPE.START_REFUND, OPERATION_TYPE.COMPLETE_REFUND].includes(scope.row.operateType)" class="detail-row">
                <span v-if="scope.row.returnAmount !== undefined && scope.row.returnAmount !== null">
                  退款金额：¥{{ formatMoney(scope.row.returnAmount) }}
                </span>
                <span v-if="scope.row.refundType !== undefined && scope.row.refundType !== null">
                  退款方式：{{ scope.row.refundType === 1 ? '原路退回' : '其他方式' }}
                </span>
              </div>
              <span v-else>无详情</span>
            </template>
          </el-table-column>
          <el-table-column label="操作时间" align="center" width="180" prop="createTime" sortable>
            <template slot-scope="scope">
              {{ formatTime(scope.row.createTime) }}
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-container">
          <el-pagination
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="listQuery.pageNum"
            :page-sizes="[5, 10, 15]"
            :page-size="listQuery.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
  import * as echarts from 'echarts';
  import {getOperationLogs, countOperationsByType, getStatusTransitionTime, getAfterSaleStatistic} from '@/api/returnApply';
  import {formatDate} from '@/utils/date';

  // 操作类型常量
  const OPERATION_TYPE = {
    PENDING: 0,       // 处理中
    APPROVE: 1,       // 同意申请
    REJECT: 2,        // 拒绝申请
    SHIP: 3,          // 确认发货
    RECEIVE: 4,       // 确认收货
    START_CHECK: 5,   // 开始质检
    CHECK_PASS: 6,    // 质检通过
    CHECK_FAIL: 7,    // 质检不通过
    START_REFUND: 8,  // 发起退款
    COMPLETE_REFUND: 9// 完成退款
  };
  
  // 状态常量
  const STATUS = {
    PENDING: 0,        // 待处理
    APPROVED: 1,       // 已同意
    REJECTED: 2,       // 已拒绝
    SHIPPED: 3,        // 已发货
    RECEIVED: 4,       // 已收货
    CHECKING: 5,       // 质检中
    CHECK_PASS: 6,     // 质检通过
    CHECK_FAIL: 7,     // 质检不通过
    REFUNDING: 8,      // 退款中
    COMPLETED: 9       // 已完成
  };

  export default {
    name: 'logAnalysis',
    data() {
      return {
        listQuery: {
          operateType: null,
          operateMan: null,
          startTime: null,
          endTime: null,
          pageSize: 10,
          pageNum: 1
        },
        dateRange: null,
        pickerOptions: {
          shortcuts: [{
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }]
        },
        operationTypes: [
          { value: 0, label: '处理中' },
          { value: 1, label: '同意申请' },
          { value: 2, label: '拒绝申请' },
          { value: 3, label: '确认发货' },
          { value: 4, label: '确认收货' },
          { value: 5, label: '开始质检' },
          { value: 6, label: '质检通过' },
          { value: 7, label: '质检不通过' },
          { value: 8, label: '发起退款' },
          { value: 9, label: '完成退款' }
        ],
        list: [],
        total: 0,
        listLoading: false,
        chartLoading: false,
        operationTypeChart: null,
        transitionTimeChart: null,
        statistic: {
          totalCount: 0,
          pendingCount: 0,
          processingCount: 0,
          completedCount: 0,
          handledRate: 0,
          completedRate: 0,
          avgProcessTime: 0
        },
        STATUS,
        OPERATION_TYPE
      }
    },
    created() {
      this.getStatistic();
      this.getList();
      this.getChartData();
    },
    mounted() {
      this.initCharts();
      window.addEventListener('resize', this.resizeCharts);
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.resizeCharts);
      if (this.operationTypeChart) {
        this.operationTypeChart.dispose();
      }
      if (this.transitionTimeChart) {
        this.transitionTimeChart.dispose();
      }
    },
    methods: {
      handleSearch() {
        if (this.dateRange && this.dateRange.length === 2) {
          this.listQuery.startTime = this.dateRange[0];
          this.listQuery.endTime = this.dateRange[1];
        } else {
          this.listQuery.startTime = null;
          this.listQuery.endTime = null;
        }
        this.listQuery.pageNum = 1;
        this.getList();
        this.getChartData();
      },
      handleReset() {
        this.listQuery = {
          operateType: null,
          operateMan: null,
          startTime: null,
          endTime: null,
          pageSize: 10,
          pageNum: 1
        };
        this.dateRange = null;
        this.getList();
        this.getChartData();
      },
      handleSizeChange(val) {
        this.listQuery.pageSize = val;
        this.getList();
      },
      handleCurrentChange(val) {
        this.listQuery.pageNum = val;
        this.getList();
      },
      getList() {
        this.listLoading = true;
        getOperationLogs(this.listQuery).then(response => {
          this.listLoading = false;
          this.list = response.data;
          this.total = response.data.length;
        }).catch(() => {
          this.listLoading = false;
        });
      },
      getStatistic() {
        getAfterSaleStatistic().then(response => {
          this.statistic = response.data;
        });
      },
      getChartData() {
        this.chartLoading = true;
        // 获取操作类型统计数据
        countOperationsByType({
          startTime: this.listQuery.startTime,
          endTime: this.listQuery.endTime,
          operateMan: this.listQuery.operateMan
        }).then(response => {
          this.updateOperationTypeChart(response.data);
        });
        
        // 获取状态转换时间统计数据
        getStatusTransitionTime({
          startTime: this.listQuery.startTime,
          endTime: this.listQuery.endTime
        }).then(response => {
          this.updateTransitionTimeChart(response.data);
          this.chartLoading = false;
        }).catch(() => {
          this.chartLoading = false;
        });
      },
      initCharts() {
        // 初始化操作类型分布图表
        this.operationTypeChart = echarts.init(document.getElementById('operationTypeChart'));
        
        // 初始化状态流转时间图表
        this.transitionTimeChart = echarts.init(document.getElementById('transitionTimeChart'));
      },
      updateOperationTypeChart(data) {
        if (!this.operationTypeChart) {
          return;
        }
        
        const chartData = data.map(item => {
          return {
            name: item.operate_type_name,
            value: item.count
          };
        });
        
        const option = {
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            left: 10,
            data: chartData.map(item => item.name)
          },
          series: [
            {
              name: '操作类型',
              type: 'pie',
              radius: ['50%', '70%'],
              avoidLabelOverlap: false,
              label: {
                show: false,
                position: 'center'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: '18',
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: false
              },
              data: chartData
            }
          ]
        };
        
        this.operationTypeChart.setOption(option);
      },
      updateTransitionTimeChart(data) {
        if (!this.transitionTimeChart) {
          return;
        }
        
        // 按状态转换分组数据
        const transitionMap = {};
        data.forEach(item => {
          const key = `${item.from_status_name} → ${item.to_status_name}`;
          if (!transitionMap[key]) {
            transitionMap[key] = [];
          }
          transitionMap[key].push(item.hours_spent);
        });
        
        // 计算每种状态转换的平均时间
        const transitions = [];
        const times = [];
        
        for (const key in transitionMap) {
          if (transitionMap.hasOwnProperty(key)) {
            const hours = transitionMap[key];
            const avgHours = hours.reduce((sum, h) => sum + h, 0) / hours.length;
            transitions.push(key);
            times.push(avgHours);
          }
        }
        
        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            },
            formatter: function(params) {
              const hours = params[0].value;
              let timeStr = '';
              if (hours < 24) {
                timeStr = hours.toFixed(1) + '小时';
              } else {
                const days = Math.floor(hours / 24);
                const remainingHours = (hours % 24).toFixed(1);
                timeStr = days + '天' + remainingHours + '小时';
              }
              return params[0].name + ': ' + timeStr;
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'value',
            boundaryGap: [0, 0.01],
            axisLabel: {
              formatter: function(value) {
                if (value === 0) return '0';
                if (value < 24) {
                  return value + 'h';
                } else {
                  return Math.floor(value / 24) + 'd';
                }
              }
            }
          },
          yAxis: {
            type: 'category',
            data: transitions
          },
          series: [
            {
              name: '平均处理时间',
              type: 'bar',
              data: times
            }
          ]
        };
        
        this.transitionTimeChart.setOption(option);
      },
      resizeCharts() {
        if (this.operationTypeChart) {
          this.operationTypeChart.resize();
        }
        if (this.transitionTimeChart) {
          this.transitionTimeChart.resize();
        }
      },
      formatTime(time) {
        if (time == null || time === '') {
          return 'N/A';
        }
        let date = new Date(time);
        return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
      },
      formatMoney(value) {
        if (!value) return '0.00';
        return parseFloat(value).toFixed(2);
      },
      formatAvgTime(hours) {
        if (!hours) return '0小时';
        if (hours < 24) {
          return hours.toFixed(1) + '小时';
        } else {
          const days = Math.floor(hours / 24);
          const remainingHours = (hours % 24).toFixed(1);
          return days + '天' + remainingHours + '小时';
        }
      },
      formatOperationType(type) {
        if(type == null) return '未知操作';
        
        const typeMap = {
          0: '处理中',
          1: '同意申请',
          2: '拒绝申请',
          3: '确认发货',
          4: '确认收货',
          5: '开始质检',
          6: '质检通过',
          7: '质检不通过',
          8: '发起退款',
          9: '完成退款'
        };
        
        return typeMap[type] || '未知操作';
      },
      formatStatus(status) {
        const statusMap = {
          0: "待处理",
          1: "已同意",
          2: "已拒绝",
          3: "已发货",
          4: "已收货",
          5: "质检中",
          6: "质检通过",
          7: "质检不通过",
          8: "退款中",
          9: "已完成"
        };
        return statusMap[status] || "未知状态";
      },
      getLogIconType(type) {
        const iconMap = {
          0: 'info',
          1: 'primary',
          2: 'danger',
          3: 'success',
          4: 'success',
          5: 'warning',
          6: 'success',
          7: 'danger',
          8: 'primary',
          9: 'success'
        };
        return iconMap[type] || 'info';
      }
    }
  }
</script>

<style scoped>
  .filter-container {
    margin-bottom: 20px;
  }
  
  .filter-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
    color: #303133;
  }
  
  .chart-section {
    margin-top: 20px;
  }
  
  .statistic-cards {
    margin-bottom: 20px;
  }
  
  .statistic-card {
    text-align: center;
    padding: 10px;
  }
  
  .statistic-value {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 5px;
    color: #409EFF;
  }
  
  .statistic-title {
    font-size: 14px;
    color: #606266;
  }
  
  .rate-cards {
    margin-bottom: 20px;
  }
  
  .rate-card {
    text-align: center;
    padding: 15px;
    height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
  .progress-container {
    margin-bottom: 15px;
  }
  
  .rate-title {
    font-size: 14px;
    color: #606266;
    margin-top: 10px;
  }
  
  .avg-time {
    height: 126px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .time-value {
    font-size: 24px;
    font-weight: bold;
    color: #409EFF;
  }
  
  .chart-row {
    margin-bottom: 20px;
  }
  
  .chart-card {
    height: 400px;
  }
  
  .chart-title {
    display: flex;
    align-items: center;
  }
  
  .chart-title i {
    margin-right: 8px;
    color: #409EFF;
  }
  
  .chart-container {
    padding: 10px;
    height: 330px;
  }
  
  .echarts-container {
    width: 100%;
    height: 100%;
  }
  
  .log-list-card {
    margin-top: 20px;
  }
  
  .log-title {
    display: flex;
    align-items: center;
  }
  
  .log-title i {
    margin-right: 8px;
    color: #409EFF;
  }
  
  .detail-row {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .detail-row > span {
    margin-bottom: 5px;
  }
  
  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }
</style> 