import apiClient from '../api/client';
import toast from 'react-hot-toast';

export const categoryService = {
  fetchCategories: async ({ page = 1, limit = 10, search = '', status = 'all' } = {}) => {
    const params = new URLSearchParams({ page, limit, search, status });
    const response = await apiClient.get(`/admin/categories?${params}`);
    return response.data; // { categories, total, page, limit, totalPages, stats }
  },

  getCategory: async (id) => {
    const response = await apiClient.get(`/admin/categories/${id}`);
    return response.data.category;
  },

  createCategory: async (categoryData) => {
    const response = await apiClient.post('/admin/categories', categoryData);
    toast.success('Category created');
    return response.data.category;
  },

  updateCategory: async (id, categoryData) => {
    const response = await apiClient.put(`/admin/categories/${id}`, categoryData);
    toast.success('Category updated');
    return response.data.category;
  },

  deleteCategory: async (id) => {
    await apiClient.delete(`/admin/categories/${id}`);
    toast.success('Category deleted');
    return id;
  },

  bulkDeleteCategories: async (ids) => {
    await apiClient.post('/admin/categories/bulk-delete', { ids });
    toast.success(`${ids.length} categories deleted`);
    return ids;
  },

  // Fetch all categories (for export)
  fetchAllCategories: async ({ search = '', status = 'all' } = {}) => {
    const params = new URLSearchParams({ search, status });
    const response = await apiClient.get(`/admin/categories/all?${params}`);
    return response.data.categories;
  },
};