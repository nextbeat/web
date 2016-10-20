'use strict';

function tagFromData(data) {
    if ('resource_id' in data) {
        return `${data.type}_${data.resource_id}`
    } else {
        return data.type
    }
}

function collapsedMessageFromData(data) {
    switch (data.type) {
        case "NEW_MEDIAITEM":
            return `${data.username} added multiple posts to: ${data.description}`
        case "NEW_STACK":
            return `${data.username} has opened multiple new rooms.`
        case "MENTIONS": 
            return `People are talking about you in: ${data.description}`
        default:
            return 'You have multiple notifications.'
    }
}

self.addEventListener('install', event => {
    console.log('installed 5', self)
});

self.addEventListener('activate', event => {
    console.log('activated 5')
})

self.addEventListener('push', event => {
    var data = event.data.json(),
        tag  = tagFromData(data);

    event.waitUntil(clients.matchAll({
        includeUncontrolled: true,
        type: 'window'
    }).then(activeClients => {
        // If window is visible, do not display notification
        if (activeClients.length > 0) {
            var client = activeClients[0];
            if ('visibilityState' in client && client.visibilityState === 'visible') {
                throw new Error('Client visible.');
            }
        }
        return self.registration.getNotifications({ tag: tag });
    }).then(notifications => {
        var noteOptions = {
            body: data.message,
            icon: data.icon || '/images/favicon.png',
            data: { url: data.url },
            tag: tag
        }
        if (notifications && notifications.length > 0) {
            // Update displayed text on notification
            noteOptions.body = collapsedMessageFromData(data);
            data.title = 'Nextbeat';
            if (data.type === 'MENTIONS') {
                noteOptions.icon = '/images/favicon.png';
            } else if (data.type === 'NEW_STACK') {
                noteOptions.data.url = `${data.profile_url}?s=pw`
            } 
            noteOptions.renotify = true;
        }
        return self.registration.showNotification(data.title, noteOptions);
    }).catch(e => {
        // do nothing
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

