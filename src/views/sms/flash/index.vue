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
          style="float:right"
          type="primary"
          @click="handleSearchList()"
          size="small"
          icon="el-icon-search">
          查询搜索
        </el-button>
        <el-button
          style="float:right;margin-right: 15px"
          @click="handleResetSearch()"
          size="small"
          icon="el-icon-refresh">
          重置
        </el-button>
      </div>
      <div class="filter-content">
        <el-form :inline="true" :model="listQuery" size="small" label-width="100px">
          <el-form-item label="活动名称：">
            <el-input v-model="listQuery.keyword" 
                     class="input-width" 
                     placeholder="活动名称" 
                     clearable
                     @keyup.enter.native="handleSearchList()">
              <template slot="prefix">
                <i class="el-icon-shopping-bag-1" style="color: #909399"></i>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    
    <!-- 数据列表 -->
    <el-card class="list-container" shadow="hover">
      <div slot="header" class="clearfix">
        <span class="card-title">
          <i class="el-icon-alarm-clock"></i>
          秒杀活动列表
        </span>
        <div class="card-tools">
          <el-button 
            size="small" 
            type="primary" 
            @click="handleAdd()" 
            icon="el-icon-plus">
            添加活动
          </el-button>
          <el-button 
            size="small" 
            type="success" 
            @click="handleShowSessionList()"
            icon="el-icon-time">
            秒杀时间段列表
          </el-button>
        </div>
      </div>
      <el-table ref="flashTable"
                :data="list"
                style="width: 100%;"
                v-loading="listLoading" 
                border
                stripe
                highlight-current-row
                :header-cell-style="{background:'#f8f9fa',color:'#606266'}"
                row-key="id">
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        <el-table-column label="编号" width="80" align="center">
          <template slot-scope="scope">
            <span class="id-number">{{scope.row.id}}</span>
          </template>
        </el-table-column>
        <el-table-column label="活动标题" min-width="180" align="center">
          <template slot-scope="scope">
            <div class="flash-title">
              <i class="el-icon-shopping-bag-2 title-icon"></i>
              <span class="title-text">{{scope.row.title}}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="活动状态" width="150" align="center">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row)" effect="plain">
              <i :class="getStatusIcon(scope.row)"></i> 
              {{scope.row | formatActiveStatus}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="开始时间" width="150" align="center">
          <template slot-scope="scope">
            <div class="time-info">
              <i class="el-icon-date time-icon"></i>
              <span>{{scope.row.startDate | formatDate}}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="结束时间" width="150" align="center">
          <template slot-scope="scope">
            <div class="time-info">
              <i class="el-icon-date time-icon"></i>
              <span>{{scope.row.endDate | formatDate}}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="上线/下线" width="150" align="center">
          <template slot-scope="scope">
            <el-switch
              @change="handleStatusChange(scope.$index, scope.row)"
              :active-value="1"
              :inactive-value="0"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-text="上线"
              inactive-text="下线"
              v-model="scope.row.status">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" align="center">
          <template slot-scope="scope">
            <div class="operation-container">
              <el-button size="mini"
                        type="primary"
                        plain
                        icon="el-icon-goods"
                        @click="handleSelectSession(scope.$index, scope.row)">
                设置商品
              </el-button>
              <el-button size="mini"
                        type="success"
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
            <i class="el-icon-alarm-clock"></i>
            <p>暂无秒杀活动数据</p>
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
          :page-sizes="[5,10,15,20]"
          :total="total">
        </el-pagination>
      </div>
    </el-card>
    
    <!-- 添加/编辑活动对话框 -->
    <el-dialog
      :title="isEdit ? '编辑活动' : '添加活动'"
      :visible.sync="dialogVisible"
      width="50%">
      <el-form :model="flashPromotion"
              ref="flashPromotionForm"
              label-width="150px" size="small">
        <el-form-item label="活动标题：">
          <el-input v-model="flashPromotion.title" style="width: 300px" placeholder="请输入活动标题"></el-input>
        </el-form-item>
        <el-form-item label="开始时间：">
          <el-date-picker
            v-model="flashPromotion.startDate"
            type="date"
            placeholder="请选择开始时间"
            style="width: 300px">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间：">
          <el-date-picker
            v-model="flashPromotion.endDate"
            type="date"
            placeholder="请选择结束时间"
            style="width: 300px">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="上线/下线">
          <el-radio-group v-model="flashPromotion.status">
            <el-radio :label="1">上线</el-radio>
            <el-radio :label="0">下线</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="handleDialogConfirm()" size="small">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  import {fetchList, updateStatus, deleteFlash, createFlash, updateFlash} from '@/api/flash';
  import {formatDate} from '@/utils/date';

  const defaultListQuery = {
    pageNum: 1,
    pageSize: 5,
    keyword: null
  };
  const defaultFlashPromotion = {
    id: null,
    title: null,
    startDate: null,
    endDate: null,
    status: 0
  };
  export default {
    name: 'flashPromotionList',
    data() {
      return {
        listQuery: Object.assign({}, defaultListQuery),
        list: null,
        total: null,
        listLoading: false,
        dialogVisible: false,
        flashPromotion: Object.assign({}, defaultFlashPromotion),
        isEdit: false
      }
    },
    created() {
      this.getList();
    },
    filters: {
      formatActiveStatus(row) {
        let nowDate = new Date();
        let startDate = new Date(row.startDate);
        let endDate = new Date(row.endDate);
        if (nowDate.getTime() >= startDate.getTime() && nowDate.getTime() <= endDate.getTime()) {
          return '活动进行中';
        } else if (nowDate.getTime() > endDate.getTime()) {
          return '活动已结束';
        } else {
          return '活动未开始';
        }
      },
      formatDate(time) {
        if (time == null || time === '') {
          return 'N/A';
        }
        let date = new Date(time);
        return formatDate(date, 'yyyy-MM-dd')
      }
    },
    methods: {
      getStatusType(row) {
        let nowDate = new Date();
        let startDate = new Date(row.startDate);
        let endDate = new Date(row.endDate);
        
        if (nowDate.getTime() >= startDate.getTime() && nowDate.getTime() <= endDate.getTime()) {
          return 'success';
        } else if (nowDate.getTime() > endDate.getTime()) {
          return 'info';
        } else {
          return 'warning';
        }
      },
      getStatusIcon(row) {
        let nowDate = new Date();
        let startDate = new Date(row.startDate);
        let endDate = new Date(row.endDate);
        
        if (nowDate.getTime() >= startDate.getTime() && nowDate.getTime() <= endDate.getTime()) {
          return 'el-icon-video-play';
        } else if (nowDate.getTime() > endDate.getTime()) {
          return 'el-icon-circle-check';
        } else {
          return 'el-icon-timer';
        }
      },
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
        this.flashPromotion = Object.assign({},defaultFlashPromotion);
      },
      handleShowSessionList() {
        this.$router.push({path: '/sms/flashSession'})
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
        this.$confirm('是否要删除该活动?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteFlash(row.id).then(response => {
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
        this.flashPromotion = Object.assign({},row);
      },
      handleDialogConfirm() {
        this.$confirm('是否要确认?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (this.isEdit) {
            updateFlash(this.flashPromotion.id,this.flashPromotion).then(response => {
              this.$message({
                message: '修改成功！',
                type: 'success'
              });
              this.dialogVisible =false;
              this.getList();
            })
          } else {
            createFlash(this.flashPromotion).then(response => {
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
      handleSelectSession(index,row){
        this.$router.push({path:'/sms/selectSession',query:{flashPromotionId:row.id}})
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
    width: 250px;
  }
  
  /* 列表容器 */
  .list-container {
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
  
  /* 表格样式 */
  .id-number {
    font-family: Consolas, Monaco, monospace;
    font-weight: bold;
    color: #606266;
  }
  
  .flash-title {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 10px;
  }
  
  .title-icon {
    color: #E6A23C;
    margin-right: 5px;
    flex-shrink: 0;
  }
  
  .title-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
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
    flex-shrink: 0;
  }
  
  /* 操作按钮样式 */
  .operation-container {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 5px;
    padding: 5px;
  }
  
  .operation-container .el-button {
    padding: 7px 12px;
    margin: 3px 5px;
    min-width: 92px;
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
  
  /* 适配移动设备 */
  @media screen and (max-width: 768px) {
    .operation-container {
      flex-direction: column;
    }
    
    .operation-container .el-button {
      width: 100%;
    }
  }
</style>


