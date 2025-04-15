<template> 
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-card class="search-container" shadow="hover">
      <div class="search-header">
        <i class="el-icon-search"></i>
        <span>筛选搜索</span>
        <div class="search-buttons">
          <el-button type="primary" icon="el-icon-search" @click="getProductList()">查询</el-button>
          <el-button icon="el-icon-refresh" @click="handleResetSearch()">重置</el-button>
        </div>
      </div>
      <div class="search-form">
        <el-form :inline="true" :model="listQuery" size="small" label-width="80px">
          <el-form-item label="商品名称">
            <el-input v-model="listQuery.keyword" placeholder="请输入商品名称" clearable @keyup.enter.native="handleFilter"></el-input>
          </el-form-item>
          <el-form-item label="商品货号">
            <el-input v-model="listQuery.productSn" placeholder="请输入商品货号" clearable @keyup.enter.native="handleFilter"></el-input>
          </el-form-item>
          <el-form-item label="商品分类">
            <el-select v-model="listQuery.productCategoryId" placeholder="请选择商品分类" clearable>
              <el-option v-for="item in productCateList"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="商品品牌">
            <el-select v-model="listQuery.brandId" placeholder="请选择商品品牌" clearable>
              <el-option v-for="item in brandOptions"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="上架状态">
            <el-select v-model="listQuery.publishStatus" placeholder="请选择上架状态" clearable>
              <el-option v-for="item in publishStatusOptions"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="审核状态">
            <el-select v-model="listQuery.verifyStatus" placeholder="请选择审核状态" clearable>
              <el-option v-for="item in verifyStatusOptions"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    
    <!-- 数据列表区域 -->
    <el-card class="list-container" shadow="hover">
      <div class="list-header">
        <i class="el-icon-goods"></i>
        <span>数据列表</span>
        <div class="header-right">
          <el-button type="danger" icon="el-icon-delete" size="small" @click="handleBatchDelete()">批量删除</el-button>
          <el-button type="primary" icon="el-icon-plus" size="small" @click="handleShowNewProduct()">添加商品</el-button>
        </div>
      </div>
      
      <!-- 数据表格 -->
      <div class="table-container">
        <el-table 
          ref="productTable"
          :data="list"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          v-loading="listLoading"
          border
          stripe
          highlight-current-row>
          <el-table-column type="selection" width="55" align="center"></el-table-column>
          <el-table-column label="编号" width="80" align="center">
            <template slot-scope="scope">
              <span class="product-id">{{scope.row.id}}</span>
            </template>
          </el-table-column>
          <el-table-column label="商品图片" width="120" align="center">
            <template slot-scope="scope">
              <img class="product-image" :src="scope.row.pic">
            </template>
          </el-table-column>
          <el-table-column label="商品信息" min-width="180" align="center">
            <template slot-scope="scope">
              <div class="product-info">
                <p class="product-name">{{scope.row.name}}</p>
                <p class="product-brand">品牌：<span>{{scope.row.brandName}}</span></p>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="价格/货号" width="150" align="center">
            <template slot-scope="scope">
              <div class="product-price-info">
                <p>价格：<span class="price-value">￥{{scope.row.price}}</span></p>
                <p>货号：<span class="product-sn">{{scope.row.productSn}}</span></p>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="商品属性" width="180" align="center">
            <template slot-scope="scope">
              <div class="product-tags">
                <div>
                  <span class="tag-label">上架：</span>
                  <el-switch
                    @change="handlePublishStatusChange(scope.$index, scope.row)"
                    :active-value="1"
                    :inactive-value="0"
                    v-model="scope.row.publishStatus">
                  </el-switch>
                </div>
                <div>
                  <span class="tag-label">新品：</span>
                  <el-switch
                    @change="handleNewStatusChange(scope.$index, scope.row)"
                    :active-value="1"
                    :inactive-value="0"
                    v-model="scope.row.newStatus">
                  </el-switch>
                </div>
                <div>
                  <span class="tag-label">推荐：</span>
                  <el-switch
                    @change="handleRecommendStatusChange(scope.$index, scope.row)"
                    :active-value="1"
                    :inactive-value="0"
                    v-model="scope.row.recommandStatus">
                  </el-switch>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="排序" width="100" align="center">
            <template slot-scope="scope">
              <span class="sort-value">{{scope.row.sort}}</span>
            </template>
          </el-table-column>
          <el-table-column label="SKU库存" width="100" align="center">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-tickets" size="small" @click="handleShowSkuEditDialog(scope.$index, scope.row)">查看</el-button>
            </template>
          </el-table-column>
          <el-table-column label="销量" width="100" align="center">
            <template slot-scope="scope">
              <span class="sale-count">{{scope.row.sale}}</span>
            </template>
          </el-table-column>
          <el-table-column label="审核状态" width="120" align="center">
            <template slot-scope="scope">
              <div class="verify-status">
                <el-tag :type="scope.row.verifyStatus === 1 ? 'success' : 'warning'" size="small">
                  {{scope.row.verifyStatus | verifyStatusFilter}}
                </el-tag>
                <el-button
                  class="detail-btn"
                  v-if="scope.row.verifyStatus===1"
                  type="text"
                  @click="handleShowVerifyDetail(scope.$index, scope.row)">查看详情</el-button>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template slot-scope="scope">
              <div class="operation-buttons">
                <el-button
                  size="mini"
                  icon="el-icon-view"
                  @click="handleShowProduct(scope.$index, scope.row)">查看
                </el-button>
                <el-button
                  size="mini"
                  icon="el-icon-edit"
                  type="primary"
                  @click="handleUpdateProduct(scope.$index, scope.row)">编辑
                </el-button>
                <el-button
                  size="mini"
                  icon="el-icon-delete"
                  type="danger"
                  @click="handleDeleteProduct(scope.$index, scope.row)">删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 批量操作和分页区域 -->
      <div class="batch-operate-container" v-if="list && list.length>0">
        <el-select v-model="operateType" style="width: 200px">
          <el-option label="批量上架" value="publishOn"></el-option>
          <el-option label="批量下架" value="publishOff"></el-option>
          <el-option label="批量推荐" value="recommendOn"></el-option>
          <el-option label="批量不推荐" value="recommendOff"></el-option>
          <el-option label="批量设为新品" value="newOn"></el-option>
          <el-option label="批量取消新品" value="newOff"></el-option>
          <el-option label="批量删除" value="deleteProduct"></el-option>
        </el-select>
        <el-button class="batch-button" type="primary" icon="el-icon-check" @click="handleBatchOperate()">确定</el-button>
      </div>
      
      <div class="pagination-container" v-if="list && list.length>0">
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          layout="total, sizes,prev, pager, next,jumper"
          :page-size="listQuery.pageSize"
          :page-sizes="[5,10,15]"
          :current-page.sync="listQuery.pageNum"
          :total="total">
        </el-pagination>
      </div>
    </el-card>
    
    <!-- 编辑库存对话框 -->
    <el-dialog
      title="编辑货品信息"
      :visible.sync="editSkuInfo.dialogVisible"
      width="40%">
      <div class="dialog-content">
        <div class="sku-header">
          <div>
            <span class="sku-label">商品货号：</span>
            <span class="sku-value">{{editSkuInfo.productSn}}</span>
          </div>
          <div class="sku-search">
            <el-input placeholder="按sku编号搜索" v-model="editSkuInfo.keyword" size="small">
              <el-button slot="append" icon="el-icon-search" @click="handleSearchEditSku"></el-button>
            </el-input>
          </div>
        </div>
        
        <el-table 
          :data="editSkuInfo.stockList"
          border
          stripe
          style="width: 100%;margin-top: 20px">
          <el-table-column
            label="SKU编号"
            align="center">
            <template slot-scope="scope">{{scope.row.skuCode}}</template>
          </el-table-column>
          <el-table-column
            v-for="(item,index) in editSkuInfo.productAttr"
            :label="item.name"
            :key="item.id"
            align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.spData && scope.row.spData[index]">{{scope.row.spData[index]}}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column
            label="销售价格"
            width="100"
            align="center">
            <template slot-scope="scope"><span class="price-value">{{scope.row.price}}元</span></template>
          </el-table-column>
          <el-table-column
            label="库存"
            width="80"
            align="center">
            <template slot-scope="scope"><span class="sort-value">{{scope.row.stock}}</span></template>
          </el-table-column>
          <el-table-column
            label="库存预警值"
            width="100"
            align="center">
            <template slot-scope="scope"><span>{{scope.row.lowStock}}</span></template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="120"
            align="center">
            <template slot-scope="scope">
              <el-button
                type="text"
                icon="el-icon-edit"
                @click="handleEditSkuInfo(scope.$index, scope.row)">编辑
              </el-button>
              <el-button
                type="text"
                icon="el-icon-check"
                @click="handleSaveSkuInfo(scope.$index, scope.row)">保存
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
    
    <!-- 预览对话框 -->
    <el-dialog
      title="预览"
      :visible.sync="dialogVisible"
      width="40%">
      <div v-html="productInfo"></div>
    </el-dialog>
  </div>
</template>
<script>
  import {
    fetchList,
    updateDeleteStatus,
    updateNewStatus,
    updateRecommendStatus,
    updatePublishStatus
  } from '@/api/product'
  import {fetchList as fetchSkuStockList,update as updateSkuStockList} from '@/api/skuStock'
  import {fetchList as fetchProductAttrList} from '@/api/productAttr'
  import {fetchList as fetchBrandList} from '@/api/brand'
  import {fetchListWithChildren} from '@/api/productCate'

  const defaultListQuery = {
    keyword: null,
    pageNum: 1,
    pageSize: 5,
    publishStatus: null,
    verifyStatus: null,
    productSn: null,
    productCategoryId: null,
    brandId: null
  };
  export default {
    name: "productList",
    data() {
      return {
        editSkuInfo:{
          dialogVisible:false,
          productId:null,
          productSn:'',
          productAttributeCategoryId:null,
          stockList:[],
          productAttr:[],
          keyword:null
        },
        operates: [
          {
            label: "商品上架",
            value: "publishOn"
          },
          {
            label: "商品下架",
            value: "publishOff"
          },
          {
            label: "设为推荐",
            value: "recommendOn"
          },
          {
            label: "取消推荐",
            value: "recommendOff"
          },
          {
            label: "设为新品",
            value: "newOn"
          },
          {
            label: "取消新品",
            value: "newOff"
          },
          {
            label: "转移到分类",
            value: "transferCategory"
          },
          {
            label: "移入回收站",
            value: "recycle"
          }
        ],
        operateType: null,
        listQuery: Object.assign({}, defaultListQuery),
        list: [],
        total: 0,
        listLoading: true,
        selectProductCateValue: null,
        multipleSelection: [],
        productCateOptions: [],
        brandOptions: [],
        productCateList: [],
        dialogVisible: false,
        productInfo: '',
        publishStatusOptions: [{
          value: 1,
          label: '上架'
        }, {
          value: 0,
          label: '下架'
        }],
        verifyStatusOptions: [{
          value: 1,
          label: '审核通过'
        }, {
          value: 0,
          label: '未审核'
        }]
      }
    },
    created() {
      this.getList();
      this.getBrandList();
      this.getProductCateList();
    },
    watch: {
      selectProductCateValue: function (newValue) {
        if (newValue != null && newValue.length == 2) {
          this.listQuery.productCategoryId = newValue[1];
        } else {
          this.listQuery.productCategoryId = null;
        }

      }
    },
    filters: {
      verifyStatusFilter(value) {
        if (value === 1) {
          return '审核通过';
        } else {
          return '未审核';
        }
      }
    },
    methods: {
      getProductSkuSp(row, index) {
        if (!row || !row.spData) return null;
        try {
          let spData = JSON.parse(row.spData);
          if(spData && index < spData.length){
            return spData[index].value;
          }
        } catch (e) {
          console.error('解析spData失败', e);
        }
        return null;
      },
      getList() {
        this.listLoading = true;
        fetchList(this.listQuery).then(response => {
          this.listLoading = false;
          if (response && response.data) {
            this.list = response.data.list || [];
            this.total = response.data.total || 0;
          } else {
            this.list = [];
            this.total = 0;
          }
        }).catch(error => {
          console.error('获取商品列表失败', error);
          this.listLoading = false;
          this.list = [];
          this.total = 0;
        });
      },
      getBrandList() {
        fetchBrandList({pageNum: 1, pageSize: 100}).then(response => {
          this.brandOptions = [];
          if (response && response.data && response.data.list) {
            let brandList = response.data.list;
            for (let i = 0; i < brandList.length; i++) {
              this.brandOptions.push({label: brandList[i].name, value: brandList[i].id});
            }
          }
        }).catch(error => {
          console.error('获取品牌列表失败', error);
          this.brandOptions = [];
        });
      },
      getProductCateList() {
        fetchListWithChildren().then(response => {
          this.productCateOptions = [];
          this.productCateList = [];
          if (response && response.data) {
            let list = response.data || [];
            for (let i = 0; i < list.length; i++) {
              let children = [];
              if (list[i].children && list[i].children.length > 0) {
                for (let j = 0; j < list[i].children.length; j++) {
                  children.push({label: list[i].children[j].name, value: list[i].children[j].id});
                }
              }
              this.productCateOptions.push({label: list[i].name, value: list[i].id, children: children});
              this.productCateList.push({label: list[i].name, value: list[i].id});
            }
          }
        }).catch(error => {
          console.error('获取商品分类列表失败', error);
          this.productCateOptions = [];
          this.productCateList = [];
        });
      },
      handleShowSkuEditDialog(index,row){
        this.editSkuInfo.dialogVisible=true;
        this.editSkuInfo.productId=row.id;
        this.editSkuInfo.productSn=row.productSn;
        this.editSkuInfo.productAttributeCategoryId = row.productAttributeCategoryId;
        this.editSkuInfo.keyword=null;
        this.editSkuInfo.stockList = [];
        this.editSkuInfo.productAttr = [];
        fetchSkuStockList(row.id,{keyword:this.editSkuInfo.keyword}).then(response=>{
          if (response && response.data) {
            this.editSkuInfo.stockList=response.data || [];
          }
        }).catch(error => {
          console.error('获取SKU库存列表失败', error);
          this.editSkuInfo.stockList = [];
        });
        if(row.productAttributeCategoryId!=null){
          fetchProductAttrList(row.productAttributeCategoryId,{type:0}).then(response=>{
            if (response && response.data && response.data.list) {
              this.editSkuInfo.productAttr=response.data.list || [];
            }
          }).catch(error => {
            console.error('获取商品属性列表失败', error);
            this.editSkuInfo.productAttr = [];
          });
        }
      },
      handleSearchEditSku(){
        if (!this.editSkuInfo.productId) return;
        fetchSkuStockList(this.editSkuInfo.productId, {keyword:this.editSkuInfo.keyword}).then(response=>{
          if (response && response.data) {
            this.editSkuInfo.stockList = response.data || [];
          }
        }).catch(error => {
          console.error('搜索SKU失败', error);
          this.editSkuInfo.stockList = [];
        });
      },
      handleEditSkuInfo(index, row) {
        console.log("编辑SKU信息:", row);
      },
      handleSaveSkuInfo(index, row) {
        console.log("保存SKU信息:", row);
        this.$message({
          message: '保存成功',
          type: 'success',
          duration: 1000
        });
      },
      handleEditSkuConfirm(){
        if(!this.editSkuInfo.stockList || this.editSkuInfo.stockList.length<=0){
          this.$message({
            message: '暂无sku信息',
            type: 'warning',
            duration: 1000
          });
          return
        }
        this.$confirm('是否要进行修改', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(()=>{
          updateSkuStockList(this.editSkuInfo.productId,this.editSkuInfo.stockList).then(response=>{
            this.$message({
              message: '修改成功',
              type: 'success',
              duration: 1000
            });
            this.editSkuInfo.dialogVisible=false;
          });
        });
      },
      handleSearchList() {
        this.listQuery.pageNum = 1;
        this.getList();
      },
      handleAddProduct() {
        this.$router.push({path:'/pms/addProduct'});
      },
      handleBatchOperate() {
        if(this.operateType==null){
          this.$message({
            message: '请选择操作类型',
            type: 'warning',
            duration: 1000
          });
          return;
        }
        if(!this.multipleSelection || this.multipleSelection.length<1){
          this.$message({
            message: '请选择要操作的商品',
            type: 'warning',
            duration: 1000
          });
          return;
        }
        this.$confirm('是否要进行该批量操作?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let ids=[];
          if (!this.multipleSelection) return;
          for(let i=0;i<this.multipleSelection.length;i++){
            if (this.multipleSelection[i] && this.multipleSelection[i].id) {
              ids.push(this.multipleSelection[i].id);
            }
          }
          switch (this.operateType) {
            case this.operates[0].value:
              this.updatePublishStatus(1,ids);
              break;
            case this.operates[1].value:
              this.updatePublishStatus(0,ids);
              break;
            case this.operates[2].value:
              this.updateRecommendStatus(1,ids);
              break;
            case this.operates[3].value:
              this.updateRecommendStatus(0,ids);
              break;
            case this.operates[4].value:
              this.updateNewStatus(1,ids);
              break;
            case this.operates[5].value:
              this.updateNewStatus(0,ids);
              break;
            case this.operates[6].value:
              break;
            case this.operates[7].value:
              this.updateDeleteStatus(1,ids);
              break;
            default:
              break;
          }
          this.getList();
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
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      handlePublishStatusChange(index, row) {
        if (!row || !row.id) return;
        let ids = [];
        ids.push(row.id);
        this.updatePublishStatus(row.publishStatus, ids);
      },
      handleNewStatusChange(index, row) {
        if (!row || !row.id) return;
        let ids = [];
        ids.push(row.id);
        this.updateNewStatus(row.newStatus, ids);
      },
      handleRecommendStatusChange(index, row) {
        if (!row || !row.id) return;
        let ids = [];
        ids.push(row.id);
        this.updateRecommendStatus(row.recommandStatus, ids);
      },
      handleResetSearch() {
        this.selectProductCateValue = [];
        this.listQuery = Object.assign({}, defaultListQuery);
      },
      handleDelete(index, row){
        this.$confirm('是否要进行删除操作?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let ids = [];
          ids.push(row.id);
          this.updateDeleteStatus(1,ids);
        });
      },
      handleUpdateProduct(index,row){
        this.$router.push({path:'/pms/updateProduct',query:{id:row.id}});
      },
      handleShowProduct(index,row){
        this.dialogVisible = true;
        this.productInfo = `<div style="padding:20px;">
          <h3 style="text-align:center">${row.name}</h3>
          <div style="text-align:center">
            <img src="${row.pic}" style="max-width:100%;max-height:400px;">
          </div>
          <div style="margin-top:20px">
            <p><b>商品编号：</b>${row.id}</p>
            <p><b>商品货号：</b>${row.productSn}</p>
            <p><b>商品品牌：</b>${row.brandName}</p>
            <p><b>销售价格：</b>￥${row.price}</p>
            <p><b>上架状态：</b>${row.publishStatus === 1 ? '已上架' : '未上架'}</p>
            <p><b>审核状态：</b>${row.verifyStatus === 1 ? '已审核' : '未审核'}</p>
          </div>
        </div>`;
        console.log("显示商品详情:", row);
      },
      handleShowVerifyDetail(index,row){
        this.dialogVisible = true;
        this.productInfo = `<div style="padding:20px;">
          <h3 style="text-align:center">审核信息</h3>
          <div style="margin-top:20px">
            <p><b>商品名称：</b>${row.name}</p>
            <p><b>审核状态：</b>${row.verifyStatus === 1 ? '已审核' : '未审核'}</p>
            <p><b>审核时间：</b>${row.verifyTime || '暂无'}</p>
            <p><b>审核人员：</b>${row.verifyMan || '暂无'}</p>
            <p><b>反馈详情：</b>${row.verifyRemark || '暂无反馈'}</p>
          </div>
        </div>`;
        console.log("显示审核详情:", row);
      },
      handleShowLog(index,row){
        console.log("handleShowLog",row);
      },
      handleShowNewProduct() {
        this.$router.push({path:'/pms/addProduct'});
      },
      handleBatchDelete() {
        if(this.multipleSelection==null||this.multipleSelection.length<1){
          this.$message({
            message: '请选择要删除的商品',
            type: 'warning',
            duration: 1000
          });
          return;
        }
        this.$confirm('是否要进行批量删除操作?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let ids = [];
          for(let i=0;i<this.multipleSelection.length;i++){
            ids.push(this.multipleSelection[i].id);
          }
          this.updateDeleteStatus(1, ids);
        });
      },
      updatePublishStatus(publishStatus, ids) {
        let params = new URLSearchParams();
        params.append('ids', ids);
        params.append('publishStatus', publishStatus);
        updatePublishStatus(params).then(response => {
          this.$message({
            message: '修改成功',
            type: 'success',
            duration: 1000
          });
        });
      },
      updateNewStatus(newStatus, ids) {
        let params = new URLSearchParams();
        params.append('ids', ids);
        params.append('newStatus', newStatus);
        updateNewStatus(params).then(response => {
          this.$message({
            message: '修改成功',
            type: 'success',
            duration: 1000
          });
        });
      },
      updateRecommendStatus(recommendStatus, ids) {
        let params = new URLSearchParams();
        params.append('ids', ids);
        params.append('recommendStatus', recommendStatus);
        updateRecommendStatus(params).then(response => {
          this.$message({
            message: '修改成功',
            type: 'success',
            duration: 1000
          });
        });
      },
      updateDeleteStatus(deleteStatus, ids) {
        let params = new URLSearchParams();
        params.append('ids', ids);
        params.append('deleteStatus', deleteStatus);
        updateDeleteStatus(params).then(response => {
          this.$message({
            message: '删除成功',
            type: 'success',
            duration: 1000
          });
        });
        this.getList();
      }
    }
  }
</script>
<style scoped>
  .app-container {
    padding: 20px;
    background-color: #f8f9fc;
  }
  
  /* 卡片容器样式 */
  .search-container, .list-container {
    margin-bottom: 20px;
    border-radius: 5px;
  }
  
  /* 卡片头部样式 */
  .search-header, .list-header {
    padding: 15px;
    font-size: 15px;
    font-weight: bold;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .search-header i, .list-header i {
    margin-right: 8px;
    color: #409EFF;
  }
  
  .search-header .search-buttons {
    margin-left: auto;
  }
  
  .list-header .header-right {
    margin-left: auto;
  }
  
  /* 搜索表单样式 */
  .search-form {
    padding: 20px;
    background-color: #fafafa;
  }
  
  /* 表格容器样式 */
  .table-container {
    padding: 10px;
  }
  
  /* 商品图片样式 */
  .product-image {
    width: 80px;
    height: 80px;
    border-radius: 4px;
    object-fit: cover;
  }
  
  /* 商品信息样式 */
  .product-info {
    text-align: left;
    padding: 5px 10px;
  }
  
  .product-name {
    font-weight: bold;
    margin-bottom: 5px;
    color: #303133;
  }
  
  .product-brand {
    color: #909399;
    font-size: 13px;
  }
  
  /* 价格和货号样式 */
  .product-price-info {
    text-align: left;
  }
  
  .price-value {
    color: #FF6B6B;
    font-weight: bold;
  }
  
  .product-sn {
    color: #909399;
    font-size: 13px;
    margin-top: 5px;
  }
  
  /* 商品标签样式 */
  .product-tags > div {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
  }
  
  .tag-label {
    width: 50px;
    text-align: right;
    margin-right: 5px;
    color: #606266;
  }
  
  .sort-value {
    font-weight: bold;
    color: #409EFF;
  }
  
  .sale-count {
    font-weight: bold;
    color: #67C23A;
  }
  
  /* 验证状态样式 */
  .verify-status {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .verify-status .detail-btn {
    margin-top: 5px;
    font-size: 12px;
  }
  
  /* 操作按钮样式 */
  .operation-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }
  
  /* 批量操作区域样式 */
  .batch-operate-container {
    margin: 10px;
    padding: 10px;
    display: flex;
    align-items: center;
    background: #f9f9f9;
    border-radius: 4px;
  }
  
  .batch-button {
    margin-left: 10px;
  }
  
  /* 分页区域样式 */
  .pagination-container {
    padding: 15px;
    display: flex;
    justify-content: center;
  }
  
  /* 对话框内容样式 */
  .dialog-content {
    padding: 0 10px;
  }
  
  .sku-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .sku-label {
    font-weight: bold;
    color: #606266;
  }
  
  .sku-value {
    color: #303133;
  }
  
  .sku-search {
    width: 250px;
  }
</style>


