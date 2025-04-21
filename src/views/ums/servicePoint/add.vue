<template>
    <el-card class="form-container" shadow="never">
      <el-form :model="servicePoint" :rules="rules" ref="servicePointForm" label-width="150px">
        <el-form-item label="网点名称：" prop="locationName">
          <el-input v-model="servicePoint.locationName"></el-input>
        </el-form-item>
        <el-form-item label="网点地址：" prop="locationAddress">
          <el-input v-model="servicePoint.locationAddress"></el-input>
        </el-form-item>
        <el-form-item label="经度：" prop="locationLongitude">
          <el-input v-model.number="servicePoint.locationLongitude"></el-input>
        </el-form-item>
        <el-form-item label="纬度：" prop="locationLatitude">
          <el-input v-model.number="servicePoint.locationLatitude"></el-input>
        </el-form-item>
        <el-form-item label="地图选点：">
          <div id="container" style="width: 100%; height: 400px"></div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit('servicePointForm')">提交</el-button>
          <el-button @click="cancelForm()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </template>
  
  <script>
    import {createServicePoint} from '@/api/servicePoint';
    
    export default {
      name: "addServicePoint",
      data() {
        return {
          servicePoint: {
            locationName: '',
            locationAddress: '',
            locationLongitude: null,
            locationLatitude: null
          },
          rules: {
            locationName: [
              {required: true, message: '请输入网点名称', trigger: 'blur'}
            ],
            locationAddress: [
              {required: true, message: '请输入网点地址', trigger: 'blur'}
            ],
            locationLongitude: [
              {required: true, message: '请输入经度', trigger: 'blur'},
              {type: 'number', message: '经度必须为数字值', trigger: 'blur'}
            ],
            locationLatitude: [
              {required: true, message: '请输入纬度', trigger: 'blur'},
              {type: 'number', message: '纬度必须为数字值', trigger: 'blur'}
            ]
          },
          map: null,
          marker: null
        }
      },
      mounted() {
        // 初始化地图
        this.initMap();
      },
      methods: {
        onSubmit(formName) {
          this.$refs[formName].validate((valid) => {
            if (valid) {
              createServicePoint(this.servicePoint).then(response => {
                this.$message({
                  message: '添加成功',
                  type: 'success',
                  duration: 1000
                });
                this.$router.back();
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
        cancelForm() {
          this.$router.back();
        },
        initMap() {
          // 这里集成高德地图
          // 确保在index.html中已引入高德地图脚本
          if (typeof AMap !== 'undefined') {
            this.map = new AMap.Map('container', {
              resizeEnable: true,
              zoom: 11,
              center: [116.397428, 39.90923] // 默认中心点，北京
            });
            
            // 添加点击事件
            this.map.on('click', (e) => {
              const lnglat = e.lnglat;
              this.servicePoint.locationLongitude = lnglat.getLng();
              this.servicePoint.locationLatitude = lnglat.getLat();
              
              // 更新标记点
              if (this.marker) {
                this.marker.setPosition(lnglat);
              } else {
                this.marker = new AMap.Marker({
                  position: lnglat,
                  map: this.map
                });
              }
              
              // 获取地址信息
              const geocoder = new AMap.Geocoder();
              geocoder.getAddress(lnglat, (status, result) => {
                if (status === 'complete' && result.info === 'OK') {
                  this.servicePoint.locationAddress = result.regeocode.formattedAddress;
                }
              });
            });
          } else {
            console.error('高德地图API未加载，请确认在index.html中已引入相关脚本');
          }
        }
      }
    }
  </script>
  
  <style scoped>
  .form-container {
    width: 800px;
    margin: 20px auto;
  }
  </style>