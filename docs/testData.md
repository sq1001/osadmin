# 测试数据

## 服务信息
- 项目: OSADMIN 后台管理系统
- 类型: 纯前端静态项目 (LayUI + jQuery + 原生 JavaScript)
- 启动命令: `python -m http.server 8080`
- 访问地址: http://localhost:8080
- 启动目录: d:\MyProject\osadmin

## 测试账号
- 当前版本无后端登录系统，使用本地权限配置文件
- 默认角色: admin (超级管理员)
- 角色切换通过 localStorage: `osadmin_global_role`

## 角色权限配置
- 配置文件: `config/rolesTheme.json`
- 权限文件: `view/data/permission.json`
- 角色类型: admin / employee / vip

## 测试要点
1. 主题配置面板打开/关闭
2. 标签栏拖动排序
3. 顶栏布局菜单显示和溢出处理
4. 混合布局侧边栏固定面板
5. 面包屑导航开关和切换（从一级菜单开始，不含首页）
6. 面包屑左右滚动按钮（对标标签栏）
7. 面包屑点击跳转功能
8. 全局搜索功能
9. 字体大小和圆角大小自定义（显示尺寸section，预设按钮+输入框样式）
10. 暗色模式切换
11. 移动端顶部栏logo区域显示
12. 标签栏右侧下拉菜单：关闭当前/关闭左侧/关闭右侧/关闭其他/关闭全部（关闭左侧/右侧以激活标签为基准，不可关闭标签保留）

## 修复记录 (2026-08-01)
- 移动端顶部栏添加logo区域（桌面端隐藏，移动端显示）
- 面包屑导航去掉"首页"，从一级菜单开始
- 面包屑滚动按钮对标标签栏，添加状态更新逻辑
- 修复面包屑点击跳转功能（事件委托+stopPropagation）
- 字体大小和圆角大小合并为"显示尺寸"section，紧跟"功能开关"后
- 字体圆角样式改为侧栏宽度那种带预设按钮+输入框样式
- 补充rolesTheme.json中changeFontSize/changeBorderRadius/toggleBreadcrumb权限配置
