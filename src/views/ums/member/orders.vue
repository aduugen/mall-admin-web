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
      <div class="table-container">
        <el-table ref="orderTable"
                  :data="list"
                  style="width: 100%"
                  @selection-change="handleSelectionChange"
                  v-loading="listLoading"
                  border>
          <el-table-column type="selection" width="60" align="center"></el-table-column>
          <el-table-column label="订单编号" width="160" align="center">
            <template slot-scope="scope">{{scope.row.orderSn}}</template>
          </el-table-column>
          <el-table-column label="提交时间" width="160" align="center">
            <template slot-scope="scope">{{scope.row.createTime | formatTime}}</template>
          </el-table-column>
          <el-table-column label="订单总金额" width="120" align="center">
            <template slot-scope="scope">￥{{scope.row.totalAmount | formatPrice}}</template>
          </el-table-column>
          <el-table-column label="应付金额" width="120" align="center">
            <template slot-scope="scope">￥{{scope.row.payAmount | formatPrice}}</template>
          </el-table-column>
          <el-table-column label="支付方式" width="120" align="center">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.payType===0">未支付</el-tag>
              <el-tag v-if="scope.row.payType===1" type="success">支付宝</el-tag>
              <el-tag v-if="scope.row.payType===2" type="primary">微信</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="订单来源" width="120" align="center">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.sourceType===0">PC订单</el-tag>
              <el-tag v-if="scope.row.sourceType===1" type="success">APP订单</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="订单状态" width="120" align="center">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.status===0">待付款</el-tag>
              <el-tag v-if="scope.row.status===1" type="success">待发货</el-tag>
              <el-tag v-if="scope.row.status===2" type="info">已发货</el-tag>
              <el-tag v-if="scope.row.status===3" type="success">已完成</el-tag>
              <el-tag v-if="scope.row.status===4" type="danger">已关闭</el-tag>
              <el-tag v-if="scope.row.status===5" type="warning">无效订单</el-tag>
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
          pageSize: 15
        },
        multipleSelection: []
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
        if (price == null) {
          return '0.00';
        }
        return price.toFixed(2);
      }
    },
    methods: {
      getMemberInfo() {
        getMemberConsumption(this.memberId).then(response => {
          this.memberInfo = response.data;
        });
      },
      getList() {
        this.listLoading = true;
        fetchMemberOrders(this.memberId, this.listQuery).then(response => {
          this.listLoading = false;
          this.list = response.data.list;
          this.total = response.data.total;
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
      goBack() {
        this.$router.back();
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
</style> 