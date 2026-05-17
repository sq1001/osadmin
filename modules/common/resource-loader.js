/**
 * 资源加载器模块
 * 实现按需加载 CSS/JS 资源
 * 支持页面级 title、keywords、description 配置
 */
layui.define(['jquery'], function(exports) {
  'use strict';

  var $ = layui.jquery;
  var loadedResources = {
    css: {},
    js: {},
    modules: {}
  };

  var resourceConfig = null;
  var normalizedPagesMap = null;

  var ResourceLoader = {
    init: function(config) {
      resourceConfig = config || {};
      this.buildNormalizedPagesMap();
      return this;
    },

    buildNormalizedPagesMap: function() {
      normalizedPagesMap = {};
      if (!resourceConfig.pages) return;
      
      for (var key in resourceConfig.pages) {
        if (resourceConfig.pages.hasOwnProperty(key)) {
          var normalizedKey = this.normalizePageUrl(key);
          normalizedPagesMap[normalizedKey] = resourceConfig.pages[key];
        }
      }
    },

    normalizePageUrl: function(url) {
      if (!url) return url;
      url = String(url);
      while (url.charAt(0) === '/') {
        url = url.substring(1);
      }
      return url;
    },

    getPageConfig: function(pageUrl) {
      var normalizedUrl = this.normalizePageUrl(pageUrl);
      if (!normalizedPagesMap || !normalizedPagesMap[normalizedUrl]) {
        return null;
      }
      return normalizedPagesMap[normalizedUrl];
    },

    loadPageResources: function(pageUrl) {
      var self = this;
      var deferred = $.Deferred();

      var normalizedUrl = this.normalizePageUrl(pageUrl);
      
      if (!normalizedPagesMap || !normalizedPagesMap[normalizedUrl]) {
        deferred.resolve();
        return deferred.promise();
      }

      var pageConfig = normalizedPagesMap[normalizedUrl];
      var cssFiles = pageConfig.css || [];
      var jsFiles = pageConfig.js || [];
      var dependencies = pageConfig.dependencies || [];

      var cssPromises = cssFiles.map(function(css) {
        return self.loadCSS(css);
      });

      var dependencyPromises = dependencies.map(function(dep) {
        return self.loadDependency(dep);
      });

      $.when.apply($, cssPromises.concat(dependencyPromises))
        .done(function() {
          var jsPromises = jsFiles.map(function(js) {
            return self.loadJS(js);
          });

          $.when.apply($, jsPromises)
            .done(function() {
              deferred.resolve();
            })
            .fail(function() {
              deferred.reject();
            });
        })
        .fail(function() {
          deferred.reject();
        });

      return deferred.promise();
    },

    loadCSS: function(url, options) {
      var deferred = $.Deferred();
      var self = this;

      if (loadedResources.css[url]) {
        deferred.resolve();
        return deferred.promise();
      }

      options = options || {};

      var fullUrl = this.resolveUrl(url);

      if ($('head link[href="' + fullUrl + '"]').length > 0) {
        loadedResources.css[url] = true;
        deferred.resolve();
        return deferred.promise();
      }

      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = fullUrl;

      if (options.id) {
        link.id = options.id;
      }

      link.onload = function() {
        loadedResources.css[url] = true;
        deferred.resolve();
      };

      link.onerror = function() {
        console.error('[ResourceLoader] Failed to load CSS:', url);
        deferred.reject();
      };

      document.head.appendChild(link);

      return deferred.promise();
    },

    loadJS: function(url, options) {
      var deferred = $.Deferred();

      if (loadedResources.js[url]) {
        deferred.resolve();
        return deferred.promise();
      }

      options = options || {};

      var fullUrl = this.resolveUrl(url);

      if ($('script[src="' + fullUrl + '"]').length > 0) {
        loadedResources.js[url] = true;
        deferred.resolve();
        return deferred.promise();
      }

      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = fullUrl;
      script.async = options.async !== false;

      if (options.id) {
        script.id = options.id;
      }

      script.onload = function() {
        loadedResources.js[url] = true;
        deferred.resolve();
      };

      script.onerror = function() {
        console.error('[ResourceLoader] Failed to load JS:', url);
        deferred.reject();
      };

      document.head.appendChild(script);

      return deferred.promise();
    },

    loadDependency: function(name) {
      var deferred = $.Deferred();
      var self = this;

      if (loadedResources.modules[name]) {
        deferred.resolve();
        return deferred.promise();
      }

      if (!resourceConfig.externals || !resourceConfig.externals[name]) {
        console.warn('[ResourceLoader] Dependency not found:', name);
        deferred.resolve();
        return deferred.promise();
      }

      var depConfig = resourceConfig.externals[name];
      var promises = [];

      if (depConfig.css) {
        promises.push(this.loadCSS(depConfig.css));
      }

      if (depConfig.js) {
        promises.push(this.loadJS(depConfig.js));
      }

      $.when.apply($, promises)
        .done(function() {
          loadedResources.modules[name] = true;
          deferred.resolve();
        })
        .fail(function() {
          deferred.reject();
        });

      return deferred.promise();
    },

    resolveUrl: function(url) {
      if (!url) return url;

      if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0 || url.indexOf('//') === 0) {
        return url;
      }

      if (url.charAt(0) === '/') {
        return url;
      }

      var base = window.OSLAY ? window.OSLAY.baseUrl : '/';
      if (base.charAt(base.length - 1) !== '/') {
        base += '/';
      }

      return base + url;
    },

    isLoaded: function(type, url) {
      return loadedResources[type] && loadedResources[type][url];
    },

    preloadDependency: function(name) {
      var self = this;

      if (loadedResources.modules[name]) {
        return $.Deferred().resolve().promise();
      }

      if (!resourceConfig.externals || !resourceConfig.externals[name]) {
        return $.Deferred().resolve().promise();
      }

      var depConfig = resourceConfig.externals[name];

      if (depConfig.js) {
        var fullJsUrl = this.resolveUrl(depConfig.js);
        var link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = fullJsUrl;
        document.head.appendChild(link);
      }

      if (depConfig.css) {
        var cssArray = Array.isArray(depConfig.css) ? depConfig.css : [depConfig.css];
        cssArray.forEach(function(css) {
          var fullCssUrl = self.resolveUrl(css);
          var link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = fullCssUrl;
          document.head.appendChild(link);
        });
      }

      return $.Deferred().resolve().promise();
    },

    preloadDependencies: function(names) {
      var self = this;
      if (!Array.isArray(names)) {
        names = [names];
      }
      names.forEach(function(name) {
        self.preloadDependency(name);
      });
      return this;
    },

    preloadPageResources: function(pageUrl) {
      var pageConfig = this.getPageConfig(pageUrl);
      if (!pageConfig) {
        return this;
      }

      var dependencies = pageConfig.dependencies || [];
      this.preloadDependencies(dependencies);

      return this;
    },

    preloadWithThrottle: function(pageUrl, throttleMs) {
      throttleMs = throttleMs || 300;
      var self = this;

      if (this._preloadTimers && this._preloadTimers[pageUrl]) {
        clearTimeout(this._preloadTimers[pageUrl]);
      }

      if (!this._preloadTimers) {
        this._preloadTimers = {};
      }

      if (this._lastPreloadUrls && this._lastPreloadUrls[pageUrl]) {
        return this;
      }

      this._preloadTimers[pageUrl] = setTimeout(function() {
        self.preloadPageResources(pageUrl);
        delete self._preloadTimers[pageUrl];
      }, throttleMs);

      return this;
    },

    preloadPageResourcesThrottled: function(pageUrl) {
      return this.preloadWithThrottle(pageUrl, 300);
    },

    clearCache: function(type) {
      if (type) {
        loadedResources[type] = {};
      } else {
        loadedResources = {
          css: {},
          js: {},
          modules: {}
        };
      }
    }
  };

  exports('resourceLoader', ResourceLoader);
});
