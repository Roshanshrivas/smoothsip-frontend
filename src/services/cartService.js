// src/services/cartService.js
import apiClient from '../api/client';

export const cartService = {
  getCart: async () => {
    const response = await apiClient.get('/cart');
    return response.data; // { items, totalItems, subtotal, total, shipping }
  },

  // productId, quantity, customization = {}
  addToCart: async (productId, quantity = 1, customization = {}) => {
    const response = await apiClient.post('/cart/add', { productId, quantity, customization });
    return response.data;
  },

  updateCartItem: async (itemId, quantity) => {
    const response = await apiClient.put(`/cart/update/${itemId}`, { quantity });
    return response.data;
  },

  removeFromCart: async (itemId) => {
    const response = await apiClient.delete(`/cart/remove/${itemId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await apiClient.delete('/cart/clear');
    return response.data;
  },
};