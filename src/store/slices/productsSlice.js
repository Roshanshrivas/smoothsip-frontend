// src/store/slices/productsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService } from '../../services/productService';

// ─── Async Thunks ──────────────────────────────────
export const fetchProducts = createAsyncThunk(
  'products/fetch',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const data = await productService.getProducts(filters);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await productService.getProductById(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const data = await productService.getCategories();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

// fetch available filters
export const fetchAvailableFilters = createAsyncThunk(
  'products/fetchAvailableFilters',
  async (_, { rejectWithValue }) => {
    try {
      const data = await productService.getAvailableFilters();
      return data.filters || { colors: [], materials: [], tags: [], sizes: [] };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch filters'
      );
    }
  }
);

// ─── Slice ─────────────────────────────────────────
const initialState = {
  items: [],
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 0,
  currentProduct: null,
  categories: [],

  // ✅ NEW — available filter options from backend
  availableFilters: {
    colors: [],
    materials: [],
    tags: [],
    sizes: [],
  },
  filtersLoaded: false,
  isFiltersLoading: false,
  filtersError: null,

  isLoading: false,
  error: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearProducts: (state) => {
      state.items = [];
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch Products ──
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.products || [];
        state.total = action.payload.total || 0;
        state.page = action.payload.page || 1;
        state.limit = action.payload.limit || 12;
        state.totalPages = action.payload.totalPages || 0;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // ── Fetch Product by ID ──
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // ── Fetch Categories ──
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload || [];
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // ✅ Fetch Available Filters
      .addCase(fetchAvailableFilters.pending, (state) => {
        state.isFiltersLoading = true;
        state.filtersError = null;
      })
      .addCase(fetchAvailableFilters.fulfilled, (state, action) => {
        state.isFiltersLoading = false;
        state.filtersLoaded = true;
        state.availableFilters = action.payload;
      })
      .addCase(fetchAvailableFilters.rejected, (state, action) => {
        state.isFiltersLoading = false;
        state.filtersLoaded = true; // mark as loaded even on error so we don't loop
        state.filtersError = action.payload;
      });
  },
});

export const { clearCurrentProduct, clearProducts } = productsSlice.actions;

// ─── Selectors ──────────────────────────────────────
export const selectProducts = (state) => state.products.items;
export const selectProductsTotal = (state) => state.products.total;
export const selectCurrentProduct = (state) => state.products.currentProduct;
export const selectCategories = (state) => state.products.categories;
export const selectProductsLoading = (state) => state.products.isLoading;
export const selectProductsTotalPages = (state) => state.products.totalPages;

// ✅ NEW selectors
export const selectAvailableFilters = (state) => state.products.availableFilters;
export const selectFiltersLoaded = (state) => state.products.filtersLoaded;
export const selectFiltersLoading = (state) => state.products.isFiltersLoading;

export default productsSlice.reducer;