<template> 
  <div class="product-detail-container">
    <el-card class="form-container" shadow="hover">
      <div class="step-header">
        <h2 class="page-title">商品信息管理</h2>
        <div class="step-description">{{ getStepDescription() }}</div>
      </div>
      <el-steps :active="active" finish-status="success" align-center class="custom-steps">
        <el-step title="商品信息" icon="el-icon-goods"></el-step>
        <el-step title="商品促销" icon="el-icon-present"></el-step>
        <el-step title="商品属性" icon="el-icon-tickets"></el-step>
        <el-step title="商品关联" icon="el-icon-connection"></el-step>
      </el-steps>
      <div class="step-content">
        <product-info-detail
          v-show="showStatus[0]"
          v-model="productParam"
          :is-edit="isEdit"
          @nextStep="nextStep">
        </product-info-detail>
        <product-sale-detail
          v-show="showStatus[1]"
          v-model="productParam"
          :is-edit="isEdit"
          @nextStep="nextStep"
          @prevStep="prevStep">
        </product-sale-detail>
        <product-attr-detail
          v-show="showStatus[2]"
          v-model="productParam"
          :is-edit="isEdit"
          @nextStep="nextStep"
          @prevStep="prevStep">
        </product-attr-detail>
        <product-relation-detail
          v-show="showStatus[3]"
          v-model="productParam"
          :is-edit="isEdit"
          @prevStep="prevStep"
          @finishCommit="finishCommit">
        </product-relation-detail>
      </div>
    </el-card>
  </div>
</template>
<script>
  import ProductInfoDetail from './ProductInfoDetail';
  import ProductSaleDetail from './ProductSaleDetail';
  import ProductAttrDetail from './ProductAttrDetail';
  import ProductRelationDetail from './ProductRelationDetail';
  import {createProduct,getProduct,updateProduct} from '@/api/product';

  const defaultProductParam = {
    albumPics: '',
    brandId: null,
    brandName: '',
    deleteStatus: 0,
    description: '',
    detailDesc: '',
    detailHtml: '',
    detailMobileHtml: '',
    detailTitle: '',
    feightTemplateId: 0,
    flashPromotionCount: 0,
    flashPromotionId: 0,
    flashPromotionPrice: 0,
    flashPromotionSort: 0,
    giftPoint: 0,
    giftGrowth: 0,
    keywords: '',
    lowStock: 0,
    name: '',
    newStatus: 0,
    note: '',
    originalPrice: 0,
    pic: '',
    //会员价格{memberLevelId: 0,memberPrice: 0,memberLevelName: null}
    memberPriceList: [],
    //商品满减
    productFullReductionList: [{fullPrice: 0, reducePrice: 0}],
    //商品阶梯价格
    productLadderList: [{count: 0,discount: 0,price: 0}],
    previewStatus: 0,
    price: 0,
    productAttributeCategoryId: null,
    //商品属性相关{productAttributeId: 0, value: ''}
    productAttributeValueList: [],
    //商品sku库存信息{lowStock: 0, pic: '', price: 0, sale: 0, skuCode: '', spData: '', stock: 0}
    skuStockList: [],
    //商品相关专题{subjectId: 0}
    subjectProductRelationList: [],
    //商品相关优选{prefrenceAreaId: 0}
    prefrenceAreaProductRelationList: [],
    productCategoryId: null,
    productCategoryName: '',
    productSn: '',
    promotionEndTime: '',
    promotionPerLimit: 0,
    promotionPrice: null,
    promotionStartTime: '',
    promotionType: 0,
    publishStatus: 0,
    recommandStatus: 0,
    sale: 0,
    serviceIds: '',
    sort: 0,
    stock: 0,
    subTitle: '',
    unit: '',
    usePointLimit: 0,
    verifyStatus: 0,
    weight: 0
  };
  export default {
    name: 'ProductDetail',
    components: {ProductInfoDetail, ProductSaleDetail, ProductAttrDetail, ProductRelationDetail},
    props: {
      isEdit: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        active: 0,
        productParam: Object.assign({}, defaultProductParam),
        showStatus: [true, false, false, false]
      }
    },
    created(){
      if(this.isEdit){
        getProduct(this.$route.query.id).then(response=>{
          this.productParam=response.data;
        });
      }
    },
    methods: {
      getStepDescription() {
        const descriptions = [
          '请填写商品的基本信息，包括名称、分类、品牌、价格等',
          '设置商品的促销信息，包括优惠、会员价格、满减等',
          '配置商品的规格属性、SKU信息和商品详情',
          '关联商品专题和优选，完成商品发布'
        ];
        return descriptions[this.active];
      },
      hideAll() {
        for (let i = 0; i < this.showStatus.length; i++) {
          this.showStatus[i] = false;
        }
      },
      prevStep() {
        if (this.active > 0 && this.active < this.showStatus.length) {
          this.active--;
          this.hideAll();
          this.showStatus[this.active] = true;
        }
      },
      nextStep() {
        if (this.active < this.showStatus.length - 1) {
          this.active++;
          this.hideAll();
          this.showStatus[this.active] = true;
        }
      },
      finishCommit(isEdit) {
        this.$confirm('是否要提交该产品', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if(isEdit){
            updateProduct(this.$route.query.id,this.productParam).then(response=>{
              this.$message({
                type: 'success',
                message: '提交成功',
                duration:1000
              });
              this.$router.back();
            });
          }else{
            createProduct(this.productParam).then(response=>{
              this.$message({
                type: 'success',
                message: '提交成功',
                duration:1000
              });
              location.reload();
            });
          }
        })
      }
    }
  }
</script>
<style>
  .product-detail-container {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 120px);
  }
  
  .form-container {
    width: 980px;
    margin: 0 auto;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s;
  }
  
  .form-inner-container {
    width: 800px;
    margin: 0 auto;
  }
  
  .step-header {
    text-align: center;
    margin-bottom: 30px;
  }
  
  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 10px;
  }
  
  .step-description {
    color: #606266;
    font-size: 14px;
    margin-bottom: 20px;
  }
  
  .custom-steps {
    margin-bottom: 30px;
    padding: 10px 0 30px;
    border-bottom: 1px dashed #e6e6e6;
  }
  
  .custom-steps .el-step__title {
    font-size: 15px;
    font-weight: 500;
  }
  
  .custom-steps .el-step__icon {
    border-color: #409EFF;
  }
  
  .custom-steps .el-step__head.is-process {
    color: #409EFF;
    border-color: #409EFF;
  }
  
  .custom-steps .el-step__head.is-finish .el-step__icon {
    background-color: #67C23A;
    border-color: #67C23A;
    color: #fff;
  }
  
  .step-content {
    background-color: #fff;
    padding: 20px;
    border-radius: 4px;
  }
  
  /* Card styles for inner components */
  .cardBg {
    background-color: #fafafa;
    margin-bottom: 20px;
    border-radius: 4px;
    border: 1px solid #ebeef5;
  }
  
  /* Button styles */
  .el-button--primary {
    background-color: #409EFF;
    border-color: #409EFF;
    transition: all 0.3s;
  }
  
  .el-button--primary:hover {
    background-color: #66b1ff;
    border-color: #66b1ff;
    box-shadow: 0 2px 12px 0 rgba(64, 158, 255, 0.3);
  }
</style>


