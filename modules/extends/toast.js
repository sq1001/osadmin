/**
 * Toast 消息提示模块
 * 支持多位置、自动关闭、手动关闭等功能
 */
layui.define(['jquery'], function(exports) {
  'use strict';

  var $ = layui.jquery;

  var Toast = {
    containers: {},
    toasts: [],
    index: 0,
    initialized: false,

    icons: {
      info: '<i class="layui-icon layui-icon-tips layui-font-orange"></i>',
      success: '<i class="layui-icon layui-icon-success layui-font-green"></i>',
      error: '<i class="layui-icon layui-icon-error layui-font-red"></i>',
      warning: '<i class="layui-icon layui-icon-question layui-font-blue"></i>',
      loading: '<i class="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop layui-font-blue"></i>'
    },

    positions: ['rt', 'rb', 'lt', 'lb', 'tc', 'bc', 'lc', 'rc'],

    defaults: {
      title: '提示',
      icon: '',
      time: 3000,
      offset: 'rt',
      className: '',
      closable: true,
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
        self.close(id);
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

      if (typeof opts.icon === 'string' && this.icons[opts.icon]) {
        opts.icon = this.icons[opts.icon];
      }

      var $box = this.createToastBox(id, content, opts);
      this.containers[opts.offset].append($box);

      var toastData = {
        id: id,
        element: $box,
        options: opts,
        timer: null
      };

      this.toasts.push(toastData);

      if (opts.time > 0) {
        var self = this;
        toastData.timer = setTimeout(function() {
          self.close(id);
        }, opts.time);
      }

      opts.success(id, $box);

      return id;
    },

    createToastBox: function(id, content, opts) {
      var closeBtn = opts.closable 
        ? '<div class="toast-close"><i class="layui-icon layui-icon-close"></i></div>' 
        : '';

      var $box = $('<div class="toast-box ' + opts.className + '" id="' + id + '">' +
        '<div class="toast-icon">' + opts.icon + '</div>' +
        '<div class="toast-group">' +
          '<div class="toast-title">' + opts.title + '</div>' +
          '<div class="toast-content">' + content + '</div>' +
        '</div>' +
        closeBtn +
      '</div>');

      return $box;
    },

    close: function(id) {
      var self = this;

      if (id === 'all') {
        this.toasts.forEach(function(toast) {
          self.animateClose(toast);
        });
        this.toasts = [];
        return;
      }

      var toastIndex = -1;
      for (var i = 0; i < this.toasts.length; i++) {
        if (this.toasts[i].id === id) {
          toastIndex = i;
          break;
        }
      }

      if (toastIndex === -1) return;

      var toast = this.toasts[toastIndex];
      this.animateClose(toast);
      this.toasts.splice(toastIndex, 1);
    },

    animateClose: function(toast) {
      var $box = toast.element;
      var offset = toast.options.offset;

      if (toast.timer) {
        clearTimeout(toast.timer);
      }

      var cancel = toast.options.cancel(toast.id, $box);
      if (cancel === false) return;

      $box.css('opacity', '0').css('transform', 'scale(0.8)');
      setTimeout(function() {
        $box.remove();
      }, 300);
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
    }
  };

  exports('toastMod', Toast);
});
