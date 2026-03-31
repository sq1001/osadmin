# 权限示例数据说明

## 📁 文件列表

| 文件名 | 说明 | 权限数量 | 角色 |
|--------|------|----------|------|
| `permission.json` | 标准权限示例 | 28个 | 普通管理员 |
| `permission-super.json` | 超级管理员权限 | 1个(*) | 超级管理员 |
| `permission-operator.json` | 运营人员权限 | 6个 | 运营人员 |
| `permission-manager.json` | 业务经理权限 | 10个 | 业务经理 |

## 📋 权限分类

### 1. 仪表盘权限
- `dashboard-view` - 查看仪表盘

### 2. 用户管理权限
- `user-view` - 查看用户
- `user-add` - 添加用户
- `user-edit` - 编辑用户
- `user-delete` - 删除用户
- `user-export` - 导出用户

### 3. 订单管理权限
- `order-view` - 查看订单
- `order-process` - 处理订单
- `order-refund` - 订单退款
- `order-export` - 导出订单

### 4. 商品管理权限
- `product-view` - 查看商品
- `product-add` - 添加商品
- `product-edit` - 编辑商品
- `product-delete` - 删除商品
- `product-stock` - 库存管理

### 5. 财务管理权限
- `finance-view` - 查看财务
- `finance-report` - 财务报表
- `finance-export` - 导出财务

### 6. 营销管理权限
- `marketing-coupon` - 优惠券管理
- `marketing-activity` - 活动管理
- `marketing-banner` - 广告位管理

### 7. 系统管理权限
- `system-config` - 系统配置
- `system-log` - 查看日志
- `system-backup` - 数据备份
- `system-monitor` - 系统监控

### 8. 权限管理权限
- `permission-role` - 角色管理
- `permission-menu` - 菜单管理
- `permission-user` - 用户权限

## 🎯 使用方法

### 方式1: 直接使用示例数据

修改 `config/app.json` 中的权限接口地址：

```json
{
  "permission": {
    "enabled": true,
    "url": "view/data/permission.json"
  }
}
```

### 方式2: 切换不同角色

```json
// 超级管理员
{
  "permission": {
    "url": "view/data/permission-super.json"
  }
}

// 运营人员
{
  "permission": {
    "url": "view/data/permission-operator.json"
  }
}

// 业务经理
{
  "permission": {
    "url": "view/data/permission-manager.json"
  }
}
```

### 方式3: 动态切换权限

```javascript
// 重新加载不同角色的权限
OSLAY.ready(function(modules) {
  var permission = modules.permission;
  
  // 切换到运营人员权限
  permission.reload({ url: 'view/data/permission-operator.json' }).then(function() {
    console.log('已切换到运营人员权限');
    location.reload(); // 刷新页面应用新权限
  });
});
```

## 🔍 权限对比表

| 权限代码 | 超级管理员 | 业务经理 | 运营人员 | 普通管理员 |
|---------|-----------|---------|---------|-----------|
| dashboard-view | ✅ | ✅ | ✅ | ✅ |
| user-view | ✅ | ✅ | ✅ | ✅ |
| user-add | ✅ | ✅ | ❌ | ✅ |
| user-edit | ✅ | ✅ | ❌ | ✅ |
| user-delete | ✅ | ❌ | ❌ | ✅ |
| user-export | ✅ | ❌ | ❌ | ✅ |
| order-view | ✅ | ✅ | ✅ | ✅ |
| order-process | ✅ | ❌ | ✅ | ✅ |
| order-refund | ✅ | ❌ | ❌ | ✅ |
| order-export | ✅ | ❌ | ❌ | ✅ |
| product-view | ✅ | ✅ | ✅ | ✅ |
| product-add | ✅ | ✅ | ❌ | ✅ |
| product-edit | ✅ | ✅ | ❌ | ✅ |
| product-delete | ✅ | ❌ | ❌ | ✅ |
| product-stock | ✅ | ❌ | ❌ | ✅ |
| finance-view | ✅ | ❌ | ✅ | ✅ |
| finance-report | ✅ | ❌ | ❌ | ✅ |
| finance-export | ✅ | ❌ | ❌ | ✅ |
| marketing-coupon | ✅ | ✅ | ❌ | ✅ |
| marketing-activity | ✅ | ✅ | ❌ | ✅ |
| marketing-banner | ✅ | ❌ | ❌ | ✅ |
| system-config | ✅ | ❌ | ❌ | ✅ |
| system-log | ✅ | ❌ | ❌ | ✅ |
| system-backup | ✅ | ❌ | ❌ | ✅ |
| system-monitor | ✅ | ❌ | ❌ | ✅ |
| permission-role | ✅ | ❌ | ❌ | ✅ |
| permission-menu | ✅ | ❌ | ❌ | ✅ |
| permission-user | ✅ | ❌ | ❌ | ✅ |

## 💡 使用建议

### 1. 开发环境

使用 `permission-super.json` 超级管理员权限，方便开发调试：

```json
{
  "permission": {
    "url": "view/data/permission-super.json"
  }
}
```

### 2. 测试环境

根据测试需求切换不同角色权限：

```javascript
// 测试运营人员功能
permission.reload({ url: 'view/data/permission-operator.json' });

// 测试业务经理功能
permission.reload({ url: 'view/data/permission-manager.json' });
```

### 3. 生产环境

使用真实的权限接口：

```json
{
  "permission": {
    "url": "/api/admin/permission"
  }
}
```

## 🎨 前端权限控制示例

### HTML 权限控制

```html
<!-- 用户管理 -->
<button permission="user-view">查看用户</button>
<button permission="user-add">添加用户</button>
<button permission="user-edit">编辑用户</button>
<button permission="user-delete">删除用户</button>

<!-- 订单管理 -->
<button permission="order-view">查看订单</button>
<button permission="order-process">处理订单</button>
<button permission="order-refund">退款处理</button>

<!-- 系统管理 -->
<div permission="system-config">
  <h3>系统配置区域</h3>
  <!-- 只有有权限的用户才能看到 -->
</div>
```

### JavaScript 权限检查

```javascript
OSLAY.ready(function(modules) {
  var permission = modules.permission;
  
  // 检查单个权限
  if (permission.hasPermission('user-delete')) {
    // 显示删除按钮
  }
  
  // 批量检查权限
  var canManageUser = ['user-add', 'user-edit', 'user-delete'].every(function(p) {
    return permission.hasPermission(p);
  });
  
  if (canManageUser) {
    // 完整的用户管理权限
  }
  
  // 检查是否超级管理员
  if (permission.isSuper()) {
    // 显示所有功能
  }
});
```

## 📝 自定义权限数据

你可以根据实际业务需求创建自己的权限数据文件：

```json
{
  "code": 0,
  "msg": "success",
  "data": [
    "your-permission-code-1",
    "your-permission-code-2",
    "your-permission-code-3"
  ],
  "userInfo": {
    "id": 100,
    "username": "custom-user",
    "role": "自定义角色",
    "description": "自定义权限配置"
  }
}
```

**注意事项**:
1. `code` 必须为 `0` 表示成功
2. `data` 数组包含权限代码列表
3. `*` 表示超级管理员，拥有所有权限
4. 权限代码建议使用 `模块-操作` 格式

## 🔄 实时切换权限演示

在浏览器控制台执行以下代码，可以实时切换不同角色：

```javascript
// 获取权限模块
var permission = OSLAY.modules.permission;

// 切换到超级管理员
permission.reload({ url: 'view/data/permission-super.json' }).then(function() {
  console.log('当前角色: 超级管理员');
  console.log('权限列表:', permission.getPermissions());
  location.reload();
});

// 切换到运营人员
permission.reload({ url: 'view/data/permission-operator.json' }).then(function() {
  console.log('当前角色: 运营人员');
  console.log('权限列表:', permission.getPermissions());
  location.reload();
});

// 切换到业务经理
permission.reload({ url: 'view/data/permission-manager.json' }).then(function() {
  console.log('当前角色: 业务经理');
  console.log('权限列表:', permission.getPermissions());
  location.reload();
});
```

## 🎯 总结

这些示例数据文件提供了不同角色的权限配置，方便开发和测试权限功能。你可以根据实际需求修改或创建新的权限数据文件。
