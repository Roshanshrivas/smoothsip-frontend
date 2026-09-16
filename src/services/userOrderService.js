// src/services/userOrderService.js
import apiClient from '../api/client';

export const userOrderService = {
  // Fetch all orders for the current user
  fetchMyOrders: async () => {
    const response = await apiClient.get('/orders/my-orders');
    return response.data.orders;
  },

  // Get a single order by ID
  getOrderById: async (id) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data.order;
  },

  // Cancel an order
  cancelOrder: async (id, reason) => {
    const response = await apiClient.patch(`/orders/${id}/cancel`, { reason });
    return response.data.order;
  },

  // Track order by order number (public)
  trackOrder: async (orderNumber) => {
    const response = await apiClient.get(`/orders/track/${orderNumber}`);
    return response.data.order;
  },

    initiateRazorpayPayment: async (data) => {
    const response = await apiClient.post('/orders/razorpay/initiate', data);
    return response.data;
  },

  verifyRazorpayPayment: async (data) => {
    const response = await apiClient.post('/orders/razorpay/verify', data);
    return response.data;
  },
};
