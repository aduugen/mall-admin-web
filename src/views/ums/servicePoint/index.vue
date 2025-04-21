<template>
    <div class="app-container">
      <el-card class="filter-container" shadow="never">
        <div>
          <i class="el-icon-search"></i>
          <span>筛选搜索</span>
          <el-button
            style="float: right"
            @click="handleSearchList()"
            type="primary"
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
            <el-form-item label="网点名称：">
              <el-input v-model="listQuery.keyword" class="input-width" placeholder="网点名称"></el-input>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
      <el-card class="operate-container" shadow="never">
        <i class="el-icon-tickets"></i>
        <span>数据列表</span>
        <el-button
          class="btn-add"
          @click="handleAddServicePoint()"
          size="mini">
          添加
        </el-button>
      </el-card>
      <div class="table-container">
        <el-table ref="servicePointTable"
                  :data="list"
                  style="width: 100%"
                  v-loading="listLoading"
                  border>
          <el-table-column label="编号" width="100" align="center">
            <template slot-scope="scope">{{scope.row.id}}</template>
          </el-table-column>
          <el-table-column label="网点名称" align="center">
            <template slot-scope="scope">{{scope.row.locationName}}</template>
          </el-table-column>
          <el-table-column label="网点地址" align="center">
            <template slot-scope="scope">{{scope.row.locationAddress}}</template>
          </el-table-column>
          <el-table-column label="经度" width="120" align="center">
            <template slot-scope="scope">{{scope.row.locationLongitude}}</template>
          </el-table-column>
          <el-table-column label="纬度" width="120" align="center">
            <template slot-scope="scope">{{scope.row.locationLatitude}}</template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center">
            <template slot-scope="scope">
              <el-button
                size="mini"
                @click="handleUpdate(scope.$index, scope.row)">编辑
              </el-button>
              <el-button
                size="mini"
                type="danger"
                @click="handleDelete(scope.$index, scope.row)">删除
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
    </div>
  </template>
  
  <script>
    import {fetchList, deleteServicePoint} from '@/api/servicePoint';
  
    export default {
      name: 'servicePointList',
      data() {
        return {
          list: null,
          total: null,
          listLoading: true,
          listQuery: {
            pageNum: 1,
            pageSize: 10,
            keyword: null
          }
        }
      },
      created() {
        this.getList();
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
        handleSearchList() {
          this.listQuery.pageNum = 1;
          this.getList();
        },
        handleResetSearch() {
          this.listQuery = {
            pageNum: 1,
            pageSize: 10,
            keyword: null
          };
          this.getList();
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
        handleAddServicePoint() {
          this.$router.push('/pms/addServicePoint');
        },
        handleUpdate(index, row) {
          this.$router.push({path: '/pms/updateServicePoint', query: {id: row.id}});
        },
        handleDelete(index, row) {
          this.$confirm('是否要删除该合作网点?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            deleteServicePoint(row.id).then(response => {
              this.$message({
                message: '删除成功',
                type: 'success',
                duration: 1000
              });
              this.getList();
            });
          });
        }
      }
    }
  </script>
  
  <style rel="stylesheet/scss" lang="scss" scoped>
    .input-width {
      width: 203px;
    }
    
    .filter-container {
      margin-bottom: 10px;
    }
    
    .operate-container {
      margin-top: 20px;
    }
    
    .btn-add {
      float: right;
      margin-right: 0;
    }
  </style>