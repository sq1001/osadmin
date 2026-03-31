# 权限模块配置与使用指南

## 📋 概述

权限模块已实现模块化改造，支持从 `app.json` 配置文件中读取权限接口 URL，提供灵活的权限管理功能。

## 🔧 配置说明

### 1. app.json 配置

在 `config/app.json` 中添加 `permission` 配置项：

```json
{
  "permission": {
    "enabled": true,                              // 是否启用权限
    "url": "/app/admin/rule/permission",         // 权限接口地址
    "method": "GET",                              // 请求方法
    "cache": true                                 // 是否缓存
  }
}
```

### 2. 配置项说明

| 配置项 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| enabled | Boolean | 否 | true | 是否启用权限模块 |
| url | String | 否 | /app/admin/rule/permission | 权限接口地址 |
| method | String | 否 | GET | 请求方法 |
| cache | Boolean | 否 | true | 是否缓存权限数据 |

### 3. 权限接口返回格式

权限接口应返回以下格式的 JSON 数据：

```json
{
  "code": 0,
  "msg": "success",
  "data": [
    "user-view",
    "user-add",
    "user-edit",
    "user-delete",
    "order-view",
    "order-process",
    "*"  // 超级管理员标识
  ]
}
```

**特殊权限**:
- `*`: 超级管理员标识，拥有所有权限

## 🎯 使用方法

### 方式1: HTML 属性控制

使用 `permission` 属性控制元素显示：

```html
<!-- 默认隐藏，有权限才显示 -->
<button permission="user-view">查看用户</button>
<button permission="user-add">添加用户</button>
<button permission="user-edit">编辑用户</button>
<button permission="user-delete">删除用户</button>

<!-- 支持权限前缀匹配 -->
<div permission="system">系统管理区域</div>
<!-- 匹配: system-config, system-log, system-backup 等 -->
```

### 方式2: JavaScript API

#### 通过 OSLAY 全局对象

```javascript
OSLAY.ready(function(modules) {
  var permission = modules.permission;
  
  // 检查单个权限
  if (permission.hasPermission('user-edit')) {
    console.log('有编辑用户权限');
  }
  
  // 判断是否超级管理员
  if (permission.isSuper()) {
    console.log('超级管理员');
  }
  
  // 获取所有权限列表
  var permissions = permission.getPermissions();
  console.log('权限列表:', permissions);
  
  // 重新加载权限
  permission.reload().then(function() {
    console.log('权限重新加载成功');
  });
});
```

#### 直接使用 LayUI

```javascript
layui.use(['permissionModule'], function() {
  var permission = layui.permissionModule;
  
  // 自定义配置初始化（可选）
  permission.init({
    url: '/custom/permission/api',
    cache: false
  }).then(function() {
    console.log('权限初始化成功');
  });
  
  // 权限检查
  if (permission.hasPermission('admin')) {
    // 显示管理员功能
  }
});
```

## 📚 API 文档

### init(options)

初始化权限模块。

**参数**:
- `options` (Object): 配置选项
  - `url` (String): 权限接口地址
  - `cache` (Boolean): 是否缓存

**返回值**:
- `Promise`: 异步操作对象

**示例**:
```javascript
permission.init({
  url: '/api/permission',
  cache: true
}).then(function() {
  console.log('初始化成功');
}).catch(function(err) {
  console.error('初始化失败:', err);
});
```

### hasPermission(permission)

检查是否拥有指定权限。

**参数**:
- `permission` (String): 权限代码

**返回值**:
- `Boolean`: 是否有权限

**示例**:
```javascript
if (permission.hasPermission('user-edit')) {
  // 有编辑权限
}
```

### getPermissions()

获取当前用户的所有权限列表。

**返回值**:
- `Array`: 权限代码数组

**示例**:
```javascript
var permissions = permission.getPermissions();
console.log(permissions); // ['user-view', 'user-add', ...]
```

### isSuper()

判断当前用户是否为超级管理员。

**返回值**:
- `Boolean`: 是否为超级管理员

**示例**:
```javascript
if (permission.isSuper()) {
  // 超级管理员，拥有所有权限
}
```

### reload(options)

重新加载权限数据。

**参数**:
- `options` (Object): 配置选项（可选）

**返回值**:
- `Promise`: 异步操作对象

**示例**:
```javascript
permission.reload().then(function() {
  console.log('权限重新加载成功');
});
```

## 🔄 初始化流程

```
页面加载
   ↓
index.js 加载配置
   ↓
读取 app.json 中的 permission 配置
   ↓
初始化 permission 模块
   ↓
调用权限接口获取权限列表
   ↓
应用权限样式到页面元素
   ↓
初始化 app 模块
   ↓
系统就绪
```

## 🎨 示例页面

完整的示例页面位于: `/view/permission-demo.html`

包含以下内容：
1. 权限配置说明
2. HTML 权限控制示例
3. JavaScript API 使用示例
4. 实时权限状态显示
5. 权限测试工具

## ⚙️ 性能优化

### ✅ 已实现的优化

1. **Promise 异步加载**
   - 使用 Promise 处理异步操作
   - 不阻塞页面渲染

2. **权限缓存机制**
   - 权限数据存储在模块内部
   - 避免重复请求

3. **单次初始化**
   - 全局只初始化一次
   - 通过 OSLAY.modules 全局访问

4. **错误容错**
   - 权限加载失败不影响系统运行
   - 提供友好的错误提示

## 🔒 安全建议

1. **服务端验证**
   - 客户端权限检查仅用于UI控制
   - 所有敏感操作必须在服务端验证权限

2. **权限粒度**
   - 建议使用 `模块-操作` 格式
   - 例如: `user-view`, `user-add`, `user-edit`

3. **超级管理员**
   - 谨慎使用 `*` 权限标识
   - 仅授予可信的管理员

## 📝 最佳实践

### 1. 权限命名规范

```javascript
// 推荐: 模块-操作
"user-view"
"user-add"
"user-edit"
"user-delete"

"order-view"
"order-process"
"order-refund"

// 不推荐: 过于简单或模糊
"view"
"edit"
"manage"
```

### 2. 权限检查时机

```javascript
// ✅ 推荐: 在 OSLAY.ready 回调中检查
OSLAY.ready(function(modules) {
  var permission = modules.permission;
  if (permission.hasPermission('user-edit')) {
    // 显示编辑按钮
  }
});

// ❌ 不推荐: 页面加载后立即检查
// 可能权限模块还未初始化
if (OSLAY.modules.permission.hasPermission('user-edit')) {
  // 可能会报错
}
```

### 3. 动态权限控制

```javascript
// 动态显示/隐藏元素
function updateUIByPermission() {
  var permission = OSLAY.getModule('permission');
  if (!permission) return;
  
  // 批量检查权限
  var elements = [
    { id: 'editBtn', permission: 'user-edit' },
    { id: 'deleteBtn', permission: 'user-delete' },
    { id: 'exportBtn', permission: 'data-export' }
  ];
  
  elements.forEach(function(item) {
    var el = document.getElementById(item.id);
    if (el) {
      el.style.display = permission.hasPermission(item.permission) ? 'inline-block' : 'none';
    }
  });
}
```

## 🐛 常见问题

### Q1: 权限元素不显示？

**A**: 检查以下几点：
1. 权限接口是否正确返回数据
2. 权限代码是否匹配
3. 是否使用了 `permission` 属性
4. 权限模块是否初始化成功

### Q2: 如何调试权限？

**A**: 开启调试模式：
```javascript
OSLAY.debug = true;
OSLAY.ready(function(modules) {
  console.log('权限模块:', modules.permission);
  console.log('权限列表:', modules.permission.getPermissions());
});
```

### Q3: 如何自定义权限接口？

**A**: 在 `app.json` 中配置：
```json
{
  "permission": {
    "url": "/your/custom/permission/api"
  }
}
```

或通过代码配置：
```javascript
permission.init({
  url: '/your/custom/permission/api'
});
```

## 📄 文件清单

- `/config/app.json` - 应用配置文件（包含权限配置）
- `/modules/common/permission.js` - 权限模块
- `/admin/js/index.js` - 全局入口文件
- `/view/permission-demo.html` - 示例页面

## 🎉 总结

权限模块已完全模块化，支持灵活配置和多种使用方式，提供了完善的 API 接口和错误处理机制。通过 `app.json` 配置文件可以轻松定制权限接口地址，满足不同项目的需求。
