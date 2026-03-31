/**
 * xm-select模块封装
 * 基于Layui的多选下拉框解决方案
 */
layui.define(['jquery'], function(exports) {
  'use strict';

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

  exports('xmSelectMod', xmSelectOriginal);
});
