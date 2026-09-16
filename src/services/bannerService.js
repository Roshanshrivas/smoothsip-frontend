import apiClient from '../api/client';
import toast from 'react-hot-toast';

export const bannerService = {
  // Admin
  fetchBanners: async ({ search = '', status = 'all', position = 'all', section = 'all', page = 1, limit = 10 } = {}) => {
    const params = new URLSearchParams({ page, limit, search, status, position, section });
    const response = await apiClient.get(`/admin/banners?${params}`);
    return response.data;
  },

  getBanner: async (id) => {
    const response = await apiClient.get(`/admin/banners/${id}`);
    return response.data.banner;
  },

  createBanner: async (bannerData) => {
    const response = await apiClient.post('/admin/banners', bannerData);
    toast.success('Banner created');
    return response.data.banner;
  },

  updateBanner: async (id, bannerData) => {
    const response = await apiClient.put(`/admin/banners/${id}`, bannerData);
    toast.success('Banner updated');
    return response.data.banner;
  },

  deleteBanner: async (id) => {
    await apiClient.delete(`/admin/banners/${id}`);
    toast.success('Banner deleted');
    return id;
  },

  toggleStatus: async (id) => {
    const response = await apiClient.patch(`/admin/banners/${id}/toggle`);
    toast.success(`Banner ${response.data.banner.isActive ? 'activated' : 'deactivated'}`);
    return response.data.banner;
  },

  getStats: async () => {
    const response = await apiClient.get('/admin/banners/stats');
    return response.data.stats;
  },

  // Public
  getActiveBanners: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/banners/active?${query}`);
    return response.data;
  },
};