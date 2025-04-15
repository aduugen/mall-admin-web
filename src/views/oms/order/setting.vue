<template> 
  <div class="app-container">
    <el-card class="form-container" shadow="hover">
      <div class="settings-header">
        <i class="el-icon-setting"></i>
        <span>订单设置</span>
      </div>
      
      <el-form 
        :model="orderSetting"
        ref="orderSettingForm"
        :rules="rules"
        label-width="150px"
        class="settings-form">
        <div class="setting-item">
          <el-form-item label="秒杀订单超过：" prop="flashOrderOvertime">
            <div class="input-group">
              <el-input v-model="orderSetting.flashOrderOvertime" class="input-width">
                <template slot="append">分</template>
              </el-input>
              <span class="note-text">未付款，订单自动关闭</span>
            </div>
          </el-form-item>
        </div>
        
        <div class="setting-item">
          <el-form-item label="正常订单超过：" prop="normalOrderOvertime">
            <div class="input-group">
              <el-input v-model="orderSetting.normalOrderOvertime" class="input-width">
                <template slot="append">分</template>
              </el-input>
              <span class="note-text">未付款，订单自动关闭</span>
            </div>
          </el-form-item>
        </div>
        
        <div class="setting-item">
          <el-form-item label="发货超过：" prop="confirmOvertime">
            <div class="input-group">
              <el-input v-model="orderSetting.confirmOvertime" class="input-width">
                <template slot="append">天</template>
              </el-input>
              <span class="note-text">未收货，订单自动完成</span>
            </div>
          </el-form-item>
        </div>
        
        <div class="setting-item">
          <el-form-item label="订单完成超过：" prop="finishOvertime">
            <div class="input-group">
              <el-input v-model="orderSetting.finishOvertime" class="input-width">
                <template slot="append">天</template>
              </el-input>
              <span class="note-text">自动结束交易，不能申请售后</span>
            </div>
          </el-form-item>
        </div>
        
        <div class="setting-item">
          <el-form-item label="订单完成超过：" prop="commentOvertime">
            <div class="input-group">
              <el-input v-model="orderSetting.commentOvertime" class="input-width">
                <template slot="append">天</template>
              </el-input>
              <span class="note-text">自动五星好评</span>
            </div>
          </el-form-item>
        </div>
        
        <div class="form-actions">
          <el-form-item>
            <el-button
              @click="confirm('orderSettingForm')"
              type="primary"
              class="submit-button"
              icon="el-icon-check">
              保存设置
            </el-button>
          </el-form-item>
        </div>
      </el-form>
    </el-card>
  </div>
</template>
<script>
  import {getOrderSetting,updateOrderSetting} from '@/api/orderSetting';
  const defaultOrderSetting = {
    id: null,
    flashOrderOvertime: 0,
    normalOrderOvertime: 0,
    confirmOvertime: 0,
    finishOvertime: 0,
    commentOvertime: 0
  };
  const checkTime = (rule, value, callback) => {
    if (!value) {
      return callback(new Error('时间不能为空'));
    }
    console.log("checkTime",value);
    let intValue = parseInt(value);
    if (!Number.isInteger(intValue)) {
      return callback(new Error('请输入数字值'));
    }
    callback();
  };
  export default {
    name: 'orderSetting',
    data() {
      return {
        orderSetting: Object.assign({}, defaultOrderSetting),
        rules: {
          flashOrderOvertime:{validator: checkTime, trigger: 'blur' },
          normalOrderOvertime:{validator: checkTime, trigger: 'blur' },
          confirmOvertime: {validator: checkTime, trigger: 'blur' },
          finishOvertime: {validator: checkTime, trigger: 'blur' },
          commentOvertime:{validator: checkTime, trigger: 'blur' }
        }
      }
    },
    created(){
      this.getDetail();
    },
    methods:{
      confirm(formName){
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$confirm('是否要提交修改?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              updateOrderSetting(1,this.orderSetting).then(response=>{
                this.$message({
                  type: 'success',
                  message: '设置已成功保存!',
                  duration:1000
                });
              })
            });
          } else {
            this.$message({
              message: '提交参数不合法',
              type: 'warning'
            });
            return false;
          }
        });
      },
      getDetail(){
        getOrderSetting(1).then(response=>{
          this.orderSetting=response.data;
        })
      }
    }
  }
</script>
<style scoped>
  .app-container {
    padding: 20px;
  }
  
  .form-container {
    border-radius: 8px;
    transition: all 0.3s;
  }
  
  .settings-header {
    display: flex;
    align-items: center;
    padding-bottom: 20px;
    border-bottom: 1px solid #ebeef5;
    margin-bottom: 20px;
  }
  
  .settings-header i {
    color: #409EFF;
    font-size: 22px;
    margin-right: 10px;
  }
  
  .settings-header span {
    font-size: 18px;
    font-weight: 500;
    color: #303133;
  }
  
  .settings-form {
    padding: 10px;
  }
  
  .setting-item {
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 6px;
    background-color: #f8f9fa;
    transition: all 0.3s;
  }
  
  .setting-item:hover {
    background-color: #ecf5ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  
  .input-group {
    display: flex;
    align-items: center;
  }
  
  .input-width {
    width: 200px;
  }
  
  .note-text {
    margin-left: 15px;
    color: #909399;
    font-size: 13px;
    position: relative;
    padding-left: 20px;
  }
  
  .note-text:before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 16px;
    background-color: #E6A23C;
    border-radius: 2px;
  }
  
  .form-actions {
    padding: 20px 0 0;
    border-top: 1px dashed #ebeef5;
    margin-top: 20px;
    text-align: center;
  }
  
  .submit-button {
    padding: 12px 25px;
    font-size: 14px;
  }
  
  /* 适配不同输入内容的标记颜色 */
  .setting-item:nth-child(1) .note-text:before {
    background-color: #F56C6C;
  }
  
  .setting-item:nth-child(2) .note-text:before {
    background-color: #E6A23C;
  }
  
  .setting-item:nth-child(3) .note-text:before {
    background-color: #409EFF;
  }
  
  .setting-item:nth-child(4) .note-text:before {
    background-color: #67C23A;
  }
  
  .setting-item:nth-child(5) .note-text:before {
    background-color: #909399;
  }
</style>


