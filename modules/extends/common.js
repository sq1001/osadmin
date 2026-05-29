/**
 * Common 常用工具模块
 */
layui.define(['jquery', 'layer', 'table', 'xlsxMod'], function (exports) {
	'use strict';

	var MOD_NAME = 'commonMod';
	var $ = layui.jquery;
	var table = layui.table;
	var layer = layui.layer;
	var XLSX = layui.xlsxMod;

	var common = {
		version: '1.0.2',

		parseExportCols: function (tableOptions) {
			var cols = (tableOptions && tableOptions.cols && tableOptions.cols[0]) || [];
			var headers = [];
			var fields = [];
			for (var i = 0; i < cols.length; i++) {
				var col = cols[i];
				if (!col.field || !col.title) continue;
				if (col.type === 'checkbox') continue;
				headers.push(col.title.replace(/<[^>]+>/g, '').trim());
				fields.push(col.field);
			}
			if (fields.length === 0) return null;
			return { headers: headers, fields: fields };
		},

		exportXlsx: function (data, tableOptions, fileName) {
			if (!XLSX) {
				layer.msg('SheetJS 未加载，无法导出 Excel', { icon: 2 });
				return;
			}
			if (!data || data.length === 0) {
				layer.msg('没有数据可导出', { icon: 2 });
				return;
			}

			var colInfo = common.parseExportCols(tableOptions);
			if (!colInfo) {
				layer.msg('没有可导出的列', { icon: 2 });
				return;
			}

			var wsData = [colInfo.headers];
			data.forEach(function (row) {
				wsData.push(colInfo.fields.map(function (field) {
					return row[field] != null ? row[field] : '';
				}));
			});

			var wb = XLSX.utils.book_new();
			var ws = XLSX.utils.aoa_to_sheet(wsData);

			ws['!cols'] = colInfo.headers.map(function (h) {
				var wch = 0;
				for (var j = 0; j < h.length; j++) {
					wch += h.charCodeAt(j) > 127 ? 2 : 1;
				}
				return { wch: Math.max(wch + 4, 12) };
			});

			XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
			XLSX.writeFile(wb, fileName || 'export.xlsx');
			layer.msg('Excel 导出成功', { icon: 1 });
		},

		exportTxt: function (data, tableOptions, fileName) {
			if (!data || data.length === 0) {
				layer.msg('没有数据可导出', { icon: 2 });
				return;
			}

			var colInfo = common.parseExportCols(tableOptions);
			if (!colInfo) {
				layer.msg('没有可导出的列', { icon: 2 });
				return;
			}

			var lines = [colInfo.headers.join('\t')];
			data.forEach(function (item) {
				lines.push(colInfo.fields.map(function (k) {
					return item[k] != null ? String(item[k]) : '';
				}).join('\t'));
			});

			var blob = new Blob([lines.join('\r\n')], { type: 'text/plain;charset=utf-8' });
			var link = document.createElement('a');
			link.href = URL.createObjectURL(blob);
			link.download = fileName || 'data.txt';
			link.click();
			URL.revokeObjectURL(link.href);
			layer.msg('TXT 导出成功', { icon: 1 });
		},

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
				method: 'POST',
				contentType: null,
				table: null,
				reloadTable: true,
				closeDialog: false,
				loading: true,
				callback: null
			}, options);

			if (!opts.url) {
				console.error('[Common] submit: url is required');
				return;
			}

			var isIframe = (window.self !== window.top);
			var ajaxOpts = {
				url: opts.url,
				type: opts.method.toUpperCase(),
				dataType: 'json',
				success: function (result) {
					if (loadIndex !== null) {
						layer.close(loadIndex);
						loadIndex = null;
					}

					if (opts.callback && typeof opts.callback === 'function') {
						var cbResult = opts.callback(result);
						if (cbResult === false) return;
					}

					if (result.code === 0 || result.success) {
						var msg = result.msg || result.message || '操作成功';
						layer.msg(msg, { icon: 1, time: 1000 }, function () {
							if (opts.table && opts.reloadTable) {
								if (isIframe && window.parent && window.parent.layui) {
									window.parent.layui.table.reload(opts.table);
								} else {
									table.reload(opts.table);
								}
							}
							if (opts.closeDialog) {
								if (isIframe && window.parent && window.parent.layer) {
									var frameIndex = window.parent.layer.getFrameIndex(window.name);
									if (frameIndex) window.parent.layer.close(frameIndex);
								} else {
									layer.closeAll('page');
								}
							}
						});
					} else {
						var errMsg = result.msg || result.message || '操作失败';
						layer.msg(errMsg, { icon: 2, time: 2000 });
					}
				},
				error: function (xhr, status, error) {
					if (loadIndex !== null) {
						layer.close(loadIndex);
						loadIndex = null;
					}
					layer.msg('请求失败: ' + error, { icon: 2, time: 2000 });
				}
			};

			if (opts.contentType === 'json') {
				ajaxOpts.contentType = 'application/json';
				ajaxOpts.data = JSON.stringify(opts.data);
			} else {
				ajaxOpts.data = opts.data;
			}

			var loadIndex = null;
			if (opts.loading) {
				loadIndex = layer.load(1, { shade: [0.1, '#000'] });
			}

			$.ajax(ajaxOpts);
		}
	};

	exports(MOD_NAME, common);
});
