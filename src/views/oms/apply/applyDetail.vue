<template>
  <div class="detail-container">
    <el-card shadow="never" class="card-container" v-loading="listLoading">
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
            <div class="image-wrapper" @mouseenter="handleImageHover(scope.row.productPic)" @mouseleave="handleImageLeave">
              <img 
                style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px; cursor: pointer;" 
                :src="scope.row.productPic"
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
          <template>
            <div v-if="proofList && proofList.length > 0">
              <div 
                v-for="(pic, index) in proofList"
                :key="pic.id || index"
                class="proof-image-wrapper"
                @mouseenter="handleImageHover(pic.picUrl)"
                @mouseleave="handleImageLeave"
              >
                <img 
                  :src="pic.picUrl"
                  style="width: 60px; height: 60px; margin: 2px; border-radius: 4px; object-fit: cover; cursor: pointer;" 
                  @error="handleImageError($event)"
                />
              </div>
              <div v-if="proofList.length > 1" class="font-extra-small color-info">
                (共 {{ proofList.length }} 张)
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
    
    <el-card shadow="never" class="standard-margin card-container" v-loading="listLoading">
      <div class="card-header">
        <i class="el-icon-document"></i>
        <span class="font-title-medium">售后单信息</span>
        
        <!-- 添加回退审核按钮 -->
        <el-button 
          v-if="canRollback"
          type="warning" 
          size="small" 
          class="float-right"
          @click="handleRollback">
          回退审核
        </el-button>
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
            <div class="address-card-content" v-loading="addressLoading">
              <div class="address-select" v-show="orderReturnApply.status===0">
                <span class="address-label">选择收货点：</span>
                <ServicePointSelect
                  v-model="updateStatusParam.servicePointId"
                  @change="handleServicePointChange"
                  :disabled="orderReturnApply.status!==0"
                  style="width: 300px"
                />
              </div>
              
              <!-- 收货点信息显示区域 -->
              <div class="address-info" v-if="selectedServicePoint">
                <div class="address-item">
                  <span class="address-info-label">网点ID：</span>
                  <span class="address-info-value">{{selectedServicePoint.id}}</span>
                </div>
                <div class="address-item">
                  <span class="address-info-label">收货点名称：</span>
                  <span class="address-info-value">{{selectedServicePoint.pointName}}</span>
                </div>
                <div class="address-item">
                  <span class="address-info-label">详细地址：</span>
                  <span class="address-info-value">{{selectedServicePoint.locationAddress}}</span>
                </div>
                <div class="address-item" v-if="selectedServicePoint.contactName">
                  <span class="address-info-label">负责人：</span>
                  <span class="address-info-value">{{selectedServicePoint.contactName}}</span>
                </div>
                <div class="address-item" v-if="selectedServicePoint.contactPhone">
                  <span class="address-info-label">联系电话：</span>
                  <span class="address-info-value">{{selectedServicePoint.contactPhone}}</span>
                </div>
                <div class="address-item" v-if="selectedServicePoint.servicePointType !== null">
                  <span class="address-info-label">网点类型：</span>
                  <span class="address-info-value">
                    <el-tag size="mini" v-if="selectedServicePoint.servicePointType === 1" type="success">收货点</el-tag>
                    <el-tag size="mini" v-if="selectedServicePoint.servicePointType === 2" type="warning">综合点</el-tag>
                  </span>
                </div>
              </div>
              
              <!-- 基础信息显示，当服务点ID和名称存在但未获取到详细信息时 -->
              <div class="address-info" v-else-if="orderReturnApply.servicePointId && orderReturnApply.servicePointName">
                <div class="address-item">
                  <span class="address-info-label">收货点ID：</span>
                  <span class="address-info-value">{{orderReturnApply.servicePointId}}</span>
                </div>
                <div class="address-item">
                  <span class="address-info-label">收货点名称：</span>
                  <span class="address-info-value">{{orderReturnApply.servicePointName}}</span>
                </div>
                <div style="margin-top: 10px;">
                  <el-button type="primary" size="small" @click="fetchServicePointDetail" :loading="addressLoading">
                    <i class="el-icon-refresh"></i> 获取详细信息
                  </el-button>
                </div>
              </div>
              
              <!-- 无信息时显示 -->
              <div class="address-info" v-else>
                <div class="address-item">
                  <span class="address-info-value">暂无收货信息</span>
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
        <div class="action-buttons" v-if="orderReturnApply.allowableOperations && orderReturnApply.allowableOperations.length > 0" v-loading="submitLoading">
          <div class="button-container">
            <el-button 
              v-for="operation in orderReturnApply.allowableOperations" 
              :key="operation"
              :type="getOperationButtonType(operation)"
              :icon="getOperationButtonIcon(operation)"
              @click="handleOperation(operation)">
              {{ getOperationButtonText(operation) }}
            </el-button>
          </div>
        </div>
        
        <!-- 打印按钮 -->
        <div class="print-button">
          <el-button type="success" size="small" icon="el-icon-printer" @click="handlePrint">打印售后单</el-button>
        </div>
        
      </div>
    </el-card>

    <!-- 图片预览遮罩 -->
    <div class="image-preview-mask" 
         v-show="previewVisible" 
         @mouseenter="handleMaskEnter" 
         @mouseleave="handleMaskLeave"
         @click="handleMaskClick"
         @contextmenu.prevent="handleMaskClick">
      <div class="preview-container">
        <img :src="previewImage" class="preview-image">
      </div>
    </div>

    <!-- 状态流转图 -->
    <el-card class="status-flow card-container" shadow="never" v-loading="listLoading">
      <div slot="header" class="card-header">
        <i class="el-icon-s-operation"></i>
        <span class="font-title-medium">处理流程</span>
      </div>
      <el-steps :active="computedCurrentStep" finish-status="success" align-center>
        <el-step title="申请提交" description="会员提交退货申请"></el-step>
        <el-step title="商家审核" description="商家审核退货申请"></el-step>
        <el-step title="商品寄回" description="会员寄回商品"></el-step>
        <el-step title="商家收货" description="商家确认收货"></el-step>
        <el-step title="质检处理" description="商家进行质检"></el-step>
        <el-step title="退款处理" description="系统处理退款"></el-step>
        <el-step title="完成" description="售后流程结束"></el-step>
      </el-steps>
    </el-card>

    <!-- 物流信息 -->
    <el-card class="logistics-info card-container" shadow="never" v-if="hasLogistics" v-loading="listLoading">
      <div slot="header" class="card-header">
        <i class="el-icon-truck"></i>
        <span class="font-title-medium">物流信息</span>
      </div>
      <el-form label-width="120px">
        <el-form-item label="物流公司">
          <span>{{orderReturnApply.logisticsCompany || '无'}}</span>
        </el-form-item>
        <el-form-item label="物流单号">
          <span>{{orderReturnApply.logisticsNumber || '无'}}</span>
        </el-form-item>
        <el-form-item label="发货时间">
          <span>{{orderReturnApply.shippingTime | formatTime}}</span>
        </el-form-item>
        <el-form-item label="收货时间" v-if="orderReturnApply.receiveTime">
          <span>{{orderReturnApply.receiveTime | formatTime}}</span>
        </el-form-item>
        <el-form-item label="收货人" v-if="orderReturnApply.receiveMan">
          <span>{{orderReturnApply.receiveMan}}</span>
        </el-form-item>
        <el-form-item label="收货备注" v-if="orderReturnApply.receiveNote">
          <span>{{orderReturnApply.receiveNote}}</span>
        </el-form-item>
        <el-form-item label="收货网点" v-if="orderReturnApply.servicePointId">
          <span>{{orderReturnApply.servicePointName || '无'}}</span>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 质检信息 -->
    <el-card class="quality-check-info card-container" shadow="never" v-if="hasQualityCheck" v-loading="listLoading">
      <div slot="header" class="card-header">
        <i class="el-icon-check"></i>
        <span class="font-title-medium">质检信息</span>
      </div>
      <el-form label-width="120px">
        <el-form-item label="质检结果" v-if="orderReturnApply.checkResult !== null">
          <el-tag :type="orderReturnApply.checkResult === 1 ? 'success' : 'danger'">
            {{orderReturnApply.checkResult === 1 ? '通过' : '不通过'}}
          </el-tag>
        </el-form-item>
        <el-form-item label="质检人员" v-if="orderReturnApply.checkMan">
          <span>{{orderReturnApply.checkMan}}</span>
        </el-form-item>
        <el-form-item label="质检时间" v-if="orderReturnApply.checkTime">
          <span>{{orderReturnApply.checkTime | formatTime}}</span>
        </el-form-item>
        <el-form-item label="质检备注" v-if="orderReturnApply.checkNote">
          <span>{{orderReturnApply.checkNote}}</span>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 退款信息 -->
    <el-card class="refund-info card-container" shadow="never" v-if="hasRefund" v-loading="listLoading">
      <div slot="header" class="card-header">
        <i class="el-icon-money"></i>
        <span class="font-title-medium">退款信息</span>
      </div>
      <el-form label-width="120px">
        <el-form-item label="退款金额">
          <span class="price">￥{{orderReturnApply.returnAmount | formatMoney}}</span>
        </el-form-item>
        <el-form-item label="退款方式" v-if="orderReturnApply.refundType">
          <span>{{orderReturnApply.refundType === 1 ? '原路退回' : '其他方式'}}</span>
        </el-form-item>
        <el-form-item label="退款时间" v-if="orderReturnApply.refundTime">
          <span>{{orderReturnApply.refundTime | formatTime}}</span>
        </el-form-item>
        <el-form-item label="退款状态" v-if="orderReturnApply.refundStatus !== null">
          <el-tag :type="getRefundStatusType(orderReturnApply.refundStatus)">
            {{formatRefundStatus(orderReturnApply.refundStatus)}}
          </el-tag>
        </el-form-item>
        <el-form-item label="退款备注" v-if="orderReturnApply.refundNote">
          <span>{{orderReturnApply.refundNote}}</span>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作日志展示 -->
    <el-card class="operation-logs card-container" shadow="never" v-if="hasOperationLogs" v-loading="listLoading">
      <div slot="header" class="card-header">
        <i class="el-icon-time"></i>
        <span class="font-title-medium">操作日志</span>
      </div>
      <el-timeline>
        <el-timeline-item
          v-for="(log, index) in orderReturnApply.operationLogs"
          :key="index"
          :type="getLogIconType(log.operateType)"
          :color="getLogIconColor(log.operateType)"
          :icon="getOperationIcon(log.operateType)"
          :timestamp="$options.filters.formatTime(log.createTime)">
          <div class="timeline-content">
            <h4>{{ formatOperationType(log.operateType) }}</h4>
            <p v-if="log.note"><span class="log-label">备注：</span>{{ log.note }}</p>
            <p v-if="log.afterSaleStatus !== undefined && log.afterSaleStatus !== null">
              <span class="log-label">状态：</span>{{ $options.filters.formatStatus(log.afterSaleStatus) }}
            </p>
            <div v-if="log.operateType == OPERATION_TYPE.SHIP" class="log-details">
              <p v-if="log.deliveryCompany"><span class="log-label">物流公司：</span>{{ log.deliveryCompany }}</p>
              <p v-if="log.deliverySn"><span class="log-label">物流单号：</span>{{ log.deliverySn }}</p>
            </div>
            <div v-if="[OPERATION_TYPE.CHECK_PASS, OPERATION_TYPE.CHECK_FAIL].includes(log.operateType)" class="log-details">
              <p v-if="log.checkMan"><span class="log-label">质检人员：</span>{{ log.checkMan }}</p>
              <p v-if="log.checkResult !== undefined && log.checkResult !== null">
                <span class="log-label">质检结果：</span>
                <el-tag :type="log.checkResult === 1 ? 'success' : 'danger'">
                  {{ log.checkResult === 1 ? '通过' : '不通过' }}
                </el-tag>
              </p>
            </div>
            <div v-if="[OPERATION_TYPE.START_REFUND, OPERATION_TYPE.COMPLETE_REFUND].includes(log.operateType)" class="log-details">
              <p v-if="log.returnAmount !== undefined && log.returnAmount !== null">
                <span class="log-label">退款金额：</span>¥ {{ $options.filters.formatMoney(log.returnAmount) }}
              </p>
              <p v-if="log.refundType !== undefined && log.refundType !== null">
                <span class="log-label">退款方式：</span>{{ log.refundType === 1 ? '原路退回' : '其他方式' }}
              </p>
            </div>
            <p class="log-operator"><span class="log-label">操作人：</span>{{ log.operateMan || '系统' }}</p>
          </div>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <div v-if="orderReturnApply.status === 1 && orderReturnApply.reason">
      <el-card class="reason-card card-container" shadow="never">
        <div slot="header" class="card-header">
          <i class="el-icon-document"></i>
          <span class="font-title-medium">退货原因</span>
        </div>
        <div class="reason-content">
          {{orderReturnApply.reason}}
        </div>
      </el-card>
    </div>
    
    <!-- 回退对话框 -->
    <el-dialog
      title="回退到待审核状态"
      :visible.sync="rollbackDialogVisible"
      width="30%">
      <el-form ref="rollbackForm" :model="rollbackForm" :rules="rollbackRules" label-width="100px">
        <el-form-item label="回退原因" prop="reason">
          <el-input
            type="textarea"
            :rows="4"
            placeholder="请输入回退原因"
            v-model="rollbackForm.reason">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rollbackDialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="rollbackLoading" @click="handleRollback">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加收货信息卡片 -->
    <el-card class="box-card" style="margin-top: 15px">
      <div slot="header">
        <span>收货信息</span>
      </div>
      <div>
        <!-- 待处理状态下允许选择服务点 -->
        <div v-if="orderReturnApply.status === STATUS.PENDING">
          <el-form label-width="120px">
            <el-form-item label="选择收货点">
              <ServicePointSelect 
                v-model="selectedServicePoint.id" 
                @change="point => selectedServicePoint = point"
                style="width: 100%"
              ></ServicePointSelect>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 已批准或更高状态下显示已选服务点信息 -->
        <div v-else-if="orderReturnApply.servicePointId">
          <el-form label-width="120px" label-position="left">
            <el-form-item label="服务点名称">
              <span>{{ orderReturnApply.servicePointName }}</span>
            </el-form-item>
            <el-form-item label="服务点编码" v-if="servicePointDetail">
              <span>{{ servicePointDetail.pointCode }}</span>
            </el-form-item>
            <el-form-item label="联系人" v-if="servicePointDetail">
              <span>{{ servicePointDetail.contact }}</span>
            </el-form-item>
            <el-form-item label="联系电话" v-if="servicePointDetail">
              <span>{{ servicePointDetail.phone }}</span>
            </el-form-item>
            <el-form-item label="详细地址" v-if="servicePointDetail">
              <span>{{ servicePointDetail.province }}{{ servicePointDetail.city }}{{ servicePointDetail.district }}{{ servicePointDetail.address }}</span>
            </el-form-item>
          </el-form>
          
          <!-- 未加载出服务点详情时显示 -->
          <div v-if="!servicePointDetail && orderReturnApply.servicePointId" style="text-align: center; margin-top: 20px">
            <p v-if="loadingServicePoint">加载服务点详情中...</p>
            <p v-else>
              服务点详情加载失败
              <el-button type="text" @click="fetchServicePointDetail()">重新加载</el-button>
            </p>
          </div>
        </div>
        
        <!-- 未审批且未选择服务点时提示 -->
        <div v-else>
          <el-alert
            title="请先选择收货点，然后审核通过售后申请"
            type="info"
            show-icon>
          </el-alert>
        </div>
      </div>
    </el-card>
  </div>
</template>
<script>
  import { getAfterSaleApplyDetail, updateAfterSaleStatus, rollbackToAudit, fetchServicePointDetail } from '@/api/afterSale';
  import { fetchList } from '@/api/companyAddress';
  import { formatDate } from '@/utils/date';
  import { safeUpdateStatus, validateStatusParams } from '@/utils/afterSaleUtils';
  import ServicePointSelect from '@/components/ServicePointSelect';
  import { getServicePoint } from '@/api/servicePoint'; // 导入服务点API
  import Vue from 'vue';
  import request from '@/utils/request'; // 导入request

  // 状态常量定义
  const STATUS = {
    PENDING: 0,        // 待处理
    APPROVED: 1,       // 已同意
    REJECTED: 2,       // 已拒绝
    SHIPPED: 3,        // 已发货
    RECEIVED: 4,       // 已收货
    CHECKING: 5,       // 质检中
    CHECK_PASS: 6,     // 质检通过
    CHECK_FAIL: 7,     // 质检不通过
    REFUNDING: 8,      // 退款中
    COMPLETED: 9       // 已完成
  };

  // 操作类型常量
  const OPERATION_TYPE = {
    PENDING: 0,       // 处理中
    APPROVE: 1,       // 同意申请
    REJECT: 2,        // 拒绝申请
    SHIP: 3,          // 确认发货
    RECEIVE: 4,       // 确认收货
    START_CHECK: 5,   // 开始质检
    CHECK_PASS: 6,    // 质检通过
    CHECK_FAIL: 7,    // 质检不通过
    START_REFUND: 8,  // 发起退款
    COMPLETE_REFUND: 9,// 完成退款
    ROLLBACK: 11      // 回退审核
  };

  // 退款状态常量
  const REFUND_STATUS = {
    PROCESSING: 0,    // 处理中
    SUCCESS: 1,        // 成功
    FAILED: 2          // 失败
  };

  // 退款方式常量定义
  const REFUND_TYPE = {
    ORIGINAL: 1,       // 原路退回
    OTHER: 2           // 其他方式
  };

  // 质检结果常量定义
  const CHECK_RESULT = {
    FAIL: 0,           // 不通过
    PASS: 1            // 通过
  };

  // 默认参数
  const defaultUpdateStatusParam = {
    servicePointId: null,
    handleMan: 'admin',
    handleNote: null,
    receiveMan: 'admin',
    receiveNote: null,
    returnAmount: 0,
    status: 0,
    servicePointId: null,
    servicePointName: null
  };
  const defaultOrderReturnApply = {
    id: null,
    orderId: null,
    servicePointId: null,
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
    orderTotalAmount: null,
    allowableOperations: []
  };
  export default {
    name: 'returnApplyDetail',
    components: {
      ServicePointSelect
    },
    data() {
      return {
        id: null,
        orderReturnApply: Object.assign({}, defaultOrderReturnApply),
        productList: null,
        proofList: null,
        updateStatusParam: Object.assign({}, defaultUpdateStatusParam),
        companyAddressList: [],
        selectedServicePoint: { id: null, pointName: '' }, // 初始化为对象而非null
        servicePointDetail: null,
        loadingServicePoint: false,
        previewVisible: false,
        previewImage: '',
        previewTimer: null,
        isMouseOnMask: false,
        currentStep: 0,
        canOperate: false,
        listLoading: false,
        addressLoading: false,
        submitLoading: false,
        STATUS,
        OPERATION_TYPE,
        REFUND_STATUS,
        rollbackDialogVisible: false,
        rollbackForm: {
          reason: ''
        },
        rollbackRules: {
          reason: [
            { required: true, message: '请输入回退原因', trigger: 'blur' },
            { min: 5, max: 200, message: '回退原因长度应在5-200个字符之间', trigger: 'blur' }
          ]
        },
        rollbackLoading: false
      }
    },
    created() {
      this.id = this.$route.query.id;
      this.getDetail();
      
      // 添加ServicePointSelect组件到Vue原型，用于动态创建组件
      this.$ServicePointSelect = Vue.extend(ServicePointSelect);
    },
    mounted() {
      // 延迟执行，确保数据已经加载
      setTimeout(() => {
        if (this.orderReturnApply && this.orderReturnApply.servicePointId && !this.selectedServicePoint) {
          console.log('mounted中调用fetchServicePointDetail');
          this.fetchServicePointDetail();
        }
      }, 500);
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
      computedCurrentStep() {
        // 根据状态计算当前步骤
        const stepMap = {
          [STATUS.PENDING]: 1,    // 待处理
          [STATUS.APPROVED]: 2,   // 已同意
          [STATUS.REJECTED]: 2,   // 已拒绝（流程结束）
          [STATUS.SHIPPED]: 3,    // 已发货
          [STATUS.RECEIVED]: 4,   // 已收货
          [STATUS.CHECKING]: 5,   // 质检中
          [STATUS.CHECK_PASS]: 5, // 质检通过
          [STATUS.CHECK_FAIL]: 5, // 质检不通过
          [STATUS.REFUNDING]: 6,  // 退款中
          [STATUS.COMPLETED]: 7   // 已完成
        };
        return stepMap[this.orderReturnApply.status] || 0;
      },
      isOperationAllowed() {
        // 根据状态判断是否可以操作
        const status = this.orderReturnApply.status;
        return [STATUS.PENDING, STATUS.SHIPPED, STATUS.RECEIVED, STATUS.CHECKING, STATUS.CHECK_PASS, STATUS.REFUNDING].includes(status);
      },
      hasLogistics() {
        // 判断是否有物流信息
        return this.orderReturnApply.status >= 3;
      },
      hasQualityCheck() {
        // 判断是否有质检信息
        return this.orderReturnApply.status >= 5;
      },
      hasRefund() {
        // 判断是否有退款信息
        return this.orderReturnApply.status >= 8;
      },
      hasOperationLogs() {
        return this.orderReturnApply && 
               this.orderReturnApply.operationLogs && 
               this.orderReturnApply.operationLogs.length > 0;
      },
      canRollback() {
        // 只有在已批准(1)或已拒绝(2)状态下显示回退按钮
        return this.orderReturnApply && 
          (this.orderReturnApply.status === STATUS.APPROVED || 
           this.orderReturnApply.status === STATUS.REJECTED);
      }
    },
    filters: {
      formatStatus(status) {
        const statusMap = {
          [STATUS.PENDING]: "待处理",
          [STATUS.APPROVED]: "已同意",
          [STATUS.REJECTED]: "已拒绝",
          [STATUS.SHIPPED]: "已发货",
          [STATUS.RECEIVED]: "已收货",
          [STATUS.CHECKING]: "质检中",
          [STATUS.CHECK_PASS]: "质检通过",
          [STATUS.CHECK_FAIL]: "质检不通过",
          [STATUS.REFUNDING]: "退款中",
          [STATUS.COMPLETED]: "已完成"
        };
        return statusMap[status] || "未知状态";
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
      },
      formatOperationType(type) {
        if(type == null) return '未知操作';
        
        // 根据后端定义的操作类型映射显示名称
        const typeMap = {
          [OPERATION_TYPE.PENDING]: '处理中',
          [OPERATION_TYPE.APPROVE]: '同意申请',
          [OPERATION_TYPE.REJECT]: '拒绝申请',
          [OPERATION_TYPE.SHIP]: '确认发货',
          [OPERATION_TYPE.RECEIVE]: '确认收货',
          [OPERATION_TYPE.START_CHECK]: '开始质检',
          [OPERATION_TYPE.CHECK_PASS]: '质检通过',
          [OPERATION_TYPE.CHECK_FAIL]: '质检不通过',
          [OPERATION_TYPE.START_REFUND]: '发起退款',
          [OPERATION_TYPE.COMPLETE_REFUND]: '完成退款',
          [OPERATION_TYPE.ROLLBACK]: '回退审核'
        };
        
        return typeMap[type] || '未知操作';
      },
      getRefundStatusType(status) {
        const typeMap = {
          [REFUND_STATUS.PROCESSING]: 'warning',  // 处理中
          [REFUND_STATUS.SUCCESS]: 'success',     // 成功
          [REFUND_STATUS.FAILED]: 'danger'        // 失败
        };
        return typeMap[status] || 'info';
      },
      formatRefundStatus(status) {
        const statusMap = {
          [REFUND_STATUS.PROCESSING]: '处理中',
          [REFUND_STATUS.SUCCESS]: '已完成',
          [REFUND_STATUS.FAILED]: '失败'
        };
        return statusMap[status] || '未知状态';
      },
      getLogIconType(type) {
        const iconMap = {
          [OPERATION_TYPE.PENDING]: 'info',
          [OPERATION_TYPE.APPROVE]: 'primary',
          [OPERATION_TYPE.REJECT]: 'danger',
          [OPERATION_TYPE.SHIP]: 'success',
          [OPERATION_TYPE.RECEIVE]: 'success',
          [OPERATION_TYPE.START_CHECK]: 'warning',
          [OPERATION_TYPE.CHECK_PASS]: 'success',
          [OPERATION_TYPE.CHECK_FAIL]: 'danger',
          [OPERATION_TYPE.START_REFUND]: 'primary',
          [OPERATION_TYPE.COMPLETE_REFUND]: 'success'
        };
        return iconMap[type] || 'info';
      },
      getLogIconColor(type) {
        const colorMap = {
          [OPERATION_TYPE.PENDING]: '',
          [OPERATION_TYPE.APPROVE]: 'primary',
          [OPERATION_TYPE.REJECT]: 'danger',
          [OPERATION_TYPE.SHIP]: 'success',
          [OPERATION_TYPE.RECEIVE]: 'success',
          [OPERATION_TYPE.START_CHECK]: 'warning',
          [OPERATION_TYPE.CHECK_PASS]: 'success',
          [OPERATION_TYPE.CHECK_FAIL]: 'danger',
          [OPERATION_TYPE.START_REFUND]: 'primary',
          [OPERATION_TYPE.COMPLETE_REFUND]: 'success'
        };
        return colorMap[type] || '';
      }
    },
    methods: {
      getOperationIcon(operateType) {
        const iconMap = {
          [OPERATION_TYPE.PENDING]: 'el-icon-time',
          [OPERATION_TYPE.APPROVE]: 'el-icon-check',
          [OPERATION_TYPE.REJECT]: 'el-icon-close',
          [OPERATION_TYPE.SHIP]: 'el-icon-s-promotion',
          [OPERATION_TYPE.RECEIVE]: 'el-icon-box',
          [OPERATION_TYPE.START_CHECK]: 'el-icon-search',
          [OPERATION_TYPE.CHECK_PASS]: 'el-icon-circle-check',
          [OPERATION_TYPE.CHECK_FAIL]: 'el-icon-circle-close',
          [OPERATION_TYPE.START_REFUND]: 'el-icon-money',
          [OPERATION_TYPE.COMPLETE_REFUND]: 'el-icon-circle-check'
        };
        return iconMap[operateType] || 'el-icon-more';
      },
      getOperationButtonType(operation) {
        const typeMap = {
          'approve': 'primary',
          'reject': 'danger',
          'receive': 'primary',
          'check': 'primary',
          'checkPass': 'success',
          'checkFail': 'danger',
          'recheck': 'warning',
          'refund': 'primary',
          'completeRefund': 'success',
          'failRefund': 'danger'
        };
        return typeMap[operation] || 'default';
      },
      getOperationButtonText(operation) {
        const textMap = {
          'approve': '同意退货',
          'reject': '拒绝退货',
          'receive': '确认收货',
          'check': '开始质检',
          'checkPass': '质检通过',
          'checkFail': '质检不通过',
          'recheck': '重新质检',
          'refund': '确认退款',
          'completeRefund': '完成退款',
          'failRefund': '退款失败'
        };
        return textMap[operation] || operation;
      },
      getOperationButtonIcon(operation) {
        const iconMap = {
          'approve': 'el-icon-check',
          'reject': 'el-icon-close',
          'receive': 'el-icon-box',
          'check': 'el-icon-search',
          'checkPass': 'el-icon-circle-check',
          'checkFail': 'el-icon-circle-close',
          'recheck': 'el-icon-refresh',
          'refund': 'el-icon-money',
          'completeRefund': 'el-icon-check',
          'failRefund': 'el-icon-close'
        };
        return iconMap[operation] || 'el-icon-s-tools';
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
      getProofPicsArray(input) {
        // 如果是数组，并且是对象数组（proofList的情况）
        if (Array.isArray(input) && input.length > 0 && typeof input[0] === 'object') {
          return input.map(item => item.picUrl);
        }
        
        if (!input || typeof input !== 'string') {
          return [];
        }
        
        let pics = input.split(',');
        let picArray = [];
        
        // 添加调试日志
        console.log('原始图片字符串:', input);
        console.log('分割后图片数组:', pics);
        
        // 引入API基础URL
        const baseUrl = 'http://192.168.1.6:8080';
        console.log('基础URL:', baseUrl);
        
        for (let i = 0; i < pics.length; i++) {
          let pic = pics[i].trim();
          if (!pic) continue;
          
          // 添加调试日志
          console.log('处理图片:', i, pic);
          
          // 确保图片路径是完整的URL
          if (pic.startsWith('http://') || pic.startsWith('https://')) {
            // 已经是完整URL
            picArray.push(pic);
            console.log('已是完整URL:', pic);
          } else {
            // 处理相对路径
            if (pic.startsWith('/')) {
              picArray.push(baseUrl + pic);
              console.log('添加基础URL到以/开头的路径:', baseUrl + pic);
            } else {
              picArray.push(baseUrl + '/' + pic);
              console.log('添加基础URL和/到路径:', baseUrl + '/' + pic);
            }
          }
        }
        
        console.log('最终图片数组:', picArray);
        return picArray;
      },
      handleImageHover(url) {
        if (this.previewTimer) {
          clearTimeout(this.previewTimer);
          this.previewTimer = null;
        }
        if (url) {
          this.previewImage = url;
          this.previewVisible = true;
        }
      },
      handleImageLeave() {
        this.previewTimer = setTimeout(() => {
          if (!this.isMouseOnMask) {
            this.previewVisible = false;
            this.previewImage = '';
          }
        }, 100);
      },
      handleMaskEnter() {
        this.isMouseOnMask = true;
        if (this.previewTimer) {
          clearTimeout(this.previewTimer);
          this.previewTimer = null;
        }
      },
      handleMaskLeave() {
        this.isMouseOnMask = false;
        this.previewVisible = false;
        this.previewImage = '';
      },
      handleMaskClick(event) {
        // 阻止事件冒泡
        event.stopPropagation();
        // 关闭预览
        this.previewVisible = false;
        this.previewImage = '';
        this.isMouseOnMask = false;
        if (this.previewTimer) {
          clearTimeout(this.previewTimer);
          this.previewTimer = null;
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
        this.listLoading = true;
        if(!this.id) {
          this.$message.error('未找到售后单ID');
          this.listLoading = false;
          this.$router.push('/oms/apply');
          return;
        }
        
        getAfterSaleApplyDetail(this.id).then(response => {
          this.orderReturnApply = response.data || {};
          console.log('orderReturnApply', this.orderReturnApply);
          this.productList = this.orderReturnApply.itemList || [];
          console.log('productList', this.productList);
          this.proofList = this.orderReturnApply.proofList || [];
          console.log('proofList', this.proofList);
          
          // 如果后端未返回allowableOperations，则根据状态计算
          if (!this.orderReturnApply.allowableOperations) {
            this.orderReturnApply.allowableOperations = this.calculateAllowableOperations(this.orderReturnApply.status);
          }
          
          // 处理默认值
          if (this.orderReturnApply.returnAmount) {
            this.updateStatusParam.returnAmount = this.orderReturnApply.returnAmount;
          } else {
            this.updateStatusParam.returnAmount = this.calculatedTotalAmount;
          }
          
          // 处理服务点信息
          if (this.orderReturnApply.servicePointId) {
            this.updateStatusParam.servicePointId = this.orderReturnApply.servicePointId;
            this.updateStatusParam.servicePointName = this.orderReturnApply.servicePointName;
            
            // 立即获取服务点详情
            console.log('立即获取服务点详情');
            this.fetchServicePointDetail();
          }
          
          this.listLoading = false;
        }).catch(error => {
          this.listLoading = false;
          this.$message({
            type: 'error',
            message: '获取售后单详情失败: ' + (error.message || '未知错误')
          });
          console.error('获取售后单详情失败', error);
        });
      },
      getCompanyAddressList() {
        this.$set(this, 'addressLoading', true);
        fetchList().then(response => {
          this.companyAddressList = response.data || [];
          if(this.companyAddressList.length === 0) {
            this.$message.warning('没有可用的公司地址，请先添加收货地址');
          }
          
          if(this.companyAddressList.length > 0 && !this.updateStatusParam.servicePointId){
            let defaultAddress = this.companyAddressList.find(addr => addr.receiveStatus === 1);
            this.updateStatusParam.servicePointId = defaultAddress ? defaultAddress.id : this.companyAddressList[0].id;
          }
        }).catch(error => {
          console.error("获取公司地址列表失败:", error);
          this.$message.error("获取公司地址列表失败，请稍后重试");
        }).finally(() => {
          this.$set(this, 'addressLoading', false);
        });
      },
      handleUpdateStatus(status) {
        let params = Object.assign({}, this.updateStatusParam);
        params.status = status;
        params.id = this.id;

        // 根据状态处理不同的参数
        switch(status) {
          case STATUS.APPROVED: // 已同意
            if(!this.selectedServicePoint && !params.servicePointId) {
              this.$message({
                message: '请选择收货地址',
                type: 'warning',
                duration: 1000
              });
              return;
            }
            
            // 确保服务点ID正确设置，不传递servicePointName
            if(this.selectedServicePoint) {
              params.servicePointId = this.selectedServicePoint.id;
              // 移除servicePointName的设置
            }
            
            params.handleMan = this.$store.getters.name || 'admin';
            break;
          case STATUS.REJECTED: // 已拒绝 - 不应该直接调用，应该使用handleReject方法
            return this.handleReject();
          case STATUS.SHIPPED: // 已发货
            this.$prompt('请输入物流公司', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              inputPlaceholder: '请输入物流公司',
              inputPattern: /\S+/,
              inputErrorMessage: '物流公司不能为空'
            }).then(({ value }) => {
              params.logisticsCompany = value;
              this.$prompt('请输入物流单号', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputPlaceholder: '请输入物流单号',
                inputPattern: /\S+/,
                inputErrorMessage: '物流单号不能为空'
              }).then(({ value }) => {
                params.logisticsNumber = value;
                this.submitUpdateStatus(params);
              });
            }).catch(() => {
              // 取消
            });
            return;
          case 4: // 已收货 - 不应该直接调用，应该使用handleConfirmReceive方法
            return this.handleConfirmReceive();
          case 5: // 质检中
            this.$prompt('请输入质检人员', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              inputPlaceholder: '请输入质检人员',
              inputPattern: /\S+/,
              inputErrorMessage: '质检人员不能为空'
            }).then(({ value }) => {
              params.checkMan = value || this.$store.getters.name || 'admin';
              this.submitUpdateStatus(params);
            }).catch(() => {
              // 取消
            });
            return;
          case 6: // 质检通过
            this.$prompt('请输入质检备注', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              inputPlaceholder: '请输入质检备注（可选）'
            }).then(({ value }) => {
              params.checkNote = value;
              params.checkResult = 1; // 通过
              params.checkMan = params.checkMan || this.$store.getters.name || 'admin';
              this.submitUpdateStatus(params);
            }).catch(() => {
              // 取消
            });
            return;
          case 7: // 质检不通过
            this.$prompt('请输入质检不通过原因', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              inputPlaceholder: '请输入质检不通过原因',
              inputPattern: /\S+/,
              inputErrorMessage: '质检不通过原因不能为空'
            }).then(({ value }) => {
              params.checkNote = value;
              params.checkResult = 0; // 不通过
              params.checkMan = params.checkMan || this.$store.getters.name || 'admin';
              this.submitUpdateStatus(params);
            }).catch(() => {
              // 取消
            });
            return;
          case 8: // 退款中
            this.$confirm('请选择退款方式', '提示', {
              confirmButtonText: '原路退回',
              cancelButtonText: '其他方式',
              type: 'info'
            }).then(() => {
              params.refundType = 1; // 原路退回
              this.submitUpdateStatus(params);
            }).catch((action) => {
              // 无论什么action，都视为选择其他方式
              params.refundType = 2; // 其他方式
              this.submitUpdateStatus(params);
            });
            return;
          case 9: // 已完成
            this.$prompt('请输入退款备注', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              inputPlaceholder: '请输入退款备注（可选）'
            }).then(({ value }) => {
              params.refundNote = value;
              params.refundStatus = 1; // 成功
              this.submitUpdateStatus(params);
            }).catch(() => {
              // 取消
            });
            return;
        }

        this.submitUpdateStatus(params);
      },
      // 提交更新状态
      submitUpdateStatus(params) {
        this.submitLoading = true;
        
        // 确保params包含id参数
        if (!params.id) {
          params.id = this.id;
        }
        
        // 验证状态参数
        const validationResult = validateStatusParams(params);
        if (!validationResult.valid) {
          this.$message.error(validationResult.message);
          this.submitLoading = false;
          return;
        }
        
        // 打印确认提交的参数
        console.log('提交状态更新参数:', params);
        
        // 使用updateAfterSaleStatus替代updateApplyStatus
        updateAfterSaleStatus(this.id, params).then(response => {
          this.submitLoading = false;
          this.getDetail();
        }).catch(error => {
          this.submitLoading = false;
          this.$message.error('更新售后单状态失败: ' + (error.message || '未知错误'));
          console.error('更新售后单状态失败', error);
        });
      },
      handleApprove() {
        // 检查是否选择了服务点
        if (!this.selectedServicePoint) {
          this.$message.warning('请选择收货点');
          return;
        }
        
        // 检查用户名
        const currentUser = this.$store.getters.name;
        console.log('当前用户名:', currentUser);
        
        this.$confirm('确认要同意该申请吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.submitLoading = true;
          
          // 构建参数 - 使用硬编码处理人
          const params = {
            id: this.id,  // 确保传递售后单ID参数
            status: 1, // 已批准状态
            version: this.orderReturnApply.version,
            handleNote: this.updateStatusParam.handleNote,
            handleMan: "admin", // 硬编码处理人员参数
            servicePointId: this.selectedServicePoint.id,
            servicePointName: this.selectedServicePoint.pointName || this.selectedServicePoint.locationName,
            returnAmount: this.updateStatusParam.returnAmount || this.calculatedTotalAmount // 添加退款金额参数
          };
          
          console.log('提交审核参数:', JSON.stringify(params));
          
          // 使用封装的API函数
          updateAfterSaleStatus(this.id, params).then(response => {
            console.log('API响应成功:', response);
            this.$message.success('操作成功');
            this.submitLoading = false;
            this.getDetail();
          }).catch(error => {
            console.error('审批操作失败详情:', error);
            console.error('请求参数:', JSON.stringify(params));
            let errorMsg = '未知错误';
            if (error.response && error.response.data) {
              errorMsg = error.response.data.message || JSON.stringify(error.response.data);
            } else if (error.message) {
              errorMsg = error.message;
            }
            this.$message.error('操作失败: ' + errorMsg);
            this.submitLoading = false;
          });
        });
      },
      handleReject() {
        this.$prompt('请输入拒绝原因', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /^.{1,200}$/,
          inputErrorMessage: '拒绝原因不能为空且不能超过200字'
        }).then(({ value }) => {
          let params = Object.assign({}, this.updateStatusParam);
          params.id = this.id;
          params.handleMan = this.$store.getters.name || 'admin';
          params.handleNote = value;
          params.status = 2; // 已拒绝
          this.submitUpdateStatus(params);
        });
      },
      handleConfirmReceive() {
        // 创建一个Dialog表单
        this.$msgbox({
          title: '确认收货',
          message: this.createReceiveForm(),
          showCancelButton: true,
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
              const servicePointId = this.$refs.receiveServicePoint && this.$refs.receiveServicePoint.selectedValue;
              const receiveNote = this.$refs.receiveNote && this.$refs.receiveNote.value;
              
              if (!servicePointId) {
                this.$message({
                  type: 'warning',
                  message: '请选择收货网点'
                });
                return;
              }
              
              // 获取服务点详情
              const selectedPoint = this.$refs.receiveServicePoint && 
                this.$refs.receiveServicePoint.options.find(item => item.id === servicePointId);
              
              let params = Object.assign({}, this.updateStatusParam);
              params.id = this.id;
              params.receiveMan = this.$store.getters.name || 'admin';
              params.receiveNote = receiveNote;
              params.servicePointId = servicePointId;
              params.servicePointName = selectedPoint ? selectedPoint.locationName : '';
              params.status = 4; // 已收货
              
              this.submitUpdateStatus(params);
              done();
            } else {
              done();
            }
          }
        });
      },
      createReceiveForm() {
        // 创建服务点选择器和备注输入框
        const h = this.$createElement;
        
        setTimeout(() => {
          // 在下一个事件循环中初始化Vue组件
          this.$refs.receiveServicePoint = new this.$ServicePointSelect({
            propsData: {
              value: this.updateStatusParam.servicePointId || null
            }
          }).$mount('#receive-service-point');
        }, 0);
        
        return h('div', { class: 'receive-form' }, [
          h('div', { class: 'form-item' }, [
            h('label', { class: 'form-label' }, '选择收货网点:'),
            h('div', { class: 'form-content' }, [
              h('div', { 
                attrs: { id: 'receive-service-point' },
                style: { width: '100%' }
              })
            ])
          ]),
          h('div', { class: 'form-item' }, [
            h('label', { class: 'form-label' }, '收货备注:'),
            h('div', { class: 'form-content' }, [
              h('textarea', {
                ref: 'receiveNote',
                attrs: { 
                  placeholder: '请输入收货备注（可选）',
                  rows: 3
                },
                style: {
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #DCDFE6'
                }
              })
            ])
          ])
        ]);
      },
      handleQualityCheck() {
        this.handleUpdateStatus(5); // 质检中
      },
      handleQualityPass() {
        this.handleUpdateStatus(6); // 质检通过
      },
      handleQualityFail() {
        this.handleUpdateStatus(7); // 质检不通过
      },
      handleRefund() {
        this.handleUpdateStatus(8); // 退款中
      },
      handleComplete() {
        this.handleUpdateStatus(9); // 已完成
      },
      handlePrint() {
        window.print(); // 这是一个简单的打印实现，可以根据需要使用更复杂的打印库
      },
      handleFailRefund() {
        // 实现退款失败的逻辑
      },
      calculateAllowableOperations(status) {
        // 与后端 getAllowableOperations 保持一致的逻辑
        const operations = [];
        switch (status) {
          case STATUS.PENDING: // 待处理
            operations.push('approve', 'reject');
            break;
          case STATUS.APPROVED: // 已批准，等待顾客寄回商品
            // 移除了取消申请功能
            break;
          case STATUS.SHIPPED: // 顾客已发货，等待商家收货
            operations.push('receive');
            break;
          case STATUS.RECEIVED: // 商家已收货，准备质检
            operations.push('check');
            break;
          case STATUS.CHECKING: // 质检中
            operations.push('checkPass', 'checkFail');
            break;
          case STATUS.CHECK_PASS: // 质检通过，准备退款
            operations.push('refund');
            break;
          case STATUS.CHECK_FAIL: // 质检未通过，等待顾客处理
            operations.push('reject', 'recheck');
            break;
          case STATUS.REFUNDING: // 退款中
            operations.push('completeRefund', 'failRefund');
            break;
        }
        return operations;
      },
      handleOperation(operation) {
        switch(operation) {
          case 'approve': this.handleApprove(); break;
          case 'reject': this.handleReject(); break;
          case 'receive': this.handleConfirmReceive(); break;
          case 'check': this.handleQualityCheck(); break;
          case 'checkPass': this.handleQualityPass(); break;
          case 'checkFail': this.handleQualityFail(); break;
          case 'recheck': this.handleRecheck(); break;
          case 'refund': this.handleRefund(); break;
          case 'completeRefund': this.handleComplete(); break;
          case 'failRefund': this.handleFailRefund(); break;
          default: this.$message.warning('未知操作类型: ' + operation);
        }
      },
      handleRecheck() {
        // 实现重新质检的逻辑
      },
      setCurrentStep() {
        // 根据状态计算当前步骤
        const stepMap = {
          0: 1, // 待处理
          1: 2, // 已同意
          2: 2, // 已拒绝（流程结束）
          3: 3, // 已发货
          4: 4, // 已收货
          5: 5, // 质检中
          6: 5, // 质检通过
          7: 5, // 质检不通过
          8: 6, // 退款中
          9: 7  // 已完成
        };
        this.currentStep = stepMap[this.orderReturnApply.status] || 0;
      },
      validateUpdateParams(params) {
        // 使用工具函数进行验证
        return validateStatusParams(params, params.status);
      },
      getStatusType(status) {
        const statusTypeMap = {
          [STATUS.PENDING]: 'warning',     // 待处理
          [STATUS.APPROVED]: 'primary',    // 已同意
          [STATUS.REJECTED]: 'danger',     // 已拒绝
          [STATUS.SHIPPED]: 'info',        // 已发货
          [STATUS.RECEIVED]: 'success',    // 已收货
          [STATUS.CHECKING]: 'warning',    // 质检中
          [STATUS.CHECK_PASS]: 'success',  // 质检通过
          [STATUS.CHECK_FAIL]: 'danger',   // 质检不通过
          [STATUS.REFUNDING]: 'primary',   // 退款中
          [STATUS.COMPLETED]: 'success'    // 已完成
        };
        return statusTypeMap[status] || 'info';
      },
      handleImageError($event) {
        // 当图片加载失败时显示错误信息
        const target = $event.target;
        target.onerror = null; // 防止循环触发
        target.style.display = 'none';
        
        const parent = target.parentNode;
        if (parent) {
          const errorText = document.createElement('div');
          errorText.className = 'image-error-text';
          errorText.textContent = '图片加载失败';
          errorText.style.fontSize = '12px';
          errorText.style.color = '#F56C6C';
          errorText.style.textAlign = 'center';
          errorText.style.lineHeight = '60px';
          errorText.style.width = '60px';
          errorText.style.height = '60px';
          errorText.style.border = '1px dashed #d9d9d9';
          errorText.style.borderRadius = '4px';
          parent.appendChild(errorText);
        }
      },
      handleServicePointChange(point) {
        // 当选择服务点时，接收完整的服务点对象
        this.selectedServicePoint = point;
        if (point) {
          // 只更新servicePointId，不再设置servicePointName
          this.updateStatusParam.servicePointId = point.id;
        }
      },
      handleRollback() {
        // 如果对话框未显示，则显示对话框
        if (!this.rollbackDialogVisible) {
          this.rollbackDialogVisible = true;
          this.rollbackForm.reason = '';
          return;
        }
        
        // 已显示对话框，则验证表单
        this.$refs.rollbackForm.validate(valid => {
          if (!valid) {
            this.$message.warning('请填写有效的回退原因');
            return;
          }
          
          this.rollbackLoading = true;
          rollbackToAudit(
            this.id,
            this.orderReturnApply.version,
            this.rollbackForm.reason
          ).then(response => {
            this.$message.success('回退操作成功');
            this.rollbackDialogVisible = false;
            this.rollbackForm.reason = '';
            // 重新加载详情
            this.getDetail();
          }).catch(error => {
            this.$message.error('回退操作失败: ' + (error.message || '未知错误'));
          }).finally(() => {
            this.rollbackLoading = false;
          });
        });
      },
      // 添加获取服务点详情的方法
      fetchServicePointDetail() {
        if (!this.orderReturnApply || !this.orderReturnApply.servicePointId) {
          console.log('没有服务点ID，无法获取详情');
          return;
        }
        
        // 避免重复请求
        if (this.servicePointDetail && this.servicePointDetail.id === this.orderReturnApply.servicePointId) {
          console.log('服务点详情已存在，无需重新获取');
          return;
        }
        
        this.loadingServicePoint = true;
        console.log('正在获取服务点详情:', this.orderReturnApply.servicePointId);
        
        fetchServicePointDetail(this.orderReturnApply.servicePointId)
          .then(response => {
            console.log('获取服务点详情成功:', response.data);
            this.servicePointDetail = response.data;
            this.selectedServicePoint = {
              id: response.data.id,
              pointName: response.data.pointName || response.data.locationName
            };
            this.loadingServicePoint = false;
          })
          .catch(error => {
            console.error('获取服务点详情失败:', error);
            this.$message.error('获取服务点详情失败');
            this.loadingServicePoint = false;
          });
      },
      // 添加更新收货信息的方法
      updateSelectedServicePoint(data) {
        console.log('更新服务点信息', data);
        this.selectedServicePoint = data;
        if (data) {
          this.updateStatusParam.servicePointId = data.id;
          this.updateStatusParam.servicePointName = data.locationName;
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
    transition: all 0.3s;
  }
  
  .refund-card:hover,
  .address-card:hover,
  .process-card:hover,
  .receive-card:hover,
  .remark-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
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

  /* 图片预览相关样式 */
  .image-preview-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 2000;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .preview-container {
    max-width: 80%;
    max-height: 80%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .preview-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
    border-radius: 4px;
  }

  .proof-image-wrapper {
    display: inline-block;
    position: relative;
  }

  .proof-image-wrapper:hover {
    transform: scale(1.05);
    transition: transform 0.3s;
  }

  /* 打印样式 */
  @media print {
    .detail-container {
      width: 100%;
      padding: 0;
      margin: 0;
    }
    
    .el-button, 
    .action-buttons, 
    .print-button,
    .image-preview-mask {
      display: none !important;
    }
    
    .el-card {
      box-shadow: none !important;
      border: 1px solid #ebeef5;
      margin-bottom: 15px !important;
      break-inside: avoid;
    }
    
    .el-table {
      width: 100% !important;
    }
    
    .el-table th.is-leaf, 
    .el-table td {
      border-bottom: 1px solid #ebeef5 !important;
    }
    
    body {
      font-size: 12px !important;
      color: #333 !important;
    }
    
    .card-header {
      padding: 10px !important;
    }
    
    .status-flow {
      page-break-before: always;
    }
  }

  /* 添加加载状态指示器的样式 */
  .el-loading-mask {
    z-index: 1000;
  }

  /* 操作日志样式 */
  .operation-logs {
    margin-top: 20px;
  }

  /* 加载状态指示器样式优化 */
  .el-loading-mask {
    background-color: rgba(255, 255, 255, 0.8);
  }

  /* 按钮加载状态 */
  .button-loading {
    position: relative;
    pointer-events: none;
  }

  .button-loading::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.6);
    border-radius: 4px;
  }

  /* 错误提示样式 */
  .error-message {
    color: #f56c6c;
    font-size: 14px;
    margin: 10px 0;
    padding: 8px 16px;
    background-color: #fef0f0;
    border-radius: 4px;
    border-left: 3px solid #f56c6c;
  }

  /* 退款信息高亮 */
  .refund-amount-highlight {
    color: #f56c6c;
    font-weight: bold;
    font-size: 16px;
  }

  /* 响应式布局优化 */
  @media screen and (max-width: 768px) {
    .info-card-wrapper {
      flex-direction: column;
    }
    
    .info-card {
      width: 100%;
      margin-right: 0;
      margin-bottom: 15px;
    }
    
    .el-form-item {
      margin-bottom: 18px;
    }
  }

  /* 操作日志样式 */
  .operation-log-card {
    margin-top: 20px;
  }

  .timeline-content {
    padding: 10px 15px;
    background-color: #f8f8f8;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .timeline-content h4 {
    margin: 0 0 10px 0;
    color: #303133;
    font-weight: 500;
  }

  .log-label {
    color: #606266;
    font-weight: 500;
    display: inline-block;
    width: 80px;
  }

  .log-details {
    margin: 8px 0;
    padding: 8px;
    background-color: #fff;
    border-radius: 4px;
    border-left: 3px solid #409EFF;
  }

  .log-operator {
    margin-top: 8px;
    font-size: 13px;
    color: #909399;
  }

  /* 时间线样式优化 */
  .el-timeline {
    padding-left: 10px;
    margin-top: 15px;
  }

  .el-timeline-item {
    padding-bottom: 20px;
  }

  .el-timeline-item__timestamp {
    color: #909399;
    font-size: 13px;
  }

  .el-timeline-item__wrapper {
    padding-left: 20px;
  }

  @media print {
    .operation-log-card {
      break-inside: avoid;
      page-break-inside: avoid;
    }
  }

  /* 收货表单样式 */
  .receive-form {
    width: 100%;
  }
  
  .form-item {
    margin-bottom: 15px;
  }
  
  .form-label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #606266;
  }
  
  .form-content {
    width: 100%;
  }
  
  /* 修复scope定义但未使用的错误 */
  .scope-fix {
    display: none;
  }

  .reason-card {
    margin-top: 20px;
  }

  .reason-content {
    padding: 15px;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid #ebeef5;
  }

  .proof-pics-card {
    margin-top: 20px;
  }

  .proof-pics-list {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -10px;
  }

  .pic-item {
    flex: 1;
    min-width: 250px;
    margin: 0 10px 20px 10px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    transition: all 0.3s;
    background-color: #fff;
  }

  .pic-wrapper {
    position: relative;
    width: 100%;
    height: 100px;
    margin: 0 auto;
    cursor: pointer;
  }

  .pic-wrapper img {
    display: block;
    border: 1px solid #ebeef5;
    transition: all 0.3s;
  }

  .pic-wrapper img:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  .pic-time {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
    text-align: center;
  }

  .pic-desc {
    font-size: 12px;
    color: #606266;
    margin-top: 5px;
    text-align: center;
  }

  .proof-pic {
    width: 100%;
    height: 100px;
    object-fit: cover;
  }

  .preview-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 2000;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .preview-image {
    max-width: 80%;
    max-height: 80%;
    border: 5px solid white;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
</style>


