<template>
  <div class="app-container">
    <el-card class="filter-container" shadow="always">
      <div>
        <i class="el-icon-search"></i>
        <span>筛选搜索</span>
        <el-button
          style="float: right"
          @click="handleSearchList()"
          type="primary"
          size="small">
          查询结果
        </el-button>
        <el-button
          style="float: right;margin-right: 15px"
          @click="handleResetSearch()"
          size="small">
          重置
        </el-button>
      </div>
      <div style="margin-top: 15px">
        <el-form :inline="true" :model="listQuery" size="small" label-width="140px">
          <el-form-item label="网点名称：">
            <el-input v-model="listQuery.keyword" class="input-width" placeholder="网点名称"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    
    <el-card class="operate-container" shadow="always">
      <i class="el-icon-location-information"></i>
      <span>合作网点列表</span>
      <el-button
        class="btn-add"
        type="primary"
        icon="el-icon-plus"
        @click="handleAddServicePoint()"
        size="small">
        添加网点
      </el-button>
    </el-card>
    
    <!-- 卡片列表展示 -->
    <div v-loading="listLoading">
      <el-row :gutter="20" class="service-point-list">
        <el-col :span="12" v-for="(item, index) in list" :key="item.id" :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
          <el-card class="service-point-card" shadow="always">
            <div slot="header" class="clearfix">
              <span class="point-name">{{item.locationName}}</span>
              <div class="status-tag">
                <el-tag v-if="item.servicePointStatus === 0" type="success" size="mini">正常</el-tag>
                <el-tag v-else type="danger" size="mini">已关闭</el-tag>
              </div>
              <div class="card-actions">
                <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(index, item)">编辑</el-button>
                <el-button size="mini" type="text" icon="el-icon-delete" class="delete-btn" @click="handleDelete(index, item)">删除</el-button>
              </div>
            </div>
            <div class="card-content">
              <div class="info-item">
                <i class="el-icon-location"></i>
                <span class="info-label">地址：</span>
                <span class="info-value">{{item.locationAddress}}</span>
              </div>
              <div class="info-item">
                <i class="el-icon-map-location"></i>
                <span class="info-label">坐标：</span>
                <span class="info-value">{{item.locationLongitude}}, {{item.locationLatitude}}</span>
              </div>
              <div class="info-item">
                <i class="el-icon-s-custom"></i>
                <span class="info-label">负责人：</span>
                <span class="info-value">{{item.contactName || '未设置'}}</span>
              </div>
              <div class="info-item">
                <i class="el-icon-phone"></i>
                <span class="info-label">电话：</span>
                <span class="info-value">{{item.contactPhone || '未设置'}}</span>
              </div>
              <div class="info-item">
                <i class="el-icon-medal"></i>
                <span class="info-label">类型：</span>
                <span class="info-value">
                  <el-tag size="mini" v-if="item.servicePointType === 0" type="primary">自提点</el-tag>
                  <el-tag size="mini" v-else-if="item.servicePointType === 1" type="success">收货点</el-tag>
                  <el-tag size="mini" v-else-if="item.servicePointType === 2" type="warning">综合点</el-tag>
                  <span v-else>未设置</span>
                </span>
              </div>
              <div class="info-item">
                <i class="el-icon-star-on"></i>
                <span class="info-label">服务星级：</span>
                <span class="info-value">
                  <el-rate v-model="item.serviceStarRating" disabled show-score text-color="#ff9900"></el-rate>
                </span>
              </div>
              <div class="info-item">
                <i class="el-icon-data-analysis"></i>
                <span class="info-label">业务量：</span>
                <span class="info-value">
                  <span class="count-item">自提: {{item.selfPickBillCount || 0}}</span>
                  <span class="count-item">收货: {{item.receiveBillCount || 0}}</span>
                </span>
              </div>
              <div class="info-item">
                <i class="el-icon-time"></i>
                <span class="info-label">服务时间：</span>
                <span class="info-value">
                  <span v-if="item.serviceTimeType === 0">全天服务</span>
                  <span v-else-if="item.serviceTimeType === 1 && item.serviceTimeList" 
                       class="time-list-text" 
                       @click="showTimeList(item.serviceTimeList)">查看服务时间</span>
                  <span v-else>未设置</span>
                </span>
              </div>
              <div class="info-item">
                <i class="el-icon-info"></i>
                <span class="info-label">ID：</span>
                <span class="info-value">{{item.id}}</span>
              </div>
            </div>
            <div class="card-footer">
              <el-switch
                v-model="item.servicePointStatus"
                :active-value="0"
                :inactive-value="1"
                active-text="启用"
                inactive-text="停用"
                @change="() => handleStatusChange(item)">
              </el-switch>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 没有数据时显示 -->
      <div v-if="!list || list.length === 0" class="empty-block">
        <img src="@/assets/images/empty.png" v-if="false">
        <i class="el-icon-location-information empty-icon"></i>
        <p class="empty-text">暂无网点数据</p>
      </div>
    </div>
    
    <div class="pagination-container">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        layout="total, sizes, prev, pager, next, jumper"
        :page-size="listQuery.pageSize"
        :page-sizes="[6, 9, 12]"
        :current-page.sync="listQuery.pageNum"
        :total="total">
      </el-pagination>
    </div>
    
    <!-- 服务时间弹窗 -->
    <el-dialog title="服务时间段" :visible.sync="timeDialogVisible" width="30%">
      <div v-if="timeListData && timeListData.length > 0">
        <div v-for="(time, index) in timeListData" :key="index" class="time-item">
          {{time.start}} - {{time.end}}
        </div>
      </div>
      <div v-else class="no-time-data">
        未设置服务时间或格式不正确
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {fetchList, deleteServicePoint, updateServicePointStatus} from '@/api/servicePoint';

  export default {
    name: 'servicePointList',
    data() {
      return {
        list: null,
        total: null,
        listLoading: true,
        listQuery: {
          pageNum: 1,
          pageSize: 6,
          keyword: null
        },
        timeDialogVisible: false,
        timeListData: []
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
        });
      },
      handleSearchList() {
        this.listQuery.pageNum = 1;
        this.getList();
      },
      handleResetSearch() {
        this.listQuery = {
          pageNum: 1,
          pageSize: 6,
          keyword: null
        };
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
      handleAddServicePoint() {
        this.$router.push('/ums/addServicePoint');
      },
      handleUpdate(index, row) {
        this.$router.push({path: '/ums/updateServicePoint', query: {id: row.id}});
      },
      handleDelete(index, row) {
        this.$confirm('是否要删除该合作网点?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteServicePoint(row.id).then(response => {
            this.$message({
              message: '删除成功',
              type: 'success',
              duration: 1000
            });
            this.getList();
          });
        });
      },
      // 显示服务时间列表
      showTimeList(timeListStr) {
        try {
          this.timeListData = JSON.parse(timeListStr);
          this.timeDialogVisible = true;
        } catch (e) {
          this.$message.error('时间格式不正确');
          this.timeListData = [];
          this.timeDialogVisible = true;
        }
      },
      
      // 处理网点状态变更
      handleStatusChange(row) {
        const statusText = row.servicePointStatus === 0 ? '启用' : '停用';
        this.$confirm(`确定要${statusText}该网点吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          updateServicePointStatus(row.id, row.servicePointStatus).then(response => {
            this.$message({
              message: `${statusText}成功`,
              type: 'success',
              duration: 1000
            });
            this.getList();
          });
        }).catch(() => {
          row.servicePointStatus = row.servicePointStatus === 0 ? 1 : 0;
        });
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .input-width {
    width: 203px;
  }
  
  .filter-container {
    margin-bottom: 15px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  }
  
  .operate-container {
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
    
    .el-icon-location-information {
      color: #409EFF;
      margin-right: 8px;
    }
  }
  
  .btn-add {
    float: right;
    margin-right: 0;
  }
  
  .service-point-list {
    margin-bottom: 20px;
  }
  
  .service-point-card {
    margin-bottom: 20px;
    border-radius: 8px;
    transition: all 0.3s;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15) !important;
    }
    
    .point-name {
      font-size: 18px;
      font-weight: bold;
      color: #303133;
    }
    
    .status-tag {
      display: inline-block;
      margin-left: 8px;
      vertical-align: middle;
    }
    
    .card-actions {
      float: right;
    }
    
    .delete-btn {
      color: #F56C6C;
    }
    
    .card-content {
      color: #606266;
      padding: 5px;
      
      .info-item {
        margin-bottom: 15px;
        display: flex;
        align-items: flex-start;
        
        i {
          margin-right: 10px;
          color: #409EFF;
          font-size: 16px;
          margin-top: 2px;
        }
        
        .info-label {
          font-weight: bold;
          margin-right: 5px;
          min-width: 70px;
        }
        
        .info-value {
          flex: 1;
          word-break: break-all;
        }
        
        .count-item {
          margin-right: 15px;
        }
      }
    }
    
    .card-footer {
      border-top: 1px solid #EBEEF5;
      padding-top: 10px;
      margin-top: 5px;
      text-align: right;
    }
  }
  
  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
  
  .empty-block {
    margin: 30px auto;
    padding: 30px 0;
    text-align: center;
    
    .empty-icon {
      font-size: 50px;
      color: #c0c4cc;
    }
    
    .empty-text {
      margin-top: 10px;
      font-size: 14px;
      color: #909399;
    }
  }
  
  .time-list-text {
    color: #409EFF;
    cursor: pointer;
    text-decoration: underline;
  }
  
  .time-item {
    padding: 8px;
    border-bottom: 1px solid #EBEEF5;
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  .no-time-data {
    text-align: center;
    color: #909399;
    padding: 20px 0;
  }
</style>