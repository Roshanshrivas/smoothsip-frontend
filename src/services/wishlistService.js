// src/services/wishlistService.js
import apiClient from '../api/client';

export const wishlistService = {
  getWishlist: async () => {
    const response = await apiClient.get('/wishlist');
    return response.data;
  },

  addToWishlist: async (productId) => {
    const response = await apiClient.post('/wishlist/add', { productId });
    return response.data;
  },

  removeFromWishlist: async (productId) => {
    const response = await apiClient.delete(`/wishlist/remove/${productId}`);
    return response.data;
  },

  clearWishlist: async () => {
    const response = await apiClient.delete('/wishlist/clear');
    return response.data;
  },
};