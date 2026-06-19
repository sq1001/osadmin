# OSAdmin 更新日志

## v1.9.4 (2026-06-19)

### Toast 模块重构
- **默认无关闭按钮**：`closable` 默认值从 `true` 改为 `false`，与 Element Plus ElMessage / Ant Design message 等主流 UI 库保持一致
- **新增 skin 皮肤配置**：默认不再显示左边框色条，色条作为可选的 `skin` 配置项保留（`skin: 'success'` 等），色条颜色与对应图标颜色统一
- **标题默认为空**：`title` 默认值从 `'提示'` 改为 `''`，无标题时不显示标题行
- **统一 close/dismiss 逻辑**：`close()` 内部调用 `dismiss(id, true)`，删除冗余的 `animateClose()` 方法
- **新增 closeLoading() 方法**：用于手动关闭 loading 类型的 toast
- **新增 animateDismiss() 方法**：统一消散动画处理
- **修复无图标无标题时内容不居中**：添加 `toast-group-plain` 类，垂直居中显示纯内容
- **Toast 示例页更新**：新增自定义皮肤示例、有图标无标题示例、配置表更新

### 认证页面 Toast 统一
- **风格1 (auth/)**：4个页面（login/register/forgot-password/lock-screen）从 `alert()` 全部替换为自定义 toast 提示，样式与框架 toast 模块一致
- **风格2 (auth2/)**：4个页面 toast 样式统一为框架 toast 模块标准（圆角8px、阴影、图标+内容布局、滑入动画），图标改为完整 SVG（含外圈）
- **所有风格页面**：默认无关闭按钮，3秒自动消失

### 表单验证统一
- **风格1 (auth/)**：4个页面新增表单验证变色+小提示效果（输入框边框变红、图标变红、下方红色提示文字）
- **验证方式统一**：所有8个认证页面统一为逐个验证（遇到第一个错误就提示），不再同时标红所有字段
- **移除浏览器原生验证**：移除所有 `required` 属性，避免浏览器原生气泡与自定义验证冲突
- **保留 `type="email"`**：用于移动端键盘优化

### 风格3 - 天蓝科技模板（新增）
- **认证页面**：login / register / forgot-password / lock-screen，天蓝色系（#0ea5e9）清新浅色科技风
- **错误页面**：404 / 403 / 500 / maintenance，配套天蓝科技风格
- **预览页面**：style3-preview.html，8个模板卡片预览
- **菜单配置**：menu.json 已添加风格3菜单项
- **设计特色**：
  - Canvas 浮动光点粒子（无连线，更轻盈）
  - 科技主题 SVG 插画（数据中心/云同步/盾牌锁钥/星空）
  - 表单卡片顶部天蓝渐变装饰条
  - Logo + 标题表单头部
  - 天蓝渐变按钮

### URL 拼接优化
- **移除智能路径处理**：删除 `resolveUrl()` / `getRelativeUrl()` / `baseUrl` 体系，改用浏览器原生相对路径解析
- **理由**：手动 baseUrl 拼接在子目录部署时容易出错，浏览器原生解析在所有部署场景下更可靠
- **影响文件**：index.js、app.js、resource-loader.js、user-profile.html

### 登录页架构
- **方案C实施**：登录页保持独立 HTML，添加框架资源预加载脚本（prefetch）
- **预加载页面**：login.html、lock-screen.html（风格1/风格2/风格3均适用）
- **理由**：兼顾登录页秒开和框架加载速度，安全隔离清晰

### 样式统一
- **输入框边框**：风格1/风格2 输入框边框宽度统一为 1px（原 1.5px）
- **聚焦 ring**：风格1/风格2 聚焦阴影统一为 2px（原风格一 4px、风格二 3px）
- **步骤条配色**：风格2 忘记密码页步骤条成功色与输入框主色统一
- **步骤图标着色**：SVG 改为 `stroke="currentColor"` + CSS `color` 控制
- **验证码边框**：风格2 验证码 canvas 边框改为 1px

---

## v1.9.2

（历史版本）
