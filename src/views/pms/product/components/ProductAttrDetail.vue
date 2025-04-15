<template>
  <div class="product-attr-container">
    <el-card shadow="hover" class="box-card">
      <div slot="header" class="card-header">
        <i class="el-icon-goods"></i>
        <span>规格参数</span>
      </div>
      <el-form :model="value" ref="productAttrForm" label-width="120px" class="product-attr-form">
        <div class="form-section">
          <div class="section-header">
            <i class="el-icon-collection-tag"></i>
            <span>属性类型</span>
          </div>
          <div class="section-body">
            <el-form-item label="属性类型：" v-if="!isEdit">
              <el-cascader
                v-model="selectProductAttrCate"
                :options="productAttributeCategoryOptions"
                placeholder="请选择类型"
                :clearable="true"
                @change="handleProductAttrChange">
              </el-cascader>
            </el-form-item>
            <el-tabs v-model="activeTab" type="card" class="attr-tabs">
              <el-tab-pane label="规格参数" name="attr">
                <el-card shadow="never" class="inner-card">
                  <div class="table-container">
                    <el-table ref="attrTable" :data="value.productAttributeValueList" style="width: 100%" border>
                      <el-table-column label="属性名称" width="150" align="center">
                        <template slot-scope="scope">
                          <div>{{scope.row.name}}</div>
                        </template>
                      </el-table-column>
                      <el-table-column label="属性值" align="center">
                        <template slot-scope="scope">
                          <el-input v-model="scope.row.value"></el-input>
                        </template>
                      </el-table-column>
                      <el-table-column v-if="isEdit" label="操作" width="150" align="center">
                        <template slot-scope="scope">
                          <el-button type="text" @click="handleRemoveProductAttr(scope.$index)">删除</el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                    <div class="table-footer" v-if="isEdit">
                      <el-button type="primary" size="small" @click="handleAddProductAttrValue">添加规格参数</el-button>
                    </div>
                  </div>
                </el-card>
              </el-tab-pane>
              <el-tab-pane label="库存/规格" name="sku">
                <el-card shadow="never" class="inner-card">
                  <div class="table-container">
                    <el-table ref="skuTable" :data="value.skuStockList" style="width: 100%" border>
                      <el-table-column label="属性码" v-if="isEdit" align="center">
                        <template slot-scope="scope">
                          <span>{{scope.row.id}}</span>
                        </template>
                      </el-table-column>
                      <el-table-column v-for="(item,index) in skuAttribute" :label="item.name" :key="item.id" align="center">
                        <template slot-scope="scope">
                          <el-input v-model="scope.row['sp'+(index+1)]"></el-input>
                        </template>
                      </el-table-column>
                      <el-table-column label="销售价格" width="120" align="center">
                        <template slot-scope="scope">
                          <el-input v-model="scope.row.price" class="price-input">
                            <template slot="prepend">¥</template>
                          </el-input>
                        </template>
                      </el-table-column>
                      <el-table-column label="库存" width="120" align="center">
                        <template slot-scope="scope">
                          <el-input v-model="scope.row.stock" type="number"></el-input>
                        </template>
                      </el-table-column>
                      <el-table-column label="预警库存" width="120" align="center">
                        <template slot-scope="scope">
                          <el-input v-model="scope.row.lowStock" type="number"></el-input>
                        </template>
                      </el-table-column>
                      <el-table-column label="SKU编号" width="160" align="center">
                        <template slot-scope="scope">
                          <el-input v-model="scope.row.skuCode"></el-input>
                        </template>
                      </el-table-column>
                      <el-table-column label="操作" width="150" align="center">
                        <template slot-scope="scope">
                          <el-button type="text" v-show="scope.$index!==0" @click="handleRemoveSkuList(scope.$index, scope.row)">删除</el-button>
                          <el-button type="text" v-show="scope.$index===0" @click="handleAddSkuList(scope.row)">增加</el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </el-card>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </el-form>
      <div class="form-footer">
        <el-button size="medium" @click="handlePrev">上一步，填写商品促销</el-button>
        <el-button type="primary" size="medium" @click="handleNext">下一步，选择商品关联</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
  import {fetchList as fetchProductAttrList} from '@/api/productAttr'
  import {fetchList as fetchProductAttrCateList} from '@/api/productAttrCate'

  export default {
    name: "ProductAttrDetail",
    props: {
      value: Object,
      isEdit: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        //选中的商品属性分类id
        productAttributeCategoryId: null,
        //商品属性分类下拉框数据
        productAttributeCategoryOptions: [],
        //选中的商品属性
        selectProductAttrValue: [],
        //选中的商品参数
        selectProductParam: [],
        //选中的商品属性分类
        selectProductAttrCate: [],
        //商品规格是否启用
        hasProductAttr: false,
        //商品规格列表
        productAttrList: [],
        //商品参数列表
        productParamList: [],
        //SKU库存表单
        skuStocks: [],
        activeTab: 'attr'
      }
    },
    computed: {
      //sku规格属性
      skuAttribute() {
        return this.productAttrList.filter(item => item.handAddStatus === 1);
      }
    },
    created() {
      this.getProductAttributeCateList();
      if(this.isEdit){
        if(this.value.productAttributeCategoryId!=null){
          this.productAttributeCategoryId=this.value.productAttributeCategoryId;
          this.getProductAttrList(this.value.productAttributeCategoryId);
        }
      }
    },
    methods: {
      handlePrev(){
        this.$emit('prevStep')
      },
      handleNext(){
        this.$emit('nextStep')
      },
      getProductAttributeCateList() {
        fetchProductAttrCateList({pageSize: 100, pageNum: 1}).then(response => {
          let list = response.data.list;
          for (let i = 0; i < list.length; i++) {
            let children = [];
            if (list[i].attributeCount > 0) {
              children.push({
                label: '规格',
                value: 0
              })
            }
            if (list[i].paramCount > 0) {
              children.push({
                label: '参数',
                value: 1
              })
            }
            this.productAttributeCategoryOptions.push({
              label: list[i].name,
              value: list[i].id,
              children: children
            });
          }
        });
      },
      //根据商品类型获取商品属性
      getProductAttrList(productAttributeCategoryId, type) {
        //type: 0->规格，1->参数
        fetchProductAttrList(productAttributeCategoryId, {pageSize: 100, pageNum: 1, type: type}).then(response => {
          let list = response.data.list;
          if(type===0){
            this.productAttrList = list;
          }else{
            this.productParamList = list;
          }
          this.handleAddProductAttrValue();
          if(this.isEdit){
            this.refreshProductAttrValue();
          }
        });
      },
      getProductSkuAttrList() {
        let list = [];
        for (let i = 0; i < this.productAttrList.length; i++) {
          if (this.productAttrList[i].handAddStatus === 1) {
            list.push({
              id: this.productAttrList[i].id,
              name: this.productAttrList[i].name
            });
          }
        }
        return list;
      },
      // 刷新商品属性值
      refreshProductAttrValue() {
        this.selectProductAttrValue.forEach(item => {
          let attr = this.getProductAttrByIdAndType(item.productAttributeId, 0);
          if (attr != null) {
            item.name = attr.name;
          }
        });
        this.selectProductParam.forEach(item => {
          let param = this.getProductAttrByIdAndType(item.productAttributeId, 1);
          if (param != null) {
            item.name = param.name;
          }
        });
      },
      handleProductAttrChange(value) {
        if (value[0] != null) {
          this.productAttributeCategoryId = value[0];
          this.value.productAttributeCategoryId = value[0];
          this.selectProductAttrValue = [];
          this.selectProductParam = [];
          this.value.productAttributeValueList = [];
          if (value[1] === 0) {
            //获取规格属性
            this.getProductAttrList(value[0], 0);
          } else {
            //获取规格参数
            this.getProductAttrList(value[0], 1);
          }
        } else {
          this.productAttributeCategoryId = null;
          this.value.productAttributeCategoryId = null;
          this.selectProductAttrValue = [];
          this.selectProductParam = [];
          this.value.productAttributeValueList = [];
        }
      },
      //获取指定id,指定类型的属性
      getProductAttrByIdAndType(id, type) {
        if (type === 0) {
          for (let i = 0; i < this.productAttrList.length; i++) {
            if (id === this.productAttrList[i].id) {
              return this.productAttrList[i];
            }
          }
        } else if (type === 1) {
          for (let i = 0; i < this.productParamList.length; i++) {
            if (id === this.productParamList[i].id) {
              return this.productParamList[i];
            }
          }
        }
        return null;
      },
      //添加商品属性值
      handleAddProductAttrValue() {
        let attrList = [];
        for (let i = 0; i < this.productAttrList.length; i++) {
          let attr = this.productAttrList[i];
          if(attr.handAddStatus===0){
            let attrValue = {
              productAttributeId: attr.id,
              value: ''
            };
            if (this.isEdit) {
              attrValue.id = null;
              attrValue.productId = this.value.id;
            }
            if(attr.inputList!==null && attr.inputList!==''){
              let inputList = attr.inputList.split(',');
              attrValue.value = inputList.join(',');
            }
            attrValue.name=attr.name;
            attrList.push(attrValue);
          }
        }
        for (let i = 0; i < this.productParamList.length; i++) {
          let param = this.productParamList[i];
          let attrValue = {
            productAttributeId: param.id,
            value: ''
          };
          if (this.isEdit) {
            attrValue.id = null;
            attrValue.productId = this.value.id;
          }
          if(param.inputList!==null && param.inputList!==''){
            let inputList = param.inputList.split(',');
            attrValue.value = inputList.join(',');
          }
          attrValue.name=param.name;
          attrList.push(attrValue);
        }
        if(this.isEdit){
          if(attrList.length<1){
            return;
          }
          //新增的属性值内容
          if(this.value.productAttributeValueList!==null&&this.value.productAttributeValueList.length>0){
            let tempList = [];
            for(let i=0;i<attrList.length;i++){
              let hasValue = false;
              for(let j=0;j<this.value.productAttributeValueList.length;j++){
                if(attrList[i].productAttributeId===this.value.productAttributeValueList[j].productAttributeId){
                  hasValue = true;
                  break;
                }
              }
              if (!hasValue) {
                tempList.push(attrList[i]);
              }
            }
            this.value.productAttributeValueList = this.value.productAttributeValueList.concat(tempList);
          }else{
            this.value.productAttributeValueList = attrList;
          }
        }else{
          this.value.productAttributeValueList = attrList;
        }
      },
      //移除商品属性
      handleRemoveProductAttr(index) {
        this.value.productAttributeValueList.splice(index, 1);
      },
      //处理添加sku弹框
      handleAddSkuClick() {
        this.dialogVisible = true;
      },
      handleAddSku() {
        let sku = this.getDialogSku();
        this.value.skuStockList.push(sku);
        this.dialogVisible = false;
      },
      handleRemoveSkuList(index, row) {
        this.value.skuStockList.splice(index, 1);
      },
      //添加一条SKU
      handleAddSkuList(row) {
        let sku = {
          price: row.price || 0,
          stock: row.stock || 0,
          lowStock: row.lowStock || 0,
          pic: null,
          sale: null,
          skuCode: row.skuCode || null,
          sp1: row.sp1 || null,
          sp2: row.sp2 || null,
          sp3: row.sp3 || null
        };
        this.value.skuStockList.push(sku);
      }
    }
  }
</script>

<style scoped>
  .product-attr-container {
    padding: 10px 0;
  }
  
  .card-header {
    display: flex;
    align-items: center;
    padding: 12px 0;
  }
  
  .card-header i {
    font-size: 20px;
    color: #409EFF;
    margin-right: 10px;
  }
  
  .card-header span {
    font-size: 16px;
    font-weight: 500;
  }
  
  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5;
  }
  
  .section-header i {
    font-size: 18px;
    color: #409EFF;
    margin-right: 8px;
  }
  
  .section-header span {
    font-size: 15px;
    font-weight: 500;
  }
  
  .section-body {
    padding: 5px 0 20px;
  }
  
  /* 表单样式 */
  .product-attr-form .el-form-item {
    margin-bottom: 20px;
  }
  
  /* 标签页样式 */
  .attr-tabs {
    margin-top: 10px;
  }
  
  .attr-tabs .el-tabs__header {
    margin-bottom: 15px;
  }
  
  /* 内部卡片样式 */
  .inner-card {
    margin-bottom: 20px;
    border-radius: 5px;
  }
  
  /* 表格样式 */
  .table-container {
    margin-bottom: 15px;
  }
  
  .table-footer {
    margin-top: 15px;
    display: flex;
    justify-content: flex-end;
  }
  
  /* 输入框样式 */
  .price-input .el-input-group__prepend {
    background-color: #f5f7fa;
    color: #909399;
  }
  
  /* 底部按钮 */
  .form-footer {
    text-align: center;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #ebeef5;
  }
  
  .el-button + .el-button {
    margin-left: 15px;
  }
</style>
