/**
 * LayDrawer 抽屉弹层模块
 * 基于 layer.open 封装，参数与 layer.open 保持一致
 * 支持 container（挂载容器）和 placement（方向）配置
 * 注意：抽屉组件始终使用 fixed 定位以确保贴合容器边界
 * 因此 fixed 参数在非 body 容器场景下不生效
 * 性能优化：使用 requestAnimationFrame 节流拖拽/resize 事件
 */
layui.define(['layer', 'jquery'], function(exports) {
  'use strict';

  var MOD_NAME = 'drawerMod';
  var $ = layui.jquery,
      layer = layui.layer;

  var instances = {};
  var routeChangeListenerAdded = false;
  var containerMinIndex = {};

  // requestAnimationFrame 缓存
  var _rafMap = {};

  var placementConfig = {
    right: { offset: 'r', anim: 'slideLeft', area: ['400px', '100%'], zIndex: 99 },
    left: { offset: 'l', anim: 'slideRight', area: ['400px', '100%'], zIndex: 99 },
    top: { offset: 't', anim: 'slideDown', area: ['100%', '300px'], zIndex: 99 },
    bottom: { offset: 'b', anim: 'slideUp', area: ['100%', '300px'], zIndex: 99 }
  };

  var borderRadiusMap = {
    right: '8px 0 0 8px',
    left: '0 8px 8px 0',
    top: '0 0 8px 8px',
    bottom: '8px 8px 0 0'
  };

  function addRouteChangeListener() {
    if (routeChangeListenerAdded) return;
    try {
      var router = layui.routerModule || layui.router;
      if (router && typeof router.on === 'function') {
        router.on('routeChange', function() {
          layer.closeAll();
          instances = {};
          containerMinIndex = {};
          Object.keys(_rafMap).forEach(function(key) {
            cancelAnimationFrame(_rafMap[key]);
            delete _rafMap[key];
          });
        });
        routeChangeListenerAdded = true;
      }
    } catch (e) {}
  }

  setTimeout(addRouteChangeListener, 100);

  // RAF 工具函数：节流回调到下一帧
  function rafThrottle(key, callback) {
    if (_rafMap[key]) return; // 已有待执行的帧
    
    _rafMap[key] = requestAnimationFrame(function() {
      delete _rafMap[key];
      callback();
    });
  }

  var LayDrawer = {
    version: '1.2.0',

    defaults: {
      container: 'body',
      placement: 'right',
      type: 1,
      title: ' ',
      content: '',
      shade: 0.3,
      shadeClose: true,
      move: true,
      moveOut: true,
      closeBtn: 1
    },

    _calculateArea: function($container, placement, area) {
      var el = $container[0];
      var rect = el.getBoundingClientRect();
      var refWidth = rect.width;
      var refHeight = rect.height;
      var finalWidth, finalHeight;

      var defaultArea = placementConfig[placement] ? placementConfig[placement].area : ['400px', '100%'];
      area = area || defaultArea;

      if (typeof area[0] === 'string' && area[0].indexOf('%') !== -1) {
        finalWidth = Math.floor(refWidth * parseFloat(area[0]) / 100);
      } else {
        finalWidth = Math.min(parseInt(area[0]) || refWidth, refWidth);
      }

      if (placement === 'top' || placement === 'bottom') {
        if (typeof area[1] === 'string' && area[1].indexOf('%') !== -1) {
          finalHeight = Math.floor(refHeight * parseFloat(area[1]) / 100);
        } else {
          finalHeight = Math.min(parseInt(area[1]) || 300, refHeight);
        }
      } else {
        finalHeight = refHeight;
      }

      return { width: finalWidth, height: finalHeight };
    },

    _calculatePosition: function(placement, containerRect, layerWidth, layerHeight) {
      var positions = {
        right: { left: containerRect.right - layerWidth, top: containerRect.top },
        left: { left: containerRect.left, top: containerRect.top },
        top: { left: containerRect.left, top: containerRect.top },
        bottom: { left: containerRect.left, top: containerRect.bottom - layerHeight }
      };
      return positions[placement] || positions.right;
    },

    _updateContentHeight: function($elements, height) {
      var titleHeight = $elements.$title.outerHeight() || 0;
      var contentHeight = height - titleHeight;
      
      $elements.$content.css('height', contentHeight + 'px');
      
      if ($elements.$iframe.length) {
        $elements.$iframe.css('height', contentHeight + 'px');
      }
      
      return contentHeight;
    },

    _cacheElements: function($layero) {
      var $content = $layero.find('.layui-layer-content');
      return {
        $layero: $layero,
        $content: $content,
        $title: $layero.find('.layui-layer-title'),
        $iframe: $content.find('iframe')
      };
    },

    _bindDragEvents: function($elements, $container, opts) {
      if (opts.move === false) return;
      
      var dragRafKey = 'drag-' + Date.now();
      var pendingMove = null;
      
      $elements.$title.off('mousedown.laydrawer').on('mousedown.laydrawer', function(e) {
        var startX = e.clientX;
        var startY = e.clientY;
        var startLeft = parseFloat($elements.$layero.css('left'));
        var startTop = parseFloat($elements.$layero.css('top'));
        
        // 预先缓存容器和层的尺寸
        var cachedRect = null;
        var cachedLayerW = null;
        var cachedLayerH = null;
        
        function onMouseMove(e) {
          // 使用 raf 节流，每帧最多执行一次
          if (!pendingMove) {
            pendingMove = true;
            
            rafThrottle(dragRafKey, function() {
              pendingMove = false;
              
              // 懒更新：只在需要时重新读取
              if (!cachedRect) {
                cachedRect = $container[0].getBoundingClientRect();
              }
              if (cachedLayerW === null) {
                cachedLayerW = $elements.$layero.outerWidth();
                cachedLayerH = $elements.$layero.outerHeight();
              }
              
              var newLeft = Math.max(cachedRect.left, Math.min(startLeft + e.clientX - startX, cachedRect.right - cachedLayerW));
              var newTop = Math.max(cachedRect.top, Math.min(startTop + e.clientY - startY, cachedRect.bottom - cachedLayerH));
              
              $elements.$layero.css({ left: newLeft, top: newTop });
              
              // 样式写入后清除缓存，下次移动会重新读取
              cachedRect = null;
            });
          }
        }
        
        function onMouseUp() {
          $(document).off('mousemove.laydrawer mouseup.laydrawer');
          pendingMove = null;
          
          // 清理 RAF
          if (_rafMap[dragRafKey]) {
            cancelAnimationFrame(_rafMap[dragRafKey]);
            delete _rafMap[dragRafKey];
          }
        }
        
        $(document).on('mousemove.laydrawer', onMouseMove).on('mouseup.laydrawer', onMouseUp);
        e.preventDefault();
      });
    },

    _bindResizeEvents: function($elements, $container, $shade, index, placement, isIframe, getState, updateMinPosition) {
      var self = this;
      var resizeRafKey = 'resize-' + index;
      
      function updatePosition() {
        // 使用 raf 节流 resize 事件
        rafThrottle(resizeRafKey, function() {
          var state = getState();
          var rect = $container[0].getBoundingClientRect();
          
          if (state === 'min') {
            updateMinPosition(rect);
            return;
          }
          
          if ($shade && $shade.length) {
            $shade.css({
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height
            });
          }

          if (state === 'max') {
            $elements.$layero.css({
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height
            });
            self._updateContentHeight($elements, rect.height);
            return;
          }

          // 批量读取层尺寸
          var layerWidth = $elements.$layero.outerWidth();
          var layerHeight = $elements.$layero.outerHeight();
          
          layerWidth = Math.min(layerWidth, rect.width);
          layerHeight = Math.min(layerHeight, rect.height);
          
          $elements.$layero.css('width', layerWidth);
          
          if (layerHeight < rect.height) {
            $elements.$layero.css('height', layerHeight);
          }

          var pos = self._calculatePosition(placement, rect, layerWidth, layerHeight);
          var newHeight = (placement === 'top' || placement === 'bottom') ? layerHeight : rect.height;
          
          $elements.$layero.css({
            left: pos.left,
            top: placement === 'bottom' ? rect.bottom - layerHeight : pos.top,
            height: newHeight
          });

          self._updateContentHeight($elements, newHeight);
        });
      }

      $(window).on('resize.laydrawer-' + index + ' scroll.laydrawer-' + index, updatePosition);
      
      // 记录 RAF key 以便清理
      $elements.$layero.data('resizeRafKey', resizeRafKey);
    },

    _setupContainerDrawer: function($elements, $container, $shade, opts, index, placement, getState, updateMinPosition) {
      var self = this;
      var containerRect = $container[0].getBoundingClientRect();
      var layerWidth = $elements.$layero.outerWidth();
      var layerHeight = $elements.$layero.outerHeight();

      layerWidth = Math.min(layerWidth, containerRect.width);
      layerHeight = Math.min(layerHeight, containerRect.height);

      var pos = this._calculatePosition(placement, containerRect, layerWidth, layerHeight);
      var finalHeight = (placement === 'top' || placement === 'bottom') ? layerHeight : containerRect.height;

      $elements.$layero.css({
        position: 'fixed',
        left: pos.left,
        top: pos.top,
        width: layerWidth,
        height: finalHeight,
        'border-radius': borderRadiusMap[placement],
        'box-shadow': 'none',
        'border': 'none'
      });

      $elements.$layero.addClass('drawer-' + placement);

      this._updateContentHeight($elements, finalHeight);
      this._bindDragEvents($elements, $container, opts);
      this._bindResizeEvents($elements, $container, $shade, index, placement, opts.type === 2, getState, updateMinPosition);
    },

    _handleMaximize: function($elements, $container, $shade, layerIndex) {
      var containerRect = $container[0].getBoundingClientRect();
      
      $elements.$layero.css({
        left: containerRect.left,
        top: containerRect.top,
        width: containerRect.width,
        height: containerRect.height
      });

      this._updateContentHeight($elements, containerRect.height);

      if ($shade.length) {
        $shade.css({
          left: containerRect.left,
          top: containerRect.top,
          width: containerRect.width,
          height: containerRect.height
        });
      }
    },

    _handleRestore: function($elements, $container, $shade, originalSize, placement) {
      var containerRect = $container[0].getBoundingClientRect();
      var restoreWidth = Math.min(originalSize.width, containerRect.width);
      var restoreHeight = Math.min(originalSize.height, containerRect.height);

      var pos = this._calculatePosition(placement, containerRect, restoreWidth, restoreHeight);
      var finalHeight = (placement === 'top' || placement === 'bottom') ? restoreHeight : containerRect.height;

      $elements.$layero.css({
        left: placement === 'right' ? containerRect.right - restoreWidth : pos.left,
        top: placement === 'bottom' ? containerRect.bottom - restoreHeight : pos.top,
        width: restoreWidth,
        height: finalHeight
      });

      this._updateContentHeight($elements, finalHeight);

      if ($shade.length) {
        $shade.css({
          left: containerRect.left,
          top: containerRect.top,
          width: containerRect.width,
          height: containerRect.height
        });
      }
    },

    open: function(options) {
      var opts = $.extend({}, this.defaults, options);
      var placement = opts.placement || 'right';
      var pConfig = placementConfig[placement] || placementConfig.right;

      var layerOpts = $.extend({}, opts);
      delete layerOpts.container;
      delete layerOpts.placement;

      var $container = $(opts.container);
      if (!$container.length) $container = $('body');

      var isBodyContainer = $container[0] === document.body;
      var originalSuccess = layerOpts.success;
      var originalEnd = layerOpts.end;
      var originalFull = layerOpts.full;
      var originalRestore = layerOpts.restore;
      var originalMin = layerOpts.min;
      var self = this;
      var $elements = null;
      var $shade = null;
      var layerIndex = null;
      var originalSize = { width: null, height: null, left: null, top: null };
      var cachedContainerRect = null;
      var customShadeId = null;
      var currentState = 'normal';
      var minPosition = { index: 0 };

      layerOpts.anim = pConfig.anim;

      if (!isBodyContainer) {
        var area = this._calculateArea($container, placement, layerOpts.area);
        layerOpts.area = [area.width + 'px', area.height + 'px'];

        cachedContainerRect = $container[0].getBoundingClientRect();
        var finalHeight = (placement === 'top' || placement === 'bottom') ? area.height : cachedContainerRect.height;
        var pos = this._calculatePosition(placement, cachedContainerRect, area.width, finalHeight);
        layerOpts.offset = [pos.top + 'px', pos.left + 'px'];

        if (!layerOpts.zIndex) {
          layerOpts.zIndex = pConfig.zIndex || 99;
        }

        layerOpts.shade = false;

        if (opts.shade !== false) {
          customShadeId = 'laydrawer-shade-' + Date.now();
          $shade = $('<div id="' + customShadeId + '" class="layui-layer-shade"></div>');
          $shade.css({
            position: 'fixed',
            left: cachedContainerRect.left,
            top: cachedContainerRect.top,
            width: cachedContainerRect.width,
            height: cachedContainerRect.height,
            'z-index': layerOpts.zIndex - 1,
            'background-color': 'rgb(0, 0, 0)',
            'opacity': (opts.shade || 0.3)
          });
          $('body').append($shade);

          $shade.on('click', function() {
            if (opts.shadeClose !== false && layerIndex) {
              layer.close(layerIndex);
            }
          });
        }
      } else {
        layerOpts.offset = pConfig.offset;
        if (!layerOpts.zIndex) {
          layerOpts.zIndex = 19891014;
        }
      }

      layerOpts.minStack = false;

      layerOpts.success = function(layero, index) {
        $elements = self._cacheElements(layero);
        layerIndex = index;

        if (!isBodyContainer && $shade) {
          $shade.css('z-index', parseInt($elements.$layero.css('z-index')) - 1);
        } else if (isBodyContainer) {
          $shade = $('#layui-layer-shade' + index);
        }

        originalSize.width = $elements.$layero.outerWidth();
        originalSize.height = $elements.$layero.outerHeight();
        originalSize.left = $elements.$layero.css('left');
        originalSize.top = $elements.$layero.css('top');

        function getState() {
          return currentState;
        }

        function updateMinPosition(containerRect) {
          if (currentState !== 'min') return;
          
          var layerWidth = 200;
          var layerHeight = 50;
          var rightOffset = (minPosition.index - 1) * (layerWidth + 10);
          var left = containerRect.right - layerWidth - rightOffset - 10;
          var top = containerRect.bottom - layerHeight - 10;

          $elements.$layero.css({
            left: left + 'px',
            top: top + 'px'
          });
        }

        if (!isBodyContainer) {
          self._setupContainerDrawer($elements, $container, $shade, opts, index, placement, getState, updateMinPosition);
        } else {
          self._bindResizeEvents($elements, $container, $shade, index, placement, opts.type === 2, getState, updateMinPosition);
        }

        instances[index] = {
          index: index,
          $elements: $elements,
          $shade: $shade,
          customShadeId: customShadeId,
          isBodyContainer: isBodyContainer,
          close: function() { layer.close(index); }
        };

        var $minBtn = $elements.$layero.find('.layui-layer-min');
        $minBtn.off('click').on('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          if ($shade && $shade.length) {
            $shade.hide();
          }
          
          var containerRect = isBodyContainer 
            ? { left: 0, top: 0, right: $(window).width(), bottom: $(window).height(), width: $(window).width(), height: $(window).height() }
            : $container[0].getBoundingClientRect();
          
          var containerKey = isBodyContainer ? 'body' : opts.container;
          if (!containerMinIndex[containerKey]) {
            containerMinIndex[containerKey] = 0;
          }
          containerMinIndex[containerKey]++;
          minPosition.index = containerMinIndex[containerKey];
          
          currentState = 'min';
          updateMinPosition(containerRect);
          
          layer.min(index);
        });

        if (originalSuccess) originalSuccess(layero, index);
      };

      layerOpts.full = function(layero) {
        currentState = 'max';
        if (!isBodyContainer && $elements) {
          self._handleMaximize($elements, $container, $shade, layerIndex);
        }
        if (originalFull) originalFull(layero);
      };

      layerOpts.min = function(layero) {
        if (originalMin) originalMin(layero);
      };

      layerOpts.restore = function(layero) {
        currentState = 'normal';
        if (!isBodyContainer && $elements && originalSize.width) {
          self._handleRestore($elements, $container, $shade, originalSize, placement);
        }
        if ($shade && $shade.length) {
          $shade.show();
        }
        if (originalRestore) originalRestore(layero);
      };

      layerOpts.end = function() {
        var inst = instances[layerIndex];
        
        $(window).off('resize.laydrawer-' + layerIndex + ' scroll.laydrawer-' + layerIndex);
        
        // 清理 RAF
        var rafKey = 'resize-' + layerIndex;
        if (_rafMap[rafKey]) {
          cancelAnimationFrame(_rafMap[rafKey]);
          delete _rafMap[rafKey];
        }
        
        if (inst && inst.$shade && inst.$shade.length) {
          inst.$shade.remove();
        } else if (customShadeId) {
          $('#' + customShadeId).remove();
        }
        
        if (layerIndex) {
          delete instances[layerIndex];
        }
        
        var containerKey = isBodyContainer ? 'body' : opts.container;
        if (containerMinIndex[containerKey] && containerMinIndex[containerKey] > 0) {
          containerMinIndex[containerKey]--;
        }
        
        if (originalEnd) originalEnd();
      };

      var index = layer.open(layerOpts);

      return {
        index: index,
        close: function() { layer.close(index); },
        $layero: function() { return $('#layui-layer' + index); }
      };
    },

    close: function(instance) {
      if (typeof instance === 'object' && instance && instance.close) {
        instance.close();
      } else if (typeof instance === 'number') {
        layer.close(instance);
      }
    },

    closeAll: function() {
      layer.closeAll();
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
    }
  };

  exports(MOD_NAME, LayDrawer);
});
