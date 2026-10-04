// src/services/bulkInquiryService.js
import apiClient from '../api/client';

export const bulkInquiryService = {
  // ─── PUBLIC ─────────────────────────────────
  submit: async (payload) => {
    const { data } = await apiClient.post('/bulk-inquiry', payload);
    return data;
  },

  // ─── ADMIN ──────────────────────────────────
  getInquiries: async ({ status, type, search, page = 1, limit = 20 } = {}) => {
    const params = { page, limit };
    if (status && status !== 'all') params.status = status;
    if (type && type !== 'all') params.type = type;
    if (search) params.search = search;
    const { data } = await apiClient.get('/admin/bulk-inquiries', { params });
    return data;
  },

  getInquiry: async (id) => {
    const { data } = await apiClient.get(`/admin/bulk-inquiries/${id}`);
    return data;
  },

  updateInquiry: async (id, payload) => {
    const { data } = await apiClient.patch(`/admin/bulk-inquiries/${id}`, payload);
    return data;
  },

  deleteInquiry: async (id) => {
    const { data } = await apiClient.delete(`/admin/bulk-inquiries/${id}`);
    return data;
  },

  getUnreadCount: async () => {
    const { data } = await apiClient.get('/admin/bulk-inquiries/unread-count');
    return data;
  },

  getStats: async () => {
    const { data } = await apiClient.get('/admin/bulk-inquiries/stats');
    return data;
  },
};