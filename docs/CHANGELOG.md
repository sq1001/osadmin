# 更新日志 (Changelog)

所有重要的项目变更都将记录在此文件中。

---

## v1.7.1 (2026-05-11)

### 🆕 新增功能

#### 分层缓存系统
- ✅ **新增 configCache TTL 过期机制**
  - 配置数据缓存 5 分钟自动过期
  - 保证配置数据新鲜度
  - 支持手动清理缓存

- ✅ **新增 pageCache LRU 策略**
  - 页面缓存最多保留 20 个页面
  - 自动淘汰最久未使用的页面
  - 支持手动清理缓存

#### 组件样式覆盖系统
- ✅ **新增 21 个 LayUI 组件样式覆盖文件**
  - `auxiliary.css` - 辅助元素样式
  - `badge.css` - 徽章样式
  - `carousel.css` - 轮播样式
  - `code.css` - 代码块样式
  - `colorpicker.css` - 颜色选择器样式
  - `flow.css` - 流加载样式
  - `laydate.css` - 日期选择器样式
  - `layout.css` - 布局样式
  - `laypage.css` - 分页样式
  - `menu.css` - 菜单样式
  - `progress.css` - 进度条样式
  - `rate.css` - 评分样式
  - `slider.css` - 滑块样式
  - `tabs.css` - 标签页样式
  - `text.css` - 文本样式
  - `timeline.css` - 时间线样式
  - `transfer.css` - 穿梭框样式
  - `tree.css` - 树形样式
  - `upload.css` - 上传样式
  - `util.css` - 工具样式
  - `xm-select.css` - 多选下拉样式

#### 新增示例页面
- ✅ **新增 5 个组件示例页面**
  - `anim-demo.html` - 动画示例
  - `badge-demo.html` - 徽章示例
  - `icon-demo.html` - 图标示例
  - `timeline-demo.html` - 时间线示例
  - `theme-preview.html` - 主题预览

### 🔧 功能优化

#### 组件渲染器优化
- ✅ **移除 scanCache 缓存逻辑**
  - SPA 模式下 DOM 每次切换都变化，缓存扫描结果无意义
  - 每次页面切换都重新扫描组件，确保正确渲染

- ✅ **移除 transfer、tree、laypage 组件自动渲染**
  - 这些组件需要特殊配置，不适合自动渲染
  - 由页面脚本手动初始化

#### CSS 变量规范化
- ✅ **修复未定义的 CSS 变量**
  - 删除所有 `var(--shadow)` 使用，改用 Layui 官方阴影样式
  - 修复 `var(--sidebar-bg)` 为 `var(--bg-sidebar)`

### 🐛 问题修复

#### HTML 可访问性修复
- ✅ **修复 19 个页面缺少 viewport meta 标签**
- ✅ **修复 19 个页面缺少 lang 属性**
- ✅ **修复 4 个页面 img 元素缺少 alt 属性**
- ✅ **修复 index.html viewport 可访问性问题**
  - 移除 `maximum-scale=1.0` 和 `user-scalable=no`
  - 允许用户缩放页面，符合 WCAG 标准

#### 代码风格修复
- ✅ **修复 10 个文件的逗号前置问题**
  - `tree-demo.html`
  - `laypage-demo.html`
  - `transfer-demo.html`
  - `flow-demo.html`
  - `colorpicker-demo.html`
  - `carousel-demo.html`
  - `treeTable-demo.html`
  - `rate-demo.html`
  - `slider-demo.html`
  - `upload-demo.html`

### 📁 文件变更

#### 新增文件 (26 个)
```
admin/css/layui-override/
├── auxiliary.css      # 辅助元素样式
├── badge.css          # 徽章样式
├── carousel.css       # 轮播样式
├── code.css           # 代码块样式
├── colorpicker.css    # 颜色选择器样式
├── flow.css           # 流加载样式
├── laydate.css        # 日期选择器样式
├── layout.css         # 布局样式
├── laypage.css        # 分页样式
├── menu.css           # 菜单样式
├── progress.css       # 进度条样式
├── rate.css           # 评分样式
├── slider.css         # 滑块样式
├── tabs.css           # 标签页样式
├── text.css           # 文本样式
├── timeline.css       # 时间线样式
├── transfer.css       # 穿梭框样式
├── tree.css           # 树形样式
├── upload.css         # 上传样式
├── util.css           # 工具样式
└── xm-select.css      # 多选下拉样式

view/components/
├── anim-demo.html     # 动画示例
├── badge-demo.html    # 徽章示例
├── icon-demo.html     # 图标示例
└── timeline-demo.html # 时间线示例

view/
└── theme-preview.html # 主题预览
```

#### 修改文件 (67 个)
- `modules/app.js` - 新增分层缓存系统
- `modules/common/component-renderer.js` - 移除 scanCache，优化渲染逻辑
- `admin/js/index.js` - 版本号更新
- `admin/css/admin.css` - CSS 变量定义完善
- `index.html` - viewport 可访问性修复
- `config/app.json` - 版本号更新
- `view/components/*.html` - 45 个页面的可访问性和代码风格修复

### 💻 技术细节

#### 缓存 API
```javascript
// configCache - TTL 过期机制
App.configCache.get(key);       // 获取缓存（自动检查过期）
App.configCache.set(key, value); // 设置缓存
App.configCache.clear(key);     // 清理缓存

// pageCache - LRU 策略
App.pageCache.get(key);         // 获取缓存（更新访问顺序）
App.pageCache.set(key, value);  // 设置缓存（超出限制自动淘汰）
App.pageCache.clear(key);       // 清理缓存
App.pageCache.size();           // 获取缓存数量
```

#### CSS 变量规范
```css
/* 已定义的变量 */
:root {
  --bg-sidebar: #151c28;       /* 侧边栏背景 */
  --bg-sidebar-hover: #1e2939; /* 侧边栏悬停 */
  --card-bg: #ffffff;          /* 卡片背景 */
  --border: #eee;              /* 边框颜色 */
  /* ... 其他变量 */
}
```

---

## v1.6.0 (2026-04-12)

### 新增功能

#### 固定双列布局
- ✅ **新增固定双列布局模式 (fixed-double)**
  - 主侧边栏固定宽度 80px，不可收缩
  - 子菜单面板固定宽度 180px，始终显示
  - 菜单项采用图标在上、文字在下的垂直排列方式
  - Logo 区域同样采用图标在上、文字在下的布局
  - 移动端自动适配为全屏抽屉模式，与弹性双列布局一致

#### 水印模块
- ✅ **新增水印模块示例页面**
  - 水印配置示例
  - 动态文本示例
  - 防删除保护演示

#### 图标模块
- ✅ **新增图标模块示例页面**
  - LayUI 图标展示
  - 图标使用示例

### 功能优化

#### 布局样式优化
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

#### 水印逻辑优化
- ✅ **优化框架水印逻辑**
  - 改进水印生成性能
  - 优化防删除保护机制
  - 增强主题适配能力

#### 综合表单示例完善
- ✅ **完善综合表单示例页面**
  - 新增按钮弹窗示例（三种弹窗类型）
  - 新增多图片上传功能
  - 新增表单初始化赋值示例
  - 示例数据通过 AJAX 请求加载
  - 采用遍历字段方式赋值

### 文件变更

#### 新增文件
- `view/data/form-open-test-set.json` - 表单示例数据
- `view/components/watermark-demo.html` - 水印示例页面
- `view/components/icon-demo.html` - 图标示例页面

#### 修改文件
- `admin/css/admin.css` - 新增固定双列布局样式、优化菜单项样式
- `admin/css/theme.css` - 新增布局选项图标样式
- `modules/components/sidebar.js` - 支持固定双列布局
- `modules/common/theme.js` - 布局切换逻辑优化
- `modules/app.js` - 初始化逻辑优化
- `index.html` - 新增布局选项
- `config/app.json` - 版本更新

### 技术细节

#### 固定双列布局 CSS 变量
```css
:root {
  --sidebar-fixed-width: 80px;
  --submenu-fixed-width: 180px;
}
```

#### 布局切换 API
```javascript
var theme = OSLAY.modules.theme;
theme.setState({ layout: 'fixed-double' });
```

---

## v1.5.1 (2026-04-10)

### 新增功能

#### TinyMCE 富文本编辑器模块
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

### 功能优化

#### TinyMCE 模块功能完善
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

### 文件变更

#### 新增文件
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

#### 修改文件
- `config/menu.json` - 添加富文本编辑器菜单项

### 技术细节

#### TinyMCE 配置特性
- **插件支持**: advlist, autolink, lists, link, image, charmap, preview, anchor, searchreplace, visualblocks, code, fullscreen, insertdatetime, media, table, help, wordcount, quickbars
- **快速工具栏**: 选中文本时显示格式化工具，新行时显示快速插入按钮
- **图片上传**: 支持拖拽上传和文件选择器上传
- **主题支持**: 完整支持亮色/暗色主题自动切换
- **GPL 许可**: 使用 `license_key: 'gpl'` 开源许可证

### 菜单更新

新增"组件示例"菜单项：
- 富文本编辑器（ID: 110, Code: view/components/tinymce-demo）

---

## v1.5.0 (2026-04-10)

### 重构

- **重构框架布局**: 优化整体架构设计，提升代码可维护性
- **重构页面切换动画系统**: 提升用户体验，支持多种动画效果
- **重构主题配置面板**: 增强配置灵活性，优化交互体验

### 优化

- **优化页面加载效果**: 采用简洁的纯图标样式，移除冗余文字提示
- **优化主题配置系统**: 修复 layui select 组件事件监听问题，确保配置正常保存
- **优化页面切换动画应用逻辑**: 确保所有页面类型都能正常显示动画效果
- **优化细节样式**: 提升视觉体验，增强界面美观度
- **优化 CSS 类名规范**: 避免样式冲突，将 `.layui-loading` 改为 `.page-loading`

### 新增

- **新增页面切换动画配置功能**: 支持四种动画效果
  - 渐显
  - 顶部往下
  - 从右往左
  - 从左往右
- **新增主题配置面板中的页面动画选择器**: 用户可在配置面板中选择喜欢的动画效果

### 修复

- **修复主题配置中页面切换效果不生效的问题**: 解决动画配置无法保存和应用的 bug
- **修复 layui select 组件在主题配置面板中无法保存配置的问题**: 正确引入 form 模块并使用 form.on 监听事件
- **修复页面加载动画类名冲突问题**: 使用更具体的类名避免与 layui 框架冲突
- **修复部分已知问题**: 提升系统稳定性

### 删除

- **删除冗余的加载文字提示**: 简化加载效果，提升视觉简洁度
- **删除部分冗余代码**: 提升代码质量，减少维护成本

---

## v1.4.0 (2026-04-09)

### 新增功能

#### LayDrawer 抽屉组件重构
- 重构抽屉组件，基于 `layer.open` 封装，参数与 `layer.open` 完全兼容
- 新增 `container` 配置，支持挂载到任意容器（不再局限于 body）
- 新增 `placement` 配置，支持四个方向：`right`、`left`、`top`、`bottom`
- 新增快捷方法：`drawerMod.right()`、`drawerMod.left()`、`drawerMod.top()`、`drawerMod.bottom()`
- 支持最小化、最大化、还原功能
- 支持拖拽移动（限制在容器范围内）
- 支持窗口 resize 时自动调整位置
- 支持路由切换时自动关闭所有抽屉

#### 退出登录功能
- 新增 `handleLogout` 方法，支持配置化退出登录
- 支持自定义退出登录 URL、请求方法、缓存策略
- 集成 `toastMod` 提示组件，优化用户反馈体验
- 支持退出成功后自定义跳转地址

#### 新增文件
- `admin/js/layui-init.js` - LayUI 独立页面初始化脚本，用于 iframe 弹窗、新窗口等场景
- `admin/css/layui-override/layer.css` - LayUI layer 组件覆盖样式
- `view/components/form-open-test.html` - 表单组件测试页面
- `view/data/logout.json` - 退出登录模拟数据

### 功能优化

#### 表单样式优化
- 优化搜索表单布局，调整标签宽度为 85px
- 新增日期范围选择器样式 `.date-range`
- 优化表单间距和布局一致性

#### 代码优化
- 删除冗余文件 `laydrawer.js`，统一使用 `drawer.js`
- 删除冗余示例页面 `drawer-demo.html`、`drawer-demo1.html`
- 优化 `laydrawer-demo.html` 示例代码
- 净减少约 1100 行代码，提升代码可维护性

### 配置更新

#### app.json 新增配置项
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

### 技术细节

#### LayDrawer 与 layer.open 的 fixed 差异
- LayDrawer 在非 body 容器场景下强制使用 `position: fixed` 定位
- 确保抽屉始终贴合容器边界，不会随容器滚动而移动
- 移除 `defaults` 中的 `fixed: false` 配置项，避免误导

### 文件变更统计
- 修改文件：17 个
- 新增代码：+1,535 行
- 删除代码：-2,631 行
- 净减少：1,096 行

---

## v1.3.0 (2026-04-04)

### 新增功能

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

### 功能优化

- ✅ **第三方资源更新**: 
  - ECharts 更新至 v6.0.0
  - LayUI 更新至 v2.13.5
- ✅ **样式兼容性**: 修复部分样式兼容问题
- ✅ **配置命名优化**: 将 `usernameKey` 重命名为更通用的 `dynamicTextKey`

### 问题修复

- ✅ **修复移动端菜单 Bug**: 修复移动端侧边栏菜单报错问题（`toggleSubmenu` 缺少 `state` 参数）
- ✅ 修复 SPA 模式下 LayUI 组件不自动渲染的问题
- ✅ 修复 .gitignore 阻止 lib 目录下 min.js 文件推送的问题

---

## v1.1.0 (2026-04-02)

### 新增功能

- ✅ **资源按需加载**: 页面级 CSS/JS 按需加载，支持动态注入
- ✅ **动态 Meta 信息**: 支持页面级 title、keywords、description 动态更新
- ✅ **外部依赖管理**: 支持定义可复用的外部依赖模块
- ✅ **多优先级配置**: 支持 HTML、JSON、菜单三种 meta 配置方式

### 功能优化

- ✅ **菜单栏逻辑优化**: 完善多级菜单展开/折叠逻辑
- ✅ **下拉菜单布局**: 优化下拉菜单布局下的菜单展开状态恢复
- ✅ **代码整洁**: 将内联脚本外移，提高代码可维护性

### 问题修复

- ✅ 修复刷新页面后菜单展开状态丢失的问题
- ✅ 修复 nested-dropdown-item-wrapper 展开状态不正确的问题
- ✅ 修复部分布局模式下菜单激活状态显示异常

---

## v1.0.0 (2026-03-31)

### 新增功能

- ✅ 模块化架构设计
- ✅ 配置驱动系统
- ✅ 权限管理模块
- ✅ 主题切换系统
- ✅ Hash 路由系统
- ✅ 标签页管理
- ✅ 多种组件封装

### 核心模块

- ✅ 主应用模块 (app.js)
- ✅ 路由模块 (router.js)
- ✅ 主题模块 (theme.js)
- ✅ 权限模块 (permission.js)
- ✅ 侧边栏组件 (sidebar.js)
- ✅ 标签页组件 (tabs.js)

### 扩展模块

- ✅ ECharts 图表扩展
- ✅ XM-Select 下拉选择
- ✅ Toast 提示框
- ✅ Drawer 抽屉组件

---

**最后更新时间**: 2026-05-11
