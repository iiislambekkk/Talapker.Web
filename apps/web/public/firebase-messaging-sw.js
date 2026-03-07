importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyBS_EyrQCOPVKybvx9cxNUe0rnMg5Stce4",
    authDomain: "talapker-f75a4.firebaseapp.com",
    projectId: "talapker-f75a4",
    messagingSenderId: "829651728804",
    appId: "1:829651728804:web:a385317b6d9d20f848e931"
});

firebase.messaging().onBackgroundMessage(function(payload) {
    const title    = payload.data?.title    ?? "Уведомление";
    const body     = payload.data?.body     ?? "";
    const deepLink = payload.data?.deep_link ?? null;

    return self.registration.showNotification(title, {
        body,
        icon: "/icons/logo-192x192.png",
        data: { url: deepLink }
    });
});

self.addEventListener("notificationclick", function(event) {
    event.notification.close();

    const targetUrl = event.notification?.data?.url || "/";

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then(function(clientList) {
            for (let client of clientList) {
                if ('focus' in client) {
                    client.postMessage({ type: "REDIRECT", url: targetUrl });
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});

self.addEventListener("install",  (e) => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(clients.claim()));