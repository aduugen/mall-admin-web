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
        <el-table-column label="操作" width="160" align="center">
          <template slot-scope="scope">
            <el-button size="mini"
                       type="text"
                       @click="handleViewDetail(scope.$index, scope.row)">查看详情
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
        <el-form-item label="是否启用">
          <el-switch v-model="memberForm.status" :active-value="1" :inactive-value="0"></el-switch>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addMemberDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleCreateMember('memberForm')">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  import {fetchList, createMember} from '@/api/member';
  import {formatDate} from '@/utils/date';

  export default {
    name: 'memberList',
    data() {
      return {
        list: null,
        total: null,
        listLoading: true,
        listQuery: {
          pageNum: 1,
          pageSize: 5,
          keyword: null
        },
        multipleSelection: [],
        addMemberDialogVisible: false,
        memberForm: {
          password: '',
          nickname: '',
          phone: '',
          email: '',
          gender: 0,
          birthday: null,
          status: 1
        },
        rules: {
          password: [
            { required: false, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
          ],
          nickname: [
            { required: true, message: '请输入会员昵称', trigger: 'blur' }
          ],
          phone: [
            { required: true, message: '请输入手机号码', trigger: 'blur' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
          ],
          email: [
            { required: false, message: '请输入邮箱', trigger: 'blur' },
            { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
          ]
        }
      }
    },
    created() {
      this.getList();
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
      resetMemberForm() {
        this.memberForm = {
          password: '',
          nickname: '',
          phone: '',
          email: '',
          gender: 0,
          birthday: null,
          status: 1
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
</style> 