(function(){
  try{
    var c=localStorage.getItem('sidebarCollapsed');
    if(c==='true'){
      document.documentElement.classList.add('sidebar-collapsed-init');
    }
  }catch(e){}

  window.OSLAY_HIDE_SKELETON = function() {
    var skeleton = document.getElementById('skeletonScreen');
    var app = document.getElementById('appWrapper');
    if (skeleton) {
      skeleton.style.display = 'none';
    }
    if (app) {
      app.classList.add('loaded');
    }
  };

  // 骨架屏超时保护：8秒后若骨架屏仍未隐藏，强制隐藏并输出警告
  // 防止 CF Pages 等部署环境下因模块加载失败或 Promise pending 导致永久卡死
  window.OSLAY_SKELETON_TIMEOUT = setTimeout(function() {
    var skeleton = document.getElementById('skeletonScreen');
    if (skeleton && skeleton.style.display !== 'none') {
      console.warn('[OSLAY] 骨架屏超时强制隐藏（8s），可能存在资源加载失败');
      if (window.OSLAY_HIDE_SKELETON) {
        window.OSLAY_HIDE_SKELETON();
      }
    }
  }, 8000);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('admin/js/service-worker.js')
        .then(function(registration) {
          console.log('[SW] 注册成功:', registration.scope);
        })
        .catch(function(err) {
          console.log('[SW] 注册失败:', err);
        });
    });
  }
})();
