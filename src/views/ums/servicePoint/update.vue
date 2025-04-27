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
        <el-form-item label="网点类型：" prop="servicePointType">
          <el-select v-model="servicePoint.servicePointType" placeholder="请选择网点类型">
            <el-option label="自提点" :value="0"></el-option>
            <el-option label="收货点" :value="1"></el-option>
            <el-option label="综合点" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="网点状态：" prop="servicePointStatus">
          <el-radio-group v-model="servicePoint.servicePointStatus">
            <el-radio :label="0">正常</el-radio>
            <el-radio :label="1">已关闭</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="负责人：" prop="contactName">
          <el-input v-model="servicePoint.contactName" placeholder="请输入负责人姓名"></el-input>
        </el-form-item>
        <el-form-item label="联系电话：" prop="contactPhone">
          <el-input v-model="servicePoint.contactPhone" placeholder="请输入联系电话"></el-input>
        </el-form-item>
        <el-form-item label="网点备注：">
          <el-input type="textarea" v-model="servicePoint.servicePointRemark" placeholder="请输入备注信息"></el-input>
        </el-form-item>
        <el-form-item label="网点图片：">
          <el-upload
            class="avatar-uploader"
            :action="'http://192.168.1.6:8080/minio/upload'"
            :headers="headers"
            :show-file-list="false"
            :on-success="handlePicSuccess"
            :before-upload="beforePicUpload">
            <img v-if="imageUrl" :src="imageUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
          <div class="upload-tip">* 支持jpg, png格式，大小不超过2MB</div>
        </el-form-item>
        <el-form-item label="服务时间类型：" prop="serviceTimeType">
          <el-radio-group v-model="servicePoint.serviceTimeType">
            <el-radio :label="0">全天</el-radio>
            <el-radio :label="1">指定时间</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="服务时间段：" v-if="servicePoint.serviceTimeType === 1">
          <div v-for="(item, index) in timeRanges" :key="index" class="time-range-item">
            <el-time-picker
              v-model="item.start"
              format="HH:mm"
              placeholder="开始时间"
              style="width: 120px; margin-right: 10px">
            </el-time-picker>
            <span class="separator">至</span>
            <el-time-picker
              v-model="item.end"
              format="HH:mm"
              placeholder="结束时间"
              style="width: 120px; margin-left: 10px">
            </el-time-picker>
            <el-button 
              v-if="index === timeRanges.length-1" 
              type="primary" 
              icon="el-icon-plus" 
              circle 
              size="mini"
              style="margin-left: 10px"
              @click="addTimeRange">
            </el-button>
            <el-button 
              v-if="timeRanges.length > 1" 
              type="danger" 
              icon="el-icon-delete" 
              circle 
              size="mini"
              style="margin-left: 5px"
              @click="removeTimeRange(index)">
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="服务星级：">
          <el-rate v-model="servicePoint.serviceStarRating" :max="5"></el-rate>
        </el-form-item>
        <el-form-item label="业务量统计：" v-if="id">
          <el-row>
            <el-col :span="12">
              <div class="stat-item">
                <div class="stat-label">自提单量：</div>
                <div class="stat-value">{{ servicePoint.selfPickBillCount || 0 }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="stat-item">
                <div class="stat-label">收货单量：</div>
                <div class="stat-value">{{ servicePoint.receiveBillCount || 0 }}</div>
              </div>
            </el-col>
          </el-row>
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
    import {getServicePoint, updateServicePoint} from '@/api/servicePoint';
    import {getToken} from '@/utils/auth';
    
    export default {
      name: "updateServicePoint",
      data() {
        return {
          servicePoint: {
            locationName: '',
            locationAddress: '',
            locationLongitude: null,
            locationLatitude: null,
            servicePointStatus: 0,
            servicePointType: 0,
            contactName: '',
            contactPhone: '',
            servicePointRemark: '',
            servicePointPic: '',
            serviceTimeType: 0,
            serviceTimeList: '',
            serviceStarRating: 3,
            selfPickBillCount: 0,
            receiveBillCount: 0
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
            ],
            servicePointType: [
              {required: true, message: '请选择网点类型', trigger: 'change'}
            ],
            contactName: [
              {required: true, message: '请输入负责人姓名', trigger: 'blur'},
              {max: 100, message: '长度不能超过100个字符', trigger: 'blur'}
            ],
            contactPhone: [
              {required: true, message: '请输入联系电话', trigger: 'blur'},
              {pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur'}
            ],
            serviceTimeType: [
              {required: true, message: '请选择服务时间类型', trigger: 'change'}
            ]
          },
          map: null,
          marker: null,
          id: null,
          imageUrl: '',
          headers: {
            Authorization: getToken()
          },
          timeRanges: [{ start: null, end: null }]
        }
      },
      created() {
        this.id = this.$route.query.id;
        this.getServicePointData();
      },
      methods: {
        getServicePointData() {
          if (this.id) {
            getServicePoint(this.id).then(response => {
              this.servicePoint = response.data;
              this.imageUrl = this.servicePoint.servicePointPic;
              
              // 处理时间列表
              this.handleEditTimeList(this.servicePoint);
              
              // 获取数据后初始化地图
              this.$nextTick(() => {
                this.initMap();
              });
            });
          }
        },
        onSubmit(formName) {
          this.$refs[formName].validate((valid) => {
            if (valid) {
              if (this.servicePoint.serviceTimeType === 1) {
                if (!this.handleTimeRanges()) return;
              }
              
              updateServicePoint(this.id, this.servicePoint).then(response => {
                this.$message({
                  message: '修改成功',
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
          if (typeof AMap !== 'undefined') {
            this.map = new AMap.Map('container', {
              resizeEnable: true,
              zoom: 11
            });
            
            // 如果有经纬度，在地图上添加标记
            if (this.servicePoint.locationLongitude && this.servicePoint.locationLatitude) {
              const position = new AMap.LngLat(
                this.servicePoint.locationLongitude, 
                this.servicePoint.locationLatitude
              );
              this.marker = new AMap.Marker({
                position: position,
                map: this.map
              });
              this.map.setCenter(position);
            }
            
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
        },
        // 处理图片上传成功
        handlePicSuccess(res, file) {
          if (res.code === 200) {
            this.imageUrl = res.data.url;
            this.servicePoint.servicePointPic = res.data.url;
          } else {
            this.$message.error('上传失败：' + res.message);
          }
        },
        // 上传前校验图片
        beforePicUpload(file) {
          const isJPGOrPNG = file.type === 'image/jpeg' || file.type === 'image/png';
          const isLt2M = file.size / 1024 / 1024 < 2;
          
          if (!isJPGOrPNG) {
            this.$message.error('只能上传JPG或PNG格式图片!');
            return false;
          }
          
          if (!isLt2M) {
            this.$message.error('图片大小不能超过2MB!');
            return false;
          }
          
          return isJPGOrPNG && isLt2M;
        },
        // 添加时间范围
        addTimeRange() {
          this.timeRanges.push({ start: null, end: null });
        },
        // 删除时间范围
        removeTimeRange(index) {
          this.timeRanges.splice(index, 1);
        },
        // 处理时间列表格式化
        handleTimeRanges() {
          const validRanges = this.timeRanges.filter(
            range => range.start && range.end
          );
          
          if (validRanges.length === 0) {
            this.$message.warning('请至少设置一个服务时间段');
            return false;
          }
          
          // 格式化为HH:mm格式
          const formattedRanges = validRanges.map(range => {
            return {
              start: this.formatTime(range.start),
              end: this.formatTime(range.end)
            };
          });
          
          this.servicePoint.serviceTimeList = JSON.stringify(formattedRanges);
          return true;
        },
        // 格式化时间为HH:mm
        formatTime(time) {
          const date = new Date(time);
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          return `${hours}:${minutes}`;
        },
        // 解析时间字符串
        parseTimeString(timeStr) {
          const [hours, minutes] = timeStr.split(':');
          const date = new Date();
          date.setHours(parseInt(hours, 10));
          date.setMinutes(parseInt(minutes, 10));
          date.setSeconds(0);
          return date;
        },
        // 处理编辑时的时间列表
        handleEditTimeList(data) {
          if (data.serviceTimeType === 1 && data.serviceTimeList) {
            try {
              const timeList = JSON.parse(data.serviceTimeList);
              if (Array.isArray(timeList) && timeList.length > 0) {
                this.timeRanges = timeList.map(item => ({
                  start: this.parseTimeString(item.start),
                  end: this.parseTimeString(item.end)
                }));
              } else {
                this.timeRanges = [{ start: null, end: null }];
              }
            } catch (e) {
              this.timeRanges = [{ start: null, end: null }];
            }
          } else {
            this.timeRanges = [{ start: null, end: null }];
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
  
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    line-height: 100px;
    text-align: center;
  }
  .avatar {
    width: 100px;
    height: 100px;
    display: block;
    object-fit: cover;
  }
  .upload-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
  }
  .time-range-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
  .separator {
    margin: 0 5px;
  }
  .stat-item {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
  }
  .stat-label {
    width: 80px;
    color: #606266;
  }
  .stat-value {
    font-weight: bold;
    color: #303133;
  }
  </style>