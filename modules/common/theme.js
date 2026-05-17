/**
 * 主题模块
 * 管理主题模式、配色方案、布局、水印、语言等配置
 * v2.0 - 支持框架配色方案(Framework Scheme) + 经典模式(Classic) + 自定义颜色器
 */
layui.define(['jquery', 'layer', 'form', 'colorpicker', 'watermarkMod'], function(exports) {
  'use strict';

  var $ = layui.jquery;
  var layer = layui.layer;
  var form = layui.form;
  var colorpicker = layui.colorpicker;
  var Watermark = layui.watermarkMod;
  var appConfig = null;

  var Theme = {
    state: null,
    tempState: null,
    defaultState: null,
    _events: {},
    _watermarkInstance: null,
    _colorPickerInstances: {},

    init: function(config) {
      appConfig = config || {};
      
      var themeConfig = appConfig.theme || {};
      var watermarkConfig = appConfig.watermark || {};
      var langConfig = appConfig.lang || {};

      this.defaultState = {
        mode: themeConfig.defaultMode || 'light',
        scheme: themeConfig.defaultScheme || 'indigo',
        colorMode: 'scheme',
        color: themeConfig.defaultColor || '#16baaa',
        customColors: {
          accent: '#6366f1',
          sidebarBg: '#ffffff',
          sidebarText: '#374151',
          contentBg: '#f8fafc',
          topbarBg: '#ffffff',
          tabsBg: '#ffffff'
        },
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

      if (!this.state.scheme) {
        this.state.scheme = this.defaultState.scheme;
      }
      if (!this.state.colorMode) {
        this.state.colorMode = this.defaultState.colorMode;
      }
      if (!this.state.customColors) {
        this.state.customColors = $.extend({}, this.defaultState.customColors);
      }

      this.tempState = $.extend(true, {}, this.state);
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

      if (state.colorMode === 'scheme' && state.scheme) {
        this.applyScheme(state.scheme);
      } else if (state.colorMode === 'custom') {
        this.applyCustomColors(state.customColors);
      } else {
        this.applyColor(state.color);
      }

      this.applyLayout(state.layout);
      this.applyTabsVisible(state.tabsVisible);
      this.applyWatermark(state.watermarkEnabled, state.watermarkText);
      
      this.emit('themeChange', state);
    },

    applyMode: function(mode) {
      if (mode === 'dark') {
        $('html').attr('data-theme', 'dark');
        var root = document.documentElement;
        var varsToRemove = [
          '--bg-sidebar', '--bg-sidebar-hover', '--sidebar-text', '--sidebar-text-muted',
          '--bg-topbar', '--bg-tabs', '--bg-content', '--card-bg', '--border',
          '--text-primary', '--text-secondary', '--text-muted',
          '--accent-light'
        ];
        varsToRemove.forEach(function(v) { root.style.removeProperty(v); });
      } else {
        $('html').removeAttr('data-theme');
      }
    },

    applyModeWithTransition: function(mode, event) {
      var self = this;
      var x = event ? event.clientX : window.innerWidth / 2;
      var y = event ? event.clientY : window.innerHeight / 2;
      var endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      if (!document.startViewTransition) {
        this.applyMode(mode);
        return;
      }

      var transition = document.startViewTransition(function() {
        self.applyMode(mode);
      });

      transition.ready.then(function() {
        var clipPath = [
          'circle(0px at ' + x + 'px ' + y + 'px)',
          'circle(' + endRadius + 'px at ' + x + 'px ' + y + 'px)'
        ];
        document.documentElement.animate({
          clipPath: clipPath
        }, {
          duration: 400,
          easing: 'ease-out',
          pseudoElement: '::view-transition-new(root)'
        });
      });
    },

    applyScheme: function(schemeId) {
      var schemes = appConfig.schemes || {};
      var scheme = schemes[schemeId];
      if (!scheme) {
        scheme = schemes['indigo'];
      }
      if (!scheme) return;

      var root = document.documentElement;

      if (this.state.mode === 'dark' && this._isColorTooDark(scheme.accent)) {
        return;
      }

      root.style.setProperty('--accent', scheme.accent);
      root.style.setProperty('--accent-hover', scheme.accentHover);
      root.style.setProperty('--accent-rgb', scheme.accentRgb);
      root.style.setProperty('--success', scheme.accent);

      if (this.state.mode !== 'dark') {
        root.style.setProperty('--accent-light', 'rgba(' + scheme.accentRgb + ', 0.1)');
        root.style.setProperty('--bg-sidebar', scheme.sidebarBg);
        root.style.setProperty('--bg-sidebar-hover', scheme.sidebarHover);
        root.style.setProperty('--sidebar-text', scheme.sidebarText);
        root.style.setProperty('--bg-content', scheme.contentBg);
        root.style.setProperty('--border', scheme.borderColor);
      }
    },

    applyCustomColors: function(customColors) {
      if (!customColors) return;

      var root = document.documentElement;
      var accent = customColors.accent || '#6366f1';
      var accentRgb = this.hexToRgb(accent);

      root.style.setProperty('--accent', accent);
      root.style.setProperty('--accent-hover', this.darken(accent, 12));
      root.style.setProperty('--accent-rgb', accentRgb);
      root.style.setProperty('--success', accent);

      if (this.state.mode !== 'dark') {
        root.style.setProperty('--accent-light', 'rgba(' + accentRgb + ', 0.1)');
        root.style.setProperty('--bg-sidebar', customColors.sidebarBg || '#ffffff');
        root.style.setProperty('--bg-sidebar-hover', this.lightenOrDarken(customColors.sidebarBg, -4));
        root.style.setProperty('--sidebar-text', customColors.sidebarText || '#374151');
        root.style.setProperty('--bg-content', customColors.contentBg || '#f8fafc');
        root.style.setProperty('--bg-topbar', customColors.topbarBg || '#ffffff');
        root.style.setProperty('--bg-tabs', customColors.tabsBg || '#ffffff');

        var borderLight = this.lightenOrDarken(customColors.sidebarBg, -8);
        root.style.setProperty('--border', borderLight);
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
        this.tempState = $.extend(true, {}, this.state);
        this.updateConfigPanel();
        $panel.addClass('show');
        $overlay.addClass('show');
        form.render('select');
        this.syncColorPickerUI();
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
      
      $('.scheme-option').removeClass('active');
      $('.scheme-option[data-scheme="' + state.scheme + '"]').addClass('active');
      
      $('.color-option').removeClass('active');
      $('.color-option[data-color="' + state.color + '"]').addClass('active');
      
      $('.layout-option').removeClass('active');
      $('.layout-option[data-layout="' + state.layout + '"]').addClass('active');
      
      $('#tabsToggle').prop('checked', state.tabsVisible);
      $('#rememberTabsToggle').prop('checked', state.rememberTabs);
      $('#accordionToggle').prop('checked', state.accordion);
      $('#watermarkToggle').prop('checked', state.watermarkEnabled);
      $('#pageAnimationSelect').val(state.pageAnimation);

      $('.config-tab-btn').removeClass('active');
      $('.config-tab-btn[data-tab="' + state.colorMode + '"]').addClass('active');
      
      $('.config-tab-content').removeClass('active');
      $('#tabContent_' + state.colorMode).addClass('active');
    },

    syncColorPickerUI: function() {
      var self = this;
      var cc = this.tempState.customColors || {};

      var pickerConfigs = [
        { id: 'pickerAccent', field: 'accent', defaultVal: '#6366f1' },
        { id: 'pickerSidebarBg', field: 'sidebarBg', defaultVal: '#ffffff' },
        { id: 'pickerSidebarText', field: 'sidebarText', defaultVal: '#374151' },
        { id: 'pickerContentBg', field: 'contentBg', defaultVal: '#f8fafc' },
        { id: 'pickerTopbarBg', field: 'topbarBg', defaultVal: '#ffffff' },
        { id: 'pickerTabsBg', field: 'tabsBg', defaultVal: '#ffffff' }
      ];

      pickerConfigs.forEach(function(cfg) {
        var val = cc[cfg.field] || cfg.defaultVal;

        if (self._colorPickerInstances[cfg.id]) {
          try { self._colorPickerInstances[cfg.id].destroy(); } catch(e) {}
        }

        self._colorPickerInstances[cfg.id] = colorpicker.render({
          elem: '#' + cfg.id,
          color: val,
          size: 'sm',
          done: function(color) {
            if (!self.tempState.customColors) {
              self.tempState.customColors = {};
            }
            self.tempState.customColors[cfg.field] = color;
            self.applyCustomColors(self.tempState.customColors);
          }
        });
      });
    },

    bindConfigPanelEvents: function() {
      var self = this;

      $(document).on('click', '.layui-theme-mode-btn', function(e) {
        var mode = $(this).data('mode');
        self.previewMode(mode, e);
        $('.layui-theme-mode-btn').removeClass('active');
        $(this).addClass('active');
      });

      $(document).on('click', '.scheme-option', function() {
        var scheme = $(this).data('scheme');
        self.previewScheme(scheme);
        $('.scheme-option').removeClass('active');
        $(this).addClass('active');
      });

      $(document).on('click', '.color-option', function() {
        var color = $(this).data('color');
        self.previewColor(color);
        $('.color-option').removeClass('active');
        $(this).addClass('active');
      });

      $(document).on('click', '.config-tab-btn', function() {
        var tab = $(this).data('tab');
        self.tempState.colorMode = tab;
        $('.config-tab-btn').removeClass('active');
        $(this).addClass('active');
        $('.config-tab-content').removeClass('active');
        $('#tabContent_' + tab).addClass('active');

        if (tab === 'scheme') {
          self.previewScheme(self.tempState.scheme);
        } else if (tab === 'classic') {
          self.previewColor(self.tempState.color);
        } else if (tab === 'custom') {
          self.previewCustomColors();
        }
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

    previewMode: function(mode, event) {
      this.tempState.mode = mode;
      this.applyModeWithTransition(mode, event);
      if (this.tempState.watermarkEnabled) {
        this.applyWatermark(true, this.tempState.watermarkText);
      }
    },

    previewScheme: function(schemeId) {
      this.tempState.scheme = schemeId;
      this.tempState.colorMode = 'scheme';
      this.applyScheme(schemeId);
    },

    previewColor: function(color) {
      this.tempState.color = color;
      this.tempState.colorMode = 'classic';
      this.applyColor(color);
    },

    previewCustomColors: function() {
      this.tempState.colorMode = 'custom';
      this.applyCustomColors(this.tempState.customColors);
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
      this.state = $.extend(true, {}, this.tempState);
      
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
      this.state = $.extend(true, {}, this.defaultState);
      this.tempState = $.extend(true, {}, this.defaultState);
      this.saveState();
      this.applyTheme(this.state);
      this.emit('themeReset', this.state);
    },

    cancelPreview: function() {
      this.tempState = $.extend(true, {}, this.state);
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
      return $.extend(true, {}, this.state);
    },

    getTempState: function() {
      return $.extend(true, {}, this.tempState);
    },

    getPageAnimation: function() {
      return this.state.pageAnimation || 'fadeIn';
    },

    hexToRgb: function(hex) {
      hex = hex.replace('#', '');
      if (hex.length === 3) {
        hex = hex[0]+hex[0] + hex[1]+hex[1] + hex[2]+hex[2];
      }
      var r = parseInt(hex.substring(0, 2), 16);
      var g = parseInt(hex.substring(2, 4), 16);
      var b = parseInt(hex.substring(4, 6), 16);
      return r + ',' + g + ',' + b;
    },

    _isColorTooDark: function(hex) {
      hex = (hex || '').replace('#', '');
      if (hex.length === 3) {
        hex = hex[0]+hex[0] + hex[1]+hex[1] + hex[2]+hex[2];
      }
      if (hex.length !== 6) return false;
      var r = parseInt(hex.substring(0, 2), 16);
      var g = parseInt(hex.substring(2, 4), 16);
      var b = parseInt(hex.substring(4, 6), 16);
      var luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance < 0.15;
    },

    darken: function(hex, percent) {
      hex = hex.replace('#', '');
      if (hex.length === 3) {
        hex = hex[0]+hex[0] + hex[1]+hex[1] + hex[2]+hex[2];
      }
      var r = parseInt(hex.substring(0, 2), 16);
      var g = parseInt(hex.substring(2, 4), 16);
      var b = parseInt(hex.substring(4, 6), 16);
      r = Math.max(0, Math.floor(r * (100 - percent) / 100));
      g = Math.max(0, Math.floor(g * (100 - percent) / 100));
      b = Math.max(0, Math.floor(b * (100 - percent) / 100));
      return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },

    lightenOrDarken: function(hex, amount) {
      hex = hex.replace('#', '');
      if (hex.length === 3) {
        hex = hex[0]+hex[0] + hex[1]+hex[1] + hex[2]+hex[2];
      }
      var r = parseInt(hex.substring(0, 2), 16);
      var g = parseInt(hex.substring(2, 4), 16);
      var b = parseInt(hex.substring(4, 6), 16);
      r = Math.min(255, Math.max(0, r + amount));
      g = Math.min(255, Math.max(0, g + amount));
      b = Math.min(255, Math.max(0, b + amount));
      return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
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
