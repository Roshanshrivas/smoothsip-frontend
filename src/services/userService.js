// src/services/userService.js
import apiClient from '../api/client';

export const userService = {
  // Admin user management
  fetchUsers: async ({ page = 1, limit = 10, search = '', role = 'all', status = 'all' } = {}) => {
    const params = new URLSearchParams({ page, limit, search, role, status });
    const response = await apiClient.get(`/admin/users?${params}`);
    return response.data; // { users, total, page, totalPages }
  },

  getUser: async (id) => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data.user;
  },

  createUser: async (userData) => {
    const response = await apiClient.post('/admin/users', userData);
    return response.data.user;
  },

  updateUser: async (id, updates) => {
    const response = await apiClient.put(`/admin/users/${id}`, updates);
    return response.data.user;
  },

  deleteUser: async (id) => {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  },

  bulkDeleteUsers: async (ids) => {
    const response = await apiClient.post('/admin/users/bulk-delete', { ids });
    return response.data;
  },

  getUserStats: async () => {
    const response = await apiClient.get('/admin/users/stats');
    return response.data.stats;
  },

  exportUsers: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await apiClient.get(`/admin/users/export?${params}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  blockUser: async (id) => {
    const response = await apiClient.patch(`/admin/users/${id}/block`);
    return response.data;
  },

  unblockUser: async (id) => {
    const response = await apiClient.patch(`/admin/users/${id}/unblock`);
    return response.data;
  },
   getAudienceCounts: async () => {
    const response = await apiClient.get('/admin/users/audience-counts');
    return response.data;
  },
};