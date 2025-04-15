<template>
  <div class="app-container">
    <el-card class="form-container" shadow="hover">
      <div slot="header" class="clearfix">
        <span class="card-title">
          <i class="el-icon-edit"></i> 
          {{ isEdit ? '编辑' : '添加' }}商品{{ productAttr.type === 0 ? '属性' : '参数' }}
        </span>
        <el-button 
          style="float: right" 
          type="text" 
          icon="el-icon-back" 
          @click="$router.back()">
          返回列表
        </el-button>
      </div>
      
      <el-form 
        :model="productAttr" 
        :rules="rules" 
        ref="productAttrFrom" 
        label-width="150px"
        class="attr-form"
        status-icon>
        <div class="form-section">
          <div class="section-header">
            <i class="el-icon-info"></i>
            <span>基本信息</span>
          </div>
          
          <div class="section-body">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="属性名称：" prop="name">
                  <el-input 
                    v-model="productAttr.name" 
                    placeholder="请输入属性名称"
                    clearable>
                  </el-input>
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item label="商品类型：">
                  <el-select 
                    v-model="productAttr.productAttributeCategoryId" 
                    placeholder="请选择商品类型"
                    style="width: 100%">
                    <el-option
                      v-for="item in productAttrCateList"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="排序值：">
                  <el-input-number 
                    v-model="productAttr.sort" 
                    :min="0" 
                    :max="1000"
                    controls-position="right" 
                    style="width: 100%">
                  </el-input-number>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </div>
        
        <div class="form-section">
          <div class="section-header">
            <i class="el-icon-s-operation"></i>
            <span>属性配置</span>
          </div>
          
          <div class="section-body">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="分类筛选样式:">
                  <el-radio-group v-model="productAttr.filterType" size="medium">
                    <el-radio-button :label="0">普通</el-radio-button>
                    <el-radio-button :label="1">颜色</el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item label="能否进行检索:">
                  <el-radio-group v-model="productAttr.searchType" size="medium">
                    <el-radio-button :label="0">不需要检索</el-radio-button>
                    <el-radio-button :label="1">关键字检索</el-radio-button>
                    <el-radio-button :label="2">范围检索</el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="商品属性关联:">
                  <el-switch
                    v-model="productAttr.relatedStatus"
                    :active-value="1"
                    :inactive-value="0"
                    active-text="是"
                    inactive-text="否">
                  </el-switch>
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item label="是否支持手动新增:">
                  <el-switch
                    v-model="productAttr.handAddStatus"
                    :active-value="1"
                    :inactive-value="0"
                    active-text="是"
                    inactive-text="否">
                  </el-switch>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </div>
        
        <div class="form-section">
          <div class="section-header">
            <i class="el-icon-collection-tag"></i>
            <span>属性值设置</span>
          </div>
          
          <div class="section-body">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="属性是否可选:">
                  <el-radio-group v-model="productAttr.selectType" size="medium">
                    <el-radio-button :label="0">唯一</el-radio-button>
                    <el-radio-button :label="1">单选</el-radio-button>
                    <el-radio-button :label="2">复选</el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item label="属性值的录入方式:">
                  <el-radio-group v-model="productAttr.inputType" size="medium">
                    <el-radio-button :label="0">手工录入</el-radio-button>
                    <el-radio-button :label="1">从列表选择</el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item label="属性值可选值列表:" v-if="productAttr.inputType === 1">
              <div class="input-list-container">
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 4, maxRows: 8 }"
                  v-model="inputListFormat"
                  placeholder="每行一个可选值，多个用回车键分隔">
                </el-input>
                <div class="input-list-tips">
                  <i class="el-icon-info"></i>
                  <span>每行一个可选值，多个用回车键分隔</span>
                </div>
                <div class="input-list-preview" v-if="productAttr.inputList">
                  <div class="preview-title">预览：</div>
                  <div class="preview-content">
                    <el-tag
                      v-for="(item, index) in inputListItems"
                      :key="index"
                      size="small"
                      type="info"
                      class="preview-tag">
                      {{item}}
                    </el-tag>
                  </div>
                </div>
              </div>
            </el-form-item>
          </div>
        </div>
        
        <div class="form-footer">
          <el-form-item>
            <el-button type="primary" icon="el-icon-check" @click="onSubmit('productAttrFrom')">提交</el-button>
            <el-button v-if="!isEdit" icon="el-icon-refresh-left" @click="resetForm('productAttrFrom')">重置</el-button>
          </el-form-item>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
  import {fetchList} from '@/api/productAttrCate'
  import {createProductAttr,getProductAttr,updateProductAttr} from '@/api/productAttr'

  const defaultProductAttr = {
    filterType: 0,
    handAddStatus: 0,
    inputList: '',
    inputType: 0,
    name: '',
    productAttributeCategoryId: 0,
    relatedStatus: 0,
    searchType: 0,
    selectType: 0,
    sort: 0,
    type: 0
  };
  export default {
    name: "ProductAttrDetail",
    props: {
      isEdit: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        productAttr: Object.assign({}, defaultProductAttr),
        rules: {
          name: [
            {required: true, message: '请输入属性名称', trigger: 'blur'},
            {min: 2, max: 140, message: '长度在 2 到 140 个字符', trigger: 'blur'}
          ]
        },
        productAttrCateList: null,
        inputListFormat:null
      }
    },
    computed: {
      inputListItems() {
        if (!this.productAttr.inputList) return [];
        return this.productAttr.inputList.split(',').filter(item => item.trim());
      }
    },
    created() {
      if(this.isEdit){
        getProductAttr(this.$route.query.id).then(response => {
          this.productAttr = response.data;
          this.inputListFormat = this.productAttr.inputList.replace(/,/g,'\n');
        });
      }else{
        this.resetProductAttr();
      }
      this.getCateList();
    },
    watch:{
      inputListFormat: function (newValue, oldValue) {
        newValue = newValue.replace(/\n/g,',');
        this.productAttr.inputList = newValue;
      }
    },
    methods: {
      getCateList() {
        let listQuery = {pageNum: 1, pageSize: 100};
        fetchList(listQuery).then(response => {
          this.productAttrCateList = response.data.list;
        });
      },
      resetProductAttr() {
        this.productAttr = Object.assign({}, defaultProductAttr);
        this.productAttr.productAttributeCategoryId = Number(this.$route.query.cid);
        this.productAttr.type = Number(this.$route.query.type);
        this.inputListFormat = '';
      },
      onSubmit(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$confirm('是否提交数据', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              if(this.isEdit){
                updateProductAttr(this.$route.query.id,this.productAttr).then(response=>{
                  this.$message({
                    message: '修改成功',
                    type: 'success',
                    duration: 1000
                  });
                  this.$router.back();
                });
              }else{
                createProductAttr(this.productAttr).then(response=>{
                  this.$message({
                    message: '提交成功',
                    type: 'success',
                    duration: 1000
                  });
                  this.resetForm('productAttrFrom');
                });
              }
            });

          } else {
            this.$message({
              message: '验证失败',
              type: 'error',
              duration: 1000
            });
            return false;
          }
        });
      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
        this.resetProductAttr();
      }
    },
  }
</script>

<style scoped>
  .app-container {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 84px);
  }
  
  .form-container {
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
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
  
  .attr-form {
    margin-top: 10px;
  }
  
  .form-section {
    margin-bottom: 25px;
    border-radius: 6px;
    overflow: hidden;
    background-color: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  }
  
  .section-header {
    padding: 12px 15px;
    background-color: #f8f9fa;
    display: flex;
    align-items: center;
    border-left: 3px solid #409EFF;
  }
  
  .section-header i {
    color: #409EFF;
    margin-right: 8px;
    font-size: 16px;
  }
  
  .section-header span {
    font-size: 15px;
    font-weight: 500;
    color: #303133;
  }
  
  .section-body {
    padding: 20px;
    background-color: #fff;
  }
  
  .input-list-container {
    position: relative;
  }
  
  .input-list-tips {
    margin-top: 5px;
    color: #909399;
    font-size: 12px;
    display: flex;
    align-items: center;
  }
  
  .input-list-tips i {
    margin-right: 5px;
    color: #E6A23C;
  }
  
  .input-list-preview {
    margin-top: 15px;
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 4px;
  }
  
  .preview-title {
    font-size: 13px;
    color: #606266;
    margin-bottom: 8px;
  }
  
  .preview-content {
    display: flex;
    flex-wrap: wrap;
  }
  
  .preview-tag {
    margin: 0 5px 5px 0;
  }
  
  .form-footer {
    margin-top: 30px;
    text-align: center;
    padding-bottom: 10px;
  }
  
  /* 响应式调整 */
  @media screen and (max-width: 992px) {
    .el-form-item {
      margin-bottom: 22px;
    }
  }
</style>
