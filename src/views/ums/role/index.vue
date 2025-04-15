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
          <el-form-item label="角色名称：">
            <el-input 
              v-model="listQuery.keyword" 
              class="input-width" 
              placeholder="请输入角色名称" 
              clearable
              @keyup.enter.native="handleSearchList()">
              <template slot="prefix">
                <i class="el-icon-search" style="color: #909399"></i>
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
          <i class="el-icon-s-custom"></i>
          角色列表
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
            添加角色
          </el-button>
        </div>
      </div>
      
      <el-table 
        ref="roleTable"
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
        
        <el-table-column label="角色名称" align="center">
          <template slot-scope="scope">
            <div class="role-name">
              <i class="el-icon-user role-icon"></i>
              <span>{{scope.row.name}}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="描述" align="center">
          <template slot-scope="scope">
            <el-tooltip 
              :content="scope.row.description || '暂无描述'" 
              placement="top" 
              :disabled="!scope.row.description || scope.row.description.length < 20">
              <span class="role-description">{{scope.row.description || '暂无描述'}}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        
        <el-table-column label="用户数" width="120" align="center">
          <template slot-scope="scope">
            <el-tag type="info" size="medium" effect="plain">
              <i class="el-icon-user-solid"></i> {{scope.row.adminCount}}
            </el-tag>
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
        
        <el-table-column label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-switch
              @change="handleStatusChange(scope.$index, scope.row)"
              :active-value="1"
              :inactive-value="0"
              active-color="#13ce66"
              inactive-color="#ff4949"
              v-model="scope.row.status">
            </el-switch>
            <el-tag 
              size="mini" 
              :type="scope.row.status === 1 ? 'success' : 'danger'"
              class="status-tag">
              {{scope.row.status === 1 ? '启用' : '禁用'}}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="260" align="center">
          <template slot-scope="scope">
            <div class="button-group">
              <el-tooltip content="分配菜单" placement="top">
                <el-button 
                  size="mini"
                  type="success"
                  plain
                  icon="el-icon-menu"
                  @click="handleSelectMenu(scope.$index, scope.row)">
                  菜单
                </el-button>
              </el-tooltip>
              
              <el-tooltip content="分配资源" placement="top">
                <el-button 
                  size="mini"
                  type="warning"
                  plain
                  icon="el-icon-folder-opened"
                  @click="handleSelectResource(scope.$index, scope.row)">
                  资源
                </el-button>
              </el-tooltip>
              
              <el-tooltip content="编辑角色" placement="top">
                <el-button 
                  size="mini"
                  type="primary"
                  plain
                  icon="el-icon-edit"
                  @click="handleUpdate(scope.$index, scope.row)">
                  编辑
                </el-button>
              </el-tooltip>
              
              <el-tooltip content="删除角色" placement="top">
                <el-button 
                  size="mini"
                  type="danger"
                  plain
                  icon="el-icon-delete"
                  @click="handleDelete(scope.$index, scope.row)">
                  删除
                </el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        
        <template slot="empty">
          <div class="empty-data">
            <i class="el-icon-s-custom"></i>
            <p>暂无角色数据</p>
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
          :page-sizes="[5, 10, 15, 20]"
          :total="total">
        </el-pagination>
      </div>
    </el-card>
    
    <!-- 角色编辑对话框 -->
    <el-dialog
      :title="isEdit ? '编辑角色' : '添加角色'"
      :visible.sync="dialogVisible"
      width="40%"
      :close-on-click-modal="false">
      <el-form 
        :model="role"
        ref="roleForm"
        label-width="100px" 
        size="small"
        status-icon>
        <el-form-item label="角色名称：" required>
          <el-input 
            v-model="role.name" 
            placeholder="请输入角色名称"
            style="width: 300px">
          </el-input>
        </el-form-item>
        <el-form-item label="描述：">
          <el-input 
            v-model="role.description"
            type="textarea"
            :rows="4"
            placeholder="请输入角色描述"
            style="width: 300px">
          </el-input>
        </el-form-item>
        <el-form-item label="是否启用：">
          <el-switch
            v-model="role.status"
            :active-value="1"
            :inactive-value="0"
            active-color="#13ce66"
            inactive-color="#ff4949"
            active-text="启用"
            inactive-text="禁用">
          </el-switch>
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
  import {fetchList,createRole,updateRole,updateStatus,deleteRole} from '@/api/role';
  import {formatDate} from '@/utils/date';

  const defaultListQuery = {
    pageNum: 1,
    pageSize: 5,
    keyword: null
  };
  const defaultRole = {
    id: null,
    name: null,
    description: null,
    adminCount: 0,
    status: 1
  };
  export default {
    name: 'roleList',
    data() {
      return {
        listQuery: Object.assign({}, defaultListQuery),
        list: null,
        total: null,
        listLoading: false,
        dialogVisible: false,
        role: Object.assign({}, defaultRole),
        isEdit: false
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
        this.role = Object.assign({},defaultRole);
      },
      handleStatusChange(index, row) {
        this.$confirm('是否要修改该状态?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          updateStatus(row.id, {status: row.status}).then(response => {
            this.$message({
              type: 'success',
              message: '修改成功!'
            });
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消修改'
          });
          this.getList();
        });
      },
      handleDelete(index, row) {
        this.$confirm('是否要删除该角色?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let ids = [];
          ids.push(row.id);
          let params=new URLSearchParams();
          params.append("ids",ids);
          deleteRole(params).then(response => {
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
        this.role = Object.assign({},row);
      },
      handleDialogConfirm() {
        this.$confirm('是否要确认?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (this.isEdit) {
            updateRole(this.role.id,this.role).then(response => {
              this.$message({
                message: '修改成功！',
                type: 'success'
              });
              this.dialogVisible =false;
              this.getList();
            })
          } else {
            createRole(this.role).then(response => {
              this.$message({
                message: '添加成功！',
                type: 'success'
              });
              this.dialogVisible =false;
              this.getList();
            })
          }
        })
      },
      handleSelectMenu(index,row){
        this.$router.push({path:'/ums/allocMenu',query:{roleId:row.id}})
      },
      handleSelectResource(index,row){
        this.$router.push({path:'/ums/allocResource',query:{roleId:row.id}})
      },
      getList() {
        this.listLoading = true;
        fetchList(this.listQuery).then(response => {
          this.listLoading = false;
          this.list = response.data.list;
          this.total = response.data.total;
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
  
  /* 角色名称样式 */
  .role-name {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .role-icon {
    color: #409EFF;
    margin-right: 5px;
  }
  
  /* 角色描述样式 */
  .role-description {
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


