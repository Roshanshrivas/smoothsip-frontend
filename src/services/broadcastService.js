// src/services/broadcastService.js
import apiClient from '../api/client';

export const broadcastService = {
  /**
   * Get all broadcast campaigns
   */
  getBroadcasts: async () => {
    const response = await apiClient.get('/admin/broadcasts');
    return response.data;
  },

  /**
   * Get a single broadcast by ID
   */
  getBroadcastById: async (id) => {
    const response = await apiClient.get(`/admin/broadcasts/${id}`);
    return response.data;
  },

  /**
   * Create a new broadcast campaign
   */
  createBroadcast: async (data) => {
    const response = await apiClient.post('/admin/broadcasts', data);
    return response.data;
  },

  /**
   * Update an existing broadcast campaign
   */
  updateBroadcast: async (id, data) => {
    const response = await apiClient.put(`/admin/broadcasts/${id}`, data);
    return response.data;
  },

  /**
   * Delete a broadcast campaign
   */
  deleteBroadcast: async (id) => {
    const response = await apiClient.delete(`/admin/broadcasts/${id}`);
    return response.data;
  },

  /**
   * Send a broadcast immediately
   */
  sendBroadcast: async (id) => {
    const response = await apiClient.post(`/admin/broadcasts/${id}/send`);
    return response.data;
  },

  /**
   * Duplicate a broadcast campaign
   */
  duplicateBroadcast: async (id) => {
    const response = await apiClient.post(`/admin/broadcasts/${id}/duplicate`);
    return response.data;
  },

  /**
   * Get broadcast analytics/stats
   */
  getBroadcastAnalytics: async (id) => {
    const response = await apiClient.get(`/admin/broadcasts/${id}/analytics`);
    return response.data;
  },

  /**
   * Get broadcast statistics (for dashboard)
   */
  getBroadcastStats: async () => {
    const response = await apiClient.get('/admin/broadcasts/stats');
    return response.data;
  },

  /**
   * Export broadcast data
   */
  exportBroadcastData: async (filters = {}) => {
    const response = await apiClient.post('/admin/broadcasts/export', filters, {
      responseType: 'blob', // For file download
    });
    return response.data;
  },

  /**
   * Cancel a scheduled broadcast
   */
  cancelBroadcast: async (id) => {
    const response = await apiClient.post(`/admin/broadcasts/${id}/cancel`);
    return response.data;
  },

  /**
   * Get broadcast channels with their configurations
   */
  getChannels: async () => {
    const response = await apiClient.get('/admin/broadcasts/channels');
    return response.data;
  },

  /**
   * Test a channel configuration (email, push, etc.)
   */
  testChannel: async (channel, config) => {
    const response = await apiClient.post(`/admin/broadcasts/test/${channel}`, config);
    return response.data;
  },
};