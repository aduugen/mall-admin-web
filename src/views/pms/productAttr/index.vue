<template> 
  <div class="app-container">
    <el-card class="header-card" shadow="hover">
      <div class="header-content">
        <div class="header-left">
          <i class="el-icon-collection-tag"></i>
          <span class="title">商品类型管理</span>
          <div class="subtitle">管理商品的属性与参数</div>
        </div>
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="addProductAttrCate()">
          添加类型
        </el-button>
      </div>
    </el-card>
    
    <el-card class="table-card" shadow="hover">
      <div slot="header" class="clearfix">
        <span class="card-title"><i class="el-icon-collection"></i> 类型列表</span>
        <div class="card-tools">
          <el-tooltip content="刷新数据" placement="top">
            <el-button type="text" icon="el-icon-refresh" @click="getList"></el-button>
          </el-tooltip>
        </div>
      </div>
      
      <el-table 
        ref="productAttrCateTable"
        style="width: 100%"
        :data="list"
        v-loading="listLoading"
        border
        stripe
        highlight-current-row
        :header-cell-style="{background:'#f8f9fa',color:'#606266'}"
        row-key="id">
        <el-table-column label="编号" prop="id" width="80" align="center"></el-table-column>
        
        <el-table-column label="类型名称" align="left" min-width="200">
          <template slot-scope="scope">
            <div class="type-name">
              <i class="el-icon-document-copy"></i>
              <span>{{scope.row.name}}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="相关统计" width="250" align="center">
          <template slot-scope="scope">
            <div class="attr-statistics">
              <div class="stat-item">
                <el-tag size="small" type="primary">属性数量</el-tag>
                <span class="stat-value">{{scope.row.attributeCount || 0}}</span>
              </div>
              <div class="stat-item">
                <el-tag size="small" type="success">参数数量</el-tag>
                <span class="stat-value">{{scope.row.paramCount || 0}}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="数据管理" width="240" align="center">
          <template slot-scope="scope">
            <div class="button-group">
              <el-button
                class="action-button same-width-btn"
                size="mini"
                type="info"
                icon="el-icon-tickets"
                @click="getAttrList(scope.$index, scope.row)">
                属性列表
              </el-button>
              <el-button
                class="action-button same-width-btn"
                size="mini"
                type="warning"
                icon="el-icon-set-up"
                @click="getParamList(scope.$index, scope.row)">
                参数列表
              </el-button>
            </div>
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
            <i class="el-icon-collection-tag"></i>
            <p>暂无商品类型数据</p>
          </div>
        </template>
      </el-table>
      
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
    
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :before-close="handleDialogClose"
      width="400px">
      <el-form ref="productAttrCatForm" :model="productAttrCate" :rules="rules" label-width="100px">
        <el-form-item label="类型名称" prop="name">
          <el-input 
            v-model="productAttrCate.name" 
            placeholder="请输入商品类型名称"
            prefix-icon="el-icon-collection-tag"
            clearable></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleConfirm('productAttrCatForm')" :loading="submitLoading">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {fetchList, createProductAttrCate, deleteProductAttrCate, updateProductAttrCate} from '@/api/productAttrCate'

  export default {
    name: 'productAttrCateList',
    data() {
      return {
        list: null,
        total: null,
        listLoading: true,
        submitLoading: false,
        listQuery: {
          pageNum: 1,
          pageSize: 10
        },
        dialogVisible: false,
        dialogTitle: '',
        productAttrCate: {
          name: '',
          id: null
        },
        rules: {
          name: [
            { required: true, message: '请输入类型名称', trigger: 'blur' },
            { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
          ]
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
      addProductAttrCate() {
        this.dialogVisible = true;
        this.dialogTitle = "添加商品类型";
        this.productAttrCate = {
          name: '',
          id: null
        };
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
      handleDelete(index, row) {
        this.$confirm('是否要删除该商品类型？删除后不可恢复！', '提示', {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消操作',
          type: 'warning',
          confirmButtonClass: 'el-button--danger'
        }).then(() => {
          deleteProductAttrCate(row.id).then(response => {
            this.$message({
              message: '删除成功',
              type: 'success',
              duration: 1000
            });
            this.getList();
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },
      handleUpdate(index, row) {
        this.dialogVisible = true;
        this.dialogTitle = "编辑商品类型";
        this.productAttrCate = {
          name: row.name,
          id: row.id
        };
      },
      getAttrList(index, row) {
        this.$router.push({path: '/pms/productAttrList', query: {cid: row.id, cname: row.name, type: 0}})
      },
      getParamList(index, row) {
        this.$router.push({path: '/pms/productAttrList', query: {cid: row.id, cname: row.name, type: 1}})
      },
      handleConfirm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.submitLoading = true;
            let data = new URLSearchParams();
            data.append("name", this.productAttrCate.name);
            if (this.dialogTitle === "添加商品类型") {
              createProductAttrCate(data).then(response => {
                this.submitLoading = false;
                this.$message({
                  message: '添加成功',
                  type: 'success',
                  duration: 1000
                });
                this.dialogVisible = false;
                this.getList();
              }).catch(() => {
                this.submitLoading = false;
              });
            } else {
              updateProductAttrCate(this.productAttrCate.id, data).then(response => {
                this.submitLoading = false;
                this.$message({
                  message: '修改成功',
                  type: 'success',
                  duration: 1000
                });
                this.dialogVisible = false;
                this.getList();
              }).catch(() => {
                this.submitLoading = false;
              });
            }
          } else {
            return false;
          }
        });
      },
      handleDialogClose(done) {
        this.$refs['productAttrCatForm'].clearValidate();
        done();
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
    margin-bottom: 5px;
  }
  
  .subtitle {
    color: #909399;
    font-size: 14px;
  }
  
  /* 表格卡片 */
  .table-card {
    border-radius: 8px;
    overflow: hidden;
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
  
  /* 类型名称样式 */
  .type-name {
    display: flex;
    align-items: center;
  }
  
  .type-name i {
    color: #409EFF;
    margin-right: 8px;
  }
  
  /* 属性统计样式 */
  .attr-statistics {
    display: flex;
    justify-content: space-around;
  }
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .stat-value {
    margin-top: 5px;
    font-weight: bold;
    font-size: 16px;
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
    min-width: 86px;
    height: 32px;
    padding: 0 10px;
    line-height: 30px;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  .same-width-btn {
    width: 86px;
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
  
  /* 表格样式 */
  .el-table {
    border-radius: 4px;
    overflow: hidden;
  }
  
  /* 响应式布局 */
  @media screen and (max-width: 1400px) {
    .button-group {
      flex-direction: column;
    }
    
    .button-group .el-button {
      margin: 3px 0;
      width: 90%;
    }
    
    .action-button, .same-width-btn {
      width: 100% !important;
      min-width: 100%;
    }
  }
  
  @media screen and (max-width: 768px) {
    .header-content {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .header-content .el-button {
      margin-top: 10px;
      align-self: flex-end;
    }
    
    .attr-statistics {
      flex-direction: column;
    }
    
    .stat-item {
      margin-bottom: 10px;
    }
  }
</style>


