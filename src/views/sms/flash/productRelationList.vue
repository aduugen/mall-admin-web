<template> 
  <div class="app-container">
    <!-- 顶部导航区域 -->
    <el-card class="header-card" shadow="hover">
      <div class="page-header">
        <div class="page-title">
          <i class="el-icon-shopping-bag-2"></i>
          <span>秒杀商品列表</span>
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
          <i class="el-icon-shopping-cart-2"></i>
          商品列表
        </span>
        <div class="card-tools">
          <el-button 
            size="small" 
            type="success" 
            @click="handleSelectProduct()" 
            icon="el-icon-plus">
            添加商品
          </el-button>
          <el-tooltip content="刷新数据" placement="top">
            <el-button type="text" icon="el-icon-refresh" @click="getList"></el-button>
          </el-tooltip>
        </div>
      </div>
      
      <el-table ref="productRelationTable"
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
        <el-table-column label="商品名称" min-width="180" align="center">
          <template slot-scope="scope">
            <div class="product-name">
              <i class="el-icon-goods name-icon"></i>
              <span class="name-text">{{scope.row.product.name}}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="货号" width="140" align="center">
          <template slot-scope="scope">
            <el-tag size="medium" effect="plain" type="info">NO.{{scope.row.product.productSn}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="商品价格" width="120" align="center">
          <template slot-scope="scope">
            <div class="price">
              <span class="price-symbol">￥</span>
              <span class="price-value">{{scope.row.product.price}}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="剩余数量" width="120" align="center">
          <template slot-scope="scope">
            <el-tag size="medium" type="info" effect="plain">
              <i class="el-icon-goods"></i> {{scope.row.product.stock}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="秒杀价格" width="120" align="center">
          <template slot-scope="scope">
            <div v-if="scope.row.flashPromotionPrice!==null" class="flash-price">
              <span class="price-symbol">￥</span>
              <span class="flash-price-value">{{scope.row.flashPromotionPrice}}</span>
            </div>
            <span v-else class="no-price">未设置</span>
          </template>
        </el-table-column>
        <el-table-column label="秒杀数量" width="120" align="center">
          <template slot-scope="scope">
            <el-tag size="medium" type="danger" effect="plain">
              <i class="el-icon-shopping-cart-full"></i> {{scope.row.flashPromotionCount || 0}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="限购数量" width="120" align="center">
          <template slot-scope="scope">
            <el-tag size="medium" type="warning" effect="plain">
              <i class="el-icon-user"></i> {{scope.row.flashPromotionLimit || '不限'}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="排序" width="100" align="center">
          <template slot-scope="scope">
            <span class="sort-number">{{scope.row.sort}}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
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
            <i class="el-icon-shopping-cart-2"></i>
            <p>暂无秒杀商品数据</p>
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
          :page-sizes="[5,10,15]"
          :total="total">
        </el-pagination>
      </div>
    </el-card>
    
    <!-- 选择商品对话框 -->
    <el-dialog 
      title="选择商品" 
      :visible.sync="selectDialogVisible" 
      width="55%"
      :close-on-click-modal="false">
      <div class="dialog-search-container">
        <el-input v-model="dialogData.listQuery.keyword"
                  size="small"
                  placeholder="请输入商品名称关键词搜索"
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
        <el-table-column label="商品名称" min-width="200" align="center">
          <template slot-scope="scope">
            <div class="product-name">
              <i class="el-icon-goods name-icon"></i>
              <span class="name-text">{{scope.row.name}}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="货号" width="160" align="center">
          <template slot-scope="scope">
            <el-tag size="medium" effect="plain" type="info">NO.{{scope.row.productSn}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="价格" width="120" align="center">
          <template slot-scope="scope">
            <div class="price">
              <span class="price-symbol">￥</span>
              <span class="price-value">{{scope.row.price}}</span>
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
        <el-button @click="selectDialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="handleSelectDialogConfirm()" size="small">确 定</el-button>
      </div>
    </el-dialog>
    
    <!-- 编辑秒杀商品信息对话框 -->
    <el-dialog 
      title="编辑秒杀商品信息"
      :visible.sync="editDialogVisible"
      width="50%"
      :close-on-click-modal="false"
      center
      class="edit-dialog">
      <div class="dialog-header">
        <div class="dialog-icon"><i class="el-icon-shopping-cart-full"></i></div>
        <div class="dialog-title">商品秒杀信息设置</div>
      </div>
      
      <el-card class="edit-card" shadow="hover">
        <div slot="header" class="edit-card-header">
          <i class="el-icon-info"></i>
          <span>商品基本信息</span>
        </div>
        <el-form :model="flashProductRelation"
                ref="flashProductRelationForm"
                label-width="120px" size="small">
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="商品名称：">
                <div class="info-text product-info">
                  <i class="el-icon-goods info-icon"></i>
                  {{flashProductRelation.product.name}}
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="货号：">
                <div class="info-text">
                  <el-tag size="medium" effect="plain" type="info" class="full-width-tag">
                    <span class="tag-label">NO.</span>{{flashProductRelation.product.productSn}}
                  </el-tag>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="商品价格：">
                <div class="info-text">
                  <el-tag size="medium" effect="plain" type="success" class="full-width-tag">
                    <span class="tag-label">￥</span>{{flashProductRelation.product.price}}
                  </el-tag>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="剩余数量：">
                <div class="info-text">
                  <el-tag size="medium" effect="plain" type="info" class="full-width-tag">
                    <i class="el-icon-goods"></i> {{flashProductRelation.product.stock}}
                  </el-tag>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
      
      <div class="divider">
        <span class="divider-text">秒杀信息</span>
      </div>
      
      <el-card class="edit-card" shadow="hover">
        <div slot="header" class="edit-card-header">
          <i class="el-icon-alarm-clock"></i>
          <span>秒杀活动设置</span>
          <el-tooltip 
            class="item" 
            effect="dark" 
            content="设置商品参与秒杀活动的价格、数量等信息" 
            placement="top-start">
            <i class="el-icon-question help-icon"></i>
          </el-tooltip>
        </div>
        <el-form :model="flashProductRelation"
                ref="flashProductRelationForm"
                label-width="120px" size="small">
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="秒杀价格：">
                <el-input 
                  v-model="flashProductRelation.flashPromotionPrice" 
                  class="input-width"
                  placeholder="请输入秒杀价格">
                  <template slot="prepend">￥</template>
                  <template slot="append">元</template>
                </el-input>
                <div class="form-tip">秒杀价格必须低于商品原价</div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="秒杀数量：">
                <el-input 
                  v-model="flashProductRelation.flashPromotionCount" 
                  class="input-width"
                  placeholder="请输入秒杀数量">
                  <template slot="prepend"><i class="el-icon-shopping-cart-2"></i></template>
                  <template slot="append">件</template>
                </el-input>
                <div class="form-tip">秒杀数量不能超过商品库存</div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="限购数量：">
                <el-input 
                  v-model="flashProductRelation.flashPromotionLimit" 
                  class="input-width"
                  placeholder="请输入限购数量">
                  <template slot="prepend"><i class="el-icon-user"></i></template>
                  <template slot="append">件/人</template>
                </el-input>
                <div class="form-tip">每人限购数量，0表示不限购</div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="排序：">
                <el-input 
                  v-model="flashProductRelation.sort" 
                  class="input-width"
                  placeholder="请输入排序值">
                  <template slot="prepend"><i class="el-icon-sort"></i></template>
                </el-input>
                <div class="form-tip">值越小越靠前，默认为0</div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false" size="small" icon="el-icon-close">取 消</el-button>
        <el-button type="primary" @click="handleEditDialogConfirm()" size="small" icon="el-icon-check">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  import {fetchList,createFlashProductRelation,deleteFlashProductRelation,updateFlashProductRelation} from '@/api/flashProductRelation';
  import {fetchList as fetchProductList} from '@/api/product';
  const defaultListQuery = {
    pageNum: 1,
    pageSize: 5,
    flashPromotionId: null,
    flashPromotionSessionId: null
  };
  export default {
    name:'flashPromotionProductRelationList',
    data() {
      return {
        listQuery: Object.assign({}, defaultListQuery),
        list: null,
        total: null,
        listLoading: false,
        dialogVisible: false,
        selectDialogVisible:false,
        dialogData:{
          list: null,
          total: null,
          multipleSelection:[],
          listQuery:{
            keyword: null,
            pageNum: 1,
            pageSize: 5
          }
        },
        editDialogVisible:false,
        flashProductRelation:{
          product:{}
        }
      }
    },
    created(){
      this.listQuery.flashPromotionId=this.$route.query.flashPromotionId;
      this.listQuery.flashPromotionSessionId=this.$route.query.flashPromotionSessionId;
      this.getList();
    },
    methods:{
      goBack() {
        this.$router.back();
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
      handleSelectProduct(){
        this.selectDialogVisible=true;
        this.getDialogList();
      },
      handleUpdate(index,row){
        this.editDialogVisible = true;
        this.flashProductRelation = Object.assign({},row);
      },
      handleDelete(index,row){
        this.$confirm('是否要删除该商品?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteFlashProductRelation(row.id).then(response => {
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.getList();
          });
        });
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
        let selectProducts = [];
        for (let i = 0; i < this.dialogData.multipleSelection.length; i++) {
          selectProducts.push({
            productId:this.dialogData.multipleSelection[i].id,
            flashPromotionId:this.listQuery.flashPromotionId,
            flashPromotionSessionId:this.listQuery.flashPromotionSessionId
          });
        }
        this.$confirm('是否要进行添加操作?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          createFlashProductRelation(selectProducts).then(response=>{
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
      handleEditDialogConfirm(){
        this.$confirm('是否要确认?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
            updateFlashProductRelation(this.flashProductRelation.id,this.flashProductRelation).then(response => {
              this.$message({
                message: '修改成功！',
                type: 'success'
              });
              this.editDialogVisible =false;
              this.getList();
            })
        })
      },
      getList() {
        this.listLoading = true;
        fetchList(this.listQuery).then(response => {
          this.listLoading = false;
          this.list = response.data.list;
          this.total = response.data.total;
        });
      },
      getDialogList(){
        fetchProductList(this.dialogData.listQuery).then(response=>{
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
  
  .card-tools .el-button {
    margin-left: 10px;
  }
  
  /* 表格样式 */
  .id-number {
    font-family: Consolas, Monaco, monospace;
    font-weight: bold;
    color: #606266;
  }
  
  .product-name {
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
  
  /* 价格样式 */
  .price {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .price-symbol {
    color: #909399;
    margin-right: 2px;
    font-size: 12px;
  }
  
  .price-value {
    color: #606266;
    font-weight: bold;
  }
  
  .flash-price {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .flash-price-value {
    color: #F56C6C;
    font-weight: bold;
  }
  
  .no-price {
    color: #909399;
    font-size: 13px;
  }
  
  /* 排序号样式 */
  .sort-number {
    background: #f4f4f5;
    color: #909399;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 12px;
  }
  
  /* 操作按钮区域 */
  .operation-container {
    display: flex;
    justify-content: center;
    gap: 5px;
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
  
  /* 对话框样式 */
  .dialog-search-container {
    width: 300px;
    margin-bottom: 20px;
  }
  
  .dialog-pagination {
    padding: 15px 0;
  }
  
  /* 编辑对话框样式 */
  .edit-dialog .dialog-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .edit-dialog .dialog-icon {
    font-size: 24px;
    color: #409EFF;
    margin-right: 10px;
  }
  
  .edit-dialog .dialog-title {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
  }
  
  .edit-dialog .divider {
    position: relative;
    margin: 20px 0;
    text-align: center;
    border-bottom: 1px solid #EBEEF5;
  }
  
  .edit-dialog .divider-text {
    position: relative;
    display: inline-block;
    top: 10px;
    background-color: #f8f9fa;
    padding: 0 10px;
    font-size: 14px;
    font-weight: 500;
    color: #606266;
  }
  
  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 8px;
    line-height: 1.4;
  }
  
  .dialog-footer {
    text-align: right;
  }
  
  .full-width-tag {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  
  .tag-label {
    margin-right: 3px;
  }
  
  .product-info {
    display: flex;
    align-items: center;
  }
  
  .info-icon {
    margin-right: 5px;
    color: #409EFF;
  }
  
  .help-icon {
    font-size: 14px;
    color: #909399;
    margin-left: 5px;
    cursor: pointer;
  }
  
  /* 编辑卡片样式 */
  .edit-card {
    margin-bottom: 25px;
    border: 1px solid #EBEEF5;
    border-radius: 6px;
  }
  
  .edit-card-header {
    padding: 15px 20px;
    background-color: #f8f9fa;
    border-bottom: 1px solid #EBEEF5;
  }
  
  .edit-card-header i {
    margin-right: 5px;
    color: #409EFF;
  }
  
  .info-text {
    color: #606266;
    line-height: 28px;
  }
  
  .input-width {
    width: 100%;
  }
  
  .el-input .el-input__inner {
    height: 38px;
    line-height: 38px;
    padding: 0 12px;
  }
  
  .el-input-group__prepend,
  .el-input-group__append {
    padding: 0 15px;
    background-color: #f5f7fa;
    color: #909399;
    border: 1px solid #DCDFE6;
    line-height: 36px;
  }
  
  .el-input-group__prepend {
    border-right: none;
  }
  
  .el-input-group__append {
    border-left: none;
  }
  
  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 6px;
    line-height: 1.5;
  }
  
  .el-dialog__body {
    padding: 15px 25px;
  }
  
  .el-dialog__footer {
    padding: 15px 25px 20px;
  }
  
  .divider {
    margin: 25px 0;
  }
</style>


