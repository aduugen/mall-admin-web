<template> 
  <div class="app-container">
    <el-card class="page-header" shadow="hover">
      <div slot="header" class="clearfix">
        <span class="card-title">
          <i class="el-icon-edit"></i> 
          修改菜单
        </span>
        <el-button 
          style="float: right" 
          type="text" 
          icon="el-icon-back" 
          @click="$router.back()">
          返回菜单列表
        </el-button>
      </div>
    </el-card>
    
    <menu-detail :is-edit='true'></menu-detail>
  </div>
</template>

<script>
  import MenuDetail from './components/MenuDetail'
  export default {
    name: 'updateMenu',
    components: { MenuDetail }
  }
</script>

<style scoped>
  .app-container {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 84px);
  }
  
  .page-header {
    margin-bottom: 20px;
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
</style>


