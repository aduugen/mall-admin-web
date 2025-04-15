<template>
  <div class="app-container">
    <el-card class="category-header-card" shadow="hover">
      <div class="header-content">
        <div class="header-left">
          <i class="el-icon-menu"></i>
          <span class="title">商品分类管理</span>
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item :to="{ path: '/pms/productCate', query: { parentId: 0 } }">一级分类</el-breadcrumb-item>
            <el-breadcrumb-item v-if="parentId !== 0">二级分类</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <el-button 
          type="primary"
          icon="el-icon-plus"
          @click="handleAddProductCate()">
          添加分类
        </el-button>
      </div>
    </el-card>
    
    <el-card class="table-card" shadow="hover">
      <div slot="header" class="clearfix">
        <span class="card-title"><i class="el-icon-collection"></i> 分类列表</span>
        <div class="card-tools">
          <el-tooltip content="刷新数据" placement="top">
            <el-button type="text" icon="el-icon-refresh" @click="getList"></el-button>
          </el-tooltip>
        </div>
      </div>
      
      <el-table 
        ref="productCateTable"
        v-loading="listLoading" 
        :data="list"
        border
        stripe
        highlight-current-row
        style="width: 100%"
        :header-cell-style="{background:'#f8f9fa',color:'#606266'}"
        row-key="id">
        <el-table-column label="编号" prop="id" width="80" align="center"></el-table-column>
        
        <el-table-column label="分类名称" align="left">
          <template slot-scope="scope">
            <div class="category-name">
              <i :class="scope.row.level === 0 ? 'el-icon-folder' : 'el-icon-document'" class="category-icon"></i>
              <span>{{scope.row.name}}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="级别" width="80" align="center">
          <template slot-scope="scope">
            <el-tag size="small" :type="scope.row.level === 0 ? 'primary' : 'success'">
              {{scope.row.level | levelFilter}}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="商品数量" prop="productCount" width="100" align="center">
          <template slot-scope="scope">
            <span class="product-count">{{scope.row.productCount}}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="数量单位" prop="productUnit" width="100" align="center"></el-table-column>
        
        <el-table-column label="导航栏" width="100" align="center">
          <template slot-scope="scope">
            <el-switch
              @change="handleNavStatusChange(scope.$index, scope.row)"
              :active-value="1"
              :inactive-value="0"
              v-model="scope.row.navStatus"
              active-color="#13ce66"
              inactive-color="#ff4949">
            </el-switch>
          </template>
        </el-table-column>
        
        <el-table-column label="是否显示" width="100" align="center">
          <template slot-scope="scope">
            <el-switch
              @change="handleShowStatusChange(scope.$index, scope.row)"
              :active-value="1"
              :inactive-value="0"
              v-model="scope.row.showStatus"
              active-color="#13ce66"
              inactive-color="#ff4949">
            </el-switch>
          </template>
        </el-table-column>
        
        <el-table-column label="排序" prop="sort" width="80" align="center"></el-table-column>
        
        <el-table-column label="设置" width="240" align="center">
          <template slot-scope="scope">
            <div class="button-group">
              <el-button
                class="action-button same-width-btn"
                size="mini"
                type="info"
                :disabled="scope.row.level | disableNextLevel"
                icon="el-icon-arrow-right"
                @click="handleShowNextLevel(scope.$index, scope.row)">
                下级分类
              </el-button>
              <el-button
                class="action-button same-width-btn"
                size="mini"
                type="warning"
                icon="el-icon-sort"
                @click="handleTransferProduct(scope.$index, scope.row)">
                转移商品
              </el-button>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="180" align="center">
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
            <i class="el-icon-folder-remove"></i>
            <p>暂无分类数据</p>
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
  import {fetchList, deleteProductCate, updateShowStatus, updateNavStatus} from '@/api/productCate'

  export default {
    name: "productCateList",
    data() {
      return {
        list: null,
        total: null,
        listLoading: true,
        listQuery: {
          pageNum: 1,
          pageSize: 10
        },
        parentId: 0
      }
    },
    created() {
      this.resetParentId();
      this.getList();
    },
    watch: {
      $route(route) {
        this.resetParentId();
        this.getList();
      }
    },
    methods: {
      resetParentId(){
        this.listQuery.pageNum = 1;
        if (this.$route.query.parentId != null) {
          this.parentId = this.$route.query.parentId;
        } else {
          this.parentId = 0;
        }
      },
      handleAddProductCate() {
        this.$router.push('/pms/addProductCate');
      },
      getList() {
        this.listLoading = true;
        fetchList(this.parentId, this.listQuery).then(response => {
          this.listLoading = false;
          this.list = response.data.list;
          this.total = response.data.total;
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
      handleNavStatusChange(index, row) {
        let data = new URLSearchParams();
        let ids=[];
        ids.push(row.id)
        data.append('ids',ids);
        data.append('navStatus',row.navStatus);
        updateNavStatus(data).then(response=>{
          this.$message({
            message: '修改成功',
            type: 'success',
            duration: 1000
          });
        });
      },
      handleShowStatusChange(index, row) {
        let data = new URLSearchParams();
        let ids=[];
        ids.push(row.id)
        data.append('ids',ids);
        data.append('showStatus',row.showStatus);
        updateShowStatus(data).then(response=>{
          this.$message({
            message: '修改成功',
            type: 'success',
            duration: 1000
          });
        });
      },
      handleShowNextLevel(index, row) {
        this.$router.push({path: '/pms/productCate', query: {parentId: row.id}})
      },
      handleTransferProduct(index, row) {
        this.$message({
          message: '功能开发中...',
          type: 'info',
          duration: 1000
        });
      },
      handleUpdate(index, row) {
        this.$router.push({path:'/pms/updateProductCate',query:{id:row.id}});
      },
      handleDelete(index, row) {
        this.$confirm('是否要删除该分类？删除后不可恢复！', '提示', {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消操作',
          type: 'warning',
          confirmButtonClass: 'el-button--danger'
        }).then(() => {
          deleteProductCate(row.id).then(response => {
            this.$message({
              message: '删除成功',
              type: 'success',
              duration: 1000
            });
            this.getList();
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
      }
    },
    filters: {
      levelFilter(value) {
        if (value === 0) {
          return '一级';
        } else if (value === 1) {
          return '二级';
        }
      },
      disableNextLevel(value) {
        if (value === 0) {
          return false;
        } else {
          return true;
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
  
  .category-header-card {
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  }
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .header-left {
    display: flex;
    align-items: center;
  }
  
  .header-left i {
    color: #409EFF;
    font-size: 20px;
    margin-right: 8px;
  }
  
  .title {
    font-size: 18px;
    font-weight: 500;
    color: #303133;
    margin-right: 20px;
  }
  
  .breadcrumb {
    display: inline-block;
  }
  
  .table-card {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
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
  
  .card-tools {
    float: right;
  }
  
  .category-name {
    display: flex;
    align-items: center;
  }
  
  .category-icon {
    margin-right: 8px;
    color: #409EFF;
    font-size: 16px;
  }
  
  .product-count {
    font-weight: 500;
    font-size: 14px;
  }
  
  .empty-data {
    padding: 40px 0;
    text-align: center;
    color: #909399;
  }
  
  .empty-data i {
    font-size: 60px;
    margin-bottom: 10px;
  }
  
  .empty-data p {
    margin: 0;
    font-size: 14px;
  }
  
  .pagination-container {
    margin-top: 20px;
    text-align: right;
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
    min-width: 86px;
    height: 32px;
    padding: 0 10px;
    line-height: 30px;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  .same-width-btn {
    width: 86px;
  }
  
  /* 按钮样式 */
  .el-button--primary {
    background-color: #409EFF;
    border-color: #409EFF;
    color: #fff;
    font-weight: 500;
  }
  
  .el-button--danger {
    background-color: #F56C6C;
    border-color: #F56C6C;
    color: #fff;
    font-weight: 500;
  }
  
  .el-button--warning {
    background-color: #E6A23C;
    border-color: #E6A23C;
    color: #fff;
    font-weight: 500;
  }
  
  .el-button--info {
    background-color: #909399;
    border-color: #909399;
    color: #fff;
    font-weight: 500;
  }
  
  .el-button {
    transition: all 0.3s;
  }
  
  .el-button [class*="el-icon-"] + span {
    margin-left: 3px;
  }
  
  .el-button:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  
  /* 响应式调整 */
  @media screen and (max-width: 1400px) {
    .button-group {
      flex-direction: column;
    }
    
    .button-group .el-button {
      margin: 3px 0;
      width: 90%;
    }
    
    .action-button, .same-width-btn {
      width: 100% !important;
      min-width: 100%;
    }
  }
  
  @media screen and (max-width: 768px) {
    .header-content {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .header-content .el-button {
      margin-top: 10px;
      align-self: flex-end;
    }
  }
</style>
