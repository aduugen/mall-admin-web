<template> 
  <div class="app-container">
    <!-- 筛选搜索区域 -->
    <div class="card-section">
      <div class="card-header">
        <div class="card-title">
          <i class="el-icon-search"></i>
          <span>筛选搜索</span>
        </div>
        <div class="search-buttons">
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
      <div class="card-content">
        <el-form :inline="true" :model="listQuery" size="small" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="服务单号：">
                <el-input v-model="listQuery.id" placeholder="请输入服务单号" clearable></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="处理状态：">
                <el-select v-model="listQuery.status" placeholder="全部" clearable>
                  <el-option v-for="item in statusOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="申请时间：">
                <el-date-picker
                  v-model="listQuery.createTime"
                  value-format="yyyy-MM-dd"
                  type="date"
                  placeholder="请选择时间">
                </el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="操作人员：">
                <el-input v-model="listQuery.handleMan" placeholder="请输入操作人员" clearable></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="处理时间：">
                <el-date-picker
                  v-model="listQuery.handleTime"
                  value-format="yyyy-MM-dd"
                  type="date"
                  placeholder="请选择时间">
                </el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>
    
    <!-- 数据列表区域 -->
    <div class="card-section">
      <div class="card-header">
        <div class="card-title">
          <i class="el-icon-tickets"></i>
          <span>数据列表</span>
        </div>
        <div class="header-right">
          <el-select
            size="small"
            v-model="operateType" 
            placeholder="批量操作"
            style="margin-right: 10px">
            <el-option
              v-for="item in operateOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <el-button
            @click="handleBatchOperate()"
            type="primary"
            size="small"
            icon="el-icon-check">
            确定
          </el-button>
        </div>
      </div>
      
      <!-- 数据表格 -->
      <div class="card-content">
        <el-table 
          ref="returnApplyTable"
          :data="list"
          style="width: 100%;"
          @selection-change="handleSelectionChange"
          v-loading="listLoading" 
          border
          stripe
          highlight-current-row
          class="custom-table">
          <el-table-column type="selection" width="60" align="center"></el-table-column>
          <el-table-column label="售后单号" min-width="120" align="center">
            <template slot-scope="scope">
              <span class="order-id">{{scope.row.id}}</span>
            </template>
          </el-table-column>
          <el-table-column label="申请时间" min-width="160" align="center">
            <template slot-scope="scope">
              <span class="apply-time">{{scope.row.createTime | formatTime}}</span>
            </template>
          </el-table-column>
          <el-table-column label="用户信息" min-width="150" align="center">
            <template slot-scope="scope">
              <div class="user-info">
                <p><span class="label">用户ID：</span>{{scope.row.memberId || '未知用户'}}</p>
                <p v-if="scope.row.memberNickname"><span class="label">昵称：</span>{{scope.row.memberNickname}}</p>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="退款金额" min-width="120" align="center">
            <template slot-scope="scope">
              <span class="refund-amount">￥{{calcTotalAmount(scope.row)}}</span>
            </template>
          </el-table-column>
          <el-table-column label="申请状态" min-width="120" align="center">
            <template slot-scope="scope">
              <el-tag :type="getStatusTagType(scope.row.status)">{{ scope.row.status | formatStatus }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="处理时间" min-width="160" align="center">
            <template slot-scope="scope">
              <span class="handle-time">{{scope.row.handleTime | formatTime}}</span>
            </template>
          </el-table-column>
          <el-table-column label="处理人" min-width="120" align="center">
            <template slot-scope="scope">
              <span class="handle-man">{{scope.row.handleMan || '未处理'}}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="150" align="center" fixed="right">
            <template slot-scope="scope">
              <el-button
              size="mini"
              type="primary"
              icon="el-icon-view"
              @click="handleViewDetail(scope.$index, scope.row)"
              class="action-button">
              查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 分页 -->
      <div class="pagination-card">
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
    </div>
  </div>
</template>
<script>
  import {formatDate} from '@/utils/date';
  import {fetchList,deleteApply} from '@/api/returnApply';
  const defaultListQuery = {
    pageNum: 1,
    pageSize: 10,
    id: null,
    receiverKeyword: null,
    status: null,
    createTime: null,
    handleMan: null,
    handleTime: null
  };
  const defaultStatusOptions=[
    {
      label: '待处理',
      value: 0
    },
    {
      label: '已同意',
      value: 1
    },
    {
      label: '已拒绝',
      value: 2
    },
    {
      label: '已发货',
      value: 3
    },
    {
      label: '已收货',
      value: 4
    },
    {
      label: '质检中',
      value: 5
    },
    {
      label: '质检通过',
      value: 6
    },
    {
      label: '质检不通过',
      value: 7
    },
    {
      label: '退款中',
      value: 8
    },
    {
      label: '已完成',
      value: 9
    }
  ];
  export default {
    name:'returnApplyList',
    data() {
      return {
        listQuery:Object.assign({},defaultListQuery),
        statusOptions: Object.assign({},defaultStatusOptions),
        list:null,
        total:null,
        listLoading:false,
        multipleSelection:[],
        operateType:1,
        operateOptions: [
          {
            label: "批量删除",
            value: 1
          }
        ],
      }
    },
    created(){
      this.getList();
    },
    filters:{
      formatTime(time) {
        if(time==null||time===''){
          return 'N/A';
        }
        let date = new Date(time);
        return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
      },
      formatStatus(status){
        if (status === 0) {
          return '待处理';
        } else if (status === 1) {
          return '已同意';
        } else if (status === 2) {
          return '已拒绝';
        } else if (status === 3) {
          return '已发货';
        } else if (status === 4) {
          return '已收货';
        } else if (status === 5) {
          return '质检中';
        } else if (status === 6) {
          return '质检通过';
        } else if (status === 7) {
          return '质检不通过';
        } else if (status === 8) {
          return '退款中';
        } else if (status === 9) {
          return '已完成';
        } else {
          return '未知状态';
        }
      },
      formatReturnAmount(row){
        return row.productRealPrice*row.productCount;
      }
    },
    methods:{
      getStatusTagType(status) {
        switch(status) {
          case 0: return 'warning';
          case 1: return 'primary';
          case 2: return 'success';
          case 3: return 'danger';
          default: return 'info';
        }
      },
      handleSelectionChange(val){
        this.multipleSelection = val;
      },
      handleResetSearch() {
        this.listQuery = Object.assign({}, defaultListQuery);
      },
      handleSearchList() {
        this.listQuery.pageNum = 1;
        this.getList();
      },
      handleViewDetail(index,row){
        this.$router.push({path:'/oms/returnApplyDetail',query:{id:row.id}})
      },
      handleBatchOperate(){
        if(this.multipleSelection==null||this.multipleSelection.length<1){
          this.$message({
            message: '请选择要操作的申请',
            type: 'warning',
            duration: 1000
          });
          return;
        }
        if(this.operateType===1){
          //批量删除
          this.$confirm('是否要进行删除操作?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            let params = new URLSearchParams();
            let ids=[];
            for(let i=0;i<this.multipleSelection.length;i++){
              ids.push(this.multipleSelection[i].id);
            }
            params.append("ids",ids);
            deleteApply(params).then(response=>{
              this.getList();
              this.$message({
                type: 'success',
                message: '删除成功!'
              });
            });
          })
        }
      },
      handleSizeChange(val){
        this.listQuery.pageNum = 1;
        this.listQuery.pageSize = val;
        this.getList();
      },
      handleCurrentChange(val){
        this.listQuery.pageNum = val;
        this.getList();
      },
      getList(){
        this.listLoading=true;
        fetchList(this.listQuery).then(response => {
          this.listLoading = false;
          this.list = response.data.list;
          this.total = response.data.total;
        }).catch(() => {
          this.listLoading = false;
        });
      },
      calcTotalQuantity(row) {
        if (!row.afterSaleItemList || row.afterSaleItemList.length === 0) {
          return 0;
        }
        return row.afterSaleItemList.reduce((sum, item) => sum + (item.returnQuantity || 0), 0);
      },
      calcTotalAmount(row) {
        if (!row.afterSaleItemList || row.afterSaleItemList.length === 0) {
          return '0.00';
        }
        const total = row.afterSaleItemList.reduce((sum, item) => {
          const price = item.productRealPrice || 0;
          const quantity = item.returnQuantity || 0;
          return sum + (price * quantity);
        }, 0);
        return total.toFixed(2);
      },
      formatProductAttr(jsonAttr) {
        if (!jsonAttr || jsonAttr === '[]') return '';
        try {
          let attrArr = JSON.parse(jsonAttr);
          return attrArr.map(item => item.key + ":" + item.value).join('; ');
        } catch (e) {
          console.error("Error parsing productAttr:", e);
          return jsonAttr;
        }
      }
    }
  }
</script>
<style scoped>
  /* 整体容器样式 */
  .app-container {
    padding: 20px;
    background-color: #f5f7fa;
  }
  
  /* 卡片风格样式 */
  .card-section {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
    overflow: hidden;
    transition: all 0.3s;
  }
  
  .card-section:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
  
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 20px;
    border-bottom: 1px solid #f0f2f5;
    background-color: #fafbfc;
  }
  
  .card-title {
    display: flex;
    align-items: center;
  }
  
  .card-title i {
    color: #409EFF;
    font-size: 18px;
    margin-right: 8px;
  }
  
  .card-title span {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
  }
  
  .card-content {
    padding: 20px;
  }
  
  /* 搜索区域样式 */
  .search-buttons {
    display: flex;
    gap: 10px;
  }
  
  /* 表格样式 */
  .custom-table {
    margin-top: 10px;
    border-radius: 4px;
    overflow: hidden;
  }
  
  /* 数据样式 */
  .order-id {
    font-weight: 500;
    color: #409EFF;
    transition: color 0.3s;
  }
  
  .order-id:hover {
    color: #66b1ff;
    text-decoration: underline;
    cursor: pointer;
  }
  
  .user-info p {
    margin: 5px 0;
    line-height: 1.5;
  }
  
  .user-info .label {
    color: #909399;
    margin-right: 5px;
  }
  
  .apply-time, .handle-time {
    color: #606266;
  }
  
  .handle-man {
    color: #606266;
    display: inline-block;
    padding: 2px 0;
  }
  
  /* 分页样式 */
  .pagination-card {
    text-align: right;
    padding: 15px 20px;
    border-top: 1px solid #f0f2f5;
    background-color: #fafbfc;
  }
  
  /* 价格样式 */
  .refund-amount {
    color: #f56c6c;
    font-weight: bold;
    font-size: 14px;
  }
  
  /* 按钮样式 */
  .action-button {
    transition: all 0.3s;
  }
  
  .action-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .header-right {
    display: flex;
    align-items: center;
  }
  
  /* 适配性调整 */
  @media screen and (max-width: 1200px) {
    .el-form-item {
      margin-bottom: 18px;
    }
  }
</style>


