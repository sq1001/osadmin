/**
 * Common 常用工具模块
 */
layui.define(['jquery', 'layer', 'table'], function (exports) {
	'use strict';

	var MOD_NAME = 'commonMod';
	var $ = layui.jquery;
	var table = layui.table;
	var layer = layui.layer;

	var common = {
		version: '1.0.0',

		checkField: function (obj, field) {
			var data = table.checkStatus(obj.config.id).data;
			if (data.length === 0) {
				return '';
			}
			var ids = [];
			for (var i = 0; i < data.length; i++) {
				ids.push(data[i][field]);
			}
			return ids.join(',');
		},

		isMobile: function () {
			return $(window).width() <= 768;
		},

		submit: function (options) {
			var opts = $.extend({
				url: '',
				data: null,
				table: null,
				callback: null
			}, options);

			if (!opts.url) {
				console.error('[Common] submit: url is required');
				return;
			}

			$.ajax({
				url: opts.url,
				data: JSON.stringify(opts.data),
				dataType: 'json',
				contentType: 'application/json',
				type: 'POST',
				success: function (result) {
					if (opts.callback && typeof opts.callback === 'function') {
						opts.callback(result);
						return;
					}

					if (result.code === 0 || result.success) {
						var msg = result.msg || result.message || '操作成功';
						layer.msg(msg, { icon: 1, time: 1000 }, function () {
							if (opts.table) {
								var iframeParent = window.parent;
								if (iframeParent && iframeParent.layui) {
									iframeParent.layui.table.reload(opts.table);
								}
								var frameIndex = iframeParent.layer.getFrameIndex(window.name);
								if (frameIndex) {
									iframeParent.layer.close(frameIndex);
								}
							}
						});
					} else {
						var errMsg = result.msg || result.message || '操作失败';
						layer.msg(errMsg, { icon: 2, time: 2000 });
					}
				},
				error: function (xhr, status, error) {
					layer.msg('请求失败: ' + error, { icon: 2, time: 2000 });
				}
			});
		}
	};

	exports(MOD_NAME, common);
});
