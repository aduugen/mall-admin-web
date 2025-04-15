<template>
  <el-card class="form-container" shadow="hover">
    <div slot="header" class="clearfix" v-if="!isEdit">
      <span class="card-title">
        <i class="el-icon-plus"></i> 
        添加菜单
      </span>
    </div>
    
    <el-form 
      :model="menu"
      :rules="rules"
      ref="menuFrom"
      label-width="100px"
      size="small"
      status-icon>
      <el-divider content-position="left">
        <i class="el-icon-s-operation"></i> 基本信息
      </el-divider>
      
      <!-- 基本信息 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="菜单名称：" prop="title">
            <el-input 
              v-model="menu.title" 
              placeholder="请输入菜单名称"
              clearable>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="上级菜单：">
            <el-select 
              v-model="menu.parentId"
              placeholder="请选择上级菜单"
              style="width: 100%"
              clearable>
              <el-option
                v-for="item in selectMenuList"
                :key="item.id"
                :label="item.title"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-divider content-position="left">
        <i class="el-icon-s-platform"></i> 前端配置
      </el-divider>
      
      <!-- 前端配置 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="前端名称：" prop="name">
            <el-input 
              v-model="menu.name" 
              placeholder="请输入路由名称"
              clearable>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="前端图标：" prop="icon">
            <el-input 
              v-model="menu.icon" 
              placeholder="菜单图标名称" 
              clearable>
              <template slot="append">
                <svg-icon v-if="menu.icon" :icon-class="menu.icon"></svg-icon>
                <i v-else class="el-icon-picture-outline"></i>
              </template>
            </el-input>
            <div class="icon-tip">
              使用 Element UI 的图标，例如：user、setting、menu 等
            </div>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-divider content-position="left">
        <i class="el-icon-s-tools"></i> 配置选项
      </el-divider>
      
      <!-- 其他配置 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="是否显示：">
            <el-switch
              v-model="menuHidden"
              active-text="显示" 
              inactive-text="隐藏"
              active-color="#13ce66"
              inactive-color="#ff4949">
            </el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序：">
            <el-input-number 
              v-model="menu.sort" 
              :min="0" 
              :max="1000"
              controls-position="right">
            </el-input-number>
            <div class="sort-tip">
              数字越小越靠前
            </div>
          </el-form-item>
        </el-col>
      </el-row>
      
      <!-- 操作按钮 -->
      <el-form-item>
        <div class="form-footer">
          <el-button 
            type="primary" 
            icon="el-icon-check" 
            @click="onSubmit('menuFrom')">
            {{ isEdit ? '保存修改' : '添加菜单' }}
          </el-button>
          <el-button 
            v-if="!isEdit" 
            icon="el-icon-refresh-left" 
            @click="resetForm('menuFrom')">
            重置表单
          </el-button>
          <el-button 
            icon="el-icon-back" 
            @click="$router.back()">
            返回列表
          </el-button>
        </div>
      </el-form-item>
    </el-form>
    
    <div v-if="!isEdit" class="tips">
      <el-alert
        title="提示：新添加的菜单将自动分配给超级管理员角色"
        type="info"
        show-icon
        :closable="false">
      </el-alert>
    </div>
  </el-card>
</template>

<script>
  import {fetchList, createMenu, updateMenu, getMenu} from '@/api/menu';

  const defaultMenu = {
    title: '',
    parentId: 0,
    name: '',
    icon: '',
    hidden: 0,
    sort: 0
  };
  export default {
    name: "MenuDetail",
    props: {
      isEdit: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        menu: Object.assign({}, defaultMenu),
        selectMenuList: [],
        rules: {
          title: [
            {required: true, message: '请输入菜单名称', trigger: 'blur'},
            {min: 2, max: 140, message: '长度在 2 到 140 个字符', trigger: 'blur'}
          ],
          name: [
            {required: true, message: '请输入前端名称', trigger: 'blur'},
            {min: 2, max: 140, message: '长度在 2 到 140 个字符', trigger: 'blur'}
          ],
          icon: [
            {required: true, message: '请输入前端图标', trigger: 'blur'},
            {min: 2, max: 140, message: '长度在 2 到 140 个字符', trigger: 'blur'}
          ]
        }
      }
    },
    computed: {
      menuHidden: {
        get() {
          return this.menu.hidden === 0;
        },
        set(value) {
          this.menu.hidden = value ? 0 : 1;
        }
      }
    },
    created() {
      if (this.isEdit) {
        getMenu(this.$route.query.id).then(response => {
          this.menu = response.data;
        });
      } else {
        this.menu = Object.assign({}, defaultMenu);
      }
      this.getSelectMenuList();
    },
    methods: {
      getSelectMenuList() {
        fetchList(0, {pageSize: 100, pageNum: 1}).then(response => {
          this.selectMenuList = response.data.list;
          this.selectMenuList.unshift({id: 0, title: '无上级菜单'});
        });
      },
      onSubmit(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$confirm('是否提交数据', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              if (this.isEdit) {
                updateMenu(this.$route.query.id, this.menu).then(response => {
                  this.$message({
                    message: '修改成功',
                    type: 'success',
                    duration: 1000
                  });
                  this.$router.back();
                });
              } else {
                createMenu(this.menu).then(response => {
                  this.$refs[formName].resetFields();
                  this.resetForm(formName);
                  this.$message({
                    message: '提交成功',
                    type: 'success',
                    duration: 1000
                  });
                  this.$router.back();
                });
              }
            });

          } else {
            this.$message({
              message: '验证失败',
              type: 'error',
              duration: 1000
            });
            return false;
          }
        });
      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
        this.menu = Object.assign({}, defaultMenu);
        this.getSelectMenuList();
      },
    }
  }
</script>

<style scoped>
.form-container {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
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

.form-footer {
  margin-top: 20px;
  text-align: center;
}

.tips {
  margin-top: 20px;
}

.icon-tip, .sort-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  line-height: 1.2;
}

::v-deep .el-divider__text {
  background-color: #ffffff;
  color: #409EFF;
  font-weight: bold;
  font-size: 14px;
}

::v-deep .el-divider--horizontal {
  margin: 20px 0;
}

::v-deep .el-divider__text i {
  margin-right: 5px;
}
</style>
