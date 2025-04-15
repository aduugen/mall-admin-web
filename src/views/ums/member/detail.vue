<template>
  <div class="app-container">
    <!-- 页面标题 -->
    <el-card class="page-header" shadow="hover">
      <div slot="header" class="clearfix">
        <span class="card-title">
          <i class="el-icon-user"></i>
          会员详情
        </span>
        <el-button 
          style="float: right" 
          type="text" 
          icon="el-icon-back" 
          @click="goBack()">
          返回列表
        </el-button>
      </div>
    </el-card>
    
    <!-- 会员信息卡片 -->
    <div v-loading="loading">
      <el-card class="box-card" shadow="hover">
        <div slot="header" class="clearfix">
          <span class="card-title">
            <i class="el-icon-s-custom"></i>
            基本信息
          </span>
        </div>
        <div class="info-container">
          <table class="info-table">
            <tr>
              <th>会员ID：</th>
              <td class="id-value">{{memberInfo.id}}</td>
              <th>会员昵称：</th>
              <td>
                <div class="member-name">
                  <i class="el-icon-user-solid member-icon"></i>
                  <span>{{memberInfo.nickname || '暂无昵称'}}</span>
                </div>
              </td>
            </tr>
            <tr>
              <th>会员等级：</th>
              <td>
                <el-tag size="small" type="success">{{memberInfo.levelName}}</el-tag>
              </td>
              <th>会员状态：</th>
              <td>
                <el-switch
                  @change="handleStatusChange()"
                  :active-value="1"
                  :inactive-value="0"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                  active-text="启用"
                  inactive-text="禁用"
                  v-model="memberInfo.status">
                </el-switch>
              </td>
            </tr>
            <tr>
              <th>联系电话：</th>
              <td>
                <div class="phone-info">
                  <i class="el-icon-mobile-phone phone-icon"></i>
                  <span>{{memberInfo.phone || '暂无电话'}}</span>
                </div>
              </td>
              <th>注册时间：</th>
              <td>
                <div class="time-info">
                  <i class="el-icon-time time-icon"></i>
                  <span>{{memberInfo.createTime | formatTime}}</span>
                </div>
              </td>
            </tr>
            <tr>
              <th>性别：</th>
              <td>
                <el-tag v-if="memberInfo.gender===0" type="info">未知</el-tag>
                <el-tag v-if="memberInfo.gender===1" type="success">男</el-tag>
                <el-tag v-if="memberInfo.gender===2" type="danger">女</el-tag>
              </td>
              <th>生日：</th>
              <td>
                <div class="time-info">
                  <i class="el-icon-date time-icon"></i>
                  <span>{{memberInfo.birthday | formatDate}}</span>
                </div>
              </td>
            </tr>
            <tr v-if="memberInfo.email">
              <th>邮箱：</th>
              <td colspan="3">
                <div class="email-info">
                  <i class="el-icon-message email-icon"></i>
                  <span>{{memberInfo.email}}</span>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </el-card>
      
      <!-- 地址信息卡片 -->
      <el-card class="box-card" style="margin-top: 20px" shadow="hover" v-if="displayAddressList && displayAddressList.length > 0">
        <div slot="header" class="clearfix">
          <span class="card-title">
            <i class="el-icon-location"></i>
            收货地址
          </span>
        </div>
        <div class="address-container">
          <el-row :gutter="20">
            <el-col :span="12" v-for="(item, index) in displayAddressList" :key="index">
              <div class="address-item" :class="{'default-address': item.defaultStatus === 1}">
                <div class="address-header">
                  <span class="address-name">{{item.name}} {{item.phoneNumber}}</span>
                  <el-tag size="mini" type="success" v-if="item.defaultStatus === 1">默认</el-tag>
                </div>
                <div class="address-detail">
                  <i class="el-icon-location-outline"></i>
                  {{item.province}}{{item.city}}{{item.region}}{{item.detailAddress}}
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
      
      <div class="action-container">
        <el-button type="primary" icon="el-icon-edit" @click="goBack()">返回会员列表</el-button>
      </div>
    </div>
  </div>
</template>

<script>
  import {getMember} from '@/api/member';
  import {formatDate} from '@/utils/date';

  export default {
    name: "memberDetail",
    data() {
      return {
        loading: false,
        memberInfo: {}
      }
    },
    computed: {
      displayAddressList() {
        if (!this.memberInfo.addressList || this.memberInfo.addressList.length === 0) {
          return [];
        }
        return this.memberInfo.addressList.slice(0, 10);
      }
    },
    created() {
      this.getMemberInfo();
    },
    filters: {
      formatTime(time) {
        if (time == null || time === '') {
          return 'N/A';
        }
        let date = new Date(time);
        return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
      },
      formatDate(time) {
        if (time == null || time === '') {
          return 'N/A';
        }
        let date = new Date(time);
        return formatDate(date, 'yyyy-MM-dd')
      }
    },
    methods: {
      getMemberInfo() {
        this.loading = true;
        const id = this.$route.query.id;
        getMember(id).then(response => {
          this.memberInfo = response.data;
          this.loading = false;
        })
      },
      handleStatusChange() {
        this.$message({
          message: '会员状态更新成功',
          type: 'success',
          duration: 1000
        });
      },
      goBack() {
        this.$router.back();
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
  
  /* 页面标题 */
  .page-header {
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  }
  
  /* 卡片通用样式 */
  .box-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
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
  
  /* 会员信息表格 */
  .info-container {
    padding: 10px 5px;
  }
  
  .info-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .info-table th {
    font-weight: normal;
    color: #606266;
    width: 15%;
    text-align: right;
    padding: 15px 10px;
  }
  
  .info-table td {
    width: 35%;
    padding: 15px 10px;
    color: #303133;
  }
  
  .info-table tr {
    border-bottom: 1px solid #EBEEF5;
  }
  
  .info-table tr:last-child {
    border-bottom: none;
  }
  
  /* 数据样式 */
  .id-value {
    font-family: Consolas, Monaco, monospace;
    font-weight: bold;
    color: #606266;
  }
  
  .member-name, .phone-info, .time-info, .email-info {
    display: flex;
    align-items: center;
  }
  
  .member-icon, .phone-icon, .time-icon, .email-icon {
    margin-right: 8px;
  }
  
  .member-icon {
    color: #409EFF;
  }
  
  .phone-icon {
    color: #67C23A;
  }
  
  .time-icon {
    color: #909399;
  }
  
  .email-icon {
    color: #E6A23C;
  }
  
  /* 地址样式 */
  .address-container {
    padding: 10px 5px;
  }
  
  .address-item {
    border: 1px solid #EBEEF5;
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 8px;
    transition: all 0.3s;
    height: 100px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  .address-item:hover {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
  
  .default-address {
    border-color: #67C23A;
    background-color: #f0f9eb;
  }
  
  .address-header {
    display: flex;
    justify-content: space-between;
    padding-bottom: 10px;
    border-bottom: 1px dashed #EBEEF5;
    margin-bottom: 10px;
  }
  
  .address-name {
    font-weight: bold;
    color: #303133;
  }
  
  .address-detail {
    color: #606266;
    font-size: 14px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
  
  .address-detail i {
    color: #E6A23C;
    margin-right: 5px;
  }
  
  /* 按钮区域 */
  .action-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
</style> 