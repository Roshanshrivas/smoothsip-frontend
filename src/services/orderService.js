// src/services/orderService.js
import apiClient from '../api/client';

export const orderService = {
  // ---------- User ----------
  getMyOrders: async () => {
    const response = await apiClient.get('/orders/my-orders');
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  createOrder: async (orderData) => {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },

  cancelOrder: async (orderId, reason) => {
    const response = await apiClient.post(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  },

  trackOrder: async (orderNumber) => {
    const response = await apiClient.get(`/orders/track/${orderNumber}`);
    return response.data;
  },


   // ---------- Razorpay (NEW) ----------
  initiateRazorpayPayment: async (data) => {
    const response = await apiClient.post('/orders/razorpay/initiate', data);
    return response.data;
  },

  verifyRazorpayPayment: async (data) => {
    const response = await apiClient.post('/orders/razorpay/verify', data);
    return response.data;
  },


  
  // ---------- Admin ----------
  fetchOrders: async ({ page = 1, limit = 10, search = '', status = 'all', paymentStatus = 'all', fulfillment = 'all', startDate, endDate, type = 'all' } = {}) => {
    const params = new URLSearchParams({ page, limit, search, status, paymentStatus, fulfillment, type });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await apiClient.get(`/admin/orders?${params}`);
    return response.data; // { orders, total, page, limit }
  },

  getOrder: async (id) => {
    const response = await apiClient.get(`/admin/orders/${id}`);
    return response.data.order;
  },

   createAdminOrder: async (orderData) => {
    const response = await apiClient.post('/admin/orders', orderData);
    return response.data.order;
  },

  updateOrder: async (id, updates) => {
    const response = await apiClient.put(`/admin/orders/${id}`, updates);
    return response.data.order;
  },

  deleteOrder: async (id) => {
    const response = await apiClient.delete(`/admin/orders/${id}`);
    return response.data;
  },

  duplicateOrder: async (id) => {
    const response = await apiClient.post(`/admin/orders/${id}/duplicate`);
    return response.data.order;
  },

  updateOrderStatus: async (id, newStatus, trackingNumber = null) => {
    const response = await apiClient.patch(`/admin/orders/${id}/status`, { status: newStatus, trackingNumber });
    return response.data.order;
  },

  markPaymentAsPaid: async (id) => {
    const response = await apiClient.patch(`/admin/orders/${id}/payment`, { paymentStatus: 'Paid' });
    return response.data.order;
  },

  getOrderStats: async () => {
    const response = await apiClient.get('/admin/orders/stats');
    return response.data.stats;
  },

   fetchAllOrders: async (filters = {}) => {
    // For export – we'll reuse fetchOrders with a large limit
    const { search = '', status = 'all', paymentStatus = 'all', fulfillment = 'all', startDate, endDate } = filters;
    const params = new URLSearchParams({ page: 1, limit: 9999, search, status, paymentStatus, fulfillment });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await apiClient.get(`/admin/orders?${params}`);
    return response.data.orders;
  },
};