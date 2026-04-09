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

  var Sidebar = {
    collapsed: false,
    currentSubmenuPanel: null,
    currentDropdownMenu: null,
    activeDropdowns: [],

    init: function(config) {
      menuData = config ? (config.data || []) : [];
      this.render();
      this.loadCollapseState();
      this.bindEvents();
      return this;
    },

    isExternalUrl: function(href) {
      if (!href) return false;
      return href.indexOf('http://') === 0 || href.indexOf('https://') === 0 || href.indexOf('//') === 0;
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
        self.closeMobileSidebar();
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
        if (!$(e.target).closest('.layui-sidebar, .layui-submenu-panel, .layui-dropdown-menu-panel-wrapper, .layui-mobile-menu-fab').length) {
          self.hideSubmenuPanel();
          self.hideDropdownMenu();
          self.closeAllNestedDropdowns();
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
        
        if (state.layout === 'double') {
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
          area: [common.isMobile()?"100%":"550px", common.isMobile()?"100%":"600px"],
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

      var html = '';
      html = this.buildSubmenuPanelContent(menu.children, 2);

      $('#submenuPanelTitle').text(menu.title);
      $('#submenuPanelContent').html(html);
      $('#submenuPanel').addClass('show');
      
      this.currentSubmenuPanel = menuId;
      
      this.bindSubmenuPanelEvents();
      
      var currentId = targetPageId || router.getCurrentId();
      if (currentId !== null) {
        // 直接设置激活状态，不调用setActive
        var state = theme.getState();
        var menuPath = this.findMenuPath(menuData, currentId);
        this.setActiveItems(currentId, menuPath, state);
      }
    },

    buildSubmenuPanelContent: function(children, level) {
      var self = this;
      var html = '';
      
      children.forEach(function(child) {
        var childIcon = child.icon || 'layui-icon-circle';
        var childType = self.getMenuItemType(child);
        var isDirectory = childType === 0;
        var itemId = child.id !== undefined ? child.id : child.code;
        var isExternal = !isDirectory && child.href && self.isExternalUrl(child.href);
        
        if (isDirectory) {
          html += '<div class="submenu-panel-group" data-id="' + itemId + '" data-type="' + childType + '">';
          html += '<div class="submenu-panel-item submenu-panel-group-title" data-id="' + itemId + '" data-level="' + level + '" data-has-dropdown="true">';
          html += '<span class="menu-icon"><i class="layui-icon ' + childIcon + '"></i></span>';
          html += '<span class="menu-text">' + child.title + '</span>';
          html += '<span class="menu-dropdown-arrow"><i class="layui-icon layui-icon-down"></i></span>';
          html += '</div>';
          html += self.buildSubmenuPanelDropdown(child.children, level + 1);
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

    buildSubmenuPanelDropdown: function(children, level) {
      var self = this;
      var html = '<div class="submenu-panel-dropdown" data-level="' + level + '">';
      
      children.forEach(function(child) {
        var childIcon = child.icon || 'layui-icon-circle';
        var childType = self.getMenuItemType(child);
        var isDirectory = childType === 0;
        var itemId = child.id !== undefined ? child.id : child.code;
        var isExternal = !isDirectory && child.href && self.isExternalUrl(child.href);
        
        if (isDirectory) {
          html += '<div class="submenu-panel-dropdown-group" data-id="' + itemId + '" data-type="' + childType + '">';
          html += '<a class="submenu-panel-dropdown-item" data-id="' + itemId + '" data-level="' + level + '" data-has-dropdown="true">';
          html += '<span class="menu-icon"><i class="layui-icon ' + childIcon + '"></i></span>';
          html += '<span class="menu-text">' + child.title + '</span>';
          html += '<span class="menu-dropdown-arrow"><i class="layui-icon layui-icon-right"></i></span>';
          html += '</a>';
          html += self.buildSubmenuPanelDropdown(child.children, level + 1);
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
        var wasOpen = $group.hasClass('open');
        var state = theme.getState();
        
        if (state.accordion && !wasOpen) {
          $group.siblings('.submenu-panel-group.open').each(function() {
            $(this).removeClass('open');
            $(this).find('.submenu-panel-dropdown.show').removeClass('show');
            $(this).find('.menu-dropdown-arrow i').removeClass('layui-icon-up').addClass('layui-icon-down');
          });
        }
        
        $group.toggleClass('open', !wasOpen);
        $dropdown.toggleClass('show', !wasOpen);
        $(this).find('.menu-dropdown-arrow i').toggleClass('layui-icon-down layui-icon-up');
      });

      $('#submenuPanelContent').off('click', '.submenu-panel-dropdown-item[data-has-dropdown="true"]').on('click', '.submenu-panel-dropdown-item[data-has-dropdown="true"]', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var $group = $(this).closest('.submenu-panel-dropdown-group');
        var $dropdown = $group.find('.submenu-panel-dropdown').first();
        var wasOpen = $group.hasClass('open');
        var state = theme.getState();
        
        if (state.accordion && !wasOpen) {
          $group.siblings('.submenu-panel-dropdown-group.open').each(function() {
            $(this).removeClass('open');
            $(this).find('.submenu-panel-dropdown.show').removeClass('show');
          });
        }
        
        $group.toggleClass('open', !wasOpen);
        $dropdown.toggleClass('show', !wasOpen);
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

      var html = this.buildDropdownMenuContent(menu.children, 2);

      $('#dropdownMenuContent').html(html);

      var rect = $triggerEl[0].getBoundingClientRect();
      var panelWidth = 180;
      var viewportWidth = window.innerWidth;
      
      var leftPos = rect.right + 8;
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

      var $wrapper = $('#dropdownMenuPanelWrapper');
      $wrapper.css({
        left: leftPos + 'px',
        top: topPos + 'px'
      }).addClass('show');
      
      $wrapper.find('.layui-dropdown-menu-panel').css('max-height', maxHeight + 'px');
      
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

    setActive: function(pageId) {
      $('.menu-item.active, .submenu-item.active, .submenu-panel-item.active, .submenu-panel-group-title.active, .submenu-panel-dropdown-item.active, .dropdown-menu-item.active, .dropdown-menu-group-title.active, .nested-dropdown-item.active')
        .removeClass('active');

      var self = this;
      var state = theme.getState();
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
      }

      var panelShown = false;
      
      if (isMobile) {
        this.setActiveItems(pageId, menuPath, state);
      }
      else if (state.layout === 'double' && menuPath.length > 0 && $triggerItem) {
        if (this.currentSubmenuPanel !== topItemId) {
          this.showSubmenuPanel(topItemId, $triggerItem, pageId);
          panelShown = true;
        } else {
          this.setActiveItems(pageId, menuPath, state);
        }
      }
      else if (state.layout === 'dropdown' && this.collapsed && menuPath.length > 0 && $triggerItem) {
        var $wrapper = $('#dropdownMenuPanelWrapper');
        var needShowDropdown = !$wrapper.hasClass('show') || this.currentDropdownMenu !== topItemId;
        
        if (needShowDropdown) {
          this.showDropdownMenu(topItemId, $triggerItem, pageId);
          panelShown = true;
        } else {
          this.setActiveItems(pageId, menuPath, state);
        }
      }
      else {
        this.setActiveItems(pageId, menuPath, state);
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
    }
  };

  exports('sidebarComp', Sidebar);
});
