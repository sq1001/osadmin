/**
 * LayUI 独立页面初始化脚本
 * 用于 iframe 弹窗、iframe 内嵌、新窗口等独立页面
 * 自动配置 LayUI base 路径和模块扩展
 * 注意：当前文件作为保留文件，逻辑功能已统一到 index.js 中
 */
(function(window, document) {
  'use strict';

  if (window.__OSLAY_INITIALIZED__) {
    return;
  }

  var script = document.currentScript || document.scripts[document.scripts.length - 1];
  var scriptSrc = script.src;
  var scriptPath = scriptSrc.substring(0, scriptSrc.lastIndexOf('/') + 1);

  var baseUrl = (function() {
    if (window.__OSLAY_BASE_URL__ !== undefined) {
      return window.__OSLAY_BASE_URL__;
    }

    var dataBase = script.getAttribute('data-base');
    if (dataBase) {
      return dataBase;
    }

    var pathParts = scriptPath.replace(/\/+$/, '').split('/');
    pathParts = pathParts.slice(0, -2);
    return pathParts.join('/') + '/';
  })();

  if (layui && layui.config) {
    layui.config({
      base: baseUrl,
      version: true
    }).extend({
      routerModule: 'modules/common/router',
      themeModule: 'modules/common/theme',
      permissionModule: 'modules/common/permission',
      resourceLoader: 'modules/common/resource-loader',
      componentRenderer: 'modules/common/component-renderer',
      sidebarComp: 'modules/components/sidebar',
      tabsComp: 'modules/components/tabs',
      commonMod: 'modules/extends/common',
      countMod: 'modules/extends/count',
      echartsMod: 'modules/extends/echarts',
      xmSelectMod: 'modules/extends/xm-select',
      toastMod: 'modules/extends/toast',
      drawerMod: 'modules/extends/drawer',
      appMain: 'modules/app'
    });

    window.__OSLAY_BASE_URL__ = baseUrl;
    window.__OSLAY_INITIALIZED__ = true;
  }

})(window, document);
