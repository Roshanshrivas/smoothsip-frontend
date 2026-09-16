// src/hooks/usePushNotifications.js
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';
import { pushService } from '../services/pushService';

// Firebase config (public – safe to expose)
// ✅ Use import.meta.env for Vite
const firebaseConfig = {
  apiKey: import.meta.env.VITE_REACT_APP_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_REACT_APP_FIREBASE_APP_ID,
};

let appInitialized = false;
let messaging = null;

const getMessagingInstance = () => {
  if (!appInitialized) {
    const app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    appInitialized = true;
  }
  return messaging;
};

export const usePushNotifications = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const setupPush = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.log('Push permission denied by user');
          return;
        }

        // ✅ Use import.meta.env for Vite
        const vapidKey = import.meta.env.VITE_REACT_APP_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
          console.warn('VAPID key missing – push will not work');
          return;
        }

        const messaging = getMessagingInstance();
        const token = await getToken(messaging, { vapidKey });
        if (!token) {
          console.warn('No push token received');
          return;
        }

        await pushService.savePushToken(token);
        console.log('✅ Push token saved successfully');
      } catch (error) {
        console.warn('Push setup error:', error.message);
      }
    };

    setupPush();
  }, [isAuthenticated, user]);
};

export const useRemovePushToken = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) return;

    const removeToken = async () => {
      try {
        const messaging = getMessagingInstance();
        const vapidKey = import.meta.env.VITE_REACT_APP_FIREBASE_VAPID_KEY;
        if (!vapidKey) return;

        const token = await getToken(messaging, { vapidKey });
        if (token) {
          await pushService.removePushToken(token);
          console.log('✅ Push token removed on logout');
        }
      } catch (error) {
        console.warn('Remove push token error:', error.message);
      }
    };

    return () => {
      removeToken();
    };
  }, [isAuthenticated]);
};