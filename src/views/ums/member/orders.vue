<template>
  <div class="app-container">
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>会员订单详情</span>
      <el-button 
        size="mini" 
        class="btn-back" 
        @click="goBack">
        <i class="el-icon-back"></i> 返回
      </el-button>
    </el-card>
    <div class="member-info" v-if="memberInfo">
      <el-card class="box-card" style="margin-top: 15px">
        <div slot="header" class="clearfix">
          <span>会员信息</span>
        </div>
        <div>
          <table class="table">
            <tr>
              <th>会员昵称：</th>
              <td>{{memberInfo.nickname}}</td>
              <th>联系电话：</th>
              <td>{{memberInfo.phone}}</td>
            </tr>
            <tr>
              <th>总消费金额：</th>
              <td>￥{{memberInfo.totalAmount | formatPrice}}</td>
              <th>总积分：</th>
              <td>{{memberInfo.integration}}</td>
            </tr>
            <tr>
              <th>完成订单数：</th>
              <td>{{memberInfo.completedOrderCount}}</td>
              <th>退货订单数：</th>
              <td>{{memberInfo.returnOrderCount}}</td>
            </tr>
          </table>
        </div>
      </el-card>
    </div>
    
    <el-card class="box-card" style="margin-top: 15px">
      <div slot="header" class="clearfix">
        <span>订单列表</span>
      </div>
      <div class="filter-container">
        <el-form :inline="true" :model="listQuery" size="small" label-width="100px">
          <el-form-item label="订单编号：">
            <el-input v-model="listQuery.orderSn" placeholder="订单编号" clearable style="width: 200px"></el-input>
          </el-form-item>
          <el-form-item label="支付方式：">
            <el-select v-model="listQuery.payType" placeholder="全部" clearable style="width: 150px">
              <el-option v-for="item in payTypeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="订单来源：">
            <el-select v-model="listQuery.sourceType" placeholder="全部" clearable style="width: 150px">
              <el-option v-for="item in sourceTypeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="订单状态：">
            <el-select v-model="listQuery.status" placeholder="全部" clearable style="width: 150px">
              <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="退货状态：">
            <el-select v-model="listQuery.returnStatus" placeholder="全部" clearable style="width: 150px">
              <el-option v-for="item in returnStatusOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleFilter">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="table-container">
        <el-table ref="orderTable"
                  :data="list"
                  style="width: 100%"
                  @selection-change="handleSelectionChange"
                  v-loading="listLoading"
                  border>
          <el-table-column type="selection" width="60" align="center"></el-table-column>
          <el-table-column label="订单编号" width="160" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.orderSn" class="order-sn" @click="viewOrderDetail(scope.row)">{{scope.row.orderSn}}</span>
              <span v-else class="empty-data">暂无数据</span>
            </template>
          </el-table-column>
          <el-table-column label="提交时间" width="160" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.createTime">{{scope.row.createTime | formatTime}}</span>
              <span v-else class="empty-data">暂无数据</span>
            </template>
          </el-table-column>
          <el-table-column label="订单总金额" width="120" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.totalAmount !== undefined">￥{{scope.row.totalAmount | formatPrice}}</span>
              <span v-else class="empty-data">暂无数据</span>
            </template>
          </el-table-column>
          <el-table-column label="应付金额" width="120" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.payAmount !== undefined">￥{{scope.row.payAmount | formatPrice}}</span>
              <span v-else class="empty-data">暂无数据</span>
            </template>
          </el-table-column>
          <el-table-column label="支付方式" width="120" align="center">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.payType === 0">未支付</el-tag>
              <el-tag v-else-if="scope.row.payType === 1" type="success">支付宝</el-tag>
              <el-tag v-else-if="scope.row.payType === 2" type="primary">微信</el-tag>
              <el-tag v-else type="info">未知</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="订单来源" width="120" align="center">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.sourceType === 0">PC订单</el-tag>
              <el-tag v-else-if="scope.row.sourceType === 1" type="success">APP订单</el-tag>
              <el-tag v-else type="info">未知</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="订单状态" width="120" align="center">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.status === 0">待付款</el-tag>
              <el-tag v-else-if="scope.row.status === 1" type="success">待发货</el-tag>
              <el-tag v-else-if="scope.row.status === 2" type="info">已发货</el-tag>
              <el-tag v-else-if="scope.row.status === 3" type="success">已完成</el-tag>
              <el-tag v-else-if="scope.row.status === 4" type="danger">已关闭</el-tag>
              <el-tag v-else-if="scope.row.status === 5" type="warning">无效订单</el-tag>
              <el-tag v-else type="info">未知</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="退货状态" width="120" align="center">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.returnStatus === 0 || scope.row.returnStatus === undefined || scope.row.returnStatus === null" type="success">正常订单</el-tag>
              <el-tag v-else-if="scope.row.returnStatus === 1" type="warning">申请中</el-tag>
              <el-tag v-else-if="scope.row.returnStatus === 2" type="danger">已退货</el-tag>
              <el-tag v-else-if="scope.row.returnStatus === 3" type="info">已拒绝</el-tag>
              <el-tag v-else type="info">未知</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination-container">
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          layout="total, sizes,prev, pager, next,jumper"
          :page-size="listQuery.pageSize"
          :page-sizes="[5, 10, 15]"
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
  .box-card {
    width: 100%;
    margin-bottom: 15px;
  }
  .table {
    width: 100%;
    margin: 15px 0;
    border: 1px solid #dcdfe6;
    border-collapse: collapse;
  }
  .table th {
    text-align: right;
    font-weight: normal;
    color: #303133;
    width: 150px;
    padding: 15px 20px;
    border: 1px solid #dcdfe6;
  }
  .table td {
    padding: 15px 20px;
    border: 1px solid #dcdfe6;
  }
  .operate-container {
    position: relative;
  }
  .btn-back {
    position: absolute;
    right: 20px;
    top: 12px;
  }
  .table-container {
    margin-top: 20px;
  }
  .pagination-container {
    display: inline-block;
    float: right;
    margin-top: 20px;
  }
  .empty-data {
    color: #909399;
    font-size: 12px;
  }
  .order-sn {
    color: #409EFF;
    cursor: pointer;
  }
  .order-sn:hover {
    text-decoration: underline;
  }
  .filter-container {
    margin-bottom: 20px;
  }
</style> 