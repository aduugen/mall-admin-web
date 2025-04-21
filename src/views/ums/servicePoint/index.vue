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
                <i class="el-icon-info"></i>
                <span class="info-label">ID：</span>
                <span class="info-value">{{item.id}}</span>
              </div>
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
  </div>
</template>

<script>
  import {fetchList, deleteServicePoint} from '@/api/servicePoint';

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
        }
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
          min-width: 50px;
        }
        
        .info-value {
          word-break: break-all;
          flex: 1;
        }
      }
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
</style>