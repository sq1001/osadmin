/**
 * OS Admin - 全局 JS 入口
 * 自动加载所有模块并初始化应用
 */
(function(window, document) {
  'use strict';

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

  var readyCallbacks = [];
  var isReady = false;

  var App = {
    version: '1.0.0',
    name: 'OS Admin',
    debug: false,
    baseUrl: baseUrl,
    scriptPath: scriptPath,

    modules: {},

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
          self.initModules();
        }).fail(function() {
          console.error('[OSLAY] Failed to load menu config');
          self.menuConfig = [];
          self.initModules();
        });
      }).fail(function() {
        console.error('[OSLAY] Failed to load app config');
        self.appConfig = {};
        self.menuConfig = [];
        self.initModules();
      });
    },

    initModules: function() {
      var self = this;

      layui.config({
        base: baseUrl
      }).extend({
        routerModule: 'modules/common/router',
        themeModule: 'modules/common/theme',
        permissionModule: 'modules/common/permission',
        sidebarComp: 'modules/components/sidebar',
        tabsComp: 'modules/components/tabs',
        commonMod: 'modules/extends/common',
        countMod: 'modules/extends/count',
        echartsMod: 'modules/extends/echarts',
        xmSelectMod: 'modules/extends/xm-select',
        toastMod: 'modules/extends/toast',
        drawerMod: 'modules/extends/drawer',
        laydrawer: 'modules/extends/laydrawer',
        appMain: 'modules/app'
      });

      layui.use(['appMain', 'permissionModule'], function() {
        var app = layui.appMain;
        var permission = layui.permissionModule;
        
        var permissionConfig = self.appConfig && self.appConfig.permission ? self.appConfig.permission : {};
        
        permission.init(permissionConfig).then(function() {
          app.init();
          
          self.modules = {
            router: layui.routerModule,
            theme: layui.themeModule,
            sidebar: layui.sidebarComp,
            tabs: layui.tabsComp,
            common: layui.commonMod,
            count: layui.countMod,
            echarts: layui.echartsMod,
            xmSelect: layui.xmSelectMod,
            toast: layui.toastMod,
            permission: permission,
            app: layui.appMain
          };

          isReady = true;
          self.triggerReady();

          if (self.debug) {
            console.log('[' + self.name + '] v' + self.version + ' initialized');
            console.log('baseUrl:', baseUrl);
            console.log('Modules:', self.modules);
          }
        }).catch(function(err) {
          console.error('[OSLAY] Permission initialization failed:', err);
          app.init();
          
          self.modules = {
            router: layui.routerModule,
            theme: layui.themeModule,
            sidebar: layui.sidebarComp,
            tabs: layui.tabsComp,
            common: layui.commonMod,
            count: layui.countMod,
            echarts: layui.echartsMod,
            xmSelect: layui.xmSelectMod,
            toast: layui.toastMod,
            permission: permission,
            app: layui.appMain
          };

          isReady = true;
          self.triggerReady();

          if (self.debug) {
            console.log('[' + self.name + '] v' + self.version + ' initialized (permission failed)');
            console.log('baseUrl:', baseUrl);
            console.log('Modules:', self.modules);
          }
        });
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

  layui.use(['jquery'], function() {
    App.init();
  });

})(window, document);
