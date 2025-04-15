<template> 
  <div class="app-container">
    <!-- 顶部导航区域 -->
    <el-card class="header-card" shadow="hover">
      <div class="page-header">
        <div class="page-title">
          <i class="el-icon-time"></i>
          <span>秒杀时间段选择</span>
        </div>
        <el-button 
          size="small" 
          class="btn-back" 
          type="primary"
          plain
          icon="el-icon-back"
          @click="goBack">
          返回
        </el-button>
      </div>
    </el-card>
    
    <!-- 数据列表 -->
    <el-card class="list-container" shadow="hover">
      <div slot="header" class="clearfix">
        <span class="card-title">
          <i class="el-icon-alarm-clock"></i>
          秒杀时间段列表
        </span>
        <div class="card-tools">
          <el-tooltip content="刷新数据" placement="top">
            <el-button type="text" icon="el-icon-refresh" @click="getList"></el-button>
          </el-tooltip>
        </div>
      </div>
      
      <el-table ref="selectSessionTable"
                :data="list"
                style="width: 100%;"
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
        <el-table-column label="秒杀时间段名称" min-width="150" align="center">
          <template slot-scope="scope">
            <div class="session-name">
              <i class="el-icon-bell name-icon"></i>
              <span class="name-text">{{scope.row.name}}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="每日开始时间" width="150" align="center">
          <template slot-scope="scope">
            <div class="time-info">
              <i class="el-icon-sunrise time-icon"></i>
              <span>{{scope.row.startTime | formatTime}}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="每日结束时间" width="150" align="center">
          <template slot-scope="scope">
            <div class="time-info">
              <i class="el-icon-sunset time-icon"></i>
              <span>{{scope.row.endTime | formatTime}}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="商品数量" width="120" align="center">
          <template slot-scope="scope">
            <el-tag size="medium" type="info" effect="plain">
              <i class="el-icon-goods"></i> {{scope.row.productCount || 0}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template slot-scope="scope">
            <el-button size="mini"
                     type="primary"
                     plain
                     icon="el-icon-shopping-bag-1"
                     @click="handleShowRelation(scope.$index, scope.row)">
              商品列表
            </el-button>
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
  </div>
</template>
<script>
  import {fetchSelectList} from '@/api/flashSession';
  import {formatDate} from '@/utils/date';
  export default {
    name: 'selectSessionList',
    data() {
      return {
        list: null,
        listLoading: false
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
      goBack() {
        this.$router.back();
      },
      handleShowRelation(index,row){
        this.$router.push({path:'/sms/flashProductRelation',query:{
          flashPromotionId:this.$route.query.flashPromotionId, flashPromotionSessionId:row.id}})
      },
      getList() {
        this.listLoading = true;
        fetchSelectList({flashPromotionId:this.$route.query.flashPromotionId}).then(response => {
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
  
  /* 顶部导航 */
  .header-card {
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  }
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .page-title {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
    display: flex;
    align-items: center;
  }
  
  .page-title i {
    margin-right: 5px;
    color: #409EFF;
  }
  
  /* 列表容器 */
  .list-container {
    border-radius: 8px;
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
  
  /* 表格样式 */
  .id-number {
    font-family: Consolas, Monaco, monospace;
    font-weight: bold;
    color: #606266;
  }
  
  .session-name {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 10px;
  }
  
  .name-icon {
    color: #409EFF;
    margin-right: 5px;
    flex-shrink: 0;
  }
  
  .name-text {
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
</style>


