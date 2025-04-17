# 幂等性控制实现指南

## 概述
幂等性是指发起同样的请求多次，服务器只会执行一次操作的特性。在表单提交、支付、状态更新等场景中，幂等性控制能有效防止由于网络问题、用户重复点击等导致的数据重复提交问题。

## 后端实现
后端通过切面（AOP）的方式实现幂等性控制：

1. `IdempotentAspect` 类：定义了 `@Idempotent` 注解和切面逻辑
2. `TokenController` 类：提供获取幂等性令牌的接口
3. 在需要幂等性控制的接口上添加 `@Idempotent` 注解

### 幂等性注解
```java
@Target({ ElementType.METHOD })
@Retention(RetentionPolicy.RUNTIME)
public @interface Idempotent {
    /**
     * 幂等性操作的超时时间，单位为秒
     */
    int timeout() default 10;

    /**
     * 是否在请求完成后自动删除token
     */
    boolean autoRemove() default true;

    /**
     * 幂等性校验失败时的提示信息
     */
    String message() default "请勿重复提交";
}
```

### 控制器示例
```java
@PreAuthorize("hasRole('ADMIN') or @permissionService.hasPermission('afterSale:update')")
@ApiOperation("修改售后申请状态")
@PostMapping("/update/status/{id}")
@AuditLog(value = "修改售后申请状态", businessType = "售后管理")
@Idempotent(timeout = 60, message = "请勿重复提交售后状态更新请求")
public CommonResult updateStatus(@PathVariable Long id, @Validated @RequestBody OmsUpdateStatusParam statusParam) {
    // 方法实现...
}
```

## 前端实现
前端实现包括以下几个部分：

1. 获取幂等性令牌的API
2. 幂等性请求封装器
3. 在需要幂等性控制的请求中使用幂等性封装器

### 1. 幂等性令牌API（token.js）
```javascript
import request from '@/utils/request'

/**
 * 获取幂等性令牌
 * @returns {Promise} 包含token的结果Promise
 */
export function getIdempotentToken() {
  return request({
    url: '/token/idempotent',
    method: 'get'
  })
}
```

### 2. 幂等性请求封装器（idempotent.js）
```javascript
import { getIdempotentToken } from '@/api/token'
import request from '@/utils/request'

/**
 * 幂等性请求封装器
 * 自动获取幂等性令牌并在请求头中添加
 */
export async function idempotentRequest(options) {
  try {
    // 获取幂等性令牌
    const tokenResponse = await getIdempotentToken();
    
    if (!tokenResponse.data || !tokenResponse.data.token) {
      console.error('获取幂等性令牌失败');
      return Promise.reject(new Error('获取幂等性令牌失败'));
    }
    
    // 克隆请求选项，避免修改原对象
    const requestOptions = { ...options };
    
    // 确保headers存在
    requestOptions.headers = requestOptions.headers || {};
    
    // 在请求头中添加幂等性令牌
    requestOptions.headers['Idempotent-Token'] = tokenResponse.data.token;
    
    // 发送请求
    return request(requestOptions);
  } catch (error) {
    console.error('幂等性请求失败:', error);
    return Promise.reject(error);
  }
}

/**
 * 创建一个基于指定URL和方法的幂等性请求函数
 */
export function createIdempotentRequest(url, method = 'post') {
  return function(data, params) {
    return idempotentRequest({
      url,
      method,
      data,
      params
    });
  }
}
```

### 3. 在API中使用幂等性请求（returnApply.js）
```javascript
import request from '@/utils/request'
import { idempotentRequest } from '@/utils/idempotent'

// 一般请求
export function fetchList(params) {
  return request({
    url:'/afterSale/list',
    method:'get',
    params:params
  })
}

// 使用幂等性请求来更新状态，防止重复提交
export function updateApplyStatus(id, data) {
  return idempotentRequest({
    url: '/afterSale/update/status/' + id,
    method: 'post',
    data: data
  })
}
```

### 4. 通用操作封装（afterSaleUtils.js）
```javascript
import { updateApplyStatus } from '@/api/returnApply'
import { Message } from 'element-ui'

/**
 * 安全更新售后状态并处理错误
 */
export function safeUpdateStatus(id, statusData, successCallback, errorCallback, showSuccessMessage = true) {
  return updateApplyStatus(id, statusData)
    .then(response => {
      if (showSuccessMessage) {
        Message({
          type: 'success',
          message: '状态更新成功!'
        })
      }
      
      if (successCallback && typeof successCallback === 'function') {
        successCallback(response)
      }
      
      return response
    })
    .catch(error => {
      Message({
        type: 'error',
        message: '状态更新失败: ' + (error.message || '未知错误')
      })
      
      if (errorCallback && typeof errorCallback === 'function') {
        errorCallback(error)
      }
      
      return Promise.reject(error)
    })
}
```

### 5. 在组件中使用（applyDetail.vue）
```javascript
submitUpdateStatus(params) {
  this.submitLoading = true;
  
  // 使用工具函数进行安全更新
  safeUpdateStatus(
    this.id, 
    params,
    () => {
      // 成功回调
      this.getDetail();
      this.submitLoading = false;
    },
    () => {
      // 错误回调
      this.submitLoading = false;
    }
  );
}
```

## 工作流程

1. 用户点击提交按钮
2. 前端调用 `updateApplyStatus` 方法
3. `updateApplyStatus` 内部使用 `idempotentRequest` 封装器
4. `idempotentRequest` 先调用 `/token/idempotent` 获取幂等性令牌
5. 获取令牌后，将令牌添加到请求头 `Idempotent-Token` 中
6. 发送带有幂等性令牌的实际请求
7. 后端 `IdempotentAspect` 切面拦截带有 `@Idempotent` 注解的方法
8. 切面从请求头获取 `Idempotent-Token`，并在Redis中检查是否已存在
9. 如果令牌是首次使用，则将其存入Redis并设置过期时间，继续执行业务逻辑
10. 如果令牌已经使用过，则直接返回错误信息，不再执行业务逻辑
11. 业务逻辑执行完成后，根据配置决定是否删除Redis中的令牌

## 最佳实践

1. 对需要防止重复提交的操作添加幂等性控制，如创建订单、支付、状态更新等
2. 合理设置幂等性令牌的超时时间，一般建议在用户可能重复操作的时间窗口内
3. 在前端显示适当的加载状态和错误信息，提高用户体验
4. 对于关键业务，配合乐观锁等机制，提供多层保障
5. 记录幂等性校验失败的情况，便于后续分析和优化 