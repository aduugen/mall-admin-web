<template>
  <div class="service-point-select">
    <el-select
      v-model="selectedValue"
      filterable
      remote
      reserve-keyword
      placeholder="请选择收货点"
      :remote-method="remoteSearch"
      :loading="loading"
      @change="handleChange"
      style="width: 100%"
    >
      <el-option
        v-for="item in options"
        :key="item.id"
        :label="item.locationName"
        :value="item.id">
        <div class="service-point-option">
          <div class="option-name">
            {{ item.locationName }}
            <el-tag size="mini" v-if="item.servicePointType === 1" type="success">收货点</el-tag>
            <el-tag size="mini" v-if="item.servicePointType === 2" type="warning">综合点</el-tag>
          </div>
          <div class="option-address">{{ item.locationAddress }}</div>
        </div>
      </el-option>
    </el-select>
  </div>
</template>

<script>
import { searchReceivePoints, getServicePoint } from '@/api/servicePoint';

export default {
  name: 'ServicePointSelect',
  props: {
    value: {
      type: [Number, String],
      default: null
    }
  },
  data() {
    return {
      selectedValue: this.value,
      options: [],
      loading: false
    }
  },
  watch: {
    value(val) {
      this.selectedValue = val;
      if (val && this.options.length === 0) {
        this.getPointDetail(val);
      }
    }
  },
  created() {
    this.remoteSearch('');
  },
  methods: {
    remoteSearch(query) {
      this.loading = true;
      searchReceivePoints(query).then(response => {
        this.options = response.data;
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    },
    handleChange(value) {
      const selectedPoint = this.options.find(item => item.id === value);
      this.$emit('input', value);
      this.$emit('change', selectedPoint || null);
    },
    getPointDetail(id) {
      this.loading = true;
      getServicePoint(id).then(response => {
        // 添加到选项中，避免重复请求
        const exists = this.options.some(item => item.id === response.data.id);
        if (!exists) {
          this.options.push(response.data);
        }
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    }
  }
}
</script>

<style scoped>
.service-point-option {
  padding: 5px 0;
}
.option-name {
  font-size: 14px;
  margin-bottom: 4px;
}
.option-address {
  font-size: 12px;
  color: #909399;
}
</style> 