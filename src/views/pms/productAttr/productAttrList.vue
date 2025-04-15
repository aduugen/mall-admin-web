<template> 
  <div class="app-container">
    <el-card class="header-card" shadow="hover">
      <div class="header-content">
        <div class="header-left">
          <i class="el-icon-tickets"></i>
          <span class="title">{{$route.query.type==='0'?'属性列表':'参数列表'}}</span>
          <div class="subtitle">
            <span>商品类型：</span>
            <el-tag size="medium">{{$route.query.cname}}</el-tag>
          </div>
        </div>
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="addProductAttr()">
          添加{{$route.query.type==='0'?'属性':'参数'}}
        </el-button>
      </div>
    </el-card>
    
    <el-card class="table-card" shadow="hover">
      <div slot="header" class="clearfix">
        <span class="card-title">
          <i :class="$route.query.type==='0'?'el-icon-tickets':'el-icon-set-up'"></i> 
          数据列表
        </span>
        <div class="card-tools">
          <el-tooltip content="刷新数据" placement="top">
            <el-button type="text" icon="el-icon-refresh" @click="getList"></el-button>
          </el-tooltip>
          <el-button 
            type="text" 
            icon="el-icon-back" 
            @click="$router.push('/pms/productAttr')">
            返回
          </el-button>
        </div>
      </div>
      
      <el-table 
        ref="productAttrTable"
        :data="list"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        v-loading="listLoading"
        border
        stripe
        highlight-current-row
        :header-cell-style="{background:'#f8f9fa',color:'#606266'}"
        row-key="id">
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        
        <el-table-column label="编号" prop="id" width="80" align="center"></el-table-column>
        
        <el-table-column label="属性名称" width="140" align="center">
          <template slot-scope="scope">
            <div class="attr-name">
              <i :class="$route.query.type==='0'?'el-icon-tickets':'el-icon-set-up'" class="attr-icon"></i>
              <span>{{scope.row.name}}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="商品类型" width="140" align="center">
          <template slot-scope="scope">
            <el-tag size="small" type="info">{{$route.query.cname}}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="属性是否可选" width="120" align="center">
          <template slot-scope="scope">
            <el-tag 
              size="small"
              :type="scope.row.selectType === 0 ? 'info' : (scope.row.selectType === 1 ? 'success' : 'warning')">
              {{scope.row.selectType|selectTypeFilter}}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="属性录入方式" width="120" align="center">
          <template slot-scope="scope">
            <el-tag 
              size="small"
              :type="scope.row.inputType === 0 ? 'primary' : 'success'">
              {{scope.row.inputType|inputTypeFilter}}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="可选值列表" align="center">
          <template slot-scope="scope">
            <div class="input-list">
              <template v-if="scope.row.inputList">
                <el-tag
                  size="small"
                  type="info"
                  v-for="(item, index) in scope.row.inputList.split(',')"
                  :key="index"
                  class="input-item">
                  {{item}}
                </el-tag>
              </template>
              <template v-else>
                <span class="empty-values">暂无可选值</span>
              </template>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="排序" width="80" align="center">
          <template slot-scope="scope">
            <span class="sort-value">{{scope.row.sort}}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="180" align="center">
          <template slot-scope="scope">
            <div class="button-group">
              <el-button
                class="action-button"
                size="mini"
                type="primary"
                icon="el-icon-edit"
                @click="handleUpdate(scope.$index, scope.row)">
                编辑
              </el-button>
              <el-button
                class="action-button"
                size="mini"
                type="danger"
                icon="el-icon-delete"
                @click="handleDelete(scope.$index, scope.row)">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
        
        <template slot="empty">
          <div class="empty-data">
            <i :class="$route.query.type==='0'?'el-icon-tickets':'el-icon-set-up'"></i>
            <p>暂无{{$route.query.type==='0'?'属性':'参数'}}数据</p>
          </div>
        </template>
      </el-table>
      
      <div class="batch-operate-container">
        <div class="batch-operate-content">
          <el-select
            size="small"
            v-model="operateType" 
            placeholder="批量操作">
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
            type="danger"
            :disabled="multipleSelection.length === 0"
            size="small">
            <i class="el-icon-delete"></i>
            批量操作
          </el-button>
          <div class="selection-info" v-if="multipleSelection.length > 0">
            <span>已选择 <span class="selected-count">{{multipleSelection.length}}</span> 项</span>
            <el-button type="text" size="mini" @click="$refs.productAttrTable.clearSelection()">清空选择</el-button>
          </div>
        </div>
      </div>
      
      <div class="pagination-container">
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          layout="total, sizes, prev, pager, next, jumper"
          :page-size="listQuery.pageSize"
          :page-sizes="[5, 10, 15, 20]"
          :current-page.sync="listQuery.pageNum"
          :total="total">
        </el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
  import {fetchList, deleteProductAttr} from '@/api/productAttr'

  export default {
    name: 'productAttrList',
    data() {
      return {
        list: null,
        total: null,
        listLoading: true,
        listQuery: {
          pageNum: 1,
          pageSize: 10,
          type: this.$route.query.type
        },
        operateType: null,
        multipleSelection: [],
        operates: [
          {
            label: "批量删除",
            value: "deleteProductAttr"
          }
        ]
      }
    },
    created() {
      this.getList();
    },
    methods: {
      getList() {
        this.listLoading = true;
        fetchList(this.$route.query.cid, this.listQuery).then(response => {
          this.listLoading = false;
          this.list = response.data.list;
          this.total = response.data.total;
        });
      },
      addProductAttr() {
        this.$router.push({path: '/pms/addProductAttr', query: {cid: this.$route.query.cid, type: this.$route.query.type}});
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      handleBatchOperate() {
        if (this.multipleSelection.length < 1) {
          this.$message({
            message: '请选择至少一条记录',
            type: 'warning',
            duration: 1000
          });
          return;
        }
        if (this.operateType !== 'deleteProductAttr') {
          this.$message({
            message: '请选择批量操作类型',
            type: 'warning',
            duration: 1000
          });
          return;
        }
        let ids = [];
        for (let i = 0; i < this.multipleSelection.length; i++) {
          ids.push(this.multipleSelection[i].id);
        }
        this.handleDeleteProductAttr(ids);
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
      handleUpdate(index, row) {
        this.$router.push({path: '/pms/updateProductAttr', query: {id: row.id}});
      },
      handleDeleteProductAttr(ids) {
        this.$confirm(`是否要删除选中的${this.$route.query.type==='0'?'属性':'参数'}？删除后不可恢复！`, '提示', {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消操作',
          type: 'warning',
          confirmButtonClass: 'el-button--danger'
        }).then(() => {
          let data = new URLSearchParams();
          data.append("ids", ids);
          deleteProductAttr(data).then(response => {
            this.$message({
              message: '删除成功',
              type: 'success',
              duration: 1000
            });
            this.getList();
            this.$refs.productAttrTable.clearSelection();
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },
      handleDelete(index, row) {
        let ids = [];
        ids.push(row.id);
        this.handleDeleteProductAttr(ids);
      },
    },
    filters: {
      inputTypeFilter(value) {
        if (value === 1) {
          return '从列表选取';
        } else {
          return '手工录入'
        }
      },
      selectTypeFilter(value) {
        if (value === 1) {
          return '单选';
        } else if (value === 2) {
          return '多选';
        } else {
          return '唯一'
        }
      },
    }
  }
</script>

<style scoped>
  .app-container {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 84px);
  }
  
  /* 头部卡片 */
  .header-card {
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  }
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .header-left {
    display: flex;
    flex-direction: column;
  }
  
  .header-left i {
    font-size: 24px;
    color: #409EFF;
    margin-bottom: 10px;
  }
  
  .title {
    font-size: 18px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 10px;
  }
  
  .subtitle {
    color: #606266;
    font-size: 14px;
    display: flex;
    align-items: center;
  }
  
  .subtitle span {
    margin-right: 5px;
  }
  
  /* 表格卡片 */
  .table-card {
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
  
  .card-tools .el-button {
    margin-left: 10px;
  }
  
  /* 属性名称样式 */
  .attr-name {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .attr-icon {
    color: #409EFF;
    margin-right: 5px;
  }
  
  /* 可选值列表样式 */
  .input-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    max-height: 60px;
    overflow-y: auto;
    padding: 0 10px;
  }
  
  .input-item {
    margin: 2px 4px;
    white-space: nowrap;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .empty-values {
    color: #909399;
    font-size: 13px;
  }
  
  /* 排序值样式 */
  .sort-value {
    font-weight: bold;
    color: #606266;
  }
  
  /* 按钮组样式 */
  .button-group {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: nowrap;
  }
  
  .button-group .el-button {
    margin: 0 4px;
  }
  
  /* 操作按钮样式 */
  .action-button {
    min-width: 70px;
    height: 28px;
    padding: 0 10px;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  /* 批量操作 */
  .batch-operate-container {
    padding: 10px 0;
    margin-top: 15px;
    border-top: 1px solid #ebeef5;
  }
  
  .batch-operate-content {
    display: flex;
    align-items: center;
  }
  
  .batch-button {
    margin-left: 10px;
  }
  
  .selection-info {
    margin-left: 15px;
    color: #606266;
    font-size: 14px;
  }
  
  .selected-count {
    color: #409EFF;
    font-weight: bold;
    margin: 0 3px;
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
      width: 90%;
    }
    
    .batch-operate-content {
      flex-wrap: wrap;
    }
    
    .selection-info {
      margin-top: 10px;
      margin-left: 0;
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
  }
</style>


