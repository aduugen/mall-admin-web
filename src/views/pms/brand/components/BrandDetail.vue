<template> 
  <div class="app-container">
    <el-card class="form-container" shadow="hover">
      <div slot="header" class="clearfix">
        <span class="card-title">
          <i class="el-icon-edit"></i> 
          {{ isEdit ? '编辑' : '添加' }}品牌
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
        :model="brand" 
        :rules="rules" 
        ref="brandFrom" 
        label-width="150px"
        class="brand-form"
        status-icon>
        
        <div class="form-section">
          <div class="section-header">
            <i class="el-icon-info"></i>
            <span>基本信息</span>
          </div>
          
          <div class="section-body">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="品牌名称：" prop="name">
                  <el-input 
                    v-model="brand.name" 
                    placeholder="请输入品牌名称"
                    clearable>
                  </el-input>
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item label="品牌首字母：">
                  <el-input 
                    v-model="brand.firstLetter"
                    placeholder="请输入品牌首字母" 
                    maxlength="1"
                    show-word-limit
                    style="text-transform: uppercase;">
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="排序：" prop="sort">
                  <el-input-number 
                    v-model="brand.sort" 
                    :min="0" 
                    :max="1000"
                    controls-position="right" 
                    style="width: 100%">
                  </el-input-number>
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item label="品牌状态：" class="switch-container">
                  <div class="switch-item">
                    <span class="switch-label">是否显示：</span>
                    <el-switch
                      v-model="brand.showStatus"
                      :active-value="1"
                      :inactive-value="0"
                      active-color="#13ce66"
                      inactive-color="#ff4949"
                      active-text="是"
                      inactive-text="否">
                    </el-switch>
                  </div>
                  <div class="switch-item">
                    <span class="switch-label">品牌制造商：</span>
                    <el-switch
                      v-model="brand.factoryStatus"
                      :active-value="1"
                      :inactive-value="0"
                      active-color="#13ce66"
                      inactive-color="#ff4949"
                      active-text="是"
                      inactive-text="否">
                    </el-switch>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </div>
        
        <div class="form-section">
          <div class="section-header">
            <i class="el-icon-picture"></i>
            <span>品牌图片</span>
          </div>
          
          <div class="section-body">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="品牌LOGO：" prop="logo">
                  <div class="upload-container">
                    <single-upload v-model="brand.logo"></single-upload>
                    <div class="upload-tip">
                      品牌LOGO将显示在商品列表等位置，建议尺寸200*200像素
                    </div>
                  </div>
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item label="品牌专区大图：">
                  <div class="upload-container">
                    <single-upload v-model="brand.bigPic"></single-upload>
                    <div class="upload-tip">
                      品牌专区大图将显示在品牌专区，建议尺寸1000*400像素
                    </div>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </div>
        
        <div class="form-section">
          <div class="section-header">
            <i class="el-icon-document"></i>
            <span>品牌故事</span>
          </div>
          
          <div class="section-body">
            <el-form-item label="品牌故事：">
              <el-input
                type="textarea"
                :rows="4"
                placeholder="请输入品牌故事"
                v-model="brand.brandStory">
              </el-input>
              <div class="form-tip">
                <i class="el-icon-info"></i>
                品牌故事将显示在品牌专区，请简要描述品牌的历史、文化等信息
              </div>
            </el-form-item>
          </div>
        </div>
        
        <div class="form-footer">
          <el-form-item>
            <el-button type="primary" icon="el-icon-check" @click="onSubmit('brandFrom')">提交</el-button>
            <el-button v-if="!isEdit" icon="el-icon-refresh-left" @click="resetForm('brandFrom')">重置</el-button>
          </el-form-item>
        </div>
      </el-form>
    </el-card>
  </div>
</template>
<script>
  import {createBrand, getBrand, updateBrand} from '@/api/brand'
  import SingleUpload from '@/components/Upload/singleUpload'
  const defaultBrand={
    bigPic: '',
    brandStory: '',
    factoryStatus: 0,
    firstLetter: '',
    logo: '',
    name: '',
    showStatus: 0,
    sort: 0
  };
  export default {
    name: 'BrandDetail',
    components:{SingleUpload},
    props: {
      isEdit: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        brand:Object.assign({}, defaultBrand),
        rules: {
          name: [
            {required: true, message: '请输入品牌名称', trigger: 'blur'},
            {min: 2, max: 140, message: '长度在 2 到 140 个字符', trigger: 'blur'}
          ],
          logo: [
            {required: true, message: '请输入品牌logo', trigger: 'blur'}
          ],
          sort: [
            {type: 'number', message: '排序必须为数字'}
          ],
        }
      }
    },
    created() {
      if (this.isEdit) {
        getBrand(this.$route.query.id).then(response => {
          this.brand = response.data;
        });
      }else{
        this.brand = Object.assign({},defaultBrand);
      }
    },
    methods: {
      onSubmit(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$confirm('是否提交数据', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              if (this.isEdit) {
                updateBrand(this.$route.query.id, this.brand).then(response => {
                  this.$refs[formName].resetFields();
                  this.$message({
                    message: '修改成功',
                    type: 'success',
                    duration:1000
                  });
                  this.$router.back();
                });
              } else {
                createBrand(this.brand).then(response => {
                  this.$refs[formName].resetFields();
                  this.brand = Object.assign({},defaultBrand);
                  this.$message({
                    message: '提交成功',
                    type: 'success',
                    duration:1000
                  });
                });
              }
            });

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
      resetForm(formName) {
        this.$refs[formName].resetFields();
        this.brand = Object.assign({},defaultBrand);
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
  
  .brand-form {
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
  
  .switch-container {
    display: flex;
    flex-direction: column;
  }
  
  .switch-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .switch-item:last-child {
    margin-bottom: 0;
  }
  
  .switch-label {
    margin-right: 10px;
    color: #606266;
  }
  
  .upload-container {
    display: flex;
    flex-direction: column;
  }
  
  .upload-tip {
    margin-top: 8px;
    color: #909399;
    font-size: 12px;
    line-height: 1.5;
  }
  
  .form-tip {
    margin-top: 8px;
    color: #909399;
    font-size: 12px;
    display: flex;
    align-items: flex-start;
    line-height: 1.5;
  }
  
  .form-tip i {
    color: #E6A23C;
    margin-right: 5px;
    font-size: 14px;
    margin-top: 1px;
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


