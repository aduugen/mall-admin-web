<template>
  <div class="app-container">
    <el-card class="alarm-header-card" shadow="hover">
      <div class="alarm-header">
        <div class="alarm-icon">
          <i class="el-icon-warning"></i>
        </div>
        <div class="alarm-info">
          <h2 class="alarm-title">库存告警</h2>
          <p class="alarm-desc">当前有 <span class="alarm-count">{{total}}</span> 个商品库存低于预警值，请及时处理！</p>
        </div>
        <div class="alarm-action">
          <el-button type="primary" icon="el-icon-refresh" @click="getList">刷新数据</el-button>
        </div>
      </div>
    </el-card>
    
    <el-card class="data-card" shadow="hover">
      <div slot="header" class="clearfix">
        <span class="card-title"><i class="el-icon-goods"></i> 告警商品列表</span>
        <el-select v-model="listQuery.pageSize" size="small" placeholder="每页显示" style="width: 120px; float: right; margin-right: 10px;">
          <el-option v-for="item in [5, 10, 15, 20]" :key="item" :label="`${item}条/页`" :value="item">
          </el-option>
        </el-select>
      </div>
      
      <el-table
        ref="stockAlarmTable"
        :data="list"
        style="width: 100%"
        v-loading="listLoading"
        border
        stripe
        :header-cell-style="{background:'#f8f9fa',color:'#606266'}"
        highlight-current-row>
        <el-table-column label="商品图片" width="120" align="center">
          <template slot-scope="scope">
            <div class="product-img-container">
              <img v-if="scope.row.pic" class="product-img" :src="handleImageUrl(scope.row.pic)" alt="" @error="handleImageError">
              <div v-else class="no-img-placeholder">
                <i class="el-icon-picture"></i>
                <p>暂无图片</p>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="商品名称" align="left" min-width="200">
          <template slot-scope="scope">
            <div class="product-name">{{scope.row.productName}}</div>
          </template>
        </el-table-column>
        
        <el-table-column label="SKU编码" width="160" align="center">
          <template slot-scope="scope">
            <div class="sku-code">{{scope.row.skuCode || '暂无编码'}}</div>
          </template>
        </el-table-column>
        
        <el-table-column label="商品规格" width="160" align="center">
          <template slot-scope="scope">
            <el-tag size="small" type="info">{{getSpecText(scope.row.spData)}}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="库存状况" width="220" align="center">
          <template slot-scope="scope">
            <div class="stock-info">
              <div class="stock-item">
                <span class="stock-label">当前库存</span>
                <span class="stock-value danger">{{scope.row.stock}}</span>
              </div>
              <div class="stock-item">
                <span class="stock-label">预警库存</span>
                <span class="stock-value warning">{{scope.row.lowStock}}</span>
              </div>
              <div class="stock-status">
                <el-tag size="small" type="danger" v-if="scope.row.stock === 0">无库存</el-tag>
                <el-tag size="small" type="warning" v-else>库存紧张</el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="120" align="center">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-plus"
              @click="handleUpdate(scope.$index, scope.row)">
              补充库存
            </el-button>
          </template>
        </el-table-column>
        
        <template slot="empty">
          <div class="empty-data">
            <i class="el-icon-goods"></i>
            <p>暂无告警商品</p>
          </div>
        </template>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[5, 10, 15, 20]"
          :page-size="listQuery.pageSize"
          :current-page.sync="listQuery.pageNum"
          :total="total">
        </el-pagination>
      </div>
    </el-card>
    
    <el-dialog
      title="补充库存"
      :visible.sync="dialogVisible"
      width="500px"
      :close-on-click-modal="false"
      center>
      <el-card class="stock-dialog-card" shadow="never" v-if="currentProduct.productName">
        <div class="product-dialog-header">
          <div class="product-dialog-img">
            <img v-if="currentProduct.pic" :src="handleImageUrl(currentProduct.pic)" @error="handleImageError">
            <div v-else class="no-img-small">
              <i class="el-icon-picture"></i>
            </div>
          </div>
          <div class="product-dialog-info">
            <h3>{{currentProduct.productName}}</h3>
            <p>SKU编码：{{currentProduct.skuCode || '暂无编码'}}</p>
            <p>规格：{{getSpecText(currentProduct.spData)}}</p>
          </div>
        </div>
        
        <el-divider content-position="center">库存信息</el-divider>
        
        <div class="stock-dialog-info">
          <div class="stock-dialog-item">
            <span class="stock-dialog-label">当前库存</span>
            <span class="stock-dialog-value danger">{{currentProduct.stock}}</span>
          </div>
          <div class="stock-dialog-item">
            <span class="stock-dialog-label">预警库存</span>
            <span class="stock-dialog-value warning">{{currentProduct.lowStock}}</span>
          </div>
        </div>
        
        <el-divider content-position="center">补充库存</el-divider>
        
        <el-form :model="stockForm" label-width="100px" ref="stockForm">
          <el-form-item label="补充数量" prop="addStock">
            <el-input-number v-model="stockForm.addStock" :min="1" :max="999" :step="10" step-strictly></el-input-number>
            <span class="form-help-text">补充后总库存将为 {{currentProduct.stock + stockForm.addStock}} 件</span>
          </el-form-item>
        </el-form>
      </el-card>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleConfirmUpdate" :loading="updateLoading">确认补充</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {fetchList, fetchPageList} from '@/api/stockAlarm'
  import {update} from '@/api/skuStock'

  export default {
    name: "stockAlarm",
    data() {
      return {
        list: null,
        total: 0,
        listLoading: true,
        listQuery: {
          pageNum: 1,
          pageSize: 10
        },
        dialogVisible: false,
        currentProduct: {},
        stockForm: {
          addStock: 1
        },
        updateLoading: false
      }
    },
    created() {
      this.getList();
    },
    methods: {
      handleImageError(e) {
        e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
      },
      handleImageUrl(pic) {
        if (!pic || pic === '') {
          return '';
        }
        
        if (pic.indexOf('http') !== 0) {
          const picPath = pic.startsWith('/') ? pic : '/' + pic;
          const fullUrl = process.env.BASE_API + picPath;
          return fullUrl;
        }
        
        return pic;
      },
      getList() {
        this.listLoading = true;
        fetchPageList(this.listQuery.pageNum, this.listQuery.pageSize).then(response => {
          this.list = response.data.list;
          this.total = response.data.total;
          this.listLoading = false;
        });
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
      getSpecText(spData) {
        if (spData == null || spData === '') {
          return '无规格';
        }
        try {
          let specList = JSON.parse(spData);
          let specText = '';
          for (let i = 0; i < specList.length; i++) {
            let spec = specList[i];
            if (i === 0) {
              specText = spec.value;
            } else {
              specText = specText + ' / ' + spec.value;
            }
          }
          return specText;
        } catch (e) {
          console.error('解析规格数据失败:', e);
          return '数据错误';
        }
      },
      handleUpdate(index, row) {
        this.dialogVisible = true;
        this.currentProduct = Object.assign({}, row);
        this.stockForm.addStock = 10;
      },
      handleConfirmUpdate() {
        this.updateLoading = true;
        // 更新库存
        let skuStock = Object.assign({}, this.currentProduct);
        skuStock.stock = skuStock.stock + this.stockForm.addStock;
        let skuStockList = [];
        skuStockList.push(skuStock);
        update(skuStock.productId, skuStockList).then(response => {
          this.$message({
            message: '库存补充成功',
            type: 'success',
            duration: 1000
          });
          this.dialogVisible = false;
          this.updateLoading = false;
          this.getList();
        }).catch(error => {
          this.updateLoading = false;
          this.$message({
            message: '操作失败，请重试',
            type: 'error'
          });
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
  
  /* 告警头部卡片 */
  .alarm-header-card {
    margin-bottom: 20px;
    border-radius: 8px;
    border-left: 4px solid #E6A23C;
    overflow: hidden;
  }
  
  .alarm-header {
    display: flex;
    align-items: center;
  }
  
  .alarm-icon {
    flex: 0 0 60px;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 15px;
  }
  
  .alarm-icon i {
    font-size: 40px;
    color: #E6A23C;
  }
  
  .alarm-info {
    flex: 1;
  }
  
  .alarm-title {
    font-size: 18px;
    color: #303133;
    margin: 0 0 8px 0;
  }
  
  .alarm-desc {
    font-size: 14px;
    color: #606266;
    margin: 0;
  }
  
  .alarm-count {
    font-size: 16px;
    font-weight: bold;
    color: #F56C6C;
  }
  
  .alarm-action {
    flex: 0 0 auto;
  }
  
  /* 数据卡片 */
  .data-card {
    border-radius: 8px;
    overflow: hidden;
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
  
  /* 商品图片 */
  .product-img-container {
    width: 80px;
    height: 80px;
    margin: 0 auto;
    overflow: hidden;
    border-radius: 4px;
    border: 1px solid #ebeef5;
    background-color: #fff;
  }
  
  .product-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .no-img-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #909399;
    background-color: #f8f9fa;
  }
  
  .no-img-placeholder i {
    font-size: 30px;
    margin-bottom: 5px;
  }
  
  .no-img-placeholder p {
    margin: 0;
    font-size: 12px;
  }
  
  /* 商品名称样式 */
  .product-name {
    font-weight: 500;
    color: #303133;
    padding: 0 10px;
  }
  
  /* SKU编码样式 */
  .sku-code {
    color: #606266;
    font-family: monospace;
  }
  
  /* 库存信息样式 */
  .stock-info {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .stock-item {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 8px;
  }
  
  .stock-label {
    color: #606266;
  }
  
  .stock-value {
    font-weight: bold;
    margin-left: 5px;
  }
  
  .stock-value.danger {
    color: #F56C6C;
  }
  
  .stock-value.warning {
    color: #E6A23C;
  }
  
  .stock-status {
    margin-top: 5px;
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
  .stock-dialog-card {
    border: none;
    box-shadow: none;
  }
  
  .product-dialog-header {
    display: flex;
    margin-bottom: 20px;
  }
  
  .product-dialog-img {
    width: 80px;
    height: 80px;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #ebeef5;
    margin-right: 15px;
  }
  
  .product-dialog-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .no-img-small {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f8f9fa;
    color: #909399;
  }
  
  .no-img-small i {
    font-size: 30px;
  }
  
  .product-dialog-info {
    flex: 1;
  }
  
  .product-dialog-info h3 {
    margin: 0 0 10px 0;
    font-size: 16px;
    color: #303133;
  }
  
  .product-dialog-info p {
    margin: 5px 0;
    font-size: 14px;
    color: #606266;
  }
  
  .stock-dialog-info {
    margin: 15px 0;
    display: flex;
    justify-content: space-around;
  }
  
  .stock-dialog-item {
    text-align: center;
  }
  
  .stock-dialog-label {
    display: block;
    font-size: 14px;
    color: #606266;
    margin-bottom: 5px;
  }
  
  .stock-dialog-value {
    font-size: 24px;
    font-weight: bold;
  }
  
  .form-help-text {
    margin-left: 10px;
    color: #909399;
    font-size: 13px;
  }
  
  /* Element UI 样式覆盖 */
  .el-table {
    border-radius: 4px;
    overflow: hidden;
  }
  
  .el-table th {
    background-color: #f8f9fa;
  }
  
  .el-divider__text {
    background-color: #fff;
    padding: 0 20px;
    color: #909399;
  }
  
  .el-button--primary {
    background-color: #409EFF;
    border-color: #409EFF;
  }
  
  /* 响应式调整 */
  @media screen and (max-width: 1200px) {
    .alarm-header {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .alarm-icon {
      margin-bottom: 10px;
    }
    
    .alarm-action {
      margin-top: 15px;
      align-self: flex-end;
    }
  }
</style> 