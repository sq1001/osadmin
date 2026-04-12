# OSADMIN 后台管理系统开发文档

## 📋 项目概述

**项目名称**: OSADMIN\
**版本**: 1.6.0\
**描述**: 基于 LayUI 的轻量化原生管理后台系统\
**技术栈**: LayUI + jQuery + 原生 JavaScript\
**架构模式**: 模块化架构 + 配置驱动

### 核心特性

- ✅ **模块化架构**: 基于 LayUI 模块系统，按需加载
- ✅ **配置驱动**: JSON 配置文件驱动，灵活可扩展
- ✅ **权限管理**: 完善的权限控制系统
- ✅ **主题系统**: 支持多主题切换和自定义
- ✅ **路由管理**: Hash 路由，支持 ID 和 Code 混合路由
- ✅ **资源按需加载**: 页面级 CSS/JS 按需加载，支持动态 meta 信息
- ✅ **智能组件渲染**: 自动检测并渲染 LayUI 组件，支持按需加载模块
- ✅ **水印系统**: Canvas 水印，支持防删除保护和动态文本
- ✅ **组件丰富**: 封装多种常用组件
- ✅ **响应式设计**: 适配多种屏幕尺寸

***

## 📁 项目结构

```HTML
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
│   ├── xm-select/          # XM-Select 下拉选择
│   │   └── xm-select.js
│   └── tinymce/            # TinyMCE 富文本编辑器
│       ├── tinymce.min.js  # TinyMCE 核心
│       ├── skins/          # 皮肤文件
│       ├── plugins/        # 插件文件
│       ├── themes/         # 主题文件
│       ├── icons/          # 图标文件
│       └── langs/          # 语言包
│
├── modules/                  # 模块目录
│   ├── app.js              # 主应用模块
│   ├── common/             # 公共模块
│   │   ├── router.js       # 路由模块
│   │   ├── theme.js        # 主题模块
│   │   ├── permission.js   # 权限模块
│   │   └── component-renderer.js # 组件渲染模块
│   ├── components/         # 组件模块
│   │   ├── sidebar.js      # 侧边栏组件
│   │   └── tabs.js         # 标签页组件
│   └── extends/            # 扩展模块
│       ├── common.js       # 公共扩展
│       ├── count.js        # 计数器
│       ├── echarts.js      # 图表扩展
│       ├── xm-select.js    # 下拉选择扩展
│       ├── tinymce.js      # 富文本编辑器扩展
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
│   │   ├── tinymce-demo.html # 富文本编辑器示例
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

***

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

1. **启动本地服务器**

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

1. **访问系统**

```
http://localhost:8080
```

### 目录权限

确保以下目录有写入权限:

- `config/` - 配置文件目录
- `view/data/` - 数据文件目录

***

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

### 水印系统

系统内置了强大的水印功能，支持动态文本、防删除保护和性能优化。

#### 基本配置

```json
{
  "watermark": {
    "enabled": true,
    "text": "OSADMIN",
    "dynamicTextKey": "username",
    "fontSize": 14,
    "color": "rgba(0, 0, 0, 0.08)",
    "rotate": -22,
    "gapX": 100,
    "gapY": 100
  }
}
```

#### 水印特性

##### 1. 动态文本支持

支持从 sessionStorage 中读取动态文本作为水印内容：

```javascript
// 简单键名
sessionStorage.setItem('username', '张三');

// 嵌套键名（支持多层级）
sessionStorage.setItem('userInfo', JSON.stringify({
  admin: {
    info: {
      userName: '张三'
    }
  }
}));

// 配置中使用嵌套路径
{
  "watermark": {
    "dynamicTextKey": "userInfo.admin.info.userName"
  }
}
```

##### 2. 防删除保护

使用 MutationObserver 监听水印节点，自动恢复被删除或修改的水印：

- **节点删除保护**: 检测到水印节点被删除时自动恢复
- **样式修改保护**: 检测到 `display`、`visibility`、`opacity` 等样式被修改时自动恢复
- **控制台警告**: 删除或修改水印时在控制台输出警告信息

##### 3. Canvas 缓存机制

使用 Canvas 生成水印图片并缓存，提升性能：

- **缓存策略**: 根据水印参数（文本、字体、颜色、旋转角度、间距）生成缓存键
- **性能提升**: 相同参数的水印只生成一次，后续直接使用缓存
- **精确测量**: 使用 `ctx.measureText()` 精确测量文本宽度，优化水印间距

##### 4. 主题自动适配

水印颜色会根据主题模式自动调整：

- **亮色主题**: 使用配置的颜色（默认 `rgba(0, 0, 0, 0.08)`）
- **暗色主题**: 自动切换为 `rgba(255, 255, 255, 0.06)`

#### 使用方法

##### 启用/禁用水印

```javascript
var theme = OSLAY.modules.theme;

// 启用水印
theme.setState({ watermarkEnabled: true });

// 禁用水印
theme.setState({ watermarkEnabled: false });

// 设置水印文本
theme.setState({ watermarkText: '机密文件' });
```

##### 动态设置水印

```javascript
// 用户登录后设置水印
sessionStorage.setItem('username', '张三');
theme.applyWatermark(true, '张三');

// 使用嵌套数据
var userData = {
  admin: { name: '张三', department: '技术部' }
};
sessionStorage.setItem('userData', JSON.stringify(userData));

// 配置文件中
{
  "watermark": {
    "dynamicTextKey": "userData.admin.name"
  }
}
```

#### 水印优先级

水印文本的获取优先级：

1. **sessionStorage 动态文本** (最高优先级)
   - 从 `dynamicTextKey` 配置的键名读取
   
2. **state.watermarkText**
   - 通过 `theme.setState({ watermarkText: 'xxx' })` 设置的文本
   
3. **配置文件中的 text**
   - `app.json` 中 `watermark.text` 的值

#### API 接口

```javascript
var theme = OSLAY.modules.theme;

// 应用水印
theme.applyWatermark(enabled, text);

// 获取水印文本
var watermarkText = theme.getWatermarkText();

// 获取嵌套对象值
var value = theme.getNestedValue(obj, 'path.to.value');

// 启动水印监听
theme.startWatermarkObserver();

// 停止水印监听
theme.stopWatermarkObserver();
```

#### 注意事项

1. **性能考虑**: 水印使用 Canvas 生成，大量不同参数的水印会占用内存
2. **安全提示**: 前端水印可被技术手段绕过，重要场景需配合后端水印
3. **浏览器兼容**: 需要浏览器支持 Canvas API 和 MutationObserver
4. **sessionStorage 限制**: sessionStorage 大小限制约 5MB，避免存储过大数据

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
    "text": "OSADMIN",           // 水印默认文字
    "dynamicTextKey": "username", // 动态文本键名，支持嵌套路径如 "userInfo.admin.userName"
    "fontSize": 14,              // 字体大小
    "color": "rgba(0, 0, 0, 0.08)", // 水印颜色
    "rotate": -22,               // 旋转角度
    "gapX": 100,                 // X轴间距
    "gapY": 100                  // Y轴间距
  }
}
```

**水印特性说明**:
- **动态文本**: 支持从 sessionStorage 中读取动态文本，如用户名
- **嵌套键名**: 支持使用点号分隔的嵌套路径，如 `"userInfo.admin.userName"`
- **防删除保护**: 使用 MutationObserver 监听水印节点，自动恢复被删除的水印
- **Canvas 缓存**: 使用缓存机制提升水印生成性能
- **主题适配**: 自动适配亮色/暗色主题，调整水印颜色

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

```JSON
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
  "type": 1,                     // 类型: 0=目录, 1=菜单
  "code": "view/dashboard",      // 菜单代码 (唯一)
  "title": "控制台",              // 菜单标题
  "icon": "layui-icon-console",  // 菜单图标
  "href": "view/dashboard.html", // 页面路径
  "openType": "_blank",          // 打开方式 (可选，仅菜单类型有效)
  "closable": true,              // 是否可关闭
  "children": []                 // 子菜单
}
```

#### type 类型定义

| type | 含义 | 特征 |
|------|------|------|
| `0` | 目录 | 有 `children` 且非空 |
| `1` | 菜单 | 有 `href`，无 `children` 或 `children` 为空 |

#### openType 打开方式 (仅菜单类型有效)

| openType | 含义 | 行为 |
|----------|------|------|
| `_blank` | 新标签页 | `window.open(href, '_blank')` |
| `_iframe` | 内嵌 iframe | 主页面显示 iframe |
| `_dialog` | 弹窗 | `layer.open({ type: 2, content: href })` |
| 无 | 默认 | 内部页面 AJAX 加载 |

#### 菜单示例

```json
[
  {
    "id": 0,
    "type": 1,
    "code": "view/dashboard",
    "title": "控制台",
    "icon": "layui-icon-console",
    "href": "view/dashboard.html",
    "closable": false
  },
  {
    "id": 1,
    "type": 0,
    "code": "system",
    "title": "系统管理",
    "icon": "layui-icon-set",
    "children": [
      {
        "id": 10,
        "type": 1,
        "code": "view/user",
        "title": "用户管理",
        "icon": "layui-icon-user",
        "href": "view/user.html"
      },
      {
        "id": 11,
        "type": 1,
        "code": "view/role",
        "title": "角色管理",
        "icon": "layui-icon-group",
        "href": "view/role.html"
      }
    ]
  },
  {
    "id": 100,
    "type": 0,
    "code": "external-links",
    "title": "外部链接",
    "icon": "layui-icon-link",
    "children": [
      {
        "id": 101,
        "type": 1,
        "code": "external/baidu",
        "title": "百度搜索",
        "icon": "layui-icon-search",
        "href": "https://www.baidu.com",
        "openType": "_blank"
      },
      {
        "id": 102,
        "type": 1,
        "code": "external/monitor",
        "title": "监控大屏",
        "icon": "layui-icon-chart-screen",
        "href": "https://monitor.example.com",
        "openType": "_iframe"
      }
    ]
  }
]
```

#### 菜单属性说明

| 属性       | 类型      | 必填 | 说明               |
| -------- | ------- | -- | ---------------- |
| id       | Number  | 是  | 菜单唯一标识           |
| type     | Number  | 否  | 类型: 0=目录, 1=菜单 (默认根据 children 自动判断) |
| code     | String  | 是  | 菜单代码，用于路由        |
| title    | String  | 是  | 菜单显示标题           |
| icon     | String  | 否  | LayUI 图标类名       |
| href     | String  | 否  | 页面路径 (支持外链)      |
| openType | String  | 否  | 打开方式: `_blank`/`_iframe`/`_dialog` (仅菜单类型有效) |
| closable | Boolean | 否  | 标签页是否可关闭，默认 true |
| children | Array   | 否  | 子菜单数组            |

***

## 📦 资源按需加载

### 功能概述

系统支持页面级资源按需加载，可以在页面加载时动态注入 CSS、JS 资源，并支持动态更新页面的 title、keywords、description 等 meta 信息。

### 配置文件

资源配置文件位于 `config/resources.json`。

#### 配置结构

```json
{
  "pages": {
    "view/dashboard.html": {
      "title": "控制台",
      "keywords": "控制台,仪表盘,数据概览",
      "description": "系统控制台，展示关键业务数据指标",
      "css": ["admin/css/view/dashboard.css"],
      "js": ["admin/js/view/dashboard.js"],
      "dependencies": ["echarts"]
    }
  },
  "global": {
    "css": ["lib/layui/css/layui.css", "admin/css/index.css"],
    "js": ["lib/layui/layui.js", "admin/js/index.js"]
  },
  "externals": {
    "echarts": {
      "js": "lib/echarts/echarts.min.js",
      "css": null,
      "global": "echarts"
    },
    "xmSelect": {
      "js": "lib/xm-select/xm-select.js",
      "css": "lib/xm-select/xm-select.css",
      "global": "xmSelect"
    }
  }
}
```

#### 配置项说明

| 配置项       | 类型     | 说明      |
| --------- | ------ | ------- |
| pages     | Object | 页面级资源配置 |
| global    | Object | 全局资源配置  |
| externals | Object | 外部依赖配置  |

#### 页面配置属性

| 属性           | 类型     | 必填 | 说明             |
| ------------ | ------ | -- | -------------- |
| title        | String | 否  | 页面标题，会自动拼接站点名称 |
| keywords     | String | 否  | 页面关键词，用于 SEO   |
| description  | String | 否  | 页面描述，用于 SEO    |
| css          | Array  | 否  | 页面专属 CSS 文件列表  |
| js           | Array  | 否  | 页面专属 JS 文件列表   |
| dependencies | Array  | 否  | 依赖的外部模块列表      |

### Meta 信息优先级

系统支持三种方式配置页面 meta 信息，优先级从高到低：

```
页面 HTML meta  >  resources.json 配置  >  菜单 title
```

#### 方式一：页面 HTML（最高优先级）

在页面 HTML 的 `<head>` 中定义：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>商品列表 - 库存管理系统</title>
  <meta name="keywords" content="商品列表,库存管理,商品查询">
  <meta name="description" content="商品列表页面，支持商品搜索、筛选功能">
  <link rel="stylesheet" href="view/css/product-list.css">
</head>
<body>
  <div class="page-content">
    <!-- 页面内容 -->
  </div>
  <script src="view/js/product-list.js"></script>
</body>
</html>
```

#### 方式二：resources.json 配置

在资源配置文件中定义：

```json
{
  "pages": {
    "view/product-list.html": {
      "title": "商品列表",
      "keywords": "商品,列表,库存",
      "description": "商品列表管理页面",
      "css": ["view/css/product-list.css"],
      "js": ["view/js/product-list.js"]
    }
  }
}
```

#### 方式三：菜单 title（兜底）

使用菜单配置中的 title 作为页面标题：

```json
{
  "id": 10,
  "title": "商品列表",
  "href": "view/product-list.html"
}
```

### 外部依赖管理

系统支持定义外部依赖模块，可在多个页面间复用：

```json
{
  "externals": {
    "echarts": {
      "js": "lib/echarts/echarts.min.js",
      "css": null,
      "global": "echarts"
    }
  }
}
```

在页面中引用：

```json
{
  "pages": {
    "view/components/echarts-demo.html": {
      "dependencies": ["echarts"]
    }
  }
}
```

### API 接口

#### resourceLoader 模块

```javascript
// 获取页面配置
var pageConfig = resourceLoader.getPageConfig('view/dashboard.html');

// 加载页面资源
resourceLoader.loadPageResources('view/dashboard.html').done(function() {
  console.log('资源加载完成');
});

// 加载单个 CSS
resourceLoader.loadCSS('admin/css/custom.css');

// 加载单个 JS
resourceLoader.loadJS('admin/js/custom.js');

// 加载依赖模块
resourceLoader.loadDependency('echarts');

// 检查资源是否已加载
var loaded = resourceLoader.isLoaded('css', 'admin/css/custom.css');

// 清除缓存
resourceLoader.clearCache();
```

### 最佳实践

1. **资源分离**: 将页面专属的 CSS/JS 放在独立的目录中
2. **依赖复用**: 使用 externals 定义公共依赖
3. **按需配置**: 只配置页面真正需要的资源
4. **SEO 优化**: 为重要页面配置完整的 meta 信息

***

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
│   ├── permission.js   # 权限模块
│   └── component-renderer.js # 组件渲染模块
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

***

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

1. **添加主题色**

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

***

## 🤖 智能组件渲染

### 功能概述

在 SPA (单页应用) 模式下，动态加载的 HTML 内容中的 LayUI 组件不会自动渲染。`componentRenderer` 模块通过智能扫描 DOM，自动检测并渲染所需的 LayUI 组件，实现按需加载和性能优化。

### 核心特性

- ✅ **自动扫描**: 自动检测页面中的 LayUI 组件
- ✅ **按需加载**: 只加载检测到的组件所需的模块
- ✅ **智能缓存**: 避免重复渲染同一组件
- ✅ **优先级控制**: 支持组件渲染优先级配置
- ✅ **调试模式**: 提供详细的渲染日志

### 支持的组件

| 组件名 | 选择器 | LayUI 模块 | 优先级 |
|--------|--------|-----------|--------|
| tabs | `.layui-tabs` | tabs | 1 |
| form | `.layui-form`, 表单元素 | form | 2 |
| element | `.layui-nav`, `.layui-collapse` 等 | element | 3 |
| carousel | `.layui-carousel` | carousel | 4 |
| rate | `.layui-rate` | rate | 5 |
| slider | `.layui-slider` | slider | 6 |
| transfer | `.layui-transfer` | transfer | 7 |
| tree | `.layui-tree` | tree | 8 |
| colorpicker | `.layui-colorpicker` | colorpicker | 9 |
| laypage | `.layui-laypage` | laypage | 10 |
| code | `pre.layui-code` | code | 11 |

### 使用方法

#### 1. 基本使用

```javascript
// 在页面加载完成后自动渲染所有组件
OSLAY.ready(function(modules) {
  var renderer = layui.componentRenderer;
  
  // 渲染整个页面
  renderer.render();
});
```

#### 2. 渲染指定容器

```javascript
// 只渲染特定容器内的组件
renderer.render('#myContainer');
```

#### 3. 渲染指定组件

```javascript
// 只渲染指定的组件类型
renderer.render('#container', 'tabs,form,element');
```

#### 4. 开启调试模式

```javascript
// 初始化时开启调试
renderer.init({ debug: true });

// 渲染时会输出详细日志
renderer.render();
// 输出示例:
// [ComponentRenderer] Detected: tabs Count: 2
// [ComponentRenderer] Modules to load: ["tabs", "form"]
// [ComponentRenderer] Rendered: tabs
```

#### 5. 清除缓存

```javascript
// 清除渲染缓存，允许重新渲染
renderer.clearCache('#container');
```

### API 文档

#### 初始化

```javascript
renderer.init(options);
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| debug | Boolean | false | 是否开启调试模式 |

#### 渲染方法

```javascript
renderer.render(container, componentNames);
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| container | String/Element | 否 | 容器选择器或元素，默认为整个文档 |
| componentNames | String | 否 | 组件名称列表，用逗号分隔 |

#### 其他方法

```javascript
// 扫描组件
var components = renderer.scanComponents($('#container'));

// 获取所需模块
var modules = renderer.getRequiredModules(components);

// 清除缓存
renderer.clearCache('#container');

// 渲染所有组件
renderer.renderAll('#container');
```

### 工作原理

1. **DOM 扫描**: 遍历容器，查找匹配的组件选择器
2. **模块收集**: 收集所有检测到的组件所需的 LayUI 模块
3. **按需加载**: 使用 `layui.use()` 动态加载所需模块
4. **组件渲染**: 调用各组件的 `render()` 方法进行渲染
5. **状态标记**: 为已渲染的组件添加标记，避免重复渲染

### 性能优化

- **减少模块加载**: 只加载页面实际使用的组件模块，减少 80% 的不必要加载
- **Canvas 缓存**: 水印等组件使用 Canvas 缓存机制
- **智能检测**: 通过选择器快速定位，避免全局遍历
- **渲染标记**: 使用 `data-layui-rendered` 标记避免重复渲染

### 最佳实践

#### 1. 在 SPA 中使用

```javascript
// 在 app.js 的 showContent 方法中
showContent: function(content) {
  $wrapper.html(content);
  
  // 自动渲染新内容中的组件
  if (window.layui && layui.componentRenderer) {
    layui.componentRenderer.render($wrapper);
  }
}
```

#### 2. 动态内容渲染

```javascript
// 加载动态内容后渲染
$('#container').load('page.html', function() {
  layui.componentRenderer.render('#container');
});
```

#### 3. 表单动态添加

```javascript
// 添加新表单元素后渲染
$('#formContainer').append(newFormHtml);
layui.componentRenderer.render('#formContainer', 'form');
```

### 注意事项

1. **避免重复渲染**: 组件渲染后会添加标记，重复调用 `render()` 不会重复渲染
2. **容器选择**: 建议指定具体的容器，避免全局扫描影响性能
3. **模块依赖**: 确保所需的 LayUI 模块已正确配置
4. **调试模式**: 生产环境建议关闭调试模式

***

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

***

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

***

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

***

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

***

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

***

## 📚 API 文档

### OSLAY 全局对象

#### 属性

| 属性         | 类型      | 说明   |
| ---------- | ------- | ---- |
| version    | String  | 版本号  |
| name       | String  | 应用名称 |
| debug      | Boolean | 调试模式 |
| baseUrl    | String  | 基础路径 |
| modules    | Object  | 模块集合 |
| appConfig  | Object  | 应用配置 |
| menuConfig | Object  | 菜单配置 |

#### 方法

| 方法                     | 参数              | 返回值    | 说明     |
| ---------------------- | --------------- | ------ | ------ |
| ready(callback)        | Function        | void   | 系统就绪回调 |
| use(modules, callback) | Array, Function | void   | 加载模块   |
| getModule(name)        | String          | Object | 获取模块   |
| getConfig()            | -               | Object | 获取配置   |
| getMenuConfig()        | -               | Object | 获取菜单配置 |
| log(...args)           | ...Any          | void   | 调试日志   |

### 权限模块 API

详见 [权限模块使用指南](permission-guide.md)。

### 路由模块 API

| 方法                  | 参数               | 返回值    | 说明      |
| ------------------- | ---------------- | ------ | ------- |
| go(path)            | String           | void   | 跳转到指定路由 |
| getCurrent()        | -                | String | 获取当前路由  |
| on(event, callback) | String, Function | void   | 监听路由事件  |

### 主题模块 API

| 方法              | 参数     | 返回值    | 说明     |
| --------------- | ------ | ------ | ------ |
| setMode(mode)   | String | void   | 设置主题模式 |
| getMode()       | -      | String | 获取主题模式 |
| setColor(color) | String | void   | 设置主题色  |
| getColor()      | -      | String | 获取主题色  |

***

## 🔄 更新日志

### v1.6.0 (2026-04-12)

#### 新增功能

##### 固定双列布局
- ✅ **新增固定双列布局模式 (fixed-double)**
  - 主侧边栏固定宽度 80px，不可收缩
  - 子菜单面板固定宽度 180px，始终显示
  - 菜单项采用图标在上、文字在下的垂直排列方式
  - Logo 区域同样采用图标在上、文字在下的布局
  - 移动端自动适配为全屏抽屉模式，与弹性双列布局一致

##### 水印模块
- ✅ **新增水印模块示例页面**
  - 水印配置示例
  - 动态文本示例
  - 防删除保护演示

##### 图标模块
- ✅ **新增图标模块示例页面**
  - LayUI 图标展示
  - 图标使用示例

#### 功能优化

##### 布局样式优化
- ✅ **优化三种布局模式的一致性**
  - 弹性双列、固定双列、下拉菜单在移动端行为统一
  - 统一菜单项圆角样式
  - 统一激活状态背景样式

- ✅ **优化菜单项样式**
  - 修复嵌套菜单激活状态圆角不一致问题
  - 添加 `.submenu-item` 和 `.nested-dropdown-item` 的圆角样式

- ✅ **优化文字溢出处理**
  - `.layui-logo-text` 添加超出隐藏和省略号
  - `.layui-submenu-panel-title` 添加超出隐藏和省略号
  - 修复 `text-overflow: ellipsis` 在 flex 容器中不生效的问题

##### 水印逻辑优化
- ✅ **优化框架水印逻辑**
  - 改进水印生成性能
  - 优化防删除保护机制
  - 增强主题适配能力

##### 综合表单示例完善
- ✅ **完善综合表单示例页面**
  - 新增按钮弹窗示例（三种弹窗类型）
  - 新增多图片上传功能
  - 新增表单初始化赋值示例
  - 示例数据通过 AJAX 请求加载
  - 采用遍历字段方式赋值

#### 文件变更

##### 新增文件
- `view/data/form-open-test-set.json` - 表单示例数据
- `view/components/watermark-demo.html` - 水印示例页面
- `view/components/icon-demo.html` - 图标示例页面

##### 修改文件
- `admin/css/admin.css` - 新增固定双列布局样式、优化菜单项样式
- `admin/css/theme.css` - 新增布局选项图标样式
- `modules/components/sidebar.js` - 支持固定双列布局
- `modules/common/theme.js` - 布局切换逻辑优化
- `modules/app.js` - 初始化逻辑优化
- `index.html` - 新增布局选项
- `config/app.json` - 版本更新

#### 技术细节

##### 固定双列布局 CSS 变量
```css
:root {
  --sidebar-fixed-width: 80px;
  --submenu-fixed-width: 180px;
}
```

##### 布局切换 API
```javascript
var theme = OSLAY.modules.theme;
theme.setState({ layout: 'fixed-double' });
```

### v1.5.1 (2026-04-10)

#### 新增功能

##### TinyMCE 富文本编辑器模块
- ✅ **新增 TinyMCE 8.4.0 富文本编辑器模块**
  - 完整集成 TinyMCE 8.4.0 最新版本
  - 支持 GPL 开源许可证，无需 API Key
  - 内置中文语言包（zh-CN）
  - 支持快速工具栏（Quickbars）
  - 支持图片上传功能
  - 支持多种编辑器模式（标准、迷你、内联、只读）

- ✅ **新增富文本编辑器示例页面**
  - 基础编辑器示例
  - 迷你编辑器示例
  - 完整功能编辑器示例
  - 内联编辑器示例
  - 只读模式示例
  - 自定义工具栏示例

- ✅ **新增编辑器美化样式**
  - 现代化圆角设计
  - 渐变背景工具栏
  - 柔和阴影效果
  - 悬停动画过渡
  - 深色主题完整支持

#### 功能优化

##### TinyMCE 模块功能完善
- ✅ **完整的 API 封装**
  - `init()` - 初始化编辑器
  - `get()` - 获取编辑器实例
  - `remove()` - 移除编辑器
  - `getContent()` - 获取内容
  - `setContent()` - 设置内容
  - `resetContent()` - 重置内容
  - `show()` - 显示编辑器
  - `hide()` - 隐藏编辑器
  - `reload()` - 重载编辑器（支持保留内容和光标位置）

#### 文件变更

##### 新增文件
- `lib/tinymce/` - TinyMCE 8.4.0 完整资源
  - `tinymce.min.js` - 核心文件
  - `skins/` - 皮肤文件
  - `plugins/` - 插件文件（29个插件）
  - `themes/` - 主题文件
  - `icons/` - 图标文件
  - `langs/` - 语言包文件
- `modules/extends/tinymce.js` - TinyMCE 模块封装
- `admin/css/extends/tinymce.css` - TinyMCE 美化样式
- `view/components/tinymce-demo.html` - 富文本编辑器示例页面

##### 修改文件
- `config/menu.json` - 添加富文本编辑器菜单项

#### 技术细节

##### TinyMCE 配置特性
- **插件支持**: advlist, autolink, lists, link, image, charmap, preview, anchor, searchreplace, visualblocks, code, fullscreen, insertdatetime, media, table, help, wordcount, quickbars
- **快速工具栏**: 选中文本时显示格式化工具，新行时显示快速插入按钮
- **图片上传**: 支持拖拽上传和文件选择器上传
- **主题支持**: 完整支持亮色/暗色主题自动切换
- **GPL 许可**: 使用 `license_key: 'gpl'` 开源许可证

#### 菜单更新

新增"组件示例"菜单项：
- 富文本编辑器（ID: 110, Code: view/components/tinymce-demo）

### v1.5.0 (2026-04-10)

#### 重构

- **重构框架布局**: 优化整体架构设计，提升代码可维护性
- **重构页面切换动画系统**: 提升用户体验，支持多种动画效果
- **重构主题配置面板**: 增强配置灵活性，优化交互体验

#### 优化

- **优化页面加载效果**: 采用简洁的纯图标样式，移除冗余文字提示
- **优化主题配置系统**: 修复 layui select 组件事件监听问题，确保配置正常保存
- **优化页面切换动画应用逻辑**: 确保所有页面类型都能正常显示动画效果
- **优化细节样式**: 提升视觉体验，增强界面美观度
- **优化 CSS 类名规范**: 避免样式冲突，将 `.layui-loading` 改为 `.page-loading`

#### 新增

- **新增页面切换动画配置功能**: 支持四种动画效果
  - 渐显
  - 顶部往下
  - 从右往左
  - 从左往右
- **新增主题配置面板中的页面动画选择器**: 用户可在配置面板中选择喜欢的动画效果

#### 修复

- **修复主题配置中页面切换效果不生效的问题**: 解决动画配置无法保存和应用的 bug
- **修复 layui select 组件在主题配置面板中无法保存配置的问题**: 正确引入 form 模块并使用 form.on 监听事件
- **修复页面加载动画类名冲突问题**: 使用更具体的类名避免与 layui 框架冲突
- **修复部分已知问题**: 提升系统稳定性

#### 删除

- **删除冗余的加载文字提示**: 简化加载效果，提升视觉简洁度
- **删除部分冗余代码**: 提升代码质量，减少维护成本

### v1.4.0 (2026-04-09)

#### 新增功能

##### LayDrawer 抽屉组件重构
- 重构抽屉组件，基于 `layer.open` 封装，参数与 `layer.open` 完全兼容
- 新增 `container` 配置，支持挂载到任意容器（不再局限于 body）
- 新增 `placement` 配置，支持四个方向：`right`、`left`、`top`、`bottom`
- 新增快捷方法：`drawerMod.right()`、`drawerMod.left()`、`drawerMod.top()`、`drawerMod.bottom()`
- 支持最小化、最大化、还原功能
- 支持拖拽移动（限制在容器范围内）
- 支持窗口 resize 时自动调整位置
- 支持路由切换时自动关闭所有抽屉

##### 退出登录功能
- 新增 `handleLogout` 方法，支持配置化退出登录
- 支持自定义退出登录 URL、请求方法、缓存策略
- 集成 `toastMod` 提示组件，优化用户反馈体验
- 支持退出成功后自定义跳转地址

##### 新增文件
- `admin/js/layui-init.js` - LayUI 独立页面初始化脚本，用于 iframe 弹窗、新窗口等场景
- `admin/css/layui-override/layer.css` - LayUI layer 组件覆盖样式
- `view/components/form-open-test.html` - 表单组件测试页面
- `view/data/logout.json` - 退出登录模拟数据

#### 功能优化

##### 表单样式优化
- 优化搜索表单布局，调整标签宽度为 85px
- 新增日期范围选择器样式 `.date-range`
- 优化表单间距和布局一致性

##### 代码优化
- 删除冗余文件 `laydrawer.js`，统一使用 `drawer.js`
- 删除冗余示例页面 `drawer-demo.html`、`drawer-demo1.html`
- 优化 `laydrawer-demo.html` 示例代码
- 净减少约 1100 行代码，提升代码可维护性

#### 配置更新

##### app.json 新增配置项
```json
{
  "logout": {
    "enabled": true,
    "url": "view/data/logout.json",
    "method": "POST",
    "cache": false
  }
}
```

#### 技术细节

##### LayDrawer 与 layer.open 的 fixed 差异
- LayDrawer 在非 body 容器场景下强制使用 `position: fixed` 定位
- 确保抽屉始终贴合容器边界，不会随容器滚动而移动
- 移除 `defaults` 中的 `fixed: false` 配置项，避免误导

#### 文件变更统计
- 修改文件：17 个
- 新增代码：+1,535 行
- 删除代码：-2,631 行
- 净减少：1,096 行

### v1.3.0 (2026-04-04)

#### 新增功能

- ✅ **融合 LayUI 组件智能渲染模块**: 新增 `componentRenderer` 模块，自动检测并渲染 SPA 中的 LayUI 组件
  - 支持 11 种 LayUI 组件的自动渲染（tabs、form、element、carousel、rate、slider、transfer、tree、colorpicker、laypage、code）
  - 智能扫描 DOM，按需加载模块，减少 80% 不必要的模块加载
  - 支持组件渲染优先级控制和调试模式
  - 智能缓存机制，避免重复渲染

- ✅ **水印版块优化改进**: 大幅改进水印功能
  - **防删除保护**: 使用 MutationObserver 监听水印节点，自动恢复被删除或修改的水印
  - **Canvas 缓存机制**: 使用缓存提升水印生成性能，支持精确文本测量
  - **动态文本支持**: 支持从 sessionStorage 读取动态文本作为水印内容
  - **嵌套键名**: 支持使用点号分隔的嵌套路径，如 `userInfo.admin.userName`
  - **主题自动适配**: 水印颜色根据亮色/暗色主题自动调整

- ✅ **新增 LayUI 组件示例页面**: 新增 18 个组件示例页面
  - tabs、carousel、rate、slider、transfer、tree
  - colorpicker、laypage、progress、util、flow
  - code、laytpl、nav、breadcrumb、collapse
  - treeTable、upload

#### 功能优化

- ✅ **第三方资源更新**: 
  - ECharts 更新至 v6.0.0
  - LayUI 更新至 v2.13.5
- ✅ **样式兼容性**: 修复部分样式兼容问题
- ✅ **配置命名优化**: 将 `usernameKey` 重命名为更通用的 `dynamicTextKey`

#### 问题修复

- ✅ **修复移动端菜单 Bug**: 修复移动端侧边栏菜单报错问题（`toggleSubmenu` 缺少 `state` 参数）
- ✅ 修复 SPA 模式下 LayUI 组件不自动渲染的问题
- ✅ 修复 .gitignore 阻止 lib 目录下 min.js 文件推送的问题

### v1.1.0 (2026-04-02)

#### 新增功能

- ✅ **资源按需加载**: 页面级 CSS/JS 按需加载，支持动态注入
- ✅ **动态 Meta 信息**: 支持页面级 title、keywords、description 动态更新
- ✅ **外部依赖管理**: 支持定义可复用的外部依赖模块
- ✅ **多优先级配置**: 支持 HTML、JSON、菜单三种 meta 配置方式

#### 功能优化

- ✅ **菜单栏逻辑优化**: 完善多级菜单展开/折叠逻辑
- ✅ **下拉菜单布局**: 优化下拉菜单布局下的菜单展开状态恢复
- ✅ **代码整洁**: 将内联脚本外移，提高代码可维护性

#### 问题修复

- ✅ 修复刷新页面后菜单展开状态丢失的问题
- ✅ 修复 nested-dropdown-item-wrapper 展开状态不正确的问题
- ✅ 修复部分布局模式下菜单激活状态显示异常

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

***

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

***

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

***

## 📞 联系方式

- 项目主页: \[GitHub Repository URL]
- 问题反馈: \[GitHub Issues URL]
- 文档地址: \[Documentation URL]

***

## 🙏 致谢

感谢以下开源项目:

- [LayUI](https://layui.com/) - 经典模块化前端框架
- [jQuery](https://jquery.com/) - JavaScript 库
- [ECharts](https://echarts.apache.org/) - 数据可视化图表库
- [XM-Select](https://gitee.com/maplemei/xm-select) - 多选解决方案

***

**最后更新时间**: 2026-04-12\
**文档版本**: 1.6.0
