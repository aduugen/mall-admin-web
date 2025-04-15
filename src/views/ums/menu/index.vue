<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-card class="filter-container" shadow="hover">
      <div slot="header" class="clearfix">
        <span class="card-title">
          <i class="el-icon-search"></i>
          菜单查询
        </span>
        <div style="float: right">
          <el-button
            v-if="parentId !== 0"
            icon="el-icon-back"
            size="small"
            @click="handleBackToParent">
            返回上级
          </el-button>
        </div>
      </div>
      <div class="filter-content">
        <el-form :inline="true" size="small">
          <el-form-item label="菜单名称：">
            <el-input
              v-model="listQuery.title"
              placeholder="请输入菜单名称"
              clearable
              @keyup.enter.native="handleSearchList()"
              class="input-width">
              <template slot="prefix">
                <i class="el-icon-search" style="color: #909399"></i>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="菜单显示：">
            <el-select v-model="listQuery.hidden" placeholder="请选择" clearable class="input-width">
              <el-option :value="0" label="显示"></el-option>
              <el-option :value="1" label="隐藏"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button 
              type="primary" 
              icon="el-icon-search" 
              @click="handleSearchList()">
              查询
            </el-button>
            <el-button 
              icon="el-icon-refresh" 
              @click="handleResetSearch()">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    
    <!-- 数据列表 -->
    <el-card class="table-card" shadow="hover">
      <div slot="header" class="clearfix">
        <span class="card-title">
          <i class="el-icon-menu"></i>
          <span v-if="parentId !== 0">下级</span>菜单列表
        </span>
        <div class="card-tools">
          <el-tooltip content="刷新数据" placement="top">
            <el-button type="text" icon="el-icon-refresh" @click="getList"></el-button>
          </el-tooltip>
          <el-button 
            type="primary" 
            size="small" 
            icon="el-icon-plus" 
            @click="handleAddMenu()">
            添加菜单
          </el-button>
        </div>
      </div>
      
      <el-table 
        ref="menuTable"
        :data="list"
        style="width: 100%"
        v-loading="listLoading" 
        border
        stripe
        highlight-current-row
        :header-cell-style="{background:'#f8f9fa',color:'#606266'}"
        row-key="id">
        <el-table-column label="编号" width="80" align="center">
          <template slot-scope="scope">
            <span class="id-number">{{scope.row.id}}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="菜单名称" align="center">
          <template slot-scope="scope">
            <div class="menu-name">
              <i class="el-icon-s-operation menu-icon"></i>
              <span>{{scope.row.title}}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="菜单级数" width="100" align="center">
          <template slot-scope="scope">
            <el-tag 
              :type="scope.row.level === 0 ? 'primary' : 'success'"
              size="small">
              {{scope.row.level | levelFilter}}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="前端名称" align="center">
          <template slot-scope="scope">
            <span>{{scope.row.name}}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="前端图标" width="100" align="center">
          <template slot-scope="scope">
            <div class="icon-preview">
              <svg-icon :icon-class="scope.row.icon"></svg-icon>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="是否显示" width="100" align="center">
          <template slot-scope="scope">
            <el-switch
              @change="handleHiddenChange(scope.$index, scope.row)"
              :active-value="0"
              :inactive-value="1"
              active-color="#13ce66"
              inactive-color="#ff4949"
              v-model="scope.row.hidden">
            </el-switch>
            <el-tag 
              size="mini" 
              :type="scope.row.hidden === 0 ? 'success' : 'info'"
              class="status-tag">
              {{scope.row.hidden === 0 ? '显示' : '隐藏'}}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="排序" width="80" align="center">
          <template slot-scope="scope">
            <span class="order-number">{{scope.row.sort}}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="230" align="center">
          <template slot-scope="scope">
            <div class="button-group">
              <el-button
                size="mini"
                type="info"
                plain
                icon="el-icon-view"
                :disabled="scope.row.level | disableNextLevel"
                @click="handleShowNextLevel(scope.$index, scope.row)">
                下级菜单
              </el-button>
              <el-button
                size="mini"
                type="primary"
                plain
                icon="el-icon-edit"
                @click="handleUpdate(scope.$index, scope.row)">
                编辑
              </el-button>
              <el-button
                size="mini"
                type="danger"
                plain
                icon="el-icon-delete"
                @click="handleDelete(scope.$index, scope.row)">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
        
        <template slot="empty">
          <div class="empty-data">
            <i class="el-icon-menu"></i>
            <p>暂无菜单数据</p>
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
          :page-sizes="[10, 15, 20, 30]"
          :current-page.sync="listQuery.pageNum"
          :total="total">
        </el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
  import {fetchList, deleteMenu, updateMenu, updateHidden} from '@/api/menu'

  export default {
    name: "menuList",
    data() {
      return {
        list: null,
        total: null,
        listLoading: true,
        listQuery: {
          pageNum: 1,
          pageSize: 10,
          title: null,
          hidden: null
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
          this.parentId = parseInt(this.$route.query.parentId);
        } else {
          this.parentId = 0;
        }
      },
      handleAddMenu() {
        this.$router.push({path: '/ums/addMenu', query: {parentId: this.parentId}});
      },
      handleBackToParent() {
        this.$router.push({path: '/ums/menu'});
      },
      getList() {
        this.listLoading = true;
        fetchList(this.parentId, this.listQuery).then(response => {
          this.listLoading = false;
          this.list = response.data.list;
          this.total = response.data.total;
        });
      },
      handleSearchList() {
        this.listQuery.pageNum = 1;
        this.getList();
      },
      handleResetSearch() {
        this.listQuery.title = null;
        this.listQuery.hidden = null;
        this.handleSearchList();
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
      handleHiddenChange(index, row) {
        updateHidden(row.id, {hidden: row.hidden}).then(response => {
          this.$message({
            message: '修改成功',
            type: 'success',
            duration: 1000
          });
        });
      },
      handleShowNextLevel(index, row) {
        this.$router.push({path: '/ums/menu', query: {parentId: row.id}})
      },
      handleUpdate(index, row) {
        this.$router.push({path: '/ums/updateMenu', query: {id: row.id}});
      },
      handleDelete(index, row) {
        this.$confirm('是否要删除该菜单', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteMenu(row.id).then(response => {
            this.$message({
              message: '删除成功',
              type: 'success',
              duration: 1000
            });
            this.getList();
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
    width: 200px;
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
  
  /* 菜单信息样式 */
  .menu-name {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .menu-icon {
    color: #409EFF;
    margin-right: 5px;
  }
  
  .icon-preview {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 24px;
    width: 24px;
    margin: 0 auto;
    background-color: #f5f7fa;
    border-radius: 4px;
    color: #303133;
  }
  
  .id-number {
    font-family: Consolas, Monaco, monospace;
    font-weight: bold;
    color: #606266;
  }
  
  .order-number {
    font-family: Consolas, Monaco, monospace;
    font-weight: bold;
    background-color: #f5f7fa;
    padding: 3px 8px;
    border-radius: 12px;
    color: #606266;
  }
  
  /* 状态标签样式 */
  .status-tag {
    margin-left: 8px;
  }
  
  /* 按钮组样式 */
  .button-group {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: nowrap;
  }
  
  .button-group .el-button {
    margin: 0 3px;
    padding: 7px 10px;
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
      width: 100%;
    }
  }
</style>
