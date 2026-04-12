/**
 * Watermark 水印模块
 * 
 * 功能说明：
 * - 提供页面水印功能
 * - 支持自定义水印文本、样式、位置
 * - 自动监听窗口大小变化
 * - 防止水印被删除或修改
 * - 使用 Canvas 优化性能
 * - 支持缓存机制避免重复生成
 */
layui.define(['jquery', 'element'], function(exports) {
	"use strict";

	var MOD_NAME = 'watermarkMod';
	var $ = layui.$;

	var _cache = {};

	window.addEventListener('beforeunload', function() {
		_cache = {};
	});

	var defaultOptions = {
		content: '水印',
		appendTo: 'body',
		width: 150,
		height: 20,
		rowSpacing: 60,
		colSpacing: 30,
		rotate: -15,
		opacity: 0.1,
		fontSize: 14,
		fontFamily: 'Microsoft YaHei, sans-serif',
		fontColor: '#000000',
		zIndex: 999999
	};

	function getCacheKey(options) {
		return [
			options.content,
			options.fontSize,
			options.fontColor,
			options.opacity,
			options.rotate,
			options.colSpacing,
			options.rowSpacing,
			options.width,
			options.height,
			options.fontFamily
		].join('|');
	}

	function Watermark(options) {
		this._options = Object.assign({}, defaultOptions, options || {});
		this._container = null;
		this._parentEle = null;
		this._wmObserver = null;
		this._wmParentObserver = null;
		this._resizeHandler = null;
		this._canvas = null;
		this._windowsWidth = 0;
		this._windowsHeight = 0;
		this._cacheKey = null;

		this._init();
	}

	Watermark.prototype = {
		constructor: Watermark,

		_init: function() {
			this._createContainer();
			this._createWatermark();
			this._addObserve();
			this._addResizeListener();
		},

		_createContainer: function() {
			this._container = document.createElement('div');
			this._container.classList.add('cell-watermark-container');
			this._container.style.cssText = 'display: block; pointer-events: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden;';
			this._container.setAttribute('aria-hidden', 'true');

			var appendTo = this._options.appendTo;
			if (typeof appendTo === 'string') {
				this._parentEle = document.querySelector(appendTo) || document.body;
			} else if (appendTo && appendTo.nodeType === 1) {
				this._parentEle = appendTo;
			} else {
				this._parentEle = document.body;
			}

			if (getComputedStyle(this._parentEle).position === 'static') {
				this._parentEle.style.position = 'relative';
			}

			this._updateDimensions();
			this._parentEle.appendChild(this._container);
		},

		_updateDimensions: function() {
			this._windowsWidth = Math.max(this._parentEle.scrollWidth, this._parentEle.clientWidth);
			this._windowsHeight = Math.max(this._parentEle.scrollHeight, this._parentEle.clientHeight);
		},

		_createWatermark: function() {
			var options = this._options;
			var cacheKey = getCacheKey(options);
			this._cacheKey = cacheKey;

			if (_cache[cacheKey]) {
				this._container.style.backgroundImage = 'url(' + _cache[cacheKey] + ')';
				this._container.style.backgroundRepeat = 'repeat';
				this._container.style.zIndex = options.zIndex;
				return;
			}

			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');

			var angle = options.rotate * Math.PI / 180;
			var absAngle = Math.abs(angle);
			var sinA = Math.sin(absAngle);
			var cosA = Math.cos(absAngle);

			var singleWidth = options.width + options.colSpacing;
			var singleHeight = options.height + options.rowSpacing;

			var rotatedWidth = singleWidth * cosA + singleHeight * sinA;
			var rotatedHeight = singleWidth * sinA + singleHeight * cosA;

			canvas.width = Math.ceil(rotatedWidth * 2);
			canvas.height = Math.ceil(rotatedHeight * 2);

			ctx.font = options.fontSize + 'px ' + options.fontFamily;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';

			var isRgbaOrHsla = /^(rgba|hsla)\s*\(/i.test(options.fontColor);
			if (isRgbaOrHsla) {
				ctx.fillStyle = options.fontColor;
			} else {
				ctx.fillStyle = options.fontColor;
				ctx.globalAlpha = options.opacity;
			}

			ctx.translate(canvas.width / 2, canvas.height / 2);
			ctx.rotate(angle);

			ctx.fillText(options.content, 0, 0);

			this._canvas = canvas;

			var dataUrl = canvas.toDataURL('image/png');
			_cache[cacheKey] = dataUrl;

			this._container.style.backgroundImage = 'url(' + dataUrl + ')';
			this._container.style.backgroundRepeat = 'repeat';
			this._container.style.zIndex = options.zIndex;
		},

		_addObserve: function() {
			var self = this;

			this._wmObserver = new MutationObserver(function(mutations) {
				if (!self._container) return;
				self._wmObserver.disconnect();
				self._createWatermark();
				self._wmObserver.observe(self._container, {
					attributes: true,
					attributeFilter: ['style', 'class']
				});
			});

			this._wmObserver.observe(this._container, {
				attributes: true,
				attributeFilter: ['style', 'class']
			});

			this._wmParentObserver = new MutationObserver(function(mutations) {
				if (!self._container || !self._parentEle) return;
				for (var i = 0; i < mutations.length; i++) {
					var m = mutations[i];
					if (
						m.type === 'childList' &&
						m.removedNodes.length > 0
					) {
						for (var j = 0; j < m.removedNodes.length; j++) {
							if (m.removedNodes[j] === self._container) {
								self._parentEle.appendChild(self._container);
								break;
							}
						}
					}
				}
			});

			this._wmParentObserver.observe(this._parentEle, {
				childList: true,
				subtree: false
			});
		},

		_addResizeListener: function() {
			var self = this;

			this._resizeHandler = function() {
				var oldWidth = self._windowsWidth;
				var oldHeight = self._windowsHeight;

				self._updateDimensions();

				if (oldWidth !== self._windowsWidth || oldHeight !== self._windowsHeight) {
					self._container.style.width = self._windowsWidth + 'px';
					self._container.style.height = self._windowsHeight + 'px';
				}
			};

			window.addEventListener('resize', this._resizeHandler);
		},

		_render: function() {
			if (!this._container) return;
			this._wmObserver.disconnect();
			this._createWatermark();
			this._wmObserver.observe(this._container, {
				attributes: true,
				attributeFilter: ['style', 'class']
			});
		},

		upload: function(content) {
			if (!content || typeof content !== 'string') {
				return this;
			}
			this._options.content = content;
			this._render();
			return this;
		},

		render: function(options) {
			if (options && typeof options === 'object') {
				this._options = Object.assign({}, this._options, options);
			}
			this._render();
			return this;
		},

		destroy: function() {
			if (this._wmObserver) {
				this._wmObserver.disconnect();
				this._wmObserver = null;
			}
			if (this._wmParentObserver) {
				this._wmParentObserver.disconnect();
				this._wmParentObserver = null;
			}
			if (this._resizeHandler) {
				window.removeEventListener('resize', this._resizeHandler);
				this._resizeHandler = null;
			}
			if (this._container && this._container.parentNode) {
				this._container.parentNode.removeChild(this._container);
			}
			this._container = null;
			this._canvas = null;
			this._parentEle = null;
			return this;
		},

		getOptions: function() {
			return Object.assign({}, this._options);
		},

		setOptions: function(key, value) {
			if (typeof key === 'string') {
				this._options[key] = value;
			} else if (typeof key === 'object') {
				Object.assign(this._options, key);
			}
			return this;
		},

		clearCache: function() {
			_cache = {};
			return this;
		}
	};

	Watermark.clearCache = function() {
		_cache = {};
	};

	Watermark.getCacheSize = function() {
		return Object.keys(_cache).length;
	};

	exports(MOD_NAME, Watermark);
});
