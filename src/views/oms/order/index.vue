<template> 
  <div class="app-container">
    <!-- 筛选搜索区域 -->
    <el-card class="search-container" shadow="hover">
      <div class="search-header">
        <i class="el-icon-search"></i>
        <span>筛选搜索</span>
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
      <div class="search-form">
        <el-form :inline="true" :model="listQuery" size="small" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="订单编号：">
                <el-input v-model="listQuery.orderSn" placeholder="请输入订单编号" clearable></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="收货人：">
                <el-input v-model="listQuery.receiverKeyword" placeholder="收货人姓名/手机号码" clearable></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="提交时间：">
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
              <el-form-item label="订单状态：">
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
              <el-form-item label="订单分类：">
                <el-select v-model="listQuery.orderType" placeholder="全部" clearable>
                  <el-option v-for="item in orderTypeOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="订单来源：">
                <el-select v-model="listQuery.sourceType" placeholder="全部" clearable>
                  <el-option v-for="item in sourceTypeOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </el-card>
    
    <!-- 数据列表区域 -->
    <el-card class="list-container" shadow="hover">
      <div class="list-header">
        <i class="el-icon-tickets"></i>
        <span>数据列表</span>
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
      <div class="table-container">
        <el-table 
          ref="orderTable"
          :data="list"
          style="width: 100%;"
          @selection-change="handleSelectionChange"
          v-loading="listLoading" 
          border
          stripe
          highlight-current-row>
          <el-table-column type="selection" width="60" align="center"></el-table-column>
          <el-table-column label="编号" width="80" align="center">
            <template slot-scope="scope">
              <span class="order-id">{{scope.row.id}}</span>
            </template>
          </el-table-column>
          <el-table-column label="订单编号" min-width="160" align="center">
            <template slot-scope="scope">
              <span class="order-sn">{{scope.row.orderSn}}</span>
            </template>
          </el-table-column>
          <el-table-column label="提交时间" min-width="160" align="center">
            <template slot-scope="scope">
              <span class="create-time">{{scope.row.createTime | formatCreateTime}}</span>
            </template>
          </el-table-column>
          <el-table-column label="用户账号" min-width="120" align="center">
            <template slot-scope="scope">
              <span class="username">{{scope.row.memberUsername}}</span>
            </template>
          </el-table-column>
          <el-table-column label="订单金额" min-width="120" align="center">
            <template slot-scope="scope">
              <span class="amount">￥{{scope.row.totalAmount}}</span>
            </template>
          </el-table-column>
          <el-table-column label="支付方式" min-width="120" align="center">
            <template slot-scope="scope">
              <el-tag size="mini" :type="scope.row.payType === 1 ? 'success' : scope.row.payType === 2 ? 'primary' : 'info'">
                {{scope.row.payType | formatPayType}}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="订单来源" min-width="120" align="center">
            <template slot-scope="scope">
              <el-tag size="mini" :type="scope.row.sourceType === 1 ? 'warning' : 'info'">
                {{scope.row.sourceType | formatSourceType}}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="订单状态" min-width="120" align="center">
            <template slot-scope="scope">
              <el-tag size="mini" :type="getStatusTagType(scope.row.status)">
                {{scope.row.status | formatStatus}}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="220" align="center" fixed="right">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-view"
                @click="handleViewOrder(scope.$index, scope.row)">
                查看
              </el-button>
              <el-button
                size="mini"
                type="warning"
                icon="el-icon-close"
                @click="handleCloseOrder(scope.$index, scope.row)"
                v-show="scope.row.status===0">
                关闭
              </el-button>
              <el-button
                size="mini"
                type="success"
                icon="el-icon-sell"
                @click="handleDeliveryOrder(scope.$index, scope.row)"
                v-show="scope.row.status===1">
                发货
              </el-button>
              <el-button
                size="mini"
                type="info"
                icon="el-icon-truck"
                @click="handleViewLogistics(scope.$index, scope.row)"
                v-show="scope.row.status===2||scope.row.status===3">
                跟踪
              </el-button>
              <el-button
                size="mini"
                type="danger"
                icon="el-icon-delete"
                @click="handleDeleteOrder(scope.$index, scope.row)"
                v-show="scope.row.status===4">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 分页 -->
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
    
    <!-- 关闭订单对话框 -->
    <el-dialog
      title="关闭订单"
      :visible.sync="closeOrder.dialogVisible" 
      width="30%"
      center>
      <div class="dialog-body">
        <span class="dialog-label">操作备注：</span>
        <el-input
          class="dialog-input"
          type="textarea"
          :rows="5"
          placeholder="请输入内容"
          v-model="closeOrder.content">
        </el-input>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeOrder.dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleCloseOrderConfirm">确 定</el-button>
      </span>
    </el-dialog>
    
    <logistics-dialog v-model="logisticsDialogVisible"></logistics-dialog>
  </div>
</template>
<script>
  import {fetchList,closeOrder,deleteOrder} from '@/api/order'
  import {formatDate} from '@/utils/date';
  import LogisticsDialog from '@/views/oms/order/components/logisticsDialog';
  const defaultListQuery = {
    pageNum: 1,
    pageSize: 10,
    orderSn: null,
    receiverKeyword: null,
    status: null,
    orderType: null,
    sourceType: null,
    createTime: null,
  };
  export default {
    name: "orderList",
    components:{LogisticsDialog},
    data() {
      return {
        listQuery: Object.assign({}, defaultListQuery),
        listLoading: true,
        list: null,
        total: null,
        operateType: null,
        multipleSelection: [],
        closeOrder:{
          dialogVisible:false,
          content:null,
          orderIds:[]
        },
        statusOptions: [
          {
            label: '待付款',
            value: 0
          },
          {
            label: '待发货',
            value: 1
          },
          {
            label: '已发货',
            value: 2
          },
          {
            label: '已完成',
            value: 3
          },
          {
            label: '已关闭',
            value: 4
          }
        ],
        orderTypeOptions: [
          {
            label: '正常订单',
            value: 0
          },
          {
            label: '秒杀订单',
            value: 1
          }
        ],
        sourceTypeOptions: [
          {
            label: 'PC订单',
            value: 0
          },
          {
            label: 'APP订单',
            value: 1
          }
        ],
        operateOptions: [
          {
            label: "批量发货",
            value: 1
          },
          {
            label: "关闭订单",
            value: 2
          },
          {
            label: "删除订单",
            value: 3
          }
        ],
        logisticsDialogVisible:false
      }
    },
    created() {
      this.getList();
    },
    filters: {
      formatCreateTime(time) {
        let date = new Date(time);
        return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
      },
      formatPayType(value) {
        if (value === 1) {
          return '支付宝';
        } else if (value === 2) {
          return '微信';
        } else {
          return '未支付';
        }
      },
      formatSourceType(value) {
        if (value === 1) {
          return 'APP订单';
        } else {
          return 'PC订单';
        }
      },
      formatStatus(value) {
        if (value === 1) {
          return '待发货';
        } else if (value === 2) {
          return '已发货';
        } else if (value === 3) {
          return '已完成';
        } else if (value === 4) {
          return '已关闭';
        } else if (value === 5) {
          return '无效订单';
        } else {
          return '待付款';
        }
      },
    },
    methods: {
      getStatusTagType(status) {
        switch(status) {
          case 0: return 'info';     // 待付款
          case 1: return 'warning';  // 待发货
          case 2: return 'primary';  // 已发货
          case 3: return 'success';  // 已完成
          case 4: return 'danger';   // 已关闭
          case 5: return 'info';     // 无效订单
          default: return 'info';
        }
      },
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
      handleViewOrder(index, row){
        this.$router.push({path:'/oms/orderDetail',query:{id:row.id}})
      },
      handleCloseOrder(index, row){
        this.closeOrder.dialogVisible=true;
        this.closeOrder.orderIds=[row.id];
      },
      handleDeliveryOrder(index, row){
        let listItem = this.covertOrder(row);
        this.$router.push({path:'/oms/deliverOrderList',query:{list:[listItem]}})
      },
      handleViewLogistics(index, row){
        this.logisticsDialogVisible=true;
      },
      handleDeleteOrder(index, row){
        let ids=[];
        ids.push(row.id);
        this.deleteOrder(ids);
      },
      handleBatchOperate(){
        if(this.multipleSelection==null||this.multipleSelection.length<1){
          this.$message({
            message: '请选择要操作的订单',
            type: 'warning',
            duration: 1000
          });
          return;
        }
        if(this.operateType===1){
          //批量发货
          let list=[];
          for(let i=0;i<this.multipleSelection.length;i++){
            if(this.multipleSelection[i].status===1){
              list.push(this.covertOrder(this.multipleSelection[i]));
            }
          }
          if(list.length===0){
            this.$message({
              message: '选中订单中没有可以发货的订单',
              type: 'warning',
              duration: 1000
            });
            return;
          }
          this.$router.push({path:'/oms/deliverOrderList',query:{list:list}})
        }else if(this.operateType===2){
          //关闭订单
          this.closeOrder.orderIds=[];
          for(let i=0;i<this.multipleSelection.length;i++){
            this.closeOrder.orderIds.push(this.multipleSelection[i].id);
          }
          this.closeOrder.dialogVisible=true;
        }else if(this.operateType===3){
          //删除订单
          let ids=[];
          for(let i=0;i<this.multipleSelection.length;i++){
            ids.push(this.multipleSelection[i].id);
          }
          this.deleteOrder(ids);
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
      handleCloseOrderConfirm() {
        if (this.closeOrder.content == null || this.closeOrder.content === '') {
          this.$message({
            message: '操作备注不能为空',
            type: 'warning',
            duration: 1000
          });
          return;
        }
        let params = new URLSearchParams();
        params.append('ids', this.closeOrder.orderIds);
        params.append('note', this.closeOrder.content);
        closeOrder(params).then(response=>{
          this.closeOrder.orderIds=[];
          this.closeOrder.dialogVisible=false;
          this.getList();
          this.$message({
            message: '修改成功',
            type: 'success',
            duration: 1000
          });
        });
      },
      getList() {
        this.listLoading = true;
        fetchList(this.listQuery).then(response => {
          this.listLoading = false;
          this.list = response.data.list;
          this.total = response.data.total;
        });
      },
      deleteOrder(ids){
        this.$confirm('是否要进行该删除操作?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let params = new URLSearchParams();
          params.append("ids",ids);
          deleteOrder(params).then(response=>{
            this.$message({
              message: '删除成功！',
              type: 'success',
              duration: 1000
            });
            this.getList();
          });
        })
      },
      covertOrder(order){
        let address=order.receiverProvince+order.receiverCity+order.receiverRegion+order.receiverDetailAddress;
        let listItem={
          orderId:order.id,
          orderSn:order.orderSn,
          receiverName:order.receiverName,
          receiverPhone:order.receiverPhone,
          receiverPostCode:order.receiverPostCode,
          address:address,
          deliveryCompany:null,
          deliverySn:null
        };
        return listItem;
      }
    }
  }
</script>
<style scoped>
  /* 整体容器样式 */
  .app-container {
    padding: 20px;
  }
  
  /* 搜索区域样式 */
  .search-container {
    margin-bottom: 20px;
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s;
  }
  
  .search-container:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .search-header {
    display: flex;
    align-items: center;
    padding-bottom: 15px;
    border-bottom: 1px solid #ebeef5;
  }
  
  .search-header i {
    color: #409EFF;
    font-size: 18px;
    margin-right: 8px;
  }
  
  .search-header span {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
  }
  
  .search-buttons {
    margin-left: auto;
  }
  
  .search-form {
    padding-top: 15px;
  }
  
  /* 列表区域样式 */
  .list-container {
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s;
  }
  
  .list-container:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .list-header {
    display: flex;
    align-items: center;
    padding-bottom: 15px;
    border-bottom: 1px solid #ebeef5;
    margin-bottom: 15px;
  }
  
  .list-header i {
    color: #409EFF;
    font-size: 18px;
    margin-right: 8px;
  }
  
  .list-header span {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
  }
  
  .header-right {
    margin-left: auto;
    display: flex;
    align-items: center;
  }
  
  /* 表格数据样式 */
  .table-container {
    margin-bottom: 20px;
  }
  
  .order-id {
    font-weight: 500;
    color: #303133;
  }
  
  .order-sn {
    font-weight: 500;
    color: #409EFF;
  }
  
  .create-time {
    color: #606266;
  }
  
  .username {
    color: #606266;
  }
  
  .amount {
    color: #f56c6c;
    font-weight: bold;
  }
  
  /* 分页器样式 */
  .pagination-container {
    padding: 15px 0;
    text-align: right;
  }
  
  /* 对话框样式 */
  .dialog-body {
    display: flex;
    align-items: flex-start;
    padding: 10px 0;
  }
  
  .dialog-label {
    white-space: nowrap;
    margin-right: 10px;
    margin-top: 10px;
  }
  
  .dialog-input {
    width: 100%;
  }
</style>


