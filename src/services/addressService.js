// src/services/addressService.js
import apiClient from '../api/client';

export const addressService = {
  fetchAddresses: async () => {
    const response = await apiClient.get('/addresses');
    return response.data; // array of addresses
  },

  getAddress: async (id) => {
    const response = await apiClient.get(`/addresses/${id}`);
    return response.data;
  },

  createAddress: async (addressData) => {
    const response = await apiClient.post('/addresses', addressData);
    return response.data;
  },

  updateAddress: async (id, addressData) => {
    const response = await apiClient.put(`/addresses/${id}`, addressData);
    return response.data;
  },

  deleteAddress: async (id) => {
    const response = await apiClient.delete(`/addresses/${id}`);
    return response.data;
  },

  setDefaultAddress: async (id) => {
    const response = await apiClient.patch(`/addresses/${id}/default`);
    return response.data;
  },
};