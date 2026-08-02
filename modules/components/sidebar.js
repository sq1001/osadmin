/**
 * 侧边栏组件
 * 支持多级菜单，大于2级统一使用下拉菜单
 * 内部使用id标识，URL使用code
 * 
 * type 定义:
 *   0 - 目录 (有 children)
 *   1 - 菜单 (有 href)
 * 
 * openType 定义 (仅菜单类型有效):
 *   _blank  - 新标签页打开
 *   _iframe - 内嵌 iframe
 *   _dialog - 弹窗打开
 *   无      - 默认内部页面加载
 */
layui.define(['jquery', 'layer', 'themeModule', 'routerModule', 'commonMod'], function(exports) {
  'use strict';

  var $ = layui.jquery;
  var theme = layui.themeModule;
  var router = layui.routerModule;
  var layer = layui.layer;
  var common = layui.commonMod;
  var menuData = null;
  var sidebarConfig = null;

  var Sidebar = {
    collapsed: false,
  currentSubmenuPanel: null,
  currentDropdownMenu: null,
  currentTopbarDropdown: null,
  // 保存每个顶级菜单对应的子菜单展开状态
  submenuPanelExpandedStates: {},

    init: function(config) {
      menuData = config ? (config.data || []) : [];
      sidebarConfig = config || {};
      this.render();
      this.renderTopbarMenu();
      this.loadCollapseState();
      this.bindEvents();
      this.bindTopbarMenuEvents();
      this.bindBreadcrumbEvents();
      this.initGlobalSearch();
      // 初始化时主动渲染面包屑（如果可见）
      var $bc = $('#breadcrumbContainer');
      if ($bc.length && !$bc.hasClass('hidden')) {
        this.renderBreadcrumb();
      }
      // 混合布局初始化：默认显示第一个目录的子菜单
      var state = theme && theme.getState ? theme.getState() : { layout: 'double' };
      if (state.layout === 'mixed' && menuData.length > 0) {
        var firstDir = null;
        for (var i = 0; i < menuData.length; i++) {
          if (this.getMenuItemType(menuData[i]) === 0 && menuData[i].children && menuData[i].children.length > 0) {
            firstDir = menuData[i];
            break;
          }
        }
        if (firstDir) {
          var firstId = firstDir.id !== undefined ? firstDir.id : firstDir.code;
          var $firstItem = $('.menu-item[data-id="' + firstId + '"]');
          this.showSubmenuPanel(firstId, $firstItem);
          // 默认激活第一个目录的顶栏菜单项
          $('.topbar-menu-item').removeClass('active');
          $('.topbar-menu-item[data-id="' + firstId + '"]').addClass('active');
        }
      }
      return this;
    },

    isExternalUrl: function(href) {
      if (!href) return false;
      return href.indexOf('http://') === 0 || href.indexOf('https://') === 0 || href.indexOf('//') === 0;
    },

    preloadPageResources: function(href) {
      if (window.layui && window.layui.resourceLoader) {
        window.layui.resourceLoader.preloadPageResources(href);
      }
    },

    preloadPageResourcesThrottled: function(href) {
      if (window.layui && window.layui.resourceLoader) {
        window.layui.resourceLoader.preloadPageResourcesThrottled(href);
      }
    },

    getMenuItemType: function(item) {
      if (item.type !== undefined) {
        return item.type;
      }
      if (item.children && item.children.length > 0) {
        return 0;
      }
      return 1;
    },

    loadCollapseState: function() {
      try {
        var isMobile = window.innerWidth <= 768;
        if (isMobile) {
          this.collapsed = false;
          $('#sidebar').removeClass('collapsed');
          document.documentElement.classList.remove('sidebar-collapsed-init');
          return;
        }
        var saved = localStorage.getItem('sidebarCollapsed');
        if (saved === 'true') {
          this.collapsed = true;
          $('#sidebar').addClass('collapsed');
        } else {
          this.collapsed = false;
          $('#sidebar').removeClass('collapsed');
        }
        setTimeout(function() {
          document.documentElement.classList.remove('sidebar-collapsed-init');
        }, 50);
      } catch (e) {
        this.collapsed = false;
        document.documentElement.classList.remove('sidebar-collapsed-init');
      }
    },

    saveCollapseState: function() {
      try {
        localStorage.setItem('sidebarCollapsed', this.collapsed ? 'true' : 'false');
      } catch (e) {}
    },

    render: function() {
      var html = this.buildSidebarHTML();
      $('#sidebarMenu').html(html);
    },

    buildSidebarHTML: function() {
      var html = '<div class="menu-section">主菜单</div>';
      var self = this;
      
      menuData.forEach(function(item) {
        if (item.hidden) return;
        html += self.buildMenuItemHTML(item, 1);
      });
      
      return html;
    },

    buildMenuItemHTML: function(item, level) {
      var self = this;
      var itemType = this.getMenuItemType(item);
      var isDirectory = itemType === 0;
      var hasChildren = !isDirectory && item.children && item.children.length > 0;
      var itemId = item.id !== undefined ? item.id : item.code;
      var isExternal = !isDirectory && item.href && this.isExternalUrl(item.href);
      
      var html = '<div class="menu-item" data-id="' + itemId + '" data-level="' + level + '" data-type="' + itemType + '"';
      if (!isDirectory && item.href) {
        html += ' data-href="' + item.href + '"';
      }
      if (item.openType) {
        html += ' data-open-type="' + item.openType + '"';
      }
      if (isExternal) {
        html += ' data-external="true"';
      }
      html += '>';
      html += '<span class="menu-icon"><i class="layui-icon ' + item.icon + '"></i></span>';
      html += '<span class="menu-text">' + item.title + '</span>';
      
      if (item.badge) {
        html += '<span class="menu-badge">' + item.badge + '</span>';
      }
      
      if (isDirectory) {
        html += '<span class="menu-arrow"><i class="layui-icon layui-icon-right"></i></span>';
      }
      
      html += '</div>';
      
      if (isDirectory && level < 2) {
        html += '<div class="submenu" data-parent="' + itemId + '">';
        item.children.forEach(function(child) {
          var childType = self.getMenuItemType(child);
          if (childType === 0) {
            html += self.buildSubmenuItemWithDropdown(child, level + 1);
          } else {
            html += self.buildSubmenuItemHTML(child, level + 1);
          }
        });
        html += '</div>';
      }
      
      return html;
    },

    buildSubmenuItemHTML: function(item, level) {
      var childIcon = item.icon || 'layui-icon-circle';
      var itemId = item.id !== undefined ? item.id : item.code;
      var itemType = this.getMenuItemType(item);
      var isExternal = item.href && this.isExternalUrl(item.href);
      
      var html = '<a class="submenu-item" data-id="' + itemId + '" data-level="' + level + '" data-type="' + itemType + '"';
      if (item.href) {
        html += ' data-href="' + item.href + '"';
      }
      if (item.openType) {
        html += ' data-open-type="' + item.openType + '"';
      }
      if (isExternal) {
        html += ' data-external="true"';
      }
      html += '>';
      html += '<span class="menu-icon"><i class="layui-icon ' + childIcon + '"></i></span>';
      html += '<span class="menu-text">' + item.title + '</span>';
      html += '</a>';
      return html;
    },

    buildSubmenuItemWithDropdown: function(item, level) {
      var childIcon = item.icon || 'layui-icon-circle';
      var itemType = this.getMenuItemType(item);
      var isDirectory = itemType === 0;
      var itemId = item.id !== undefined ? item.id : item.code;
      
      var html = '<div class="submenu-item-wrapper" data-id="' + itemId + '" data-type="' + itemType + '">';
      html += '<a class="submenu-item submenu-item-dropdown" data-id="' + itemId + '" data-level="' + level + '" data-has-dropdown="' + isDirectory + '"';
      if (!isDirectory && item.href) {
        html += ' data-href="' + item.href + '"';
      }
      if (item.openType) {
        html += ' data-open-type="' + item.openType + '"';
      }
      html += '>';
      html += '<span class="menu-icon"><i class="layui-icon ' + childIcon + '"></i></span>';
      html += '<span class="menu-text">' + item.title + '</span>';
      if (isDirectory) {
        html += '<span class="menu-dropdown-arrow"><i class="layui-icon layui-icon-right"></i></span>';
      }
      html += '</a>';
      
      if (isDirectory) {
        html += this.buildNestedDropdownHTML(item.children, level + 1);
      }
      
      html += '</div>';
      return html;
    },

    buildNestedDropdownHTML: function(children, level) {
      var self = this;
      var html = '<div class="nested-dropdown" data-level="' + level + '">';
      children.forEach(function(child) {
        var childIcon = child.icon || 'layui-icon-circle';
        var childType = self.getMenuItemType(child);
        var isDirectory = childType === 0;
        var itemId = child.id !== undefined ? child.id : child.code;
        var isExternal = !isDirectory && child.href && self.isExternalUrl(child.href);
        
        if (isDirectory) {
          html += '<div class="nested-dropdown-item-wrapper" data-id="' + itemId + '" data-type="' + childType + '">';
          html += '<a class="nested-dropdown-item" data-id="' + itemId + '" data-level="' + level + '" data-has-dropdown="true">';
          html += '<span class="menu-icon"><i class="layui-icon ' + childIcon + '"></i></span>';
          html += '<span class="menu-text">' + child.title + '</span>';
          html += '<span class="menu-dropdown-arrow"><i class="layui-icon layui-icon-right"></i></span>';
          html += '</a>';
          html += self.buildNestedDropdownHTML(child.children, level + 1);
          html += '</div>';
        } else {
          html += '<a class="nested-dropdown-item" data-id="' + itemId + '" data-level="' + level + '" data-type="' + childType + '"';
          if (child.href) {
            html += ' data-href="' + child.href + '"';
          }
          if (child.openType) {
            html += ' data-open-type="' + child.openType + '"';
          }
          if (isExternal) {
            html += ' data-external="true"';
          }
          html += '>';
          html += '<span class="menu-icon"><i class="layui-icon ' + childIcon + '"></i></span>';
          html += '<span class="menu-text">' + child.title + '</span>';
          html += '</a>';
        }
      }, this);
      html += '</div>';
      return html;
    },

    bindEvents: function() {
      var self = this;

      // 菜单项悬浮预加载页面资源
      $('#sidebarMenu').on('mouseenter', '.menu-item, .submenu-item, .nested-dropdown-item', function(e) {
        var $this = $(this);
        var href = $this.data('href');
        var itemType = $this.data('type');
        
        if (itemType === 1 && href && !self.isExternalUrl(href)) {
          self.preloadPageResourcesThrottled(href);
        }
      });

      $('#sidebarMenu').on('click', '.menu-item', function(e) {
        e.stopPropagation();
        var $this = $(this);
        var menuId = $this.data('id');
        var level = $this.data('level');
        var itemType = $this.data('type');
        var href = $this.data('href');
        var openType = $this.data('open-type');
        var isExternal = $this.data('external') === true || $this.data('external') === 'true';
        
        self.handleMenuClick(menuId, itemType, href, openType, isExternal, $this, level);
      });

      $('#sidebarMenu').on('click', '.submenu-item:not(.submenu-item-dropdown)', function(e) {
        e.stopPropagation();
        e.preventDefault();
        var $this = $(this);
        var pageId = $this.data('id');
        var itemType = $this.data('type');
        var href = $this.data('href');
        var openType = $this.data('open-type');
        var isExternal = $this.data('external') === true || $this.data('external') === 'true';
        
        self.handleSubmenuItemClick(pageId, itemType, href, openType, isExternal);
        if (window.innerWidth <= 768) {
          self.closeMobileSidebar();
        }
      });

      $('#sidebarMenu').on('click', '.submenu-item-dropdown', function(e) {
        e.stopPropagation();
        e.preventDefault();
        var $this = $(this);
        var $wrapper = $this.closest('.submenu-item-wrapper');
        var $dropdown = $wrapper.find('.nested-dropdown').first();
        var wasOpen = $wrapper.hasClass('open');
        var state = theme.getState();
        
        if (state.accordion && !wasOpen) {
          $wrapper.siblings('.submenu-item-wrapper.open').each(function() {
            $(this).removeClass('open');
            $(this).find('.nested-dropdown.show').removeClass('show');
          });
        }
        
        if ($dropdown.length) {
          $wrapper.toggleClass('open', !wasOpen);
          $dropdown.toggleClass('show', !wasOpen);
        }
      });

      $('#sidebarMenu').on('click', '.nested-dropdown-item[data-has-dropdown="true"]', function(e) {
        e.stopPropagation();
        e.preventDefault();
        var $this = $(this);
        var $wrapper = $this.closest('.nested-dropdown-item-wrapper');
        var $dropdown = $wrapper.find('.nested-dropdown').first();
        var wasOpen = $wrapper.hasClass('open');
        var state = theme.getState();
        
        if (state.accordion && !wasOpen) {
          $wrapper.siblings('.nested-dropdown-item-wrapper.open').each(function() {
            $(this).removeClass('open');
            $(this).find('.nested-dropdown.show').removeClass('show');
          });
        }
        
        if ($dropdown.length) {
          $wrapper.toggleClass('open', !wasOpen);
          $dropdown.toggleClass('show', !wasOpen);
        }
      });

      $('#sidebarMenu').on('click', '.nested-dropdown-item:not([data-has-dropdown="true"])', function(e) {
        e.stopPropagation();
        e.preventDefault();
        var $this = $(this);
        var pageId = $this.data('id');
        var itemType = $this.data('type');
        var href = $this.data('href');
        var openType = $this.data('open-type');
        var isExternal = $this.data('external') === true || $this.data('external') === 'true';
        
        self.handleSubmenuItemClick(pageId, itemType, href, openType, isExternal);
        if (window.innerWidth <= 768) {
          self.closeMobileSidebar();
        }
      });

      $('.collapse-btn').on('click', function() {
        self.toggleCollapse();
      });

      $('#mobileMenuFab').on('click', function() {
        self.toggleMobileSidebar();
      });

      $('#sidebarOverlay').on('click', function() {
        self.closeMobileSidebar();
      });

      $(document).on('click', function(e) {
        if (!$(e.target).closest('.layui-sidebar, .layui-submenu-panel, .layui-dropdown-menu-panel-wrapper, .layui-mobile-menu-fab, .layui-theme-config-panel').length) {
          var state = theme.getState();
          
          if (state.layout !== 'fixed-double' && state.layout !== 'double' && state.layout !== 'mixed') {
            self.hideSubmenuPanel();
            self.hideDropdownMenu();
            self.closeAllNestedDropdowns();
          } else if (state.layout === 'double') {
            self.hideSubmenuPanel();
            self.hideDropdownMenu();
          } else {
            self.hideDropdownMenu();
          }
        }
      });

      $(window).on('resize', function() {
        var isMobile = window.innerWidth <= 768;
        if (isMobile) {
          if (self.collapsed) {
            self.collapsed = false;
            $('#sidebar').removeClass('collapsed');
          }
          self.hideSubmenuPanel();
          self.hideDropdownMenu();
          self.closeAllNestedDropdowns();
        } else {
          self.closeMobileSidebar();
        }
      });
    },

    handleMenuClick: function(menuId, itemType, href, openType, isExternal, $el, level) {
      var isDirectory = itemType === 0;
      
      if (isDirectory) {
        if (window.innerWidth <= 768) {
          var mobileState = theme.getState();
          this.toggleSubmenu($el, menuId, mobileState);
          return;
        }
        
        var state = theme.getState();
        
        if (state.layout === 'double' || state.layout === 'fixed-double' || state.layout === 'mixed') {
          this.showSubmenuPanel(menuId, $el);
          this.hideDropdownMenu();
        } else {
          if (this.collapsed) {
            if (this.currentDropdownMenu === menuId) {
              this.hideDropdownMenu();
            } else {
              this.showDropdownMenu(menuId, $el);
            }
            this.hideSubmenuPanel();
          } else {
            this.toggleSubmenu($el, menuId, state);
            this.hideSubmenuPanel();
            this.hideDropdownMenu();
          }
        }
        return;
      }
      
      this.handleSubmenuItemClick(menuId, itemType, href, openType, isExternal);
      this.hideSubmenuPanel();
      this.hideDropdownMenu();
    },

    handleSubmenuItemClick: function(pageId, itemType, href, openType, isExternal) {
      if (itemType === 0) {
        return;
      }
      
      if (isExternal && openType === '_blank') {
        window.open(href, '_blank');
        return;
      }
      
      if (isExternal && openType === '_dialog') {
        layer.open({
          type: 2,
          title: ' ',
          content: href,
          closeBtn: 1,
          area: common.isMobile() ? ['100%', '100%'] : ['550px', '600px'],
          shadeClose: true,
          maxmin: true
        });
        return;
      }
      
      router.navigateById(pageId);
    },

    toggleSubmenu: function($el, menuId, state) {
      var wasExpanded = $el.hasClass('expanded');
      
      if (state.accordion && !wasExpanded) {
        $('#sidebarMenu .menu-item.expanded').each(function() {
          $(this).removeClass('expanded');
          var $submenu = $(this).next('.submenu');
          if ($submenu.length) {
            $submenu.removeClass('open');
          }
        });
        $('#sidebarMenu .submenu-item-wrapper.open').each(function() {
          $(this).removeClass('open');
          $(this).find('.nested-dropdown.show').removeClass('show');
        });
      }
      
      $el.toggleClass('expanded', !wasExpanded);
      var $submenu = $el.next('.submenu');
      if ($submenu.length) {
        $submenu.toggleClass('open', !wasExpanded);
      }
    },

    showSubmenuPanel: function(menuId, $triggerEl, targetPageId) {
      var menu = this.findMenu(menuId);
      if (!menu || !menu.children) return;

      // 获取保存的展开状态
      var expandedStates = this.submenuPanelExpandedStates[menuId] || {};
      
      var html = '';
      html = this.buildSubmenuPanelContent(menu.children, 2, expandedStates);

      $('#submenuPanelTitle').text(menu.title);
      $('#submenuPanelContent').html(html);
      $('#submenuPanel').addClass('show');
      
      this.currentSubmenuPanel = menuId;
      
      this.bindSubmenuPanelEvents();
      
      var currentId = targetPageId || router.getCurrentId();
      if (currentId !== null) {
        // 直接设置激活状态，不调用 setActive
        var state = theme.getState();
        var menuPath = this.findMenuPath(menuData, currentId);
        this.setActiveItems(currentId, menuPath, state);
      }
    },

    buildSubmenuPanelContent: function(children, level, expandedStates) {
      var self = this;
      var html = '';
      
      children.forEach(function(child) {
        var childIcon = child.icon || 'layui-icon-circle';
        var childType = self.getMenuItemType(child);
        var isDirectory = childType === 0;
        var itemId = child.id !== undefined ? child.id : child.code;
        var isExternal = !isDirectory && child.href && self.isExternalUrl(child.href);
        var isExpanded = expandedStates && expandedStates[itemId] === true;
        
        if (isDirectory) {
          html += '<div class="submenu-panel-group' + (isExpanded ? ' open' : '') + '" data-id="' + itemId + '" data-type="' + childType + '">';
          html += '<div class="submenu-panel-item submenu-panel-group-title" data-id="' + itemId + '" data-level="' + level + '" data-has-dropdown="true">';
          html += '<span class="menu-icon"><i class="layui-icon ' + childIcon + '"></i></span>';
          html += '<span class="menu-text">' + child.title + '</span>';
          html += '<span class="menu-dropdown-arrow"><i class="layui-icon ' + (isExpanded ? 'layui-icon-up' : 'layui-icon-down') + '"></i></span>';
          html += '</div>';
          html += self.buildSubmenuPanelDropdown(child.children, level + 1, expandedStates, isExpanded);
          html += '</div>';
        } else {
          html += '<a class="submenu-panel-item" data-id="' + itemId + '" data-level="' + level + '" data-type="' + childType + '"';
          if (child.href) {
            html += ' data-href="' + child.href + '"';
          }
          if (child.openType) {
            html += ' data-open-type="' + child.openType + '"';
          }
          if (isExternal) {
            html += ' data-external="true"';
          }
          html += '>';
          html += '<span class="menu-icon"><i class="layui-icon ' + childIcon + '"></i></span>';
          html += '<span class="menu-text">' + child.title + '</span>';
          html += '</a>';
        }
      });
      
      return html;
    },

    buildSubmenuPanelDropdown: function(children, level, expandedStates, parentExpanded) {
      var self = this;
      var html = '<div class="submenu-panel-dropdown' + (parentExpanded ? ' show' : '') + '" data-level="' + level + '">';
      
      children.forEach(function(child) {
        var childIcon = child.icon || 'layui-icon-circle';
        var childType = self.getMenuItemType(child);
        var isDirectory = childType === 0;
        var itemId = child.id !== undefined ? child.id : child.code;
        var isExternal = !isDirectory && child.href && self.isExternalUrl(child.href);
        var isExpanded = expandedStates && expandedStates[itemId] === true;
        
        if (isDirectory) {
          html += '<div class="submenu-panel-dropdown-group' + (isExpanded ? ' open' : '') + '" data-id="' + itemId + '" data-type="' + childType + '">';
          html += '<a class="submenu-panel-dropdown-item" data-id="' + itemId + '" data-level="' + level + '" data-has-dropdown="true">';
          html += '<span class="menu-icon"><i class="layui-icon ' + childIcon + '"></i></span>';
          html += '<span class="menu-text">' + child.title + '</span>';
          html += '<span class="menu-dropdown-arrow"><i class="layui-icon layui-icon-right"></i></span>';
          html += '</a>';
          html += self.buildSubmenuPanelDropdown(child.children, level + 1, expandedStates, isExpanded);
          html += '</div>';
        } else {
          html += '<a class="submenu-panel-dropdown-item" data-id="' + itemId + '" data-level="' + level + '" data-type="' + childType + '"';
          if (child.href) {
            html += ' data-href="' + child.href + '"';
          }
          if (child.openType) {
            html += ' data-open-type="' + child.openType + '"';
          }
          if (isExternal) {
            html += ' data-external="true"';
          }
          html += '>';
          html += '<span class="menu-icon"><i class="layui-icon ' + childIcon + '"></i></span>';
          html += '<span class="menu-text">' + child.title + '</span>';
          html += '</a>';
        }
      });
      
      html += '</div>';
      return html;
    },

    bindSubmenuPanelEvents: function() {
      var self = this;

      $('#submenuPanelContent').off('click', '.submenu-panel-item:not([data-has-dropdown="true"])').on('click', '.submenu-panel-item:not([data-has-dropdown="true"])', function(e) {
        e.preventDefault();
        var $this = $(this);
        var pageId = $this.data('id');
        var itemType = $this.data('type');
        var href = $this.data('href');
        var openType = $this.data('open-type');
        var isExternal = $this.data('external') === true || $this.data('external') === 'true';
        
        self.handleSubmenuItemClick(pageId, itemType, href, openType, isExternal);
      });

      $('#submenuPanelContent').off('click', '.submenu-panel-group-title').on('click', '.submenu-panel-group-title', function(e) {
        e.preventDefault();
        var $group = $(this).closest('.submenu-panel-group');
        var $dropdown = $group.find('.submenu-panel-dropdown').first();
        var itemId = $group.data('id');
        var wasOpen = $group.hasClass('open');
        var state = theme.getState();
        
        if (state.accordion && !wasOpen) {
          $group.siblings('.submenu-panel-group.open').each(function() {
            $(this).removeClass('open');
            $(this).find('.submenu-panel-dropdown.show').removeClass('show');
            $(this).find('.menu-dropdown-arrow i').removeClass('layui-icon-up').addClass('layui-icon-down');
            // 更新状态
            var siblingId = $(this).data('id');
            if (self.currentSubmenuPanel && siblingId) {
              if (!self.submenuPanelExpandedStates[self.currentSubmenuPanel]) {
                self.submenuPanelExpandedStates[self.currentSubmenuPanel] = {};
              }
              self.submenuPanelExpandedStates[self.currentSubmenuPanel][siblingId] = false;
            }
          });
        }
        
        $group.toggleClass('open', !wasOpen);
        $dropdown.toggleClass('show', !wasOpen);
        $(this).find('.menu-dropdown-arrow i').toggleClass('layui-icon-down layui-icon-up');
        
        // 保存展开状态
        if (self.currentSubmenuPanel && itemId) {
          if (!self.submenuPanelExpandedStates[self.currentSubmenuPanel]) {
            self.submenuPanelExpandedStates[self.currentSubmenuPanel] = {};
          }
          self.submenuPanelExpandedStates[self.currentSubmenuPanel][itemId] = !wasOpen;
        }
      });

      $('#submenuPanelContent').off('click', '.submenu-panel-dropdown-item[data-has-dropdown="true"]').on('click', '.submenu-panel-dropdown-item[data-has-dropdown="true"]', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var $group = $(this).closest('.submenu-panel-dropdown-group');
        var $dropdown = $group.find('.submenu-panel-dropdown').first();
        var itemId = $group.data('id');
        var wasOpen = $group.hasClass('open');
        var state = theme.getState();
        
        if (state.accordion && !wasOpen) {
          $group.siblings('.submenu-panel-dropdown-group.open').each(function() {
            $(this).removeClass('open');
            $(this).find('.submenu-panel-dropdown.show').removeClass('show');
            // 更新状态
            var siblingId = $(this).data('id');
            if (self.currentSubmenuPanel && siblingId) {
              if (!self.submenuPanelExpandedStates[self.currentSubmenuPanel]) {
                self.submenuPanelExpandedStates[self.currentSubmenuPanel] = {};
              }
              self.submenuPanelExpandedStates[self.currentSubmenuPanel][siblingId] = false;
            }
          });
        }
        
        $group.toggleClass('open', !wasOpen);
        $dropdown.toggleClass('show', !wasOpen);
        
        // 保存展开状态
        if (self.currentSubmenuPanel && itemId) {
          if (!self.submenuPanelExpandedStates[self.currentSubmenuPanel]) {
            self.submenuPanelExpandedStates[self.currentSubmenuPanel] = {};
          }
          self.submenuPanelExpandedStates[self.currentSubmenuPanel][itemId] = !wasOpen;
        }
      });

      $('#submenuPanelContent').off('click', '.submenu-panel-dropdown-item:not([data-has-dropdown="true"])').on('click', '.submenu-panel-dropdown-item:not([data-has-dropdown="true"])', function(e) {
        e.preventDefault();
        var $this = $(this);
        var pageId = $this.data('id');
        var itemType = $this.data('type');
        var href = $this.data('href');
        var openType = $this.data('open-type');
        var isExternal = $this.data('external') === true || $this.data('external') === 'true';
        
        self.handleSubmenuItemClick(pageId, itemType, href, openType, isExternal);
      });
    },

    hideSubmenuPanel: function() {
      $('#submenuPanel').removeClass('show');
      $('#submenuPanelTitle').text('');
      $('#submenuPanelContent').html('');
      this.currentSubmenuPanel = null;
    },

    showDropdownMenu: function(menuId, $triggerEl, targetPageId) {
      var menu = this.findMenu(menuId);
      if (!menu || !menu.children) return;

      this.currentDropdownMenu = menuId;

      // 读取触发元素位置
      var rect = $triggerEl[0].getBoundingClientRect();
      var panelWidth = 180;
      var viewportWidth = window.innerWidth;

      var html = this.buildDropdownMenuContent(menu.children, 2);

      $('#dropdownMenuContent').html(html);
      
      // 让悬浮菜单直接对齐侧边栏右侧（64px位置）
      var leftPos = 64;
      if (leftPos + panelWidth > viewportWidth - 16) {
        leftPos = viewportWidth - panelWidth - 16;
      }
      
      var topPos = rect.top;
      var estimatedHeight = this.estimateDropdownHeight(menu.children) + 16;
      if (topPos + estimatedHeight > window.innerHeight - 16) {
        topPos = window.innerHeight - estimatedHeight - 16;
        if (topPos < 60) topPos = 60;
      }

      var maxHeight = window.innerHeight - topPos - 16;
      if (maxHeight < 100) maxHeight = 100;

      // 计算三角指示器的位置：让它始终指向触发元素的中心
      var triggerCenter = rect.top + rect.height / 2;
      var arrowTop = triggerCenter - topPos - 6;
      arrowTop = Math.max(8, Math.min(arrowTop, estimatedHeight - 16));

      var $wrapper = $('#dropdownMenuPanelWrapper');
      var $panel = $wrapper.find('.layui-dropdown-menu-panel');
      
      $wrapper[0].style.cssText = 'left:' + leftPos + 'px;top:' + topPos + 'px;--arrow-top:' + arrowTop + 'px;';
      $panel[0].style.maxHeight = maxHeight + 'px';
      $wrapper.addClass('show');
      
      this.bindDropdownMenuEvents();
      
      var currentId = targetPageId || router.getCurrentId();
      if (currentId !== null) {
        // 直接设置激活状态，不调用setActive
        var state = theme.getState();
        var menuPath = this.findMenuPath(menuData, currentId);
        this.setActiveItems(currentId, menuPath, state);
      }
    },

    buildDropdownMenuContent: function(children, level) {
      var self = this;
      var html = '';
      
      children.forEach(function(child) {
        var childIcon = child.icon || 'layui-icon-circle';
        var childType = self.getMenuItemType(child);
        var isDirectory = childType === 0;
        var itemId = child.id !== undefined ? child.id : child.code;
        var isExternal = !isDirectory && child.href && self.isExternalUrl(child.href);
        
        if (isDirectory) {
          html += '<div class="dropdown-menu-group" data-id="' + itemId + '" data-type="' + childType + '">';
          html += '<div class="dropdown-menu-item dropdown-menu-group-title" data-id="' + itemId + '" data-level="' + level + '" data-has-dropdown="true">';
          html += '<span class="menu-icon"><i class="layui-icon ' + childIcon + '"></i></span>';
          html += '<span class="menu-text">' + child.title + '</span>';
          html += '<span class="menu-dropdown-arrow"><i class="layui-icon layui-icon-right"></i></span>';
          html += '</div>';
          html += '<div class="dropdown-submenu">';
          html += self.buildDropdownMenuContent(child.children, level + 1);
          html += '</div>';
          html += '</div>';
        } else {
          html += '<a class="dropdown-menu-item" data-id="' + itemId + '" data-level="' + level + '" data-type="' + childType + '"';
          if (child.href) {
            html += ' data-href="' + child.href + '"';
          }
          if (child.openType) {
            html += ' data-open-type="' + child.openType + '"';
          }
          if (isExternal) {
            html += ' data-external="true"';
          }
          html += '>';
          html += '<span class="menu-icon"><i class="layui-icon ' + childIcon + '"></i></span>';
          html += '<span class="menu-text">' + child.title + '</span>';
          html += '</a>';
        }
      });
      
      return html;
    },

    estimateDropdownHeight: function(children) {
      var self = this;
      var height = 0;
      
      children.forEach(function(child) {
        height += 36;
        if (child.children && child.children.length > 0) {
          height += self.estimateDropdownHeight(child.children) * 0.5;
        }
      });
      
      return height;
    },

    bindDropdownMenuEvents: function() {
      var self = this;

      $('#dropdownMenuContent').off('click', '.dropdown-menu-item:not([data-has-dropdown="true"])').on('click', '.dropdown-menu-item:not([data-has-dropdown="true"])', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var $this = $(this);
        var pageId = $this.data('id');
        var itemType = $this.data('type');
        var href = $this.data('href');
        var openType = $this.data('open-type');
        var isExternal = $this.data('external') === true || $this.data('external') === 'true';
        
        self.handleSubmenuItemClick(pageId, itemType, href, openType, isExternal);
      });

      $('#dropdownMenuContent').off('click', '.dropdown-menu-group-title').on('click', '.dropdown-menu-group-title', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var $group = $(this).closest('.dropdown-menu-group');
        var $submenu = $group.find('.dropdown-submenu').first();
        var wasOpen = $group.hasClass('open');
        var state = theme.getState();
        
        if (state.accordion && !wasOpen) {
          $group.siblings('.dropdown-menu-group.open').each(function() {
            $(this).removeClass('open');
            $(this).find('.dropdown-submenu.show').first().removeClass('show');
          });
        }
        
        $group.toggleClass('open', !wasOpen);
        $submenu.toggleClass('show', !wasOpen);
      });
    },

    hideDropdownMenu: function() {
      $('#dropdownMenuPanelWrapper').removeClass('show');
      this.currentDropdownMenu = null;
    },

    closeAllNestedDropdowns: function() {
      $('.submenu-item-wrapper.open').removeClass('open');
      $('.nested-dropdown.show').removeClass('show');
      $('.nested-dropdown-item-wrapper.open').removeClass('open');
      $('.submenu-panel-group.open').removeClass('open');
      $('.submenu-panel-dropdown.show').removeClass('show');
      $('.dropdown-menu-group.open').removeClass('open');
      $('.dropdown-submenu.show').removeClass('show');
      $('.topbar-dropdown-group.open').removeClass('open');
      $('.topbar-dropdown-submenu.show').removeClass('show');
      
      this.hideTopbarDropdown();
      
      if (this.currentSubmenuPanel && this.submenuPanelExpandedStates[this.currentSubmenuPanel]) {
        this.submenuPanelExpandedStates[this.currentSubmenuPanel] = {};
      }
    },

    findMenu: function(menuId) {
      return this.findMenuItem(menuData, menuId);
    },

    findMenuItem: function(items, targetId) {
      if (!items) return null;
      
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var itemId = item.id !== undefined ? item.id : item.code;
        if (itemId === targetId) {
          return item;
        }
        if (item.children) {
          var found = this.findMenuItem(item.children, targetId);
          if (found) return found;
        }
      }
      return null;
    },

    toggleCollapse: function() {
      if (window.innerWidth <= 768) return;
      
      this.collapsed = !this.collapsed;
      $('#sidebar').toggleClass('collapsed', this.collapsed);
      this.saveCollapseState();
      this.hideSubmenuPanel();
      this.hideDropdownMenu();
      this.closeAllNestedDropdowns();
      
      $('.submenu.open').removeClass('open');
      $('.menu-item.expanded').removeClass('expanded');
    },

    toggleMobileSidebar: function() {
      var $sidebar = $('#sidebar');
      var $overlay = $('#sidebarOverlay');
      var $fab = $('#mobileMenuFab');
      
      if ($sidebar.hasClass('mobile-open')) {
        this.closeMobileSidebar();
      } else {
        $sidebar.addClass('mobile-open');
        $overlay.addClass('show');
        $fab.addClass('open');
      }
    },

    closeMobileSidebar: function() {
      $('#sidebar').removeClass('mobile-open');
      $('#sidebarOverlay').removeClass('show');
      $('#mobileMenuFab').removeClass('open');
      $('.submenu.open').removeClass('open');
      $('.menu-item.expanded').removeClass('expanded');
      this.closeAllNestedDropdowns();
    },

    setActive: function(pageId, options) {
      $('.menu-item.active, .submenu-item.active, .submenu-panel-item.active, .submenu-panel-group-title.active, .submenu-panel-dropdown-item.active, .dropdown-menu-item.active, .dropdown-menu-group-title.active, .nested-dropdown-item.active, .topbar-menu-item.active, .topbar-dropdown-item.active')
        .removeClass('active');

      var self = this;
      var state = theme.getState();
      // 预览时允许覆盖 layout
      if (options && options.layout) {
        state.layout = options.layout;
      }
      var isMobile = window.innerWidth <= 768;
      
      this.collapsed = $('#sidebar').hasClass('collapsed');
      
      var menuPath = this.findMenuPath(menuData, pageId);
      
      var $triggerItem = null;
      var topItemId = null;
      
      if (menuPath.length > 0) {
        var topLevelItem = menuPath[0];
        topItemId = topLevelItem.id !== undefined ? topLevelItem.id : topLevelItem.code;
        $('.menu-item').each(function() {
          var $item = $(this);
          var menuId = $item.data('id');
          
          if (menuId === topItemId) {
            $item.addClass('active');
            $triggerItem = $item;
          }
        });
        
        // 同步顶栏菜单激活状态
        $('.topbar-menu-item').each(function() {
          if ($(this).data('id') === topItemId) {
            $(this).addClass('active');
          }
        });
      }

      if (isMobile) {
        this.setActiveItems(pageId, menuPath, state);
      }
      else if ((state.layout === 'double' || state.layout === 'fixed-double' || state.layout === 'mixed') && menuPath.length > 0 && $triggerItem) {
        if (this.currentSubmenuPanel !== topItemId) {
          this.showSubmenuPanel(topItemId, $triggerItem, pageId);
        } else {
          this.setActiveItems(pageId, menuPath, state);
        }
      }
      else {
        this.setActiveItems(pageId, menuPath, state);
      }

      // 同步面包屑导航（只要容器可见就渲染，传入当前pageId确保刷新后立即对应）
      var $bc = $('#breadcrumbContainer');
      if ($bc.length && !$bc.hasClass('hidden')) {
        this.renderBreadcrumb(pageId);
      }
    },
    
    setActiveItems: function(pageId, menuPath, state) {
      $('.submenu-item, .submenu-panel-item, .submenu-panel-group-title, .submenu-panel-dropdown-item, .dropdown-menu-item, .dropdown-menu-group-title, .nested-dropdown-item').removeClass('active');
      
      $('.submenu-item, .submenu-panel-item, .submenu-panel-group-title, .submenu-panel-dropdown-item, .dropdown-menu-item, .dropdown-menu-group-title, .nested-dropdown-item').each(function() {
        if ($(this).data('id') === pageId) {
          $(this).addClass('active');
        }
      });

      var isMobile = window.innerWidth <= 768;
      if ((state.layout === 'dropdown' && !this.collapsed) || isMobile) {
        if (menuPath.length > 1) {
          var firstItemId = menuPath[0].id !== undefined ? menuPath[0].id : menuPath[0].code;
          var $parentItem = $('.menu-item[data-id="' + firstItemId + '"]');
          if ($parentItem.length) {
            $parentItem.addClass('expanded');
            var $submenu = $parentItem.next('.submenu');
            if ($submenu.length) {
              $submenu.addClass('open');
            }
          }
        }
      }

      if (menuPath.length > 1) {
        this.expandMenuPath(menuPath);
      }
    },

    findMenuPath: function(items, targetId, path) {
      path = path || [];
      
      if (!items) return [];
      
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var itemId = item.id !== undefined ? item.id : item.code;
        var newPath = path.concat([item]);
        
        if (itemId === targetId) {
          return newPath;
        }
        
        if (item.children) {
          var found = this.findMenuPath(item.children, targetId, newPath);
          if (found.length > 0) return found;
        }
      }
      
      return [];
    },

    expandMenuPath: function(menuPath) {
      for (var i = 1; i < menuPath.length; i++) {
        var item = menuPath[i];
        var itemId = item.id !== undefined ? item.id : item.code;
        
        var $wrapper = $('.submenu-item-wrapper[data-id="' + itemId + '"]');
        if ($wrapper.length) {
          $wrapper.addClass('open');
          $wrapper.find('.nested-dropdown').first().addClass('show');
        }
        
        var $nestedWrapper = $('.nested-dropdown-item-wrapper[data-id="' + itemId + '"]');
        if ($nestedWrapper.length) {
          $nestedWrapper.addClass('open');
          $nestedWrapper.find('.nested-dropdown').first().addClass('show');
        }
        
        var $panelGroup = $('.submenu-panel-group[data-id="' + itemId + '"]');
        if ($panelGroup.length) {
          $panelGroup.addClass('open');
          $panelGroup.find('.submenu-panel-dropdown').first().addClass('show');
          $panelGroup.find('.menu-dropdown-arrow i').removeClass('layui-icon-down').addClass('layui-icon-up');
        }
        
        var $panelDropdownGroup = $('.submenu-panel-dropdown-group[data-id="' + itemId + '"]');
        if ($panelDropdownGroup.length) {
          $panelDropdownGroup.addClass('open');
          $panelDropdownGroup.find('.submenu-panel-dropdown').first().addClass('show');
        }
        
        var $dropdownGroup = $('.dropdown-menu-group[data-id="' + itemId + '"]');
        if ($dropdownGroup.length) {
          $dropdownGroup.addClass('open');
          $dropdownGroup.find('.dropdown-submenu').first().addClass('show');
        }
      }
    },

    // ============================================================
    // 顶栏菜单 — 用于顶栏布局(topbar)和混合布局(mixed)
    // ============================================================

    renderTopbarMenu: function() {
      var $container = $('#topbarMenu');
      var $dropdown = $('#topbarDropdownContent');
      if (!$container.length) return;
      
      $container.empty();
      
      // 只渲染一级菜单（type=0 或 type=1 的顶级项）
      var html = '';
      var self = this;
      
      menuData.forEach(function(item) {
        if (item.hidden) return;
        var itemId = item.id !== undefined ? item.id : item.code;
        var itemType = self.getMenuItemType(item);
        var hasChildren = itemType === 0;
        
        html += '<div class="topbar-menu-item" data-id="' + itemId + '" data-type="' + itemType + '"';
        if (!hasChildren && item.href) {
          html += ' data-href="' + item.href + '"';
        }
        if (item.openType) {
          html += ' data-open-type="' + item.openType + '"';
        }
        html += '>';
        html += '<span class="menu-icon"><i class="layui-icon ' + item.icon + '"></i></span>';
        html += '<span class="menu-text">' + item.title + '</span>';
        if (hasChildren) {
          html += '<span class="menu-arrow"><i class="layui-icon layui-icon-down"></i></span>';
        }
        html += '</div>';
      });
      
      $container.html(html);

      // 应用顶栏激活状态
      this.updateTopbarActiveState();
    },

    updateTopbarActiveState: function() {
      var currentId = null;
      if (window.layui && window.layui.routerModule) {
        currentId = window.layui.routerModule.getCurrentId();
      }
      if (currentId === null || currentId === undefined) return;
      
      // 找到当前页面对应的顶级菜单
      var menuPath = this.findMenuPath(menuData, currentId);
      if (menuPath.length === 0) return;
      
      var topItem = menuPath[0];
      var topItemId = topItem.id !== undefined ? topItem.id : topItem.code;
      
      $('.topbar-menu-item').removeClass('active');
      $('.topbar-menu-item[data-id="' + topItemId + '"]').addClass('active');
    },

    handleTopbarMenuItemClick: function(itemId, $el) {
      var item = this.findMenu(itemId);
      if (!item) return;
      
      var itemType = this.getMenuItemType(item);
      var isDirectory = itemType === 0;
      var state = theme && theme.getState ? theme.getState() : { layout: 'topbar' };
      
      if (isDirectory) {
        // 目录类型：显示下拉菜单或联动侧边栏面板
        if (state.layout === 'mixed') {
          // 混合布局：展开侧边栏面板显示嵌套菜单
          this.handleTopbarMixedLayoutClick(itemId, $el);
        } else {
          // 顶栏布局：显示下拉菜单
          this.showTopbarDropdown(itemId, $el);
        }
        return;
      }
      
      // 菜单类型：直接导航
      var href = item.href;
      var openType = item.openType;
      var isExternal = href && this.isExternalUrl(href);
      
      if (this.currentTopbarDropdown) {
        this.hideTopbarDropdown();
      }
      
      if (isExternal && openType === '_blank') {
        window.open(href, '_blank');
        return;
      }
      
      if (isExternal && openType === '_dialog') {
        layer.open({
          type: 2,
          title: ' ',
          content: href,
          closeBtn: 1,
          area: common && common.isMobile() ? ['100%', '100%'] : ['550px', '600px'],
          shadeClose: true,
          maxmin: true
        });
        return;
      }

      if (window.layui && window.layui.routerModule) {
        window.layui.routerModule.navigateById(itemId);
      }
    },

    handleTopbarMixedLayoutClick: function(menuId, $el) {
      // 混合布局：点击顶栏一级菜单 → 切换常驻子面板内容（不 toggle 隐藏）
      // 找到对应的侧边栏菜单项并触发子面板更新
      var $sidebarMenuItem = $('.menu-item[data-id="' + menuId + '"]');
      if ($sidebarMenuItem.length) {
        this.showSubmenuPanel(menuId, $sidebarMenuItem);
      }

      // 更新顶栏激活状态
      $('.topbar-menu-item').removeClass('active');
      $el.addClass('active');
    },

    showTopbarDropdown: function(menuId, $triggerEl) {
      var menu = this.findMenu(menuId);
      if (!menu || !menu.children) return;
      
      this.currentTopbarDropdown = menuId;
      
      var html = this.buildTopbarDropdownHTML(menu.children, 2);
      $('#topbarDropdownContent').html(html);
      
      // 定位下拉菜单
      var rect = $triggerEl[0].getBoundingClientRect();
      var $dropdown = $('#topbarDropdown');
      var dropdownWidth = Math.min(260, Math.max(180, rect.width + 40));
      
      var left = rect.left;
      var top = rect.bottom + 4;
      
      // 防止溢出右侧
      if (left + dropdownWidth > window.innerWidth - 16) {
        left = window.innerWidth - dropdownWidth - 16;
      }
      if (left < 8) left = 8;
      
      $dropdown.css({
        left: left + 'px',
        top: top + 'px',
        minWidth: dropdownWidth + 'px'
      });
      
      $dropdown.addClass('show');
      
      // 绑定下拉菜单事件
      this.bindTopbarDropdownEvents();
    },

    hideTopbarDropdown: function() {
      $('#topbarDropdown').removeClass('show');
      this.currentTopbarDropdown = null;
    },

    buildTopbarDropdownHTML: function(children, level) {
      var self = this;
      var html = '';
      
      children.forEach(function(child) {
        var childIcon = child.icon || 'layui-icon-circle';
        var childType = self.getMenuItemType(child);
        var isDirectory = childType === 0;
        var itemId = child.id !== undefined ? child.id : child.code;
        var isExternal = !isDirectory && child.href && self.isExternalUrl(child.href);
        
        if (isDirectory) {
          // 目录：折叠分组
          html += '<div class="topbar-dropdown-group" data-id="' + itemId + '" data-type="' + childType + '">';
          html += '<div class="topbar-dropdown-group-title" data-id="' + itemId + '" data-level="' + level + '" data-has-dropdown="true">';
          html += '<span class="menu-icon"><i class="layui-icon ' + childIcon + '"></i></span>';
          html += '<span class="menu-text">' + child.title + '</span>';
          html += '<span class="menu-dropdown-arrow"><i class="layui-icon layui-icon-right"></i></span>';
          html += '</div>';
          html += '<div class="topbar-dropdown-submenu">';
          html += self.buildTopbarDropdownHTML(child.children, level + 1);
          html += '</div>';
          html += '</div>';
        } else {
          html += '<a class="topbar-dropdown-item" data-id="' + itemId + '" data-level="' + level + '" data-type="' + childType + '"';
          if (child.href) {
            html += ' data-href="' + child.href + '"';
          }
          if (child.openType) {
            html += ' data-open-type="' + child.openType + '"';
          }
          if (isExternal) {
            html += ' data-external="true"';
          }
          html += '>';
          html += '<span class="menu-icon"><i class="layui-icon ' + childIcon + '"></i></span>';
          html += '<span class="menu-text">' + child.title + '</span>';
          html += '</a>';
        }
      });
      
      return html;
    },

    bindTopbarMenuEvents: function() {
      var self = this;
      
      // 顶栏菜单项点击
      $(document).on('click', '.topbar-menu-item', function(e) {
        e.stopPropagation();
        var $this = $(this);
        var itemId = $this.data('id');
        self.handleTopbarMenuItemClick(itemId, $this);
      });

      // 点击文档关闭顶栏下拉
      $(document).on('click', function(e) {
        if (!$(e.target).closest('.layui-topbar-menu, .layui-topbar-dropdown').length) {
          self.hideTopbarDropdown();
        }
      });
    },

    bindTopbarDropdownEvents: function() {
      var self = this;
      
      // 清除所有点击事件处理（包括溢出菜单的），重新绑定常规下拉菜单专用处理
      $('#topbarDropdownContent').off('click');
      
      // 下拉菜单项点击
      $('#topbarDropdownContent').on('click', '.topbar-dropdown-item', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var $this = $(this);
        var pageId = $this.data('id');
        var itemType = $this.data('type');
        var href = $this.data('href');
        var openType = $this.data('open-type');
        var isExternal = $this.data('external') === true || $this.data('external') === 'true';
        
        self.hideTopbarDropdown();
        
        if (itemType === 0) return;
        
        if (isExternal && openType === '_blank') {
          window.open(href, '_blank');
          return;
        }
        
        if (isExternal && openType === '_dialog') {
          layer.open({
            type: 2,
            title: ' ',
            content: href,
            closeBtn: 1,
            area: common && common.isMobile() ? ['100%', '100%'] : ['550px', '600px'],
            shadeClose: true,
            maxmin: true
          });
          return;
        }

        if (window.layui && window.layui.routerModule) {
          window.layui.routerModule.navigateById(pageId);
        }
      });
      
      // 分组标题点击（展开/折叠子菜单）
      $('#topbarDropdownContent').off('click', '.topbar-dropdown-group-title').on('click', '.topbar-dropdown-group-title', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var $group = $(this).closest('.topbar-dropdown-group');
        var $submenu = $group.find('.topbar-dropdown-submenu').first();
        var wasOpen = $group.hasClass('open');

        $group.toggleClass('open', !wasOpen);
        $submenu.toggleClass('show', !wasOpen);
      });
    },

    updateTopbarMenu: function() {
      this.renderTopbarMenu();
    },

    // ============================================================
    // 面包屑导航栏
    // ============================================================
    renderBreadcrumb: function(currentIdOverride) {
      var $bar = $('#breadcrumbBar');
      if (!$bar.length) return;

      var currentId = currentIdOverride !== undefined ? currentIdOverride : null;
      if (currentId === null || currentId === undefined) {
        if (window.layui && window.layui.routerModule) {
          currentId = window.layui.routerModule.getCurrentId();
        }
      }
      if (currentId === null || currentId === undefined) {
        $bar.html('<span class="breadcrumb-item active">主页</span>');
        return;
      }

      var menuPath = this.findMenuPath(menuData, currentId);
      var html = '';
      var self = this;

      // 菜单路径（从一级菜单开始，不添加首页）
      menuPath.forEach(function(item, index) {
        var itemId = item.id !== undefined ? item.id : item.code;
        var isLast = index === menuPath.length - 1;
        var icon = item.icon || 'layui-icon-circle';
        var itemType = self.getMenuItemType(item);

        if (index > 0) {
          html += '<span class="breadcrumb-separator"><i class="layui-icon layui-icon-right"></i></span>';
        }

        if (isLast) {
          html += '<span class="breadcrumb-item active"><i class="layui-icon ' + icon + '"></i><span>' + item.title + '</span></span>';
        } else if (itemType === 1 && item.href) {
          html += '<span class="breadcrumb-item clickable" data-id="' + itemId + '"><i class="layui-icon ' + icon + '"></i><span>' + item.title + '</span></span>';
        } else {
          html += '<span class="breadcrumb-item"><i class="layui-icon ' + icon + '"></i><span>' + item.title + '</span></span>';
        }
      });

      $bar.html(html);

      // 可点击面包屑导航
      $bar.off('click', '.breadcrumb-item.clickable').on('click', '.breadcrumb-item.clickable', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var id = $(this).data('id');
        if (window.layui && window.layui.routerModule) {
          window.layui.routerModule.navigateById(id);
        }
      });

      // 滚动到末尾
      setTimeout(function() {
        $bar.scrollLeft($bar[0].scrollWidth);
        self.updateBreadcrumbScrollButtons();
      }, 50);
    },

    bindBreadcrumbEvents: function() {
      var self = this;
      var $container = $('#breadcrumbContainer');
      var $bar = $('#breadcrumbBar');

      // 滚动按钮
      $container.find('#breadcrumbScrollLeftBtn').on('click', function() {
        $bar.stop(true).animate({ scrollLeft: '-=200' }, 200, function() {
          self.updateBreadcrumbScrollButtons();
        });
      });

      $container.find('#breadcrumbScrollRightBtn').on('click', function() {
        $bar.stop(true).animate({ scrollLeft: '+=200' }, 200, function() {
          self.updateBreadcrumbScrollButtons();
        });
      });

      // 滚动时更新按钮状态
      $bar.on('scroll', function() {
        self.updateBreadcrumbScrollButtons();
      });

      // 窗口大小变化时更新按钮状态
      $(window).on('resize', function() {
        self.updateBreadcrumbScrollButtons();
      });

      // 初始状态
      setTimeout(function() {
        self.updateBreadcrumbScrollButtons();
      }, 100);
    },

    updateBreadcrumbScrollButtons: function() {
      var $bar = $('#breadcrumbBar');
      var el = $bar[0];
      if (!el) return;

      var scrollWidth = el.scrollWidth;
      var barWidth = $bar.width();
      var currentScroll = el.scrollLeft;
      var maxScroll = scrollWidth - barWidth - 1;

      var needScroll = scrollWidth > barWidth;

      $('#breadcrumbScrollLeftBtn').prop('disabled', !needScroll || currentScroll <= 0);
      $('#breadcrumbScrollRightBtn').prop('disabled', !needScroll || currentScroll >= maxScroll);
    },

    // ============================================================
    // 全局搜索
    // ============================================================
    initGlobalSearch: function() {
      var self = this;
      var $input = $('#globalSearchInput');
      var $dropdown = $('#searchDropdown');
      if (!$input.length) return;

      $input.on('input', function() {
        var keyword = $(this).val().trim().toLowerCase();
        if (!keyword) {
          $dropdown.removeClass('show');
          return;
        }

        var results = self.searchMenu(keyword);
        if (results.length === 0) {
          $dropdown.html('<div class="search-empty">未找到匹配的菜单</div>');
        } else {
          var html = '';
          results.forEach(function(item) {
            var pathText = item.path.join(' / ');
            html += '<div class="search-result-item" data-id="' + item.id + '">';
            html += '<i class="layui-icon ' + (item.icon || 'layui-icon-circle') + '"></i>';
            html += '<span>' + item.title + '</span>';
            html += '<span class="search-result-path">' + pathText + '</span>';
            html += '</div>';
          });
          $dropdown.html(html);
        }
        $dropdown.addClass('show');
      });

      $input.on('focus', function() {
        if ($(this).val().trim()) {
          $dropdown.addClass('show');
        }
      });

      // 点击搜索结果导航
      $dropdown.on('click', '.search-result-item', function(e) {
        e.preventDefault();
        var id = $(this).data('id');
        $dropdown.removeClass('show');
        $input.val('');
        if (window.layui && window.layui.routerModule) {
          window.layui.routerModule.navigateById(id);
        }
      });

      // 点击外部关闭
      $(document).on('click', function(e) {
        if (!$(e.target).closest('.layui-topbar-search').length) {
          $dropdown.removeClass('show');
        }
      });
    },

    searchMenu: function(keyword) {
      var results = [];
      var self = this;

      function traverse(items, path) {
        items.forEach(function(item) {
          if (item.hidden) return;
          var title = (item.title || '').toLowerCase();
          var currentPath = path.concat([item.title || '']);
          var itemType = self.getMenuItemType(item);

          if (title.indexOf(keyword) !== -1 && itemType === 1) {
            results.push({
              id: item.id !== undefined ? item.id : item.code,
              title: item.title,
              icon: item.icon,
              path: currentPath
            });
          }

          if (item.children && item.children.length > 0) {
            traverse(item.children, currentPath);
          }
        });
      }

      traverse(menuData, []);
      return results.slice(0, 20);
    }
};

  exports('sidebarComp', Sidebar);
});
