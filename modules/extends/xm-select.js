/**
 * xm-select 多选下拉框模块
 */
layui.define(['jquery'], function(exports) {
  'use strict';

  var MOD_NAME = 'xmSelectMod';
  var $ = layui.jquery;
  var xmSelectOriginal = window.xmSelect;

  if (!xmSelectOriginal) {
    $.ajax({
      url: layui.cache.base + 'lib/xm-select/xm-select.js',
      dataType: 'script',
      cache: true,
      async: false
    });
    xmSelectOriginal = window.xmSelect;
  }

  exports(MOD_NAME, xmSelectOriginal);
});
