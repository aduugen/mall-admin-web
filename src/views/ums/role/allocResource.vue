<template>
  <div class="app-container">
    <el-card class="form-container" shadow="hover">
      <div slot="header" class="clearfix">
        <span class="card-title">
          <i class="el-icon-folder-opened"></i> 
          分配资源权限
        </span>
        <el-button 
          style="float: right" 
          type="text" 
          icon="el-icon-back" 
          @click="$router.back()">
          返回角色列表
        </el-button>
      </div>
      
      <div class="resource-container">
        <!-- 角色信息和资源统计 -->
        <el-row :gutter="20" class="role-header">
          <el-col :span="16">
            <el-alert
              title="权限说明"
              type="info"
              description="勾选需要分配给角色的资源权限，可以通过分类标题快速选择整组资源"
              show-icon
              :closable="false">
            </el-alert>
          </el-col>
          <el-col :span="8">
            <div class="role-stats">
              <div class="stats-item">
                <span class="label">当前角色：</span>
                <el-tag size="medium">{{roleName || '未知角色'}}</el-tag>
              </div>
              <div class="stats-item">
                <span class="label">已选资源：</span>
                <el-tag type="success" size="medium">{{getCheckedResourceCount()}}</el-tag>
              </div>
              <div class="stats-item">
                <span class="label">资源分类：</span>
                <el-tag type="info" size="medium">{{allResourceCate ? allResourceCate.length : 0}}</el-tag>
              </div>
            </div>
          </el-col>
        </el-row>
        
        <!-- 资源分类容器 -->
        <el-collapse v-model="activeCategories" class="resource-collapse">
          <el-collapse-item 
            v-for="cate in allResourceCate" 
            :key="'cate'+cate.id"
            :name="cate.id"
            class="resource-category">
            <template slot="title">
              <div class="category-header">
                <el-checkbox 
                  v-model="cate.checked"
                  :indeterminate="isIndeterminate(cate.id)"
                  @change="handleCheckAllChange(cate)"
                  class="category-checkbox">
                </el-checkbox>
                <span class="category-name">{{cate.name}}</span>
                <el-tag 
                  size="mini" 
                  type="info" 
                  class="resource-count">
                  {{getResourceByCate(cate.id) ? getResourceByCate(cate.id).length : 0}}
                </el-tag>
              </div>
            </template>
            
            <div class="resource-list">
              <el-row :gutter="10">
                <el-col 
                  :span="8" 
                  v-for="resource in getResourceByCate(cate.id)" 
                  :key="resource.id"
                  class="resource-item-col">
                  <div 
                    :class="['resource-item', resource.checked ? 'resource-checked' : '']"
                    @click="toggleResourceCheck(resource)">
                    <el-checkbox 
                      v-model="resource.checked" 
                      @change="handleCheckChange(resource)"
                      class="resource-checkbox">
                      <span class="resource-name">{{resource.name}}</span>
                    </el-checkbox>
                    <el-tooltip 
                      v-if="resource.url" 
                      :content="resource.url" 
                      placement="top">
                      <i class="el-icon-info resource-info"></i>
                    </el-tooltip>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-collapse-item>
        </el-collapse>
        
        <!-- 自定义分隔线 -->
        <div class="custom-divider">
          <span class="divider-text">资源分配操作</span>
        </div>
        
        <!-- 操作按钮区 -->
        <div class="resource-buttons">
          <el-button 
            type="primary" 
            icon="el-icon-check" 
            @click="handleSave()">
            保存分配
          </el-button>
          <el-button 
            type="info" 
            plain 
            icon="el-icon-close" 
            @click="handleClear()">
            清空选择
          </el-button>
          <el-button 
            type="success" 
            plain 
            icon="el-icon-finished" 
            @click="selectAll()">
            全选
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
  import {fetchAllResourceList} from '@/api/resource';
  import {listAllCate} from '@/api/resourceCategory';
  import {allocResource,listResourceByRole} from '@/api/role';

  export default {
    name: "allocResource",
    data() {
      return {
        roleId: null,
        roleName: '',
        allResource: null,
        allResourceCate: null,
        activeCategories: [], // 当前展开的分类
      };
    },
    created() {
      this.roleId = this.$route.query.roleId;
      this.roleName = this.$route.query.roleName || '角色ID-' + this.roleId;
      this.getAllResourceCateList();
    },
    methods: {
      getAllResourceList() {
        fetchAllResourceList().then(response => {
          this.allResource = response.data;
          for (let i = 0; i < this.allResource.length; i++) {
            this.allResource[i].checked = false;
          }
          this.getResourceByRole(this.roleId);
          // 默认展开所有分类
          if (this.allResourceCate && this.allResourceCate.length > 0) {
            this.activeCategories = this.allResourceCate.map(item => item.id);
          }
        });
      },
      getAllResourceCateList() {
        listAllCate().then(response => {
          this.allResourceCate = response.data;
          for (let i = 0; i < this.allResourceCate.length; i++) {
            this.allResourceCate[i].checked = false;
          }
          this.getAllResourceList();
        });
      },
      getResourceByCate(categoryId) {
        let cateResource = [];
        if (this.allResource == null) return null;
        for (let i = 0; i < this.allResource.length; i++) {
          let resource = this.allResource[i];
          if (resource.categoryId === categoryId) {
            cateResource.push(resource);
          }
        }
        return cateResource;
      },
      getResourceByRole(roleId){
        listResourceByRole(roleId).then(response=>{
          let allocResource = response.data;
          this.allResource.forEach(item=>{
            item.checked = this.getResourceChecked(item.id,allocResource);
          });
          this.allResourceCate.forEach(item=>{
            item.checked = this.isAllChecked(item.id);
          });
          this.$forceUpdate();
        });
      },
      getResourceChecked(resourceId,allocResource){
        if(allocResource==null||allocResource.length===0) return false;
        for(let i=0;i<allocResource.length;i++){
          if(allocResource[i].id===resourceId){
            return true;
          }
        }
        return false;
      },
      isIndeterminate(categoryId) {
        let cateResources = this.getResourceByCate(categoryId);
        if (cateResources == null) return false;
        let checkedCount = 0;
        for (let i = 0; i < cateResources.length; i++) {
          if (cateResources[i].checked === true) {
            checkedCount++;
          }
        }
        return !(checkedCount === 0 || checkedCount === cateResources.length);
      },
      isAllChecked(categoryId) {
        let cateResources = this.getResourceByCate(categoryId);
        if (cateResources == null) return false;
        let checkedCount = 0;
        for (let i = 0; i < cateResources.length; i++) {
          if (cateResources[i].checked === true) {
            checkedCount++;
          }
        }
        if(checkedCount===0){
          return false;
        }
        return checkedCount === cateResources.length;
      },
      handleSave() {
        this.$confirm('确认要为该角色分配资源权限吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let checkedResourceIds = new Set();
          if (this.allResource != null && this.allResource.length > 0) {
            this.allResource.forEach(item => {
              if (item.checked) {
                checkedResourceIds.add(item.id);
              }
            });
          }
          let params = new URLSearchParams();
          params.append("roleId", this.roleId);
          params.append("resourceIds", Array.from(checkedResourceIds));
          allocResource(params).then(response => {
            this.$message({
              message: '分配成功',
              type: 'success',
              duration: 1000
            });
            this.$router.back();
          })
        })
      },
      handleClear() {
        this.allResourceCate.forEach(item => {
          item.checked = false;
        });
        this.allResource.forEach(item => {
          item.checked = false;
        });
        this.$forceUpdate();
      },
      handleCheckAllChange(cate) {
        let cateResources = this.getResourceByCate(cate.id);
        for (let i = 0; i < cateResources.length; i++) {
          cateResources[i].checked = cate.checked;
        }
        this.$forceUpdate();
      },
      handleCheckChange(resource) {
        this.allResourceCate.forEach(item=>{
          if(item.id===resource.categoryId){
            item.checked = this.isAllChecked(resource.categoryId);
          }
        });
        this.$forceUpdate();
      },
      toggleResourceCheck(resource) {
        // 点击资源项时切换选中状态
        resource.checked = !resource.checked;
        this.handleCheckChange(resource);
      },
      selectAll() {
        // 全选所有资源
        this.allResourceCate.forEach(item => {
          item.checked = true;
        });
        this.allResource.forEach(item => {
          item.checked = true;
        });
        this.$forceUpdate();
      },
      getCheckedResourceCount() {
        // 计算已选中的资源数量
        if (!this.allResource) return 0;
        return this.allResource.filter(item => item.checked).length;
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
  
  .resource-container {
    padding: 10px 0;
  }
  
  /* 角色信息和统计 */
  .role-header {
    margin-bottom: 20px;
  }
  
  .role-stats {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    background: #f8f9fb;
    border-radius: 4px;
    padding: 10px 15px;
    border-left: 3px solid #409EFF;
  }
  
  .stats-item {
    display: flex;
    align-items: center;
    margin: 5px 0;
  }
  
  .stats-item .label {
    margin-right: 10px;
    color: #606266;
    font-weight: 500;
  }
  
  /* 资源分类样式 */
  .resource-collapse {
    border: 0;
  }
  
  .resource-category {
    margin-bottom: 10px;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .category-header {
    display: flex;
    align-items: center;
  }
  
  .category-checkbox {
    margin-right: 8px;
  }
  
  .category-name {
    font-weight: bold;
    color: #303133;
  }
  
  .resource-count {
    margin-left: 8px;
  }
  
  /* 资源列表样式 */
  .resource-list {
    padding: 5px 0;
  }
  
  .resource-item-col {
    margin-bottom: 10px;
  }
  
  .resource-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    border-radius: 4px;
    border: 1px solid #EBEEF5;
    transition: all 0.3s;
    cursor: pointer;
  }
  
  .resource-item:hover {
    background-color: #f5f7fa;
    border-color: #E6EBF5;
  }
  
  .resource-checked {
    background-color: #ecf5ff;
    border-color: #d9ecff;
  }
  
  .resource-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .resource-info {
    margin-left: 5px;
    color: #909399;
    cursor: help;
  }
  
  /* 自定义分隔线 */
  .custom-divider {
    display: flex;
    align-items: center;
    margin: 20px 0;
    color: #909399;
    font-size: 14px;
  }
  
  .custom-divider:before,
  .custom-divider:after {
    content: '';
    flex: 1;
    height: 1px;
    background: #DCDFE6;
  }
  
  .divider-text {
    padding: 0 15px;
  }
  
  /* 操作按钮区 */
  .resource-buttons {
    margin-top: 20px;
    text-align: center;
  }
  
  .resource-buttons .el-button {
    margin: 0 10px;
    padding: 10px 20px;
  }
  
  /* Element UI 组件样式重写 */
  ::v-deep .el-collapse-item__header {
    background-color: #f8f9fb;
    border-left: 3px solid #409EFF;
    padding-left: 10px;
    font-weight: bold;
  }
  
  ::v-deep .el-collapse-item__wrap {
    padding: 10px;
    background-color: #fff;
  }
  
  ::v-deep .el-checkbox__input.is-checked .el-checkbox__inner,
  ::v-deep .el-checkbox__input.is-indeterminate .el-checkbox__inner {
    background-color: #409EFF;
    border-color: #409EFF;
  }
</style>
