'use strict';

self.addEventListener('install', event => {
    console.log('installed 5', self)
});

self.addEventListener('activate', event => {
    console.log('activated 5')
})

self.addEventListener('push', event => {
    var data = event.data.json();

    event.waitUntil(clients.matchAll({
        includeUncontrolled: true,
        type: 'window'
    }).then(activeClients => {
        // If window is visible, do not display notification
        if (activeClients.length > 0) {
            var client = activeClients[0];
            if ('visibilityState' in client && client.visibilityState === 'visible') {
                return;
            }
        }
        var url = `${data.url}?s=pw`
        return self.registration.showNotification(data.title, {
            body: data.message,
            icon: data.icon || '/images/favicon.png',
            data: { url: url }
        })
    }));
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    var url = event.notification.data.url;

    event.waitUntil(clients.matchAll({
            includeUncontrolled: true,
            type: 'window'
        }).then(activeClients => {
            if (activeClients.length > 0) {
                var client = activeClients[0];
                if ('navigate' in client && 'focus' in client) {
                    client.navigate(url);
                    client.focus();
                }
            } else {
                clients.openWindow(url);
            }
        })
    );
})

