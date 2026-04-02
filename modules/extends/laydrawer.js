/**
 * LayDrawer 抽屉弹层模块
 * 基于 drawer 模块，接入 layer 配置支持
 * 保持 drawer 的核心效果，支持 layer 所有配置项
 */
layui.define(['layer', 'jquery'], function(exports) {
  'use strict';

  var layer = layui.layer;
  var $ = layui.jquery;

  var drawerIndex = 0;
  var instances = {};
  var escHandler = null;

  var LayDrawer = {
    version: '2.0.0',

    defaults: {
      container: 'body',
      placement: 'right',
      width: 400,
      height: 300,
      title: '抽屉',
      content: '',
      type: 1,
      shade: 0.3,
      shadeClose: true,
      closeBtn: 1,
      zIndex: 19891014,
      fixed: false,
      btn: null,
      yes: null,
      btn2: null,
      btn3: null,
      cancel: null,
      end: null,
      success: null,
      skin: '',
      id: '',
      move: false,
      maxmin: false,
      time: 0,
      lockScroll: false,
      resizable: false,
      minWidth: 200,
      minHeight: 150,
      maxWidth: 800,
      maxHeight: 600
    },

    open: function(options) {
      var opts = $.extend({}, this.defaults, options);
      var $container = $(opts.container);

      if (!$container.length) {
        $container = $('body');
      }

      if ($container.css('position') === 'static') {
        $container.css('position', 'relative');
      }

      drawerIndex++;
      var id = opts.id || ('laydrawer-' + drawerIndex);
      var index = drawerIndex;

      var placement = opts.placement || 'right';
      var drawerW = parseInt(opts.width) || 400;
      var drawerH = parseInt(opts.height) || 300;

      // 保存原始滚动状态（用于锁定背景）
      var originalOverflow = null;
      var originalOverflowX = null;
      var originalOverflowY = null;
      if (opts.lockScroll) {
        originalOverflow = $container.css('overflow');
        originalOverflowX = $container.css('overflow-x');
        originalOverflowY = $container.css('overflow-y');
        $container.css({
          overflow: 'hidden',
          overflowX: 'hidden',
          overflowY: 'hidden'
        });
      }

      // 获取容器在视口中的位置
      function getContainerRect() {
        if ($container[0] === document.body) {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight
          };
        }
        return $container[0].getBoundingClientRect();
      }

      var containerRect = getContainerRect();

      var $wrapper = $('<div class="drawer-wrapper"></div>').attr('id', id);
      
      // 对于所有非 fixed 模式的容器，使用 fixed 定位并添加到 body 中
      if (!opts.fixed && $container[0] !== document.body) {
        // 让 wrapper 的事件完全穿透，这样可以滚动容器
        $wrapper.css({
          position: 'fixed',
          top: containerRect.top,
          left: containerRect.left,
          width: containerRect.width,
          height: containerRect.height,
          zIndex: opts.zIndex + drawerIndex,
          overflow: 'hidden',
          pointerEvents: 'none'
        });
      } else {
        $wrapper.css({
          position: opts.fixed ? 'fixed' : 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: opts.zIndex + drawerIndex,
          overflow: 'hidden',
          pointerEvents: 'none'
        });
      }

      var $shade = $('<div class="drawer-shade"></div>').css({
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,' + (opts.shade !== undefined ? opts.shade : 0.3) + ')',
        pointerEvents: 'auto',
        opacity: 0,
        transition: 'opacity 0.3s'
      });
      
      // 如果没有 lockScroll，我们需要特殊处理：
      // 1. 让滚轮事件穿透到容器
      // 2. 但点击事件仍然可以关闭抽屉
      if (!opts.lockScroll && !opts.fixed && $container[0] !== document.body) {
        // 让 shade 先穿透所有事件
        $shade.css('pointerEvents', 'none');
        
        // 但我们手动监听 body 上的点击，来实现关闭抽屉
        function handleBodyClick(e) {
          // 检查点击是否在 shade 区域内，但不在 drawer 内
          var clickX = e.clientX;
          var clickY = e.clientY;
          
          var shadeRect = $shade[0].getBoundingClientRect();
          var drawerRect = $drawer[0].getBoundingClientRect();
          
          // 判断点击是否在 shade 范围内
          var inShade = clickX >= shadeRect.left && clickX <= shadeRect.right && 
                        clickY >= shadeRect.top && clickY <= shadeRect.bottom;
          
          // 判断点击是否在 drawer 范围内
          var inDrawer = clickX >= drawerRect.left && clickX <= drawerRect.right && 
                        clickY >= drawerRect.top && clickY <= drawerRect.bottom;
          
          if (inShade && !inDrawer && opts.shadeClose !== false) {
            close();
          }
        }
        
        // 等动画完成后再绑定点击事件
        setTimeout(function() {
          $(document).on('click.laydrawer-shade-' + id, handleBodyClick);
        }, 350);
      }

      var $drawer = $('<div class="drawer-content"></div>').addClass(opts.skin || '').css({
        position: 'absolute',
        backgroundColor: '#fff',
        boxShadow: '-2px 0 8px rgba(0,0,0,0.15)',
        pointerEvents: 'auto',
        transition: 'transform 0.3s ease, width 0.1s, height 0.1s'
      });

      // 头部按钮 HTML
      var headerBtns = '';
      if (opts.maxmin) {
        headerBtns += '<button type="button" class="drawer-minimize" style="background:none;border:none;cursor:pointer;font-size:14px;margin-right:8px;">&ndash;</button>';
        headerBtns += '<button type="button" class="drawer-maximize" style="background:none;border:none;cursor:pointer;font-size:14px;margin-right:8px;">☐</button>';
      }
      if (opts.closeBtn !== 0) {
        headerBtns += '<button type="button" class="drawer-close" style="background:none;border:none;cursor:pointer;font-size:16px;">&times;</button>';
      }

      var $header = $('<div class="drawer-header" style="padding:16px 24px;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center;cursor:move;"></div>')
        .html('<span style="font-size:16px;font-weight:500;">' + (opts.title || '抽屉') + '</span><div class="drawer-header-btns" style="display:flex;align-items:center;">' + headerBtns + '</div>');

      var $body = $('<div class="drawer-body"></div>');

      if (opts.type === 2 && typeof opts.content === 'string' && (opts.content.indexOf('http') === 0 || opts.content.indexOf('/') === 0)) {
        $body.css({ padding: 0, overflow: 'hidden' });
        var $iframe = $('<iframe></iframe>').attr({
          src: opts.content,
          frameborder: 0,
          allowtransparency: true
        }).css({
          width: '100%',
          height: '100%',
          border: 'none'
        });
        $body.append($iframe);
      } else {
        $body.css({ padding: '24px', overflow: 'auto' }).html(opts.content || '');
      }

      var $footer = null;
      if (opts.btn && opts.btn.length) {
        var footerHtml = '<div class="drawer-footer" style="padding:16px 24px;border-top:1px solid #f0f0f0;text-align:right;">';
        if (opts.btnAlign) {
          footerHtml = '<div class="drawer-footer" style="padding:16px 24px;border-top:1px solid #f0f0f0;text-align:' + opts.btnAlign + ';">';
        }
        opts.btn.forEach(function(text, i) {
          var btnClass = i === 0 ? 'layui-btn' : 'layui-btn layui-btn-primary';
          footerHtml += '<button class="' + btnClass + '" style="margin-left:8px;">' + text + '</button>';
        });
        footerHtml += '</div>';
        $footer = $(footerHtml);
      }

      $drawer.append($header).append($body);
      if ($footer) {
        $drawer.append($footer);
      }

      // 可调整大小的手柄
      if (opts.resizable) {
        var $resizeHandle = $('<div class="drawer-resize-handle" style="position:absolute;z-index:10;cursor:se-resize;"></div>');
        
        if (placement === 'right' || placement === 'left') {
          $resizeHandle.css({
            top: 0,
            [placement === 'right' ? 'left' : 'right']: 0,
            width: '8px',
            height: '100%',
            cursor: placement === 'right' ? 'w-resize' : 'e-resize'
          });
        } else {
          $resizeHandle.css({
            [placement === 'top' ? 'bottom' : 'top']: 0,
            left: 0,
            width: '100%',
            height: '8px',
            cursor: placement === 'top' ? 's-resize' : 'n-resize'
          });
        }
        $drawer.append($resizeHandle);
      }

      $wrapper.append($shade).append($drawer);

      // 添加到 DOM
      if (!opts.fixed && $container[0] !== document.body) {
        $('body').append($wrapper);
      } else if (opts.fixed) {
        $('body').append($wrapper);
      } else {
        $container.append($wrapper);
      }

      var transformInit, transformTarget;
      switch (placement) {
        case 'right':
          $drawer.css({ top: 0, right: 0, bottom: 0, width: drawerW });
          transformInit = 'translateX(100%)';
          transformTarget = 'translateX(0)';
          break;
        case 'left':
          $drawer.css({ top: 0, left: 0, bottom: 0, width: drawerW });
          transformInit = 'translateX(-100%)';
          transformTarget = 'translateX(0)';
          break;
        case 'top':
          $drawer.css({ top: 0, left: 0, right: 0, height: drawerH });
          transformInit = 'translateY(-100%)';
          transformTarget = 'translateY(0)';
          break;
        case 'bottom':
          $drawer.css({ bottom: 0, left: 0, right: 0, height: drawerH });
          transformInit = 'translateY(100%)';
          transformTarget = 'translateY(0)';
          break;
      }

      $drawer.css('transform', transformInit);

      requestAnimationFrame(function() {
        $shade.css('opacity', 1);
        $drawer.css('transform', transformTarget);
      });

      var closed = false;
      var minimized = false;
      var maximized = false;

      function close() {
        if (closed) return;
        closed = true;

        $shade.css('opacity', 0);
        $drawer.css('transform', transformInit);
        setTimeout(function() {
          $wrapper.remove();
          delete instances[id];
          
          // 移除窗口 resize 和 scroll 监听
          if (!opts.fixed && $container[0] !== document.body) {
            $(window).off('resize.laydrawer-' + id);
            $(window).off('scroll.laydrawer-' + id);
            // 移除手动添加的点击监听
            $(document).off('click.laydrawer-shade-' + id);
          }
          // 移除拖动事件监听
          $(document).off('mousemove.laydrawer-drag-' + id);
          $(document).off('mouseup.laydrawer-drag-' + id);
          
          // 恢复背景滚动
          if (opts.lockScroll && originalOverflow !== null) {
            $container.css({
              overflow: originalOverflow,
              overflowX: originalOverflowX,
              overflowY: originalOverflowY
            });
          }
          
          // 如果没有抽屉了，移除 ESC 监听
          if (Object.keys(instances).length === 0 && escHandler) {
            $(document).off('keydown', escHandler);
            escHandler = null;
          }
          
          if (opts.end) opts.end(index);
        }, 300);
      }

      function minimize() {
        if (minimized) {
          // 还原
          var restorePos = $drawer.data('restorePos');
          $drawer.css({
            width: restorePos.width,
            height: restorePos.height,
            top: restorePos.top,
            left: restorePos.left,
            right: restorePos.right,
            bottom: restorePos.bottom,
            transform: restorePos.transform
          });
          $body.show();
          $header.find('.drawer-minimize').show();
          minimized = false;
        } else {
          // 保存当前位置和大小
          $drawer.data('restorePos', {
            width: $drawer.width(),
            height: $drawer.height(),
            top: $drawer.css('top'),
            left: $drawer.css('left'),
            right: $drawer.css('right'),
            bottom: $drawer.css('bottom'),
            transform: $drawer.css('transform')
          });
          
          // 最小化 - 模拟layer的最小化效果
          $body.hide();
          $drawer.css({
            width: '180px',
            height: $header.outerHeight() + 'px',
            top: 'auto',
            left: 'auto',
            right: 0,
            bottom: 0,
            transform: 'none'
          });
          $header.find('.drawer-minimize').hide();
          minimized = true;
        }
      }

      function maximize() {
        if (maximized) {
          // 还原
          var restorePos = $drawer.data('restorePos');
          $drawer.css({
            width: restorePos.width,
            height: restorePos.height,
            top: restorePos.top,
            left: restorePos.left,
            right: restorePos.right,
            bottom: restorePos.bottom
          });
          maximized = false;
        } else {
          // 保存当前位置和大小
          $drawer.data('restorePos', {
            width: $drawer.width(),
            height: $drawer.height(),
            top: $drawer.css('top'),
            left: $drawer.css('left'),
            right: $drawer.css('right'),
            bottom: $drawer.css('bottom')
          });
          
          // 最大化
          $drawer.css({
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          });
          maximized = true;
        }
      }

      $shade.on('click', function() {
        if (opts.shadeClose !== false) close();
      });

      if (opts.closeBtn !== 0) {
        $header.find('.drawer-close').on('click', function() {
          if (opts.cancel) {
            var ret = opts.cancel(index, $drawer);
            if (ret !== false) close();
          } else {
            close();
          }
        });
      }

      if (opts.maxmin) {
        $header.find('.drawer-minimize').on('click', function(e) {
          e.stopPropagation();
          e.preventDefault();
          minimize();
        });
        $header.find('.drawer-maximize').on('click', function(e) {
          e.stopPropagation();
          e.preventDefault();
          maximize();
          // 切换图标
          if (maximized) {
            $(this).html('⬜');
          } else {
            $(this).html('☐');
          }
        });
      }

      if ($footer && opts.btn && opts.btn.length) {
        $footer.find('button').each(function(i) {
          $(this).on('click', function() {
            var callbacks = [opts.yes, opts.btn2, opts.btn3];
            var callback = callbacks[i];
            if (callback) {
              var ret = callback(index, $drawer);
              if (ret !== false) close();
            } else if (i === 0) {
              close();
            }
          });
        });
      }

      // 拖拽调整大小
      if (opts.resizable) {
        var isResizing = false;
        var startX, startY, startWidth, startHeight;

        var $resizeHandle = $drawer.find('.drawer-resize-handle');
        $resizeHandle.on('mousedown', function(e) {
          e.preventDefault();
          isResizing = true;
          startX = e.clientX;
          startY = e.clientY;
          startWidth = $drawer.width();
          startHeight = $drawer.height();
          $drawer.css('transition', 'none');
        });

        $(document).on('mousemove.laydrawer-' + id, function(e) {
          if (!isResizing) return;
          
          var deltaX = e.clientX - startX;
          var deltaY = e.clientY - startY;
          var newWidth, newHeight;

          if (placement === 'right') {
            newWidth = Math.max(opts.minWidth, Math.min(opts.maxWidth, startWidth - deltaX));
            $drawer.css('width', newWidth);
          } else if (placement === 'left') {
            newWidth = Math.max(opts.minWidth, Math.min(opts.maxWidth, startWidth + deltaX));
            $drawer.css('width', newWidth);
          } else if (placement === 'bottom') {
            newHeight = Math.max(opts.minHeight, Math.min(opts.maxHeight, startHeight - deltaY));
            $drawer.css('height', newHeight);
          } else if (placement === 'top') {
            newHeight = Math.max(opts.minHeight, Math.min(opts.maxHeight, startHeight + deltaY));
            $drawer.css('height', newHeight);
          }
        });

        $(document).on('mouseup.laydrawer-' + id, function() {
          if (isResizing) {
            isResizing = false;
            $drawer.css('transition', 'transform 0.3s ease, width 0.1s, height 0.1s');
            $(document).off('mousemove.laydrawer-' + id);
            $(document).off('mouseup.laydrawer-' + id);
          }
        });
      }

      if (opts.time > 0) {
        setTimeout(close, opts.time);
      }

      // 拖动功能
      if (opts.move) {
        var isDragging = false;
        var startX, startY, startLeft, startTop;

        $header.on('mousedown', function(e) {
          if (maximized) return; // 最大化状态下不能拖动，最小化状态下可以拖动
          isDragging = true;
          startX = e.clientX;
          startY = e.clientY;
          startLeft = parseInt($drawer.css('left')) || 0;
          startTop = parseInt($drawer.css('top')) || 0;
          $drawer.css('transition', 'none');
          e.preventDefault();
        });

        $(document).on('mousemove.laydrawer-drag-' + id, function(e) {
          if (!isDragging) return;
          
          var deltaX = e.clientX - startX;
          var deltaY = e.clientY - startY;
          
          // 计算新位置
          var newLeft = startLeft + deltaX;
          var newTop = startTop + deltaY;
          
          // 限制在容器内
          var containerWidth = containerRect.width;
          var containerHeight = containerRect.height;
          var drawerWidth = $drawer.width();
          var drawerHeight = $drawer.height();
          
          newLeft = Math.max(0, Math.min(newLeft, containerWidth - drawerWidth));
          newTop = Math.max(0, Math.min(newTop, containerHeight - drawerHeight));
          
          $drawer.css({
            left: newLeft,
            top: newTop
          });
        });

        $(document).on('mouseup.laydrawer-drag-' + id, function() {
          if (isDragging) {
            isDragging = false;
            $drawer.css('transition', 'transform 0.3s ease, width 0.1s, height 0.1s');
            $(document).off('mousemove.laydrawer-drag-' + id);
            $(document).off('mouseup.laydrawer-drag-' + id);
          }
        });
      }

      // 对于非 body 容器，监听窗口 resize 和 scroll 来更新位置
      if (!opts.fixed && $container[0] !== document.body) {
        function updatePosition() {
          containerRect = getContainerRect();
          $wrapper.css({
            top: containerRect.top,
            left: containerRect.left,
            width: containerRect.width,
            height: containerRect.height
          });
        }
        
        $(window).on('resize.laydrawer-' + id, updatePosition);
        $(window).on('scroll.laydrawer-' + id, updatePosition);
      }

      // ESC 键关闭（只绑定一次）
      if (!escHandler) {
        escHandler = function(e) {
          if (e.keyCode === 27) {
            // 关闭最后一个打开的抽屉
            var ids = Object.keys(instances);
            if (ids.length > 0) {
              var lastId = ids[ids.length - 1];
              instances[lastId].close();
            }
          }
        };
        $(document).on('keydown', escHandler);
      }

      var instance = {
        id: id,
        index: index,
        $wrapper: $wrapper,
        $drawer: $drawer,
        $shade: $shade,
        $body: $body,
        $header: $header,
        close: close,
        minimize: minimize,
        maximize: maximize,
        isMinimized: function() { return minimized; },
        isMaximized: function() { return maximized; },
        setTitle: function(title) {
          $header.find('span').first().text(title);
        },
        setContent: function(content) {
          $body.html(content);
        }
      };

      instances[id] = instance;

      if (opts.success) {
        opts.success($drawer, index);
      }

      return instance;
    },

    close: function(instance) {
      if (typeof instance === 'object' && instance && instance.close) {
        instance.close();
      } else if (typeof instance === 'number') {
        var ids = Object.keys(instances);
        if (ids[instance - 1]) {
          instances[ids[instance - 1]].close();
        }
      } else if (typeof instance === 'string' && instances[instance]) {
        instances[instance].close();
      }
    },

    closeAll: function() {
      var ids = Object.keys(instances);
      for (var i = ids.length - 1; i >= 0; i--) {
        instances[ids[i]].close();
      }
    },

    right: function(options) {
      return this.open($.extend({ placement: 'right' }, options));
    },

    left: function(options) {
      return this.open($.extend({ placement: 'left' }, options));
    },

    top: function(options) {
      return this.open($.extend({ placement: 'top' }, options));
    },

    bottom: function(options) {
      return this.open($.extend({ placement: 'bottom' }, options));
    },

    getInstances: function() {
      return instances;
    }
  };

  exports('laydrawer', LayDrawer);
});