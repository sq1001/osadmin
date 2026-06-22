/**
 * Toast 消息提示模块
 * 支持多位置、自动关闭、手动关闭、最大数量限制、堆叠/替换模式、消散动画等功能
 */
layui.define(['jquery'], function(exports) {
  'use strict';

  var MOD_NAME = 'toastMod';
  var $ = layui.jquery;

  var Toast = {
    containers: {},
    toasts: [],
    index: 0,
    initialized: false,

    icons: {
      info: '<i class="layui-icon layui-icon-tips layui-font-blue"></i>',
      success: '<i class="layui-icon layui-icon-success layui-font-green"></i>',
      error: '<i class="layui-icon layui-icon-error layui-font-red"></i>',
      warning: '<i class="layui-icon layui-icon-tips layui-font-orange"></i>',
      loading: '<i class="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop layui-font-blue"></i>'
    },

    positions: ['rt', 'rb', 'lt', 'lb', 'tc', 'bc', 'lc', 'rc'],

    defaults: {
      title: '',
      icon: '',
      skin: '',
      time: 3000,
      offset: 'rt',
      className: '',
      closable: false,
      maxCount: 5,
      mode: 'stack',
      dismissEffect: true,
      dismissDuration: 400,
      success: function() {},
      cancel: function() { return true; }
    },

    init: function() {
      if (this.initialized) return;

      var self = this;
      this.positions.forEach(function(pos) {
        self.createContainer(pos);
      });

      $(document).on('click', '.toast-close', function() {
        var id = $(this).closest('.toast-box').attr('id');
        self.dismiss(id);
      });

      this.initialized = true;
    },

    createContainer: function(position) {
      if (this.containers[position]) return;

      var css = {
        'position': 'fixed',
        'display': 'flex',
        'flex-wrap': 'nowrap',
        'gap': '10px',
        'z-index': 9999
      };

      switch (position) {
        case 'rt':
          css.right = '10px';
          css.top = '10px';
          css['flex-direction'] = 'column';
          break;
        case 'rb':
          css.right = '10px';
          css.bottom = '10px';
          css['flex-direction'] = 'column-reverse';
          break;
        case 'lt':
          css.left = '10px';
          css.top = '10px';
          css['flex-direction'] = 'column';
          break;
        case 'lb':
          css.left = '10px';
          css.bottom = '10px';
          css['flex-direction'] = 'column-reverse';
          break;
        case 'tc':
          css.top = '10px';
          css.left = '50%';
          css.transform = 'translateX(-50%)';
          css['flex-direction'] = 'column';
          css['align-items'] = 'center';
          break;
        case 'bc':
          css.bottom = '10px';
          css.left = '50%';
          css.transform = 'translateX(-50%)';
          css['flex-direction'] = 'column-reverse';
          css['align-items'] = 'center';
          break;
        case 'lc':
          css.left = '10px';
          css.top = '50%';
          css.transform = 'translateY(-50%)';
          css['flex-direction'] = 'column';
          break;
        case 'rc':
          css.right = '10px';
          css.top = '50%';
          css.transform = 'translateY(-50%)';
          css['flex-direction'] = 'column';
          break;
      }

      var $container = $('<div class="toast ' + position + '"></div>').css(css);
      $('body').append($container);
      this.containers[position] = $container;
    },

    show: function(content, options) {
      this.init();

      var id = 'toast-' + (++this.index);
      var opts = $.extend({}, this.defaults, options);

      var type = '';
      if (typeof opts.icon === 'string' && this.icons[opts.icon]) {
        type = opts.icon;
        opts.icon = this.icons[opts.icon];
      }

      if (opts.skin) {
        if (typeof opts.skin === 'string') {
          opts.className = (opts.className ? opts.className + ' ' : '') + 'toast-skin-' + opts.skin;
        } else if (typeof opts.skin === 'object') {
          opts.skinStyle = opts.skin;
        }
      }

      if (opts.mode === 'replace') {
        this.closeByPosition(opts.offset, true);
      } else if (opts.mode === 'stack' && opts.maxCount > 0) {
        this.enforceMaxCount(opts.offset, opts.maxCount);
      }

      var $box = this.createToastBox(id, content, opts);
      this.containers[opts.offset].append($box);

      var toastData = {
        id: id,
        element: $box,
        options: opts,
        type: type,
        timer: null
      };

      this.toasts.push(toastData);

      if (opts.time > 0) {
        var self = this;
        toastData.timer = setTimeout(function() {
          self.dismiss(id);
        }, opts.time);
      }

      opts.success(id, $box);

      return id;
    },

    createToastBox: function(id, content, opts) {
      var closeBtn = opts.closable 
        ? '<div class="toast-close"><i class="layui-icon layui-icon-close"></i></div>' 
        : '';

      var iconHtml = opts.icon 
        ? '<div class="toast-icon">' + opts.icon + '</div>' 
        : '';

      var groupClass = 'toast-group' + (opts.title ? '' : ' toast-group-plain');
      var titleHtml = opts.title 
        ? '<div class="toast-title">' + opts.title + '</div>' 
        : '';

      var $box = $('<div class="toast-box toast-entering ' + opts.className + '" id="' + id + '">' +
        iconHtml +
        '<div class="' + groupClass + '">' +
          titleHtml +
          '<div class="toast-content">' + content + '</div>' +
        '</div>' +
        closeBtn +
      '</div>');

      var self = this;
      setTimeout(function() {
        $box.removeClass('toast-entering');
      }, 400);

      // 应用自定义皮肤样式
      if (opts.skinStyle) {
        var styles = [];
        var s = opts.skinStyle;
        if (s.borderColor) styles.push('border-color:' + s.borderColor);
        if (s.borderLeft) styles.push('border-left:' + s.borderLeft);
        if (s.background) styles.push('background:' + s.background);
        if (s.color) styles.push('color:' + s.color);
        if (s.boxShadow) styles.push('box-shadow:' + s.boxShadow);
        if (s.iconColor) $box.find('.toast-icon').css('color', s.iconColor);
        if (s.titleColor) $box.find('.toast-title').css('color', s.titleColor);
        if (s.contentColor) $box.find('.toast-content').css('color', s.contentColor);
        if (styles.length) $box.css('cssText', styles.join(';'));
      }

      return $box;
    },

    enforceMaxCount: function(position, maxCount) {
      var positionToasts = this.toasts.filter(function(t) {
        return t.options.offset === position;
      });

      var removeCount = positionToasts.length - maxCount + 1;

      if (removeCount > 0) {
        for (var i = 0; i < removeCount; i++) {
          this.dismiss(positionToasts[i].id);
        }
      }
    },

    closeByPosition: function(position, animated) {
      var self = this;
      
      this.toasts.forEach(function(toast) {
        if (toast.options.offset === position) {
          if (animated) {
            self.dismiss(toast.id);
          } else {
            self.close(toast.id);
          }
        }
      });
    },

    findToast: function(id) {
      for (var i = 0; i < this.toasts.length; i++) {
        if (this.toasts[i].id === id) {
          return { toast: this.toasts[i], index: i };
        }
      }
      return null;
    },

    removeToast: function(id) {
      for (var i = 0; i < this.toasts.length; i++) {
        if (this.toasts[i].id === id) {
          this.toasts.splice(i, 1);
          return true;
        }
      }
      return false;
    },

    dismiss: function(id, skipCancel) {
      var result = this.findToast(id);
      if (!result) return;

      var toast = result.toast;
      var $box = toast.element;
      var opts = toast.options;

      if (toast.timer) {
        clearTimeout(toast.timer);
        toast.timer = null;
      }

      if (!skipCancel) {
        var cancel = opts.cancel(id, $box);
        if (cancel === false) return;
      }

      this.removeToast(id);
      this.animateDismiss($box, opts);
    },

    animateDismiss: function($box, opts) {
      if (opts.dismissEffect) {
        $box.css({
          'opacity': '0',
          'transform': 'scale(0.9) translateY(-10px)'
        });

        setTimeout(function() {
          $box.css({
            'height': '0',
            'min-height': '0',
            'margin-top': '0',
            'margin-bottom': '0',
            'padding-top': '0',
            'padding-bottom': '0',
            'border-width': '0'
          });
        }, opts.dismissDuration * 0.6);

        setTimeout(function() {
          $box.remove();
        }, opts.dismissDuration);
      } else {
        $box.remove();
      }
    },

    close: function(id) {
      if (id === 'all') {
        var self = this;
        var allToasts = this.toasts.slice();
        allToasts.forEach(function(toast) {
          self.dismiss(toast.id, true);
        });
        return;
      }
      this.dismiss(id, true);
    },

    success: function(content, options) {
      return this.show(content, $.extend({ icon: 'success', title: '成功' }, options));
    },

    error: function(content, options) {
      return this.show(content, $.extend({ icon: 'error', title: '错误' }, options));
    },

    warning: function(content, options) {
      return this.show(content, $.extend({ icon: 'warning', title: '警告' }, options));
    },

    info: function(content, options) {
      return this.show(content, $.extend({ icon: 'info', title: '信息' }, options));
    },

    loading: function(content, options) {
      return this.show(content, $.extend({ 
        icon: 'loading', 
        title: '加载中',
        time: 0,
        closable: false
      }, options));
    },

    clear: function() {
      this.close('all');
    },

    closeLoading: function(id) {
      if (id) {
        this.dismiss(id, true);
        return;
      }
      var self = this;
      var loadingToasts = this.toasts.filter(function(t) {
        return t.type === 'loading';
      });
      loadingToasts.forEach(function(t) {
        self.dismiss(t.id, true);
      });
    },

    dismissAll: function() {
      var self = this;
      var allToasts = this.toasts.slice();
      allToasts.forEach(function(toast) {
        self.dismiss(toast.id);
      });
    }
  };

  exports(MOD_NAME, Toast);
});
