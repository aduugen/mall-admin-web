<template>
  <div class="app-container">
    <div class="un-handle-layout">
      <div class="layout-title">今日看板</div>
      <div class="un-handle-content">
        <el-row :gutter="20">
          <el-col :span="4">
            <img :src="img_home_order" class="total-icon">
            <div class="total-title">订单数</div>
            <div class="total-value">{{ todayOrdersCount }}</div>
          </el-col>
          <el-col :span="4">
            <img :src="img_home_today_amount" class="total-icon">
            <div class="total-title">销售额</div>
            <div class="total-value">￥{{ todaySalesAmount }}</div>
          </el-col>
          <el-col :span="4">
            <img :src="today_new_member_icon" class="total-icon">
            <div class="total-title">新增会员</div>
            <div class="total-value">{{ todayNewMemberCount }}</div>
          </el-col>
          <el-col :span="4">
            <img :src="today_visited_icon" class="total-icon">
            <div class="total-title">访客数</div>
            <div class="total-value">{{ visitorStats ? visitorStats.totalCount : 0 }}</div>
          </el-col>
          <el-col :span="4">
            <img :src="online_visitor_icon" class="total-icon">
            <div class="total-title">在线访客数(30分钟内)</div>
            <div class="total-value">{{ visitorStats ? visitorStats.onlineCount : 0 }}</div>
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
      <el-row>
        <el-date-picker
          style="float: left;z-index: 1"
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
      </el-row>
      <el-row>
        <el-col :span="20">
          <div style="padding: 20px;border-left:1px solid #DCDFE6">
            <div>
              <ve-line
                :data="chartData"
                :loading="loading"
                :data-empty="dataEmpty"
                :settings="chartSettings"
                :extend="chartExtend"></ve-line>
            </div>
          </div>
        </el-col>
      </el-row>
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
              let start = new Date(2018,10,1);
              const end = new Date(start.getTime() + 1000 * 60 * 60 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一月',
            onClick(picker) {
              let start = new Date(2018,10,1);
              const end = new Date(start.getTime() + 1000 * 60 * 60 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一年',
            onClick(picker) {
              let end = new Date();
              let start = new Date();
              start.setFullYear(end.getFullYear() - 1);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近两年',
            onClick(picker) {
              let end = new Date();
              let start = new Date();
              start.setFullYear(end.getFullYear() - 2);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三年',
            onClick(picker) {
              let end = new Date();
              let start = new Date();
              start.setFullYear(end.getFullYear() - 3);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '开业至今',
            onClick(picker) {
              let end = new Date();
              let start = new Date(2018, 0, 1); // 假设开业时间为2018年1月1日
              picker.$emit('pick', [start, end]);
            }
          }]
        },
        orderCountDate: '',
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
          xAxis: {
            splitLine: {
              lineStyle: {
                type: 'dashed'
              }
            }
          },
          yAxis: {
            splitLine: {
              lineStyle: {
                type: 'dashed'
              }
            }
          }
        },
        chartData: {
          columns: [],
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
      this.initOrderCountDate();
      this.getData();
      getTodayOrdersCount().then(response => {
        this.todayOrdersCount = response.data;
      }).catch(error => {
        console.error('Error fetching orders count:', error);
      });
      getTodaySalesAmount().then(response => {
        this.todaySalesAmount = response.data;
      }).catch(error => {
        console.error('Error fetching orders amount:', error);
      });
      getProductOverview().then(response => {
        this.productOverview = response.data;
      }).catch(error => {
        console.error('Error fetching product overview:', error);
      });
      getTotalMemberCount().then(response => {
        this.totalMemberCount = response.data;
      }).catch(error => {
        console.error('Error fetching total member count:', error);
      });
      getOrderStatusStatistic().then(response => {
        this.orderStatusStatistic = response.data;
      }).catch(error => {
        console.error('Error fetching pending transaction statistics:', error);
      });
      getOrderReturnApplyStatistic().then(response => {
        this.orderReturnApplyStatistic = response.data;
        console.log(this.orderReturnApplyStatistic);
      }).catch(error => {
        console.error('Error fetching order return apply statistic:', error);
      });
      getTodayNewMemberCount().then(response => {
        this.todayNewMemberCount = response.data;
      }).catch(error => {
        console.error('Error fetching today new member count:', error);
      });
      getTodayVisitorStats().then(response => {
        this.visitorStats = response.data;
      }).catch(error => {
        console.error('Error fetching today visitor stats:', error);
      });
      getTotalVisitorCount().then(response => {
        this.totalVisitorCount = response.data;
      }).catch(error => {
        console.error('Error fetching total visitor count:', error);
      });
    },
    methods:{
      handleDateChange(){
        this.getData();
      },
      initOrderCountDate(){
        let start = new Date();
        start.setTime(start.getTime() - 7 * 24 * 60 * 60 * 1000); // 默认最近一周
        const end = new Date();
        this.orderCountDate=[start,end];
      },
      getData(){
        this.loading = true;
        // 格式化日期
        let startDate = this.formatDate(this.orderCountDate[0]);
        let endDate = this.formatDate(this.orderCountDate[1]);
        
        // 调用后端API获取数据
        getHomeChartData({
          startDate: startDate,
          endDate: endDate
        }).then(response => {
          this.chartData = {
            columns: ['date', 'orderCount', 'orderAmount', 'memberCount', 'activeMemberCount', 'visitorCount'],
            rows: response.data
          };
          this.dataEmpty = this.chartData.rows.length === 0;
          this.loading = false;
        }).catch(error => {
          console.error('Error fetching chart data:', error);
          this.loading = false;
          this.dataEmpty = true;
        });
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
    margin-top: 40px;
    margin-left: 120px;
    margin-right: 120px;
  }

  .address-layout {
  }

  .total-layout {
    margin-top: 20px;
  }

  .total-frame {
    border: 1px solid #DCDFE6;
    padding: 20px;
    height: 100px;
  }

  .total-icon {
    color: #409EFF;
    width: 65px;
    height: 65px;
  }

  .total-title {
    position: relative;
    font-size: 16px;
    color: #909399;
    left: 70px;
    top: -50px;
  }

  .total-value {
    position: relative;
    font-size: 18px;
    color: #606266;
    left: 70px;
    top: -40px;
  }

  .un-handle-layout {
    margin-top: 20px;
    border: 1px solid #DCDFE6;
  }

  .layout-title {
    color: #606266;
    padding: 15px 20px;
    background: #F2F6FC;
    font-weight: bold;
  }

  .un-handle-content {
    padding: 20px 40px;
  }

  .un-handle-item {
    border-bottom: 1px solid #EBEEF5;
    padding: 10px;
  }

  .overview-layout {
    margin-top: 20px;
  }

  .overview-item-value {
    font-size: 24px;
    text-align: center;
  }

  .overview-item-title {
    margin-top: 10px;
    text-align: center;
  }

  .out-border {
    border: 1px solid #DCDFE6;
  }

  .statistics-layout {
    margin-top: 20px;
    border: 1px solid #DCDFE6;
  }
  .mine-layout {
    position: absolute;
    right: 140px;
    top: 107px;
    width: 250px;
    height: 235px;
  }
  .address-content{
    padding: 20px;
    font-size: 18px
  }
</style>
