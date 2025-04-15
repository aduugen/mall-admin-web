<template> 
  <div class="app-container">
    <!-- 页面标题 -->
    <el-card class="page-header" shadow="hover">
      <div slot="header" class="clearfix">
        <span class="card-title">
          <i class="el-icon-folder"></i>
          资源分类
        </span>
        <el-button 
          style="float: right" 
          type="text" 
          icon="el-icon-back" 
          @click="$router.back()">
          返回资源列表
        </el-button>
      </div>
      <div class="header-content">
        <p class="sub-title">管理API资源的分类，便于权限控制和资源管理</p>
      </div>
    </el-card>
    
    <!-- 数据列表 -->
    <el-card class="table-card" shadow="hover">
      <div slot="header" class="clearfix">
        <span class="card-title">
          <i class="el-icon-s-grid"></i>
          分类列表
        </span>
        <div class="card-tools">
          <el-tooltip content="刷新数据" placement="top">
            <el-button type="text" icon="el-icon-refresh" @click="getList"></el-button>
          </el-tooltip>
          <el-button 
            type="primary" 
            size="small" 
            icon="el-icon-plus" 
            @click="handleAdd()">
            添加分类
          </el-button>
        </div>
      </div>
      
      <el-table 
        ref="resourceCategoryTable"
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
        
        <el-table-column label="分类名称" align="center">
          <template slot-scope="scope">
            <div class="category-name">
              <i class="el-icon-collection-tag category-icon"></i>
              <span>{{scope.row.name}}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="排序" align="center" width="100">
          <template slot-scope="scope">
            <el-tag size="small" type="info">{{scope.row.sort}}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="创建时间" align="center" width="180">
          <template slot-scope="scope">
            <div class="time-info">
              <i class="el-icon-time time-icon"></i>
              <span>{{scope.row.createTime | formatDateTime}}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="180" align="center">
          <template slot-scope="scope">
            <div class="button-group">
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
            <i class="el-icon-folder"></i>
            <p>暂无分类数据</p>
          </div>
        </template>
      </el-table>
    </el-card>
    
    <!-- 添加/编辑对话框 -->
    <el-dialog
      :title="isEdit ? '编辑资源分类' : '添加资源分类'"
      :visible.sync="dialogVisible"
      width="40%"
      :close-on-click-modal="false">
      <el-form 
        :model="resourceCategory"
        ref="resourceCategoryForm"
        label-width="100px" 
        size="small"
        status-icon>
        <el-form-item label="分类名称：" required>
          <el-input 
            v-model="resourceCategory.name" 
            style="width: 300px"
            placeholder="请输入分类名称">
          </el-input>
        </el-form-item>
        <el-form-item label="排序：">
          <el-input-number 
            v-model="resourceCategory.sort" 
            :min="0" 
            :max="1000"
            controls-position="right"
            style="width: 200px">
          </el-input-number>
          <div class="sort-tip">数值越小，排序越靠前</div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="handleDialogConfirm()" size="small">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {listAllCate, createResourceCategory, updateResourceCategory, deleteResourceCategory} from '@/api/resourceCategory';
  import {formatDate} from '@/utils/date';
  
  const defaultResourceCategory = {
    name: null,
    sort: 0
  };
  
  export default {
    name: 'resourceCategoryList',
    data() {
      return {
        list: null,
        listLoading: false,
        dialogVisible: false,
        isEdit: false,
        resourceCategory: Object.assign({}, defaultResourceCategory)
      }
    },
    created() {
      this.getList();
    },
    filters: {
      formatDateTime(time) {
        if (time == null || time === '') {
          return 'N/A';
        }
        let date = new Date(time);
        return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
      }
    },
    methods: {
      handleAdd() {
        this.dialogVisible = true;
        this.isEdit = false;
        this.resourceCategory = Object.assign({}, defaultResourceCategory);
      },
      handleUpdate(index, row) {
        this.dialogVisible = true;
        this.isEdit = true;
        this.resourceCategory = Object.assign({}, row);
      },
      handleDelete(index, row) {
        this.$confirm('是否要删除该分类?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteResourceCategory(row.id).then(response => {
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.getList();
          });
        });
      },
      handleDialogConfirm() {
        this.$confirm('是否要确认?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (this.isEdit) {
            updateResourceCategory(this.resourceCategory.id, this.resourceCategory).then(response => {
              this.$message({
                message: '修改成功！',
                type: 'success'
              });
              this.dialogVisible = false;
              this.getList();
            })
          } else {
            createResourceCategory(this.resourceCategory).then(response => {
              this.$message({
                message: '添加成功！',
                type: 'success'
              });
              this.dialogVisible = false;
              this.getList();
            })
          }
        })
      },
      getList() {
        this.listLoading = true;
        listAllCate({}).then(response => {
          this.listLoading = false;
          this.list = response.data;
        });
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
  
  /* 页面标题卡片 */
  .page-header {
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  }
  
  .header-content {
    color: #606266;
  }
  
  .sub-title {
    margin: 0;
    font-size: 14px;
    color: #909399;
  }
  
  /* 卡片通用样式 */
  .card-title {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
  }
  
  .card-title i {
    margin-right: 5px;
    color: #409EFF;
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
  
  /* 资源分类信息样式 */
  .category-name {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .category-icon {
    color: #409EFF;
    margin-right: 5px;
  }
  
  .id-number {
    font-family: Consolas, Monaco, monospace;
    font-weight: bold;
    color: #606266;
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
  
  /* 排序提示 */
  .sort-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
    line-height: 1.2;
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


