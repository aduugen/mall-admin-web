<template>
  <div class="product-sale-container">
    <el-form :model="value" ref="productSaleForm" label-width="120px" class="form-inner-container" size="small">
      <!-- 积分与上架设置 -->
      <div class="form-section">
        <div class="section-header">
          <i class="el-icon-medal-1"></i>
          <span>积分与上架设置</span>
        </div>
        <div class="section-body">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="赠送积分：">
                <el-input v-model="value.giftPoint" placeholder="请输入赠送积分"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="赠送成长值：">
                <el-input v-model="value.giftGrowth" placeholder="请输入赠送成长值"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="积分限制：">
                <el-input v-model="value.usePointLimit" placeholder="请输入使用积分限制"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="上架状态：">
                <div class="switch-container">
                  <div class="switch-item">
                    <span>预告商品</span>
                    <el-switch
                      v-model="value.previewStatus"
                      :active-value="1"
                      :inactive-value="0">
                    </el-switch>
                  </div>
                  <div class="switch-item">
                    <span>商品上架</span>
                    <el-switch
                      v-model="value.publishStatus"
                      :active-value="1"
                      :inactive-value="0">
                    </el-switch>
                  </div>
                  <div class="switch-item">
                    <span>新品</span>
                    <el-switch
                      v-model="value.newStatus"
                      :active-value="1"
                      :inactive-value="0">
                    </el-switch>
                  </div>
                  <div class="switch-item">
                    <span>推荐</span>
                    <el-switch
                      v-model="value.recommandStatus"
                      :active-value="1"
                      :inactive-value="0">
                    </el-switch>
                  </div>
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="服务保证：">
            <el-checkbox-group v-model="selectServiceList" class="checkbox-group">
              <el-checkbox :label="1">无忧退货</el-checkbox>
              <el-checkbox :label="2">快速退款</el-checkbox>
              <el-checkbox :label="3">免费包邮</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </div>
      </div>
      
      <!-- 详情页信息设置 -->
      <div class="form-section">
        <div class="section-header">
          <i class="el-icon-document"></i>
          <span>详情页信息设置</span>
        </div>
        <div class="section-body">
          <el-form-item label="详细页标题：">
            <el-input v-model="value.detailTitle" placeholder="请输入详情页标题"></el-input>
          </el-form-item>
          <el-form-item label="详细页描述：">
            <el-input v-model="value.detailDesc" placeholder="请输入详情页描述"></el-input>
          </el-form-item>
          <el-form-item label="商品关键字：">
            <el-input v-model="value.keywords" placeholder="请输入商品关键字，以逗号分隔"></el-input>
          </el-form-item>
          <el-form-item label="商品备注：">
            <el-input v-model="value.note" type="textarea" :autoSize="{minRows: 3, maxRows: 6}" placeholder="请输入商品备注信息"></el-input>
          </el-form-item>
        </div>
      </div>
      
      <!-- 优惠设置 -->
      <div class="form-section">
        <div class="section-header">
          <i class="el-icon-shopping-cart-full"></i>
          <span>优惠设置</span>
        </div>
        <div class="section-body">
          <el-form-item label="优惠方式：">
            <el-radio-group v-model="value.promotionType" size="small" class="promotion-type-group">
              <el-radio-button :label="0">无优惠</el-radio-button>
              <el-radio-button :label="1">特惠促销</el-radio-button>
              <el-radio-button :label="2">会员价格</el-radio-button>
              <el-radio-button :label="3">阶梯价格</el-radio-button>
              <el-radio-button :label="4">满减价格</el-radio-button>
            </el-radio-group>
          </el-form-item>
          
          <!-- 特惠促销 -->
          <div v-show="value.promotionType===1" class="promotion-section">
            <el-form-item label="开始时间：">
              <el-date-picker
                v-model="value.promotionStartTime"
                type="datetime"
                :picker-options="pickerOptions1"
                placeholder="选择开始时间">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="结束时间：">
              <el-date-picker
                v-model="value.promotionEndTime"
                type="datetime"
                :picker-options="pickerOptions1"
                placeholder="选择结束时间">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="促销价格：">
              <el-input style="width: 220px" v-model="value.promotionPrice" placeholder="输入促销价格">
                <template slot="prepend">￥</template>
              </el-input>
            </el-form-item>
          </div>
          
          <!-- 会员价格 -->
          <div v-show="value.promotionType===2" class="promotion-section">
            <div class="member-price-list">
              <div v-for="(item, index) in value.memberPriceList" :key="index" class="member-price-item">
                <span class="member-level">{{item.memberLevelName}}：</span>
                <el-input v-model="item.memberPrice" placeholder="请输入会员价">
                  <template slot="prepend">￥</template>
                </el-input>
              </div>
            </div>
          </div>
          
          <!-- 阶梯价格 -->
          <div v-show="value.promotionType===3" class="promotion-section">
            <el-table :data="value.productLadderList"
                    class="custom-table"
                    border>
              <el-table-column
                label="数量"
                align="center"
                width="120">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.count" placeholder="数量"></el-input>
                </template>
              </el-table-column>
              <el-table-column
                label="折扣"
                align="center"
                width="120">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.discount" placeholder="折扣">
                    <template slot="append">%</template>
                  </el-input>
                </template>
              </el-table-column>
              <el-table-column
                align="center"
                label="操作">
                <template slot-scope="scope">
                  <el-button type="text" @click="handleRemoveProductLadder(scope.$index, scope.row)">删除</el-button>
                  <el-button type="text" @click="handleAddProductLadder(scope.$index, scope.row)">添加</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          
          <!-- 满减价格 -->
          <div v-show="value.promotionType===4" class="promotion-section">
            <el-table :data="value.productFullReductionList"
                    class="custom-table"
                    border>
              <el-table-column
                label="满"
                align="center"
                width="120">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.fullPrice" placeholder="满足金额">
                    <template slot="prepend">￥</template>
                  </el-input>
                </template>
              </el-table-column>
              <el-table-column
                label="立减"
                align="center"
                width="120">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.reducePrice" placeholder="减免金额">
                    <template slot="prepend">￥</template>
                  </el-input>
                </template>
              </el-table-column>
              <el-table-column
                align="center"
                label="操作">
                <template slot-scope="scope">
                  <el-button type="text" @click="handleRemoveFullReduction(scope.$index, scope.row)">删除</el-button>
                  <el-button type="text" @click="handleAddFullReduction(scope.$index, scope.row)">添加</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
      
      <div class="form-footer">
        <el-button size="medium" @click="handlePrev">上一步，填写商品信息</el-button>
        <el-button type="primary" size="medium" @click="handleNext">下一步，填写商品属性</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
  import {fetchList as fetchMemberLevelList} from '@/api/memberLevel'

  export default {
    name: "ProductSaleDetail",
    props: {
      value: Object,
      isEdit: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        //日期选择器配置
        pickerOptions1: {
          disabledDate(time) {
            return time.getTime() < Date.now();
          }
        },
        selectServiceList: []
      }
    },
    created() {
      if (this.isEdit) {
        // this.handleEditCreated();
        if(this.value.serviceIds!=null){
          let serviceIdList = this.value.serviceIds.split(',');
          for(let i=0;i<serviceIdList.length;i++){
            if(serviceIdList[i]==='1'){
              this.selectServiceList.push(1);
            }
            if(serviceIdList[i]==='2'){
              this.selectServiceList.push(2);
            }
            if(serviceIdList[i]==='3'){
              this.selectServiceList.push(3);
            }
          }
        }
      } else {
        fetchMemberLevelList({defaultStatus: 0}).then(response => {
          let memberPriceList = [];
          for (let i = 0; i < response.data.length; i++) {
            let item = response.data[i];
            memberPriceList.push({memberLevelId: item.id, memberLevelName: item.name})
          }
          this.value.memberPriceList = memberPriceList;
        });
      }
    },
    watch: {
      selectServiceList: function (newValue) {
        //服务列表发生变化
        let serviceIds = '';
        for (let i = 0; i < newValue.length; i++) {
          serviceIds += newValue[i] + ',';
        }
        if (serviceIds.length > 0) {
          serviceIds = serviceIds.substr(0, serviceIds.length - 1);
        }
        this.value.serviceIds = serviceIds;
      }
    },
    methods: {
      handlePrev() {
        this.$emit('prevStep')
      },
      handleNext() {
        this.$emit('nextStep')
      },
      //添加阶梯价格
      handleAddProductLadder(index, row) {
        let productLadders = [];
        for (let i = 0; i < this.value.productLadderList.length; i++) {
          productLadders.push(this.value.productLadderList[i]);
        }
        productLadders.push({
          count: 0,
          discount: 0,
          price: 0
        });
        this.value.productLadderList = productLadders;
      },
      //移除阶梯价格
      handleRemoveProductLadder(index, row) {
        let productLadders = [];
        for (let i = 0; i < this.value.productLadderList.length; i++) {
          if (i !== index) {
            productLadders.push(this.value.productLadderList[i]);
          }
        }
        this.value.productLadderList = productLadders;
      },
      //添加满减
      handleAddFullReduction(index, row) {
        let fullReductions = [];
        for (let i = 0; i < this.value.productFullReductionList.length; i++) {
          fullReductions.push(this.value.productFullReductionList[i]);
        }
        fullReductions.push({
          fullPrice: 0,
          reducePrice: 0
        });
        this.value.productFullReductionList = fullReductions;
      },
      //移除满减
      handleRemoveFullReduction(index, row) {
        let fullReductions = [];
        for (let i = 0; i < this.value.productFullReductionList.length; i++) {
          if (i !== index) {
            fullReductions.push(this.value.productFullReductionList[i]);
          }
        }
        this.value.productFullReductionList = fullReductions;
      }
    }
  }
</script>

<style scoped>
  .product-sale-container {
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
  
  .form-footer {
    text-align: center;
    margin-top: 30px;
  }
  
  /* 开关样式 */
  .switch-container {
    display: flex;
    flex-wrap: wrap;
  }
  
  .switch-item {
    display: flex;
    align-items: center;
    margin-right: 40px;
    margin-bottom: 15px;
  }
  
  .switch-item span {
    margin-right: 10px;
    color: #606266;
  }
  
  /* 促销类型 */
  .promotion-type-group {
    margin-bottom: 20px;
  }
  
  .promotion-section {
    background-color: #f9f9f9;
    padding: 15px;
    border-radius: 4px;
    margin-top: 10px;
  }
  
  /* 会员价格 */
  .member-price-list {
    display: flex;
    flex-wrap: wrap;
  }
  
  .member-price-item {
    display: flex;
    align-items: center;
    margin-right: 20px;
    margin-bottom: 15px;
    width: 250px;
  }
  
  .member-level {
    width: 100px;
    color: #606266;
  }
  
  /* 表格样式 */
  .custom-table {
    width: 100%;
    margin-bottom: 20px;
    border-radius: 4px;
    overflow: hidden;
  }
  
  /* 复选框样式 */
  .checkbox-group {
    display: flex;
    flex-wrap: wrap;
  }
  
  .checkbox-group .el-checkbox {
    margin-right: 30px;
    margin-bottom: 10px;
  }
  
  /* 输入框样式 */
  .el-input-group__prepend,
  .el-input-group__append {
    background-color: #f5f7fa;
    color: #909399;
  }
  
  /* 左右按钮 */
  .el-button + .el-button {
    margin-left: 15px;
  }
  
  /* 自适应调整 */
  @media screen and (max-width: 1200px) {
    .member-price-item {
      width: 100%;
      margin-right: 0;
    }
  }
  
  .littleMargin {
    margin-top: 10px;
  }
</style>
