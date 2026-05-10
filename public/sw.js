self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? '상록수커피클럽', {
      body: data.body ?? '음료가 준비되었습니다!',
      icon: '/logo.png',
      badge: '/logo-nav.png',
      tag: 'order-ready',
      renotify: true,
      data: { url: data.url ?? '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const target = event.notification.data?.url ?? '/';
      const existing = list.find((c) => c.url.includes(target));
      if (existing) return existing.focus();
      return clients.openWindow(target);
    })
  );
});
