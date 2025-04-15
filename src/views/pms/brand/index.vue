<template> 
  <div class="app-container">
    <el-card class="filter-container" shadow="hover">
      <div slot="header" class="clearfix">
        <span class="card-title">
          <i class="el-icon-search"></i>
          筛选搜索
        </span>
        <el-button
          style="float: right"
          @click="searchBrandList()"
          type="primary"
          size="small"
          icon="el-icon-search">
          查询结果
        </el-button>
      </div>
      <div class="filter-content">
        <el-form :inline="true" :model="listQuery" size="small" label-width="140px">
          <el-form-item label="品牌名称：">
            <el-input 
              v-model="listQuery.keyword" 
              placeholder="品牌名称/关键字"
              clearable
              @keyup.enter.native="searchBrandList()"
              style="width: 220px">
              <template slot="prefix">
                <i class="el-icon-search" style="color: #909399"></i>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button 
              type="primary" 
              icon="el-icon-search" 
              @click="searchBrandList()">
              搜索
            </el-button>
            <el-button 
              icon="el-icon-refresh" 
              @click="resetSearch()">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    
    <el-card class="table-card" shadow="hover">
      <div slot="header" class="clearfix">
        <span class="card-title">
          <i class="el-icon-tickets"></i>
          品牌列表
        </span>
        <div class="card-tools">
          <el-tooltip content="刷新数据" placement="top">
            <el-button type="text" icon="el-icon-refresh" @click="getList"></el-button>
          </el-tooltip>
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="small"
            @click="addBrand()">
            添加品牌
          </el-button>
        </div>
      </div>
      
      <el-table 
        ref="brandTable"
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
        <el-table-column label="编号" prop="id" width="80" align="center"></el-table-column>
        
        <el-table-column label="品牌名称" align="center">
          <template slot-scope="scope">
            <div class="brand-name">
              <span class="bold-text">{{scope.row.name}}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="品牌首字母" width="120" align="center">
          <template slot-scope="scope">
            <el-tag size="medium" type="info">{{scope.row.firstLetter}}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="排序" width="100" align="center">
          <template slot-scope="scope">
            <span class="sort-value">{{scope.row.sort}}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="品牌制造商" width="120" align="center">
          <template slot-scope="scope">
            <el-switch
              @change="handleFactoryStatusChange(scope.$index, scope.row)"
              :active-value="1"
              :inactive-value="0"
              active-color="#13ce66"
              inactive-color="#ff4949"
              v-model="scope.row.factoryStatus">
            </el-switch>
          </template>
        </el-table-column>
        
        <el-table-column label="是否显示" width="120" align="center">
          <template slot-scope="scope">
            <el-switch
              @change="handleShowStatusChange(scope.$index, scope.row)"
              :active-value="1"
              :inactive-value="0"
              active-color="#13ce66"
              inactive-color="#ff4949"
              v-model="scope.row.showStatus">
            </el-switch>
          </template>
        </el-table-column>
        
        <el-table-column label="相关" width="220" align="center">
          <template slot-scope="scope">
            <div class="related-content">
              <el-tooltip content="查看相关商品" placement="top">
                <div class="stat-card product-card" @click="getProductList(scope.$index, scope.row)">
                  <div class="stat-icon">
                    <i class="el-icon-goods"></i>
                  </div>
                  <div class="stat-info">
                    <div class="stat-label">商品</div>
                    <div class="stat-value">{{formatNumber(100)}}</div>
                  </div>
                </div>
              </el-tooltip>
              
              <el-tooltip content="查看商品评价" placement="top">
                <div class="stat-card comment-card" @click="getProductCommentList(scope.$index, scope.row)">
                  <div class="stat-icon">
                    <i class="el-icon-chat-line-round"></i>
                  </div>
                  <div class="stat-info">
                    <div class="stat-label">评价</div>
                    <div class="stat-value">{{formatNumber(1000)}}</div>
                  </div>
                </div>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" align="center">
          <template slot-scope="scope">
            <div class="button-group">
              <el-button
                class="action-button"
                size="mini"
                type="primary"
                icon="el-icon-edit"
                @click="handleUpdate(scope.$index, scope.row)">
                编辑
              </el-button>
              <el-button
                class="action-button"
                size="mini"
                type="danger"
                icon="el-icon-delete"
                @click="handleDelete(scope.$index, scope.row)">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
        
        <template slot="empty">
          <div class="empty-data">
            <i class="el-icon-shopping-bag-1"></i>
            <p>暂无品牌数据</p>
          </div>
        </template>
      </el-table>
      
      <div class="batch-operate-container">
        <div class="batch-operate-content">
          <el-select
            size="small"
            v-model="operateType" 
            placeholder="批量操作">
            <el-option
              v-for="item in operates"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <el-button
            class="batch-button"
            @click="handleBatchOperate()"
            type="primary"
            :disabled="multipleSelection.length === 0"
            size="small">
            <i class="el-icon-finished"></i>
            确定操作
          </el-button>
          <div class="selection-info" v-if="multipleSelection.length > 0">
            <span>已选择 <span class="selected-count">{{multipleSelection.length}}</span> 项</span>
            <el-button type="text" size="mini" @click="$refs.brandTable.clearSelection()">清空选择</el-button>
          </div>
        </div>
      </div>
      
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
  import {fetchList, updateShowStatus, updateFactoryStatus, deleteBrand} from '@/api/brand'

  export default {
    name: 'brandList',
    data() {
      return {
        operates: [
          {
            label: "显示品牌",
            value: "showBrand"
          },
          {
            label: "隐藏品牌",
            value: "hideBrand"
          }
        ],
        operateType: null,
        listQuery: {
          keyword: null,
          pageNum: 1,
          pageSize: 10
        },
        list: null,
        total: null,
        listLoading: true,
        multipleSelection: []
      }
    },
    created() {
      this.getList();
    },
    methods: {
      getList() {
        this.listLoading = true;
        fetchList(this.listQuery).then(response => {
          this.listLoading = false;
          this.list = response.data.list;
          this.total = response.data.total;
          this.totalPage = response.data.totalPage;
          this.pageSize = response.data.pageSize;
        });
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      handleUpdate(index, row) {
        this.$router.push({path: '/pms/updateBrand', query: {id: row.id}})
      },
      handleDelete(index, row) {
        this.$confirm('是否要删除该品牌', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteBrand(row.id).then(response => {
            this.$message({
              message: '删除成功',
              type: 'success',
              duration: 1000
            });
            this.getList();
          });
        });
      },
      getProductList(index, row) {
        console.log(index, row);
      },
      getProductCommentList(index, row) {
        console.log(index, row);
      },
      handleFactoryStatusChange(index, row) {
        var data = new URLSearchParams();
        data.append("ids", row.id);
        data.append("factoryStatus", row.factoryStatus);
        updateFactoryStatus(data).then(response => {
          this.$message({
            message: '修改成功',
            type: 'success',
            duration: 1000
          });
        }).catch(error => {
          if (row.factoryStatus === 0) {
            row.factoryStatus = 1;
          } else {
            row.factoryStatus = 0;
          }
        });
      },
      handleShowStatusChange(index, row) {
        let data = new URLSearchParams();
        data.append("ids", row.id);
        data.append("showStatus", row.showStatus);
        updateShowStatus(data).then(response => {
          this.$message({
            message: '修改成功',
            type: 'success',
            duration: 1000
          });
        }).catch(error => {
          if (row.showStatus === 0) {
            row.showStatus = 1;
          } else {
            row.showStatus = 0;
          }
        });
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
      searchBrandList() {
        this.listQuery.pageNum = 1;
        this.getList();
      },
      resetSearch() {
        this.listQuery.keyword = null;
        this.searchBrandList();
      },
      handleBatchOperate() {
        if (this.multipleSelection.length < 1) {
          this.$message({
            message: '请选择一条记录',
            type: 'warning',
            duration: 1000
          });
          return;
        }
        let showStatus = 0;
        if (this.operateType === 'showBrand') {
          showStatus = 1;
        } else if (this.operateType === 'hideBrand') {
          showStatus = 0;
        } else {
          this.$message({
            message: '请选择批量操作类型',
            type: 'warning',
            duration: 1000
          });
          return;
        }
        let ids = [];
        for (let i = 0; i < this.multipleSelection.length; i++) {
          ids.push(this.multipleSelection[i].id);
        }
        let data = new URLSearchParams();
        data.append("ids", ids);
        data.append("showStatus", showStatus);
        updateShowStatus(data).then(response => {
          this.getList();
          this.$message({
            message: '修改成功',
            type: 'success',
            duration: 1000
          });
        });
      },
      addBrand() {
        this.$router.push({path: '/pms/addBrand'})
      },
      formatNumber(num) {
        if (num >= 1000) {
          return (num / 1000).toFixed(1) + 'k';
        }
        return num;
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
  
  /* 表格卡片 */
  .table-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
  }
  
  .card-tools {
    float: right;
  }
  
  .card-tools .el-button {
    margin-left: 10px;
  }
  
  /* 品牌名称样式 */
  .brand-name {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .bold-text {
    font-weight: 500;
    color: #303133;
  }
  
  /* 排序值样式 */
  .sort-value {
    font-weight: bold;
    color: #606266;
  }
  
  /* 相关内容样式 */
  .related-content {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }
  
  .stat-card {
    display: flex;
    align-items: center;
    padding: 6px 10px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s;
    min-width: 84px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  }
  
  .product-card {
    background: linear-gradient(135deg, #e6f7ff, #d0e8ff);
    border: 1px solid #91d5ff;
  }
  
  .product-card:hover {
    background: linear-gradient(135deg, #d0e8ff, #bae0ff);
  }
  
  .comment-card {
    background: linear-gradient(135deg, #fff7e6, #ffe7ba);
    border: 1px solid #ffd591;
  }
  
  .comment-card:hover {
    background: linear-gradient(135deg, #ffe7ba, #ffd591);
  }
  
  .stat-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    margin-right: 6px;
    width: 24px;
    height: 24px;
  }
  
  .product-card .stat-icon {
    color: #1890ff;
  }
  
  .comment-card .stat-icon {
    color: #fa8c16;
  }
  
  .stat-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .stat-label {
    font-size: 12px;
    color: #606266;
    margin-bottom: 2px;
  }
  
  .stat-value {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
  }
  
  .product-card .stat-value {
    color: #1890ff;
  }
  
  .comment-card .stat-value {
    color: #fa8c16;
  }
  
  /* 按钮组样式 */
  .button-group {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: nowrap;
  }
  
  .button-group .el-button {
    margin: 0 4px;
  }
  
  /* 操作按钮样式 */
  .action-button {
    min-width: 70px;
    height: 28px;
    padding: 0 10px;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  /* 批量操作 */
  .batch-operate-container {
    padding: 10px 0;
    margin-top: 15px;
    border-top: 1px solid #ebeef5;
  }
  
  .batch-operate-content {
    display: flex;
    align-items: center;
  }
  
  .batch-button {
    margin-left: 10px;
  }
  
  .selection-info {
    margin-left: 15px;
    color: #606266;
    font-size: 14px;
  }
  
  .selected-count {
    color: #409EFF;
    font-weight: bold;
    margin: 0 3px;
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
  
  /* 响应式调整 */
  @media screen and (max-width: 992px) {
    .button-group {
      flex-direction: column;
    }
    
    .button-group .el-button {
      margin: 3px 0;
      width: 90%;
    }
    
    .batch-operate-content {
      flex-wrap: wrap;
    }
    
    .selection-info {
      margin-top: 10px;
      margin-left: 0;
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
  }
</style>


