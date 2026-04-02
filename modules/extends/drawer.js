/**
 * 抽屉弹层模块 - 增强版
 * 支持：ESC关闭、多抽屉管理、固定背景、最小化/还原、拖拽调整大小
 */
layui.define(['jquery'], function(exports) {
  'use strict';

  var $ = layui.jquery;
  var drawerIndex = 0;
  var instances = {}; // 存储所有抽屉实例
  var escHandler = null; // ESC 键事件处理器

  var Drawer = {
    version: '2.0.0',

    defaults: {
      container: 'body',
      placement: 'right',
      width: 400,
      height: 300,
      title: '抽屉',
      content: '',
      shade: 0.3,
      shadeClose: true,
      showClose: true,
      showMinimize: false, // 显示最小化按钮
      zIndex: 10000,
      fixed: false,
      lockScroll: false, // 锁定背景滚动
      resizable: false, // 是否可调整大小
      minWidth: 200, // 最小宽度
      minHeight: 150, // 最小高度
      maxWidth: 800, // 最大宽度
      maxHeight: 600 // 最大高度
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
      var id = 'drawer-' + drawerIndex;

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
          $(document).on('click.drawer-shade-' + id, handleBodyClick);
        }, 350);
      }

      var $drawer = $('<div class="drawer-content"></div>').css({
        position: 'absolute',
        backgroundColor: '#fff',
        boxShadow: '-2px 0 8px rgba(0,0,0,0.15)',
        pointerEvents: 'auto',
        transition: 'transform 0.3s ease, width 0.1s, height 0.1s'
      });

      // 头部按钮 HTML
      var headerBtns = '';
      if (opts.showMinimize) {
        headerBtns += '<button type="button" class="drawer-minimize" style="background:none;border:none;cursor:pointer;font-size:14px;margin-right:8px;">&ndash;</button>';
      }
      if (opts.showClose) {
        headerBtns += '<button type="button" class="drawer-close" style="background:none;border:none;cursor:pointer;font-size:16px;">&times;</button>';
      }

      var title = opts.title || '抽屉';
      var $header = $('<div class="drawer-header" style="padding:16px 24px;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center;cursor:move;"></div>')
        .html('<span style="font-size:16px;font-weight:500;">' + title + '</span><div class="drawer-header-btns" style="display:flex;align-items:center;">' + headerBtns + '</div>');

      var $body = $('<div class="drawer-body" style="padding:24px;overflow:auto;"></div>').html(opts.content || '');

      $drawer.append($header).append($body);
      $wrapper.append($shade).append($drawer);

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

      var minimized = false;
      var originalSize = {
        width: drawerW,
        height: drawerH,
        transform: transformTarget
      };

      function close() {
        $shade.css('opacity', 0);
        $drawer.css('transform', transformInit);
        setTimeout(function() {
          $wrapper.remove();
          delete instances[id];
          
          // 移除窗口 resize 和 scroll 监听
          if (!opts.fixed && $container[0] !== document.body) {
            $(window).off('resize.drawer-' + id);
            $(window).off('scroll.drawer-' + id);
            // 移除手动添加的点击监听
            $(document).off('click.drawer-shade-' + id);
          }
          
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
          
          if (opts.end) opts.end();
        }, 300);
      }

      function minimize() {
        if (minimized) {
          // 还原
          $drawer.css({
            width: originalSize.width,
            height: originalSize.height,
            transform: originalSize.transform
          });
          $body.show();
          minimized = false;
        } else {
          // 最小化
          originalSize.width = $drawer.width();
          originalSize.height = $drawer.height();
          $body.hide();
          $drawer.css({
            width: placement === 'right' || placement === 'left' ? '200px' : 'auto',
            height: placement === 'top' || placement === 'bottom' ? '50px' : 'auto'
          });
          minimized = true;
        }
      }

      $shade.on('click', function() {
        if (opts.shadeClose !== false) close();
      });

      if (opts.showClose) {
        $header.find('.drawer-close').on('click', close);
      }

      if (opts.showMinimize) {
        $header.find('.drawer-minimize').on('click', minimize);
      }

      // 拖拽调整大小
      if (opts.resizable) {
        var isResizing = false;
        var startX, startY, startWidth, startHeight;

        $resizeHandle.on('mousedown', function(e) {
          e.preventDefault();
          isResizing = true;
          startX = e.clientX;
          startY = e.clientY;
          startWidth = $drawer.width();
          startHeight = $drawer.height();
          $drawer.css('transition', 'none');
        });

        $(document).on('mousemove.drawer-' + id, function(e) {
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

        $(document).on('mouseup.drawer-' + id, function() {
          if (isResizing) {
            isResizing = false;
            $drawer.css('transition', 'transform 0.3s ease, width 0.1s, height 0.1s');
            $(document).off('mousemove.drawer-' + id);
            $(document).off('mouseup.drawer-' + id);
          }
        });
      }

      var instance = {
        id: id,
        $wrapper: $wrapper,
        $drawer: $drawer,
        $shade: $shade,
        $body: $body,
        $header: $header,
        close: close,
        minimize: minimize,
        isMinimized: function() { return minimized; },
        setTitle: function(title) {
          $header.find('span').first().text(title);
        },
        setContent: function(content) {
          $body.html(content);
        }
      };

      instances[id] = instance;

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
        
        $(window).on('resize.drawer-' + id, updatePosition);
        $(window).on('scroll.drawer-' + id, updatePosition);
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

      if (opts.success) {
        opts.success($drawer, instance);
      }

      return instance;
    },

    close: function(instance) {
      if (instance && typeof instance.close === 'function') {
        instance.close();
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

  exports('drawerMod', Drawer);
});
