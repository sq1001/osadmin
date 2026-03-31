/**
 * 标签页组件
 * 内部使用id标识，URL使用code
 */
layui.define(['jquery', 'themeModule', 'routerModule'], function(exports) {
  'use strict';

  var $ = layui.jquery;
  var theme = layui.themeModule;
  var router = layui.routerModule;
  var appConfig = null;
  var menuData = [];
  var pageNames = {};
  var pageClosable = {};
  var selectId = 0;

  var Tabs = {
    tabs: [],
    activeTabId: null,
    _events: {},

    init: function(config, menu) {
      appConfig = config || {};
      menuData = menu || [];
      selectId = (appConfig.menu && appConfig.menu.selectId) || 0;
      this.buildPageConfig();
      this.loadTabsState();
      this.render();
      this.bindEvents();
      return this;
    },

    buildPageConfig: function() {
      var self = this;
      menuData.forEach(function(item) {
        self.buildPageConfigFromItem(item);
      });
    },

    buildPageConfigFromItem: function(item) {
      if (item.id !== undefined) {
        pageNames[item.id] = item.title;
        pageClosable[item.id] = item.closable !== false;
      }
      
      if (item.children && item.children.length > 0) {
        var self = this;
        item.children.forEach(function(child) {
          self.buildPageConfigFromItem(child);
        });
      }
    },

    getPageClosable: function(id) {
      if (pageClosable.hasOwnProperty(id)) {
        return pageClosable[id];
      }
      return true;
    },

    loadTabsState: function() {
      var state = theme.getState();
      var defaultTab = {
        id: selectId,
        title: pageNames[selectId] || ('Page ' + selectId),
        closable: this.getPageClosable(selectId)
      };

      if (!state.rememberTabs) {
        this.tabs = [defaultTab];
        this.activeTabId = selectId;
        return;
      }

      var storageKey = appConfig.storage ? appConfig.storage.tabsKey : 'tabsState';
      var saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          var parsed = JSON.parse(saved);
          if (parsed && parsed.tabs && Array.isArray(parsed.tabs) && parsed.tabs.length > 0) {
            var hasSelectId = parsed.tabs.some(function(t) {
              return t.id === selectId;
            });

            if (!hasSelectId) {
              parsed.tabs.unshift(defaultTab);
            }

            var self = this;
            this.tabs = parsed.tabs.map(function(t) {
              return {
                id: t.id,
                title: t.title || pageNames[t.id] || ('Page ' + t.id),
                closable: self.getPageClosable(t.id)
              };
            });

            if (parsed.activeTabId !== undefined && this.tabs.some(function(t) { return t.id === parsed.activeTabId; })) {
              this.activeTabId = parsed.activeTabId;
            } else {
              this.activeTabId = selectId;
            }
            return;
          }
        } catch (e) {
          console.warn('Failed to load tabs state', e);
        }
      }

      this.tabs = [defaultTab];
      this.activeTabId = selectId;
    },

    saveTabsState: function() {
      var state = theme.getState();
      if (!state.rememberTabs) return;

      var tabsState = {
        tabs: this.tabs.map(function(t) {
          return { id: t.id, title: t.title, closable: t.closable };
        }),
        activeTabId: this.activeTabId
      };

      var storageKey = appConfig.storage ? appConfig.storage.tabsKey : 'tabsState';
      try {
        localStorage.setItem(storageKey, JSON.stringify(tabsState));
      } catch (e) {
        console.warn('Failed to save tabs state', e);
      }
    },

    render: function() {
      var html = '';
      var self = this;

      this.tabs.forEach(function(tab) {
        var isActive = tab.id === self.activeTabId;
        var closeClass = tab.closable ? 'able-close' : 'disable-close';
        var activeClass = isActive ? 'active' : '';

        html += '<div class="tab-item ' + activeClass + ' ' + closeClass + '" data-id="' + tab.id + '">';
        html += '<span class="tab-text">' + tab.title + '</span>';
        if (tab.closable) {
          html += '<span class="tab-close"><i class="layui-icon layui-icon-close"></i></span>';
        }
        html += '</div>';
      });

      $('#tabsBar').html(html);
      this.updateScrollButtons();
    },

    bindEvents: function() {
      var self = this;

      $('#tabsBar').on('click', '.tab-item', function(e) {
        var tabId = $(this).data('id');
        router.navigateById(tabId);
      });

      $('#tabsBar').on('click', '.tab-close', function(e) {
        e.stopPropagation();
        var tabId = $(this).closest('.tab-item').data('id');
        self.closeTab(tabId);
      });

      $('#scrollLeftBtn').on('click', function() {
        self.scrollTabs(-200);
      });

      $('#scrollRightBtn').on('click', function() {
        self.scrollTabs(200);
      });

      $('#tabsBar').on('scroll', function() {
        self.updateScrollButtons();
      });

      $('#tabsActionsBtn').on('click', function() {
        $('#tabsDropdown').toggleClass('show');
      });

      $(document).on('click', function(e) {
        if (!$(e.target).closest('.layui-tabs-actions').length) {
          $('#tabsDropdown').removeClass('show');
        }
      });

      $('#tabsDropdown').on('click', '.tabs-dropdown-item', function() {
        var action = $(this).data('action');
        self.handleDropdownAction(action);
      });
    },

    openTab: function(id) {
      if (!this.tabs.some(function(t) { return t.id === id; })) {
        var title = pageNames[id] || ('Page ' + id);
        var closable = this.getPageClosable(id);
        this.tabs.push({
          id: id,
          title: title,
          closable: closable
        });
      }

      this.activeTabId = id;
      this.saveTabsState();
      this.render();
      this.scrollToActiveTab();
    },

    findTab: function(id) {
      for (var i = 0; i < this.tabs.length; i++) {
        if (this.tabs[i].id === id) {
          return this.tabs[i];
        }
      }
      return null;
    },

    closeTab: function(tabId) {
      var index = -1;
      for (var i = 0; i < this.tabs.length; i++) {
        if (this.tabs[i].id === tabId) {
          index = i;
          break;
        }
      }
      if (index === -1) return;

      var tab = this.tabs[index];
      if (!tab.closable) return;

      this.tabs.splice(index, 1);
      this.saveTabsState();

      if (this.activeTabId === tabId) {
        var newIndex = Math.min(index, this.tabs.length - 1);
        router.navigateById(this.tabs[newIndex].id);
      } else {
        this.render();
      }
    },

    closeCurrentTab: function() {
      this.closeTab(this.activeTabId);
      this.closeDropdown();
    },

    closeOtherTabs: function() {
      var self = this;
      this.tabs = this.tabs.filter(function(t) {
        return t.id === self.activeTabId || !t.closable;
      });
      this.saveTabsState();
      this.render();
      this.closeDropdown();
    },

    closeAllTabs: function() {
      this.tabs = this.tabs.filter(function(t) { return !t.closable; });

      var self = this;
      if (!this.tabs.some(function(t) { return t.id === self.activeTabId; })) {
        this.activeTabId = this.tabs[0] ? this.tabs[0].id : selectId;
        router.navigateById(this.activeTabId);
      }

      this.saveTabsState();
      this.render();
      this.closeDropdown();
    },

    handleDropdownAction: function(action) {
      switch (action) {
        case 'refreshCurrent':
          this.refreshCurrentTab();
          break;
        case 'closeCurrent':
          this.closeCurrentTab();
          break;
        case 'closeOther':
          this.closeOtherTabs();
          break;
        case 'closeAll':
          this.closeAllTabs();
          break;
      }
    },

    refreshCurrentTab: function() {
      var activeTabId = this.activeTabId;
      if (activeTabId === null) return;
      
      this.closeDropdown();
      
      this.emit('refreshTab', { tabId: activeTabId });
    },

    closeDropdown: function() {
      $('#tabsDropdown').removeClass('show');
    },

    scrollTabs: function(distance) {
      var $tabsBar = $('#tabsBar');
      var currentScroll = $tabsBar.scrollLeft();
      var maxScroll = $tabsBar[0].scrollWidth - $tabsBar.width();
      var targetScroll = Math.max(0, Math.min(maxScroll, currentScroll + distance));
      
      $tabsBar.stop(true).animate({
        scrollLeft: targetScroll
      }, 200, 'swing');
    },

    scrollToActiveTab: function() {
      var $tabsBar = $('#tabsBar');
      var $activeTab = $tabsBar.find('.tab-item.active');

      if (!$activeTab.length) return;

      var tabsBarWidth = $tabsBar.width();
      var tabsBarScrollLeft = $tabsBar.scrollLeft();
      var activeTabLeft = $activeTab[0].offsetLeft;
      var activeTabWidth = $activeTab.outerWidth();
      var activeTabRight = activeTabLeft + activeTabWidth;
      
      var visibleLeft = tabsBarScrollLeft + 20;
      var visibleRight = tabsBarScrollLeft + tabsBarWidth - 20;

      var targetScroll = null;

      if (activeTabLeft < visibleLeft) {
        targetScroll = Math.max(0, activeTabLeft - 20);
      } else if (activeTabRight > visibleRight) {
        targetScroll = activeTabRight - tabsBarWidth + 20;
      }

      if (targetScroll !== null && Math.abs(targetScroll - tabsBarScrollLeft) > 5) {
        $tabsBar.stop(true).animate({
          scrollLeft: targetScroll
        }, 250, 'swing');
      }
    },

    updateScrollButtons: function() {
      var $tabsBar = $('#tabsBar');
      var needScroll = $tabsBar[0].scrollWidth > $tabsBar.width();

      $('#scrollLeftBtn').prop('disabled', !needScroll || $tabsBar.scrollLeft() <= 0);
      $('#scrollRightBtn').prop('disabled', !needScroll || $tabsBar.scrollLeft() >= $tabsBar[0].scrollWidth - $tabsBar.width() - 1);
    },

    setActive: function(id) {
      this.activeTabId = id;
      this.render();
    },

    getActiveTabId: function() {
      return this.activeTabId;
    },

    getSelectId: function() {
      return selectId;
    },

    on: function(event, callback) {
      this._events[event] = this._events[event] || [];
      this._events[event].push(callback);
      return this;
    },

    emit: function(event) {
      var args = Array.prototype.slice.call(arguments, 1);
      var callbacks = this._events[event];
      if (callbacks) {
        callbacks.forEach(function(callback) {
          callback.apply(null, args);
        });
      }
    }
  };

  exports('tabsComp', Tabs);
});
