/**
 * OS Admin - 统一入口脚本
 * 自动检测环境，适配主页面和独立页面
 * 
 * 使用场景：
 * 1. 主页面：完整初始化（加载配置、创建 OSLAY、初始化应用）
 * 2. iframe/新窗口：仅配置 LayUI（不初始化应用）
 */
(function(window, document) {
  'use strict';

  // 防止重复初始化
  if (window.__OSLAY_INITIALIZED__) {
    return;
  }

  // ========== 基础配置 ==========
  var script = document.currentScript || document.scripts[document.scripts.length - 1];
  var scriptSrc = script.src;
  var scriptPath = scriptSrc.substring(0, scriptSrc.lastIndexOf('/') + 1);

  // 计算 baseUrl
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

  // LayUI 模块配置（主页面和独立页面共用）
  var layuiModules = {
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
    tinymceMod: 'modules/extends/tinymce',
    iconPickerMod: 'modules/extends/iconPicker',
    watermarkMod: 'modules/extends/watermark',
    appMain: 'modules/app'
  };

  // ========== 基础初始化（所有页面都执行） ==========
  if (layui && layui.config) {
    layui.config({
      base: baseUrl,
      version: true
    }).extend(layuiModules);

    window.__OSLAY_BASE_URL__ = baseUrl;
    window.__OSLAY_INITIALIZED__ = true;
  }

  // ========== 检测页面类型 ==========
  // 判断是否为独立页面（iframe、新窗口、弹窗）
  var isStandalonePage = (function() {
    // 1. 在 iframe 中
    if (window.self !== window.top) {
      return true;
    }
    // 2. 有 data-standalone 属性
    if (script.hasAttribute('data-standalone')) {
      return true;
    }
    // 3. URL 参数指定
    if (window.location.search.indexOf('__standalone__=1') !== -1) {
      return true;
    }
    return false;
  })();

  // 独立页面：只配置 LayUI，不初始化应用
  if (isStandalonePage) {
    console.log('[OSLAY] 独立页面模式，baseUrl:', baseUrl);
    return;
  }

  // ========== 主页面完整初始化 ==========
  var readyCallbacks = [];
  var isReady = false;

  var App = {
    version: '1.6.0',
    name: 'OS Admin',
    debug: false,
    baseUrl: baseUrl,
    scriptPath: scriptPath,
    modules: {},
    appConfig: null,
    menuConfig: null,

    init: function() {
      var self = this;
      var $ = layui.$;

      $.ajax({
        url: baseUrl + 'config/app.json',
        dataType: 'json',
        cache: false
      }).done(function(appConfig) {
        self.appConfig = appConfig;
        
        var menuUrl = (appConfig.menu && appConfig.menu.url) ? appConfig.menu.url : 'config/menu.json';
        
        $.ajax({
          url: baseUrl + menuUrl,
          dataType: 'json',
          cache: false
        }).done(function(menuConfig) {
          self.menuConfig = menuConfig;
          self.initApp();
        }).fail(function() {
          console.error('[OSLAY] Failed to load menu config');
          self.menuConfig = [];
          self.initApp();
        });
      }).fail(function() {
        console.error('[OSLAY] Failed to load app config');
        self.appConfig = {};
        self.menuConfig = [];
        self.initApp();
      });
    },

    initApp: function() {
      var self = this;

      layui.use(['appMain', 'permissionModule', 'componentRenderer'], function() {
        var app = layui.appMain;
        var permission = layui.permissionModule;
        var componentRenderer = layui.componentRenderer;
        
        componentRenderer.init();
        
        var permissionConfig = self.appConfig && self.appConfig.permission ? self.appConfig.permission : {};
        
        permission.init(permissionConfig).then(function() {
          app.init();
          self.registerModules();
          isReady = true;
          self.triggerReady();

          if (self.debug) {
            console.log('[' + self.name + '] v' + self.version + ' initialized');
          }
        }).catch(function(err) {
          console.error('[OSLAY] Permission initialization failed:', err);
          app.init();
          self.registerModules();
          isReady = true;
          self.triggerReady();
        });
      });
    },

    registerModules: function() {
      this.modules = {
        router: layui.routerModule,
        theme: layui.themeModule,
        permission: layui.permissionModule,
        resourceLoader: layui.resourceLoader,
        componentRenderer: layui.componentRenderer,
        sidebar: layui.sidebarComp,
        tabs: layui.tabsComp,
        common: layui.commonMod,
        count: layui.countMod,
        echarts: layui.echartsMod,
        xmSelect: layui.xmSelectMod,
        toast: layui.toastMod,
        drawer: layui.drawerMod,
        tinymce: layui.tinymceMod,
        iconPicker: layui.iconPickerMod,
        watermark: layui.watermarkMod,
        app: layui.appMain
      };
    },

    ready: function(callback) {
      if (isReady) {
        callback(this.modules);
      } else {
        readyCallbacks.push(callback);
      }
    },

    triggerReady: function() {
      var self = this;
      readyCallbacks.forEach(function(callback) {
        callback(self.modules);
      });
      readyCallbacks = [];
    },

    use: function(modules, callback) {
      layui.use(modules, callback);
    },

    getModule: function(name) {
      return this.modules[name] || null;
    },

    getConfig: function() {
      return this.appConfig || {};
    },

    getMenuConfig: function() {
      return this.menuConfig || [];
    },

    log: function() {
      if (this.debug) {
        console.log.apply(console, arguments);
      }
    }
  };

  window.OSLAY = App;

  // 启动主页面初始化
  layui.use(['jquery'], function() {
    App.init();
  });

})(window, document);
