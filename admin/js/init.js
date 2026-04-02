(function(){
  try{
    var c=localStorage.getItem('sidebarCollapsed');
    if(c==='true'){
      document.documentElement.classList.add('sidebar-collapsed-init');
    }
  }catch(e){}
})();
