<template>
  <div class="app-container">
    <!-- 筛选搜索区域 -->
    <el-card class="filter-container" shadow="hover">
      <div class="filter-header">
        <div class="filter-title">
          <i class="el-icon-search"></i>
          <span>筛选搜索</span>
        </div>
        <div class="filter-buttons">
          <el-button
            type="primary"
            @click="handleSearchList()"
            size="small"
            icon="el-icon-search">
            查询搜索
          </el-button>
          <el-button
            @click="handleResetSearch()"
            size="small"
            icon="el-icon-refresh">
            重置
          </el-button>
        </div>
      </div>
      <div class="filter-form">
        <el-form :inline="true" :model="listQuery" size="small" label-width="100px"> <!-- Adjusted label width -->
          <el-form-item label="广告名称：">
            <el-input v-model="listQuery.name" class="input-width" placeholder="广告名称" clearable></el-input>
          </el-form-item>
          <el-form-item label="广告位置：">
            <el-select v-model="listQuery.type" placeholder="全部" clearable class="input-width">
              <el-option v-for="item in typeOptions"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="到期时间：">
            <el-date-picker
              class="input-width"
              v-model="listQuery.endTime"
              value-format="yyyy-MM-dd"
              type="date"
              placeholder="请选择时间">
            </el-date-picker>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    
    <!-- 操作和数据列表区域 -->
    <el-card class="list-container" shadow="hover">
      <div slot="header" class="clearfix card-header">
        <span class="card-title">
          <i class="el-icon-picture-outline"></i> <!-- Changed icon -->
          <span>广告列表</span>
        </span>
        <div class="card-tools">
           <el-tooltip content="刷新列表" placement="top">
            <el-button 
              size="small" 
              icon="el-icon-refresh" 
              type="text" 
              @click="getList()">
            </el-button>
          </el-tooltip>
          <el-button 
            size="small" 
            type="primary" 
            icon="el-icon-plus" 
            @click="handleAdd()">
            添加广告
          </el-button>
        </div>
      </div>
      
      <el-table ref="homeAdvertiseTable"
                :data="list"
                style="width: 100%;"
                @selection-change="handleSelectionChange"
                v-loading="listLoading" 
                border
                stripe
                highlight-current-row
                :header-cell-style="{background:'#f8f9fa',color:'#606266'}"
                row-key="id">
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        <el-table-column label="编号" width="100" align="center">
          <template slot-scope="scope">
            <span class="id-number">#{{scope.row.id}}</span>
          </template>
        </el-table-column>
        <el-table-column label="广告名称" min-width="150" align="center">
          <template slot-scope="scope">
            <span class="advertise-name">{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column label="广告位置" width="140" align="center">
          <template slot-scope="scope">
             <el-tag size="medium" :type="scope.row.type === 1 ? 'warning' : 'success'" effect="plain">
               {{scope.row.type | formatType}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="广告图片" width="140" align="center">
          <template slot-scope="scope">
            <el-image 
              style="width: 100px; height: 60px" 
              :src="scope.row.pic"
              fit="contain" 
              :preview-src-list="[scope.row.pic]">
               <div slot="error" class="image-slot">
                <i class="el-icon-picture-outline"></i>
              </div>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column label="时间范围" width="260" align="center">
          <template slot-scope="scope">
            <div class="time-range">
              <p><i class="el-icon-time start-time"></i> 开始：{{scope.row.startTime | formatTime}}</p>
              <p><i class="el-icon-timer end-time"></i> 结束：{{scope.row.endTime | formatTime}}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="上线状态" width="140" align="center">
          <template slot-scope="scope">
            <el-switch
              @change="handleUpdateStatus(scope.$index, scope.row)"
              :active-value="1"
              :inactive-value="0"
              v-model="scope.row.status"
              active-color="#13ce66"
              inactive-color="#ff4949">
            </el-switch>
            <span class="switch-status" :class="scope.row.status === 1 ? 'active' : 'inactive'">
              {{ scope.row.status === 1 ? '已上线' : '已下线' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="点击次数" width="100" align="center">
          <template slot-scope="scope">
            <el-tag size="small" effect="plain" type="info">{{scope.row.clickCount}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="生成订单" width="100" align="center">
           <template slot-scope="scope">
            <el-tag size="small" effect="plain" type="warning">{{scope.row.orderCount}}</el-tag>
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
            <i class="el-icon-picture-outline-round"></i> <!-- Changed icon -->
            <p>暂无广告数据</p>
          </div>
        </template>
      </el-table>
      
      <!-- 批量操作区域 -->
      <div class="batch-operate-container">
        <el-select
          size="small"
          v-model="operateType" 
          placeholder="批量操作"
           class="batch-select">
          <el-option
            v-for="item in operates"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-button
          class="batch-button"
          @click="handleBatchOperate()"
          type="primary"
          size="small"
          icon="el-icon-check">
          确定
        </el-button>
      </div>
      
      <!-- 分页区域 -->
      <div class="pagination-container">
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          layout="total, sizes, prev, pager, next, jumper"
          :page-size="listQuery.pageSize"
          :page-sizes="[5,10,15]"
          :current-page.sync="listQuery.pageNum"
          :total="total">
        </el-pagination>
      </div>
    </el-card>
  </div>
</template>
<script>
  import {fetchList,updateStatus,deleteHomeAdvertise} from '@/api/homeAdvertise';
  import {formatDate} from '@/utils/date';
  const defaultListQuery = {
    pageNum: 1,
    pageSize: 5,
    name: null,
    type: null,
    endTime:null
  };
  const defaultTypeOptions = [
    {
      label: 'PC首页轮播',
      value: 0
    },
    {
      label: 'APP首页轮播',
      value: 1
    }
  ];
  export default {
    name: 'homeAdvertiseList',
    data() {
      return {
        listQuery: Object.assign({}, defaultListQuery),
        typeOptions: Object.assign({}, defaultTypeOptions),
        list: null,
        total: null,
        listLoading: false,
        multipleSelection: [],
        operates: [
          {
            label: "删除",
            value: 0
          }
        ],
        operateType: null
      }
    },
    created() {
      this.getList();
    },
    filters:{
      formatType(type){
        if(type===1){
          return 'APP首页轮播';
        }else{
          return 'PC首页轮播';
        }
      },
      formatTime(time){
        if(time==null||time===''){
          return 'N/A';
        }
        let date = new Date(time);
        return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
      },
    },
    methods: {
      handleResetSearch() {
        this.listQuery = Object.assign({}, defaultListQuery);
      },
      handleSearchList() {
        this.listQuery.pageNum = 1;
        this.getList();
      },
      handleSelectionChange(val){
        this.multipleSelection = val;
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
      handleUpdateStatus(index,row){
        this.$confirm('是否要修改上线/下线状态?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          updateStatus(row.id,{status:row.status}).then(response=>{
            this.getList();
            this.$message({
              type: 'success',
              message: '修改成功!'
            });
          });
        }).catch(() => {
          this.$message({
            type: 'info', // Corrected type to 'info' for cancellation
            message: '已取消操作!'
          });
          this.getList();
        });
      },
      handleDelete(index,row){
        this.deleteHomeAdvertise(row.id);
      },
      handleBatchOperate(){
        if (this.multipleSelection < 1) {
          this.$message({
            message: '请选择一条记录',
            type: 'warning',
            duration: 1000
          });
          return;
        }
        let ids = [];
        for (let i = 0; i < this.multipleSelection.length; i++) {
          ids.push(this.multipleSelection[i].id);
        }
        if(this.operateType===0){
          //删除
          this.deleteHomeAdvertise(ids);
        }else {
          this.$message({
            message: '请选择批量操作类型',
            type: 'warning',
            duration: 1000
          });
        }
      },
      handleAdd(){
        this.$router.push({path: '/sms/addAdvertise'})
      },
      handleUpdate(index,row){
        this.$router.push({path: '/sms/updateAdvertise', query: {id: row.id}})
      },
      getList() {
        this.listLoading = true;
        fetchList(this.listQuery).then(response => {
          this.listLoading = false;
          this.list = response.data.list;
          this.total = response.data.total;
        })
      },
      deleteHomeAdvertise(ids){
        this.$confirm('是否要删除该广告?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let params=new URLSearchParams();
          params.append("ids",ids);
          deleteHomeAdvertise(params).then(response=>{
            this.getList();
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
          });
        })
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
  
  /* 卡片通用样式 */
  .filter-container, .list-container {
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  }
  
  /* 筛选区样式 */
  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .filter-title {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
    display: flex;
    align-items: center;
  }
  
  .filter-title i {
    margin-right: 8px;
    color: #409EFF;
    font-size: 18px;
  }
  
  .filter-buttons .el-button {
    margin-left: 10px;
  }
  
  .filter-form {
    margin-top: 15px;
  }
  
  .input-width {
    width: 220px;
  }
  
  /* 表格卡片样式 */
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
    color: #F56C6C; /* Changed icon color for advertise */
    font-size: 18px;
  }
  
  .card-tools {
    display: flex;
    align-items: center;
  }
  
  .card-tools .el-button {
    margin-left: 10px;
  }
  
  /* 表格样式 */
  .id-number {
    font-family: Consolas, Monaco, monospace;
    font-weight: bold;
    color: #606266;
    background-color: #f4f4f5;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
  }
  
  .advertise-name {
    font-weight: 500;
    color: #303133;
  }

  .el-image__error, .image-slot {
    background: #f5f7fa;
    color: #c0c4cc;
    font-size: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .time-range p {
    margin: 2px 0;
    font-size: 13px;
    color: #606266;
    display: flex;
    align-items: center;
    justify-content: center; /* Center time text */
  }
  
  .time-range i {
    margin-right: 4px;
    font-size: 14px;
  }

  .start-time {
     color: #67C23A;
  }
  .end-time {
     color: #F56C6C;
  }

  /* 开关状态样式 */
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
  
  /* 操作按钮样式 */
  .operation-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
  }
  
  .operation-container .el-button {
    margin: 0;
  }
  
  /* 空数据状态 */
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
  
  /* 批量操作区域 */
  .batch-operate-container {
    display: flex;
    align-items: center;
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #EBEEF5;
  }
  
  .batch-select {
    width: 160px;
  }
  
  .batch-button {
    margin-left: 15px;
  }
  
  /* 分页样式 */
  .pagination-container {
    margin-top: 20px;
    padding-bottom: 10px;
    text-align: right;
  }

  /* Removed original .input-width style as it's handled by a class now */
</style>


