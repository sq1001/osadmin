/**
 * 路由模块
 * 支持hash和history两种路由模式
 * 支持id与code双向映射
 */
layui.define(['jquery'], function(exports) {
  'use strict';

  var $ = layui.jquery;
  var appConfig = null;

  var Router = {
    mode: 'hash',
    base: '/',
    routes: {},
    currentPath: '',
    currentId: null,
    beforeHooks: [],
    afterHooks: [],
    _events: {},
    _idCodeMap: {},
    _codeIdMap: {},

    init: function(config, autoStart) {
      appConfig = config || {};
      
      var routerConfig = appConfig.router || {};
      this.mode = routerConfig.mode || 'hash';
      this.base = routerConfig.base || '/';
      this.bindEvents();
      
      if (autoStart !== false) {
        this.start();
      }
      return this;
    },

    registerMenu: function(menuData) {
      if (!menuData) return;
      var self = this;
      menuData.forEach(function(item) {
        self.buildMap(item);
      });
    },

    buildMap: function(item) {
      if (item.id !== undefined && item.code) {
        this._idCodeMap[item.id] = item.code;
        this._codeIdMap[item.code] = item.id;
      }
      if (item.children && item.children.length > 0) {
        var self = this;
        item.children.forEach(function(child) {
          self.buildMap(child);
        });
      }
    },

    getCodeById: function(id) {
      return this._idCodeMap[id];
    },

    getIdByCode: function(code) {
      return this._codeIdMap[code];
    },

    start: function() {
      if (this.mode === 'hash') {
        if (!window.location.hash) {
          window.location.hash = '#/';
        } else {
          this.handleRouteChange();
        }
      } else {
        this.handleRouteChange();
      }
    },

    bindEvents: function() {
      var self = this;
      
      if (this.mode === 'hash') {
        $(window).on('hashchange', function() {
          self.handleRouteChange();
        });
      } else {
        $(window).on('popstate', function(e) {
          self.handleRouteChange();
        });
        $(document).on('click', 'a[href^="/"]', function(e) {
          e.preventDefault();
          var href = $(this).attr('href');
          self.push(href);
        });
      }
    },

    handleRouteChange: function() {
      var path = this.getCurrentPath();
      
      if (this.currentPath === path) {
        return;
      }

      var result = this.runBeforeHooks(path);
      if (result === false) {
        return;
      }

      this.currentPath = path;
      var code = path.replace(/^\//, '') || '';
      this.currentId = this.getIdByCode(code);
      
      this.emit('routeChange', { path: path, code: code, id: this.currentId });
      
      this.runAfterHooks(path);
    },

    getCurrentPath: function() {
      if (this.mode === 'hash') {
        var hash = window.location.hash.slice(1);
        return hash || '/';
      } else {
        var path = window.location.pathname;
        if (this.base !== '/') {
          path = path.replace(this.base, '');
        }
        return path || '/';
      }
    },

    getCurrentCode: function() {
      return this.currentPath.replace(/^\//, '') || '';
    },

    getCurrentId: function() {
      return this.currentId;
    },

    push: function(path, state) {
      if (this.mode === 'hash') {
        if (path.charAt(0) !== '/') {
          path = '/' + path;
        }
        window.location.hash = '#' + path;
      } else {
        var url = this.base + path.replace(/^\//, '');
        window.history.pushState(state || {}, '', url);
        this.handleRouteChange();
      }
    },

    replace: function(path, state) {
      if (this.mode === 'hash') {
        if (path.charAt(0) !== '/') {
          path = '/' + path;
        }
        window.location.replace('#' + path);
      } else {
        var url = this.base + path.replace(/^\//, '');
        window.history.replaceState(state || {}, '', url);
        this.handleRouteChange();
      }
    },

    go: function(n) {
      window.history.go(n);
    },

    back: function() {
      this.go(-1);
    },

    forward: function() {
      this.go(1);
    },

    beforeEach: function(hook) {
      if (typeof hook === 'function') {
        this.beforeHooks.push(hook);
      }
    },

    afterEach: function(hook) {
      if (typeof hook === 'function') {
        this.afterHooks.push(hook);
      }
    },

    runBeforeHooks: function(path) {
      for (var i = 0; i < this.beforeHooks.length; i++) {
        var result = this.beforeHooks[i](path);
        if (result === false) {
          return false;
        }
      }
      return true;
    },

    runAfterHooks: function(path) {
      for (var i = 0; i < this.afterHooks.length; i++) {
        this.afterHooks[i](path);
      }
    },

    on: function(event, callback) {
      this._events[event] = this._events[event] || [];
      this._events[event].push(callback);
    },

    emit: function(event) {
      var args = Array.prototype.slice.call(arguments, 1);
      var callbacks = this._events[event];
      if (callbacks) {
        callbacks.forEach(function(callback) {
          callback.apply(null, args);
        });
      }
    },

    navigateTo: function(idOrCode) {
      var code = idOrCode;
      if (typeof idOrCode === 'number') {
        code = this.getCodeById(idOrCode);
        if (!code) {
          console.warn('Router: id not found:', idOrCode);
          return;
        }
      }
      var path = '/' + code;
      this.push(path);
    },

    navigateById: function(id) {
      var code = this.getCodeById(id);
      if (code) {
        this.push('/' + code);
      } else {
        console.warn('Router: id not found:', id);
      }
    },

    navigateByCode: function(code) {
      this.push('/' + code);
    },

    setMode: function(mode) {
      if (mode === 'hash' || mode === 'history') {
        this.mode = mode;
        $(window).off('hashchange popstate');
        this.bindEvents();
      }
    }
  };

  exports('routerModule', Router);
});
