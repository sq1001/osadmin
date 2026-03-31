/**
 * 主应用模块
 * 支持id与code混合路由方案
 */
layui.define(['jquery', 'routerModule', 'themeModule', 'sidebarComp', 'tabsComp'], function(exports) {
  'use strict';

  var $ = layui.jquery;
  var router = layui.routerModule;
  var theme = layui.themeModule;
  var sidebar = layui.sidebarComp;
  var tabs = layui.tabsComp;

  var App = {
    initialized: false,
    appConfig: null,
    menuConfig: null,
    notificationData: [],
    currentAnimation: 'fadeIn',
    baseUrl: '',

    init: function() {
      if (this.initialized) {
        return this;
      }

      var self = this;

      if (window.OSLAY && window.OSLAY.appConfig) {
        this.appConfig = window.OSLAY.appConfig;
        this.menuConfig = window.OSLAY.menuConfig;
        this.initModules();
        this.initialized = true;
        console.log('OSLAY v1.0.0 initialized');
      } else {
        $.when(
          this.loadConfig('config/app.json'),
          this.loadConfig('config/menu.json')
        ).done(function(appResult, menuResult) {
          self.appConfig = appResult[0];
          self.menuConfig = menuResult[0];
          
          self.initModules();
          self.initialized = true;
          
          console.log('OSLAY v1.0.0 initialized');
        }).fail(function(error) {
          console.error('Failed to load config:', error);
        });
      }

      return this;
    },

    loadConfig: function(url) {
      return $.ajax({
        url: url,
        dataType: 'json',
        cache: false
      });
    },

    initModules: function() {
      var self = this;
      var selectId = (this.appConfig.menu && this.appConfig.menu.selectId) || 0;

      this.baseUrl = this.appConfig.router && this.appConfig.router.base ? this.appConfig.router.base : '/';
      
      this.initSite();
      
      router.init(this.appConfig, false);
      
      var menuData = this.getMenuData();
      router.registerMenu(menuData);
      
      theme.init(this.appConfig);
      sidebar.init({ data: menuData || [] });
      tabs.init(this.appConfig, menuData || []);

      router.on('routeChange', function(routeInfo) {
        self.handleRouteChange(routeInfo);
      });

      tabs.on('refreshTab', function(data) {
        self.loadPageContent(data.tabId);
      });

      this.bindGlobalEvents();
      
      var initPath = router.getCurrentPath();
      var initCode = initPath.replace(/^\//, '') || '';
      var initId = router.getIdByCode(initCode);
      
      if (initPath === '/' || initPath === '' || !initCode) {
        router.navigateById(selectId);
      } else {
        this.handleRouteChange({
          path: initPath,
          code: initCode,
          id: initId
        });
      }
    },

    getMenuData: function() {
      if (Array.isArray(this.menuConfig)) {
        return this.menuConfig;
      }
      if (this.menuConfig.menu && this.menuConfig.menu.data) {
        return this.menuConfig.menu.data;
      }
      if (this.menuConfig.data) {
        return this.menuConfig.data;
      }
      return [];
    },

    initSite: function() {
      var site = this.appConfig.site || {};
      
      if (site.title) {
        document.title = site.title;
      }
      
      if (site.keywords) {
        $('meta[name="keywords"]').attr('content', site.keywords);
      }
      
      if (site.description) {
        $('meta[name="description"]').attr('content', site.description);
      }
      
      if (site.name) {
        $('#logoText').text(site.name);
      }
      
      if (site.logo) {
        var logoUrl = this.resolveUrl(site.logo);
        $('#logoIcon').replaceWith('<img src="' + logoUrl + '" alt="' + (site.name || 'Logo') + '" class="layui-logo-img">');
      }
      
      this.loadNotifications();
    },

    loadNotifications: function() {
      var self = this;
      
      var notificationConfig = this.appConfig && this.appConfig.notification ? this.appConfig.notification : {};
      var notificationUrl = notificationConfig.url || 'view/data/notifications.json';
      var cache = notificationConfig.cache !== undefined ? notificationConfig.cache : false;
      
      if (notificationConfig.enabled === false) {
        self.notificationData = [];
        self.renderNotifications();
        return;
      }
      
      $.ajax({
        url: this.resolveUrl(notificationUrl),
        dataType: 'json',
        cache: cache
      }).done(function(data) {
        self.notificationData = data || [];
        self.renderNotifications();
      }).fail(function() {
        self.notificationData = [];
        self.renderNotifications();
      });
    },

    renderNotifications: function() {
      var html = '';
      var unreadCount = 0;
      
      if (this.notificationData.length === 0) {
        html = '<div class="layui-notification-empty"><i class="layui-icon layui-icon-notice"></i><span>暂无通知</span></div>';
      } else {
        this.notificationData.forEach(function(item) {
          if (!item.read) {
            unreadCount++;
          }
          var unreadClass = item.read ? '' : 'unread';
          var hrefAttr = item.href ? ' data-href="' + item.href + '"' : '';
          html += '<div class="layui-notification-item ' + unreadClass + '" data-id="' + item.id + '"' + hrefAttr + '>';
          html += '<div class="layui-notification-item-title">' + item.title + '</div>';
          html += '<div class="layui-notification-item-time">' + item.time + '</div>';
          html += '</div>';
        });
      }
      
      $('#notificationList').html(html);
      
      var $badge = $('#notificationBtn .badge');
      if (unreadCount > 0) {
        $badge.text(unreadCount > 99 ? '99+' : unreadCount).show();
      } else {
        $badge.hide();
      }
    },

    markNotificationRead: function(id) {
      var self = this;
      var targetItem = null;
      this.notificationData.forEach(function(item) {
        if (item.id === id) {
          item.read = true;
          targetItem = item;
        }
      });
      this.renderNotifications();
      
      if (targetItem && targetItem.href) {
        $('#notificationDropdown').removeClass('show');
        router.navigateByCode(targetItem.href);
      }
    },

    markAllNotificationsRead: function() {
      var self = this;
      this.notificationData.forEach(function(item) {
        item.read = true;
      });
      this.renderNotifications();
      layer.msg('已全部标记为已读', { icon: 1, time: 1500 });
    },

    handleRouteChange: function(routeInfo) {
      var selectId = (this.appConfig.menu && this.appConfig.menu.selectId) || 0;
      var pageId = routeInfo.id !== null && routeInfo.id !== undefined ? routeInfo.id : selectId;
      
      tabs.openTab(pageId);
      sidebar.setActive(pageId);
      
      var menuData = this.getMenuData();
      var pageName = this.getPageName(menuData, pageId) || ('Page ' + pageId);
      $('#currentPageName').text(pageName);

      this.loadPageContent(pageId);
    },

    getPageName: function(menuData, pageId) {
      if (!menuData) return null;
      
      for (var i = 0; i < menuData.length; i++) {
        var result = this.findPageNameInItem(menuData[i], pageId);
        if (result) return result;
      }
      return null;
    },

    findPageNameInItem: function(item, pageId) {
      var itemId = item.id !== undefined ? item.id : item.code;
      if (itemId === pageId) {
        return item.title;
      }
      
      if (item.children && item.children.length > 0) {
        for (var i = 0; i < item.children.length; i++) {
          var result = this.findPageNameInItem(item.children[i], pageId);
          if (result) return result;
        }
      }
      
      return null;
    },

    loadPageContent: function(pageId) {
      var url = this.getPageUrl(pageId);
      var self = this;
      var menuData = this.getMenuData();
      var title = this.getPageName(menuData, pageId) || ('Page ' + pageId);
      var animation = theme.getPageAnimation();

      this.currentAnimation = animation;
      this.showLoading();

      if (!url) {
        this.hideLoading();
        this.showContent('<div class="page-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg><div class="page-placeholder-title">' + title + '</div><div class="page-placeholder-desc">页面未找到</div></div>');
        return;
      }

      $.ajax({
        url: url,
        dataType: 'html',
        cache: false
      }).done(function(html) {
        var content = self.extractContent(html);
        self.hideLoading();
        self.showContent(content);
      }).fail(function() {
        self.hideLoading();
        self.showContent('<div class="page-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/></svg><div class="page-placeholder-title">' + title + '</div><div class="page-placeholder-desc">该页面正在开发中...</div></div>');
      });
    },

    showLoading: function() {
      var $wrapper = $('#contentWrapper');
      $wrapper.removeClass('page-anim-fadeIn page-anim-slideDown page-anim-slideLeft page-anim-slideRight');
      $wrapper.html('<div class="layui-loading"><i class="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop"></i><span>加载中...</span></div>');
    },

    hideLoading: function() {
      $('#contentWrapper .layui-loading').remove();
    },

    showContent: function(content) {
      var $wrapper = $('#contentWrapper');
      var animation = this.currentAnimation;
      
      $wrapper.removeClass('page-anim-fadeIn page-anim-slideDown page-anim-slideLeft page-anim-slideRight');
      
      $wrapper.html(content);
      
      var $pageContent = $wrapper.find('.page-content');
      if ($pageContent.length) {
        $pageContent.addClass('page-anim-' + animation);
        $pageContent.addClass('active');
      }
    },

    extractContent: function(html) {
      var headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
      var bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      
      if (headMatch) {
        var links = headMatch[1].match(/<link[^>]*href="[^"]*\.css"[^>]*>/gi) || [];
        links.forEach(function(link) {
          if (!$('head').find('link[href="' + $(link).attr('href') + '"]').length) {
            $('head').append(link);
          }
        });
      }
      
      return bodyMatch ? bodyMatch[1] : html;
    },

    getPageUrl: function(pageId) {
      var menuData = this.getMenuData();
      if (!menuData) return null;

      for (var i = 0; i < menuData.length; i++) {
        var url = this.findPageUrlInItem(menuData[i], pageId);
        if (url) {
          return this.resolveUrl(url);
        }
      }
      return null;
    },

    resolveUrl: function(url) {
      if (!url) return url;
      
      if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0 || url.indexOf('//') === 0) {
        return url;
      }
      
      if (url.charAt(0) === '/') {
        return url;
      }
      
      var base = this.baseUrl;
      if (base.charAt(base.length - 1) !== '/') {
        base += '/';
      }
      
      return base + url;
    },

    findPageUrlInItem: function(item, pageId) {
      var itemId = item.id !== undefined ? item.id : item.code;
      if (itemId === pageId && item.href) {
        return item.href;
      }
      
      if (item.children && item.children.length > 0) {
        for (var i = 0; i < item.children.length; i++) {
          var url = this.findPageUrlInItem(item.children[i], pageId);
          if (url) return url;
        }
      }
      
      return null;
    },

    bindGlobalEvents: function() {
      var self = this;

      $('#reloadBtn').on('click', function() {
        var activeTabId = tabs.getActiveTabId();
        if (activeTabId !== null) {
          self.loadPageContent(activeTabId);
        }
      });

      $('#fullscreenBtn').on('click', function() {
        var $icon = $(this).find('i');
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().then(function() {
            $icon.removeClass('layui-icon-screen-full').addClass('layui-icon-screen-restore');
          }).catch(function(err) {
            console.warn('全屏请求失败:', err);
          });
        } else {
          document.exitFullscreen().then(function() {
            $icon.removeClass('layui-icon-screen-restore').addClass('layui-icon-screen-full');
          });
        }
      });

      $(document).on('fullscreenchange', function() {
        var $icon = $('#fullscreenBtn').find('i');
        if (document.fullscreenElement) {
          $icon.removeClass('layui-icon-screen-full').addClass('layui-icon-screen-restore');
        } else {
          $icon.removeClass('layui-icon-screen-restore').addClass('layui-icon-screen-full');
        }
      });

      $('#themeBtn').on('click', function() {
        theme.toggleConfigPanel();
      });

      $('#themePanelClose, #themePanelOverlay').on('click', function() {
        theme.hideConfigPanel();
      });

      $('#saveThemeBtn').on('click', function() {
        theme.saveConfig();
      });

      $('#resetThemeBtn').on('click', function() {
        theme.resetConfig();
      });

      $('#userDropdown').on('click', function() {
        $('#userDropdownMenu').toggleClass('show');
      });

      $(document).on('click', function(e) {
        if (!$(e.target).closest('.layui-user-dropdown-wrapper').length) {
          $('#userDropdownMenu').removeClass('show');
        }
      });

      $('#userDropdownMenu').on('click', '.layui-user-menu-item', function() {
        var action = $(this).data('action');
        if (action === 'logout') {
          layer.confirm('确定要退出登录吗？', {
            title: '提示',
            btn: ['确定', '取消']
          }, function(index) {
            layer.close(index);
            layer.msg('已退出登录');
          });
        }
        $('#userDropdownMenu').removeClass('show');
      });

      $('#notificationBtn').on('click', function(e) {
        e.stopPropagation();
        $('#notificationDropdown').toggleClass('show');
      });

      $(document).on('click', function(e) {
        if (!$(e.target).closest('.layui-topbar-btn').length) {
          $('#notificationDropdown').removeClass('show');
        }
      });

      $('#notificationList').on('click', '.layui-notification-item', function() {
        var id = $(this).data('id');
        self.markNotificationRead(id);
      });

      $('#markAllRead').on('click', function() {
        self.markAllNotificationsRead();
      });
    }
  };

  exports('appMain', App);
});
