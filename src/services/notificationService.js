// src/services/notificationService.js
import apiClient from '../api/client';

export const notificationService = {

  // ─── ADMIN NOTIFICATIONS ──────────────────────────
  getAdminNotifications: async (params = {}) => {
    const { page = 1, limit = 20, read, search } = params;
    const query = new URLSearchParams({ page, limit });
    if (read !== undefined) query.append('read', read);
    if (search) query.append('search', search);
    const response = await apiClient.get(`/admin/notifications?${query}`);
    return response.data;
  },

  markAdminAsRead: async (id) => {
    const response = await apiClient.patch(`/admin/notifications/${id}/read`);
    return response.data;
  },

  markAllAdminAsRead: async () => {
    const response = await apiClient.post('/admin/notifications/mark-all-read');
    return response.data;
  },

  deleteAdminNotification: async (id) => {
    const response = await apiClient.delete(`/admin/notifications/${id}`);
    return response.data;
  },

  // ─── USER NOTIFICATIONS (if needed) ───────────────
  getUserNotifications: async () => {
    const response = await apiClient.get('/notifications');
    return response.data;
  },

  markUserAsRead: async (id) => {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllUserAsRead: async () => {
    const response = await apiClient.post('/notifications/mark-all-read');
    return response.data;
  },

  deleteUserNotification: async (id) => {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
  },
};