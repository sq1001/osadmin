/**
 * ECharts 图表模块
 */
layui.define(['jquery'], function(exports) {
  'use strict';

  var MOD_NAME = 'echartsMod';
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

  exports(MOD_NAME, echartsOriginal);
});

