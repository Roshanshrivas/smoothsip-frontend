// src/store/slices/wishlistSlice.js
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { wishlistService } from '../../services/wishlistService';
import toast from 'react-hot-toast';

// ─── Async Thunks ──────────────────────────────────
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const data = await wishlistService.getWishlist();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wishlist');
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/add',
  async (productId, { rejectWithValue }) => {
    try {
      const data = await wishlistService.addToWishlist(productId);
      toast.success('Added to wishlist!', { duration: 2000 });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to wishlist');
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/remove',
  async (productId, { rejectWithValue }) => {
    try {
      const data = await wishlistService.removeFromWishlist(productId);
      toast.success('Removed from wishlist', { duration: 2000 });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from wishlist');
    }
  }
);

// ─── Slice ─────────────────────────────────────────
const initialState = {
  items: [],
  totalItems: 0,
  isLoading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
      state.totalItems = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch Wishlist ──
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items || [];
        state.totalItems = action.payload.totalItems || 0;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // ── Add to Wishlist ──
      .addCase(addToWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items || [];
        state.totalItems = action.payload.totalItems || 0;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // ── Remove from Wishlist ──
      .addCase(removeFromWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items || [];
        state.totalItems = action.payload.totalItems || 0;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;

// ─── Selectors ──────────────────────────────────────
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistTotal = (state) => state.wishlist.totalItems;
export const selectWishlistLoading = (state) => state.wishlist.isLoading;

export const selectWishlistProducts = createSelector(
  [selectWishlistItems],
  (items) => {
    return items.map((product) => ({
      id: product._id,
       _id: product._id,
      title: product.name,
      price: product.price,
      oldPrice: product.comparePrice || product.price * 1.2,
      discount: product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : 0,
      image: product.mainImage || (product.images && product.images[0]) || '',
      rating: product.ratingsAverage || 0,
      reviews: product.ratingsCount || 0,
      color: product.tags?.find((t) => ['Black', 'Purple', 'Blue', 'Red', 'Green', 'Pink'].includes(t)) || null,
      size: product.tags?.find((t) => t.includes('oz')) || null,
      material: product.tags?.find((t) => ['Stainless Steel', 'Ceramic', 'Plastic'].includes(t)) || null,
      inStock: product.stock > 0,
      categoryId: product.category?._id || null,
      categoryName: product.category?.name || null,
      description: product.description,
      features: product.features || [],
      specifications: product.specifications || [],
      images: product.images || [],
      colors: product.colors || [],
      sizes: product.sizes || [],
      bg: product.bg || '#f8f9fa',
      tag: product.tag || product.tags?.find((t) => ['TRENDING', 'BEST SELLER'].includes(t)) || null,
      tags: product.tags || [],
    }));
  }
);

export default wishlistSlice.reducer;