<template>
  <div class="app-container">
    <div class="un-handle-layout">
      <div class="layout-title">今日看板</div>
      <div class="un-handle-content today-data">
        <el-row :gutter="20">
          <el-col :span="4">
            <div class="un-handle-item">
              <img :src="img_home_order" class="total-icon">
              <div class="total-title">订单数</div>
              <div class="total-value">{{ todayOrdersCount }}</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="un-handle-item">
              <img :src="img_home_today_amount" class="total-icon">
              <div class="total-title">销售额</div>
              <div class="total-value">￥{{ todaySalesAmount }}</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="un-handle-item">
              <img :src="today_new_member_icon" class="total-icon">
              <div class="total-title">新增会员</div>
              <div class="total-value">{{ todayNewMemberCount }}</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="un-handle-item">
              <img :src="today_visited_icon" class="total-icon">
              <div class="total-title">访客数</div>
              <div class="total-value">{{ visitorStats ? visitorStats.totalCount : 0 }}</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="un-handle-item">
              <img :src="online_visitor_icon" class="total-icon">
              <div class="total-title">在线访客数</div>
              <div class="total-value">{{ visitorStats ? visitorStats.onlineCount : 0 }}</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <div class="un-handle-layout">
      <div class="layout-title">订单事务总览</div>
      <div class="un-handle-content">
        <el-row :gutter="20">
          <el-col :span="4">
            <div class="un-handle-item">
              <img :src="wait_pay_icon" class="total-icon">
              <div class="total-title">待付款订单</div>
              <div class="total-value">{{orderStatusStatistic ? orderStatusStatistic.wait_pay_count : 0}}</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="un-handle-item">
              <img :src="wait_ship_icon" class="total-icon">
              <div class="total-title">待发货订单</div>
              <div class="total-value">{{ orderStatusStatistic ? orderStatusStatistic.wait_ship_count : 0 }}</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="un-handle-item">
              <img :src="shipped_icon" class="total-icon">
              <div class="total-title">已发货订单</div>
              <div class="total-value">{{ orderStatusStatistic ? orderStatusStatistic.shipped_count : 0 }}</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="un-handle-item">
              <img :src="completed_icon" class="total-icon">
              <div class="total-title">已完成订单</div>
              <div class="total-value">{{ orderStatusStatistic ? orderStatusStatistic.completed_count : 0 }}</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="un-handle-item">
              <img :src="invalid_icon" class="total-icon">
              <div class="total-title">错误订单</div>
              <div class="total-value">{{ orderStatusStatistic ? orderStatusStatistic.invalid_count : 0 }}</div>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="4">
            <div class="un-handle-item">
              <img :src="wait_handle_icon" class="total-icon">
              <div class="total-title">待处理退货订单</div>
              <div class="total-value">{{ orderReturnApplyStatistic ? orderReturnApplyStatistic.pendingCount : 0 }}</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="un-handle-item">
              <img :src="return_processing_icon" class="total-icon">
              <div class="total-title">退货处理中订单</div>
              <div class="total-value">{{ orderReturnApplyStatistic ? orderReturnApplyStatistic.processingCount : 0 }}</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="un-handle-item">
              <img :src="return_received_icon" class="total-icon">
              <div class="total-title">退货已接收订单</div>
              <div class="total-value">{{ orderReturnApplyStatistic ? orderReturnApplyStatistic.finishedCount : 0 }}</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="un-handle-item">
              <img :src="rejected_icon" class="total-icon">
              <div class="total-title">拒绝退货订单</div>
              <div class="total-value">{{ orderReturnApplyStatistic ? orderReturnApplyStatistic.rejectedCount : 0 }}</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <div class="un-handle-layout">
      <div class="layout-title">商品(SPU)总览</div>
      <div class="un-handle-content">
        <el-row :gutter="20">
          <el-col :span="4">
            <div class="un-handle-item">
              <img :src="product_off_shelf_icon" class="total-icon">
              <div class="total-title">已下架</div>
              <div class="total-value">{{ productOverview ? productOverview.product_off_shelf_count : 0 }}</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="un-handle-item">
              <img :src="product_on_shelf_icon" class="total-icon">
              <div class="total-title">已上架</div>
              <div class="total-value">{{ productOverview ? productOverview.product_on_shelf_count : 0 }}</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="un-handle-item">
              <img :src="product_total_icon" class="total-icon">
              <div class="total-title">全部商品</div>
              <div class="total-value">{{ productOverview ? productOverview.product_total_count : 0 }}</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <div class="un-handle-layout">
      <div class="layout-title">用户总览</div>
      <div class="un-handle-content">
        <el-row :gutter="20">
          <el-col :span="4">
            <div class="un-handle-item">
              <img :src="member_total_icon" class="total-icon">
              <div class="total-title">会员总数</div>
              <div class="total-value">{{ totalMemberCount }}</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="un-handle-item">
              <img :src="total_visited_icon" class="total-icon">
              <div class="total-title">访客总数</div>
              <div class="total-value">{{ totalVisitorCount }}</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <div class="un-handle-layout">
      <div class="layout-title">运营统计曲线</div>
      <div class="date-picker-container">
        <el-date-picker
          size="small"
          v-model="orderCountDate"
          type="daterange"
          align="right"
          unlink-panels
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="handleDateChange"
          :picker-options="pickerOptions">
        </el-date-picker>
      </div>
      <div class="un-handle-content">
        <el-row>
          <el-col :span="24">
            <div v-if="chartData && chartData.rows">
              <div v-if="loading" class="chart-loading">
                <div class="loading-spinner">
                  <i class="el-icon-loading"></i>
                  <p>数据加载中...</p>
                </div>
              </div>
              <div v-else-if="dataEmpty" class="chart-empty">
                <i class="el-icon-document"></i>
                <p>暂无统计数据</p>
              </div>
              <div v-else>
                <ve-line
                  :data="chartData"
                  :loading="loading"
                  :settings="chartSettings"
                  :extend="chartExtend"
                  height="400px"></ve-line>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
  import {str2Date} from '@/utils/date';
  import img_home_order from '@/assets/images/home_order.png';
  import img_home_today_amount from '@/assets/images/home_today_amount.png';
  import img_home_yesterday_amount from '@/assets/images/home_yesterday_amount.png';
  import wait_pay_icon from '@/assets/images/wait_pay.png';
  import wait_ship_icon from '@/assets/images/wait_ship.png';
  import shipped_icon from '@/assets/images/shipped.png';
  import completed_icon from '@/assets/images/completed.png';
  import invalid_icon from '@/assets/images/invalid.png';
  import return_processing_icon from '@/assets/images/return_processing.png';
  import return_received_icon from '@/assets/images/return_received.png';
  import rejected_icon from '@/assets/images/rejected.png';
  import wait_handle_icon from '@/assets/images/wait_handle.png';
  import product_off_shelf_icon from '@/assets/images/product_off_shelf.png';
  import product_on_shelf_icon from '@/assets/images/product_on_shelf.png';
  import product_total_icon from '@/assets/images/product_total.png';
  import member_total_icon from '@/assets/images/member_total.png';
  import today_new_member_icon from '@/assets/images/today_new_member.png';
  import today_visited_icon from '@/assets/images/today_visited.png';
  import total_visited_icon from '@/assets/images/total_visited.png';
  import online_visitor_icon from '@/assets/images/online_visitor.png'; 
  import {getTodayOrdersCount, getTodaySalesAmount, getOrderStatusStatistic} from '@/api/order';
  import {getProductOverview} from '@/api/product';
  import {getTotalMemberCount, getTodayNewMemberCount} from '@/api/member';
  import {getOrderReturnApplyStatistic} from '@/api/orderReturnApply';
  import {getTodayVisitorStats, getTotalVisitorCount} from '@/api/visitor';
  import {getHomeChartData} from '@/api/home';

  export default {
    name: 'home',
    data() {
      return {
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
            text: '最近一月',
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
        orderCountDate: null,
        chartSettings: {
          xAxisType: 'time',
          area: false,
          axisSite: { 
            right: ['orderAmount']
          },
          yAxisName: ['数量', '金额'],
          labelMap: {
            'orderCount': '订单数量', 
            'orderAmount': '订单金额', 
            'memberCount': '会员数量', 
            'activeMemberCount': '活跃会员数量', 
            'visitorCount': '访客数量'
          }
        },
        chartExtend: {
          color: ['#1E3A8A', '#4F46E5', '#3B82F6', '#60A5FA', '#93C5FD'],
          legend: {
            show: true,
            textStyle: {
              color: '#303133'
            }
          },
          xAxis: {
            axisLine: {
              lineStyle: {
                color: '#909399'
              }
            },
            splitLine: {
              show: true,
              lineStyle: {
                type: 'dashed',
                color: '#E4E7ED'
              }
            }
          },
          yAxis: {
            axisLine: {
              lineStyle: {
                color: '#909399'
              }
            },
            splitLine: {
              show: true,
              lineStyle: {
                type: 'dashed',
                color: '#E4E7ED'
              }
            }
          }
        },
        chartData: {
          columns: ['date', 'orderCount', 'orderAmount', 'memberCount', 'activeMemberCount', 'visitorCount'],
          rows: []
        },
        loading: false,
        dataEmpty: false,
        img_home_order,
        img_home_today_amount,
        img_home_yesterday_amount,
        wait_pay_icon,
        wait_ship_icon,
        shipped_icon,
        completed_icon,
        invalid_icon,
        return_processing_icon,
        return_received_icon,
        rejected_icon,
        wait_handle_icon,
        product_off_shelf_icon,
        product_on_shelf_icon,
        product_total_icon,
        member_total_icon,
        today_new_member_icon,
        today_visited_icon,
        total_visited_icon,
        online_visitor_icon,
        todayOrdersCount: 0,
        todaySalesAmount: 0,
        totalMemberCount: 0,
        todayNewMemberCount: 0,
        productOverview: null,
        orderStatusStatistic: null,
        orderReturnApplyStatistic: null,
        visitorStats: null,
        totalVisitorCount: 0
      }
    },
    created(){
      // 优先初始化日期范围
      this.initOrderCountDate();
      
      // 确保其他指标初始化
      this.getData();
      
      // 分别请求各项数据
      this.fetchTodayOrdersCount();
      this.fetchTodaySalesAmount();
      this.fetchProductOverview();
      this.fetchTotalMemberCount();
      this.fetchOrderStatusStatistic();
      this.fetchOrderReturnApplyStatistic();
      this.fetchTodayNewMemberCount();
      this.fetchTodayVisitorStats();
      this.fetchTotalVisitorCount();
    },
    methods:{
      // 各模块数据请求方法
      fetchTodayOrdersCount() {
        getTodayOrdersCount().then(response => {
          this.todayOrdersCount = response.data;
        }).catch(error => {
          console.error('Error fetching orders count:', error);
        });
      },
      fetchTodaySalesAmount() {
        getTodaySalesAmount().then(response => {
          this.todaySalesAmount = response.data;
        }).catch(error => {
          console.error('Error fetching orders amount:', error);
        });
      },
      fetchProductOverview() {
        getProductOverview().then(response => {
          this.productOverview = response.data;
        }).catch(error => {
          console.error('Error fetching product overview:', error);
        });
      },
      fetchTotalMemberCount() {
        getTotalMemberCount().then(response => {
          this.totalMemberCount = response.data;
        }).catch(error => {
          console.error('Error fetching total member count:', error);
        });
      },
      fetchOrderStatusStatistic() {
        getOrderStatusStatistic().then(response => {
          this.orderStatusStatistic = response.data;
        }).catch(error => {
          console.error('Error fetching order status statistics:', error);
        });
      },
      fetchOrderReturnApplyStatistic() {
        getOrderReturnApplyStatistic().then(response => {
          this.orderReturnApplyStatistic = response.data;
        }).catch(error => {
          console.error('Error fetching order return apply statistic:', error);
        });
      },
      fetchTodayNewMemberCount() {
        getTodayNewMemberCount().then(response => {
          this.todayNewMemberCount = response.data;
        }).catch(error => {
          console.error('Error fetching today new member count:', error);
        });
      },
      fetchTodayVisitorStats() {
        getTodayVisitorStats().then(response => {
          this.visitorStats = response.data;
        }).catch(error => {
          console.error('Error fetching today visitor stats:', error);
        });
      },
      fetchTotalVisitorCount() {
        getTotalVisitorCount().then(response => {
          this.totalVisitorCount = response.data;
        }).catch(error => {
          console.error('Error fetching total visitor count:', error);
        });
      },
      
      // 图表相关方法
      handleDateChange(){
        this.getData();
      },
      initOrderCountDate(){
        if (!this.orderCountDate) {
          const end = new Date();
          const start = new Date();
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 7); // 默认最近一周
          this.orderCountDate = [start, end];
        }
      },
      getData(){
        if (!this.orderCountDate || !this.orderCountDate[0] || !this.orderCountDate[1]) {
          this.initOrderCountDate();
        }
        
        this.loading = true;
        this.dataEmpty = false;
        
        try {
          // 格式化日期
          const startDate = this.formatDate(this.orderCountDate[0]);
          const endDate = this.formatDate(this.orderCountDate[1]);
          
          // 调用后端API获取数据
          getHomeChartData({
            startDate: startDate,
            endDate: endDate
          }).then(response => {
            if(response.data && Array.isArray(response.data)) {
              // 确保图表数据更新
              this.$set(this.chartData, 'rows', response.data);
              this.dataEmpty = response.data.length === 0;
            } else {
              console.warn('Home chart data is not an array:', response.data);
              this.$set(this.chartData, 'rows', []);
              this.dataEmpty = true;
            }
          }).catch(error => {
            console.error('Error fetching chart data:', error);
            this.$set(this.chartData, 'rows', []);
            this.dataEmpty = true;
          }).finally(() => {
            this.loading = false;
          });
        } catch (error) {
          console.error('Error in getData method:', error);
          this.$set(this.chartData, 'rows', []);
          this.dataEmpty = true;
          this.loading = false;
        }
      },
      formatDate(date) {
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        month = month < 10 ? '0' + month : month;
        day = day < 10 ? '0' + day : day;
        return `${year}-${month}-${day}`;
      }
    }
  }
</script>

<style scoped>
  .app-container {
    margin-top: 20px;
    margin-left: 20px;
    margin-right: 20px;
  }

  .un-handle-layout {
    margin-top: 20px;
    border-radius: 8px;
    border: 1px solid #EBEEF5;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    overflow: hidden;
    transition: all 0.3s;
  }
  
  .un-handle-layout:hover {
    box-shadow: 0 4px 15px 0 rgba(0, 0, 0, 0.1);
  }

  .layout-title {
    color: #303133;
    padding: 15px 20px;
    background: #F2F6FC;
    font-weight: 600;
    font-size: 16px;
    border-bottom: 1px solid #EBEEF5;
    position: relative;
  }
  
  .layout-title:before {
    content: '';
    position: absolute;
    left: 0;
    top: 15px;
    height: 16px;
    width: 4px;
    background: #409EFF;
  }

  .un-handle-layout:nth-child(5) .layout-title:before {
    background: #1E3A8A;
  }

  .un-handle-content {
    padding: 20px;
    background: #fff;
  }

  .total-icon {
    width: 65px;
    height: 65px;
    border-radius: 50%;
    padding: 10px;
    background: rgba(64, 158, 255, 0.1);
    margin-bottom: 10px;
    transition: all 0.3s;
  }
  
  .un-handle-item:hover .total-icon {
    transform: scale(1.05);
    background: rgba(64, 158, 255, 0.2);
  }

  .total-title {
    position: relative;
    font-size: 14px;
    color: #606266;
    left: 70px;
    top: -60px;
    margin-bottom: -15px;
  }

  .total-value {
    position: relative;
    font-size: 22px;
    font-weight: 600;
    color: #1E3A8A;
    left: 70px;
    top: -45px;
    transition: all 0.3s;
    text-shadow: 0 1px 2px rgba(30, 58, 138, 0.1);
  }
  
  .un-handle-item:hover .total-value {
    transform: scale(1.05);
    text-shadow: 0 2px 4px rgba(30, 58, 138, 0.2);
  }
  
  /* 重点数据样式 */
  .el-col:nth-child(2) .total-value {
    color: #1E3A8A;
    font-weight: 700;
  }
  
  /* 图表标题样式优化 */
  .layout-title:contains("运营统计曲线"):before {
    background: #1E3A8A;
  }

  .today-data .un-handle-item {
    padding: 10px 15px;
    border-radius: 8px;
    background: #fff;
    margin-bottom: 0;
    transition: all 0.3s ease;
  }
  
  .today-data .un-handle-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  
  .today-data .total-icon {
    background: rgba(64, 158, 255, 0.1);
  }
  
  .today-data .el-col:nth-child(1) .total-icon {
    background: rgba(103, 194, 58, 0.1);
  }
  
  .today-data .el-col:nth-child(2) .total-icon {
    background: rgba(245, 108, 108, 0.1);
  }
  
  .today-data .el-col:nth-child(3) .total-icon {
    background: rgba(230, 162, 60, 0.1);
  }
  
  .today-data .el-col:nth-child(4) .total-icon {
    background: rgba(144, 147, 153, 0.1);
  }
  
  .today-data .el-col:nth-child(5) .total-icon {
    background: rgba(100, 102, 254, 0.1);
  }

  /* 图表相关样式 */
  .chart-loading {
    min-height: 350px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: #F8F9FB;
    border-radius: 6px;
  }
   
  .loading-spinner {
    text-align: center;
    color: #909399;
  }
   
  .loading-spinner i {
    font-size: 32px;
    margin-bottom: 10px;
    animation: rotate 1.5s linear infinite;
  }
  
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
   
  .loading-spinner p {
    font-size: 14px;
  }
    
  .chart-empty {
    min-height: 350px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #909399;
    background: #F8F9FB;
    border-radius: 6px;
  }
  
  .chart-empty i {
    font-size: 48px;
    margin-bottom: 20px;
    color: #DCDFE6;
  }
  
  .chart-empty p {
    font-size: 16px;
  }
  
  /* 日期选择器样式优化 */
  .date-picker-container {
    margin-bottom: 15px;
    display: flex;
    justify-content: flex-start;
    padding: 0 20px;
  }

  .un-handle-item {
    border-radius: 6px;
    background: #F8F9FB;
    padding: 15px;
    margin-bottom: 15px;
    transition: all 0.3s;
    border: 1px solid transparent;
  }
  
  .un-handle-item:hover {
    background: #ffffff;
    border-color: #EBEEF5;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }
</style>
