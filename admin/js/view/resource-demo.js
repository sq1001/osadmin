/**
 * 资源加载示例页面 JavaScript
 */

(function() {
  'use strict';

  console.log('[ResourceDemo] 示例页面 JS 已加载');
  console.log('[ResourceDemo] 这个文件通过配置文件方式或页面内联方式加载');

  // 示例：页面初始化代码
  function initDemo() {
    console.log('[ResourceDemo] 页面初始化完成');
    
    // 可以在这里添加页面特定的功能
    if (window.OSLAY && window.OSLAY.modules) {
      var loader = window.OSLAY.modules.resourceLoader;
      
      if (loader) {
        console.log('[ResourceDemo] 资源加载器可用');
        console.log('[ResourceDemo] 已加载的 CSS:', Object.keys(loader.css || {}));
        console.log('[ResourceDemo] 已加载的 JS:', Object.keys(loader.js || {}));
      }
    }
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDemo);
  } else {
    initDemo();
  }

})();
