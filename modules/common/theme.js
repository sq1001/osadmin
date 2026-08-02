/**
 * 主题模块
 * 管理主题模式、配色方案、布局、水印、语言等配置
 * v2.0 - 支持框架配色方案(Framework Scheme) + 经典模式(Classic) + 自定义颜色器
 */
layui.define(['jquery', 'layer', 'form', 'colorpicker', 'watermarkMod'], function (exports) {
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
    _currentRole: 'admin',

    init: function (config) {
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
        density: 'comfortable',
        sidebarWidth: 210,
        submenuWidth: (appConfig.sidebar && appConfig.sidebar.submenuWidth) || 180,
        submenuFixedWidth: (appConfig.sidebar && appConfig.sidebar.submenuWidth) || 180,
        watermarkEnabled: watermarkConfig.enabled !== false,
        watermarkText: watermarkConfig.text || '',
        lang: langConfig.default || 'zh-CN',
        fontSize: 14,
        borderRadius: 8,
        breadcrumbVisible: false
      };

      this.loadState();
      this.applyTheme(this.state);
      this.bindConfigPanelEvents();
      return this;
    },

    loadState: function () {
      var storageKey = this._getStorageKey(appConfig.storage ? appConfig.storage.themeKey : 'themeConfig');
      var saved = localStorage.getItem(storageKey);

      if (!saved) {
        var legacyKey = appConfig.storage ? appConfig.storage.themeKey : 'themeConfig';
        var legacyData = localStorage.getItem(legacyKey);
        if (legacyData && legacyKey !== storageKey) {
          try {
            var parsed = JSON.parse(legacyData);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
              saved = legacyData;
              try { localStorage.setItem(storageKey, saved); } catch (e) { }
            }
          } catch (e) { }
        }
      }

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

    saveState: function () {
      var storageKey = this._getStorageKey(appConfig.storage ? appConfig.storage.themeKey : 'themeConfig');
      try {
        localStorage.setItem(storageKey, JSON.stringify(this.state));
        return true;
      } catch (e) {
        console.warn('Failed to save theme state', e);
        return false;
      }
    },

    applyTheme: function (state) {
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
      this.applyBreadcrumbVisible(state.breadcrumbVisible);
      this.applyWatermark(state.watermarkEnabled, state.watermarkText);
      this.applyDensity(state.density);
      this.applySidebarWidth(state.sidebarWidth);
      this.applySubmenuWidth(state.submenuWidth);
      this.applySubmenuFixedWidth(state.submenuFixedWidth);
      this.applyFontSize(state.fontSize);
      this.applyBorderRadius(state.borderRadius);
      this.emit('themeChange', state);
    },

    applyMode: function (mode) {
      if (mode === 'dark') {
        $('html').attr('data-theme', 'dark');
        var root = document.documentElement;
        var varsToRemove = [
          '--bg-sidebar', '--bg-sidebar-hover', '--sidebar-text', '--sidebar-text-muted',
          '--bg-topbar', '--bg-tabs', '--bg-content', '--card-bg', '--border',
          '--text-primary', '--text-secondary', '--text-muted',
          '--accent-light'
        ];
        varsToRemove.forEach(function (v) { root.style.removeProperty(v); });
      } else {
        $('html').removeAttr('data-theme');
      }
    },

    applyModeWithTransition: function (mode, event, extraCallback) {
      var self = this;
      var x = event ? event.clientX : window.innerWidth / 2;
      var y = event ? event.clientY : window.innerHeight / 2;
      var endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      if (!document.startViewTransition) {
        this.applyMode(mode);
        if (typeof extraCallback === 'function') extraCallback();
        return;
      }

      var transition = document.startViewTransition(function () {
        self.applyMode(mode);
        if (typeof extraCallback === 'function') extraCallback();
      });

      transition.ready.then(function () {
        var clipPath = [
          'circle(0px at ' + x + 'px ' + y + 'px)',
          'circle(' + endRadius + 'px at ' + x + 'px ' + y + 'px)'
        ];
        document.documentElement.animate({
          clipPath: clipPath
        }, {
          duration: 600,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)'
        });
      });
    },

    applyScheme: function (schemeId) {
      if (!this.isSchemeAllowed(schemeId)) {
        console.warn('[Theme] Scheme not allowed by profile:', schemeId);
        return;
      }

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

      if (this.state.mode !== 'dark') {
        root.style.setProperty('--accent-light', 'rgba(' + scheme.accentRgb + ', 0.1)');
        root.style.setProperty('--bg-sidebar', scheme.sidebarBg);
        root.style.setProperty('--bg-sidebar-hover', scheme.sidebarHover);
        root.style.setProperty('--sidebar-text', scheme.sidebarText);
        root.style.setProperty('--bg-content', scheme.contentBg);
        root.style.setProperty('--border', scheme.borderColor);
      }
    },

    applyCustomColors: function (customColors) {
      if (!customColors) return;

      var root = document.documentElement;
      var accent = customColors.accent || '#6366f1';
      var accentRgb = this.hexToRgb(accent);

      root.style.setProperty('--accent', accent);
      root.style.setProperty('--accent-hover', this.darken(accent, 12));
      root.style.setProperty('--accent-rgb', accentRgb);

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
      } else {
        root.style.setProperty('--accent-light', 'rgba(' + accentRgb + ', 0.15)');
        root.style.setProperty('--bg-sidebar', customColors.sidebarBg || '#1e293b');
        root.style.setProperty('--bg-sidebar-hover', this.lightenOrDarken(customColors.sidebarBg, 4));
        root.style.setProperty('--sidebar-text', customColors.sidebarText || '#e2e8f0');
        root.style.setProperty('--bg-content', customColors.contentBg || '#0f172a');
        root.style.setProperty('--bg-topbar', customColors.topbarBg || '#1e293b');
        root.style.setProperty('--bg-tabs', customColors.tabsBg || '#1e293b');

        var borderDark = this.lightenOrDarken(customColors.sidebarBg || '#1e293b', 12);
        root.style.setProperty('--border', borderDark);
      }
    },

    applyColor: function (color) {
      var colors = appConfig.colors || {};
      var colorData = colors[color] || colors['#16baaa'];
      if (colorData) {
        document.documentElement.style.setProperty('--accent', color);
        document.documentElement.style.setProperty('--accent-hover', colorData.hover);
        document.documentElement.style.setProperty('--accent-light', 'rgba(' + colorData.rgb + ', 0.1)');
        document.documentElement.style.setProperty('--accent-rgb', colorData.rgb);
      }
    },

    applyLayout: function (layout) {
      if (!this.isLayoutAllowed(layout)) {
        console.warn('[Theme] Layout not allowed by profile:', layout, ', using default');
        layout = this._getAllowedDefaultLayout();
      }

      $('body').attr('data-layout', layout);
      $('body').removeClass('layout-double layout-dropdown layout-fixed-double');
      $('body').addClass('layout-' + layout);
    },

    applyTabsVisible: function (visible) {
      if (visible) {
        $('#tabsContainer').removeClass('hidden');
      } else {
        $('#tabsContainer').addClass('hidden');
      }
    },

    applyBreadcrumbVisible: function (visible) {
      if (visible) {
        $('#breadcrumbContainer').removeClass('hidden');
      } else {
        $('#breadcrumbContainer').addClass('hidden');
      }
    },

    applyWatermark: function (enabled, text) {
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

    applyDensity: function (density) {
      var root = document.documentElement;
      if (density === 'compact') {
        root.setAttribute('data-density', 'compact');
      } else {
        root.removeAttribute('data-density');
      }
    },

    applySidebarWidth: function (width) {
      var w = parseInt(width, 10);
      if (isNaN(w) || w < 160) { w = 160; }
      if (w > 320) { w = 320; }
      document.documentElement.style.setProperty('--sidebar-width', w + 'px');
    },

    applySubmenuWidth: function (width) {
      var w = parseInt(width, 10);
      if (isNaN(w) || w < 140) { w = 140; }
      if (w > 240) { w = 240; }
      document.documentElement.style.setProperty('--submenu-width', w + 'px');
    },

    applySubmenuFixedWidth: function (width) {
      var w = parseInt(width, 10);
      if (isNaN(w) || w < 140) { w = 140; }
      if (w > 240) { w = 240; }
      document.documentElement.style.setProperty('--submenu-fixed-width', w + 'px');
    },

    applyFontSize: function (size) {
      var s = parseInt(size, 10);
      if (isNaN(s) || s < 12) { s = 12; }
      if (s > 20) { s = 20; }
      document.documentElement.style.setProperty('--font-size-base', s + 'px');
    },

    applyBorderRadius: function (radius) {
      var r = parseInt(radius, 10);
      if (isNaN(r) || r < 4) { r = 4; }
      if (r > 20) { r = 20; }
      document.documentElement.style.setProperty('--border-radius-base', r + 'px');
    },

    getWatermarkText: function () {
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
      } catch (e) { }
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

    getNestedValue: function (obj, path) {
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

    setWatermarkText: function (text) {
      this.state.watermarkText = text;
      this.applyWatermark(this.state.watermarkEnabled, text);
    },

    toggleWatermark: function (enabled) {
      this.state.watermarkEnabled = enabled;
      this.applyWatermark(enabled, this.state.watermarkText);
    },

    toggleConfigPanel: function () {
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

    hideConfigPanel: function () {
      $('#themeConfigPanel').removeClass('show');
      $('#themePanelOverlay').removeClass('show');
    },

    updateConfigPanel: function () {
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
      $('#breadcrumbToggle').prop('checked', state.breadcrumbVisible);
      $('#accordionToggle').prop('checked', state.accordion);
      $('#watermarkToggle').prop('checked', state.watermarkEnabled);
      $('#pageAnimationSelect').val(state.pageAnimation);
      $('#densityToggle').prop('checked', state.density === 'compact');
      $('#sidebarWidthInput').val(state.sidebarWidth);
      $('#fontSizeInput').val(state.fontSize);
      $('#borderRadiusInput').val(state.borderRadius);

      // 字体大小预设按钮状态
      $('#fontSizeInput').closest('.sidebar-width-controls').find('.sidebar-width-preset').removeClass('active');
      var matchedFontSizePreset = $('#fontSizeInput').closest('.sidebar-width-controls').find('.sidebar-width-preset[data-size="' + state.fontSize + '"]');
      if (matchedFontSizePreset.length) {
        matchedFontSizePreset.addClass('active');
      }

      // 圆角大小预设按钮状态
      $('#borderRadiusInput').closest('.sidebar-width-controls').find('.sidebar-width-preset').removeClass('active');
      var matchedBorderRadiusPreset = $('#borderRadiusInput').closest('.sidebar-width-controls').find('.sidebar-width-preset[data-radius="' + state.borderRadius + '"]');
      if (matchedBorderRadiusPreset.length) {
        matchedBorderRadiusPreset.addClass('active');
      }

      $('#sidebarWidthInput').closest('.sidebar-width-controls').find('.sidebar-width-preset').removeClass('active');
      var matchedPreset = $('#sidebarWidthInput').closest('.sidebar-width-controls').find('.sidebar-width-preset[data-width="' + state.sidebarWidth + '"]');
      if (matchedPreset.length) {
        matchedPreset.addClass('active');
      }

      $('#submenuWidthInput').val(state.submenuWidth);

      $('#submenuWidthInput').closest('.sidebar-width-controls').find('.sidebar-width-preset').removeClass('active');
      var matchedSubmenuPreset = $('#submenuWidthInput').closest('.sidebar-width-controls').find('.sidebar-width-preset[data-width="' + state.submenuWidth + '"]');
      if (matchedSubmenuPreset.length) {
        matchedSubmenuPreset.addClass('active');
      }

      $('#submenuFixedWidthInput').val(state.submenuFixedWidth);

      $('#submenuFixedWidthInput').closest('.sidebar-width-controls').find('.sidebar-width-preset').removeClass('active');
      var matchedSubmenuFixedPreset = $('#submenuFixedWidthInput').closest('.sidebar-width-controls').find('.sidebar-width-preset[data-width="' + state.submenuFixedWidth + '"]');
      if (matchedSubmenuFixedPreset.length) {
        matchedSubmenuFixedPreset.addClass('active');
      }

      $('.config-tab-btn').removeClass('active');
      $('.config-tab-btn[data-tab="' + state.colorMode + '"]').addClass('active');
      $('.config-tab-content').removeClass('active');
      $('#tabContent_' + state.colorMode).addClass('active');

      this._applyPermissionsToPanel();
      this._updateWidthConfigVisibility(state.layout);
    },

    syncColorPickerUI: function () {
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

      pickerConfigs.forEach(function (cfg) {
        var val = cc[cfg.field] || cfg.defaultVal;

        if (self._colorPickerInstances[cfg.id]) {
          try { self._colorPickerInstances[cfg.id].destroy(); } catch (e) { }
        }

        self._colorPickerInstances[cfg.id] = colorpicker.render({
          elem: '#' + cfg.id,
          color: val,
          size: 'sm',
          done: function (color) {
            if (!self.tempState.customColors) {
              self.tempState.customColors = {};
            }
            self.tempState.customColors[cfg.field] = color;
            self.applyCustomColors(self.tempState.customColors);
          }
        });
      });
    },

    bindConfigPanelEvents: function () {
      var self = this;

      $(document).on('click', '.layui-theme-mode-btn', function (e) {
        var mode = $(this).data('mode');
        self.previewMode(mode, e);
        $('.layui-theme-mode-btn').removeClass('active');
        $(this).addClass('active');
      });

      $(document).on('click', '.scheme-option', function () {
        var scheme = $(this).data('scheme');
        self.previewScheme(scheme);
        $('.scheme-option').removeClass('active');
        $(this).addClass('active');
      });

      $(document).on('click', '.color-option', function () {
        var color = $(this).data('color');
        self.previewColor(color);
        $('.color-option').removeClass('active');
        $(this).addClass('active');
      });

      $(document).on('click', '.config-tab-btn', function () {
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

      $(document).on('click', '.layout-option', function () {
        var layout = $(this).data('layout');
        self.previewLayout(layout);
        $('.layout-option').removeClass('active');
        $(this).addClass('active');
      });

      $(document).on('change', '#tabsToggle', function () {
        self.previewTabsVisible($(this).prop('checked'));
      });

      $(document).on('change', '#breadcrumbToggle', function () {
        self.previewBreadcrumbVisible($(this).prop('checked'));
      });

      $(document).on('change', '#rememberTabsToggle', function () {
        self.previewRememberTabs($(this).prop('checked'));
      });

      $(document).on('change', '#accordionToggle', function () {
        self.previewAccordion($(this).prop('checked'));
      });

      $(document).on('change', '#watermarkToggle', function () {
        self.previewWatermark($(this).prop('checked'));
      });

      form.on('select(pageAnimation)', function (data) {
        self.previewPageAnimation(data.value);
      });

      $(document).on('change', '#densityToggle', function () {
        self.previewDensity($(this).prop('checked') ? 'compact' : 'comfortable');
      });

      $(document).on('input', '#sidebarWidthInput', function () {
        var val = parseInt($(this).val(), 10) || 210;
        self.previewSidebarWidth(val);
      });

      $(document).on('input', '#submenuWidthInput', function () {
        var val = parseInt($(this).val(), 10) || 180;
        self.previewSubmenuWidth(val);
      });

      $(document).on('input', '#submenuFixedWidthInput', function () {
        var val = parseInt($(this).val(), 10) || 180;
        self.previewSubmenuFixedWidth(val);
      });

      $(document).on('click', '.sidebar-width-preset', function () {
        var width = parseInt($(this).data('width'), 10);
        var $input = $(this).closest('.sidebar-width-controls').find('input[type="number"]');
        $input.val(width);
        if ($input.attr('id') === 'sidebarWidthInput') {
          self.previewSidebarWidth(width);
        } else if ($input.attr('id') === 'submenuWidthInput') {
          self.previewSubmenuWidth(width);
        } else if ($input.attr('id') === 'submenuFixedWidthInput') {
          self.previewSubmenuFixedWidth(width);
        }
      });

      // 字体大小
      $(document).on('input', '#fontSizeInput', function () {
        var val = parseInt($(this).val(), 10) || 14;
        if (val < 12) val = 12;
        if (val > 20) val = 20;
        self.previewFontSize(val);
        // 更新预设按钮状态
        $(this).closest('.sidebar-width-controls').find('.sidebar-width-preset').removeClass('active');
        var matched = $(this).closest('.sidebar-width-controls').find('.sidebar-width-preset[data-size="' + val + '"]');
        if (matched.length) matched.addClass('active');
      });

      // 字体大小预设按钮
      $(document).on('click', '.sidebar-width-preset[data-size]', function () {
        var size = parseInt($(this).data('size'), 10);
        $('#fontSizeInput').val(size);
        self.previewFontSize(size);
        $(this).closest('.sidebar-width-controls').find('.sidebar-width-preset').removeClass('active');
        $(this).addClass('active');
      });

      // 圆角大小
      $(document).on('input', '#borderRadiusInput', function () {
        var val = parseInt($(this).val(), 10) || 8;
        if (val < 4) val = 4;
        if (val > 20) val = 20;
        self.previewBorderRadius(val);
        // 更新预设按钮状态
        $(this).closest('.sidebar-width-controls').find('.sidebar-width-preset').removeClass('active');
        var matched = $(this).closest('.sidebar-width-controls').find('.sidebar-width-preset[data-radius="' + val + '"]');
        if (matched.length) matched.addClass('active');
      });

      // 圆角大小预设按钮
      $(document).on('click', '.sidebar-width-preset[data-radius]', function () {
        var radius = parseInt($(this).data('radius'), 10);
        $('#borderRadiusInput').val(radius);
        self.previewBorderRadius(radius);
        $(this).closest('.sidebar-width-controls').find('.sidebar-width-preset').removeClass('active');
        $(this).addClass('active');
      });
    },

    saveConfig: function () {
      this.save();
      this.hideConfigPanel();
      layer.msg('主题配置已保存，正在刷新页面...', { icon: 1, time: 1000 }, function () {
        location.reload();
      });
    },

    resetConfig: function () {
      this.reset();
      var profile = this.getProfile();
      if (profile.defaultConfig) {
        this._applyDefaultConfig(profile.defaultConfig);
        this.saveState();
      }
      this.hideConfigPanel();
      layer.msg('主题已重置，正在刷新页面...', { icon: 1, time: 1000 }, function () {
        location.reload();
      });
    },

    previewMode: function (mode, event) {
      this.tempState.mode = mode;
      this.applyModeWithTransition(mode, event);
      if (this.tempState.watermarkEnabled) {
        this.applyWatermark(true, this.tempState.watermarkText);
      }
    },

    previewScheme: function (schemeId) {
      this.tempState.scheme = schemeId;
      this.tempState.colorMode = 'scheme';
      this.applyScheme(schemeId);
    },

    previewColor: function (color) {
      this.tempState.color = color;
      this.tempState.colorMode = 'classic';
      this.applyColor(color);
    },

    previewCustomColors: function () {
      this.tempState.colorMode = 'custom';
      this.applyCustomColors(this.tempState.customColors);
    },

    previewLayout: function (layout) {
      this.tempState.layout = layout;
      this.applyLayout(layout);
      this._updateWidthConfigVisibility(layout);

      var sidebarComp = window.layui && window.layui.sidebarComp;
      var routerModule = window.layui && window.layui.routerModule;
      if (!sidebarComp || !routerModule) return;

      sidebarComp.hideSubmenuPanel();
      sidebarComp.hideDropdownMenu();
      sidebarComp.updateTopbarMenu();

      var currentId = routerModule.getCurrentId();
      if (currentId !== null && currentId !== undefined) {
        sidebarComp.setActive(currentId, { layout: layout });
      }
    },

    _updateWidthConfigVisibility: function (layout) {
      $('.layout-config-item').each(function () {
        var layouts = $(this).data('layouts') || '';
        var allowed = layouts.split(',');
        $(this).toggle(allowed.indexOf(layout) !== -1);
      });

      // 字体大小和圆角配置项在所有布局下都可见
      $('#fontSizeConfigItem, #borderRadiusConfigItem').show();
    },

    previewTabsVisible: function (visible) {
      this.tempState.tabsVisible = visible;
      this.applyTabsVisible(visible);
    },

    previewBreadcrumbVisible: function (visible) {
      this.tempState.breadcrumbVisible = visible;
      this.applyBreadcrumbVisible(visible);
      if (visible && window.layui && window.layui.sidebarComp) {
        window.layui.sidebarComp.renderBreadcrumb();
      }
    },

    previewRememberTabs: function (enabled) {
      this.tempState.rememberTabs = enabled;
    },

    previewAccordion: function (enabled) {
      this.tempState.accordion = enabled;
    },

    previewWatermark: function (enabled) {
      this.tempState.watermarkEnabled = enabled;
      this.applyWatermark(enabled, this.tempState.watermarkText);
    },

    previewDensity: function (density) {
      this.tempState.density = density;
      this.applyDensity(density);
    },

    previewSidebarWidth: function (width) {
      this.tempState.sidebarWidth = width;
      this.applySidebarWidth(width);
    },

    previewSubmenuWidth: function (width) {
      this.tempState.submenuWidth = width;
      this.applySubmenuWidth(width);
    },

    previewSubmenuFixedWidth: function (width) {
      this.tempState.submenuFixedWidth = width;
      this.applySubmenuFixedWidth(width);
    },

    previewFontSize: function (size) {
      this.tempState.fontSize = size;
      this.applyFontSize(size);
    },

    previewBorderRadius: function (radius) {
      this.tempState.borderRadius = radius;
      this.applyBorderRadius(radius);
    },

    previewPageAnimation: function (animation) {
      this.tempState.pageAnimation = animation;
    },

    save: function () {
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

    reset: function () {
      this.clearTabsState();
      this.state = $.extend(true, {}, this.defaultState);
      this.tempState = $.extend(true, {}, this.defaultState);
      this.saveState();
      this.applyTheme(this.state);
      this.emit('themeReset', this.state);
    },

    cancelPreview: function () {
      this.tempState = $.extend(true, {}, this.state);
      this.applyTheme(this.state);

      // 恢复侧边栏菜单状态
      var sidebarComp = window.layui && window.layui.sidebarComp;
      var routerModule = window.layui && window.layui.routerModule;
      if (sidebarComp && routerModule) {
        sidebarComp.hideSubmenuPanel();
        sidebarComp.hideDropdownMenu();
        sidebarComp.updateTopbarMenu();
        var currentId = routerModule.getCurrentId();
        if (currentId !== null && currentId !== undefined) {
          sidebarComp.setActive(currentId);
        }
      }
    },

    clearTabsState: function () {
      var storageKey = this._getStorageKey(appConfig.storage ? appConfig.storage.tabsKey : 'tabsState');
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {
        console.warn('Failed to clear tabs state', e);
      }
    },

    getState: function () {
      return $.extend(true, {}, this.state);
    },

    getTempState: function () {
      return $.extend(true, {}, this.tempState);
    },

    getPageAnimation: function () {
      return this.state.pageAnimation || 'fadeIn';
    },

    hexToRgb: function (hex) {
      hex = hex.replace('#', '');
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      var r = parseInt(hex.substring(0, 2), 16);
      var g = parseInt(hex.substring(2, 4), 16);
      var b = parseInt(hex.substring(4, 6), 16);
      return r + ',' + g + ',' + b;
    },

    _isColorTooDark: function (hex) {
      hex = (hex || '').replace('#', '');
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      if (hex.length !== 6) return false;
      var r = parseInt(hex.substring(0, 2), 16);
      var g = parseInt(hex.substring(2, 4), 16);
      var b = parseInt(hex.substring(4, 6), 16);
      var luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance < 0.15;
    },

    darken: function (hex, percent) {
      hex = hex.replace('#', '');
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      var r = parseInt(hex.substring(0, 2), 16);
      var g = parseInt(hex.substring(2, 4), 16);
      var b = parseInt(hex.substring(4, 6), 16);
      r = Math.max(0, Math.floor(r * (100 - percent) / 100));
      g = Math.max(0, Math.floor(g * (100 - percent) / 100));
      b = Math.max(0, Math.floor(b * (100 - percent) / 100));
      return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },

    lightenOrDarken: function (hex, amount) {
      hex = hex.replace('#', '');
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      var r = parseInt(hex.substring(0, 2), 16);
      var g = parseInt(hex.substring(2, 4), 16);
      var b = parseInt(hex.substring(4, 6), 16);
      r = Math.min(255, Math.max(0, r + amount));
      g = Math.min(255, Math.max(0, g + amount));
      b = Math.min(255, Math.max(0, b + amount));
      return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },

    getProfile: function () {
      var role = this._currentRole || 'admin';
      var rolesTheme = (window.OSLAY && window.OSLAY.rolesTheme) || null;
      var profiles = (rolesTheme && rolesTheme.roles) || null;
      return (profiles && profiles[role]) || this._getDefaultProfile();
    },

    shouldShowPanel: function () {
      return this.getProfile().showPanel !== false;
    },

    hasPermission: function (action) {
      var p = this.getProfile();
      switch (action) {
        case 'changeMode': return p.canChangeMode !== false;
        case 'changeScheme': return p.canChangeScheme !== false;
        case 'changeColor': return p.canChangeColor !== false;
        case 'changeLayout': return p.canChangeLayout !== false;
        case 'toggleTabs': return p.canToggleTabs !== false;
        case 'toggleBreadcrumb': return p.canToggleBreadcrumb !== false;
        case 'toggleAccordion': return p.canToggleAccordion !== false;
        case 'toggleWatermark': return p.canToggleWatermark !== false;
        case 'changeAnimation': return p.canChangeAnimation !== false;
        case 'changeDensity': return p.canChangeDensity !== false;
        case 'changeSidebarWidth': return p.canChangeSidebarWidth !== false;
        case 'changeFontSize': return p.canChangeFontSize !== false;
        case 'changeBorderRadius': return p.canChangeBorderRadius !== false;
        default: return true;
      }
    },

    isSchemeAllowed: function (schemeId) {
      var p = this.getProfile();
      var allowed = p.allowedSchemes || [];
      if (allowed.indexOf('*') !== -1) return true;
      return allowed.indexOf(schemeId) !== -1;
    },

    isLayoutAllowed: function (layout) {
      var p = this.getProfile();
      var allowed = p.allowedLayouts || [];
      if (allowed.indexOf('*') !== -1) return true;
      if (allowed.length === 0) return true;
      return allowed.indexOf(layout) !== -1;
    },

    _getAllowedDefaultLayout: function () {
      var p = this.getProfile();
      var allowed = p.allowedLayouts || ['*'];
      if (allowed.indexOf('*') !== -1) {
        return appConfig.theme && appConfig.theme.defaultLayout ? appConfig.theme.defaultLayout : 'double';
      }
      if (allowed.length > 0) {
        return allowed[0];
      }
      return 'double';
    },

    setRole: function (role) {
      this._currentRole = role;

      try { localStorage.setItem('osadmin_global_role', role); } catch (e) { }

      var profile = this.getProfile();

      var storageKey = this._getStorageKey(appConfig.storage ? appConfig.storage.themeKey : 'themeConfig');
      var hasIsolatedData = false;
      try { hasIsolatedData = !!localStorage.getItem(storageKey); } catch (e) { }

      if (!hasIsolatedData && profile.defaultConfig) {
        this._applyDefaultConfig(profile.defaultConfig);
      } else {
        this._restoreFromIsolatedStorage();
      }

      var currentLayout = this.state.layout || 'double';
      if (!this.isLayoutAllowed(currentLayout)) {
        console.warn('[Theme] Layout not allowed for role', role, ':', currentLayout, ', forcing to default');
        this.state.layout = this._getAllowedDefaultLayout();
        this.applyLayout(this.state.layout);
      }

      this._updateThemeButtonUI();
    },

    toggleMode: function (event) {
      if (!this.hasPermission('changeMode')) return;
      var current = this.state.mode;
      var newMode = current === 'dark' ? 'light' : 'dark';
      this.state.mode = newMode;
      this.applyModeWithTransition(newMode, event, function () { Theme.applyTheme(Theme.state); });
      this.saveState();
      this._updateThemeButtonUI();
    },

    _getDefaultProfile: function () {
      return {
        label: '默认',
        showPanel: true,
        canChangeMode: true,
        canChangeScheme: true,
        canChangeColor: true,
        canChangeLayout: true,
        canToggleTabs: true,
        canToggleBreadcrumb: true,
        canToggleAccordion: true,
        canToggleWatermark: true,
        canChangeAnimation: true,
        canChangeDensity: true,
        canChangeSidebarWidth: true,
        canChangeFontSize: true,
        canChangeBorderRadius: true,
        allowedSchemes: ['*'],
        allowedColors: ['*'],
        allowedLayouts: ['*'],
        defaultConfig: null
      };
    },

    _getStorageKey: function (baseKey) {
      return 'osadmin_' + (this._currentRole || 'default') + '_' + baseKey;
    },

    _restoreFromIsolatedStorage: function () {
      var storageKey = this._getStorageKey(appConfig.storage ? appConfig.storage.themeKey : 'themeConfig');
      var raw;
      try { raw = localStorage.getItem(storageKey); } catch (e) { }
      if (!raw) return;

      try {
        var saved = JSON.parse(raw);
        if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
          this.state = $.extend({}, this.defaultState, saved);
          this.applyTheme(this.state);
        }
      } catch (e) { }
    },

    _applyDefaultConfig: function (config) {
      if (!config) return;

      if (config.scheme) {
        this.state.scheme = config.scheme;
      }
      if (config.mode) {
        this.state.mode = config.mode;
      }

      if (config.accent) {
        if (!this.state.customColors) this.state.customColors = {};
        this.state.customColors.accent = config.accent;
      }
      if (config.sidebarBg || config.sidebarText || config.contentBg || config.topbarBg || config.tabsBg) {
        if (!this.state.customColors) this.state.customColors = {};
        if (config.sidebarBg) this.state.customColors.sidebarBg = config.sidebarBg;
        if (config.sidebarText) this.state.customColors.sidebarText = config.sidebarText;
        if (config.contentBg) this.state.customColors.contentBg = config.contentBg;
        if (config.topbarBg) this.state.customColors.topbarBg = config.topbarBg;
        if (config.tabsBg) this.state.customColors.tabsBg = config.tabsBg;
        this.state.colorMode = 'custom';
      } else if (config.scheme) {
        this.state.colorMode = 'scheme';
      }

      if (config.density) {
        this.state.density = config.density;
      }
      if (config.sidebarWidth) {
        this.state.sidebarWidth = config.sidebarWidth;
      }

      if (config.layout) {
        this.state.layout = config.layout;
      }

      this.applyTheme(this.state);
    },

    _applyPermissionsToPanel: function () {
      var self = this;

      $('.config-section[data-permission]').each(function () {
        var permissions = ($(this).attr('data-permission') || '').split(/\s+/);
        var allowed = false;
        for (var i = 0; i < permissions.length; i++) {
          if (self.hasPermission(permissions[i])) { allowed = true; break; }
        }
        $(this).toggle(allowed);
      });

      $('.config-item[data-permission]').each(function () {
        var permission = $(this).attr('data-permission');
        $(this).toggle(self.hasPermission(permission));
      });

      $('.config-tab-btn[data-tab="scheme"]').toggle(this.hasPermission('changeScheme'));
      $('.config-tab-btn[data-tab="classic"], .config-tab-btn[data-tab="custom"]').toggle(this.hasPermission('changeColor'));

      var profile = this.getProfile();
      var allowedSchemes = profile.allowedSchemes || [];
      if (allowedSchemes.indexOf('*') === -1) {
        $('.scheme-option').each(function () {
          $(this).toggle(allowedSchemes.indexOf($(this).data('scheme')) !== -1);
        });
      }

      var allowedLayouts = profile.allowedLayouts || [];
      if (allowedLayouts.indexOf('*') === -1) {
        $('.layout-option').each(function () {
          $(this).toggle(allowedLayouts.indexOf($(this).data('layout')) !== -1);
        });
      }

      var allowedColors = profile.allowedColors || [];
      if (allowedColors.indexOf('*') === -1) {
        $('.color-option').each(function () {
          $(this).toggle(allowedColors.indexOf($(this).data('color')) !== -1);
        });
      }
    },

    _updateThemeButtonUI: function () {
      var btn = document.getElementById('themeBtn');
      if (!btn) return;

      var oldHandler = btn._themeClickHandler;
      if (oldHandler) {
        btn.removeEventListener('click', oldHandler);
        btn._themeClickHandler = null;
      }

      var profile = this.getProfile();

      if (this.shouldShowPanel()) {
        btn.innerHTML = '<i class="layui-icon layui-icon-set"></i>';
        btn.setAttribute('title', '主题配置');
        btn.setAttribute('aria-label', '主题配置');
        btn.className = 'layui-topbar-btn';
        btn.style.cursor = '';
        btn.style.opacity = '';

        var handler = function (e) { e.stopPropagation(); Theme.toggleConfigPanel(); };
        btn._themeClickHandler = handler;
        btn.addEventListener('click', handler);
      } else {
        var mode = this.state.mode;
        var isDark = mode === 'dark';
        var enabled = this.hasPermission('changeMode');

        var toggleTitle = enabled
          ? (isDark ? '切换到亮色模式' : '切换到暗色模式')
          : '主题已由管理员设置';

        var targetIcon = isDark ? 'layui-icon-light' : 'layui-icon-moon';

        btn.setAttribute('title', toggleTitle);
        btn.setAttribute('aria-label', toggleTitle);
        btn.className = 'layui-topbar-btn layui-topbar-mode-toggle' + (enabled ? '' : ' disabled');
        btn.innerHTML = '<i class="layui-icon ' + targetIcon + '"></i>';

        if (enabled) {
          btn.style.cursor = '';
          btn.style.opacity = '';
          var handler = function (e) {
            e.stopPropagation();
            Theme.toggleMode(e);
          };
          btn._themeClickHandler = handler;
          btn.addEventListener('click', handler);
        } else {
          btn._themeClickHandler = null;
          btn.style.cursor = 'not-allowed';
          btn.style.opacity = '0.5';
        }
      }
    },

    on: function (event, callback) {
      this._events[event] = this._events[event] || [];
      this._events[event].push(callback);
    },

    emit: function (event) {
      var args = Array.prototype.slice.call(arguments, 1);
      var callbacks = this._events[event];
      if (callbacks) {
        callbacks.forEach(function (callback) {
          callback.apply(null, args);
        });
      }
    }
  };

  exports('themeModule', Theme);
});