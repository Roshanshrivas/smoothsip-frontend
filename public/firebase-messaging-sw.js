// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Your Firebase config (public)
firebase.initializeApp({
  apiKey: 'AIzaSyA0f2NzhJKAVYJbTowXl5yw56Q6laJ9NHo',
  authDomain: 'smoothsip-b8c65.firebaseapp.com',
  projectId: 'smoothsip-b8c65',
  storageBucket: 'smoothsip-b8c65.firebasestorage.app',
  messagingSenderId: '713640318954',
  appId: '1:713640318954:web:557837282ebdd446d48493',
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'Tumbler Studio';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new update!',
    icon: '/favicon.ico',
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});