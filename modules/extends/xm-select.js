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

  (function() {
    var styleId = 'xm-select-theme-override';
    if (!document.getElementById(styleId)) {
      var style = document.createElement('style');
      style.id = styleId;
      style.textContent =
        'xm-select > .xm-body .xm-option.selected.hide-icon .xm-option-content {' +
        '  color: var(--accent, #6366f1) !important;' +
        '}';
      document.head.appendChild(style);
    }
  })();

  exports(MOD_NAME, xmSelectOriginal);
});
