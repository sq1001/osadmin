/**
 * 抽屉组件
 * 独立实现，不复用 layer 的 DOM 结构
 * 采用 transform 动画 + 三段式结构（header/body/footer）
 * 支持 container 模式（absolute + overflow 裁剪）和 body 模式（fixed）
 *
 * API 向下兼容 layer.open 的常用参数：
 *   - type, title, content, area, shade, shadeClose, closeBtn, maxmin
 *   - btn, yes, btn2, success(layero, index), end
 *   - move（语义改为拖拽边缘调整宽度）
 *
 * 新增特性：
 *   - ESC 键关闭
 *   - 关闭反向滑出动画（transitionend 后销毁 DOM）
 *   - container 模式下 absolute 定位，配合容器 overflow:hidden 实现真正的边缘滑入
 *   - 拖拽边缘调整尺寸（resize handle）
 *   - beforeClose 拦截
 *   - 多层 z-index 自动栈管理
 */
layui.define(['jquery', 'layer'], function (exports) {
  'use strict';

  var MOD_NAME = 'drawerMod';
  var $ = layui.jquery;
  var layer = layui.layer;

  // 全局实例管理
  var instances = {};           // index -> instance
  var instanceStack = [];       // z-index 栈
  var Z_INDEX_BASE = 19891014;
  var Z_INDEX_STEP = 10;
  var routeChangeListenerAdded = false;
  var escListenerAdded = false;

  // 旧 layer.close 的引用，用于拦截 layer.close(index) 调用
  var _originalLayerClose = layer.close;
  var _originalLayerCloseAll = layer.closeAll;

  /**
   * 拦截 layer.close，如果 index 是抽屉实例则转发到抽屉关闭逻辑
   */
  function interceptLayerClose() {
    if (layer.close !== _originalLayerClose) return; // 已拦截过

    layer.close = function (index) {
      if (instances[index]) {
        return instances[index].close();
      }
      return _originalLayerClose.apply(layer, arguments);
    };

    layer.closeAll = function () {
      // 关闭所有抽屉
      Object.keys(instances).forEach(function (key) {
        if (instances[key]) {
          instances[key].close();
        }
      });
      return _originalLayerClose.apply(layer, arguments);
    };
  }

  /**
   * 解析 area 参数，支持 px 和 %
   */
  function parseArea(area, refWidth, refHeight, placement) {
    var defaultArea = getDefaultArea(placement);
    area = area || defaultArea;

    var width, height;

    if (typeof area[0] === 'string' && area[0].indexOf('%') !== -1) {
      width = Math.floor(refWidth * parseFloat(area[0]) / 100);
    } else {
      width = parseInt(area[0], 10) || (placement === 'top' || placement === 'bottom' ? refWidth : 400);
    }

    if (typeof area[1] === 'string' && area[1].indexOf('%') !== -1) {
      height = Math.floor(refHeight * parseFloat(area[1]) / 100);
    } else {
      height = parseInt(area[1], 10) || (placement === 'top' || placement === 'bottom' ? 300 : refHeight);
    }

    // 容器模式下不超过容器尺寸
    width = Math.min(width, refWidth);
    height = Math.min(height, refHeight);

    return { width: width, height: height };
  }

  function getDefaultArea(placement) {
    if (placement === 'top' || placement === 'bottom') {
      return ['100%', '300px'];
    }
    return ['400px', '100%'];
  }

  /**
   * 判断 content 是否为 URL（用于自动 iframe）
   */
  function isUrl(content) {
    if (typeof content !== 'string') return false;
    return /^(https?:)?\/\/|^\/[^\/]/.test(content);
  }

  /**
   * 生成唯一 ID
   */
  var _idCounter = 0;
  function nextId() {
    _idCounter++;
    return 'os-drawer-' + Date.now() + '-' + _idCounter;
  }

  /**
   * 获取下一个 z-index
   */
  function nextZIndex() {
    if (instanceStack.length === 0) return Z_INDEX_BASE;
    var last = instanceStack[instanceStack.length - 1];
    return last.zIndex + Z_INDEX_STEP;
  }

  /**
   * 抽屉实例构造函数
   */
  function DrawerInstance(options) {
    var opts = $.extend({}, DrawerInstance.defaults, options);

    this.opts = opts;
    this.id = nextId();
    this.index = this.id;              // 兼容 layer 的 index 概念
    this.state = 'closed';             // closed | opening | open | closing | maxed | mined
    this.zIndex = nextZIndex();
    this.originalSize = null;          // 用于 max/min 还原
    this.$root = null;
    this.$content = null;
    this.$mask = null;
    this.$header = null;
    this.$body = null;
    this.$footer = null;
    this.$iframe = null;
    this._escHandler = null;
    this._resizeHandler = null;
    this._transitionHandler = null;
    this._destroyed = false;

    this.init();
  }

  DrawerInstance.defaults = {
    container: 'body',
    placement: 'right',          // right | left | top | bottom
    type: 1,                     // 1=页面层 2=iframe层
    title: ' ',
    content: '',
    area: null,                  // ['400px','100%'] 或 ['100%','300px']
    shade: 0.45,
    shadeClose: true,
    closeBtn: 1,                 // 0=隐藏 1=显示
    maxmin: false,               // 是否显示最大化最小化按钮
    move: true,                  // 是否可拖拽边缘调整尺寸
    btn: null,                   // 底部按钮
    yes: null,
    btn2: null,
    success: null,               // success(layero, index)
    end: null,                   // 关闭后回调
    beforeClose: null,           // beforeClose(done) 拦截关闭
    closeOnEsc: true,            // ESC 键关闭
    minWidth: 280,               // 拖拽最小宽度
    maxWidth: 800,               // 拖拽最大宽度
    minHeight: 150,              // 拖拽最小高度
    maxHeight: 600               // 拖拽最大高度
  };

  DrawerInstance.prototype = {
    constructor: DrawerInstance,

    init: function () {
      var opts = this.opts;
      var $container = $(opts.container);
      if (!$container.length) $container = $('body');
      this.$container = $container;
      this.isBodyContainer = $container[0] === document.body;

      // 容器模式：直接挂载到用户指定的 container
      // - 若容器 overflow:hidden（如 #contentWrapper）：抽屉不跟随滚动
      // - 若容器 overflow:auto（如 #testContainer）：抽屉从容器边缘滑出，受容器裁剪
      //   （跟随滚动是合理的——容器内抽屉应跟随容器内容滚动）
      if (!this.isBodyContainer) {
        this.$mountTarget = $container;
        $container.addClass('os-drawer-container');
        // 确保挂载点有 relative 定位（absolute 定位的参考）
        if (window.getComputedStyle($container[0]).position === 'static') {
          $container.css('position', 'relative');
        }
      } else {
        this.$mountTarget = $container;
      }

      // 计算 area（基于原始参考容器的尺寸，不是挂载点）
      var rect = this.isBodyContainer
        ? { width: window.innerWidth, height: window.innerHeight }
        : $container[0].getBoundingClientRect();

      var area = parseArea(opts.area, rect.width, rect.height, opts.placement);
      this.size = area;

      // 构建 DOM
      this.buildDOM();

      // 注册实例
      instances[this.index] = this;
      instanceStack.push({ index: this.index, zIndex: this.zIndex });

      // 绑定事件
      this.bindEvents();

      // 触发打开动画
      var self = this;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          self.$root.addClass('os-drawer--open');
          self.state = 'opening';

          // 监听打开动画结束
          self.$content.one('transitionend', function (e) {
            // 只处理 transform 的 transitionend
            if (e.originalEvent && e.originalEvent.propertyName !== 'transform') return;
            if (self.state === 'opening') {
              self.state = 'open';
            }
          });
        });
      });

      // success 回调（兼容 layer 的 success(layero, index)）
      if (typeof opts.success === 'function') {
        try {
          opts.success.call(this, this.$root, this.index);
        } catch (e) {
          console.error('[Drawer] success callback error:', e);
        }
      }

      // 全局 ESC 监听（延迟添加避免立即响应）
      if (opts.closeOnEsc) {
        this.setupEscListener();
      }

      // 路由切换自动关闭
      this.setupRouteChangeListener();
    },

    /**
     * 构建 DOM 结构
     */
    buildDOM: function () {
      var opts = this.opts;
      var placement = opts.placement;

      // 根容器
      var rootClasses = 'os-drawer os-drawer--' + placement;
      if (!this.isBodyContainer) rootClasses += ' os-drawer--in-container';
      if (opts.shade === false || opts.shade === 0) rootClasses += ' os-drawer--no-mask';
      if (!opts.title) rootClasses += ' os-drawer--no-header';
      if (!opts.btn || (Array.isArray(opts.btn) && opts.btn.length === 0)) rootClasses += ' os-drawer--no-footer';

      this.$root = $('<div class="' + rootClasses + '" tabindex="-1"></div>');
      this.$root.css('z-index', this.zIndex);

      // 遮罩
      this.$mask = $('<div class="os-drawer__mask"></div>');
      if (typeof opts.shade === 'number' && opts.shade !== 0.45) {
        this.$mask.css('background', 'rgba(0,0,0,' + opts.shade + ')');
      }
      this.$root.append(this.$mask);

      // 内容主体
      this.$content = $('<div class="os-drawer__content"></div>');

      // 根据方向设置尺寸
      if (placement === 'right' || placement === 'left') {
        this.$content.css('width', this.size.width + 'px');
      } else {
        this.$content.css('height', this.size.height + 'px');
      }

      // 头部
      this.$header = $('<div class="os-drawer__header"></div>');
      this.$title = $('<span class="os-drawer__title"></span>').text(opts.title || '');
      this.$header.append(this.$title);

      // 头部按钮
      var $actions = $('<div class="os-drawer__header-actions"></div>');
      if (opts.maxmin) {
        var $minBtn = $('<button class="os-drawer__btn os-drawer__min-btn" type="button"><i class="layui-icon layui-icon-subtraction"></i></button>');
        var $maxBtn = $('<button class="os-drawer__btn os-drawer__max-btn" type="button"><i class="layui-icon layui-icon-screen-full"></i></button>');
        $actions.append($minBtn).append($maxBtn);
      }
      if (opts.closeBtn !== 0) {
        var $closeBtn = $('<button class="os-drawer__btn os-drawer__close-btn" type="button"><i class="layui-icon layui-icon-close"></i></button>');
        $actions.append($closeBtn);
      }
      this.$header.append($actions);
      this.$content.append(this.$header);

      // 主体
      this.$body = $('<div class="os-drawer__body"></div>');
      this.$content.append(this.$body);

      // 填充内容
      this.fillContent();

      // 底部按钮
      if (opts.btn && Array.isArray(opts.btn) && opts.btn.length > 0) {
        this.$footer = $('<div class="os-drawer__footer"></div>');
        var self = this;
        opts.btn.forEach(function (label, i) {
          var $btn = $('<button class="layui-btn' + (i === 0 ? '' : ' layui-btn-primary') + '" type="button">' + label + '</button>');
          $btn.on('click', function () {
            if (i === 0 && typeof opts.yes === 'function') {
              opts.yes.call(self, self.index);
            } else if (i === 1 && typeof opts.btn2 === 'function') {
              opts.btn2.call(self, self.index);
            } else {
              // 默认第0个按钮触发 yes，其他按钮不自动关闭
            }
          });
          self.$footer.append($btn);
        });
        this.$content.append(this.$footer);
      }

      // 拖拽调整尺寸手柄
      if (opts.move !== false) {
        this.$resize = $('<div class="os-drawer__resize"></div>');
        this.$content.append(this.$resize);
      }

      this.$root.append(this.$content);

      // 挂载到容器或 body
      if (this.isBodyContainer) {
        $('body').append(this.$root);
      } else {
        this.$mountTarget.append(this.$root);
      }
    },

    /**
     * 填充内容（字符串或 iframe）
     */
    fillContent: function () {
      var opts = this.opts;
      var content = opts.content;

      if (opts.type === 2 || (typeof content === 'string' && isUrl(content))) {
        // iframe 模式
        var iframeId = 'os-drawer-iframe-' + this.id;
        var $iframe = $('<iframe id="' + iframeId + '" src="' + content + '" frameborder="0"></iframe>');
        this.$body.append($iframe);
        this.$iframe = $iframe;
      } else if (typeof content === 'string') {
        this.$body.html(content);
      } else if (content instanceof $) {
        this.$body.append(content);
      }
    },

    /**
     * 绑定事件
     */
    bindEvents: function () {
      var self = this;
      var opts = this.opts;

      // 关闭按钮
      this.$root.on('click.os-drawer', '.os-drawer__close-btn', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.close();
      });

      // 最大化按钮（最小化状态下作为恢复按钮）
      this.$root.on('click.os-drawer', '.os-drawer__max-btn', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (self.state === 'mined') {
          self.restore();
        } else {
          self.toggleMax();
        }
      });

      // 最小化按钮
      this.$root.on('click.os-drawer', '.os-drawer__min-btn', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.toggleMin();
      });

      // 遮罩点击关闭
      if (opts.shadeClose !== false) {
        this.$mask.on('click.os-drawer', function () {
          self.close();
        });
      }

      // 拖拽调整尺寸
      if (opts.move !== false && this.$resize) {
        this.bindResize();
      }

      // resize 同步（body 模式需要监听窗口 resize）
      this._resizeHandler = function () {
        self.handleResize();
      };
      $(window).on('resize.os-drawer-' + this.id, this._resizeHandler);
    },

    /**
     * 拖拽边缘调整尺寸
     */
    bindResize: function () {
      var self = this;
      var opts = this.opts;
      var placement = opts.placement;

      this.$resize.on('mousedown.os-drawer', function (e) {
        e.preventDefault();
        e.stopPropagation();

        var startX = e.clientX;
        var startY = e.clientY;
        var startW = self.$content.outerWidth();
        var startH = self.$content.outerHeight();
        var isHorizontal = (placement === 'right' || placement === 'left');

        $(document).on('mousemove.os-drawer-resize', function (e) {
          var delta;
          if (isHorizontal) {
            if (placement === 'right') {
              // 右侧抽屉：向左拖增加宽度
              delta = startX - e.clientX;
            } else {
              // 左侧抽屉：向右拖增加宽度
              delta = e.clientX - startX;
            }
            var newW = Math.max(opts.minWidth, Math.min(opts.maxWidth, startW + delta));
            self.$content.css('width', newW + 'px');
          } else {
            if (placement === 'bottom') {
              // 底部抽屉：向上拖增加高度
              delta = startY - e.clientY;
            } else {
              // 顶部抽屉：向下拖增加高度
              delta = e.clientY - startY;
            }
            var newH = Math.max(opts.minHeight, Math.min(opts.maxHeight, startH + delta));
            self.$content.css('height', newH + 'px');
          }
        });

        $(document).on('mouseup.os-drawer-resize', function () {
          $(document).off('.os-drawer-resize');
        });
      });
    },

    /**
     * 处理窗口 resize（body 模式下同步尺寸限制）
     */
    handleResize: function () {
      if (this.state === 'maxed' || this.state === 'mined') return;
      if (!this.isBodyContainer) return;

      var placement = this.opts.placement;
      var $content = this.$content;
      var winW = window.innerWidth;
      var winH = window.innerHeight;

      if (placement === 'right' || placement === 'left') {
        var curW = $content.outerWidth();
        if (curW > winW) {
          $content.css('width', winW + 'px');
        }
      } else {
        var curH = $content.outerHeight();
        if (curH > winH) {
          $content.css('height', winH + 'px');
        }
      }
    },

    /**
     * ESC 键监听
     */
    setupEscListener: function () {
      var self = this;
      this._escHandler = function (e) {
        if (e.keyCode !== 27) return; // ESC
        // 只响应栈顶实例
        var top = instanceStack[instanceStack.length - 1];
        if (top && top.index === self.index) {
          // 最小化或最大化状态下 ESC 不关闭，而是还原
          if (self.state === 'maxed' || self.state === 'mined') {
            self.restore();
          } else if (self.state === 'open' || self.state === 'opening') {
            self.close();
          }
        }
      };
      $(document).on('keydown.os-drawer-' + this.id, this._escHandler);
    },

    /**
     * 路由切换监听
     */
    setupRouteChangeListener: function () {
      if (routeChangeListenerAdded) return;
      try {
        var router = layui.routerModule || layui.router;
        if (router && typeof router.on === 'function') {
          router.on('routeChange', function () {
            // 关闭所有抽屉
            Object.keys(instances).forEach(function (key) {
              if (instances[key]) {
                instances[key].close();
              }
            });
          });
          routeChangeListenerAdded = true;
        }
      } catch (e) { }
    },

    /**
     * 最大化/还原切换
     */
    toggleMax: function () {
      if (this.state === 'maxed') {
        this.restore();
      } else {
        this.maximize();
      }
    },

    /**
     * 最大化
     */
    maximize: function () {
      if (this.state === 'maxed') return;
      // 先保存当前尺寸
      if (!this.originalSize) {
        this.originalSize = {
          width: this.$content[0].style.width,
          height: this.$content[0].style.height
        };
      }
      this.$root.removeClass('os-drawer--mined').addClass('os-drawer--maxed');
      this.state = 'maxed';

      // 更新按钮图标
      this.$root.find('.os-drawer__max-btn i').removeClass('layui-icon-screen-full').addClass('layui-icon-screen-restore');
    },

    /**
     * 最小化/还原切换
     */
    toggleMin: function () {
      if (this.state === 'mined') {
        this.restore();
      } else {
        this.minimize();
      }
    },

    /**
     * 最小化（折叠为底部条带，堆叠排列）
     */
    minimize: function () {
      if (this.state === 'mined') return;
      if (!this.originalSize) {
        this.originalSize = {
          width: this.$content[0].style.width,
          height: this.$content[0].style.height
        };
      }
      this.$root.removeClass('os-drawer--maxed').addClass('os-drawer--mined');
      this.state = 'mined';
      this.$mask.css('opacity', 0);

      // 最小化时 max-btn 图标改为"还原"图标
      this.$root.find('.os-drawer__max-btn i')
        .removeClass('layui-icon-screen-full layui-icon-screen-restore')
        .addClass('layui-icon-screen-restore');

      // 计算堆叠位置（多个最小化抽屉横向排列）
      this.updateMinimizedStackPosition();

      // 绑定最小化条带拖动
      this.bindMinimizedDrag();
    },

    /**
     * 计算并更新最小化堆叠位置
     */
    updateMinimizedStackPosition: function () {
      // 统计当前最小化的抽屉数量（按最小化顺序）
      var stackCount = 0;
      var minStack = []; // 最小化堆栈顺序
      instanceStack.forEach(function (item) {
        var inst = instances[item.index];
        if (inst && inst.state === 'mined') {
          minStack.push(inst);
        }
      });
      stackCount = minStack.length;

      // 当前实例在堆栈中的位置
      var myIndex = minStack.indexOf(this);
      if (myIndex === -1) myIndex = stackCount - 1;

      // 每个最小化条带宽 220px + 间距 10px
      var barWidth = 220;
      var gap = 10;
      var rightOffset = 10 + myIndex * (barWidth + gap);

      this.$content.css('right', rightOffset + 'px');
    },

    /**
     * 重新计算所有最小化抽屉的位置（用于关闭某个最小化抽屉后重排）
     */
    refreshAllMinimizedPositions: function () {
      Object.keys(instances).forEach(function (key) {
        var inst = instances[key];
        if (inst && inst.state === 'mined') {
          inst.updateMinimizedStackPosition();
        }
      });
    },

    /**
     * 绑定最小化条带拖动（水平方向改变 right，垂直方向改变 bottom）
     */
    bindMinimizedDrag: function () {
      var self = this;
      if (this._minDragBound) return;
      this._minDragBound = true;

      this.$header.on('mousedown.os-drawer-min-drag', function (e) {
        if (self.state !== 'mined') return;
        // 点击关闭按钮、还原区域不触发拖动
        if ($(e.target).closest('.os-drawer__header-actions').length) return;

        e.preventDefault();
        var startX = e.clientX;
        var startY = e.clientY;
        var startRight = parseInt(self.$content.css('right'), 10) || 10;
        var startBottom = parseInt(self.$content.css('bottom'), 10) || 10;

        $(document).on('mousemove.os-drawer-min-drag-' + self.id, function (e) {
          var deltaX = startX - e.clientX;
          var deltaY = startY - e.clientY;
          // 水平拖动改变 right，垂直拖动改变 bottom（互不干扰）
          self.$content.css({
            'right': Math.max(0, startRight + deltaX) + 'px',
            'bottom': Math.max(0, startBottom + deltaY) + 'px'
          });
        });

        $(document).on('mouseup.os-drawer-min-drag-' + self.id, function () {
          $(document).off('.os-drawer-min-drag-' + self.id);
        });
      });
    },

    /**
     * 还原（从最大化或最小化恢复）
     */
    restore: function () {
      if (this.state !== 'maxed' && this.state !== 'mined') return;
      var wasMined = this.state === 'mined';

      this.$root.removeClass('os-drawer--maxed os-drawer--mined');

      if (this.originalSize) {
        this.$content.css({
          width: this.originalSize.width,
          height: this.originalSize.height
        });
      }

      // 清除最小化时设置的 right/bottom 内联样式
      if (wasMined) {
        this.$content.css({ 'right': '', 'bottom': '' });
        // 解绑拖动
        this.$header.off('.os-drawer-min-drag');
        this._minDragBound = false;
      }

      this.state = 'open';
      this.$mask.css('opacity', '');

      // 更新按钮图标
      this.$root.find('.os-drawer__max-btn i').removeClass('layui-icon-screen-restore').addClass('layui-icon-screen-full');

      // 如果从最小化恢复，重新排列其他最小化抽屉
      if (wasMined) {
        var self = this;
        setTimeout(function () {
          self.refreshAllMinimizedPositions();
        }, 50);
      }
    },

    /**
     * 关闭（带反向滑出动画）
     */
    close: function () {
      var self = this;

      // 已在关闭中或已关闭
      if (this.state === 'closing' || this.state === 'closed') return;

      // beforeClose 拦截
      if (typeof this.opts.beforeClose === 'function') {
        var result = this.opts.beforeClose(function () {
          self._doClose();
        });
        // 如果返回 false 则阻止关闭
        if (result === false) return;
        // 如果没有调用 done 也不关闭（异步等待）
        return;
      }

      this._doClose();
    },

    _doClose: function () {
      var self = this;
      this.state = 'closing';

      // 最小化状态：条带已在屏幕内，直接销毁，不走反向滑出动画
      if (this.$root.hasClass('os-drawer--mined')) {
        this.destroy(true);
        if (typeof this.opts.end === 'function') {
          try { this.opts.end.call(this); } catch (e) {
            console.error('[Drawer] end callback error:', e);
          }
        }
        return;
      }

      // 移除 open class，触发反向滑出动画
      this.$root.removeClass('os-drawer--open');
      this.$mask.css('opacity', 0);

      // 监听动画结束
      var cleanupDone = false;
      function cleanup() {
        if (cleanupDone) return;
        cleanupDone = true;

        self.destroy();

        // end 回调
        if (typeof self.opts.end === 'function') {
          try {
            self.opts.end.call(self);
          } catch (e) {
            console.error('[Drawer] end callback error:', e);
          }
        }
      }

      // 使用 transitionend 监听
      this.$content.one('transitionend', function (e) {
        if (e.originalEvent && e.originalEvent.propertyName !== 'transform') return;
        cleanup();
      });

      // 兜底：动画时长 + 100ms
      setTimeout(cleanup, 400);
    },

    /**
     * 销毁 DOM 和事件
     * @param {boolean} wasMined 是否从最小化状态关闭（用于触发其他最小化抽屉重排）
     */
    destroy: function (wasMined) {
      if (this._destroyed) return;
      this._destroyed = true;

      // 清理事件
      this.$root.off('.os-drawer');
      $(window).off('resize.os-drawer-' + this.id);
      if (this._escHandler) {
        $(document).off('keydown.os-drawer-' + this.id, this._escHandler);
      }
      $(document).off('.os-drawer-resize');
      $(document).off('.os-drawer-min-drag-' + this.id);

      // 移除 DOM
      this.$root.remove();

      // 清理挂载点 class（如果没有其他抽屉使用同一挂载点）
      if (!this.isBodyContainer && this.$mountTarget) {
        var hasOtherDrawer = false;
        var self = this;
        Object.keys(instances).forEach(function (key) {
          if (key !== self.index && instances[key] && instances[key].$mountTarget && instances[key].$mountTarget[0] === self.$mountTarget[0]) {
            hasOtherDrawer = true;
          }
        });
        if (!hasOtherDrawer) {
          this.$mountTarget.removeClass('os-drawer-container');
        }
      }

      // 从实例表移除
      delete instances[this.index];

      // 从栈移除
      var stackIdx = -1;
      for (var i = 0; i < instanceStack.length; i++) {
        if (instanceStack[i].index === this.index) {
          stackIdx = i;
          break;
        }
      }
      if (stackIdx > -1) {
        instanceStack.splice(stackIdx, 1);
      }

      // 如果是从最小化状态关闭，重新排列其他最小化抽屉
      if (wasMined) {
        var self2 = this;
        setTimeout(function () {
          Object.keys(instances).forEach(function (key) {
            var inst = instances[key];
            if (inst && inst.state === 'mined') {
              inst.updateMinimizedStackPosition();
            }
          });
        }, 50);
      }

      this.state = 'closed';
    },

    /**
     * 设置标题
     */
    setTitle: function (title) {
      this.$title.text(title);
      if (title) {
        this.$root.removeClass('os-drawer--no-header');
      } else {
        this.$root.addClass('os-drawer--no-header');
      }
    },

    /**
     * 获取根元素 jQuery 对象（兼容 layer 的 layero）
     */
    getLayero: function () {
      return this.$root;
    }
  };

  /**
   * LayDrawer 对外 API
   */
  var LayDrawer = {
    version: '2.0.0',

    /**
     * 打开抽屉
     * @param {Object} options 配置项
     * @returns {Object} 实例对象，包含 close/setTitle/maximize/minimize/restore 方法
     */
    open: function (options) {
      interceptLayerClose();
      var instance = new DrawerInstance(options);
      // 返回兼容 layer 的接口
      var inst = {
        index: instance.index,
        close: function () { instance.close(); },
        maximize: function () { instance.maximize(); },
        minimize: function () { instance.minimize(); },
        restore: function () { instance.restore(); },
        setTitle: function (t) { instance.setTitle(t); },
        $layero: function () { return instance.$root; },
        _instance: instance
      };
      instance._publicInst = inst;
      return inst;
    },

    /**
     * 关闭抽屉
     * @param {Object|number|string} instance 实例对象或 index
     */
    close: function (instance) {
      if (!instance) {
        // 关闭栈顶
        var top = instanceStack[instanceStack.length - 1];
        if (top && instances[top.index]) {
          instances[top.index].close();
        }
        return;
      }
      if (typeof instance === 'object' && instance) {
        if (instance._instance) {
          instance._instance.close();
        } else if (instance.close) {
          instance.close();
        }
      } else if (typeof instance === 'string' || typeof instance === 'number') {
        if (instances[instance]) {
          instances[instance].close();
        } else {
          // 可能是 layer 的 index，转发给 layer
          _originalLayerClose(instance);
        }
      }
    },

    /**
     * 关闭所有抽屉
     */
    closeAll: function () {
      Object.keys(instances).forEach(function (key) {
        if (instances[key]) {
          instances[key].close();
        }
      });
    },

    /**
     * 便捷方法
     */
    right: function (options) {
      return this.open($.extend({ placement: 'right' }, options));
    },
    left: function (options) {
      return this.open($.extend({ placement: 'left' }, options));
    },
    top: function (options) {
      return this.open($.extend({ placement: 'top' }, options));
    },
    bottom: function (options) {
      return this.open($.extend({ placement: 'bottom' }, options));
    }
  };

  exports(MOD_NAME, LayDrawer);
});
