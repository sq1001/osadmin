/**
 * OS Admin Service Worker
 * 用于缓存静态资源，提升加载速度
 * 注意：仅在 HTTPS 或 localhost 环境下生效
 */

// 缓存名称（版本号更新会清除旧缓存）
const CACHE_NAME = 'osadmin-cache-v2';

// 预缓存核心资源
const PRECACHE_CORE = [
  'lib/layui/css/layui.css',
  'lib/layui/layui.js',
  'admin/css/index.css',
  'admin/js/init.js',
  'config/app.json',
  'config/menu.json'
];

// 预缓存第三方库（三个扩展库）
const PRECACHE_THIRD_PARTY = [
  'lib/echarts/echarts.min.js',
  'lib/xm-select/xm-select.js',
  'lib/tinymce/tinymce.min.js'
];

// 合并预缓存列表
const PRECACHE_URLS = [...PRECACHE_CORE, ...PRECACHE_THIRD_PARTY];

// 安装：预缓存
self.addEventListener('install', function(event) {
  console.log('[SW] 安装中...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[SW] 缓存核心资源:', PRECACHE_CORE);
        return cache.addAll(PRECACHE_CORE);
      })
      .then(function() {
        // 核心资源缓存完成后，再缓存第三方库（可选，不阻塞安装）
        return caches.open(CACHE_NAME).then(function(cache) {
          console.log('[SW] 缓存第三方库:', PRECACHE_THIRD_PARTY);
          return cache.addAll(PRECACHE_THIRD_PARTY).catch(function(err) {
            // 第三方库可能很大，失败不阻塞
            console.warn('[SW] 第三方库部分缓存失败:', err);
          });
        });
      })
      .then(function() {
        console.log('[SW] 安装完成');
        return self.skipWaiting();
      })
  );
});

// 激活：清理旧缓存
self.addEventListener('activate', function(event) {
  console.log('[SW] 激活中...');
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          // 保留当前版本缓存，删除其他旧版本
          return cacheName !== CACHE_NAME;
        }).map(function(cacheName) {
          console.log('[SW] 删除旧缓存:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      console.log('[SW] 激活完成');
      return self.clients.claim();
    })
  );
});

// 拦截请求，缓存优先策略
self.addEventListener('fetch', function(event) {
  // 只缓存 GET 请求
  if (event.request.method !== 'GET') {
    return;
  }

  const request = event.request;
  const url = new URL(request.url);

  // 忽略跨域请求（可选）
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then(function(response) {
        if (response) {
          console.log('[SW] 从缓存获取:', url.pathname);
          return response;
        }

        // 否则去网络请求
        return fetch(request).then(function(networkResponse) {
          // 缓存新响应
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(request, responseToCache);
            });
          }
          console.log('[SW] 从网络获取:', url.pathname);
          return networkResponse;
        });
      })
      .catch(function() {
        console.log('[SW] 请求失败:', url.pathname);
      })
  );
});
