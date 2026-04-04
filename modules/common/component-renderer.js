layui.define(['jquery'], function(exports) {
  var $ = layui.$;
  
  var componentRenderer = {
    version: '2.0.0',
    debug: false,
    
    components: {
      tabs: {
        selector: '.layui-tabs',
        module: 'tabs',
        priority: 1,
        render: function($elem, module) {
          if (!$elem.data('layui-rendered')) {
            module.render({ elem: $elem[0] });
            $elem.data('layui-rendered', true);
            return true;
          }
          return false;
        }
      },
      form: {
        selector: '.layui-form, input.layui-input, select.layui-select, textarea.layui-textarea, input[type="checkbox"][lay-skin], input[type="radio"][lay-skin]',
        module: 'form',
        priority: 2,
        container: '.page-content',
        render: function($container, module) {
          if (!$container.data('form-rendered')) {
            module.render();
            $container.data('form-rendered', true);
            return true;
          }
          return false;
        }
      },
      element: {
        selector: '.layui-nav, .layui-collapse, .layui-breadcrumb, .layui-progress, .layui-timeline',
        module: 'element',
        priority: 3,
        container: '.page-content',
        render: function($container, module) {
          if (!$container.data('element-rendered')) {
            module.render();
            $container.data('element-rendered', true);
            return true;
          }
          return false;
        }
      },
      carousel: {
        selector: '.layui-carousel',
        module: 'carousel',
        priority: 4,
        render: function($elem, module) {
          if (!$elem.data('layui-rendered')) {
            module.render({ elem: $elem[0] });
            $elem.data('layui-rendered', true);
            return true;
          }
          return false;
        }
      },
      rate: {
        selector: '.layui-rate',
        module: 'rate',
        priority: 5,
        render: function($elem, module) {
          if (!$elem.data('layui-rendered')) {
            module.render({ elem: $elem[0] });
            $elem.data('layui-rendered', true);
            return true;
          }
          return false;
        }
      },
      slider: {
        selector: '.layui-slider',
        module: 'slider',
        priority: 6,
        render: function($elem, module) {
          if (!$elem.data('layui-rendered')) {
            module.render({ elem: $elem[0] });
            $elem.data('layui-rendered', true);
            return true;
          }
          return false;
        }
      },
      transfer: {
        selector: '.layui-transfer',
        module: 'transfer',
        priority: 7,
        render: function($elem, module) {
          if (!$elem.data('layui-rendered')) {
            module.render({ elem: $elem[0] });
            $elem.data('layui-rendered', true);
            return true;
          }
          return false;
        }
      },
      tree: {
        selector: '.layui-tree',
        module: 'tree',
        priority: 8,
        render: function($elem, module) {
          if (!$elem.data('layui-rendered')) {
            module.render({ elem: $elem[0] });
            $elem.data('layui-rendered', true);
            return true;
          }
          return false;
        }
      },
      colorpicker: {
        selector: '.layui-colorpicker',
        module: 'colorpicker',
        priority: 9,
        render: function($elem, module) {
          if (!$elem.data('layui-rendered')) {
            module.render({ elem: $elem[0] });
            $elem.data('layui-rendered', true);
            return true;
          }
          return false;
        }
      },
      laypage: {
        selector: '.layui-laypage',
        module: 'laypage',
        priority: 10,
        render: function($elem, module) {
          if (!$elem.data('layui-rendered')) {
            module.render({ elem: $elem[0] });
            $elem.data('layui-rendered', true);
            return true;
          }
          return false;
        }
      },
      code: {
        selector: 'pre.layui-code',
        module: 'code',
        priority: 11,
        render: function($elem, module) {
          if (!$elem.data('layui-rendered')) {
            module.render({ elem: $elem[0] });
            $elem.data('layui-rendered', true);
            return true;
          }
          return false;
        }
      }
    },
    
    init: function(options) {
      this.debug = options && options.debug !== undefined ? options.debug : false;
      return this;
    },
    
    scanComponents: function($container) {
      var self = this;
      var detected = [];
      
      for (var name in this.components) {
        var config = this.components[name];
        var $found = $container.find(config.selector);
        
        if ($found.length > 0) {
          detected.push({
            name: name,
            config: config,
            count: $found.length
          });
          
          if (this.debug) {
            console.log('[ComponentRenderer] Detected:', name, 'Count:', $found.length);
          }
        }
      }
      
      return detected.sort(function(a, b) {
        return a.config.priority - b.config.priority;
      });
    },
    
    getRequiredModules: function(detectedComponents) {
      var modules = [];
      var moduleMap = {};
      
      detectedComponents.forEach(function(item) {
        var moduleName = item.config.module;
        if (!moduleMap[moduleName]) {
          moduleMap[moduleName] = true;
          modules.push(moduleName);
        }
      });
      
      return modules;
    },
    
    render: function(container, componentNames) {
      var self = this;
      var startTime = Date.now();
      var $container = container ? $(container) : $(document);
      
      if (this.debug) {
        console.log('[ComponentRenderer] Starting render...');
        console.time('[ComponentRenderer] Total');
      }
      
      var detectedComponents = componentNames 
        ? this.filterComponents(componentNames)
        : this.scanComponents($container);
      
      if (detectedComponents.length === 0) {
        if (this.debug) {
          console.log('[ComponentRenderer] No components detected');
        }
        return this;
      }
      
      var modulesToLoad = this.getRequiredModules(detectedComponents);
      
      if (this.debug) {
        console.log('[ComponentRenderer] Modules to load:', modulesToLoad);
        console.log('[ComponentRenderer] Components to render:', detectedComponents.map(function(c) { return c.name; }));
      }
      
      layui.use(modulesToLoad, function(){
        detectedComponents.forEach(function(item) {
          var config = item.config;
          var module = layui[config.module];
          
          if (!module) {
            console.warn('[ComponentRenderer] Module not loaded:', config.module);
            return;
          }
          
          try {
            if (config.container) {
              var $renderContainer = $container.find(config.container).first();
              if ($renderContainer.length > 0) {
                var rendered = config.render($renderContainer, module);
                if (rendered && self.debug) {
                  console.log('[ComponentRenderer] Rendered:', item.name);
                }
              }
            } else {
              $container.find(config.selector).each(function(){
                var $elem = $(this);
                var rendered = config.render($elem, module);
                if (rendered && self.debug) {
                  console.log('[ComponentRenderer] Rendered:', item.name, $elem.attr('id') || '');
                }
              });
            }
          } catch(e) {
            console.error('[ComponentRenderer] Render error:', item.name, e.message);
          }
        });
        
        if (self.debug) {
          console.timeEnd('[ComponentRenderer] Total');
          console.log('[ComponentRenderer] Rendered', detectedComponents.length, 'components in', (Date.now() - startTime), 'ms');
        }
      });
      
      return this;
    },
    
    filterComponents: function(componentNames) {
      var self = this;
      var names = componentNames.split(',').map(function(n) { return n.trim(); });
      
      return names.map(function(name) {
        var config = self.components[name];
        if (!config) {
          console.warn('[ComponentRenderer] Unknown component:', name);
          return null;
        }
        return {
          name: name,
          config: config,
          count: 0
        };
      }).filter(function(item) {
        return item !== null;
      });
    },
    
    renderAll: function(container, callback) {
      return this.render(container, null, callback);
    },
    
    clearCache: function(container) {
      var $container = container ? $(container) : $(document);
      $container.find('[data-layui-rendered]').removeAttr('data-layui-rendered');
      $container.removeData('form-rendered element-rendered');
      
      if (this.debug) {
        console.log('[ComponentRenderer] Cache cleared');
      }
      
      return this;
    }
  };
  
  exports('componentRenderer', componentRenderer);
});
