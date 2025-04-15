<template>
  <div class="detail-container">
    <el-card shadow="never">
      <span class="font-title-medium">退货商品</span>
      <el-table
        border
        class="standard-margin"
        ref="productTable"
        :data="productList">
        <el-table-column label="商品图片" width="120" align="center">
          <template slot-scope="scope">
            <img style="height:80px" :src="scope.row.productPic">
          </template>
        </el-table-column>
        <el-table-column label="商品名称" align="center">
          <template slot-scope="scope">
            <p>{{scope.row.productName}}</p>
            <p>品牌：{{scope.row.productBrand}}</p>
          </template>
        </el-table-column>
        <el-table-column label="价格/货号" width="180" align="center">
          <template slot-scope="scope">
            <p class="price-info">
              <span class="price-label">价格：</span>
              <span class="price-value">￥{{scope.row.productRealPrice || scope.row.productPrice || 0 | formatMoney}}</span>
              <span class="original-price" v-if="scope.row.productRealPrice && scope.row.productPrice && scope.row.productRealPrice != scope.row.productPrice">(原价:￥{{scope.row.productPrice | formatMoney}})</span>
            </p>
            <p>货号：NO.{{scope.row.productId}}</p>
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
            {{ scope.row.returnReason || '无' }}
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
      <div style="float:right;margin-top:15px;margin-bottom:15px">
        <span class="font-title-medium">合计退款：</span>
        <span class="font-title-medium color-danger">￥{{calculatedTotalAmount | formatMoney}}</span>
      </div>
    </el-card>
    <el-card shadow="never" class="standard-margin">
      <span class="font-title-medium">服务单信息</span>
      <div class="form-container-border">
        <el-row>
          <el-col :span="6" class="form-border form-left-bg font-small">服务单号</el-col>
          <el-col class="form-border font-small" :span="18">{{orderReturnApply.id}}</el-col>
        </el-row>
        <el-row>
          <el-col class="form-border form-left-bg font-small" :span="6">申请状态</el-col>
          <el-col class="form-border font-small" :span="18">{{orderReturnApply.status | formatStatus}}</el-col>
        </el-row>
        <el-row>
          <el-col :span="6" class="form-border form-left-bg font-small" style="line-height: 32px">订单信息</el-col>
          <el-col class="form-border font-small" :span="18">
            <p>订单号：{{orderReturnApply.orderSn}}</p>
            <p v-if="orderReturnApply.orderId">订单ID：{{orderReturnApply.orderId}}</p>
            <el-button type="text" size="small" @click="handleViewOrder">查看订单详情</el-button>
          </el-col>
        </el-row>
        <el-row>
          <el-col class="form-border form-left-bg font-small" :span="6">申请时间</el-col>
          <el-col class="form-border font-small" :span="18">{{orderReturnApply.createTime | formatTime}}</el-col>
        </el-row>
        <el-row>
          <el-col class="form-border form-left-bg font-small" :span="6">用户信息</el-col>
          <el-col class="form-border font-small" :span="18">
            <p>账号：{{orderReturnApply.memberUsername}}</p>
            <p v-if="orderReturnApply.memberNickname">昵称：{{orderReturnApply.memberNickname}}</p>
            <p v-if="orderReturnApply.memberPhone">注册手机：{{orderReturnApply.memberPhone}}</p>
          </el-col>
        </el-row>
        <el-row>
          <el-col class="form-border form-left-bg font-small" :span="6">联系人信息</el-col>
          <el-col class="form-border font-small" :span="18">
            <p>姓名：{{orderReturnApply.returnName}}</p>
            <p>电话：{{orderReturnApply.returnPhone}}</p>
          </el-col>
        </el-row>
        <el-row>
          <el-col class="form-border form-left-bg font-small" :span="6">问题描述</el-col>
          <el-col class="form-border font-small" :span="18">{{orderReturnApply.description || '无'}}</el-col>
        </el-row>
      </div>
      <div class="form-container-border">
        <el-row>
          <el-col class="form-border form-left-bg font-small" :span="6">订单总金额</el-col>
          <el-col class="form-border font-small" :span="18">￥{{orderReturnApply.orderTotalAmount | formatMoney}}</el-col>
        </el-row>
        <el-row>
          <el-col class="form-border form-left-bg font-small" :span="6" style="line-height:32px">确认退款金额</el-col>
          <el-col class="form-border font-small" style="height:52px" :span="18">
            <span class="price-value">￥</span>
            <el-input size="small" v-model="updateStatusParam.returnAmount"
                      :disabled="orderReturnApply.status!==0"
                      style="width:200px;margin-left: 5px"></el-input>
            <span class="font-extra-small color-info" style="margin-left: 10px;">(系统计算合计退款: ￥{{calculatedTotalAmount | formatMoney}})</span>
          </el-col>
        </el-row>
        <div v-show="orderReturnApply.status!==3">
          <el-row>
            <el-col class="form-border form-left-bg font-small" :span="6" style="line-height:32px">选择收货点</el-col>
            <el-col class="form-border font-small" style="height:52px" :span="18">
              <el-select size="small"
                         style="width:200px"
                         :disabled="orderReturnApply.status!==0"
                         v-model="updateStatusParam.companyAddressId">
                <el-option v-for="address in companyAddressList"
                           :key="address.id"
                           :value="address.id"
                           :label="address.addressName">
                </el-option>
              </el-select>
            </el-col>
          </el-row>
          <el-row>
            <el-col class="form-border form-left-bg font-small" :span="6">收货人姓名</el-col>
            <el-col class="form-border font-small" :span="18">{{currentAddress ? currentAddress.name : '加载中...'}}</el-col>
          </el-row>
          <el-row>
            <el-col class="form-border form-left-bg font-small" :span="6">所在区域</el-col>
            <el-col class="form-border font-small" :span="18">{{currentAddress | formatRegion}}</el-col>
          </el-row>
          <el-row>
            <el-col class="form-border form-left-bg font-small" :span="6">详细地址</el-col>
            <el-col class="form-border font-small" :span="18">{{currentAddress ? currentAddress.detailAddress : '加载中...'}}</el-col>
          </el-row>
          <el-row>
            <el-col class="form-border form-left-bg font-small" :span="6">联系电话</el-col>
            <el-col class="form-border font-small" :span="18">{{currentAddress ? currentAddress.phone : '加载中...'}}</el-col>
          </el-row>
        </div>
      </div>
      <div class="form-container-border" v-show="orderReturnApply.status!==0">
        <el-row>
          <el-col class="form-border form-left-bg font-small" :span="6">处理人员</el-col>
          <el-col class="form-border font-small" :span="18">{{orderReturnApply.handleMan || '未处理'}}</el-col>
        </el-row>
        <el-row>
          <el-col class="form-border form-left-bg font-small" :span="6">处理时间</el-col>
          <el-col class="form-border font-small" :span="18">{{orderReturnApply.handleTime | formatTime}}</el-col>
        </el-row>
        <el-row>
          <el-col class="form-border form-left-bg font-small" :span="6">处理备注</el-col>
          <el-col class="form-border font-small" :span="18">{{orderReturnApply.handleNote || '无'}}</el-col>
        </el-row>
      </div>
      <div class="form-container-border" v-show="orderReturnApply.status===2">
        <el-row>
          <el-col class="form-border form-left-bg font-small" :span="6">收货人员</el-col>
          <el-col class="form-border font-small" :span="18">{{orderReturnApply.receiveMan || '未指定'}}</el-col>
        </el-row>
        <el-row>
          <el-col class="form-border form-left-bg font-small" :span="6" >收货时间</el-col>
          <el-col class="form-border font-small" :span="18">{{orderReturnApply.receiveTime | formatTime}}</el-col>
        </el-row>
        <el-row>
          <el-col class="form-border form-left-bg font-small" :span="6">收货备注</el-col>
          <el-col class="form-border font-small" :span="18">{{orderReturnApply.receiveNote || '无'}}</el-col>
        </el-row>
      </div>
      <div class="form-container-border" v-show="orderReturnApply.status===0">
        <el-row>
          <el-col class="form-border form-left-bg font-small" :span="6" style="line-height:32px">处理备注</el-col>
          <el-col class="form-border font-small" :span="18">
            <el-input type="textarea" :rows="3" size="small" v-model="updateStatusParam.handleNote" placeholder="请输入处理备注" style="width:300px"></el-input>
          </el-col>
        </el-row>
      </div>
      <div class="form-container-border" v-show="orderReturnApply.status===1">
        <el-row>
          <el-col class="form-border form-left-bg font-small" :span="6" style="line-height:32px">收货备注</el-col>
          <el-col class="form-border font-small" :span="18">
            <el-input type="textarea" :rows="3" size="small" v-model="updateStatusParam.receiveNote" placeholder="请输入收货备注" style="width:300px"></el-input>
          </el-col>
        </el-row>
      </div>
      <div style="margin-top:15px;text-align: center" v-show="orderReturnApply.status===0">
        <el-button type="primary" size="small" @click="handleUpdateStatus(1)">确认退货</el-button>
        <el-button type="danger" size="small" @click="handleUpdateStatus(3)">拒绝退货</el-button>
      </div>
      <div style="margin-top:15px;text-align: center" v-show="orderReturnApply.status===1">
        <el-button type="primary" size="small" @click="handleUpdateStatus(2)">确认收货</el-button>
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
      },
      previewSingleImage(url) {
        if (url) {
            window.open(url, '_blank');
        }
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

  .standard-margin {
    margin-top: 15px;
  }
  .form-border {
    border-right: 1px solid #DCDFE6;
    border-bottom: 1px solid #DCDFE6;
    padding: 10px;
    min-height: 40px;
    display: flex;
    align-items: center;
  }
  
  .form-container-border .el-row:last-child .form-border{
     border-bottom: none;
  }

  .form-container-border {
    border-left: 1px solid #DCDFE6;
    border-top: 1px solid #DCDFE6;
    margin-top: 15px;
  }

  .form-left-bg {
    background: #F2F6FC;
    justify-content: center;
  }
  
  .form-border p {
      margin: 2px 0;
  }
  
  .price-info p, .quantity-info p {
    margin: 0;
    line-height: 1.4;
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
  }
  
  .proof-pics {
      line-height: normal;
      padding: 5px;
      align-items: flex-start !important;
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

  .image-slot {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: #f5f7fa;
    color: #909399;
    font-size: 14px;
  }

  .el-icon-picture-outline {
    font-size: 28px;
  }
</style>


