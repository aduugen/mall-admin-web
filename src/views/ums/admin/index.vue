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
          <el-form-item label="关键词：">
            <el-input 
              v-model="listQuery.keyword" 
              class="input-width" 
              placeholder="帐号/姓名" 
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
          <i class="el-icon-user"></i>
          用户列表
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
            添加用户
          </el-button>
        </div>
      </div>
      
      <el-table 
        ref="adminTable"
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
        
        <el-table-column label="帐号" align="center">
          <template slot-scope="scope">
            <div class="user-info">
              <i class="el-icon-user-solid user-icon"></i>
              <span class="user-name">{{scope.row.username}}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="姓名" align="center">
          <template slot-scope="scope">
            <span>{{scope.row.nickName}}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="邮箱" align="center">
          <template slot-scope="scope">
            <span>{{scope.row.email || '未设置'}}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="添加时间" width="160" align="center">
          <template slot-scope="scope">
            <div v-if="scope.row.createTime" class="time-info">
              <i class="el-icon-time time-icon"></i>
              <span>{{scope.row.createTime | formatDateTime}}</span>
            </div>
            <span v-else>N/A</span>
          </template>
        </el-table-column>
        
        <el-table-column label="最后登录" width="160" align="center">
          <template slot-scope="scope">
            <div v-if="scope.row.loginTime" class="time-info">
              <i class="el-icon-date time-icon"></i>
              <span>{{scope.row.loginTime | formatDateTime}}</span>
            </div>
            <span v-else>N/A</span>
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
        
        <el-table-column label="操作" width="220" align="center">
          <template slot-scope="scope">
            <div class="button-group">
              <el-button 
                size="mini"
                type="info"
                plain
                icon="el-icon-connection"
                @click="handleSelectRole(scope.$index, scope.row)">
                角色
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
            <i class="el-icon-user-solid"></i>
            <p>暂无用户数据</p>
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
    
    <!-- 用户编辑对话框 -->
    <el-dialog
      :title="isEdit ? '编辑用户' : '添加用户'"
      :visible.sync="dialogVisible"
      width="40%"
      :close-on-click-modal="false">
      <el-form 
        :model="admin"
        ref="adminForm"
        label-width="100px" 
        size="small"
        status-icon>
        <el-form-item label="帐号：" required>
          <el-input 
            v-model="admin.username" 
            placeholder="请输入登录帐号"
            :disabled="isEdit"
            style="width: 300px">
          </el-input>
        </el-form-item>
        <el-form-item label="姓名：" required>
          <el-input 
            v-model="admin.nickName" 
            placeholder="请输入姓名"
            style="width: 300px">
          </el-input>
        </el-form-item>
        <el-form-item label="邮箱：">
          <el-input 
            v-model="admin.email" 
            placeholder="请输入邮箱地址"
            style="width: 300px">
          </el-input>
        </el-form-item>
        <el-form-item label="密码：" :required="!isEdit">
          <el-input 
            v-model="admin.password"  
            type="password" 
            placeholder="请输入密码"
            style="width: 300px">
          </el-input>
          <div class="form-tip" v-if="isEdit">
            <i class="el-icon-info"></i>
            <span>不修改密码请保持为空</span>
          </div>
        </el-form-item>
        <el-form-item label="备注：">
          <el-input 
            v-model="admin.note"
            type="textarea"
            :rows="4"
            placeholder="请输入备注信息"
            style="width: 300px">
          </el-input>
        </el-form-item>
        <el-form-item label="是否启用：">
          <el-switch
            v-model="admin.status"
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
    
    <!-- 角色分配对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="allocDialogVisible"
      width="30%">
      <div class="role-select-container">
        <div class="role-select-title">
          <i class="el-icon-connection"></i>
          <span>请选择角色</span>
        </div>
        <el-select 
          v-model="allocRoleIds" 
          multiple 
          placeholder="请选择角色" 
          size="small" 
          style="width: 100%">
          <el-option
            v-for="item in allRoleList"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="allocDialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="handleAllocDialogConfirm()" size="small">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {fetchList,createAdmin,updateAdmin,updateStatus,deleteAdmin,getRoleByAdmin,allocRole} from '@/api/login';
  import {fetchAllRoleList} from '@/api/role';
  import {formatDate} from '@/utils/date';

  const defaultListQuery = {
    pageNum: 1,
    pageSize: 10,
    keyword: null
  };
  const defaultAdmin = {
    id: null,
    username: null,
    password: null,
    nickName: null,
    email: null,
    note: null,
    status: 1
  };
  export default {
    name: 'adminList',
    data() {
      return {
        listQuery: Object.assign({}, defaultListQuery),
        list: null,
        total: null,
        listLoading: false,
        dialogVisible: false,
        admin: Object.assign({}, defaultAdmin),
        isEdit: false,
        allocDialogVisible: false,
        allocRoleIds:[],
        allRoleList:[],
        allocAdminId:null
      }
    },
    created() {
      this.getList();
      this.getAllRoleList();
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
        this.admin = Object.assign({},defaultAdmin);
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
        this.$confirm('是否要删除该用户?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteAdmin(row.id).then(response => {
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
        this.admin = Object.assign({},row);
        this.admin.password = ''; // 编辑模式下清空密码
      },
      handleDialogConfirm() {
        this.$confirm('是否要确认?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (this.isEdit) {
            updateAdmin(this.admin.id,this.admin).then(response => {
              this.$message({
                message: '修改成功！',
                type: 'success'
              });
              this.dialogVisible =false;
              this.getList();
            })
          } else {
            createAdmin(this.admin).then(response => {
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
      handleAllocDialogConfirm(){
        this.$confirm('是否要确认?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let params = new URLSearchParams();
          params.append("adminId", this.allocAdminId);
          params.append("roleIds", this.allocRoleIds);
          allocRole(params).then(response => {
            this.$message({
              message: '分配成功！',
              type: 'success'
            });
            this.allocDialogVisible = false;
          })
        })
      },
      handleSelectRole(index,row){
        this.allocAdminId = row.id;
        this.allocDialogVisible = true;
        this.getRoleListByAdmin(row.id);
      },
      getList() {
        this.listLoading = true;
        fetchList(this.listQuery).then(response => {
          this.listLoading = false;
          this.list = response.data.list;
          this.total = response.data.total;
        });
      },
      getAllRoleList() {
        fetchAllRoleList().then(response => {
          this.allRoleList = response.data;
        });
      },
      getRoleListByAdmin(adminId) {
        getRoleByAdmin(adminId).then(response => {
          let allocRoleList = response.data;
          this.allocRoleIds=[];
          if(allocRoleList!=null&&allocRoleList.length>0){
            for(let i=0;i<allocRoleList.length;i++){
              this.allocRoleIds.push(allocRoleList[i].id);
            }
          }
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
  
  /* 用户信息样式 */
  .user-info {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .user-icon {
    color: #409EFF;
    margin-right: 5px;
  }
  
  .user-name {
    font-weight: 500;
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
  
  /* 表单提示 */
  .form-tip {
    margin-top: 5px;
    color: #E6A23C;
    font-size: 12px;
    display: flex;
    align-items: center;
  }
  
  .form-tip i {
    margin-right: 5px;
  }
  
  /* 角色选择 */
  .role-select-container {
    padding: 5px;
  }
  
  .role-select-title {
    margin-bottom: 15px;
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    display: flex;
    align-items: center;
  }
  
  .role-select-title i {
    color: #409EFF;
    margin-right: 5px;
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


