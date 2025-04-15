<template>
  <div class="app-container">
    <el-card class="form-container" shadow="hover">
      <div class="form-header">
        <div class="form-title">
          <i class="el-icon-edit"></i>
          <span>{{isEdit ? '编辑广告' : '添加广告'}}</span>
        </div>
        <div class="form-tools">
          <el-button @click="$router.back()" size="small" icon="el-icon-back">返回</el-button>
        </div>
      </div>
      
      <el-form :model="homeAdvertise"
               :rules="rules"
               ref="homeAdvertiseFrom"
               label-width="120px"
               size="small"
               class="advertise-form">
        
        <!-- 基本信息 -->
        <div class="form-section">
          <div class="section-header">
            <i class="el-icon-info"></i>
            <span>基本信息</span>
          </div>
          <div class="section-content">
            <el-form-item label="广告名称：" prop="name">
              <el-input v-model="homeAdvertise.name" class="input-width" placeholder="请输入广告名称"></el-input>
            </el-form-item>
            <el-form-item label="广告位置：">
              <el-select v-model="homeAdvertise.type" class="input-width" placeholder="请选择广告位置">
                <el-option
                  v-for="type in typeOptions"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="排序：">
              <el-input-number v-model="homeAdvertise.sort" :min="0" :max="999" class="input-width"></el-input-number>
            </el-form-item>
          </div>
        </div>

        <!-- 时间设置 -->
        <div class="form-section">
          <div class="section-header">
            <i class="el-icon-time"></i>
            <span>时间设置</span>
          </div>
          <div class="section-content">
            <el-form-item label="开始时间：" prop="startTime">
              <el-date-picker
                v-model="homeAdvertise.startTime"
                type="datetime"
                class="input-width"
                placeholder="选择开始时间"
                value-format="yyyy-MM-dd HH:mm:ss">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="到期时间：" prop="endTime">
              <el-date-picker
                v-model="homeAdvertise.endTime"
                type="datetime"
                class="input-width"
                placeholder="选择到期时间"
                value-format="yyyy-MM-dd HH:mm:ss">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="上线状态：">
              <el-radio-group v-model="homeAdvertise.status">
                <el-radio :label="1" class="status-radio">
                  <i class="el-icon-success"></i> 上线
                </el-radio>
                <el-radio :label="0" class="status-radio">
                  <i class="el-icon-error"></i> 下线
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
        </div>

        <!-- 内容设置 -->
        <div class="form-section">
          <div class="section-header">
            <i class="el-icon-picture"></i>
            <span>内容设置</span>
          </div>
          <div class="section-content">
            <el-form-item label="广告图片：" prop="pic">
              <single-upload v-model="homeAdvertise.pic" class="upload-container"></single-upload>
              <div class="upload-tip">建议尺寸：1920x500px，支持jpg、png格式</div>
            </el-form-item>
            <el-form-item label="广告链接：" prop="url">
              <el-input v-model="homeAdvertise.url" class="input-width" placeholder="请输入广告链接"></el-input>
            </el-form-item>
            <el-form-item label="广告备注：">
              <el-input
                class="input-width"
                type="textarea"
                :rows="4"
                placeholder="请输入广告备注信息"
                v-model="homeAdvertise.note">
              </el-input>
            </el-form-item>
          </div>
        </div>

        <!-- 表单操作按钮 -->
        <div class="form-actions">
          <el-button type="primary" @click="onSubmit('homeAdvertiseFrom')" icon="el-icon-check">提交</el-button>
          <el-button v-if="!isEdit" @click="resetForm('homeAdvertiseFrom')" icon="el-icon-refresh">重置</el-button>
          <el-button @click="$router.back()" icon="el-icon-close">取消</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
  import SingleUpload from '@/components/Upload/singleUpload'
  import {createHomeAdvertise, getHomeAdvertise, updateHomeAdvertise} from '@/api/homeAdvertise'
  const defaultTypeOptions = [
    {
      label: 'PC首页轮播',
      value: 0
    },
    {
      label: 'APP首页轮播',
      value: 1
    }
  ];
  const defaultHomeAdvertise = {
    name: null,
    type: 1,
    pic: null,
    startTime: null,
    endTime: null,
    status: 0,
    url: null,
    note: null,
    sort: 0
  };
  export default {
    name: 'HomeAdvertiseDetail',
    components:{SingleUpload},
    props: {
      isEdit: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        homeAdvertise: Object.assign({}, defaultHomeAdvertise),
        rules: {
          name: [
            {required: true, message: '请输入广告名称', trigger: 'blur'},
            {min: 2, max: 140, message: '长度在 2 到 140 个字符', trigger: 'blur'}
          ],
          url: [
            {required: true, message: '请输入广告链接', trigger: 'blur'}
          ],
          startTime: [
            {required: true, message: '请选择开始时间', trigger: 'blur'}
          ],
          endTime: [
            {required: true, message: '请选择到期时间', trigger: 'blur'}
          ],
          pic: [
            {required: true, message: '请选择广告图片', trigger: 'blur'}
          ]
        },
        typeOptions: Object.assign({}, defaultTypeOptions)
      }
    },
    created(){
      if (this.isEdit) {
        getHomeAdvertise(this.$route.query.id).then(response => {
          this.homeAdvertise = Object.assign({}, response.data);
        });
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
                updateHomeAdvertise(this.$route.query.id, this.homeAdvertise).then(response => {
                  this.$refs[formName].resetFields();
                  this.$message({
                    message: '修改成功',
                    type: 'success',
                    duration:1000
                  });
                  this.$router.back();
                });
              } else {
                createHomeAdvertise(this.homeAdvertise).then(response => {
                  this.$refs[formName].resetFields();
                  this.homeAdvertise = Object.assign({},defaultHomeAdvertise);
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
        this.homeAdvertise = Object.assign({},defaultHomeAdvertise);
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

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.form-title {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  display: flex;
  align-items: center;
}

.form-title i {
  margin-right: 8px;
  color: #409EFF;
  font-size: 20px;
}

.form-tools {
  display: flex;
  align-items: center;
}

.form-section {
  margin-bottom: 30px;
  background-color: #fff;
  border-radius: 6px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.section-header {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.section-header i {
  margin-right: 8px;
  color: #409EFF;
  font-size: 18px;
}

.section-content {
  padding-left: 26px;
}

.input-width {
  width: 400px;
}

.status-radio {
  margin-right: 20px;
}

.status-radio i {
  margin-right: 5px;
}

.upload-container {
  margin-bottom: 10px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.form-actions {
  margin-top: 30px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.form-actions .el-button {
  margin: 0 10px;
  min-width: 100px;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .input-width {
    width: 100%;
  }
  
  .form-actions .el-button {
    width: 100%;
    margin: 10px 0;
  }
}
</style>


