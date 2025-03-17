<template>
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <div>
        <i class="el-icon-warning" style="color: #E6A23C; margin-right: 5px;"></i>
        <span style="font-weight: bold;">库存告警提示：</span>
        <span>当前有 {{total}} 个商品库存低于预警值，请及时补充库存！</span>
      </div>
    </el-card>
    <el-table
      ref="stockAlarmTable"
      :data="list"
      style="width: 100%"
      v-loading="listLoading"
      border>
      <el-table-column label="商品图片" width="120" align="center">
        <template slot-scope="scope">
          <img style="height: 80px" :src="scope.row.pic" alt="">
        </template>
      </el-table-column>
      <el-table-column label="商品名称" align="center">
        <template slot-scope="scope">
          <p>{{scope.row.productName}}</p>
        </template>
      </el-table-column>
      <el-table-column label="SKU编码" width="160" align="center">
        <template slot-scope="scope">
          <p>{{scope.row.skuCode}}</p>
        </template>
      </el-table-column>
      <el-table-column label="商品规格" width="160" align="center">
        <template slot-scope="scope">
          <p>{{getSpecText(scope.row.spData)}}</p>
        </template>
      </el-table-column>
      <el-table-column label="当前库存" width="120" align="center">
        <template slot-scope="scope">
          <p style="color: #F56C6C; font-weight: bold;">{{scope.row.stock}}</p>
        </template>
      </el-table-column>
      <el-table-column label="预警库存" width="120" align="center">
        <template slot-scope="scope">
          <p>{{scope.row.lowStock}}</p>
        </template>
      </el-table-column>
      <el-table-column label="库存状态" width="120" align="center">
        <template slot-scope="scope">
          <el-tag type="danger" v-if="scope.row.stock === 0">无库存</el-tag>
          <el-tag type="warning" v-else>库存紧张</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" align="center">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="handleUpdate(scope.$index, scope.row)">补充库存
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-container">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[5, 10, 15]"
        :page-size="listQuery.pageSize"
        :current-page.sync="listQuery.pageNum"
        :total="total">
      </el-pagination>
    </div>
    <el-dialog
      title="补充库存"
      :visible.sync="dialogVisible"
      width="40%">
      <el-form :model="stockForm" label-width="150px" ref="stockForm">
        <el-form-item label="商品名称：">
          <span>{{currentProduct.productName}}</span>
        </el-form-item>
        <el-form-item label="SKU编码：">
          <span>{{currentProduct.skuCode}}</span>
        </el-form-item>
        <el-form-item label="商品规格：">
          <span>{{getSpecText(currentProduct.spData)}}</span>
        </el-form-item>
        <el-form-item label="当前库存：">
          <span style="color: #F56C6C; font-weight: bold;">{{currentProduct.stock}}</span>
        </el-form-item>
        <el-form-item label="预警库存：">
          <span>{{currentProduct.lowStock}}</span>
        </el-form-item>
        <el-form-item label="补充数量：" prop="addStock">
          <el-input-number v-model="stockForm.addStock" :min="1" :max="999"></el-input-number>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleConfirmUpdate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import {fetchList, fetchPageList} from '@/api/stockAlarm'
  import {update} from '@/api/skuStock'

  export default {
    name: "stockAlarm",
    data() {
      return {
        list: null,
        total: 0,
        listLoading: true,
        listQuery: {
          pageNum: 1,
          pageSize: 10
        },
        dialogVisible: false,
        currentProduct: {},
        stockForm: {
          addStock: 1
        }
      }
    },
    created() {
      this.getList();
    },
    methods: {
      getList() {
        this.listLoading = true;
        fetchPageList(this.listQuery.pageNum, this.listQuery.pageSize).then(response => {
          this.list = response.data.list;
          this.total = response.data.total;
          this.listLoading = false;
        });
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
      getSpecText(spData) {
        if (spData == null || spData === '') {
          return '无';
        }
        let specList = JSON.parse(spData);
        let specText = '';
        for (let i = 0; i < specList.length; i++) {
          let spec = specList[i];
          if (i === 0) {
            specText = spec.value;
          } else {
            specText = specText + ' / ' + spec.value;
          }
        }
        return specText;
      },
      handleUpdate(index, row) {
        this.dialogVisible = true;
        this.currentProduct = Object.assign({}, row);
        this.stockForm.addStock = 1;
      },
      handleConfirmUpdate() {
        // 更新库存
        let skuStock = Object.assign({}, this.currentProduct);
        skuStock.stock = skuStock.stock + this.stockForm.addStock;
        let skuStockList = [];
        skuStockList.push(skuStock);
        update(skuStock.productId, skuStockList).then(response => {
          this.$message({
            message: '补充库存成功',
            type: 'success',
            duration: 1000
          });
          this.dialogVisible = false;
          this.getList();
        });
      }
    }
  }
</script>

<style scoped>
  .filter-container {
    margin-bottom: 20px;
  }
  
  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }
</style> 