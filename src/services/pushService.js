// src/services/pushService.js
import apiClient from '../api/client';

export const pushService = {
  /**
   * Save user's push notification token
   */
  savePushToken: async (token, deviceInfo = {}) => {
    const response = await apiClient.post('/users/push-token', {
      token,
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: 'web',
        browser: navigator.userAgentData?.brands?.[0]?.brand || 'unknown',
        ...deviceInfo,
      },
    });
    return response.data;
  },

  /**
   * Remove user's push notification token (logout)
   */
  removePushToken: async (token) => {
    const response = await apiClient.delete('/users/push-token', {
      data: { token },
    });
    return response.data;
  },

  /**
   * Get all push tokens for the current user
   */
  getMyPushTokens: async () => {
    const response = await apiClient.get('/users/push-tokens');
    return response.data;
  },

  /**
   * Update push notification preferences
   */
  updatePushPreferences: async (preferences) => {
    const response = await apiClient.put('/users/push-preferences', preferences);
    return response.data;
  },
};