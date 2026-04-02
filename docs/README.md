# OSADMIN 后台管理系统开发文档

## 📋 项目概述

**项目名称**: OSADMIN  
**版本**: 1.1.0  
**描述**: 基于 LayUI 的轻量化原生管理后台系统  
**技术栈**: LayUI + jQuery + 原生 JavaScript  
**架构模式**: 模块化架构 + 配置驱动

### 核心特性

- ✅ **模块化架构**: 基于 LayUI 模块系统，按需加载
- ✅ **配置驱动**: JSON 配置文件驱动，灵活可扩展
- ✅ **权限管理**: 完善的权限控制系统
- ✅ **主题系统**: 支持多主题切换和自定义
- ✅ **路由管理**: Hash 路由，支持 ID 和 Code 混合路由
- ✅ **资源按需加载**: 页面级 CSS/JS 按需加载，支持动态 meta 信息
- ✅ **组件丰富**: 封装多种常用组件
- ✅ **响应式设计**: 适配多种屏幕尺寸

---

## 📁 项目结构

```
osadmin/
├── admin/                    # 管理后台核心目录
│   ├── css/                 # 样式文件
│   │   ├── admin.css       # 主样式文件
│   │   ├── theme.css       # 主题样式
│   │   ├── index.css       # 首页样式
│   │   ├── layui-override/ # LayUI 样式覆盖
│   │   │   ├── button.css  # 按钮样式覆盖
│   │   │   ├── form.css    # 表单样式覆盖
│   │   │   ├── table.css   # 表格样式覆盖
│   │   │   ├── nav.css     # 导航样式覆盖
│   │   │   └── panel.css   # 面板样式覆盖
│   │   ├── extends/        # 扩展样式
│   │   │   ├── toast.css   # 提示框样式
│   │   │   └── resetForm.css # 表单重置样式
│   │   └── view/           # 页面样式
│   │       └── dashboard.css # 仪表盘样式
│   └── js/                  # JavaScript 文件
│       ├── index.js        # 全局入口文件
│       └── extends/        # 扩展脚本
│           └── searchForm.js # 表单搜索扩展
│
├── config/                   # 配置文件目录
│   ├── app.json            # 应用配置文件
│   └── menu.json           # 菜单配置文件
│
├── docs/                     # 文档目录
│   ├── permission-guide.md # 权限模块使用指南
│   └── README.md           # 开发文档（本文件）
│
├── lib/                      # 第三方库目录
│   ├── layui/              # LayUI 框架
│   │   ├── layui.js        # LayUI 核心
│   │   ├── css/            # LayUI 样式
│   │   └── font/           # LayUI 字体图标
│   ├── echarts/            # ECharts 图表库
│   │   └── echarts.min.js
│   └── xm-select/          # XM-Select 下拉选择
│       └── xm-select.js
│
├── modules/                  # 模块目录
│   ├── app.js              # 主应用模块
│   ├── common/             # 公共模块
│   │   ├── router.js       # 路由模块
│   │   ├── theme.js        # 主题模块
│   │   └── permission.js   # 权限模块
│   ├── components/         # 组件模块
│   │   ├── sidebar.js      # 侧边栏组件
│   │   └── tabs.js         # 标签页组件
│   └── extends/            # 扩展模块
│       ├── common.js       # 公共扩展
│       ├── count.js        # 计数器
│       ├── echarts.js      # 图表扩展
│       ├── xm-select.js    # 下拉选择扩展
│       ├── toast.js        # 提示框
│       ├── drawer.js       # 抽屉组件
│       └── laydrawer.js    # LayUI 抽屉
│
├── view/                     # 页面视图目录
│   ├── dashboard.html      # 仪表盘页面
│   ├── settings.html       # 设置页面
│   ├── permission-demo.html # 权限示例页面
│   ├── components/         # 组件示例页面
│   │   ├── form-demo.html  # 表单示例
│   │   ├── button-demo.html # 按钮示例
│   │   ├── table-demo.html # 表格示例
│   │   ├── layer-demo.html # 弹层示例
│   │   ├── laydate-demo.html # 日期示例
│   │   ├── dropdown-demo.html # 下拉菜单示例
│   │   ├── drawer-demo.html # 抽屉示例
│   │   ├── echarts-demo.html # 图表示例
│   │   ├── xm-select-demo.html # 下拉选择示例
│   │   ├── toast-demo.html # 提示框示例
│   │   └── form-comprehensive.html # 综合表单
│   └── data/               # 示例数据
│       ├── notifications.json # 通知数据
│       ├── permission.json # 权限数据
│       ├── permission-super.json # 超级管理员权限
│       ├── permission-operator.json # 运营人员权限
│       ├── permission-manager.json # 业务经理权限
│       └── permission-readme.md # 权限数据说明
│
├── index.html                # 入口页面
└── favicon.ico              # 网站图标
```

---

## 🚀 快速开始

### 环境要求

- Node.js >= 12.0.0 (可选，用于本地开发服务器)
- 现代浏览器 (Chrome, Firefox, Safari, Edge)
- Web 服务器 (Nginx, Apache, 或本地开发服务器)

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd osadmin
```

2. **启动本地服务器**

方式1: 使用 Python
```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

方式2: 使用 Node.js
```bash
npx http-server -p 8080
```

方式3: 使用 VS Code Live Server 插件

3. **访问系统**
```
http://localhost:8080
```

### 目录权限

确保以下目录有写入权限:
- `config/` - 配置文件目录
- `view/data/` - 数据文件目录

---

## ⚙️ 配置说明

### 1. 应用配置 (config/app.json)

应用配置文件包含系统的所有配置项。

#### 基础配置

```json
{
  "name": "OSADMIN",
  "version": "1.0.0",
  "description": "基于layui原生管理后台系统"
}
```

#### 站点配置

```json
{
  "site": {
    "name": "OSADMIN",
    "title": "OSADMIN",
    "logo": "favicon.ico",
    "keywords": "OSADMIN",
    "description": "OSADMIN 轻量化原生管理后台"
  }
}
```

#### 路由配置

```json
{
  "router": {
    "mode": "hash",    // 路由模式: hash | history
    "base": "/"        // 路由基础路径
  }
}
```

#### 主题配置

```json
{
  "theme": {
    "defaultMode": "light",      // 默认主题: light | dark
    "defaultColor": "#16baaa",   // 默认主题色
    "defaultLayout": "double",   // 默认布局: single | double
    "tabsVisible": true,         // 是否显示标签页
    "rememberTabs": true,        // 是否记住标签页
    "accordion": false,          // 菜单是否手风琴模式
    "pageAnimation": "fadeIn"    // 页面动画: fadeIn | slideIn | none
  }
}
```

#### 水印配置

```json
{
  "watermark": {
    "enabled": true,             // 是否启用水印
    "text": "OSSUP",             // 水印文字
    "fontSize": 14,              // 字体大小
    "color": "rgba(0, 0, 0, 0.08)", // 水印颜色
    "rotate": -22,               // 旋转角度
    "gapX": 100,                 // X轴间距
    "gapY": 100                  // Y轴间距
  }
}
```

#### 多语言配置

```json
{
  "lang": {
    "default": "zh-CN",          // 默认语言
    "list": [                    // 支持的语言列表
      { "code": "zh-CN", "name": "简体中文" },
      { "code": "zh-TW", "name": "繁體中文" },
      { "code": "en", "name": "English" }
    ]
  }
}
```

#### 主题色配置

```json
{
  "colors": {
    "#16baaa": { 
      "hover": "#14a090",        // 悬停色
      "rgb": "22, 186, 170"      // RGB 值
    },
    "#16b777": { "hover": "#12a066", "rgb": "22, 183, 119" },
    "#1e9fff": { "hover": "#1a8fe6", "rgb": "30, 159, 255" },
    "#ff5722": { "hover": "#e64a19", "rgb": "255, 87, 34" },
    "#ffb800": { "hover": "#e6a600", "rgb": "255, 184, 0" },
    "#a233c6": { "hover": "#8e2db0", "rgb": "162, 51, 198" }
  }
}
```

#### 布局配置

```json
{
  "sidebar": {
    "width": 220,                // 侧边栏宽度
    "collapsedWidth": 64,        // 折叠后宽度
    "submenuWidth": 180          // 子菜单宽度
  },
  "topbar": {
    "height": 50                 // 顶部栏高度
  },
  "tabs": {
    "height": 40,                // 标签页高度
    "maxTabs": 20                // 最大标签页数量
  }
}
```

#### 存储配置

```json
{
  "storage": {
    "themeKey": "themeConfig",   // 主题存储键
    "tabsKey": "tabsState",      // 标签页存储键
    "langKey": "langConfig"      // 语言存储键
  }
}
```

#### 菜单配置

```json
{
  "menu": {
    "selectId": 0,               // 默认选中菜单ID
    "url": "config/menu.json",   // 菜单配置文件路径
    "method": "GET",             // 请求方法
    "async": true                // 是否异步加载
  }
}
```

#### 权限配置

```json
{
  "permission": {
    "enabled": true,             // 是否启用权限
    "url": "view/data/permission.json", // 权限接口地址
    "method": "GET",             // 请求方法
    "cache": true                // 是否缓存权限
  }
}
```

### 2. 菜单配置 (config/menu.json)

菜单配置文件定义系统的导航菜单结构。

#### 菜单项结构

```json
{
  "id": 1,                       // 菜单ID (唯一)
  "code": "view/dashboard",      // 菜单代码 (唯一)
  "title": "控制台",              // 菜单标题
  "icon": "layui-icon-console",  // 菜单图标
  "href": "view/dashboard.html", // 页面路径
  "closable": true,              // 是否可关闭
  "children": []                 // 子菜单
}
```

#### 菜单示例

```json
[
  {
    "id": 0,
    "code": "view/dashboard",
    "title": "控制台",
    "icon": "layui-icon-console",
    "href": "view/dashboard.html",
    "closable": false,
    "children": null
  },
  {
    "id": 1,
    "code": "system",
    "title": "系统管理",
    "icon": "layui-icon-set",
    "children": [
      {
        "id": 10,
        "code": "view/user",
        "title": "用户管理",
        "icon": "layui-icon-user",
        "href": "view/user.html"
      },
      {
        "id": 11,
        "code": "view/role",
        "title": "角色管理",
        "icon": "layui-icon-group",
        "href": "view/role.html"
      }
    ]
  }
]
```

#### 菜单属性说明

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Number | 是 | 菜单唯一标识 |
| code | String | 是 | 菜单代码，用于路由 |
| title | String | 是 | 菜单显示标题 |
| icon | String | 否 | LayUI 图标类名 |
| href | String | 否 | 页面路径 |
| closable | Boolean | 否 | 标签页是否可关闭，默认 true |
| children | Array | 否 | 子菜单数组 |

---

## 🏗️ 架构设计

### 模块化架构

系统采用 LayUI 的模块化架构，所有功能模块化开发。

#### 模块分类

```
模块类型
├── 核心模块 (Core Modules)
│   ├── app.js          # 主应用模块
│   ├── router.js       # 路由模块
│   ├── theme.js        # 主题模块
│   └── permission.js   # 权限模块
│
├── 组件模块 (Component Modules)
│   ├── sidebar.js      # 侧边栏组件
│   └── tabs.js         # 标签页组件
│
└── 扩展模块 (Extension Modules)
    ├── common.js       # 公共扩展
    ├── echarts.js      # 图表扩展
    ├── xm-select.js    # 下拉选择扩展
    ├── toast.js        # 提示框扩展
    ├── drawer.js       # 抽屉组件
    └── laydrawer.js    # LayUI 抽屉
```

#### 模块定义规范

```javascript
layui.define(['jquery', '依赖模块'], function(exports) {
  'use strict';

  var $ = layui.jquery;

  var Module = {
    // 模块属性
    property: null,

    // 初始化方法
    init: function(options) {
      // 初始化逻辑
      return this;
    },

    // 公共方法
    method: function() {
      // 方法逻辑
    }
  };

  exports('moduleName', Module);
});
```

#### 模块使用方式

```javascript
// 方式1: 通过 OSLAY 全局对象
OSLAY.ready(function(modules) {
  var module = modules.moduleName;
  module.method();
});

// 方式2: 通过 LayUI use
layui.use(['moduleName'], function() {
  var module = layui.moduleName;
  module.method();
});
```

### 初始化流程

```
页面加载
    ↓
加载 index.js
    ↓
加载 LayUI 框架
    ↓
加载 app.json 配置
    ↓
加载 menu.json 配置
    ↓
注册所有模块
    ↓
初始化权限模块
    ↓
初始化主应用模块
    ↓
系统就绪
    ↓
触发 ready 回调
```

### 路由系统

系统支持 Hash 路由模式，支持 ID 和 Code 混合路由。

#### 路由格式

```
Hash 路由格式:
http://example.com/#/view/dashboard
http://example.com/#/view/user
```

#### 路由跳转

```javascript
// 方式1: 通过路由模块
var router = OSLAY.modules.router;
router.go('view/dashboard');

// 方式2: 通过标签页模块
var tabs = OSLAY.modules.tabs;
tabs.add({
  id: 'dashboard',
  title: '控制台',
  href: 'view/dashboard.html'
});

// 方式3: 直接修改 hash
window.location.hash = '#/view/dashboard';
```

#### 路由监听

```javascript
var router = OSLAY.modules.router;

// 监听路由变化
router.on('change', function(route) {
  console.log('路由变化:', route);
});
```

---

## 🎨 主题系统

### 主题切换

系统支持亮色/暗色主题切换。

#### 切换主题

```javascript
var theme = OSLAY.modules.theme;

// 切换到亮色主题
theme.setMode('light');

// 切换到暗色主题
theme.setMode('dark');

// 切换主题色
theme.setColor('#16baaa');
```

#### 主题配置

```json
{
  "theme": {
    "defaultMode": "light",
    "defaultColor": "#16baaa",
    "defaultLayout": "double"
  }
}
```

### CSS 变量系统

系统使用 CSS 变量实现主题定制。

```css
:root {
  /* 主题色 */
  --accent: #16baaa;
  --accent-hover: #14a090;
  
  /* 背景色 */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --bg-dark: #0f1419;
  
  /* 文字色 */
  --text-primary: #333333;
  --text-secondary: #666666;
  
  /* 边框色 */
  --border: #e5e5e5;
  
  /* 阴影 */
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

### 自定义主题

1. **修改 CSS 变量**

```css
/* admin/css/theme.css */
:root {
  --accent: #1e9fff;
  --accent-hover: #1a8fe6;
}
```

2. **添加主题色**

```json
// config/app.json
{
  "colors": {
    "#1e9fff": {
      "hover": "#1a8fe6",
      "rgb": "30, 159, 255"
    }
  }
}
```

---

## 🔐 权限系统

### 权限配置

权限配置详见 [权限模块使用指南](permission-guide.md)。

### 快速使用

#### 1. 配置权限接口

```json
{
  "permission": {
    "enabled": true,
    "url": "/api/admin/permission"
  }
}
```

#### 2. HTML 权限控制

```html
<button permission="user-add">添加用户</button>
<button permission="user-edit">编辑用户</button>
<button permission="user-delete">删除用户</button>
```

#### 3. JavaScript 权限检查

```javascript
OSLAY.ready(function(modules) {
  var permission = modules.permission;
  
  if (permission.hasPermission('user-delete')) {
    // 显示删除按钮
  }
});
```

### 权限示例数据

项目提供了多种角色的权限示例数据:

- `view/data/permission.json` - 标准权限
- `view/data/permission-super.json` - 超级管理员
- `view/data/permission-operator.json` - 运营人员
- `view/data/permission-manager.json` - 业务经理

---

## 🧩 组件开发

### 开发规范

#### 1. 模块定义

```javascript
/**
 * 组件名称
 * 组件描述
 */
layui.define(['jquery', '依赖模块'], function(exports) {
  'use strict';

  var $ = layui.jquery;

  var Component = {
    // 默认配置
    config: {
      property: 'value'
    },

    // 初始化
    init: function(options) {
      var self = this;
      var config = $.extend({}, this.config, options);
      
      // 初始化逻辑
      
      return this;
    },

    // 公共方法
    method: function() {
      // 方法逻辑
    },

    // 私有方法
    _privateMethod: function() {
      // 私有逻辑
    }
  };

  exports('componentName', Component);
});
```

#### 2. 注册模块

```javascript
// admin/js/index.js
layui.config({
  base: baseUrl
}).extend({
  componentName: 'modules/path/to/component'
});
```

#### 3. 使用组件

```javascript
// 方式1: 通过 OSLAY
OSLAY.ready(function(modules) {
  var component = modules.componentName;
  component.init({ /* 配置 */ });
});

// 方式2: 通过 LayUI
layui.use(['componentName'], function() {
  var component = layui.componentName;
  component.init({ /* 配置 */ });
});
```

### 组件示例

#### Toast 提示框组件

```javascript
// 使用 Toast
var toast = OSLAY.modules.toast;

toast.success('操作成功');
toast.error('操作失败');
toast.warning('警告信息');
toast.info('提示信息');
```

#### Drawer 抽屉组件

```javascript
// 使用 Drawer
var drawer = OSLAY.modules.drawer;

drawer.open({
  title: '抽屉标题',
  content: '抽屉内容',
  width: 400,
  onConfirm: function() {
    // 确认回调
  },
  onCancel: function() {
    // 取消回调
  }
});
```

#### ECharts 图表组件

```javascript
// 使用 ECharts
var echarts = OSLAY.modules.echarts;

echarts.render('chart-container', {
  title: { text: '图表标题' },
  xAxis: { data: ['A', 'B', 'C'] },
  yAxis: {},
  series: [{
    type: 'bar',
    data: [10, 20, 30]
  }]
});
```

---

## 📦 扩展开发

### 添加新页面

#### 1. 创建页面文件

```html
<!-- view/mypage.html -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的页面</title>
</head>
<body>
  <div class="layui-container">
    <!-- 页面内容 -->
  </div>

  <script>
  // 页面脚本
  OSLAY.ready(function(modules) {
    // 模块初始化
  });
  </script>
</body>
</html>
```

#### 2. 添加菜单项

```json
// config/menu.json
{
  "id": 100,
  "code": "view/mypage",
  "title": "我的页面",
  "icon": "layui-icon-component",
  "href": "view/mypage.html"
}
```

### 添加新模块

#### 1. 创建模块文件

```javascript
// modules/myModule.js
layui.define(['jquery'], function(exports) {
  'use strict';

  var $ = layui.jquery;

  var MyModule = {
    init: function() {
      console.log('MyModule initialized');
      return this;
    }
  };

  exports('myModule', MyModule);
});
```

#### 2. 注册模块

```javascript
// admin/js/index.js
layui.config({
  base: baseUrl
}).extend({
  myModule: 'modules/myModule'
});
```

#### 3. 加载模块

```javascript
// admin/js/index.js
layui.use(['appMain', 'myModule'], function() {
  var myModule = layui.myModule;
  myModule.init();
});
```

### 添加新组件

#### 1. 创建组件文件

```javascript
// modules/components/myComponent.js
layui.define(['jquery'], function(exports) {
  'use strict';

  var $ = layui.jquery;

  var MyComponent = {
    render: function(container, options) {
      var html = '<div class="my-component">组件内容</div>';
      $(container).html(html);
      return this;
    }
  };

  exports('myComponent', MyComponent);
});
```

#### 2. 创建样式文件

```css
/* admin/css/components/myComponent.css */
.my-component {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
}
```

#### 3. 注册和使用

```javascript
// 注册
layui.extend({
  myComponent: 'modules/components/myComponent'
});

// 使用
OSLAY.ready(function(modules) {
  var myComponent = layui.myComponent;
  myComponent.render('#container', { /* 配置 */ });
});
```

---

## 🎯 最佳实践

### 代码规范

#### 1. 命名规范

```javascript
// 模块名: 小驼峰
var myModule = {};

// 组件名: 小驼峰
var myComponent = {};

// 方法名: 小驼峰
function getData() {}

// 私有方法: 下划线前缀
function _privateMethod() {}

// 常量: 大写下划线
var MAX_COUNT = 100;
```

#### 2. 注释规范

```javascript
/**
 * 方法描述
 * @param {String} param1 - 参数1说明
 * @param {Object} param2 - 参数2说明
 * @returns {Boolean} 返回值说明
 */
function methodName(param1, param2) {
  // 单行注释
  
  /*
   * 多行注释
   * 第二行
   */
}
```

#### 3. 错误处理

```javascript
// 推荐的错误处理方式
function loadData() {
  return new Promise(function(resolve, reject) {
    $.ajax({
      url: '/api/data',
      success: function(res) {
        if (res.code === 0) {
          resolve(res.data);
        } else {
          reject(new Error(res.msg));
        }
      },
      error: function(err) {
        reject(err);
      }
    });
  });
}

// 使用
loadData()
  .then(function(data) {
    console.log('数据加载成功:', data);
  })
  .catch(function(err) {
    console.error('数据加载失败:', err);
    layer.msg('数据加载失败');
  });
```

### 性能优化

#### 1. 按需加载

```javascript
// 推荐: 按需加载模块
layui.use(['需要的模块'], function() {
  // 只加载需要的模块
});

// 不推荐: 加载所有模块
layui.use(['所有模块'], function() {
  // 加载不必要的模块
});
```

#### 2. 事件委托

```javascript
// 推荐: 使用事件委托
$(document).on('click', '.btn', function() {
  // 事件处理
});

// 不推荐: 为每个元素绑定事件
$('.btn').each(function() {
  $(this).on('click', function() {
    // 事件处理
  });
});
```

#### 3. 缓存 DOM

```javascript
// 推荐: 缓存 DOM 元素
var $container = $('#container');
$container.find('.item').each(function() {
  // 处理逻辑
});

// 不推荐: 重复查询 DOM
$('#container').find('.item').each(function() {
  // 处理逻辑
});
$('#container').find('.other').each(function() {
  // 处理逻辑
});
```

### 安全建议

#### 1. XSS 防护

```javascript
// 推荐: 使用 text() 而不是 html()
$('#content').text(userInput);

// 不推荐: 直接使用 html()
$('#content').html(userInput);
```

#### 2. 权限验证

```javascript
// 前端权限检查
if (permission.hasPermission('user-delete')) {
  // 显示删除按钮
}

// 后端权限验证 (必须)
// 所有敏感操作必须在服务端验证权限
```

#### 3. 数据验证

```javascript
// 前端数据验证
function validateForm(data) {
  if (!data.name) {
    layer.msg('请输入名称');
    return false;
  }
  if (!data.email) {
    layer.msg('请输入邮箱');
    return false;
  }
  return true;
}

// 后端数据验证 (必须)
// 所有数据必须在服务端验证
```

---

## 🐛 调试技巧

### 开启调试模式

```javascript
// 在浏览器控制台执行
OSLAY.debug = true;

// 查看模块列表
console.log(OSLAY.modules);

// 查看配置
console.log(OSLAY.appConfig);
console.log(OSLAY.menuConfig);
```

### 常用调试命令

```javascript
// 查看权限状态
var permission = OSLAY.modules.permission;
console.log('权限列表:', permission.getPermissions());
console.log('是否超管:', permission.isSuper());

// 查看当前路由
var router = OSLAY.modules.router;
console.log('当前路由:', router.getCurrent());

// 查看主题配置
var theme = OSLAY.modules.theme;
console.log('当前主题:', theme.getMode());
console.log('当前颜色:', theme.getColor());
```

### 控制台日志

```javascript
// 在模块中添加日志
var Module = {
  init: function() {
    if (OSLAY.debug) {
      console.log('[Module] 初始化');
    }
  }
};
```

---

## 📚 API 文档

### OSLAY 全局对象

#### 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| version | String | 版本号 |
| name | String | 应用名称 |
| debug | Boolean | 调试模式 |
| baseUrl | String | 基础路径 |
| modules | Object | 模块集合 |
| appConfig | Object | 应用配置 |
| menuConfig | Object | 菜单配置 |

#### 方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| ready(callback) | Function | void | 系统就绪回调 |
| use(modules, callback) | Array, Function | void | 加载模块 |
| getModule(name) | String | Object | 获取模块 |
| getConfig() | - | Object | 获取配置 |
| getMenuConfig() | - | Object | 获取菜单配置 |
| log(...args) | ...Any | void | 调试日志 |

### 权限模块 API

详见 [权限模块使用指南](permission-guide.md)。

### 路由模块 API

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| go(path) | String | void | 跳转到指定路由 |
| getCurrent() | - | String | 获取当前路由 |
| on(event, callback) | String, Function | void | 监听路由事件 |

### 主题模块 API

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| setMode(mode) | String | void | 设置主题模式 |
| getMode() | - | String | 获取主题模式 |
| setColor(color) | String | void | 设置主题色 |
| getColor() | - | String | 获取主题色 |

---

## 🔄 更新日志

### v1.0.0 (2026-03-31)

#### 新增功能
- ✅ 模块化架构设计
- ✅ 配置驱动系统
- ✅ 权限管理模块
- ✅ 主题切换系统
- ✅ Hash 路由系统
- ✅ 标签页管理
- ✅ 多种组件封装

#### 核心模块
- ✅ 主应用模块 (app.js)
- ✅ 路由模块 (router.js)
- ✅ 主题模块 (theme.js)
- ✅ 权限模块 (permission.js)
- ✅ 侧边栏组件 (sidebar.js)
- ✅ 标签页组件 (tabs.js)

#### 扩展模块
- ✅ ECharts 图表扩展
- ✅ XM-Select 下拉选择
- ✅ Toast 提示框
- ✅ Drawer 抽屉组件

---

## 🤝 贡献指南

### 开发流程

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 代码规范

- 遵循 JavaScript 编码规范
- 添加必要的注释
- 编写单元测试
- 更新相关文档

### 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具相关
```

---

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

---

## 📞 联系方式

- 项目主页: [GitHub Repository URL]
- 问题反馈: [GitHub Issues URL]
- 文档地址: [Documentation URL]

---

## 🙏 致谢

感谢以下开源项目:

- [LayUI](https://layui.com/) - 经典模块化前端框架
- [jQuery](https://jquery.com/) - JavaScript 库
- [ECharts](https://echarts.apache.org/) - 数据可视化图表库
- [XM-Select](https://gitee.com/maplemei/xm-select) - 多选解决方案

---

**最后更新时间**: 2026-03-31  
**文档版本**: 1.0.0
