// src/services/authService.js
import apiClient from '../api/client';

export const authService = {
  login: async (email, password) => {
    const response = await apiClient.post("/auth/login", { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  },

  logout: async () => {
    await apiClient.post("/auth/logout");
  },

  getMe: async () => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  // ─── Update Profile (with avatar) ───
  updateProfile: async (formData) => {
    const response = await apiClient.put("/auth/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // ─── Change Password ───
  changePassword: async (oldPassword, newPassword) => {
    const response = await apiClient.put("/auth/change-password", {
      oldPassword,
      newPassword,
    });
    return response.data;
  },

  // ─── NEW: Delete Account ───
  deleteAccount: async () => {
    const response = await apiClient.delete("/auth/account");
    return response.data;
  },

  // ─── Forgot Password Flow ───
  forgotPassword: async (email) => {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data;
  },

  verifyResetOTP: async (email, otp) => {
    const response = await apiClient.post("/auth/verify-reset-otp", {
      email,
      otp,
    });
    return response.data;
  },

  resetPassword: async (email, resetToken, newPassword) => {
    const response = await apiClient.post("/auth/reset-password", {
      email,
      resetToken,
      newPassword,
    });
    return response.data;
  },
};