import apiClient from '../api/client';

export const couponService = {
  // Public
  getAvailableCoupons: async (subtotal = 0) => {
    const response = await apiClient.get(`/coupons/available?subtotal=${subtotal}`);
    return response.data;
  },
  validateCoupon: async (code, subtotal) => {
    const response = await apiClient.post('/coupons/validate', { code, subtotal });
    return response.data;
  },

  // Admin
  fetchCoupons: async ({ page = 1, limit = 10, search = '', status = 'all' } = {}) => {
    const params = new URLSearchParams({ page, limit, search, status });
    const response = await apiClient.get(`/admin/coupons?${params}`);
    return response.data;
  },
  getCoupon: async (id) => {
    const response = await apiClient.get(`/admin/coupons/${id}`);
    return response.data;
  },
  createCoupon: async (data) => {
    const response = await apiClient.post('/admin/coupons', data);
    return response.data;
  },
  updateCoupon: async (id, data) => {
    const response = await apiClient.put(`/admin/coupons/${id}`, data);
    return response.data;
  },
  deleteCoupon: async (id) => {
    const response = await apiClient.delete(`/admin/coupons/${id}`);
    return response.data;
  },
  toggleCoupon: async (id) => {
    const response = await apiClient.patch(`/admin/coupons/${id}/toggle`);
    return response.data;
  },
};