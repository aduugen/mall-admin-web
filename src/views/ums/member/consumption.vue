<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-card class="filter-container" shadow="hover">
      <div slot="header" class="clearfix">
        <span class="card-title">
          <i class="el-icon-search"></i>
          筛选搜索
        </span>
        <el-button
          style="float: right"
          type="primary"
          @click="handleSearchList()"
          size="small"
          icon="el-icon-search">
          查询结果
        </el-button>
        <el-button
          style="float: right;margin-right: 15px"
          @click="handleResetSearch()"
          size="small"
          icon="el-icon-refresh">
          重置
        </el-button>
      </div>
      <div class="filter-content">
        <el-form :inline="true" :model="listQuery" size="small" label-width="100px">
          <el-form-item label="会员搜索：">
            <el-input 
              v-model="listQuery.keyword" 
              class="input-width" 
              placeholder="会员名称/手机号码"
              clearable
              @keyup.enter.native="handleSearchList()">
              <template slot="prefix">
                <i class="el-icon-user" style="color: #909399"></i>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    
    <!-- 数据列表 -->
    <el-card class="table-card" shadow="hover">
      <div slot="header" class="clearfix">
        <span class="card-title">
          <i class="el-icon-data-analysis"></i>
          消费数据列表
        </span>
        <div class="card-tools">
          <el-tooltip content="刷新数据" placement="top">
            <el-button type="text" icon="el-icon-refresh" @click="getList"></el-button>
          </el-tooltip>
        </div>
      </div>
      
      <el-table 
        ref="consumptionTable"
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
        <el-table-column label="ID" width="80" align="center">
          <template slot-scope="scope">
            <span class="id-number">{{scope.row.id}}</span>
          </template>
        </el-table-column>
        <el-table-column label="会员昵称" align="center">
          <template slot-scope="scope">
            <div class="member-name">
              <i class="el-icon-user-solid member-icon"></i>
              <span>{{scope.row.nickname || '未设置昵称'}}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="联系电话" width="150" align="center">
          <template slot-scope="scope">
            <div class="phone-info">
              <i class="el-icon-mobile-phone phone-icon"></i>
              <span>{{scope.row.phone}}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="总消费金额" width="150" align="center">
          <template slot-scope="scope">
            <div class="price-info">
              <i class="el-icon-money price-icon"></i>
              <span class="price-value">￥{{scope.row.totalAmount | formatPrice}}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="最后购买时间" width="180" align="center">
          <template slot-scope="scope">
            <div class="time-info">
              <i class="el-icon-time time-icon"></i>
              <span>{{scope.row.lastOrderTime | formatTime}}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="订单数据" width="200" align="center">
          <template slot-scope="scope">
            <div class="stat-container">
              <div class="stat-item">
                <el-tooltip content="完成订单数" placement="top">
                  <div class="stat-dot completed"></div>
                </el-tooltip>
                <span>{{scope.row.completedOrderCount || 0}}</span>
              </div>
              <div class="stat-item">
                <el-tooltip content="退货订单数" placement="top">
                  <div class="stat-dot returned"></div>
                </el-tooltip>
                <span>{{scope.row.returnOrderCount || 0}}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="总积分" width="120" align="center">
          <template slot-scope="scope">
            <el-tag size="medium" type="warning">
              <i class="el-icon-star-on"></i> {{scope.row.integration || 0}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template slot-scope="scope">
            <el-button 
              size="mini"
              type="primary"
              plain
              icon="el-icon-document"
              @click="handleViewOrders(scope.$index, scope.row)">
              查看订单
            </el-button>
          </template>
        </el-table-column>
        
        <template slot="empty">
          <div class="empty-data">
            <i class="el-icon-data-analysis"></i>
            <p>暂无消费数据</p>
          </div>
        </template>
      </el-table>
      
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
  .app-container {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 84px);
  }
  
  /* 筛选搜索卡片 */
  .filter-container {
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
  
  .filter-content {
    padding: 15px 0 0;
  }
  
  .input-width {
    width: 220px;
  }
  
  /* 表格卡片 */
  .table-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
  }
  
  .card-tools {
    float: right;
  }
  
  /* 会员信息样式 */
  .member-name {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .member-icon {
    color: #409EFF;
    margin-right: 5px;
  }
  
  .phone-info {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .phone-icon {
    color: #67C23A;
    margin-right: 5px;
  }
  
  .id-number {
    font-family: Consolas, Monaco, monospace;
    font-weight: bold;
    color: #606266;
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
  
  /* 统计数据样式 */
  .stat-container {
    display: flex;
    justify-content: center;
    gap: 15px;
  }
  
  .stat-item {
    display: flex;
    align-items: center;
  }
  
  .stat-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 5px;
  }
  
  .stat-dot.completed {
    background-color: #67C23A;
  }
  
  .stat-dot.returned {
    background-color: #F56C6C;
  }
  
  /* 空数据提示 */
  .empty-data {
    padding: 40px 0;
    text-align: center;
    color: #909399;
  }
  
  .empty-data i {
    font-size: 50px;
    margin-bottom: 10px;
  }
  
  .empty-data p {
    margin: 0;
    font-size: 14px;
  }
  
  /* 分页样式 */
  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }
</style> 