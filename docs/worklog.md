# 工作日志 (Worklog)

记录每次版本迭代的开发工作过程。

---

## v1.9.8 (2026-08-05)

### 工作内容

#### 1. 移动端搜索栏输入框弹性占满修复
- **用户反馈**：移动端输入框宽度不一样，期望全部占满对齐
- **复现**：Edge 无头 CDP 展开全部字段实测——UID/等级/余额 206px，用户名/昵称/邮箱/登录IP 171px，登录时间 102px×2，宽度参差不齐
- **根因排查**：桌面端 `.layui-input-block` 为 `display: inline-block; width: 270px` 固定宽度。移动端媒体查询只覆盖 `width: auto` 未覆盖 `display`，inline-block + `width: auto` 按 shrink-to-fit 收缩到内容宽度，受 layui affix 图标（number 类型 input 有后缀图标）等影响，各字段宽度不一
- **修复**（resetForm.css 移动端）：
  - input-block 改 `display: block; margin-left: 90px`（= label 宽度），弹性占满剩余宽度，实测统一 225px、右缘与字段右缘精确对齐
  - 选择器加 `:not(.form-actions)` 排除按钮区（按钮区保持 inline-block 靠右，实测 right 与 form 右缘对齐不受影响）
  - date-range 由固定 102px 改 `width: 100%; flex: 1` 弹性平分（实测双框各 98px），与综合表单主表单移动端一致
  - select/textarea 同步 `width: 100%`
- **验证**：移动端 375px 8 字段全部 225px 占满、按钮区右对齐正常；桌面端 1280px 保持固定 270px 不变 ✓

#### 2. 版本同步
- 版本号 1.9.7 → 1.9.8，同步至 config/app.json、admin/js/index.js、view/data/dashboard.json、docs/README.md
- dashboard.json 更新公告与时间线新增 v1.9.8 记录
- CHANGELOG.md 与 worklog.md 新增 v1.9.8 条目

### 修改文件清单
- admin/css/extends/resetForm.css
- config/app.json
- admin/js/index.js
- view/data/dashboard.json
- docs/README.md
- docs/CHANGELOG.md
- docs/worklog.md

---

## v1.9.7 (2026-08-05)

### 工作内容

#### 1. 搜索栏 label 宽度规范化
- **问题**：搜索栏 label 桌面 85px / 移动端 80px，移动端四字 label（"登录时间""用户名"等 ≈86px）被截断成省略号；桌面端 label 未做省略号样式，超长直接溢出
- 参考综合表单基本信息字段设计，确认搜索栏整体布局无需改动，仅需统一 label 宽度
- 桌面端 label 85px → 90px，移动端 80px → 90px；字段 370px 不变（90 + 270 + 10 精确填满）
- 桌面端 `.layui-form-label` 补 `overflow: hidden; text-overflow: ellipsis`，与移动端行为一致
- 移动端 `.layui-input` 由 `max-width: 234px` 改为 `width: 100%` 弹性填充，label 加宽后输入框自动适配剩余宽度，避免溢出；date-range（102px）与 inline-block（110px）特异性更高不受影响
- **验证**：Edge 无头 CDP 实测——桌面 1280px：label 90px + input 270px + ellipsis ✓；移动端 375px：label 90px（x:27-117）+ input 206px 弹性、无溢出、ellipsis 生效 ✓

#### 2. 抽屉最小化移动端丢失修复
- **复现**：Edge 无头 CDP 在 SPA 环境（`/#/view/components/form-comprehensive`）移动端 375×667 视口实测：单抽屉最小化正常（right:10px 可见），打开第二个抽屉最小化后 left:-85px 完全出屏"丢失"
- **根因**：`updateMinimizedStackPosition` 对所有端统一横向堆叠（`rightOffset = 10 + index × 230px`），窄屏下条带右偏移 + 220px 条带宽超过视口宽度，越靠左的条带越出屏
- **修复**：增加 `isMobile`（`window.innerWidth <= 768`）分支——移动端改右下角纵向堆叠（`bottom = 10 + index × 50px` 向上排列），条带始终在屏内；桌面端横向堆叠不变
- **验证**：移动端 375×667 两个抽屉最小化后第 1 个 bottom:10px（y:617）、第 2 个 bottom:60px（y:567）纵向排列均可见；桌面端 1280×800 第 1 个 right:10px（x:1050）、第 2 个 right:240px（x:820）横向堆叠不受影响 ✓

#### 3. 版本同步
- 版本号 1.9.6 → 1.9.7，同步至 config/app.json、admin/js/index.js、view/data/dashboard.json、docs/README.md
- dashboard.json 更新公告与时间线新增 v1.9.7 记录
- CHANGELOG.md 与 worklog.md 新增 v1.9.7 条目

### 修改文件清单
- admin/css/extends/resetForm.css
- modules/extends/drawer.js
- config/app.json
- admin/js/index.js
- view/data/dashboard.json
- docs/README.md
- docs/CHANGELOG.md
- docs/worklog.md

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

#### 4. 搜索栏左右分栏优化
- **问题**：CRUD 搜索栏按钮与字段同为 inline-block 流动排列，按钮无法真正固定右侧；展开/收起按钮混入两栏布局；JS 把 .form-actions 当字段处理导致按钮被展开/收起控制；展开/收起字眼逻辑反了；点击展开/收起无效果；label 与 input 垂直堆叠导致字段行距过大
- **CSS 重构**：采用 absolute 定位方案
  - `padding-right` 由 JS 动态测量按钮区域宽度精确预留
  - 字段项 `flex: 0 0 370px` 在内容区内自动流动排列，保留 layui 默认垂直间距
  - 按钮区域 `.form-actions` 用 `position: absolute; top: 0; right: 0` 真正固定右上角，展开/收起时位置不变
  - 展开/收起按钮 `.toggle-btn` 用 `flex: 0 0 100%` 强制独立一行，`text-align: center` 居中
  - `.layui-form-label` 加 `box-sizing: border-box` 修复 label/input 堆叠（字段高恢复 38px）
- **JS 修复**：
  - `items` 用 `.not('.form-actions')` 排除按钮区域
  - `countPerRow` 用 `Math.floor((formWidth + marginRight) / itemWidth)` 修正边界
  - 点击事件绑定 `toggle(true)` 仅用户点击时翻转 `toggle.hide`，初始化与 resize 只重算不翻转，解决点击无效果与初始化即展开问题
  - 显式初始化 `toggle.hide = true`（初始为收起状态）
  - 修复字眼反转：收起状态显示"展开"，展开状态显示"收起"
  - 字段数不超过一行时隐藏展开/收起按钮
  - 新增 window resize 监听，窗口变化时重新计算
- **浏览器验证**：Edge 无头实测 1280px 视口收起态 2 字段，点击展开后 8 字段全显示每行 2 个，行距 53px（38+15），按钮位置展开前后一致，初始显示"展开"
- **移动端适配**：`@media (max-width:768px)` form 取消 padding-right，字段每行一个
  - JS 增加 `isMobile` 判断，移动端不动态设置 padding-right（修复覆盖 CSS 导致字段区被压缩）
  - `.toggle-btn` 移除 padding-top/margin-top，展开/收起按钮紧贴上方
  - **按钮右对齐**：`.form-actions` 补 `text-align: right`（修复 block 靠左问题），`input-block` 加 `font-size: 0` 使按钮间距精确 10px（消除 inline 空白），按钮恢复 14px 字体；间距规则提升为通用
  - Edge 无头 375px 视口实测：按钮块右边缘 360 = form 右边缘，间距精确 10px，字体正常

#### 5. 版本同步
- 版本号 1.9.5 → 1.9.6，同步至 config/app.json、admin/js/index.js、view/data/dashboard.json、docs/README.md
- dashboard.json 更新公告与时间线新增 v1.9.6 记录
- CHANGELOG.md 与 worklog.md 新增 v1.9.6 条目

### 修改文件清单
- modules/components/tabs.js
- admin/css/admin.css
- 404.html（新增）
- modules/app.js
- admin/css/extends/resetForm.css
- admin/js/extends/searchForm.js
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
