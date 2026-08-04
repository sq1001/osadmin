# 工作日志 (Worklog)

记录每次版本迭代的开发工作过程。

---

## v1.9.6 (2026-08-04)

### 工作内容

#### 1. 标签栏拖拽插入指示线优化
- 分析原 `dragover` 逻辑：仅给目标标签加 `tab-drag-over` 类，CSS 中 `::before` 和 `::after` 伪元素同时点亮左右两侧 3px 指示线，用户无法判断插入方向
- 重写 `tabs.js` 的 dragover/dragleave/drop 事件：用 `e.clientX` 与 `getBoundingClientRect()` 中点比较，判定左半/右半区，分别加 `tab-drag-over-left` / `tab-drag-over-right` 类
- 重构 `admin.css` 拖拽样式：拆分 `.tab-drag-over` 为两个独立类，左右单侧边框常驻变色（`box-shadow: -2px 0 0` / `2px 0 0`）+ 单侧伪元素指示线
- 修正 drop 索引：左半→目标索引，右半→目标索引+1，splice 移除源后按 `sourceIndex < targetInsertPosition` 修正插入索引 -1
- 增加边界无操作判定：拖回自身位置或相邻标签贴近侧直接 return

#### 2. Cloudflare Pages 部署不存在路径卡死骨架屏修复
- **根因**：系统应用层有 404 处理（app.js ajax `.fail` 回调显示"该页面正在开发中"），但 CF Pages 根目录无 `404.html` 时自动 SPA fallback，将不存在文件请求返回 `index.html`（200）。ajax 走 `.done` 回调，`extractContent` 提取 index.html body（含骨架屏 div 与内联脚本），`showContent` 通过 jQuery `.html()` 执行内联脚本触发 SPA 重新初始化，形成无限循环
- **开发环境正常的原因**：`python http.server` 对不存在文件返回 404 状态码，ajax 正常走 `.fail` 回调
- **修复**：根目录新增 `404.html`，CF Pages 检测到后不再自动 SPA fallback，不存在文件返回 404 状态码，ajax `.fail` 回调正常触发

#### 3. 路由 404 逻辑修复
- **问题**：hash 路径对应的菜单不存在时（如 `/#/nonexistent`），`handleRouteChange` 的 `pageId` 静默 fallback 到 `selectId`（默认页），URL 显示错误路径但内容区加载默认页
- **修复**：`handleRouteChange` 入口增加菜单存在性判断，`routeInfo.id` 为 null/undefined 时调用新增的 `showNotFoundPage` 方法显示 404 提示页，不再静默 fallback

#### 4. 版本同步
- 版本号 1.9.5 → 1.9.6，同步至 config/app.json、admin/js/index.js、view/data/dashboard.json、docs/README.md
- dashboard.json 更新公告与时间线新增 v1.9.6 记录
- CHANGELOG.md 与 worklog.md 新增 v1.9.6 条目

### 修改文件清单
- modules/components/tabs.js
- admin/css/admin.css
- 404.html（新增）
- modules/app.js
- admin/js/service-worker.js
- config/app.json
- admin/js/index.js
- view/data/dashboard.json
- docs/README.md
- docs/CHANGELOG.md
- docs/worklog.md

---

## v1.9.5 (2026-08-01)

### 工作内容

#### 1. 布局系统优化
- 顶部栏布局（topbar）新增溢出滚动支持，与混合布局统一方案
- 修复混合布局子面板宽度未跟随主题配置生效的问题
- `.layui-topbar-right` 左边距规范化为 `var(--space-sm)`（8px）
- 彻底清理顶栏三点菜单死代码（HTML/CSS/JS）

#### 2. 层级与显示修复
- 移除标签栏和面包屑栏的 z-index，避免覆盖顶栏用户下拉菜单
- 调整面包屑导航功能开关位置至"标签页记忆"之后
- 修复刷新后面包屑只显示"主页"的问题

#### 3. 抽屉组件完善
- 修复容器内抽屉不从容器边缘滑出的问题
- 实现最小化堆叠和拖动功能
- 优化最小化恢复（仅按钮/ESC 触发）
- 修复最小化关闭卡顿（直接销毁，跳过反向滑出）
- 修复最小化关闭后其他抽屉不重排的 bug
- 修复最小化遮罩阻挡页面操作
- 修复最小化层级高于主题配置面板
- 主容器嵌套结构隔离滚动

#### 4. 主题切换优化
- 圆形扩散动画 400ms → 600ms
- 缓动曲线改为 Material Design 标准 cubic-bezier(0.4, 0, 0.2, 1)

#### 5. 标签栏拖拽排序
- tabs.js 新增 dragstart/dragend/dragover/drop 事件处理
- 支持标签页拖拽排序并自动持久化状态

#### 6. 顶栏暗色模式与图标补全
- theme.css 补充顶栏菜单下拉、混合布局子面板的暗色模式样式
- 补充顶栏布局/混合布局在主题选择面板中的图标样式

#### 7. 全框架规范化复查
- drawer.js：常量命名规范化、删除未使用变量、修复错误注释
- sidebar.js：清理 emoji 注释、统一单引号、简化三元嵌套、缩进统一
- app.js：清理调试日志和注释代码残留
- view/permission-demo.html：修正 `modules.permission` → `modules.permissionModule`
- 修复复查中发现的 2 个严重 bug（isVertical 引用错误、destroy 参数丢失）

#### 8. 配置与文档同步
- config/rolesTheme.json：补充 changeFontSize/changeBorderRadius/toggleBreadcrumb 权限配置
- admin/css/index.css：导入新抽屉样式 extends/drawer.css

### 修改文件清单
- modules/extends/drawer.js
- modules/components/sidebar.js
- modules/components/tabs.js
- modules/common/theme.js
- modules/app.js
- admin/css/admin.css
- admin/css/theme.css
- admin/css/index.css
- admin/css/extends/drawer.css
- index.html
- config/app.json（版本号）
- config/rolesTheme.json（权限补全）
- admin/js/index.js（版本号）
- view/data/dashboard.json（版本号）
- view/permission-demo.html（API 引用修正）
- docs/README.md（版本号）
- docs/CHANGELOG.md（更新日志）
- docs/testData.md（新增测试数据）
- .gitignore（新增 scripts/ 忽略）

### 验证
- 全框架 12 个 JS 文件 `node -c` 语法检查通过
- 无功能破坏，所有修改仅涉及规范化与 bug 修复

---

## v1.9.4 (2026-06-20)

### 工作内容
- Toast 模块重构
- 认证页面 Toast 统一
- 表单验证统一
- 风格3 天蓝科技模板新增
- URL 拼接优化
- 登录页架构方案C实施
- 模板页面新增与重构
- 仪表盘重构
- 样式统一
