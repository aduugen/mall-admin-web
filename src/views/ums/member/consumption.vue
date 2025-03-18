<template>
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <div>
        <i class="el-icon-search"></i>
        <span>筛选搜索</span>
        <el-button
          style="float: right"
          type="primary"
          @click="handleSearchList()"
          size="small">
          查询结果
        </el-button>
        <el-button
          style="float: right;margin-right: 15px"
          @click="handleResetSearch()"
          size="small">
          重置
        </el-button>
      </div>
      <div style="margin-top: 15px">
        <el-form :inline="true" :model="listQuery" size="small" label-width="140px">
          <el-form-item label="会员搜索：">
            <el-input style="width: 203px" v-model="listQuery.keyword" placeholder="会员名称/手机号码"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>数据列表</span>
    </el-card>
    <div class="table-container">
      <el-table ref="consumptionTable"
                :data="list"
                style="width: 100%"
                @selection-change="handleSelectionChange"
                v-loading="listLoading"
                border>
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        <el-table-column label="ID" width="80" align="center">
          <template slot-scope="scope">{{scope.row.id}}</template>
        </el-table-column>
        <el-table-column label="会员昵称" align="center">
          <template slot-scope="scope">{{scope.row.nickname}}</template>
        </el-table-column>
        <el-table-column label="联系电话" width="120" align="center">
          <template slot-scope="scope">{{scope.row.phone}}</template>
        </el-table-column>
        <el-table-column label="总消费金额" width="120" align="center">
          <template slot-scope="scope">￥{{scope.row.totalAmount | formatPrice}}</template>
        </el-table-column>
        <el-table-column label="最后购买时间" width="160" align="center">
          <template slot-scope="scope">{{scope.row.lastOrderTime | formatTime}}</template>
        </el-table-column>
        <el-table-column label="完成订单数" width="100" align="center">
          <template slot-scope="scope">{{scope.row.completedOrderCount}}</template>
        </el-table-column>
        <el-table-column label="退货订单数" width="100" align="center">
          <template slot-scope="scope">{{scope.row.returnOrderCount}}</template>
        </el-table-column>
        <el-table-column label="总积分" width="100" align="center">
          <template slot-scope="scope">{{scope.row.integration}}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center">
          <template slot-scope="scope">
            <el-button size="mini"
                       type="text"
                       @click="handleViewOrders(scope.$index, scope.row)">查看订单
            </el-button>
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
  </div>
</template>
<script>
  import {fetchConsumptionList} from '@/api/member';
  import {formatDate} from '@/utils/date';

  export default {
    name: 'memberConsumption',
    data() {
      return {
        list: null,
        total: null,
        listLoading: true,
        listQuery: {
          pageNum: 1,
          pageSize: 15,
          keyword: null
        },
        multipleSelection: []
      }
    },
    created() {
      this.getList();
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
      getList() {
        this.listLoading = true;
        fetchConsumptionList(this.listQuery).then(response => {
          this.listLoading = false;
          this.list = response.data.list;
          this.total = response.data.total;
        });
      },
      handleResetSearch() {
        this.listQuery = {
          pageNum: 1,
          pageSize: 15,
          keyword: null
        };
        this.getList();
      },
      handleSearchList() {
        this.listQuery.pageNum = 1;
        this.getList();
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
      handleViewOrders(index, row) {
        this.$router.push({path: '/ums/memberOrders', query: {id: row.id}})
      }
    }
  }
</script>
<style scoped>
  .filter-container {
    margin-bottom: 10px;
  }
  .operate-container {
    margin-top: 20px;
  }
  .operate-container .btn-add {
    float: right;
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