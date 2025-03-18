<template>
  <div class="app-container">
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>会员详情</span>
    </el-card>
    <div v-loading="loading">
      <el-card class="box-card" style="margin-top: 15px">
        <div slot="header" class="clearfix">
          <span>基本信息</span>
        </div>
        <div>
          <table class="table">
            <tr>
              <th>会员ID：</th>
              <td>{{memberInfo.id}}</td>
              <th>会员昵称：</th>
              <td>{{memberInfo.nickname}}</td>
            </tr>
            <tr>
              <th>会员等级：</th>
              <td>{{memberInfo.levelName}}</td>
              <th>会员状态：</th>
              <td>
                <el-switch
                  @change="handleStatusChange()"
                  :active-value="1"
                  :inactive-value="0"
                  v-model="memberInfo.status">
                </el-switch>
              </td>
            </tr>
            <tr>
              <th>联系电话：</th>
              <td>{{memberInfo.phone}}</td>
              <th>注册时间：</th>
              <td>{{memberInfo.createTime | formatTime}}</td>
            </tr>
            <tr>
              <th>性别：</th>
              <td>
                <el-tag v-if="memberInfo.gender===0" type="info">未知</el-tag>
                <el-tag v-if="memberInfo.gender===1" type="success">男</el-tag>
                <el-tag v-if="memberInfo.gender===2" type="danger">女</el-tag>
              </td>
              <th>生日：</th>
              <td>{{memberInfo.birthday | formatDate}}</td>
            </tr>
          </table>
        </div>
      </el-card>
      <el-card class="box-card" style="margin-top: 15px">
        <div slot="header" class="clearfix">
          <span>收货地址</span>
          <span style="float: right; color: #999; font-size: 12px" v-if="memberInfo.addressList && memberInfo.addressList.length>0">
            共{{memberInfo.addressList.length}}个，最多显示10个
          </span>
        </div>
        <div v-if="!memberInfo.addressList || memberInfo.addressList.length===0">
          <span style="font-size: 14px; color: #999">暂无收货地址</span>
        </div>
        <div v-for="item in displayAddressList" :key="item.id">
          <el-card shadow="never" style="margin-top: 15px">
            <div class="address-item">
              <el-tag v-if="item.defaultStatus===1" type="success" size="small">默认</el-tag>
              <span class="name">{{item.name}}</span>
              <span class="phone">{{item.phoneNumber}}</span>
              <span class="address">{{item.province}} {{item.city}} {{item.region}} {{item.detailAddress}}</span>
            </div>
          </el-card>
        </div>
      </el-card>
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
  .box-card {
    width: 100%;
    margin-bottom: 15px;
  }
  .table {
    width: 100%;
    margin: 15px 0;
    border: 1px solid #dcdfe6;
    border-collapse: collapse;
  }
  .table th {
    text-align: right;
    font-weight: normal;
    color: #303133;
    width: 150px;
    padding: 15px 20px;
    border: 1px solid #dcdfe6;
  }
  .table td {
    padding: 15px 20px;
    border: 1px solid #dcdfe6;
  }
  .address-item {
    display: flex;
    align-items: center;
  }
  .address-item .name {
    margin-left: 10px;
    font-size: 14px;
    font-weight: bold;
  }
  .address-item .phone {
    margin-left: 15px;
    color: #606266;
  }
  .address-item .address {
    margin-left: 15px;
    color: #606266;
  }
</style> 