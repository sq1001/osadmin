/**
 * TinyMCE模块封装
 * 基于TinyMCE 8.x最新版本
 */

layui.define(['jquery'], function(exports) {
  'use strict';

  var $ = layui.jquery;
  var tinymceOriginal = window.tinymce;

  if (!tinymceOriginal) {
    $.ajax({
      url: layui.cache.base + 'lib/tinymce/tinymce.min.js',
      dataType: 'script',
      cache: true,
      async: false
    });
    tinymceOriginal = window.tinymce;
  }

  var tinymceMod = {
    init: function(options) {
      var defaults = {
        base_url: layui.cache.base + 'lib/tinymce',
        suffix: '.min',
        license_key: 'gpl',
        language: 'zh-CN',
        language_url: layui.cache.base + 'lib/tinymce/langs/zh-CN.js',
        height: 400,
        menubar: true,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'help', 'wordcount', 'quickbars'
        ],
        quickbars_selection_toolbar: 'cut copy | bold italic underline strikethrough',
        quickbars_insert_toolbar: 'quickimage | quicktable',
        toolbar: 'undo redo | formatselect | ' +
          'bold italic backcolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | help',
        skin: 'tinymce-5',
        branding: false,
        promotion: false,
        resize: true,
        statusbar: true,
        elementpath: false,
        browser_spellcheck: true,
        contextmenu: false,
        placeholder: '请输入内容...',
        images_upload_url: '/upload/images',
        images_upload_credentials: true,
        setup: function(editor) {
          editor.on('change', function() {
            editor.save();
          });
        }
      };

      var settings = $.extend(true, {}, defaults, options);
      return tinymceOriginal.init(settings);
    },

    get: function(id) {
      return tinymceOriginal.get(id);
    },

    remove: function(id) {
      var editor = this.get(id);
      if (editor) {
        editor.remove();
      }
    },

    getContent: function(id) {
      var editor = this.get(id);
      return editor ? editor.getContent() : '';
    },

    setContent: function(id, content) {
      var editor = this.get(id);
      if (editor) {
        editor.setContent(content);
      }
    },

    resetContent: function(id, content) {
      var editor = this.get(id);
      if (editor) {
        editor.resetContent(content);
      }
    },

    show: function(id) {
      var editor = this.get(id);
      if (editor) {
        editor.show();
      }
    },

    hide: function(id) {
      var editor = this.get(id);
      if (editor) {
        editor.hide();
      }
    },
    
  };

  exports('tinymceMod', tinymceMod);
});
