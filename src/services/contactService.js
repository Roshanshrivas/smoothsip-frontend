import apiClient from '../api/client';

export const contactService = {
  // ─── PUBLIC ────────────────────────────────────
  submitContactForm: async (formData) => {
    const response = await apiClient.post('/contact', formData);
    return response.data;
  },

  // ─── ADMIN ─────────────────────────────────────
  getMessages: async ({ status, search, page = 1, limit = 20 } = {}) => {
    const params = { page, limit };
    if (status && status !== 'all') params.status = status;
    if (search) params.search = search;

    const response = await apiClient.get('/admin/contacts', { params });
    return response.data;
  },

  getMessage: async (id) => {
    const response = await apiClient.get(`/admin/contacts/${id}`);
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await apiClient.patch(`/admin/contacts/${id}/read`);
    return response.data;
  },

  updateStatus: async (id, status, adminNote = '') => {
    const response = await apiClient.patch(`/admin/contacts/${id}/status`, {
      status,
      adminNote,
    });
    return response.data;
  },

  deleteMessage: async (id) => {
    const response = await apiClient.delete(`/admin/contacts/${id}`);
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await apiClient.get('/admin/contacts/unread-count');
    return response.data;
  },
};