/**
 * 主题模块
 * 管理主题模式、颜色、布局、水印、语言等配置
 */
layui.define(['jquery', 'layer', 'form', 'watermarkMod'], function(exports) {
  'use strict';

  var $ = layui.jquery;
  var layer = layui.layer;
  var form = layui.form;
  var Watermark = layui.watermarkMod;
  var appConfig = null;

  var Theme = {
    state: null,
    tempState: null,
    defaultState: null,
    _events: {},
    _watermarkInstance: null,

    init: function(config) {
      appConfig = config || {};
      
      var themeConfig = appConfig.theme || {};
      var watermarkConfig = appConfig.watermark || {};
      var langConfig = appConfig.lang || {};

      this.defaultState = {
        mode: themeConfig.defaultMode || 'light',
        color: themeConfig.defaultColor || '#16baaa',
        layout: themeConfig.defaultLayout || 'double',
        tabsVisible: themeConfig.tabsVisible !== false,
        rememberTabs: themeConfig.rememberTabs !== false,
        accordion: themeConfig.accordion || false,
        pageAnimation: themeConfig.pageAnimation || 'fadeIn',
        watermarkEnabled: watermarkConfig.enabled !== false,
        watermarkText: watermarkConfig.text || '',
        lang: langConfig.default || 'zh-CN'
      };

      this.loadState();
      this.applyTheme(this.state);
      this.bindConfigPanelEvents();
      
      return this;
    },

    loadState: function() {
      var storageKey = appConfig.storage ? appConfig.storage.themeKey : 'themeConfig';
      var saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          var parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            this.state = $.extend({}, this.defaultState, parsed);
          } else {
            this.state = $.extend({}, this.defaultState);
          }
        } catch (e) {
          this.state = $.extend({}, this.defaultState);
        }
      } else {
        this.state = $.extend({}, this.defaultState);
      }
      this.tempState = $.extend({}, this.state);
    },

    saveState: function() {
      var storageKey = appConfig.storage ? appConfig.storage.themeKey : 'themeConfig';
      try {
        localStorage.setItem(storageKey, JSON.stringify(this.state));
        return true;
      } catch (e) {
        console.warn('Failed to save theme state', e);
        return false;
      }
    },

    applyTheme: function(state) {
      this.applyMode(state.mode);
      this.applyColor(state.color);
      this.applyLayout(state.layout);
      this.applyTabsVisible(state.tabsVisible);
      this.applyWatermark(state.watermarkEnabled, state.watermarkText);
      
      this.emit('themeChange', state);
    },

    applyMode: function(mode) {
      if (mode === 'dark') {
        $('html').attr('data-theme', 'dark');
      } else {
        $('html').removeAttr('data-theme');
      }
    },

    applyColor: function(color) {
      var colors = appConfig.colors || {};
      var colorData = colors[color] || colors['#16baaa'];
      if (colorData) {
        document.documentElement.style.setProperty('--accent', color);
        document.documentElement.style.setProperty('--accent-hover', colorData.hover);
        document.documentElement.style.setProperty('--accent-light', 'rgba(' + colorData.rgb + ', 0.1)');
        document.documentElement.style.setProperty('--accent-rgb', colorData.rgb);
        document.documentElement.style.setProperty('--success', color);
      }
    },

    applyLayout: function(layout) {
      $('body').attr('data-layout', layout);
      $('body').removeClass('layout-double layout-dropdown layout-fixed-double');
      $('body').addClass('layout-' + layout);
      
      if (layout === 'fixed-double') {
        $('#sidebar').removeClass('collapsed');
        $('#submenuPanel').addClass('show');
      }
    },

    applyTabsVisible: function(visible) {
      if (visible) {
        $('#tabsContainer').removeClass('hidden');
      } else {
        $('#tabsContainer').addClass('hidden');
      }
    },

    applyWatermark: function(enabled, text) {
      if (this._watermarkInstance) {
        this._watermarkInstance.destroy();
        this._watermarkInstance = null;
      }

      if (!enabled) {
        return;
      }

      var watermarkText = text || this.getWatermarkText();
      if (!watermarkText) {
        return;
      }

      var watermarkConfig = appConfig.watermark || {};
      var color = watermarkConfig.color || 'rgba(0, 0, 0, 0.08)';

      if (this.state.mode === 'dark') {
        color = 'rgba(255, 255, 255, 0.06)';
      }

      var $wrapper = $('#contentWrapper');
      var appendTo = $wrapper.length > 0 ? $wrapper.parent()[0] : 'body';

      this._watermarkInstance = new Watermark({
        content: watermarkText,
        appendTo: appendTo,
        fontSize: watermarkConfig.fontSize || 14,
        fontColor: color,
        rotate: watermarkConfig.rotate || -22,
        colSpacing: watermarkConfig.gapX || 100,
        rowSpacing: watermarkConfig.gapY || 100,
        width: watermarkConfig.width || 100,
        height: watermarkConfig.height || 20,
        zIndex: 999998
      });
    },

    getWatermarkText: function() {
      var watermarkConfig = appConfig.watermark || {};
      var dynamicTextKey = watermarkConfig.dynamicTextKey || 'username';
      
      try {
        var sessionData = sessionStorage.getItem(dynamicTextKey.split('.')[0]);
        if (sessionData) {
          try {
            var parsedData = JSON.parse(sessionData);
            var value = this.getNestedValue(parsedData, dynamicTextKey);
            if (value) {
              return String(value);
            }
          } catch (e) {
            if (dynamicTextKey.indexOf('.') === -1) {
              return sessionData;
            }
          }
        }
      } catch (e) {}
      
      var text = this.state.watermarkText || '';
      if (text) {
        return text;
      }
      
      var defaultText = watermarkConfig.text || '';
      if (defaultText) {
        return defaultText;
      }
      
      return '';
    },

    getNestedValue: function(obj, path) {
      if (!obj || !path) return null;
      
      if (path.indexOf('.') === -1) {
        return obj[path];
      }
      
      var keys = path.split('.');
      var current = obj;
      
      for (var i = 0; i < keys.length; i++) {
        if (current === null || current === undefined || typeof current !== 'object') {
          return null;
        }
        current = current[keys[i]];
      }
      
      return current;
    },

    setWatermarkText: function(text) {
      this.state.watermarkText = text;
      this.applyWatermark(this.state.watermarkEnabled, text);
    },

    toggleWatermark: function(enabled) {
      this.state.watermarkEnabled = enabled;
      this.applyWatermark(enabled, this.state.watermarkText);
    },

    toggleConfigPanel: function() {
      var $panel = $('#themeConfigPanel');
      var $overlay = $('#themePanelOverlay');
      
      if ($panel.hasClass('show')) {
        this.hideConfigPanel();
      } else {
        this.tempState = $.extend({}, this.state);
        this.updateConfigPanel();
        $panel.addClass('show');
        $overlay.addClass('show');
        form.render('select');
      }
    },

    hideConfigPanel: function() {
      $('#themeConfigPanel').removeClass('show');
      $('#themePanelOverlay').removeClass('show');
    },

    updateConfigPanel: function() {
      var state = this.tempState;
      
      $('.layui-theme-mode-btn').removeClass('active');
      $('.layui-theme-mode-btn[data-mode="' + state.mode + '"]').addClass('active');
      
      $('.color-option').removeClass('active');
      $('.color-option[data-color="' + state.color + '"]').addClass('active');
      
      $('.layout-option').removeClass('active');
      $('.layout-option[data-layout="' + state.layout + '"]').addClass('active');
      
      $('#tabsToggle').prop('checked', state.tabsVisible);
      $('#rememberTabsToggle').prop('checked', state.rememberTabs);
      $('#accordionToggle').prop('checked', state.accordion);
      $('#watermarkToggle').prop('checked', state.watermarkEnabled);
      $('#pageAnimationSelect').val(state.pageAnimation);
    },

    bindConfigPanelEvents: function() {
      var self = this;

      $(document).on('click', '.layui-theme-mode-btn', function() {
        var mode = $(this).data('mode');
        self.previewMode(mode);
        $('.layui-theme-mode-btn').removeClass('active');
        $(this).addClass('active');
      });

      $(document).on('click', '.color-option', function() {
        var color = $(this).data('color');
        self.previewColor(color);
        $('.color-option').removeClass('active');
        $(this).addClass('active');
      });

      $(document).on('click', '.layout-option', function() {
        var layout = $(this).data('layout');
        self.previewLayout(layout);
        $('.layout-option').removeClass('active');
        $(this).addClass('active');
      });

      $(document).on('change', '#tabsToggle', function() {
        self.previewTabsVisible($(this).prop('checked'));
      });

      $(document).on('change', '#rememberTabsToggle', function() {
        self.previewRememberTabs($(this).prop('checked'));
      });

      $(document).on('change', '#accordionToggle', function() {
        self.previewAccordion($(this).prop('checked'));
      });

      $(document).on('change', '#watermarkToggle', function() {
        self.previewWatermark($(this).prop('checked'));
      });

      form.on('select(pageAnimation)', function(data) {
        self.previewPageAnimation(data.value);
      });
    },

    saveConfig: function() {
      this.save();
      this.hideConfigPanel();
      layer.msg('主题配置已保存，正在刷新页面...', { icon: 1, time: 1000 }, function() {
        location.reload();
      });
    },

    resetConfig: function() {
      this.reset();
      this.hideConfigPanel();
      layer.msg('主题已重置，正在刷新页面...', { icon: 1, time: 1000 }, function() {
        location.reload();
      });
    },

    previewMode: function(mode) {
      this.tempState.mode = mode;
      this.applyMode(mode);
      if (this.tempState.watermarkEnabled) {
        this.applyWatermark(true, this.tempState.watermarkText);
      }
    },

    previewColor: function(color) {
      this.tempState.color = color;
      this.applyColor(color);
    },

    previewLayout: function(layout) {
      this.tempState.layout = layout;
      this.applyLayout(layout);
    },

    previewTabsVisible: function(visible) {
      this.tempState.tabsVisible = visible;
      this.applyTabsVisible(visible);
    },

    previewRememberTabs: function(enabled) {
      this.tempState.rememberTabs = enabled;
    },

    previewAccordion: function(enabled) {
      this.tempState.accordion = enabled;
    },

    previewWatermark: function(enabled) {
      this.tempState.watermarkEnabled = enabled;
      this.applyWatermark(enabled, this.tempState.watermarkText);
    },

    previewPageAnimation: function(animation) {
      this.tempState.pageAnimation = animation;
    },

    save: function() {
      var wasRememberTabsEnabled = this.state.rememberTabs;
      this.state = $.extend({}, this.tempState);
      
      if (this.saveState()) {
        if (wasRememberTabsEnabled && !this.state.rememberTabs) {
          this.clearTabsState();
        }
        this.emit('themeSaved', this.state);
        return true;
      }
      return false;
    },

    reset: function() {
      this.clearTabsState();
      this.state = $.extend({}, this.defaultState);
      this.tempState = $.extend({}, this.defaultState);
      this.saveState();
      this.applyTheme(this.state);
      this.emit('themeReset', this.state);
    },

    cancelPreview: function() {
      this.tempState = $.extend({}, this.state);
      this.applyTheme(this.state);
    },

    clearTabsState: function() {
      var storageKey = appConfig.storage ? appConfig.storage.tabsKey : 'tabsState';
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {
        console.warn('Failed to clear tabs state', e);
      }
    },

    getState: function() {
      return $.extend({}, this.state);
    },

    getTempState: function() {
      return $.extend({}, this.tempState);
    },

    getPageAnimation: function() {
      return this.state.pageAnimation || 'fadeIn';
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
    }
  };

  exports('themeModule', Theme);
});
