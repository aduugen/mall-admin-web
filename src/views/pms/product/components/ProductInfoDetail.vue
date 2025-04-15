<template>
  <div class="product-info-container">
    <el-form :model="value" :rules="rules" ref="productInfoForm" label-width="120px" class="form-inner-container" size="small">
      <!-- 基础信息分组 -->
      <div class="form-section">
        <div class="section-header">
          <i class="el-icon-info"></i>
          <span>基础信息</span>
        </div>
        <div class="section-body">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="商品分类：" prop="productCategoryId">
                <el-cascader
                  v-model="selectProductCateValue"
                  :options="productCateOptions"
                  placeholder="请选择商品分类"
                  clearable>
                </el-cascader>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="商品品牌：" prop="brandId">
                <el-select
                  v-model="value.brandId"
                  @change="handleBrandChange"
                  placeholder="请选择品牌"
                  clearable
                  style="width: 100%">
                  <el-option
                    v-for="item in brandOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="商品名称：" prop="name">
                <el-input v-model="value.name" placeholder="请输入商品名称"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="副标题：" prop="subTitle">
                <el-input v-model="value.subTitle" placeholder="请输入副标题"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="商品介绍：">
            <el-input
              :autoSize="{minRows: 3, maxRows: 6}"
              v-model="value.description"
              type="textarea"
              placeholder="请输入商品介绍，简要描述商品的特点和亮点"></el-input>
          </el-form-item>
        </div>
      </div>
      
      <!-- 销售信息分组 -->
      <div class="form-section">
        <div class="section-header">
          <i class="el-icon-sell"></i>
          <span>销售信息</span>
        </div>
        <div class="section-body">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="商品货号：">
                <el-input v-model="value.productSn" placeholder="请输入商品货号"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="商品售价：">
                <el-input v-model="value.price" placeholder="请输入售价">
                  <template slot="prepend">￥</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="市场价：">
                <el-input v-model="value.originalPrice" placeholder="请输入市场价">
                  <template slot="prepend">￥</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="商品库存：">
                <el-input v-model="value.stock" placeholder="请输入库存数量"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="计量单位：">
                <el-input v-model="value.unit" placeholder="件/个/箱"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="商品重量：">
                <el-input v-model="value.weight" placeholder="请输入商品重量">
                  <template slot="append">克</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="排序">
            <el-input v-model="value.sort" placeholder="请输入排序" style="width: 200px"></el-input>
            <span class="input-help">数值越小排序越靠前</span>
          </el-form-item>
        </div>
      </div>
      
      <div class="form-footer">
        <el-button type="primary" size="medium" @click="handleNext('productInfoForm')">下一步，填写商品促销</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
  import {fetchListWithChildren} from '@/api/productCate'
  import {fetchList as fetchBrandList} from '@/api/brand'
  import {getProduct} from '@/api/product';

  export default {
    name: "ProductInfoDetail",
    props: {
      value: Object,
      isEdit: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        hasEditCreated:false,
        //选中商品分类的值
        selectProductCateValue: [],
        productCateOptions: [],
        brandOptions: [],
        rules: {
          name: [
            {required: true, message: '请输入商品名称', trigger: 'blur'},
            {min: 2, max: 140, message: '长度在 2 到 140 个字符', trigger: 'blur'}
          ],
          subTitle: [{required: true, message: '请输入商品副标题', trigger: 'blur'}],
          productCategoryId: [{required: true, message: '请选择商品分类', trigger: 'blur'}],
          brandId: [{required: true, message: '请选择商品品牌', trigger: 'blur'}],
          description: [{required: true, message: '请输入商品介绍', trigger: 'blur'}],
          requiredProp: [{required: true, message: '该项为必填项', trigger: 'blur'}]
        }
      };
    },
    created() {
      this.getProductCateList();
      this.getBrandList();
    },
    computed:{
      //商品的编号
      productId(){
        return this.value.id;
      }
    },
    watch: {
      productId:function(newValue){
        if(!this.isEdit)return;
        if(this.hasEditCreated)return;
        if(newValue===undefined||newValue==null||newValue===0)return;
        this.handleEditCreated();
      },
      selectProductCateValue: function (newValue) {
        if (newValue != null && newValue.length === 2) {
          this.value.productCategoryId = newValue[1];
          this.value.productCategoryName= this.getCateNameById(this.value.productCategoryId);
        } else {
          this.value.productCategoryId = null;
          this.value.productCategoryName=null;
        }
      }
    },
    methods: {
      //处理编辑逻辑
      handleEditCreated(){
        if(this.value.productCategoryId!=null){
          this.selectProductCateValue.push(this.value.cateParentId);
          this.selectProductCateValue.push(this.value.productCategoryId);
        }
        this.hasEditCreated=true;
      },
      getProductCateList() {
        fetchListWithChildren().then(response => {
          let list = response.data;
          this.productCateOptions = [];
          for (let i = 0; i < list.length; i++) {
            let children = [];
            if (list[i].children != null && list[i].children.length > 0) {
              for (let j = 0; j < list[i].children.length; j++) {
                children.push({label: list[i].children[j].name, value: list[i].children[j].id});
              }
            }
            this.productCateOptions.push({label: list[i].name, value: list[i].id, children: children});
          }
        });
      },
      getBrandList() {
        fetchBrandList({pageNum: 1, pageSize: 100}).then(response => {
          this.brandOptions = [];
          let brandList = response.data.list;
          for (let i = 0; i < brandList.length; i++) {
            this.brandOptions.push({label: brandList[i].name, value: brandList[i].id});
          }
        });
      },
      getCateNameById(id){
        let name=null;
        for(let i=0;i<this.productCateOptions.length;i++){
          for(let j=0;j<this.productCateOptions[i].children.length;j++){
            if(this.productCateOptions[i].children[j].value===id){
              name=this.productCateOptions[i].children[j].label;
              return name;
            }
          }
        }
        return name;
      },
      handleNext(formName){
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$emit('nextStep');
          } else {
            this.$message({
              message: '验证失败',
              type: 'error',
              duration:1000
            });
            return false;
          }
        });
      },
      handleBrandChange(val) {
        let brandName = '';
        for (let i = 0; i < this.brandOptions.length; i++) {
          if (this.brandOptions[i].value === val) {
            brandName = this.brandOptions[i].label;
            break;
          }
        }
        this.value.brandName = brandName;
      }
    }
  }
</script>

<style scoped>
  .product-info-container {
    padding: 10px 0;
  }
  
  .form-section {
    margin-bottom: 25px;
    border-radius: 5px;
    border: 1px solid #ebeef5;
    background-color: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.03);
    overflow: hidden;
  }
  
  .section-header {
    padding: 12px 20px;
    background-color: #f8f9fc;
    border-bottom: 1px solid #ebeef5;
    display: flex;
    align-items: center;
  }
  
  .section-header i {
    color: #409EFF;
    margin-right: 8px;
    font-size: 18px;
  }
  
  .section-header span {
    font-weight: 500;
    color: #303133;
    font-size: 16px;
  }
  
  .section-body {
    padding: 20px;
  }
  
  .input-help {
    color: #909399;
    font-size: 12px;
    margin-left: 10px;
  }
  
  .form-footer {
    text-align: center;
    margin-top: 30px;
  }
  
  .el-input-group__prepend,
  .el-input-group__append {
    background-color: #f5f7fa;
    color: #909399;
  }
  
  /* Element UI overrides */
  .el-form-item {
    margin-bottom: 18px;
  }
  
  .el-button--primary {
    padding: 10px 25px;
    font-size: 14px;
  }
</style>
