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

  // ========== 原子锁：防止任何形式的重复执行 ==========
  if (window.__OSLAY_INIT_LOCK__) {
    return;
  }
  window.__OSLAY_INIT_LOCK__ = true;

  // ========== 基础配置 ==========
  var script = document.currentScript || (document.scripts.length > 0 ? document.scripts[document.scripts.length - 1] : null);
  var scriptSrc = script ? script.src : '';
  var scriptPath = scriptSrc ? scriptSrc.substring(0, scriptSrc.lastIndexOf('/') + 1) : '';

  // 计算 baseUrl
  var baseUrl = (function() {
    if (window.__OSLAY_BASE_URL__ !== undefined) {
      return window.__OSLAY_BASE_URL__;
    }

    if (script && script.getAttribute('data-base')) {
      return script.getAttribute('data-base');
    }

    var pathParts = scriptPath.replace(/\/+$/, '').split('/');
    pathParts = pathParts.slice(0, -2);
    return pathParts.join('/') + '/';
  })();

  // ========== LayUI 模块配置 ==========
  // 核心模块（启动必需）
  var coreModules = {
    routerModule: 'modules/common/router',
    themeModule: 'modules/common/theme',
    permissionModule: 'modules/common/permission',
    resourceLoader: 'modules/common/resource-loader',
    componentRenderer: 'modules/common/component-renderer',
    sidebarComp: 'modules/components/sidebar',
    tabsComp: 'modules/components/tabs',
    toastMod: 'modules/extends/toast',
    appMain: 'modules/app'
  };
  
  // 懒加载模块（按需加载）
  var lazyModules = {
    commonMod: 'modules/extends/common',
    countMod: 'modules/extends/count',
    echartsMod: 'modules/extends/echarts',
    xmSelectMod: 'modules/extends/xm-select',
    drawerMod: 'modules/extends/drawer',
    tinymceMod: 'modules/extends/tinymce',
    iconPickerMod: 'modules/extends/iconPicker',
    watermarkMod: 'modules/extends/watermark'
  };
  
  // 合并用于 LayUI 配置
  var allLayuiModules = Object.assign({}, coreModules, lazyModules);

  // ========== 直接初始化（layui.js 已在此脚本之前加载完成）==========
  
  // 基础配置：注册所有 LayUI 扩展模块
  layui.config({
    base: baseUrl,
    version: false
  }).extend(allLayuiModules);

  window.__OSLAY_BASE_URL__ = baseUrl;
  window.__OSLAY_INITIALIZED__ = true;

  // ========== 检测页面类型 ==========
  var isStandalonePage = (function() {
    if (window.self !== window.top) {
      return true;
    }
    if (script && script.hasAttribute('data-standalone')) {
      return true;
    }
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
    version: '1.8.1',
    name: 'OS Admin',
    debug: false,
    baseUrl: baseUrl,
    scriptPath: scriptPath,
    modules: {},
    appConfig: null,
    menuConfig: null,

    useLazy: function(moduleName, callback) {
      var self = this;
      if (self.modules[moduleName]) {
        callback(self.modules[moduleName]);
        return;
      }
      
      layui.use([moduleName], function() {
        var mod = layui[moduleName];
        self.modules[moduleName] = mod;
        callback(mod);
      });
    },

    init: function() {
      var self = this;
      var $ = layui.jquery;

      $.ajax({
        url: baseUrl + 'config/app.json',
        dataType: 'json'
      }).done(function(appConfig) {
        self.appConfig = appConfig;

        var menuCfg = (appConfig && appConfig.menu) || {};

        if (menuCfg.data && Array.isArray(menuCfg.data)) {
          self.menuConfig = menuCfg.data;
          self.initApp();
          return;
        }

        var menuUrl = menuCfg.url || 'config/menu.json';
        var cache = menuCfg.cache !== undefined ? menuCfg.cache : true;

        $.ajax({
          url: baseUrl + menuUrl,
          dataType: 'json',
          cache: cache
        }).done(function(menuConfig) {
          self.menuConfig = menuConfig;
          self.initApp();
        }).fail(function() {
          console.warn('[OSLAY] Failed to load menu from:', menuUrl);
          self.menuConfig = [];
          self.initApp();
        });
      }).fail(function() {
        console.error('[OSLAY] Failed to load config/app.json');
        self.appConfig = {};
        self.menuConfig = [];
        self.initApp();
      });
    },

    initApp: function() {
      var self = this;

      layui.use(Object.keys(coreModules), function() {
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
          
          if (window.OSLAY_HIDE_SKELETON) {
            window.OSLAY_HIDE_SKELETON();
          }

          if (self.debug) {
            console.log('[' + self.name + '] v' + self.version + ' initialized');
          }
        }).catch(function(err) {
          console.error('[OSLAY] Permission initialization failed:', err);
          app.init();
          self.registerModules();
          isReady = true;
          self.triggerReady();
          
          if (window.OSLAY_HIDE_SKELETON) {
            window.OSLAY_HIDE_SKELETON();
          }
        });
      });
    },

    registerModules: function() {
      var self = this;
      Object.keys(coreModules).forEach(function(key) {
        self.modules[key] = layui[key];
      });
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
