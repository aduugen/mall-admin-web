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
        <el-form :inline="true" :model="listQuery" size="small" label-width="140px">
          <el-form-item label="品牌名称：">
            <el-input v-model="listQuery.brandName" class="input-width" placeholder="品牌名称" clearable></el-input>
          </el-form-item>
          <el-form-item label="推荐状态：">
            <el-select v-model="listQuery.recommendStatus" placeholder="全部" clearable class="input-width">
              <el-option v-for="item in recommendOptions"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    
    <!-- 操作和数据列表区域 -->
    <el-card class="list-container" shadow="hover">
      <div slot="header" class="clearfix card-header">
        <span class="card-title">
          <i class="el-icon-collection-tag"></i>
          <span>品牌推荐列表</span>
        </span>
        <div class="card-tools">
           <!-- Refresh button first -->
          <el-tooltip content="刷新列表" placement="top">
            <el-button 
              size="small" 
              icon="el-icon-refresh" 
              type="text" 
              @click="getList()">
            </el-button>
          </el-tooltip>
          <!-- Select Brand button second -->
          <el-button 
            size="small" 
            type="primary" 
            icon="el-icon-plus" 
            @click="handleSelectBrand()">
            选择品牌
          </el-button>
        </div>
      </div>
      
      <el-table ref="homeBrandTable"
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
        <el-table-column label="品牌名称" min-width="180" align="center">
          <template slot-scope="scope">
            <span class="brand-name">{{scope.row.brandName}}</span>
          </template>
        </el-table-column>
        <el-table-column label="推荐状态" width="140" align="center">
          <template slot-scope="scope">
            <el-switch
              @change="handleRecommendStatusStatusChange(scope.$index, scope.row)"
              :active-value="1"
              :inactive-value="0"
              v-model="scope.row.recommendStatus"
              active-color="#13ce66"
              inactive-color="#ff4949">
            </el-switch>
            <span class="switch-status" :class="scope.row.recommendStatus === 1 ? 'active' : 'inactive'">
              {{ scope.row.recommendStatus === 1 ? '已推荐' : '未推荐' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="排序值" width="120" align="center">
          <template slot-scope="scope">
            <span class="sort-number">{{scope.row.sort}}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template slot-scope="scope">
            <div class="operation-container">
              <el-button size="mini"
                       type="primary"
                       plain
                       icon="el-icon-sort"
                       @click="handleEditSort(scope.$index, scope.row)">
                设置排序
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
            <i class="el-icon-collection-tag"></i>
            <p>暂无品牌推荐数据</p>
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
    
    <!-- 选择品牌对话框 -->
    <el-dialog 
      title="选择品牌" 
      :visible.sync="selectDialogVisible" 
      width="55%"
      :close-on-click-modal="false"
      class="select-dialog">
      <div class="dialog-search-container">
        <el-input v-model="dialogData.listQuery.keyword"
                  size="small"
                  placeholder="请输入品牌名称搜索"
                  clearable
                  prefix-icon="el-icon-search">
          <el-button slot="append" icon="el-icon-search" @click="handleSelectSearch()"></el-button>
        </el-input>
      </div>
      <el-table :data="dialogData.list"
                @selection-change="handleDialogSelectionChange" 
                border
                stripe
                :header-cell-style="{background:'#f8f9fa',color:'#606266'}">
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        <!-- Fix linter error by adding space before align -->
        <el-table-column label="品牌名称" min-width="180" align="center">
          <template slot-scope="scope">
            <span class="brand-name">{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column label="相关数据" width="220" align="center">
          <template slot-scope="scope">
            <div class="brand-stats">
              <span class="stats-item">
                <i class="el-icon-goods"></i> 商品：
                <span class="stats-value">{{scope.row.productCount}}</span>
              </span>
              <span class="stats-item">
                <i class="el-icon-chat-line-square"></i> 评价：
                <span class="stats-value">{{scope.row.productCommentCount}}</span>
              </span>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container dialog-pagination">
        <el-pagination
          background
          @size-change="handleDialogSizeChange"
          @current-change="handleDialogCurrentChange"
          layout="total, prev, pager, next"
          :current-page.sync="dialogData.listQuery.pageNum"
          :page-size="dialogData.listQuery.pageSize"
          :page-sizes="[5,10,15]"
          :total="dialogData.total">
        </el-pagination>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="selectDialogVisible = false" icon="el-icon-close">取 消</el-button>
        <el-button size="small" type="primary" @click="handleSelectDialogConfirm()" icon="el-icon-check">确 定</el-button>
      </div>
    </el-dialog>
    
    <!-- 设置排序对话框 -->
    <el-dialog title="设置排序"
               :visible.sync="sortDialogVisible"
               width="40%"
               :close-on-click-modal="false"
               center
               class="sort-dialog">
      <div class="sort-dialog-icon">
        <i class="el-icon-sort"></i>
      </div>
      <el-form :model="sortDialogData"
               label-width="120px">
        <el-form-item label="排序值：">
          <el-input-number 
            v-model="sortDialogData.sort" 
            :min="0" 
            :max="999" 
            controls-position="right"
            placeholder="请输入排序值"
            class="sort-input">
          </el-input-number>
          <div class="form-tip">数值越小排序越靠前，推荐使用10的倍数</div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="sortDialogVisible = false" size="small" icon="el-icon-close">取 消</el-button>
        <el-button type="primary" @click="handleUpdateSort" size="small" icon="el-icon-check">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  import {fetchList,updateRecommendStatus,deleteHomeBrand,createHomeBrand,updateHomeBrandSort} from '@/api/homeBrand';
  import {fetchList as fetchBrandList} from '@/api/brand';

  const defaultListQuery = {
    pageNum: 1,
    pageSize: 5,
    brandName: null,
    recommendStatus: null
  };
  const defaultRecommendOptions = [
    {
      label: '未推荐',
      value: 0
    },
    {
      label: '推荐中',
      value: 1
    }
  ];
  export default {
    name: 'homeBrandList',
    data() {
      return {
        listQuery: Object.assign({}, defaultListQuery),
        recommendOptions: Object.assign({}, defaultRecommendOptions),
        list: null,
        total: null,
        listLoading: false,
        multipleSelection: [],
        operates: [
          {
            label: "设为推荐",
            value: 0
          },
          {
            label: "取消推荐",
            value: 1
          },
          {
            label: "删除",
            value: 2
          }
        ],
        operateType: null,
        selectDialogVisible:false,
        dialogData:{
          list: null,
          total: null,
          multipleSelection:[],
          listQuery:{
            keyword: null,
            showStatus:1,
            pageNum: 1,
            pageSize: 5
          }
        },
        sortDialogVisible:false,
        sortDialogData:{sort:0,id:null}
      }
    },
    created() {
      this.getList();
    },
    filters:{
      formatRecommendStatus(status){
        if(status===1){
          return '推荐中';
        }else{
          return '未推荐';
        }
      }
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
      handleRecommendStatusStatusChange(index,row){
        this.updateRecommendStatusStatus(row.id,row.recommendStatus);
      },
      handleDelete(index,row){
        this.deleteBrand(row.id);
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
        if (this.operateType === 0) {
          //设为推荐
          this.updateRecommendStatusStatus(ids,1);
        } else if (this.operateType === 1) {
          //取消推荐
          this.updateRecommendStatusStatus(ids,0);
        } else if(this.operateType===2){
          //删除
          this.deleteBrand(ids);
        }else {
          this.$message({
            message: '请选择批量操作类型',
            type: 'warning',
            duration: 1000
          });
          return;
        }
      },
      handleSelectBrand(){
        this.selectDialogVisible=true;
        this.getDialogList();
      },
      handleSelectSearch(){
        this.getDialogList();
      },
      handleDialogSizeChange(val) {
        this.dialogData.listQuery.pageNum = 1;
        this.dialogData.listQuery.pageSize = val;
        this.getDialogList();
      },
      handleDialogCurrentChange(val) {
        this.dialogData.listQuery.pageNum = val;
        this.getDialogList();
      },
      handleDialogSelectionChange(val){
        this.dialogData.multipleSelection = val;
      },
      handleSelectDialogConfirm(){
        if (this.dialogData.multipleSelection < 1) {
          this.$message({
            message: '请选择一条记录',
            type: 'warning',
            duration: 1000
          });
          return;
        }
        let selectBrands = [];
        for (let i = 0; i < this.dialogData.multipleSelection.length; i++) {
          selectBrands.push({
            brandId:this.dialogData.multipleSelection[i].id,
            brandName:this.dialogData.multipleSelection[i].name
          });
        }
        this.$confirm('使用要进行添加操作?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          createHomeBrand(selectBrands).then(response=>{
            this.selectDialogVisible=false;
            this.dialogData.multipleSelection=[];
            this.getList();
            this.$message({
              type: 'success',
              message: '添加成功!'
            });
          });
        });
      },
      handleEditSort(index,row){
        this.sortDialogVisible=true;
        this.sortDialogData.sort=row.sort;
        this.sortDialogData.id=row.id;
      },
      handleUpdateSort(){
        this.$confirm('是否要修改排序?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          updateHomeBrandSort(this.sortDialogData).then(response=>{
            this.sortDialogVisible=false;
            this.getList();
            this.$message({
              type: 'success',
              message: '修改成功!'
            });
          });
        })
      },
      getList() {
        this.listLoading = true;
        fetchList(this.listQuery).then(response => {
          this.listLoading = false;
          this.list = response.data.list;
          this.total = response.data.total;
        })
      },
      updateRecommendStatusStatus(ids,status){
        this.$confirm('是否要修改推荐状态?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let params=new URLSearchParams();
          params.append("ids",ids);
          params.append("recommendStatus",status);
          updateRecommendStatus(params).then(response=>{
            this.getList();
            this.$message({
              type: 'success',
              message: '修改成功!'
            });
          });
        }).catch(() => {
          this.$message({
            type: 'success',
            message: '已取消操作!'
          });
          this.getList();
        });
      },
      deleteBrand(ids){
        this.$confirm('是否要删除该推荐?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let params=new URLSearchParams();
          params.append("ids",ids);
          deleteHomeBrand(params).then(response=>{
            this.getList();
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
          });
        })
      },
      getDialogList(){
        fetchBrandList(this.dialogData.listQuery).then(response=>{
          this.dialogData.list=response.data.list;
          this.dialogData.total=response.data.total;
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
    color: #409EFF;
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
  
  .brand-name {
    font-weight: 500;
    color: #303133;
  }
  
  .sort-number {
    background: #f4f4f5;
    color: #909399;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 12px;
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
    justify-content: center; /* 水平居中对齐 */
    align-items: center; /* 垂直居中对齐 */
    gap: 10px; /* 按钮之间的间距 */
  }
  
  .operation-container .el-button {
    margin: 0; /* 移除默认外边距 */
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
    margin-top: 20px; /* 增加与表格的间距 */
    padding-top: 15px; /* 增加顶部内边距 */
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
    margin-top: 20px; /* 增加与批量操作区域的间距 */
    padding-bottom: 10px; /* 增加底部内边距 */
    text-align: right;
  }
  
  /* 选择品牌对话框 */
  .dialog-search-container {
    margin-bottom: 20px;
    width: 300px;
  }
  
  .dialog-pagination {
    margin-top: 15px;
  }
  
  .brand-stats {
    display: flex;
    justify-content: center;
    gap: 15px;
  }
  
  .stats-item {
    font-size: 13px;
    color: #606266;
  }
  
  .stats-value {
    color: #409EFF;
    font-weight: bold;
  }
  
  /* 排序对话框 */
  .sort-dialog .el-dialog__body {
    padding-top: 10px;
  }
  
  .sort-dialog-icon {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .sort-dialog-icon i {
    font-size: 36px;
    color: #409EFF;
    background-color: #ecf5ff;
    padding: 15px;
    border-radius: 50%;
  }
  
  .sort-input {
    width: 180px;
  }
  
  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
  }
  
  .dialog-footer {
    text-align: right;
  }
</style>


