import apiClient from '../api/client';

export const publicCategoryService = {
  getCategories: async () => {
    const response = await apiClient.get('/categories');
    return response.data.categories;
  },
};