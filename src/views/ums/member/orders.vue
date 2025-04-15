<template>
  <div class="app-container">
    <!-- 顶部导航区域 -->
    <el-card class="header-card" shadow="hover">
      <div class="page-header">
        <div class="page-title">
          <i class="el-icon-tickets"></i>
          <span>会员订单详情</span>
        </div>
        <el-button 
          size="small" 
          class="btn-back" 
          type="primary"
          plain
          icon="el-icon-back"
          @click="goBack">
          返回
        </el-button>
      </div>
    </el-card>
    
    <!-- 会员信息卡片 -->
    <el-card class="member-card" shadow="hover" v-if="memberInfo">
      <div slot="header" class="clearfix">
        <span class="card-title">
          <i class="el-icon-user"></i>
          会员信息
        </span>
      </div>
      <div class="member-info-content">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <div class="info-label">
                <i class="el-icon-user-solid label-icon"></i>
                会员昵称：
              </div>
              <div class="info-value">{{memberInfo.nickname || '未设置'}}</div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <div class="info-label">
                <i class="el-icon-mobile-phone label-icon"></i>
                联系电话：
              </div>
              <div class="info-value">{{memberInfo.phone || '未设置'}}</div>
            </div>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <div class="info-label">
                <i class="el-icon-money label-icon"></i>
                总消费金额：
              </div>
              <div class="info-value price-value">￥{{memberInfo.totalAmount | formatPrice}}</div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <div class="info-label">
                <i class="el-icon-star-on label-icon"></i>
                总积分：
              </div>
              <div class="info-value">
                <el-tag size="medium" type="warning">{{memberInfo.integration || 0}}</el-tag>
              </div>
            </div>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <div class="info-label">
                <i class="el-icon-circle-check label-icon"></i>
                完成订单数：
              </div>
              <div class="info-value">
                <el-tag size="medium" type="success">{{memberInfo.completedOrderCount || 0}}</el-tag>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <div class="info-label">
                <i class="el-icon-circle-close label-icon"></i>
                退货订单数：
              </div>
              <div class="info-value">
                <el-tag size="medium" type="danger">{{memberInfo.returnOrderCount || 0}}</el-tag>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
    
    <!-- 订单列表卡片 -->
    <el-card class="orders-card" shadow="hover">
      <div slot="header" class="clearfix">
        <span class="card-title">
          <i class="el-icon-shopping-cart-full"></i>
          订单列表
        </span>
      </div>
      
      <!-- 筛选区域 -->
      <div class="filter-container">
        <el-form :inline="true" :model="listQuery" size="small" label-width="100px">
          <el-form-item label="订单编号：">
            <el-input v-model="listQuery.orderSn" 
                      placeholder="订单编号" 
                      clearable 
                      class="input-item">
              <template slot="prefix">
                <i class="el-icon-document" style="color: #909399"></i>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="支付方式：">
            <el-select v-model="listQuery.payType" placeholder="全部" clearable class="select-item">
              <el-option v-for="item in payTypeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="订单来源：">
            <el-select v-model="listQuery.sourceType" placeholder="全部" clearable class="select-item">
              <el-option v-for="item in sourceTypeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="订单状态：">
            <el-select v-model="listQuery.status" placeholder="全部" clearable class="select-item">
              <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="退货状态：">
            <el-select v-model="listQuery.returnStatus" placeholder="全部" clearable class="select-item">
              <el-option v-for="item in returnStatusOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
            <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 表格区域 -->
      <el-table 
        ref="orderTable"
        :data="list"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        v-loading="listLoading"
        border
        stripe
        highlight-current-row
        :header-cell-style="{background:'#f8f9fa',color:'#606266'}"
        row-key="id">
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        <el-table-column label="订单编号" width="160" align="center">
          <template slot-scope="scope">
            <div class="clickable-cell" @click="viewOrderDetail(scope.row)" v-if="scope.row.orderSn">
              <i class="el-icon-document order-icon"></i>
              <span class="order-sn">{{scope.row.orderSn}}</span>
            </div>
            <span v-else class="empty-data">暂无数据</span>
          </template>
        </el-table-column>
        <el-table-column label="提交时间" width="160" align="center">
          <template slot-scope="scope">
            <div class="time-info" v-if="scope.row.createTime">
              <i class="el-icon-time time-icon"></i>
              <span>{{scope.row.createTime | formatTime}}</span>
            </div>
            <span v-else class="empty-data">暂无数据</span>
          </template>
        </el-table-column>
        <el-table-column label="订单总金额" width="120" align="center">
          <template slot-scope="scope">
            <div class="price-info" v-if="scope.row.totalAmount !== undefined">
              <i class="el-icon-money price-icon"></i>
              <span class="price-value">￥{{scope.row.totalAmount | formatPrice}}</span>
            </div>
            <span v-else class="empty-data">暂无数据</span>
          </template>
        </el-table-column>
        <el-table-column label="应付金额" width="120" align="center">
          <template slot-scope="scope">
            <div class="price-info" v-if="scope.row.payAmount !== undefined">
              <i class="el-icon-wallet price-icon"></i>
              <span class="price-value">￥{{scope.row.payAmount | formatPrice}}</span>
            </div>
            <span v-else class="empty-data">暂无数据</span>
          </template>
        </el-table-column>
        <el-table-column label="支付方式" width="120" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.payType === 0" type="info" effect="plain">
              <i class="el-icon-warning-outline"></i> 未支付
            </el-tag>
            <el-tag v-else-if="scope.row.payType === 1" type="success" effect="plain">
              <i class="el-icon-bank-card"></i> 支付宝
            </el-tag>
            <el-tag v-else-if="scope.row.payType === 2" type="primary" effect="plain">
              <i class="el-icon-chat-dot-square"></i> 微信
            </el-tag>
            <el-tag v-else type="info" effect="plain">未知</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="订单来源" width="120" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.sourceType === 0" type="info" effect="plain">
              <i class="el-icon-monitor"></i> PC订单
            </el-tag>
            <el-tag v-else-if="scope.row.sourceType === 1" type="success" effect="plain">
              <i class="el-icon-mobile"></i> APP订单
            </el-tag>
            <el-tag v-else type="info" effect="plain">未知</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="订单状态" width="120" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 0" type="warning" effect="plain">
              <i class="el-icon-wallet"></i> 待付款
            </el-tag>
            <el-tag v-else-if="scope.row.status === 1" type="success" effect="plain">
              <i class="el-icon-goods"></i> 待发货
            </el-tag>
            <el-tag v-else-if="scope.row.status === 2" type="info" effect="plain">
              <i class="el-icon-truck"></i> 已发货
            </el-tag>
            <el-tag v-else-if="scope.row.status === 3" type="success" effect="plain">
              <i class="el-icon-circle-check"></i> 已完成
            </el-tag>
            <el-tag v-else-if="scope.row.status === 4" type="danger" effect="plain">
              <i class="el-icon-circle-close"></i> 已关闭
            </el-tag>
            <el-tag v-else-if="scope.row.status === 5" type="warning" effect="plain">
              <i class="el-icon-warning"></i> 无效订单
            </el-tag>
            <el-tag v-else type="info" effect="plain">未知</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="退货状态" width="120" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.returnStatus === 0 || scope.row.returnStatus === undefined || scope.row.returnStatus === null" 
                    type="success" 
                    effect="plain">
              <i class="el-icon-check"></i> 正常订单
            </el-tag>
            <el-tag v-else-if="scope.row.returnStatus === 1" type="warning" effect="plain">
              <i class="el-icon-loading"></i> 申请中
            </el-tag>
            <el-tag v-else-if="scope.row.returnStatus === 2" type="danger" effect="plain">
              <i class="el-icon-finished"></i> 已退货
            </el-tag>
            <el-tag v-else-if="scope.row.returnStatus === 3" type="info" effect="plain">
              <i class="el-icon-close"></i> 已拒绝
            </el-tag>
            <el-tag v-else type="info" effect="plain">未知</el-tag>
          </template>
        </el-table-column>
        
        <template slot="empty">
          <div class="empty-data-container">
            <i class="el-icon-shopping-cart-2"></i>
            <p>暂无订单数据</p>
          </div>
        </template>
      </el-table>
      
      <!-- 分页区域 -->
      <div class="pagination-container">
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          layout="total, sizes, prev, pager, next, jumper"
          :page-size="listQuery.pageSize"
          :page-sizes="[5, 10, 15, 20]"
          :current-page.sync="listQuery.pageNum"
          :total="total">
        </el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
  import {fetchMemberOrders, getMemberConsumption} from '@/api/member';
  import {formatDate} from '@/utils/date';

  export default {
    name: "memberOrders",
    data() {
      return {
        memberId: null,
        memberInfo: null,
        list: null,
        total: null,
        listLoading: true,
        listQuery: {
          pageNum: 1,
          pageSize: 15,
          orderSn: null,
          payType: null,
          sourceType: null,
          status: null,
          returnStatus: null
        },
        multipleSelection: [],
        // 支付方式选项
        payTypeOptions: [
          { value: 0, label: '未支付' },
          { value: 1, label: '支付宝' },
          { value: 2, label: '微信' }
        ],
        // 订单来源选项
        sourceTypeOptions: [
          { value: 0, label: 'PC订单' },
          { value: 1, label: 'APP订单' }
        ],
        // 订单状态选项
        statusOptions: [
          { value: 0, label: '待付款' },
          { value: 1, label: '待发货' },
          { value: 2, label: '已发货' },
          { value: 3, label: '已完成' },
          { value: 4, label: '已关闭' },
          { value: 5, label: '无效订单' }
        ],
        // 退货状态选项
        returnStatusOptions: [
          { value: 0, label: '正常订单' },
          { value: 1, label: '申请中' },
          { value: 2, label: '已退货' },
          { value: 3, label: '已拒绝' }
        ]
      }
    },
    created() {
      this.memberId = this.$route.query.id;
      if (this.memberId != null) {
        this.getMemberInfo();
        this.getList();
      }
    },
    filters: {
      formatTime(time) {
        if (time == null || time === '') {
          return 'N/A';
        }
        let date = new Date(time);
        return formatDate(date, 'yyyy-MM-dd hh:mm:ss');
      },
      formatPrice(price) {
        if (price == null || price === undefined) {
          return '0.00';
        }
        // 确保price是数值类型
        return Number(price).toFixed(2);
      }
    },
    methods: {
      getMemberInfo() {
        getMemberConsumption(this.memberId).then(response => {
          this.memberInfo = response.data;
          console.log('会员信息:', this.memberInfo);
        }).catch(error => {
          console.error('获取会员信息失败:', error);
        });
      },
      getList() {
        this.listLoading = true;
        fetchMemberOrders(this.memberId, this.listQuery).then(response => {
          this.listLoading = false;
          if (response.data) {
            this.list = response.data.list || [];
            this.total = response.data.total || 0;
            
            // 调试数据
            console.log('订单数据原始值:', JSON.stringify(this.list));
            
            // 检查和转换数据类型
            if (this.list && this.list.length > 0) {
              this.list = this.list.map(item => {
                // 确保金额字段是数值类型
                if (item.totalAmount) item.totalAmount = Number(item.totalAmount);
                if (item.payAmount) item.payAmount = Number(item.payAmount);
                
                // 确保状态字段是数值类型
                if (item.payType !== undefined) item.payType = Number(item.payType);
                if (item.sourceType !== undefined) item.sourceType = Number(item.sourceType);
                if (item.status !== undefined) item.status = Number(item.status);
                if (item.returnStatus !== undefined) item.returnStatus = Number(item.returnStatus);
                
                return item;
              });
              console.log('订单数据处理后:', this.list);
            }
          } else {
            this.list = [];
            this.total = 0;
            console.error('返回的数据格式不正确:', response);
          }
        }).catch(error => {
          console.error('获取订单数据失败:', error);
          this.listLoading = false;
          this.list = [];
          this.total = 0;
        });
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      handleSizeChange(val) {
        this.listQuery.pageNum = 1;
        this.listQuery.pageSize = val;
        this.getList();
      },
      handleCurrentChange(val) {
        this.listQuery.pageNum = val;
        this.getList();
      },
      // 筛选查询
      handleFilter() {
        this.listQuery.pageNum = 1;
        this.getList();
      },
      // 重置筛选条件
      handleReset() {
        this.listQuery = {
          pageNum: 1,
          pageSize: this.listQuery.pageSize,
          orderSn: null,
          payType: null,
          sourceType: null,
          status: null,
          returnStatus: null
        };
        this.getList();
      },
      goBack() {
        this.$router.back();
      },
      viewOrderDetail(order) {
        if (order && order.id) {
          this.$router.push({path: '/oms/orderDetail', query: {id: order.id}});
        } else {
          this.$message({
            message: '无法获取订单ID',
            type: 'warning'
          });
        }
      }
    }
  }
</script>

<style scoped>
  .app-container {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 84px);
  }
  
  /* 顶部导航 */
  .header-card {
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  }
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .page-title {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
    display: flex;
    align-items: center;
  }
  
  .page-title i {
    margin-right: 5px;
    color: #409EFF;
  }
  
  /* 会员信息卡片 */
  .member-card {
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  }
  
  .card-title {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
  }
  
  .card-title i {
    margin-right: 5px;
    color: #409EFF;
  }
  
  .member-info-content {
    padding: 10px;
  }
  
  .info-item {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .info-label {
    width: 150px;
    display: flex;
    align-items: center;
    color: #606266;
  }
  
  .label-icon {
    margin-right: 5px;
    color: #409EFF;
  }
  
  .info-value {
    flex: 1;
    color: #303133;
  }
  
  /* 订单列表卡片 */
  .orders-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  }
  
  /* 筛选区域 */
  .filter-container {
    padding: 10px 0;
    margin-bottom: 20px;
    border-bottom: 1px solid #ebeef5;
  }
  
  .input-item {
    width: 200px;
  }
  
  .select-item {
    width: 150px;
  }
  
  /* 表格样式 */
  .clickable-cell {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #409EFF;
  }
  
  .order-icon {
    margin-right: 5px;
  }
  
  .order-sn {
    text-decoration: none;
  }
  
  .clickable-cell:hover .order-sn {
    text-decoration: underline;
  }
  
  /* 时间信息样式 */
  .time-info {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .time-icon {
    margin-right: 5px;
    color: #909399;
  }
  
  /* 价格信息样式 */
  .price-info {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .price-icon {
    color: #E6A23C;
    margin-right: 5px;
  }
  
  .price-value {
    font-weight: bold;
    color: #E6A23C;
  }
  
  /* 空数据提示 */
  .empty-data {
    color: #909399;
    font-size: 12px;
  }
  
  .empty-data-container {
    padding: 40px 0;
    text-align: center;
    color: #909399;
  }
  
  .empty-data-container i {
    font-size: 50px;
    margin-bottom: 10px;
  }
  
  .empty-data-container p {
    margin: 0;
    font-size: 14px;
  }
  
  /* 分页样式 */
  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }
</style> 