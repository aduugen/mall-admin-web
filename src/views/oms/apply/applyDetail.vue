<template>
  <div class="detail-container">
    <el-card shadow="never" class="card-container">
      <div class="card-header">
        <i class="el-icon-goods"></i>
        <span class="font-title-medium">退货商品</span>
      </div>
      <el-table
        border
        class="standard-margin"
        ref="productTable"
        :data="productList">
        <el-table-column label="商品图片" width="120" align="center">
          <template slot-scope="scope">
            <div class="image-wrapper">
              <img 
                style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px; cursor: pointer;" 
                :src="scope.row.productPic"
                @click="previewSingleImage(scope.row.productPic)"
                alt="商品图片"
              >
              <div v-if="!scope.row.productPic" class="image-placeholder">
                <i class="el-icon-picture-outline"></i>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="商品名称" align="center">
          <template slot-scope="scope">
            <p class="product-name">{{scope.row.productName}}</p>
            <p class="product-brand">品牌：{{scope.row.productBrand}}</p>
          </template>
        </el-table-column>
        <el-table-column label="价格/货号" width="180" align="center">
          <template slot-scope="scope">
            <p class="price-info">
              <span class="price-label">价格：</span>
              <span class="price-value">￥{{scope.row.productRealPrice || scope.row.productPrice || 0 | formatMoney}}</span>
              <span class="original-price" v-if="scope.row.productRealPrice && scope.row.productPrice && scope.row.productRealPrice != scope.row.productPrice">(原价:￥{{scope.row.productPrice | formatMoney}})</span>
            </p>
            <p class="product-sn">货号：NO.{{scope.row.productId}}</p>
          </template>
        </el-table-column>
        <el-table-column label="属性" width="200" align="center">
          <template slot-scope="scope">
            <span v-html="formatProductAttrDisplay(scope.row.productAttr)"></span>
          </template>
        </el-table-column>
        <el-table-column label="数量" width="120" align="center">
          <template slot-scope="scope">
            <p class="quantity-info">
              <span class="quantity-label">退货:</span>
              <span class="quantity-value return">{{scope.row.returnQuantity || 0}}</span>
            </p>
            <p class="quantity-info" v-if="scope.row.productQuantity && scope.row.returnQuantity != scope.row.productQuantity">
              <span class="quantity-label">购买:</span>
              <span class="quantity-value">{{scope.row.productQuantity}}</span>
            </p>
          </template>
        </el-table-column>
        <el-table-column label="退货原因" prop="returnReason" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-tag size="small" type="info" v-if="scope.row.returnReason">{{ scope.row.returnReason }}</el-tag>
            <span v-else>无</span>
          </template>
        </el-table-column>
        <el-table-column label="凭证图片" width="100" align="center">
          <template slot-scope="scope">
            <div v-if="getProofPicsArray(scope.row.proofPics).length > 0">
              <img 
                v-for="(picUrl, index) in getProofPicsArray(scope.row.proofPics)"
                :key="index"
                :src="picUrl"
                style="width: 60px; height: 60px; margin: 2px; border-radius: 4px; object-fit: cover; cursor: pointer;" 
                @click="previewSingleImage(picUrl)" 
              />
              <div v-if="getProofPicsArray(scope.row.proofPics).length > 1" class="font-extra-small color-info">
                (共 {{ getProofPicsArray(scope.row.proofPics).length }} 张)
              </div>
            </div>
            <span v-else>无</span>
          </template>
        </el-table-column>
        <el-table-column label="小计" width="120" align="center">
          <template slot-scope="scope">
            <span class="price-value">￥{{(scope.row.productRealPrice || 0) * (scope.row.returnQuantity || 0) | formatMoney}}</span>
          </template>
        </el-table-column>
      </el-table>
      <div class="total-amount">
        <span class="font-title-medium">合计退款：</span>
        <span class="font-title-medium color-danger">￥{{calculatedTotalAmount | formatMoney}}</span>
      </div>
    </el-card>
    
    <el-card shadow="never" class="standard-margin card-container">
      <div class="card-header">
        <i class="el-icon-document"></i>
        <span class="font-title-medium">售后单信息</span>
      </div>
      
      <!-- 售后单基本信息 -->
      <div class="info-section">
        <div class="info-card-wrapper">
          <div class="info-card">
            <div class="info-card-header">
              <i class="el-icon-tickets"></i>
              <span>单据信息</span>
            </div>
            <div class="info-card-content">
              <div class="info-item">
                <div class="info-label">售后单号</div>
                <div class="info-value"><span>{{orderReturnApply.id}}</span></div>
              </div>
              <div class="info-item">
                <div class="info-label">申请状态</div>
                <div class="info-value">
                  <el-tag :type="getStatusType(orderReturnApply.status)">
                    {{orderReturnApply.status | formatStatus}}
                  </el-tag>
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">申请时间</div>
                <div class="info-value">{{orderReturnApply.createTime | formatTime}}</div>
              </div>
            </div>
          </div>
          
          <div class="info-card">
            <div class="info-card-header">
              <i class="el-icon-user"></i>
              <span>用户信息</span>
            </div>
            <div class="info-card-content">
              <div class="info-item">
                <div class="info-label">会员账号</div>
                <div class="info-value">{{orderReturnApply.memberId}}</div>
              </div>
              <div class="info-item" v-if="orderReturnApply.memberNickname">
                <div class="info-label">会员昵称</div>
                <div class="info-value">{{orderReturnApply.memberNickname}}</div>
              </div>
              <div class="info-item" v-if="orderReturnApply.memberPhone">
                <div class="info-label">联系方式</div>
                <div class="info-value">{{orderReturnApply.memberPhone}}</div>
              </div>
            </div>
          </div>
          
          <div class="info-card">
            <div class="info-card-header">
              <i class="el-icon-shopping-cart-full"></i>
              <span>订单信息</span>
            </div>
            <div class="info-card-content">
              <div class="info-item">
                <div class="info-label">订单号</div>
                <div class="info-value">{{orderReturnApply.orderSn}}</div>
              </div>
              <div class="info-item">
                <div class="info-label">订单总金额</div>
                <div class="info-value price-value">￥{{orderReturnApply.orderTotalAmount | formatMoney}}</div>
              </div>
              <div class="info-item">
                <div class="info-label">查看订单</div>
                <div class="info-value">
                  <el-button type="primary" size="mini" plain icon="el-icon-view" @click="handleViewOrder">查看详情</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 退款金额部分 -->
        <div class="refund-section">
          <div class="refund-card">
            <div class="refund-card-title">
              <i class="el-icon-money"></i>
              <span>退款金额</span>
            </div>
            <div class="refund-card-content">
              <div class="refund-amount">
                <span class="refund-label">系统计算金额：</span>
                <span class="refund-value">￥{{calculatedTotalAmount | formatMoney}}</span>
              </div>
              <div class="refund-input">
                <span class="refund-label">确认退款金额：</span>
                <span class="price-value">￥</span>
                <el-input 
                  size="small" 
                  v-model="updateStatusParam.returnAmount"
                  :disabled="orderReturnApply.status!==0"
                  style="width:200px;margin-left: 5px">
                </el-input>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 收货信息部分 -->
        <div class="address-section" v-show="orderReturnApply.status!==3">
          <div class="address-card">
            <div class="address-card-title">
              <i class="el-icon-location"></i>
              <span>收货信息</span>
            </div>
            <div class="address-card-content">
              <div class="address-select" v-show="orderReturnApply.status===0">
                <span class="address-label">选择收货点：</span>
                <el-select 
                  size="small"
                  style="width: 200px"
                  :disabled="orderReturnApply.status!==0"
                  v-model="updateStatusParam.companyAddressId">
                  <el-option 
                    v-for="address in companyAddressList"
                    :key="address.id"
                    :value="address.id"
                    :label="address.addressName">
                  </el-option>
                </el-select>
              </div>
              
              <div class="address-info">
                <div class="address-item">
                  <span class="address-info-label">收货人：</span>
                  <span class="address-info-value">{{currentAddress ? currentAddress.name : '加载中...'}}</span>
                </div>
                <div class="address-item">
                  <span class="address-info-label">所在地区：</span>
                  <span class="address-info-value">{{currentAddress | formatRegion}}</span>
                </div>
                <div class="address-item">
                  <span class="address-info-label">详细地址：</span>
                  <span class="address-info-value">{{currentAddress ? currentAddress.detailAddress : '加载中...'}}</span>
                </div>
                <div class="address-item">
                  <span class="address-info-label">联系电话：</span>
                  <span class="address-info-value">{{currentAddress ? currentAddress.phone : '加载中...'}}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 处理信息 -->
        <div class="process-section" v-show="orderReturnApply.status!==0">
          <div class="process-card">
            <div class="process-card-title">
              <i class="el-icon-s-operation"></i>
              <span>处理信息</span>
            </div>
            <div class="process-card-content">
              <div class="process-item">
                <span class="process-info-label">处理人员：</span>
                <span class="process-info-value">{{orderReturnApply.handleMan || '未处理'}}</span>
              </div>
              <div class="process-item">
                <span class="process-info-label">处理时间：</span>
                <span class="process-info-value">{{orderReturnApply.handleTime | formatTime}}</span>
              </div>
              <div class="process-item">
                <span class="process-info-label">处理备注：</span>
                <span class="process-info-value">{{orderReturnApply.handleNote || '无'}}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 收货信息 -->
        <div class="receive-section" v-show="orderReturnApply.status===2">
          <div class="receive-card">
            <div class="receive-card-title">
              <i class="el-icon-box"></i>
              <span>收货信息</span>
            </div>
            <div class="receive-card-content">
              <div class="receive-item">
                <span class="receive-info-label">收货人员：</span>
                <span class="receive-info-value">{{orderReturnApply.receiveMan || '未指定'}}</span>
              </div>
              <div class="receive-item">
                <span class="receive-info-label">收货时间：</span>
                <span class="receive-info-value">{{orderReturnApply.receiveTime | formatTime}}</span>
              </div>
              <div class="receive-item">
                <span class="receive-info-label">收货备注：</span>
                <span class="receive-info-value">{{orderReturnApply.receiveNote || '无'}}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 备注输入 -->
        <div class="remark-section" v-show="orderReturnApply.status===0">
          <div class="remark-card">
            <div class="remark-card-title">
              <i class="el-icon-edit-outline"></i>
              <span>处理备注</span>
            </div>
            <div class="remark-card-content">
              <el-input 
                type="textarea" 
                :rows="3" 
                size="small" 
                v-model="updateStatusParam.handleNote" 
                placeholder="请输入处理备注" 
                style="width: 100%">
              </el-input>
            </div>
          </div>
        </div>
        
        <div class="remark-section" v-show="orderReturnApply.status===1">
          <div class="remark-card">
            <div class="remark-card-title">
              <i class="el-icon-edit-outline"></i>
              <span>收货备注</span>
            </div>
            <div class="remark-card-content">
              <el-input 
                type="textarea" 
                :rows="3" 
                size="small" 
                v-model="updateStatusParam.receiveNote" 
                placeholder="请输入收货备注" 
                style="width: 100%">
              </el-input>
            </div>
          </div>
        </div>
        
        <!-- 按钮区域 -->
        <div class="action-buttons" v-show="orderReturnApply.status===0">
          <el-button type="primary" size="small" icon="el-icon-check" @click="handleUpdateStatus(1)">确认退货</el-button>
          <el-button type="danger" size="small" icon="el-icon-close" @click="handleUpdateStatus(3)">拒绝退货</el-button>
        </div>
        <div class="action-buttons" v-show="orderReturnApply.status===1">
          <el-button type="primary" size="small" icon="el-icon-check" @click="handleUpdateStatus(2)">确认收货</el-button>
        </div>
        
      </div>
    </el-card>
  </div>
</template>
<script>
  import {getApplyDetail,updateApplyStatus} from '@/api/returnApply';
  import {fetchList} from '@/api/companyAddress';
  import {formatDate} from '@/utils/date';

  const defaultUpdateStatusParam = {
    companyAddressId: null,
    handleMan: 'admin',
    handleNote: null,
    receiveMan: 'admin',
    receiveNote: null,
    returnAmount: 0,
    status: 0
  };
  const defaultOrderReturnApply = {
    id: null,
    orderId: null,
    companyAddressId: null,
    orderSn: null,
    createTime: null,
    memberUsername: null,
    memberNickname: null,
    memberPhone: null,
    returnAmount: null,
    returnName: null,
    returnPhone: null,
    status: null,
    handleTime: null,
    description: null,
    handleNote: null,
    handleMan: null,
    receiveMan: null,
    receiveTime: null,
    receiveNote: null,
    orderTotalAmount: null
  };
  export default {
    name: 'returnApplyDetail',
    data() {
      return {
        id: null,
        orderReturnApply: Object.assign({}, defaultOrderReturnApply),
        productList: null,
        updateStatusParam: Object.assign({}, defaultUpdateStatusParam),
        companyAddressList: []
      }
    },
    created() {
      this.id = this.$route.query.id;
      this.getDetail();
    },
    computed: {
      calculatedTotalAmount() {
        if (!this.productList) {
          return 0;
        }
        let total = this.productList.reduce((sum, item) => {
          const price = item.productRealPrice || 0;
          const quantity = item.returnQuantity || 0;
          return sum + (price * quantity);
        }, 0);
        return total;
      },
      currentAddress() {
        let id = this.updateStatusParam.companyAddressId;
        let address = null;
        if(this.companyAddressList==null||this.companyAddressList.length===0) return address;
        for(let i=0;i<this.companyAddressList.length;i++){
          if(this.companyAddressList[i].id===id){
            address=this.companyAddressList[i];
            break;
          }
        }
        return address;
      }
    },
    filters: {
      formatStatus(status) {
        if (status === 0) {
          return "待处理";
        } else if (status === 1) {
          return "退货中";
        } else if (status === 2) {
          return "已完成";
        } else {
          return "已拒绝";
        }
      },
      formatTime(time) {
        if (time == null || time === '') {
          return 'N/A';
        }
        let date = new Date(time);
        return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
      },
      formatRegion(address) {
        if (!address) return '';
        let str = address.province;
        if (address.city != null) {
          str += "  " + address.city;
        }
        str += "  " + address.region;
        return str;
      },
      formatMoney(value) {
        if (!value) return '0.00';
        return parseFloat(value).toFixed(2);
      }
    },
    methods: {
      getStatusType(status) {
        switch(status) {
          case 0: return 'warning';
          case 1: return 'primary';
          case 2: return 'success';
          case 3: return 'danger';
          default: return 'info';
        }
      },
      formatProductAttr(jsonAttr) {
        if (!jsonAttr || jsonAttr === '[]') return '';
        try {
          let attrArr = JSON.parse(jsonAttr);
          return attrArr.map(item => `${item.key}:${item.value}`).join('; ');
        } catch (e) {
          return jsonAttr;
        }
      },
      formatProductAttrDisplay(jsonAttr) {
        if (!jsonAttr || jsonAttr === '[]') return '无规格';
        try {
          let attrArr = JSON.parse(jsonAttr);
          if (attrArr.length === 0) return '无规格';
          return attrArr.map(item => `<span class="attr-item">${item.key}: <strong>${item.value}</strong></span>`).join('<br>');
        } catch (e) {
          return jsonAttr;
        }
      },
      getProofPicsArray(picsStr) {
        if (!picsStr || typeof picsStr !== 'string') {
            return [];
        }
        return picsStr.split(',').filter(pic => pic && pic.trim() !== '');
      },
      previewSingleImage(url) {
        if (url) {
          window.open(url, '_blank');
        } else {
          this.$message.warning('无效的图片链接');
        }
      },
      handleViewOrder() {
        if (!this.orderReturnApply || !this.orderReturnApply.orderId) {
            this.$message.warning('无法获取订单ID');
            return;
        }
        this.$router.push({path:'/oms/orderDetail', query:{id:this.orderReturnApply.orderId}});
      },
      getDetail() {
        getApplyDetail(this.id).then(response => {
          this.orderReturnApply = response.data;
          this.productList = response.data.afterSaleItemList || [];
          console.log("response.data",response.data);
          console.log("this.productList",this.productList);
          this.updateStatusParam.returnAmount = this.calculatedTotalAmount.toFixed(2);
          this.getCompanyAddressList();
        }).catch(error => {
            console.error("获取售后详情失败:", error);
            this.$message.error("获取售后详情失败，请稍后重试");
        });
      },
      getCompanyAddressList() {
        fetchList().then(response => {
          this.companyAddressList = response.data || [];
          if(this.companyAddressList.length > 0 && !this.updateStatusParam.companyAddressId){
             let defaultAddress = this.companyAddressList.find(addr => addr.receiveStatus === 1);
             this.updateStatusParam.companyAddressId = defaultAddress ? defaultAddress.id : this.companyAddressList[0].id;
          }
        }).catch(error => {
            console.error("获取公司地址列表失败:", error);
        });
      },
      handleUpdateStatus(status) {
        this.updateStatusParam.status = status;
        this.$confirm('是否要进行此操作?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if(status === 1 || status === 3) {
             this.updateStatusParam.handleMan = this.$store.getters.name || 'admin';
          } else if (status === 2) {
             this.updateStatusParam.receiveMan = this.$store.getters.name || 'admin';
          }
          
          updateApplyStatus(this.id, this.updateStatusParam).then(response => {
            this.$message({
              message: '操作成功！',
              type: 'success',
              duration: 1000
            });
            this.$router.back();
          }).catch(error => {
            console.error("更新售后状态失败:", error);
            this.$message.error("更新售后状态失败，请稍后重试");
          });
        }).catch(() => {
        });
      }
    }
  }
</script>
<style scoped>
  .detail-container {
    width: 80%;
    padding: 20px 20px 20px 20px;
    margin: 20px auto;
  }

  .card-container {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    transition: all 0.3s;
  }
  
  .card-container:hover {
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.2);
  }
  
  .card-header {
    border-bottom: 1px solid #ebeef5;
    padding-bottom: 15px;
    margin-bottom: 15px;
    font-weight: bold;
    color: #303133;
  }
  
  .card-header i {
    margin-right: 8px;
    font-size: 18px;
    color: #409EFF;
  }

  .standard-margin {
    margin-top: 15px;
  }
  
  /* 卡片式信息样式 */
  .info-section {
    padding: 10px 0;
  }
  
  .info-card-wrapper {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -10px;
  }
  
  .info-card {
    flex: 1;
    min-width: 250px;
    margin: 0 10px 20px 10px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    transition: all 0.3s;
    background-color: #fff;
  }
  
  .info-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
  
  .info-card-header {
    display: flex;
    align-items: center;
    padding: 12px 15px;
    background-color: #f5f7fa;
    border-bottom: 1px solid #ebeef5;
    color: #303133;
    font-weight: 500;
  }
  
  .info-card-header i {
    margin-right: 8px;
    color: #409EFF;
  }
  
  .info-card-content {
    padding: 12px 15px;
  }
  
  .info-item {
    display: flex;
    margin-bottom: 10px;
  }
  
  .info-item:last-child {
    margin-bottom: 0;
  }
  
  .info-label {
    width: 80px;
    color: #606266;
    flex-shrink: 0;
    font-size: 13px;
  }
  
  .info-value {
    flex: 1;
    color: #303133;
    font-size: 13px;
    word-break: break-all;
  }
  
  /* 退款金额部分 */
  .refund-section, 
  .address-section, 
  .process-section, 
  .receive-section,
  .remark-section {
    margin-top: 20px;
  }
  
  .refund-card,
  .address-card,
  .process-card,
  .receive-card,
  .remark-card {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    background-color: #fff;
  }
  
  .refund-card-title,
  .address-card-title,
  .process-card-title,
  .receive-card-title,
  .remark-card-title {
    display: flex;
    align-items: center;
    padding: 12px 15px;
    background-color: #f5f7fa;
    border-bottom: 1px solid #ebeef5;
    color: #303133;
    font-weight: 500;
  }
  
  .refund-card-title i,
  .address-card-title i,
  .process-card-title i,
  .receive-card-title i,
  .remark-card-title i {
    margin-right: 8px;
    color: #409EFF;
  }
  
  .refund-card-content,
  .address-card-content,
  .process-card-content,
  .receive-card-content,
  .remark-card-content {
    padding: 15px;
  }
  
  .refund-amount,
  .refund-input {
    margin-bottom: 15px;
  }
  
  .refund-label {
    display: inline-block;
    width: 110px;
    font-size: 13px;
    color: #606266;
  }
  
  .refund-value {
    font-size: 14px;
    color: #f56c6c;
    font-weight: 500;
  }
  
  /* 地址信息 */
  .address-select {
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px dashed #ebeef5;
  }
  
  .address-label {
    display: inline-block;
    width: 110px;
    font-size: 13px;
    color: #606266;
  }
  
  .address-info {
    display: flex;
    flex-wrap: wrap;
  }
  
  .address-item {
    width: 50%;
    margin-bottom: 10px;
    font-size: 13px;
  }
  
  .address-info-label {
    color: #606266;
    margin-right: 5px;
  }
  
  .address-info-value {
    color: #303133;
  }
  
  /* 处理信息和收货信息 */
  .process-item,
  .receive-item {
    margin-bottom: 10px;
    font-size: 13px;
  }
  
  .process-info-label,
  .receive-info-label {
    display: inline-block;
    width: 80px;
    color: #606266;
  }
  
  .process-info-value,
  .receive-info-value {
    color: #303133;
  }
  
  /* 操作按钮 */
  .action-buttons {
    margin-top: 20px;
    text-align: center;
    padding: 15px 0;
    background-color: #f8f8f8;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  /* 其他样式保持不变 */
  .price-info, .quantity-info {
    margin: 5px 0;
    line-height: 1.5;
  }
  
  .price-label, .quantity-label {
    color: #666;
    font-size: 12px;
    margin-right: 4px;
  }

  .price-value {
    color: #f56c6c;
    font-weight: bold;
  }

  .original-price {
    color: #999;
    font-size: 12px;
    text-decoration: line-through;
    margin-left: 5px;
  }

  .quantity-value {
    font-weight: bold;
  }
  
  .quantity-value.return {
      color: #E6A23C;
  }
  
  .attr-item {
      display: block;
      margin-bottom: 4px;
      line-height: 1.4;
      text-align: left;
      padding-left: 10px;
      border-left: 2px solid #ebeef5;
  }
  
  .color-danger {
      color: #f56c6c;
  }
  
  .color-info {
      color: #909399;
  }
  
  .font-extra-small {
      font-size: 10px;
      display: block;
      text-align: center;
  }

  .image-placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: #f5f7fa;
    color: #909399;
    font-size: 14px;
  }
  
  .image-wrapper {
    position: relative;
    width: 80px;
    height: 80px;
    margin: 0 auto;
    cursor: pointer;
  }
  
  .image-wrapper img {
    display: block;
    border: 1px solid #ebeef5;
    transition: all 0.3s;
  }
  
  .image-wrapper img:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  .el-icon-picture-outline {
    font-size: 28px;
  }
  
  .total-amount {
    float: right;
    margin-top: 15px;
    margin-bottom: 15px;
    padding: 8px 15px;
    background-color: #f8f8f8;
    border-radius: 4px;
    border-left: 3px solid #f56c6c;
  }
  
  .product-name {
    font-weight: 500;
    margin-bottom: 5px;
  }
  
  .product-brand {
    color: #606266;
    font-size: 12px;
  }
  
  .product-sn {
    color: #909399;
    font-size: 12px;
  }
</style>


