/**
 * 权限管理模块
 * 获取控制器详细权限，并决定展示哪些按钮或dom元素
 */
layui.define(['jquery'], function(exports) {
  'use strict';

  var $ = layui.jquery;

  var Permission = {
    permissions: [],
    isSuperAdmin: false,
    initialized: false,

    init: function(options) {
      var self = this;
      var config = options || {};
      var url = config.url || '/app/admin/rule/permission';

      return new Promise(function(resolve, reject) {
        $.ajax({
          url: url,
          dataType: 'json',
          success: function(res) {
            self.permissions = res.data || [];
            self.isSuperAdmin = self.permissions.indexOf('*') !== -1;
            self.initialized = true;

            if (self !== top) {
              top.Admin = top.Admin || {};
              top.Admin.Account = top.Admin.Account || {};
              top.Admin.Account.isSuperAdmin = self.isSuperAdmin;
            } else {
              window.Admin = window.Admin || {};
              window.Admin.Account = window.Admin.Account || {};
              window.Admin.Account.isSuperAdmin = self.isSuperAdmin;
            }

            self.applyPermissions();
            resolve(self);
          },
          error: function(err) {
            console.error('[Permission] 权限加载失败:', err);
            self.initialized = false;
            reject(err);
          }
        });
      });
    },

    applyPermissions: function() {
      if (this.isSuperAdmin) {
        $("head").append("<style>*[permission]{display: initial !important}</style>");
        return;
      }

      var codes = this.permissions.map(function(code) {
        return '*[permission^="' + code + '"]';
      });

      if (codes.length) {
        $("head").append("<style>" + codes.join(",") + "{display: initial !important}</style>");
      }
    },

    hasPermission: function(permission) {
      if (!this.initialized) {
        console.warn('[Permission] 权限模块未初始化');
        return false;
      }

      if (this.isSuperAdmin) {
        return true;
      }

      return this.permissions.indexOf(permission) !== -1;
    },

    getPermissions: function() {
      return this.permissions;
    },

    isSuper: function() {
      return this.isSuperAdmin;
    },

    reload: function(options) {
      this.permissions = [];
      this.isSuperAdmin = false;
      this.initialized = false;
      return this.init(options);
    }
  };

  exports('permissionModule', Permission);
});
