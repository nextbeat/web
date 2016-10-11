'use strict';

self.addEventListener('install', event => {
    console.log('installed 3', self)
});

self.addEventListener('activate', event => {
    console.log('activated')
})

self.addEventListener('push', event => {
    var data = event.data.json();

    event.waitUntil(self.registration.showNotification(data.message, {
        icon: '/images/favicon.png',
        data: data.data
    }))
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    var url = event.notification.data.url;

    event.waitUntil(clients.matchAll({
            includeUncontrolled: true,
            type: 'window'
        }).then(activeClients => {
            if (activeClients.length > 0) {
                activeClients[0].navigate(url);
                activeClients[0].focus();
            } else {
                clients.openWindow(url);
            }
        })
    );
})

