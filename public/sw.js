self.addEventListener('push', event => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/logo.png',
    badge: '/badge-icon.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/paramedic'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  // Navigate to the specified URL when notification is clicked
  event.waitUntil(
    clients.matchAll({type: 'window'}).then(windowClients => {
      // Check if there's already a window open
      for (let client of windowClients) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});