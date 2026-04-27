// firebase-messaging-sw.js
// Service Worker para notificaciones push de Firebase Cloud Messaging.
// Este archivo DEBE estar en la raíz del dominio para que FCM funcione.
// BotanicAI v8.4.0

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  projectId: "botanicai-2851e",
  appId: "1:660980825308:web:2470c71ff01b11fe638819",
  apiKey: "AIzaSyAI2RbzY6_4DXb3lfc4_R905ddzXlxxfDs",
  authDomain: "botanicai-2851e.firebaseapp.com",
  storageBucket: "botanicai-2851e.firebasestorage.app",
  messagingSenderId: "660980825308",
  measurementId: "G-YX6QWKJD4W"
});

const messaging = firebase.messaging();

// Maneja mensajes push cuando la app está en segundo plano o cerrada
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Mensaje de fondo recibido:', payload);

  const notificationTitle = payload.notification?.title || '🌿 BotanicAI';
  const notificationOptions = {
    body: payload.notification?.body || 'Nuevo mensaje en el chat.',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    tag: payload.data?.roomId || 'botanicai-chat',
    renotify: true,
    vibrate: [200, 100, 200],
    data: {
      url: payload.data?.url || '/',
      roomId: payload.data?.roomId,
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Al hacer clic en la notificación, abre/enfoca la app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
