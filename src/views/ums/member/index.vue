<template>
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <div>
        <i class="el-icon-search"></i>
        <span>筛选搜索</span>
        <el-button
          style="float: right"
          type="primary"
          @click="handleSearchList()"
          size="small">
          查询结果
        </el-button>
        <el-button
          style="float: right;margin-right: 15px"
          @click="handleResetSearch()"
          size="small">
          重置
        </el-button>
      </div>
      <div style="margin-top: 15px">
        <el-form :inline="true" :model="listQuery" size="small" label-width="140px">
          <el-form-item label="会员搜索：">
            <el-input style="width: 203px" v-model="listQuery.keyword" placeholder="会员名称/手机号码"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>数据列表</span>
      <el-button
        class="btn-add"
        size="mini"
        type="primary"
        @click="handleAddMember()">
        添加会员
      </el-button>
    </el-card>
    <div class="table-container">
      <el-table ref="memberTable"
                :data="list"
                style="width: 100%"
                @selection-change="handleSelectionChange"
                v-loading="listLoading"
                border>
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        <el-table-column label="ID" width="80" align="center">
          <template slot-scope="scope">{{scope.row.id}}</template>
        </el-table-column>
        <el-table-column label="会员昵称" align="center">
          <template slot-scope="scope">{{scope.row.nickname}}</template>
        </el-table-column>
        <el-table-column label="会员等级" width="120" align="center">
          <template slot-scope="scope">{{scope.row.levelName}}</template>
        </el-table-column>
        <el-table-column label="联系电话" width="120" align="center">
          <template slot-scope="scope">{{scope.row.phone}}</template>
        </el-table-column>
        <el-table-column label="创建时间" width="160" align="center">
          <template slot-scope="scope">{{scope.row.createTime | formatTime}}</template>
        </el-table-column>
        <el-table-column label="启用状态" width="160" align="center">
          <template slot-scope="scope">
            <el-switch
              @change="handleStatusChange(scope.$index, scope.row)"
              :active-value="1"
              :inactive-value="0"
              v-model="scope.row.status">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template slot-scope="scope">
            <el-button size="mini"
                       type="text"
                       @click="handleViewDetail(scope.$index, scope.row)">查看详情
            </el-button>
            <el-button size="mini"
                       type="text"
                       @click="handleUpdateMember(scope.$index, scope.row)">修改
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination-container">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        layout="total, sizes,prev, pager, next,jumper"
        :page-size="listQuery.pageSize"
        :page-sizes="[5, 10, 15]"
        :current-page.sync="listQuery.pageNum"
        :total="total">
      </el-pagination>
    </div>
    
    <!-- 添加会员对话框 -->
    <el-dialog 
      title="添加会员" 
      :visible.sync="addMemberDialogVisible" 
      width="40%">
      <el-form :model="memberForm" 
               :rules="rules" 
               ref="memberForm" 
               label-width="100px">
        <el-form-item label="会员昵称" prop="nickname">
          <el-input v-model="memberForm.nickname" placeholder="请输入会员昵称"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="memberForm.password" type="password" placeholder="请输入密码，默认为123456"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="memberForm.phone" placeholder="请输入手机号码"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="memberForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="memberForm.gender">
            <el-radio :label="0">未知</el-radio>
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="生日">
          <el-date-picker
            v-model="memberForm.birthday"
            type="date"
            placeholder="选择日期"
            value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="会员等级" prop="memberLevelId">
          <el-select v-model="memberForm.memberLevelId" placeholder="请选择会员等级">
            <el-option
              v-for="item in memberLevels"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="收货地址">
          <div v-for="(address, index) in memberForm.addresses" :key="index" class="address-item">
            <el-form :model="address" :rules="addressRules" ref="addressForm">
              <el-row :gutter="10">
                <el-col :span="6">
                  <el-form-item label="收货人" prop="name">
                    <el-input v-model="address.name" placeholder="收货人姓名"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="手机号码" prop="phoneNumber">
                    <el-input v-model="address.phoneNumber" placeholder="手机号码"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="默认地址">
                    <el-switch v-model="address.defaultStatus" :active-value="1" :inactive-value="0"
                              @change="handleDefaultAddressChange(index)"></el-switch>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-button type="text" @click="removeAddress(index)" v-if="memberForm.addresses.length > 1">删除</el-button>
                </el-col>
              </el-row>
              <el-row :gutter="10">
                <el-col :span="6">
                  <el-form-item label="省份" prop="province">
                    <el-input v-model="address.province" placeholder="省份"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="城市" prop="city">
                    <el-input v-model="address.city" placeholder="城市"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="区县" prop="region">
                    <el-input v-model="address.region" placeholder="区县"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item label="详细地址" prop="detailAddress">
                    <el-input v-model="address.detailAddress" placeholder="详细地址"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
          <el-button type="text" @click="addAddress" v-if="memberForm.addresses.length < 10">添加收货地址</el-button>
        </el-form-item>
        <el-form-item label="是否启用">
          <el-switch v-model="memberForm.status" :active-value="1" :inactive-value="0"></el-switch>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addMemberDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleCreateMember('memberForm')">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改会员对话框 -->
    <el-dialog 
      title="修改会员" 
      :visible.sync="updateMemberDialogVisible" 
      width="40%">
      <el-form :model="memberForm" 
               :rules="rules" 
               ref="memberForm" 
               label-width="100px">
        <el-form-item label="会员昵称" prop="nickname">
          <el-input v-model="memberForm.nickname" placeholder="请输入会员昵称"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="memberForm.password" type="password" placeholder="不修改请留空"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="memberForm.phone" placeholder="请输入手机号码"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="memberForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="memberForm.gender">
            <el-radio :label="0">未知</el-radio>
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="生日">
          <el-date-picker
            v-model="memberForm.birthday"
            type="date"
            placeholder="选择日期"
            value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="会员等级" prop="memberLevelId">
          <el-select v-model="memberForm.memberLevelId" placeholder="请选择会员等级">
            <el-option
              v-for="item in memberLevels"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="收货地址">
          <div v-for="(address, index) in memberForm.addresses" :key="index" class="address-item">
            <el-form :model="address" :rules="addressRules" ref="addressForm">
              <el-row :gutter="10">
                <el-col :span="6">
                  <el-form-item label="收货人" prop="name">
                    <el-input v-model="address.name" placeholder="收货人姓名"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="手机号码" prop="phoneNumber">
                    <el-input v-model="address.phoneNumber" placeholder="手机号码"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="默认地址">
                    <el-switch v-model="address.defaultStatus" :active-value="1" :inactive-value="0"
                              @change="handleDefaultAddressChange(index)"></el-switch>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-button type="text" @click="removeAddress(index)" v-if="memberForm.addresses.length > 1">删除</el-button>
                </el-col>
              </el-row>
              <el-row :gutter="10">
                <el-col :span="6">
                  <el-form-item label="省份" prop="province">
                    <el-input v-model="address.province" placeholder="省份"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="城市" prop="city">
                    <el-input v-model="address.city" placeholder="城市"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="区县" prop="region">
                    <el-input v-model="address.region" placeholder="区县"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item label="详细地址" prop="detailAddress">
                    <el-input v-model="address.detailAddress" placeholder="详细地址"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
          <el-button type="text" @click="addAddress" v-if="memberForm.addresses.length < 10">添加收货地址</el-button>
        </el-form-item>
        <el-form-item label="是否启用">
          <el-switch v-model="memberForm.status" :active-value="1" :inactive-value="0"></el-switch>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="updateMemberDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleUpdateMemberSubmit('memberForm')">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  import {fetchList, createMember, updateMember, getMemberLevels} from '@/api/member';
  import {formatDate} from '@/utils/date';

  export default {
    name: 'memberList',
    data() {
      return {
        list: null,
        total: null,
        listLoading: true,
        memberLevels: [],
        listQuery: {
          pageNum: 1,
          pageSize: 5,
          keyword: null
        },
        multipleSelection: [],
        addMemberDialogVisible: false,
        updateMemberDialogVisible: false,
        currentMemberId: null,
        memberForm: {
          password: '',
          nickname: '',
          phone: '',
          email: '',
          gender: 0,
          birthday: null,
          status: 1,
          memberLevelId: null,
          addresses: [{
            name: '',
            phoneNumber: '',
            defaultStatus: 0,
            province: '',
            city: '',
            region: '',
            detailAddress: ''
          }]
        },
        rules: {
          nickname: [
            { required: false, message: '请输入会员昵称', trigger: 'blur' }
          ],
          phone: [
            { required: true, message: '请输入手机号码', trigger: 'blur' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
          ],
          email: [
            { required: false, message: '请输入邮箱', trigger: 'blur' },
            { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
          ],
          memberLevelId: [
            { required: false, message: '请选择会员等级', trigger: 'change' }
          ]
        },
        addressRules: {
          name: [
            { required: false, message: '请输入收货人姓名', trigger: 'blur' }
          ],
          phoneNumber: [
            { required: false, message: '请输入手机号码', trigger: 'blur' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
          ],
          province: [
            { required: false, message: '请输入省份', trigger: 'blur' }
          ],
          city: [
            { required: false, message: '请输入城市', trigger: 'blur' }
          ],
          region: [
            { required: false, message: '请输入区县', trigger: 'blur' }
          ],
          detailAddress: [
            { required: false, message: '请输入详细地址', trigger: 'blur' }
          ]
        }
      }
    },
    created() {
      this.getList();
      this.getMemberLevels();
    },
    filters: {
      formatTime(time) {
        if (time == null || time === '') {
          return 'N/A';
        }
        let date = new Date(time);
        return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
      }
    },
    methods: {
      getList() {
        this.listLoading = true;
        fetchList(this.listQuery).then(response => {
          this.listLoading = false;
          this.list = response.data.list;
          this.total = response.data.total;
        });
      },
      handleResetSearch() {
        this.listQuery = {
          pageNum: 1,
          pageSize: 5,
          keyword: null
        };
        this.getList();
      },
      handleSearchList() {
        this.listQuery.pageNum = 1;
        this.getList();
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      handleSizeChange(val) {
        this.listQuery.pageNum = 1;
        this.listQuery.pageSize = val;
        this.getList();
      },
      handleCurrentChange(val) {
        this.listQuery.pageNum = val;
        this.getList();
      },
      handleStatusChange(index, row) {
        this.$message({
          message: '会员状态更新成功',
          type: 'success',
          duration: 1000
        });
      },
      handleViewDetail(index, row) {
        this.$router.push({path: '/ums/memberDetail', query: {id: row.id}})
      },
      handleAddMember() {
        this.addMemberDialogVisible = true;
        this.resetMemberForm();
      },
      getMemberLevels() {
        getMemberLevels().then(response => {
          this.memberLevels = response.data;
          // 设置默认会员等级为普通会员
          const defaultLevel = this.memberLevels.find(level => level.defaultStatus === 1);
          if (defaultLevel) {
            this.memberForm.memberLevelId = defaultLevel.id;
          }
        });
      },
      addAddress() {
        if (this.memberForm.addresses.length < 10) {
          this.memberForm.addresses.push({
            name: '',
            phoneNumber: '',
            defaultStatus: 0,
            province: '',
            city: '',
            region: '',
            detailAddress: ''
          });
        }
      },
      removeAddress(index) {
        this.memberForm.addresses.splice(index, 1);
      },
      handleDefaultAddressChange(index) {
        // 将其他地址设置为非默认
        this.memberForm.addresses.forEach((address, i) => {
          if (i !== index) {
            address.defaultStatus = 0;
          }
        });
      },
      resetMemberForm() {
        this.memberForm = {
          password: '',
          nickname: '',
          phone: '',
          email: '',
          gender: 0,
          birthday: null,
          status: 1,
          memberLevelId: null,
          addresses: [{
            name: '',
            phoneNumber: '',
            defaultStatus: 0,
            province: '',
            city: '',
            region: '',
            detailAddress: ''
          }]
        };
        if (this.$refs.memberForm) {
          this.$refs.memberForm.resetFields();
        }
      },
      handleCreateMember(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            // 使用手机号作为登录名
            const memberData = { ...this.memberForm };
            memberData.username = memberData.phone;
            
            createMember(memberData).then(response => {
              this.$message({
                message: '添加会员成功',
                type: 'success',
                duration: 1000
              });
              this.addMemberDialogVisible = false;
              this.getList();
            }).catch(error => {
              console.error('添加会员失败:', error);
            });
          } else {
            console.log('表单验证失败');
            return false;
          }
        });
      },
      handleUpdateMember(index, row) {
        this.updateMemberDialogVisible = true;
        this.currentMemberId = row.id;
        this.memberForm = {
          ...row,
          password: '', // 密码留空
          addresses: row.addresses || [{
            name: '',
            phoneNumber: '',
            defaultStatus: 0,
            province: '',
            city: '',
            region: '',
            detailAddress: ''
          }]
        };
      },
      handleUpdateMemberSubmit(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            const memberData = { ...this.memberForm };
            if (!memberData.password) {
              delete memberData.password; // 如果密码为空，则不更新密码
            }
            
            updateMember(this.currentMemberId, memberData).then(response => {
              this.$message({
                message: '修改会员成功',
                type: 'success',
                duration: 1000
              });
              this.updateMemberDialogVisible = false;
              this.getList();
            }).catch(error => {
              console.error('修改会员失败:', error);
            });
          } else {
            console.log('表单验证失败');
            return false;
          }
        });
      }
    }
  }
</script>
<style scoped>
  .filter-container {
    margin-bottom: 10px;
  }
  .operate-container {
    margin-top: 20px;
  }
  .operate-container .btn-add {
    float: right;
  }
  .table-container {
    margin-top: 20px;
  }
  .pagination-container {
    display: inline-block;
    float: right;
    margin-top: 20px;
  }
  .address-item {
    border: 1px solid #EBEEF5;
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 4px;
  }
</style> 