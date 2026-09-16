import apiClient from '../api/client';

export const productService = {
  // ─── PUBLIC ──────────────────────────────────────────
  getProducts: async ({ page = 1, limit = 12, category, sort, search, minPrice, maxPrice, color, size, material, inStock, tag }) => {
    const params = new URLSearchParams({ page, limit, ...(category && { category }), ...(sort && { sortBy: sort === 'price_asc' ? 'price' : sort === 'price_desc' ? 'price' : 'createdAt', sortOrder: sort === 'price_asc' ? 'asc' : 'desc' }), ...(search && { search }), ...(minPrice && { minPrice }), ...(maxPrice && { maxPrice }), ...(color && { color }), ...(size && { size }), ...(material && { material }), ...(inStock !== undefined && { inStock }), ...(tag && { tag }) });
    const response = await apiClient.get(`/products?${params}`);
    return response.data;
  },

  getProductById: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await apiClient.get('/products/categories');
    return response.data;
  },

  // ─── ADMIN ────────────────────────────────────────────
  // ✅ Updated: returns products, pagination, and stats
  fetchProducts: async ({ page = 1, limit = 10, search = '', tab = 'all', filters = {} } = {}) => {
    const params = new URLSearchParams({ page, limit, ...(search && { search }), ...(tab !== 'all' && { status: tab === 'active' ? 'Active' : tab === 'draft' ? 'Draft' : tab === 'outofstock' ? 'Out of Stock' : '' }), ...(filters.category && { category: filters.category }), ...(filters.status && { status: filters.status }), ...(filters.minPrice && { minPrice: filters.minPrice }), ...(filters.maxPrice && { maxPrice: filters.maxPrice }) });
    const response = await apiClient.get(`/admin/products?${params}`);
    const products = response.data.products.map(p => ({
      ...p,
      id: p._id || p.id,
      image: p.mainImage || (p.images && p.images[0]) || 'https://placehold.co/80x80/f3f4f6/9ca3af?text=No+Image',
      category: p.category?.name || p.category || 'Uncategorized',
      status: p.status || 'Draft',
    }));
    return {
      products,
      total: response.data.total,
      page: response.data.page,
      limit: response.data.limit,
      stats: response.data.stats || {}, // ← stats now included
    };
  },

  getProduct: async (id) => {
    const response = await apiClient.get(`/admin/products/${id}`);
    const product = response.data.product;
    return {
      ...product,
      id: product._id || product.id,
      image: product.mainImage || (product.images && product.images[0]) || '',
      category: product.category?.name || product.category || '',
      status: product.status || 'Draft',
    };
  },

  createProduct: async (productData) => {
    const response = await apiClient.post('/admin/products', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await apiClient.put(`/admin/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/admin/products/${id}`);
    return response.data;
  },

  bulkDeleteProducts: async (ids) => {
    const response = await apiClient.post('/admin/products/bulk-delete', { ids });
    return response.data;
  },

  fetchAllFiltered: async ({ search = '', tab = 'all', filters = {} } = {}) => {
    const params = new URLSearchParams({ ...(search && { search }), ...(tab !== 'all' && { status: tab === 'active' ? 'Active' : tab === 'draft' ? 'Draft' : tab === 'outofstock' ? 'Out of Stock' : '' }), ...(filters.category && { category: filters.category }), ...(filters.status && { status: filters.status }) });
    const response = await apiClient.get(`/admin/products/all?${params}`);
    return response.data.products.map(p => ({
      ...p,
      id: p._id || p.id,
      image: p.mainImage || (p.images && p.images[0]) || '',
      category: p.category?.name || p.category || 'Uncategorized',
      status: p.status || 'Draft',
    }));
  },
};