// src/services/settingsService.js
import apiClient from '../api/client';
import toast from 'react-hot-toast';

const defaultSettings = {
  general: {
    storeName: 'Tumbler Store',
    storeEmail: 'support@tumbler.com',
    storePhone: '+91 987 654 3210',
    storeAddress: '123, Tumbler Street, Kolkata, West Bengal, India - 700001',
    storeLanguage: 'English',
    currency: 'INR',
    currencySymbol: '₹',
    timezone: 'Asia/Kolkata (GMT+05:30)',
    dateFormat: 'DD MMM YYYY',
    timeFormat: '12 Hours',
    maintenanceMode: false,
  },
  email: {
    driver: 'SMTP',
    host: 'smtp.gmail.com',
    port: '587',
    username: '',
    password: '',
    encryption: 'TLS',
  },
  sms: {
    provider: 'Twilio',
    accountSid: '',
    authToken: '',
    fromNumber: '',
  },
  seo: {
    metaTitle: 'Tumbler Store - Premium Quality Tumblers',
    metaDescription: 'Buy premium quality tumblers online at best prices. Custom designs, fast delivery and secure payments.',
    metaKeywords: 'tumbler, water bottle, custom tumbler, travel mug, thermos',
  },
  security: {
    twoFactor: false,
    loginNotification: false,
    strongPassword: false,
    sessionTimeout: false,
  },
  backup: {
    dbLastBackup: '18 May 2025, 03:30 AM',
    fileLastBackup: '18 May 2025, 03:30 AM',
    systemVersion: '2.4.1',
  },
};

// ─── API Calls ──────────────────────────────────────
const fetchSettings = async () => {
  const response = await apiClient.get('/admin/settings');
  return response.data.settings;
};

const saveSettings = async (data) => {
  const response = await apiClient.put('/admin/settings', data);
  return response.data.settings;
};

const resetSettings = async () => {
  const response = await apiClient.post('/admin/settings/reset');
  return response.data.settings;
};

// ─── Exported Service ──────────────────────────────
export const settingsService = {
  getAll: async () => {
    try {
      const settings = await fetchSettings();
      const merged = { ...defaultSettings };
      Object.keys(merged).forEach((key) => {
        if (settings[key]) {
          merged[key] = { ...merged[key], ...settings[key] };
        }
      });
      return merged;
    } catch (error) {
      console.warn('Failed to fetch settings, using defaults');
      return defaultSettings;
    }
  },

  updateSection: async (section, data) => {
    const payload = { [section]: data };
    const settings = await saveSettings(payload);
    return settings;
  },

  resetAll: async () => {
    return await resetSettings();
  },
};