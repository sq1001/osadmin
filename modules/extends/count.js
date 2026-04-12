/**
 * Count 数字动画模块
 */
layui.define(['jquery', 'element'], function(exports) {
	"use strict";

	var MOD_NAME = 'countMod';
	var	$ = layui.jquery,
		element = layui.element;

	var count = new function() {
		this.version = '1.0.0';

		this.up = function(targetEle, options) {

			options = options || {};

			var $this = document.getElementById(targetEle),
				time = options.time,     
				finalNum = options.num, 
				regulator = options.regulator, 
				step = finalNum / (time / regulator),
				count = 0.00, 
				initial = 0;
				
			var timer = setInterval(function() {
				count = count + step;
				if (count >= finalNum) {
					clearInterval(timer);
					count = finalNum;
				}
				var t = count.toFixed(options.bit?options.bit:0);;
				if (t == initial) return;
				initial = t;
				$this.innerHTML = initial;
			}, 30);
		}

	}
	exports(MOD_NAME, count);
});
