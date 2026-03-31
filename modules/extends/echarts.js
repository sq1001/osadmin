/**
 * ECharts模块封装
 * 基于Apache ECharts最新版本
 */

layui.define(['jquery'], function(exports) {
  'use strict';

  var $ = layui.jquery;
  var echartsOriginal = window.echarts;

  if (!echartsOriginal) {
    $.ajax({
      url: layui.cache.base + 'lib/echarts/echarts.min.js',
      dataType: 'script',
      cache: true,
      async: false
    });
    echartsOriginal = window.echarts;
  }

  exports('echartsMod', echartsOriginal);
});

