<template>
  <div class="app-container">
    <el-card class="form-container" shadow="hover">
      <div slot="header" class="clearfix">
        <span class="card-title">
          <i class="el-icon-menu"></i> 
          分配菜单权限
        </span>
        <el-button 
          style="float: right" 
          type="text" 
          icon="el-icon-back" 
          @click="$router.back()">
          返回角色列表
        </el-button>
      </div>
      
      <div class="tree-container">
        <!-- 角色信息和菜单统计 -->
        <el-row :gutter="20" class="role-header">
          <el-col :span="16">
            <el-alert
              title="权限说明"
              type="info"
              description="勾选需要分配给角色的菜单权限，子菜单会自动关联父级菜单"
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
                <span class="label">已选菜单：</span>
                <el-tag type="success" size="medium">{{checkedCount}}</el-tag>
              </div>
            </div>
          </el-col>
        </el-row>
        
        <!-- 树形控件操作栏 -->
        <div class="tree-toolbar">
          <div class="left-actions">
            <el-input
              placeholder="输入关键字进行过滤"
              v-model="filterText"
              clearable
              prefix-icon="el-icon-search"
              class="filter-input">
            </el-input>
          </div>
          
          <div class="right-actions">
            <el-tooltip content="展开所有" placement="top">
              <el-button 
                type="text" 
                icon="el-icon-arrow-down" 
                @click="expandAll">
              </el-button>
            </el-tooltip>
            <el-tooltip content="收起所有" placement="top">
              <el-button 
                type="text" 
                icon="el-icon-arrow-up" 
                @click="collapseAll">
              </el-button>
            </el-tooltip>
            <el-tooltip content="全选" placement="top">
              <el-button 
                type="text" 
                icon="el-icon-finished" 
                @click="checkAll">
              </el-button>
            </el-tooltip>
          </div>
        </div>
        
        <!-- 树形控件主视图 -->
        <div class="tree-view">
          <el-tree
            :data="menuTreeList"
            show-checkbox
            node-key="id"
            ref="tree"
            highlight-current
            :expand-on-click-node="false"
            :props="defaultProps"
            :filter-node-method="filterNode"
            @check="handleCheckChange"
            class="menu-tree">
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <span>
                <i :class="getMenuIcon(data)" class="menu-icon"></i>
                {{ node.label }}
              </span>
              <span v-if="data.children && data.children.length" class="node-count">
                ({{data.children.length}})
              </span>
            </span>
          </el-tree>
        </div>
        
        <!-- 自定义分隔线 -->
        <div class="custom-divider">
          <span class="divider-text">菜单分配操作</span>
        </div>
        
        <!-- 操作按钮区 -->
        <div class="tree-buttons">
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
            type="warning" 
            plain 
            icon="el-icon-refresh" 
            @click="handleReset()">
            重置
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
  import {fetchTreeList} from '@/api/menu';
  import {listMenuByRole,allocMenu} from '@/api/role';

  export default {
    name: "allocMenu",
    data() {
      return {
        menuTreeList: [],
        defaultProps: {
          children: 'children',
          label: 'title'
        },
        roleId: null,
        roleName: '',
        filterText: '',
        originalCheckedKeys: [], // 保存初始选中状态
        checkedCount: 0,
        menuIconMap: {
          // 常见菜单模块的默认图标
          '首页': 'el-icon-s-home',
          '商品': 'el-icon-goods',
          '订单': 'el-icon-s-order',
          '营销': 'el-icon-s-promotion',
          '权限': 'el-icon-s-custom',
          '系统': 'el-icon-s-tools',
          '设置': 'el-icon-setting'
        }
      };
    },
    created() {
      this.roleId = this.$route.query.roleId;
      this.roleName = this.$route.query.roleName || '角色ID-' + this.roleId;
      this.treeList();
    },
    mounted() {
      if (this.roleId) {
        this.getRoleMenu(this.roleId);
      }
    },
    watch: {
      filterText(val) {
        this.$refs.tree.filter(val);
      }
    },
    methods: {
      treeList() {
        fetchTreeList().then(response => {
          this.menuTreeList = response.data;
        });
      },
      getRoleMenu(roleId){
        listMenuByRole(roleId).then(response=>{
          let menuList = response.data;
          let checkedMenuIds=[];
          if(menuList!=null&&menuList.length>0){
            for(let i=0;i<menuList.length;i++){
              let menu = menuList[i];
              if(menu.parentId!==0){
                checkedMenuIds.push(menu.id);
              }
            }
          }
          this.$refs.tree.setCheckedKeys(checkedMenuIds);
          this.originalCheckedKeys = [...checkedMenuIds]; // 保存初始选中状态
          this.checkedCount = checkedMenuIds.length;
        });
      },
      handleSave() {
        let checkedNodes = this.$refs.tree.getCheckedNodes();
        let checkedMenuIds=new Set();
        if(checkedNodes!=null&&checkedNodes.length>0){
          for(let i=0;i<checkedNodes.length;i++){
            let checkedNode = checkedNodes[i];
            checkedMenuIds.add(checkedNode.id);
            if(checkedNode.parentId!==0){
              checkedMenuIds.add(checkedNode.parentId);
            }
          }
        }
        this.$confirm('确认要为该角色分配菜单权限吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(()=>{
          let params = new URLSearchParams();
          params.append("roleId",this.roleId);
          params.append("menuIds",Array.from(checkedMenuIds));
          allocMenu(params).then(response => {
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
        this.$refs.tree.setCheckedKeys([]);
        this.checkedCount = 0;
      },
      handleReset() {
        // 重置为初始状态
        this.$refs.tree.setCheckedKeys(this.originalCheckedKeys);
        this.checkedCount = this.originalCheckedKeys.length;
      },
      filterNode(value, data) {
        if (!value) return true;
        return data.title.toLowerCase().indexOf(value.toLowerCase()) !== -1;
      },
      handleCheckChange() {
        // 获取当前选中的节点数
        this.checkedCount = this.$refs.tree.getCheckedKeys().length;
      },
      expandAll() {
        // 展开所有节点
        const allNodes = this.$refs.tree.store._getAllNodes();
        allNodes.forEach(node => {
          node.expanded = true;
        });
      },
      collapseAll() {
        // 收起所有节点
        const allNodes = this.$refs.tree.store._getAllNodes();
        allNodes.forEach(node => {
          node.expanded = false;
        });
      },
      checkAll() {
        // 全选所有节点
        const allNodes = this.$refs.tree.store._getAllNodes();
        const allKeys = allNodes
          .filter(node => !node.data.children || node.data.children.length === 0)
          .map(node => node.data.id);
        this.$refs.tree.setCheckedKeys(allKeys);
        this.checkedCount = allKeys.length;
      },
      getMenuIcon(data) {
        // 根据菜单名称获取对应图标
        for (const key in this.menuIconMap) {
          if (data.title && data.title.includes(key)) {
            return this.menuIconMap[key];
          }
        }
        // 默认图标
        return data.children && data.children.length > 0 
          ? 'el-icon-folder' 
          : 'el-icon-document';
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
  
  .tree-container {
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
  
  /* 树形工具栏 */
  .tree-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    background-color: #f8f9fa;
    padding: 10px;
    border-radius: 4px;
  }
  
  .left-actions {
    flex: 1;
  }
  
  .filter-input {
    width: 220px;
  }
  
  .right-actions {
    display: flex;
    align-items: center;
  }
  
  .right-actions .el-button {
    font-size: 16px;
    margin-left: 15px;
  }
  
  /* 树形视图 */
  .tree-view {
    margin-bottom: 20px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    padding: 20px;
    background-color: #fff;
  }
  
  .menu-tree {
    height: 400px;
    overflow-y: auto;
    border-radius: 4px;
  }
  
  .menu-tree::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  .menu-tree::-webkit-scrollbar-thumb {
    background: #c0c4cc;
    border-radius: 3px;
  }
  
  .menu-tree::-webkit-scrollbar-track {
    background: #f0f2f5;
    border-radius: 3px;
  }
  
  /* 自定义树节点样式 */
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
  
  .menu-icon {
    margin-right: 5px;
    color: #409EFF;
  }
  
  .node-count {
    font-size: 12px;
    color: #909399;
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
  .tree-buttons {
    margin-top: 20px;
    text-align: center;
  }
  
  .tree-buttons .el-button {
    margin: 0 10px;
    padding: 10px 20px;
  }
  
  /* 美化树节点样式 */
  ::v-deep .el-tree-node__content {
    height: 36px;
    border-bottom: 1px solid #f0f2f5;
  }
  
  ::v-deep .el-tree-node__content:hover {
    background-color: #f5f7fa;
  }
  
  ::v-deep .el-tree-node.is-current > .el-tree-node__content {
    background-color: #ecf5ff !important;
    color: #409EFF;
  }
  
  ::v-deep .el-tree-node__label {
    font-size: 14px;
  }
  
  ::v-deep .el-checkbox__inner {
    border-radius: 4px;
  }
  
  ::v-deep .el-tree-node__expand-icon {
    color: #909399;
  }
</style>
