import apiClient from '../api/client';
import toast from 'react-hot-toast';

export const reviewService = {
  // ─── Admin ──────────────────────────────────────────
  fetchReviews: async ({ search = '', status = 'all', rating = 'all', page = 1, limit = 10 } = {}) => {
    const params = new URLSearchParams({ page, limit, search, status, rating });
    const response = await apiClient.get(`/admin/reviews?${params}`);
    return response.data; // { reviews, total, page, limit }
  },

  updateReviewStatus: async (id, status) => {
    const response = await apiClient.put(`/admin/reviews/${id}/status`, { status });
    toast.success(`Review ${status}`);
    return response.data.review;
  },

  fetchAllReviews: async () => {
    const response = await apiClient.get('/admin/reviews?limit=1000'); // large limit to get all
    return response.data.reviews || [];
  },

  getStats: async () => {
    const response = await apiClient.get('/admin/reviews/stats');
    return response.data.stats;
  },

  getReviewById: async (id) => {
    const response = await apiClient.get(`/admin/reviews/${id}`);
    return response.data.review;
  },

  updateReview: async (id, updates) => {
    const response = await apiClient.put(`/admin/reviews/${id}`, updates);
    toast.success('Review updated');
    return response.data.review;
  },

  deleteReview: async (id) => {
    await apiClient.delete(`/admin/reviews/${id}`);
    toast.success('Review deleted');
    return id;
  },

  toggleStatus: async (id) => {
    const current = await apiClient.get(`/admin/reviews/${id}`);
    const newStatus = current.data.review.status === 'approved' ? 'pending' : 'approved';
    const response = await apiClient.put(`/admin/reviews/${id}/status`, { status: newStatus });
    toast.success(`Review ${newStatus}`);
    return response.data.review;
  },

  replyReview: async (id, reply) => {
    const response = await apiClient.put(`/admin/reviews/${id}/reply`, { reply });
    toast.success('Reply added');
    return response.data.review;
  },

  // ─── Public ──────────────────────────────────────────
  getProductReviews: async (productId, { page = 1, limit = 10, sort = 'recent' } = {}) => {
    const params = new URLSearchParams({ page, limit, sort });
    const response = await apiClient.get(`/reviews/product/${productId}?${params}`);
    return response.data;
  },

  createReview: async (data) => {
    const response = await apiClient.post('/reviews', data);
    toast.success('Review submitted! Waiting for approval.');
    return response.data.review;
  },

  uploadReviewImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post('/reviews/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.url;
  },
};