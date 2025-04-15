<template>  
  <div class="app-container">
    <!-- 操作区域 -->
    <el-card class="operate-card" shadow="hover">
      <div class="header-content">
        <div class="title">
          <i class="el-icon-time"></i>
          <span>秒杀时间段列表</span>
        </div>
        <div class="tools">
          <el-button 
            size="small" 
            type="primary" 
            icon="el-icon-plus" 
            @click="handleAdd()">
            添加时间段
          </el-button>
          <el-tooltip content="刷新数据" placement="top">
            <el-button type="text" icon="el-icon-refresh" @click="getList"></el-button>
          </el-tooltip>
        </div>
      </div>
    </el-card>

    <!-- 数据列表 -->
    <el-card class="table-card" shadow="hover">
      <div slot="header" class="clearfix card-header">
        <span class="card-title">
          <i class="el-icon-date"></i> 数据列表
        </span>
      </div>
      <el-table ref="flashSessionTable"
                :data="list"
                style="width: 100%;"
                v-loading="listLoading" 
                border
                stripe
                highlight-current-row
                :header-cell-style="{background:'#f8f9fa',color:'#606266'}"
                row-key="id">
        <el-table-column label="编号" width="100" align="center">
          <template slot-scope="scope">
            <span class="id-number">#{{scope.row.id}}</span>
          </template>
        </el-table-column>
        <el-table-column label="秒杀时间段名称" min-width="180" align="center">
          <template slot-scope="scope">
            <span class="session-name">{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column label="每日开始时间" width="180" align="center">
          <template slot-scope="scope">
            <el-tag type="success" effect="plain" size="medium">
              <i class="el-icon-sunrise-1"></i> {{scope.row.startTime | formatTime}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="每日结束时间" width="180" align="center">
          <template slot-scope="scope">
            <el-tag type="warning" effect="plain" size="medium">
              <i class="el-icon-sunset"></i> {{scope.row.endTime | formatTime}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="启用状态" width="120" align="center">
          <template slot-scope="scope">
            <el-switch
              @change="handleStatusChange(scope.$index, scope.row)"
              :active-value="1"
              :inactive-value="0"
              v-model="scope.row.status"
              active-color="#13ce66"
              inactive-color="#ff4949">
            </el-switch>
            <span class="switch-status" :class="scope.row.status === 1 ? 'active' : 'inactive'">
              {{ scope.row.status === 1 ? '已启用' : '未启用' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template slot-scope="scope">
            <div class="operation-container">
              <el-button size="mini"
                        type="primary"
                        plain
                        icon="el-icon-edit"
                        @click="handleUpdate(scope.$index, scope.row)">
                  编辑
              </el-button>
              <el-button size="mini"
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
            <i class="el-icon-time"></i>
            <p>暂无秒杀时间段数据</p>
          </div>
        </template>
      </el-table>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      :title="isEdit?'编辑时间段':'添加时间段'"
      :visible.sync="dialogVisible"
      width="500px"
      :close-on-click-modal="false"
      center
      class="edit-dialog">
      <div class="dialog-header">
        <i :class="isEdit ? 'el-icon-edit-outline' : 'el-icon-circle-plus-outline'" class="dialog-icon"></i>
        <span class="dialog-title">{{ isEdit ? '编辑秒杀时间段信息' : '新增秒杀时间段' }}</span>
      </div>
      <el-form :model="flashSession"
               ref="flashSessionForm"
               label-width="120px" size="small">
        <el-form-item label="时间段名称：">
          <el-input v-model="flashSession.name" placeholder="请输入时间段名称" class="input-width"></el-input>
        </el-form-item>
        <el-form-item label="每日开始时间：">
          <el-time-picker
            v-model="flashSession.startTime"
            placeholder="请选择开始时间"
            value-format="HH:mm:ss"
            format="HH:mm:ss"
            class="input-width">
          </el-time-picker>
        </el-form-item>
        <el-form-item label="每日结束时间：">
          <el-time-picker
            v-model="flashSession.endTime"
            placeholder="请选择结束时间"
            value-format="HH:mm:ss"
            format="HH:mm:ss"
            class="input-width">
          </el-time-picker>
        </el-form-item>
        <el-form-item label="是否启用：">
          <el-radio-group v-model="flashSession.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">不启用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="small" icon="el-icon-close">取 消</el-button>
        <el-button type="primary" @click="handleDialogConfirm()" size="small" icon="el-icon-check">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  import {fetchList,updateStatus,deleteSession,createSession,updateSession} from '@/api/flashSession';
  import {formatDate} from '@/utils/date';
  const defaultFlashSession={
    name:null,
    startTime:null,
    endTime:null,
    status:0
  };
  export default {
    name: 'flashPromotionSessionList',
    data() {
      return {
        list: null,
        listLoading: false,
        dialogVisible:false,
        isEdit:false,
        flashSession:Object.assign({},defaultFlashSession)
      }
    },
    created() {
      this.getList();
    },
    filters:{
      formatTime(time) {
        if (time == null || time === '') {
          return 'N/A';
        }
        let date = new Date(time);
        return formatDate(date, 'hh:mm:ss')
      }
    },
    methods: {
      handleAdd() {
        this.dialogVisible = true;
        this.isEdit = false;
        this.flashSession = Object.assign({},defaultFlashSession);
      },
      handleStatusChange(index,row){
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
      handleUpdate(index,row){
        this.dialogVisible = true;
        this.isEdit = true;
        this.flashSession = Object.assign({},row);
        this.flashSession.startTime=new Date(row.startTime);
        this.flashSession.endTime=new Date(row.endTime);
      },
      handleDelete(index,row){
        this.$confirm('是否要删除该时间段?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteSession(row.id).then(response => {
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
            updateSession(this.flashSession.id,this.flashSession).then(response => {
              this.$message({
                message: '修改成功！',
                type: 'success'
              });
              this.dialogVisible =false;
              this.getList();
            })
          } else {
            createSession(this.flashSession).then(response => {
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
      getList() {
        this.listLoading = true;
        fetchList({}).then(response => {
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

  /* 操作卡片 */
  .operate-card {
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .title {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
    display: flex;
    align-items: center;
  }

  .title i {
    margin-right: 8px;
    color: #409EFF;
    font-size: 18px;
  }

  .tools .el-button {
    margin-left: 10px;
  }

  /* 表格卡片 */
  .table-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
  }

  .card-header {
    border-bottom: 1px solid #EBEEF5;
    padding-bottom: 10px;
  }

  .card-title {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
    display: flex;
    align-items: center;
  }
  
  .card-title i {
    margin-right: 8px;
    color: #409EFF;
  }

  /* 表格样式 */
  .el-table {
    border-radius: 6px;
    overflow: hidden;
  }

  .id-number {
    font-family: Consolas, Monaco, monospace;
    font-weight: bold;
    color: #606266;
    background-color: #f4f4f5;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
  }

  .session-name {
    font-weight: 500;
    color: #303133;
  }

  .el-table th {
    background-color: #f8f9fa !important; /* 强制覆盖element默认样式 */
  }

  .el-tag i {
    margin-right: 4px;
  }
  
  .switch-status {
    font-size: 12px;
    margin-left: 8px;
    vertical-align: middle;
  }

  .switch-status.active {
    color: #13ce66;
  }

  .switch-status.inactive {
    color: #ff4949;
  }

  /* 操作按钮容器 */
  .operation-container {
    display: flex;
    justify-content: center;
    gap: 8px;
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
    color: #c0c4cc;
  }

  .empty-data p {
    margin: 0;
    font-size: 14px;
  }

  /* 对话框样式 */
  .edit-dialog .dialog-header {
    display: flex;
    align-items: center;
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 1px solid #EBEEF5;
  }

  .edit-dialog .dialog-icon {
    font-size: 22px;
    color: #409EFF;
    margin-right: 10px;
  }

  .edit-dialog .dialog-title {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
  }

  .edit-dialog .el-form-item {
    margin-bottom: 22px;
  }

  .edit-dialog .el-form-item__label {
    font-weight: normal;
  }

  .input-width {
    width: 100%;
  }

  .el-time-picker {
    width: 100%;
  }

  .dialog-footer {
    text-align: right;
    padding-top: 15px;
  }
  
  /* 移除原始样式 */
  .operate-container {
    /* margin-top: 0; (此样式不再需要或被覆盖) */
  }
</style>


