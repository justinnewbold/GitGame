/**
 * Enhanced Service Worker for GitGame PWA
 * Provides comprehensive offline functionality, intelligent caching, and background sync
 */

const CACHE_VERSION = 'v2';
const STATIC_CACHE = `gitgame-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `gitgame-runtime-${CACHE_VERSION}`;
const IMAGES_CACHE = `gitgame-images-${CACHE_VERSION}`;

// Assets to cache immediately on install (shell)
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/offline.html'
];

// File extensions to cache with specific strategies
const CACHE_STRATEGIES = {
    static: ['.js', '.css', '.woff2', '.woff', '.ttf'],
    images: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'],
    runtime: ['.json', '.html']
};

// Max age for different cache types (in milliseconds)
const CACHE_MAX_AGE = {
    static: 7 * 24 * 60 * 60 * 1000, // 7 days
    images: 30 * 24 * 60 * 60 * 1000, // 30 days
    runtime: 24 * 60 * 60 * 1000 // 1 day
};

// Max items in each cache
const CACHE_MAX_ITEMS = {
    static: 100,
    images: 50,
    runtime: 30
};

/**
 * Install event - precache critical assets
 */
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Precaching shell assets');
                return cache.addAll(PRECACHE_ASSETS.map(url => {
                    return new Request(url, { cache: 'reload' });
                }));
            })
            .then(() => self.skipWaiting())
            .catch((error) => {
                console.error('[SW] Precaching failed:', error);
            })
    );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');

    const currentCaches = [STATIC_CACHE, RUNTIME_CACHE, IMAGES_CACHE];

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            return cacheName.startsWith('gitgame-') &&
                                   !currentCaches.includes(cacheName);
                        })
                        .map((cacheName) => {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

/**
 * Determine which cache to use based on request
 */
function getCacheForRequest(request) {
    const url = new URL(request.url);
    const extension = url.pathname.split('.').pop().toLowerCase();

    if (CACHE_STRATEGIES.static.includes(`.${extension}`)) {
        return STATIC_CACHE;
    }
    if (CACHE_STRATEGIES.images.includes(`.${extension}`)) {
        return IMAGES_CACHE;
    }
    return RUNTIME_CACHE;
}

/**
 * Check if cached response is still valid
 */
function isCacheValid(response, cacheType) {
    if (!response) return false;

    const dateHeader = response.headers.get('date');
    if (!dateHeader) return true; // No date header, assume valid

    const cachedTime = new Date(dateHeader).getTime();
    const maxAge = CACHE_MAX_AGE[cacheType] || CACHE_MAX_AGE.runtime;

    return (Date.now() - cachedTime) < maxAge;
}

/**
 * Limit cache size by removing oldest entries
 */
async function limitCacheSize(cacheName, maxItems) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    if (keys.length > maxItems) {
        // Remove oldest entries
        const keysToDelete = keys.slice(0, keys.length - maxItems);
        await Promise.all(keysToDelete.map(key => cache.delete(key)));
    }
}

/**
 * Stale-while-revalidate strategy
 * Returns cached version immediately, then updates cache in background
 */
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    // Start network request in parallel
    const networkPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
            limitCacheSize(cacheName, CACHE_MAX_ITEMS[cacheName.split('-')[1]] || 50);
        }
        return networkResponse;
    }).catch(() => null);

    // Return cached immediately if available, otherwise wait for network
    return cachedResponse || networkPromise;
}

/**
 * Cache-first strategy for static assets
 */
async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse && isCacheValid(cachedResponse, cacheName.split('-')[1])) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
            limitCacheSize(cacheName, CACHE_MAX_ITEMS[cacheName.split('-')[1]] || 50);
        }
        return networkResponse;
    } catch (error) {
        // Return stale cache if network fails
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

/**
 * Network-first strategy for dynamic content
 */
async function networkFirst(request, cacheName) {
    const cache = await caches.open(cacheName);

    try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

/**
 * Fetch event - intelligent caching based on request type
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        // But cache CDN resources for Phaser, etc.
        if (url.hostname.includes('cdn') || url.hostname.includes('unpkg')) {
            event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
        }
        return;
    }

    // Handle navigation requests
    if (request.mode === 'navigate') {
        event.respondWith(
            networkFirst(request, RUNTIME_CACHE)
                .catch(() => caches.match('/offline.html') || caches.match('/'))
        );
        return;
    }

    // Determine cache strategy based on resource type
    const cacheName = getCacheForRequest(request);
    const extension = url.pathname.split('.').pop().toLowerCase();

    // Static assets - cache first
    if (CACHE_STRATEGIES.static.includes(`.${extension}`)) {
        event.respondWith(cacheFirst(request, cacheName));
        return;
    }

    // Images - cache first with long expiry
    if (CACHE_STRATEGIES.images.includes(`.${extension}`)) {
        event.respondWith(cacheFirst(request, cacheName));
        return;
    }

    // Everything else - stale while revalidate
    event.respondWith(staleWhileRevalidate(request, cacheName));
});

/**
 * Message handling
 */
self.addEventListener('message', (event) => {
    const { type, payload } = event.data || {};

    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;

        case 'CLEAR_CACHE':
            event.waitUntil(
                caches.keys().then((cacheNames) => {
                    return Promise.all(
                        cacheNames.map((cacheName) => caches.delete(cacheName))
                    );
                }).then(() => {
                    event.ports[0]?.postMessage({ success: true });
                })
            );
            break;

        case 'GET_CACHE_SIZE':
            event.waitUntil(
                (async () => {
                    let totalSize = 0;
                    const cacheDetails = {};

                    for (const cacheName of await caches.keys()) {
                        const cache = await caches.open(cacheName);
                        const keys = await cache.keys();
                        cacheDetails[cacheName] = keys.length;
                        totalSize += keys.length;
                    }

                    event.ports[0]?.postMessage({
                        totalItems: totalSize,
                        caches: cacheDetails
                    });
                })()
            );
            break;

        case 'PREFETCH':
            if (payload?.urls) {
                event.waitUntil(
                    caches.open(STATIC_CACHE).then((cache) => {
                        return Promise.allSettled(
                            payload.urls.map(url => cache.add(url))
                        );
                    })
                );
            }
            break;
    }
});

/**
 * Background sync for offline actions
 */
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);

    if (event.tag === 'sync-save-data') {
        event.waitUntil(syncSaveData());
    }
});

async function syncSaveData() {
    // Get pending sync operations from IndexedDB and process them
    try {
        const db = await openDatabase();
        const tx = db.transaction('syncQueue', 'readwrite');
        const store = tx.objectStore('syncQueue');
        const items = await new Promise(r => {
            const req = store.getAll();
            req.onsuccess = () => r(req.result);
            req.onerror = () => r([]);
        });

        for (const item of items) {
            try {
                // Process sync operation
                await fetch('/api/sync', {
                    method: 'POST',
                    body: JSON.stringify(item.data),
                    headers: { 'Content-Type': 'application/json' }
                });
                store.delete(item.id);
            } catch (error) {
                console.error('[SW] Sync failed for item:', item.id);
            }
        }
    } catch (error) {
        console.error('[SW] Background sync failed:', error);
    }
}

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('GitGameCloudSync', 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Push notifications
 */
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body || 'New update available!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        tag: data.tag || 'default',
        renotify: true,
        data: {
            url: data.url || '/'
        },
        actions: data.actions || [
            { action: 'open', title: 'Open Game' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'GitGame', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') return;

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((windowClients) => {
            // Focus existing window if available
            for (const client of windowClients) {
                if (client.url === event.notification.data.url && 'focus' in client) {
                    return client.focus();
                }
            }
            // Open new window
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url || '/');
            }
        })
    );
});

console.log('[SW] Enhanced service worker loaded');
