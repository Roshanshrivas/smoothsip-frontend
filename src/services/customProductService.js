// src/services/customProductService.js
import apiClient from '../api/client';

export const customProductService = {
  // ─── Public endpoints ──────────────────────────────
  fetchActiveProducts: async () => {
    const response = await apiClient.get('/custom-products');
    return response.data.products;
  },

  fetchProductById: async (id) => {
    const response = await apiClient.get(`/custom-products/${id}`);
    return response.data.product;
  },

  // ─── Admin endpoints ───────────────────────────────
  fetchCustomProducts: async () => {
    const response = await apiClient.get('/admin/custom-products');
    return response.data.products;
  },

  getCustomProductById: async (id) => {
    const response = await apiClient.get(`/admin/custom-products/${id}`);
    return response.data.product;
  },

  createCustomProduct: async (data) => {
    const response = await apiClient.post('/admin/custom-products', data);
    return response.data.product;
  },

  updateCustomProduct: async (id, data) => {
    const response = await apiClient.put(`/admin/custom-products/${id}`, data);
    return response.data.product;
  },

  deleteCustomProduct: async (id) => {
    await apiClient.delete(`/admin/custom-products/${id}`);
  },

  deleteCloudinaryImage: async (publicId) => {
    await apiClient.post('/admin/cloudinary/delete-image', { publicId });
  },

  // ─── NEW: Upload image to Cloudinary ──────────────
  uploadProductImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post('/admin/cloudinary/upload-product-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data; // { url, publicId }
  },

  uploadProductImages: async (files) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append('images', file);
    }
    const response = await apiClient.post('/admin/cloudinary/upload-product-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data; // { urls: [], publicIds: [] }
  },
};