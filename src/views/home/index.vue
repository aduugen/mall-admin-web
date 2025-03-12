<template>
  <div class="app-container">
    <div class="un-handle-layout">
      <div class="layout-title">今日看板</div>
      <div class="un-handle-content">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="total-frame">
              <img :src="img_home_order" class="total-icon">
              <div class="total-title">订单数</div>
              <div class="total-value">{{ todayOrdersCount }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="total-frame">
              <img :src="img_home_today_amount" class="total-icon">
              <div class="total-title">销售额</div>
              <div class="total-value">￥{{ todaySalesAmount }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="total-frame">
              <img :src="today_new_member_icon" class="total-icon">
              <div class="total-title">新增会员</div>
              <div class="total-value">￥{{ todayNewMemberCount }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="total-frame">
              <img :src="today_visited_icon" class="total-icon">
              <div class="total-title">访客数</div>
              <div class="total-value">￥{{ todaySalesAmount }}</div>
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
              <div class="total-value">{{orderStatusStatistic.wait_pay_count}}</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="un-handle-item">
              <img :src="wait_ship_icon" class="total-icon">
              <div class="total-title">待发货订单</div>
              <div class="total-value">{{ orderStatusStatistic.wait_ship_count }}</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="un-handle-item">
              <img :src="shipped_icon" class="total-icon">
              <div class="total-title">已发货订单</div>
              <div class="total-value">{{ orderStatusStatistic.shipped_count }}</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="un-handle-item">
              <img :src="completed_icon" class="total-icon">
              <div class="total-title">已完成订单</div>
              <div class="total-value">{{ orderStatusStatistic.completed_count }}</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="un-handle-item">
              <img :src="invalid_icon" class="total-icon">
              <div class="total-title">错误订单</div>
              <div class="total-value">{{ orderStatusStatistic.invalid_count }}</div>
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
              <div class="total-value">{{ orderReturnApplyStatistic.wait_handle_count }}</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="un-handle-item">
              <img :src="return_processing_icon" class="total-icon">
              <div class="total-title">退货处理中订单</div>
              <div class="total-value">{{ orderReturnApplyStatistic.return_processing_count }}</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="un-handle-item">
              <img :src="return_received_icon" class="total-icon">
              <div class="total-title">退货已接收订单</div>
              <div class="total-value">{{ orderReturnApplyStatistic.return_received_count }}</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="un-handle-item">
              <img :src="rejected_icon" class="total-icon">
              <div class="total-title">拒绝退货订单</div>
              <div class="total-value">{{ orderReturnApplyStatistic.rejected_count }}</div>
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
              <div class="total-value">{{ productOverview.product_off_shelf_count }}</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="un-handle-item">
              <img :src="product_on_shelf_icon" class="total-icon">
              <div class="total-title">已上架</div>
              <div class="total-value">{{ productOverview.product_on_shelf_count }}</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="un-handle-item">
              <img :src="product_total_icon" class="total-icon">
              <div class="total-title">全部商品</div>
              <div class="total-value">{{ productOverview.product_total_count }}</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <div class="un-handle-layout">
      <div class="layout-title">用户总览</div>
      <div class="un-handle-content">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="un-handle-item">
              <img :src="member_total_icon" class="total-icon">
              <div class="total-title">会员总数</div>
              <div class="total-value">{{ totalMemberCount }}</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <div class="un-handle-layout">
      <div class="layout-title">订单统计</div>
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
                :legend-visible="false"
                :loading="loading"
                :data-empty="dataEmpty"
                :settings="chartSettings"></ve-line>
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
  import {getTodayOrdersCount, getTodaySalesAmount, getOrderStatusStatistic} from '@/api/order';
  import {getProductOverview} from '@/api/product';
  import {getTotalMemberCount, getTodayNewMemberCount} from '@/api/member';
  import {getOrderReturnApplyStatistic} from '@/api/orderReturnApply';

  const DATA_FROM_BACKEND = {
    columns: ['date', 'orderCount','orderAmount'],
    rows: [
      {date: '2018-11-01', orderCount: 10, orderAmount: 1093},
      {date: '2018-11-02', orderCount: 20, orderAmount: 2230},
      {date: '2018-11-03', orderCount: 33, orderAmount: 3623},
      {date: '2018-11-04', orderCount: 50, orderAmount: 6423},
      {date: '2018-11-05', orderCount: 80, orderAmount: 8492},
      {date: '2018-11-06', orderCount: 60, orderAmount: 6293},
      {date: '2018-11-07', orderCount: 20, orderAmount: 2293},
      {date: '2018-11-08', orderCount: 60, orderAmount: 6293},
      {date: '2018-11-09', orderCount: 50, orderAmount: 5293},
      {date: '2018-11-10', orderCount: 30, orderAmount: 3293},
      {date: '2018-11-11', orderCount: 20, orderAmount: 2293},
      {date: '2018-11-12', orderCount: 80, orderAmount: 8293},
      {date: '2018-11-13', orderCount: 100, orderAmount: 10293},
      {date: '2018-11-14', orderCount: 10, orderAmount: 1293},
      {date: '2018-11-15', orderCount: 40, orderAmount: 4293}
    ]
  };
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
          }]
        },
        orderCountDate: '',
        chartSettings: {
          xAxisType: 'time',
          area:true,
          axisSite: { right: ['orderAmount']},
        labelMap: {'orderCount': '订单数量', 'orderAmount': '订单金额'}},
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
        todayOrdersCount: 0,
        todaySalesAmount: 0,
        totalMemberCount: 0,
        todayNewMemberCount: 0,
        productOverview: null,
        orderStatusStatistic: null,
        orderReturnApplyStatistic: null
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
      }).catch(error => {
        console.error('Error fetching order return apply statistic:', error);
      });
      getTodayNewMemberCount().then(response => {
        this.todayNewMemberCount = response.data;
      }).catch(error => {
        console.error('Error fetching today new member count:', error);
      });
    },
    methods:{
      handleDateChange(){
        this.getData();
      },
      initOrderCountDate(){
        let start = new Date(2018,10,1);
        const end = new Date(start.getTime() + 1000 * 60 * 60 * 24 * 7);
        this.orderCountDate=[start,end];
      },
      getData(){
        setTimeout(() => {
          this.chartData = {
            columns: ['date', 'orderCount','orderAmount'],
            rows: []
          };
          for(let i=0;i<DATA_FROM_BACKEND.rows.length;i++){
            let item=DATA_FROM_BACKEND.rows[i];
            let currDate=str2Date(item.date);
            let start=this.orderCountDate[0];
            let end=this.orderCountDate[1];
            if(currDate.getTime()>=start.getTime()&&currDate.getTime()<=end.getTime()){
              this.chartData.rows.push(item);
            }
          }
          this.dataEmpty = false;
          this.loading = false
        }, 1000)
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
