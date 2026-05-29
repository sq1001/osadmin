/**
 * SheetJS (xlsx) 表格导出模块
 */
layui.define(['jquery'], function(exports) {
  'use strict';

  var MOD_NAME = 'xlsxMod';
  var $ = layui.jquery;
  var xlsxOriginal = window.XLSX;

  if (!xlsxOriginal) {
    $.ajax({
      url: layui.cache.base + 'lib/sheet/xlsx.full.min.js',
      dataType: 'script',
      cache: true,
      async: false
    });
    xlsxOriginal = window.XLSX;
  }

  exports(MOD_NAME, xlsxOriginal);
});
