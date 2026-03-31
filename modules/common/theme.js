/**
 * 主题模块
 * 管理主题模式、颜色、布局、水印、语言等配置
 */
layui.define(['jquery', 'layer'], function(exports) {
  'use strict';

  var $ = layui.jquery;
  var layer = layui.layer;
  var appConfig = null;

  var Theme = {
    state: null,
    tempState: null,
    defaultState: null,
    _events: {},
    watermarkCanvas: null,

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
    },

    applyTabsVisible: function(visible) {
      if (visible) {
        $('#tabsContainer').removeClass('hidden');
      } else {
        $('#tabsContainer').addClass('hidden');
      }
    },

    applyWatermark: function(enabled, text) {
      var $watermark = $('#contentWatermark');
      
      if (!enabled) {
        $watermark.remove();
        return;
      }

      var watermarkText = text || this.getWatermarkText();
      if (!watermarkText) {
        $watermark.remove();
        return;
      }

      var watermarkConfig = appConfig.watermark || {};
      var fontSize = watermarkConfig.fontSize || 14;
      var color = watermarkConfig.color || 'rgba(0, 0, 0, 0.08)';
      var rotate = watermarkConfig.rotate || -22;
      var gapX = watermarkConfig.gapX || 100;
      var gapY = watermarkConfig.gapY || 100;

      if (this.state.mode === 'dark') {
        color = 'rgba(255, 255, 255, 0.06)';
      }

      if ($watermark.length === 0) {
        $watermark = $('<div id="contentWatermark" class="content-watermark"></div>');
        $('#contentWrapper').before($watermark);
      }

      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      var textWidth = watermarkText.length * fontSize;
      canvas.width = gapX + textWidth;
      canvas.height = gapY + fontSize * 2;

      ctx.font = fontSize + 'px Arial, sans-serif';
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rotate * Math.PI / 180);
      ctx.fillText(watermarkText, 0, 0);

      $watermark.css({
        'background-image': 'url(' + canvas.toDataURL('image/png') + ')',
        'background-repeat': 'repeat',
        'pointer-events': 'none'
      });
    },

    getWatermarkText: function() {
      var text = this.state.watermarkText || '';
      if (text) {
        return text;
      }
      try {
        var sessionUser = sessionStorage.getItem('username');
        if (sessionUser) {
          return sessionUser;
        }
      } catch (e) {}
      return '';
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

      $(document).on('change', '#pageAnimationSelect', function() {
        self.previewPageAnimation($(this).val());
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
