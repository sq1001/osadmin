/**
 * 侧边栏组件
 * 支持多级菜单，大于2级统一使用下拉菜单
 * 内部使用id标识，URL使用code
 */
layui.define(['jquery', 'themeModule', 'routerModule'], function(exports) {
  'use strict';

  var $ = layui.jquery;
  var theme = layui.themeModule;
  var router = layui.routerModule;
  var menuData = null;

  var Sidebar = {
    collapsed: false,
    currentSubmenuPanel: null,
    activeDropdowns: [],

    init: function(config) {
      menuData = config ? (config.data || []) : [];
      this.render();
      this.bindEvents();
      return this;
    },

    render: function() {
      var html = this.buildSidebarHTML();
      $('#sidebarMenu').html(html);
    },

    buildSidebarHTML: function() {
      var html = '<div class="menu-section">主菜单</div>';
      var self = this;
      
      menuData.forEach(function(item) {
        html += self.buildMenuItemHTML(item, 1);
      });
      
      return html;
    },

    buildMenuItemHTML: function(item, level) {
      var self = this;
      var hasChildren = item.children && item.children.length > 0;
      var isLeaf = !hasChildren || level >= 2;
      var itemId = item.id !== undefined ? item.id : item.code;
      
      var html = '<div class="menu-item" data-id="' + itemId + '" data-level="' + level + '" data-has-children="' + hasChildren + '">';
      html += '<span class="menu-icon"><i class="layui-icon ' + item.icon + '"></i></span>';
      html += '<span class="menu-text">' + item.title + '</span>';
      
      if (item.badge) {
        html += '<span class="menu-badge">' + item.badge + '</span>';
      }
      
      if (hasChildren) {
        html += '<span class="menu-arrow"><i class="layui-icon layui-icon-right"></i></span>';
      }
      
      html += '</div>';
      
      if (hasChildren && level < 2) {
        html += '<div class="submenu" data-parent="' + itemId + '">';
        item.children.forEach(function(child) {
          var childHasChildren = child.children && child.children.length > 0;
          if (childHasChildren) {
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
      var html = '<a class="submenu-item" data-id="' + itemId + '" data-level="' + level + '">';
      html += '<span class="menu-icon"><i class="layui-icon ' + childIcon + '"></i></span>';
      html += '<span class="menu-text">' + item.title + '</span>';
      html += '</a>';
      return html;
    },

    buildSubmenuItemWithDropdown: function(item, level) {
      var childIcon = item.icon || 'layui-icon-circle';
      var hasChildren = item.children && item.children.length > 0;
      var itemId = item.id !== undefined ? item.id : item.code;
      
      var html = '<div class="submenu-item-wrapper" data-id="' + itemId + '">';
      html += '<a class="submenu-item submenu-item-dropdown" data-id="' + itemId + '" data-level="' + level + '" data-has-dropdown="true">';
      html += '<span class="menu-icon"><i class="layui-icon ' + childIcon + '"></i></span>';
      html += '<span class="menu-text">' + item.title + '</span>';
      if (hasChildren) {
        html += '<span class="menu-dropdown-arrow"><i class="layui-icon layui-icon-right"></i></span>';
      }
      html += '</a>';
      
      if (hasChildren) {
        html += this.buildNestedDropdownHTML(item.children, level + 1);
      }
      
      html += '</div>';
      return html;
    },

    buildNestedDropdownHTML: function(children, level) {
      var html = '<div class="nested-dropdown" data-level="' + level + '">';
      children.forEach(function(child) {
        var childIcon = child.icon || 'layui-icon-circle';
        var hasChildren = child.children && child.children.length > 0;
        var itemId = child.id !== undefined ? child.id : child.code;
        
        if (hasChildren) {
          html += '<div class="nested-dropdown-item-wrapper">';
          html += '<a class="nested-dropdown-item" data-id="' + itemId + '" data-level="' + level + '" data-has-dropdown="true">';
          html += '<span class="menu-icon"><i class="layui-icon ' + childIcon + '"></i></span>';
          html += '<span class="menu-text">' + child.title + '</span>';
          html += '<span class="menu-dropdown-arrow"><i class="layui-icon layui-icon-right"></i></span>';
          html += '</a>';
          html += this.buildNestedDropdownHTML(child.children, level + 1);
          html += '</div>';
        } else {
          html += '<a class="nested-dropdown-item" data-id="' + itemId + '" data-level="' + level + '">';
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
        var hasChildren = $this.data('has-children') === true || $this.data('has-children') === 'true';
        
        self.handleMenuClick(menuId, hasChildren, $this, level);
      });

      $('#sidebarMenu').on('click', '.submenu-item:not(.submenu-item-dropdown)', function(e) {
        e.stopPropagation();
        e.preventDefault();
        var pageId = $(this).data('id');
        router.navigateById(pageId);
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
        var pageId = $(this).data('id');
        router.navigateById(pageId);
        self.closeMobileSidebar();
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
    },

    handleMenuClick: function(menuId, hasChildren, $el, level) {
      if (window.innerWidth <= 768) {
        if (hasChildren) {
          this.toggleSubmenu($el, menuId);
        } else {
          router.navigateById(menuId);
          this.closeMobileSidebar();
        }
        return;
      }

      if (!hasChildren) {
        router.navigateById(menuId);
        this.hideSubmenuPanel();
        this.hideDropdownMenu();
        this.closeAllNestedDropdowns();
        return;
      }

      var state = theme.getState();
      
      if (state.layout === 'double') {
        this.showSubmenuPanel(menuId, $el);
        this.hideDropdownMenu();
      } else {
        if (this.collapsed) {
          this.showDropdownMenu(menuId, $el);
          this.hideSubmenuPanel();
        } else {
          this.toggleSubmenu($el, menuId);
          this.hideSubmenuPanel();
          this.hideDropdownMenu();
        }
      }
    },

    toggleSubmenu: function($el, menuId) {
      var wasExpanded = $el.hasClass('expanded');
      var state = theme.getState();
      
      if (state.accordion && !wasExpanded) {
        $('.menu-item.expanded').each(function() {
          $(this).removeClass('expanded');
          var $submenu = $(this).next('.submenu');
          if ($submenu.length) {
            $submenu.removeClass('open');
          }
        });
        $('.submenu-item-wrapper.open').each(function() {
          $(this).removeClass('open');
          $(this).find('.nested-dropdown.show').removeClass('show');
        });
        $('.submenu-panel-group.open').each(function() {
          $(this).removeClass('open');
          $(this).find('.submenu-panel-dropdown.show').removeClass('show');
          $(this).find('.menu-dropdown-arrow i').removeClass('layui-icon-up').addClass('layui-icon-down');
        });
        $('.dropdown-menu-group.open').each(function() {
          $(this).removeClass('open');
          $(this).find('.dropdown-submenu.show').removeClass('show');
        });
        $('.nested-dropdown-item-wrapper.open').each(function() {
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

    showSubmenuPanel: function(menuId, $triggerEl) {
      var menu = this.findMenu(menuId);
      if (!menu || !menu.children) return;

      var html = '';
      html = this.buildSubmenuPanelContent(menu.children, 2);

      $('#submenuPanelTitle').text(menu.title);
      $('#submenuPanelContent').html(html);
      $('#submenuPanel').addClass('show');
      $('#mainWrapper').addClass('submenu-expanded');
      
      this.currentSubmenuPanel = menuId;
      
      this.bindSubmenuPanelEvents();
      
      var currentId = router.getCurrentId();
      if (currentId !== null) {
        this.setActive(currentId);
      }
    },

    buildSubmenuPanelContent: function(children, level) {
      var self = this;
      var html = '';
      
      children.forEach(function(child) {
        var childIcon = child.icon || 'layui-icon-circle';
        var hasChildren = child.children && child.children.length > 0;
        var itemId = child.id !== undefined ? child.id : child.code;
        
        if (hasChildren) {
          html += '<div class="submenu-panel-group" data-id="' + itemId + '">';
          html += '<div class="submenu-panel-item submenu-panel-group-title" data-id="' + itemId + '" data-level="' + level + '" data-has-dropdown="true">';
          html += '<span class="menu-icon"><i class="layui-icon ' + childIcon + '"></i></span>';
          html += '<span class="menu-text">' + child.title + '</span>';
          html += '<span class="menu-dropdown-arrow"><i class="layui-icon layui-icon-down"></i></span>';
          html += '</div>';
          html += self.buildSubmenuPanelDropdown(child.children, level + 1);
          html += '</div>';
        } else {
          html += '<a class="submenu-panel-item" data-id="' + itemId + '" data-level="' + level + '">';
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
        var hasChildren = child.children && child.children.length > 0;
        var itemId = child.id !== undefined ? child.id : child.code;
        
        if (hasChildren) {
          html += '<div class="submenu-panel-dropdown-group" data-id="' + itemId + '">';
          html += '<a class="submenu-panel-dropdown-item" data-id="' + itemId + '" data-level="' + level + '" data-has-dropdown="true">';
          html += '<span class="menu-icon"><i class="layui-icon ' + childIcon + '"></i></span>';
          html += '<span class="menu-text">' + child.title + '</span>';
          html += '<span class="menu-dropdown-arrow"><i class="layui-icon layui-icon-right"></i></span>';
          html += '</a>';
          html += self.buildSubmenuPanelDropdown(child.children, level + 1);
          html += '</div>';
        } else {
          html += '<a class="submenu-panel-dropdown-item" data-id="' + itemId + '" data-level="' + level + '">';
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
        var pageId = $(this).data('id');
        router.navigateById(pageId);
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
        var pageId = $(this).data('id');
        router.navigateById(pageId);
      });
    },

    hideSubmenuPanel: function() {
      $('#submenuPanel').removeClass('show');
      $('#submenuPanelTitle').text('');
      $('#submenuPanelContent').html('');
      $('#mainWrapper').removeClass('submenu-expanded');
      this.currentSubmenuPanel = null;
    },

    showDropdownMenu: function(menuId, $triggerEl) {
      var menu = this.findMenu(menuId);
      if (!menu || !menu.children) return;

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
    },

    buildDropdownMenuContent: function(children, level) {
      var self = this;
      var html = '';
      
      children.forEach(function(child) {
        var childIcon = child.icon || 'layui-icon-circle';
        var hasChildren = child.children && child.children.length > 0;
        var itemId = child.id !== undefined ? child.id : child.code;
        
        if (hasChildren) {
          html += '<div class="dropdown-menu-group" data-id="' + itemId + '">';
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
          html += '<a class="dropdown-menu-item" data-id="' + itemId + '" data-level="' + level + '">';
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
        var pageId = $(this).data('id');
        router.navigateById(pageId);
        self.hideDropdownMenu();
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
      
      var menuPath = this.findMenuPath(menuData, pageId);
      
      if (menuPath.length > 0) {
        var topLevelItem = menuPath[0];
        $('.menu-item').each(function() {
          var $item = $(this);
          var menuId = $item.data('id');
          
          var topItemId = topLevelItem.id !== undefined ? topLevelItem.id : topLevelItem.code;
          if (menuId === topItemId) {
            $item.addClass('active');
          }
        });
      }

      $('.submenu-item, .submenu-panel-item, .submenu-panel-group-title, .submenu-panel-dropdown-item, .dropdown-menu-item, .dropdown-menu-group-title, .nested-dropdown-item').each(function() {
        if ($(this).data('id') === pageId) {
          $(this).addClass('active');
        }
      });

      if (state.layout === 'dropdown' && !this.collapsed && menuPath.length > 1) {
        var firstItemId = menuPath[0].id !== undefined ? menuPath[0].id : menuPath[0].code;
        var $parentItem = $('.menu-item[data-id="' + firstItemId + '"]');
        if ($parentItem.length && menuPath.length > 1) {
          $parentItem.addClass('expanded');
          var $submenu = $parentItem.next('.submenu');
          if ($submenu.length) {
            $submenu.addClass('open');
          }
        }
      }

      if (menuPath.length > 2) {
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
      for (var i = 1; i < menuPath.length - 1; i++) {
        var item = menuPath[i];
        var itemId = item.id !== undefined ? item.id : item.code;
        
        var $wrapper = $('.submenu-item-wrapper[data-id="' + itemId + '"]');
        if ($wrapper.length) {
          $wrapper.addClass('open');
          $wrapper.find('.nested-dropdown').first().addClass('show');
        }
        
        var $panelGroup = $('.submenu-panel-group[data-id="' + itemId + '"]');
        if ($panelGroup.length) {
          $panelGroup.addClass('open');
          $panelGroup.find('.submenu-panel-dropdown').first().addClass('show');
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
