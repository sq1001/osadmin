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
