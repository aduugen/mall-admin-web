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
          查询搜索
        </el-button>
        <el-button
          style="float: right; margin-right: 15px"
          @click="handleResetSearch()"
          size="small"
          icon="el-icon-refresh">
          重置
        </el-button>
      </div>
      <div class="filter-content">
        <el-form :inline="true" :model="listQuery" size="small" label-width="100px">
          <el-form-item label="资源名称：">
            <el-input 
              v-model="listQuery.nameKeyword" 
              class="input-width" 
              placeholder="请输入资源名称" 
              clearable
              @keyup.enter.native="handleSearchList()">
              <template slot="prefix">
                <i class="el-icon-search" style="color: #909399"></i>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="资源路径：">
            <el-input 
              v-model="listQuery.urlKeyword" 
              class="input-width" 
              placeholder="请输入资源路径" 
              clearable
              @keyup.enter.native="handleSearchList()">
              <template slot="prefix">
                <i class="el-icon-link" style="color: #909399"></i>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="资源分类：">
            <el-select 
              v-model="listQuery.categoryId" 
              placeholder="请选择资源分类" 
              clearable 
              class="input-width">
              <el-option 
                v-for="item in categoryOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    
    <!-- 数据列表 -->
    <el-card class="table-card" shadow="hover">
      <div slot="header" class="clearfix">
        <span class="card-title">
          <i class="el-icon-folder-opened"></i>
          资源列表
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
            添加资源
          </el-button>
          <el-button 
            type="success" 
            size="small" 
            icon="el-icon-s-grid" 
            @click="handleShowCategory()">
            资源分类
          </el-button>
        </div>
      </div>
      
      <el-table 
        ref="resourceTable"
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
        
        <el-table-column label="资源名称" align="center">
          <template slot-scope="scope">
            <div class="resource-name">
              <i class="el-icon-collection-tag resource-icon"></i>
              <span>{{scope.row.name}}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="资源路径" align="center">
          <template slot-scope="scope">
            <el-tooltip 
              :content="scope.row.url" 
              placement="top" 
              :disabled="!scope.row.url || scope.row.url.length < 30">
              <div class="resource-url">
                <i class="el-icon-link url-icon"></i>
                <span class="url-text">{{scope.row.url || '暂无路径'}}</span>
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        
        <el-table-column label="资源分类" align="center" width="120">
          <template slot-scope="scope">
            <el-tag 
              v-if="getCategoryName(scope.row.categoryId)"
              size="small" 
              type="info">
              {{getCategoryName(scope.row.categoryId)}}
            </el-tag>
            <span v-else>未分类</span>
          </template>
        </el-table-column>
        
        <el-table-column label="描述" align="center">
          <template slot-scope="scope">
            <el-tooltip 
              :content="scope.row.description || '暂无描述'" 
              placement="top" 
              :disabled="!scope.row.description || scope.row.description.length < 20">
              <span class="resource-description">{{scope.row.description || '暂无描述'}}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        
        <el-table-column label="添加时间" width="160" align="center">
          <template slot-scope="scope">
            <div class="time-info">
              <i class="el-icon-time time-icon"></i>
              <span>{{scope.row.createTime | formatDateTime}}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="160" align="center">
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
            <i class="el-icon-folder-opened"></i>
            <p>暂无资源数据</p>
          </div>
        </template>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          layout="total, sizes, prev, pager, next, jumper"
          :current-page.sync="listQuery.pageNum"
          :page-size="listQuery.pageSize"
          :page-sizes="[10, 15, 20, 30]"
          :total="total">
        </el-pagination>
      </div>
    </el-card>
    
    <!-- 添加/编辑对话框 -->
    <el-dialog
      :title="isEdit ? '编辑资源' : '添加资源'"
      :visible.sync="dialogVisible"
      width="40%"
      :close-on-click-modal="false">
      <el-form 
        :model="resource"
        ref="resourceForm"
        label-width="100px" 
        size="small"
        status-icon>
        <el-form-item label="资源名称：" required>
          <el-input 
            v-model="resource.name" 
            style="width: 300px"
            placeholder="请输入资源名称">
          </el-input>
        </el-form-item>
        <el-form-item label="资源路径：" required>
          <el-input 
            v-model="resource.url" 
            style="width: 300px"
            placeholder="请输入资源路径">
          </el-input>
        </el-form-item>
        <el-form-item label="资源分类：">
          <el-select 
            v-model="resource.categoryId" 
            placeholder="请选择资源分类" 
            clearable 
            style="width: 300px">
            <el-option 
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述：">
          <el-input 
            v-model="resource.description"
            type="textarea"
            :rows="4"
            placeholder="请输入资源描述"
            style="width: 300px">
          </el-input>
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
  import {fetchList, createResource, updateResource, deleteResource} from '@/api/resource';
  import {listAllCate} from '@/api/resourceCategory';
  import {formatDate} from '@/utils/date';

  const defaultListQuery = {
    pageNum: 1,
    pageSize: 10,
    nameKeyword: null,
    urlKeyword: null,
    categoryId: null
  };
  const defaultResource = {
    id: null,
    name: null,
    url: null,
    categoryId: null,
    description: ''
  };
  export default {
    name: 'resourceList',
    data() {
      return {
        listQuery: Object.assign({}, defaultListQuery),
        list: null,
        total: null,
        listLoading: false,
        dialogVisible: false,
        resource: Object.assign({}, defaultResource),
        isEdit: false,
        categoryOptions: [],
        defaultCategoryId: null
      }
    },
    created() {
      this.getList();
      this.getCateList();
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
      handleResetSearch() {
        this.listQuery = Object.assign({}, defaultListQuery);
      },
      handleSearchList() {
        this.listQuery.pageNum = 1;
        this.getList();
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
      handleAdd() {
        this.dialogVisible = true;
        this.isEdit = false;
        this.resource = Object.assign({}, defaultResource);
        this.resource.categoryId = this.defaultCategoryId;
      },
      handleDelete(index, row) {
        this.$confirm('是否要删除该资源?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteResource(row.id).then(response => {
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.getList();
          });
        });
      },
      handleUpdate(index, row) {
        this.dialogVisible = true;
        this.isEdit = true;
        this.resource = Object.assign({}, row);
      },
      handleDialogConfirm() {
        this.$confirm('是否要确认?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (this.isEdit) {
            updateResource(this.resource.id, this.resource).then(response => {
              this.$message({
                message: '修改成功！',
                type: 'success'
              });
              this.dialogVisible = false;
              this.getList();
            })
          } else {
            createResource(this.resource).then(response => {
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
      handleShowCategory() {
        this.$router.push({path: '/ums/resourceCategory'})
      },
      getList() {
        this.listLoading = true;
        fetchList(this.listQuery).then(response => {
          this.listLoading = false;
          this.list = response.data.list;
          this.total = response.data.total;
        });
      },
      getCateList() {
        listAllCate().then(response => {
          let cateList = response.data;
          for (let i = 0; i < cateList.length; i++) {
            let cate = cateList[i];
            this.categoryOptions.push({label: cate.name, value: cate.id});
          }
          this.defaultCategoryId = cateList.length > 0 ? cateList[0].id : null;
        })
      },
      getCategoryName(categoryId) {
        if (!categoryId) return '';
        let category = this.categoryOptions.find(item => item.value === categoryId);
        return category ? category.label : '';
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
  
  .card-tools .el-button {
    margin-left: 10px;
  }
  
  /* 资源信息样式 */
  .resource-name {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .resource-icon {
    color: #409EFF;
    margin-right: 5px;
  }
  
  .resource-url {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  
  .url-icon {
    color: #67C23A;
    margin-right: 5px;
    flex-shrink: 0;
  }
  
  .url-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .resource-description {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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


