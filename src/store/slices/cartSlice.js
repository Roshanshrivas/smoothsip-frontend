import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '../../services/cartService';
import apiClient from '../../api/client'; // <-- added for direct API calls
import toast from 'react-hot-toast';

// ─── Async Thunks ──────────────────────────────────
export const fetchCart = createAsyncThunk(
  'cart/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const data = await cartService.getCart();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

// Existing: add regular product (with color, size)
export const addToCart = createAsyncThunk(
  'cart/add',
  async ({ productId, quantity = 1, color, size }, { rejectWithValue }) => {
    try {
      const customization = {};
      if (color) customization.color = color;
      if (size) customization.size = size;
      const data = await cartService.addToCart(productId, quantity, customization);
      toast.success('Added to cart!');
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to add to cart';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// ─── NEW: Add custom item (designImage + customization) ───
export const addCustomItemToCart = createAsyncThunk(
  'cart/addCustomItem',
  async ({ productId, name, price, quantity, designImage, customization }, { rejectWithValue }) => {
    try {
      // Use apiClient directly (or you can add a method to cartService)
      const response = await apiClient.post('/cart/add', {
        productId,
        name,
        price,
        quantity,
        designImage,
        customization,
      });
      toast.success('Added to cart! 🎉');
      return response.data; // expects { cart: { items, totalItems, subtotal, shipping } }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to add custom item';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/remove',
  async (itemId, { rejectWithValue }) => {
    try {
      const data = await cartService.removeFromCart(itemId);
      toast.success('Removed from cart');
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to remove item';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/update',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const data = await cartService.updateCartItem(itemId, quantity);
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update item';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clear',
  async (_, { rejectWithValue }) => {
    try {
      const data = await cartService.clearCart();
      toast.success('Cart cleared');
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to clear cart';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// ─── Slice ─────────────────────────────────────────
const initialState = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  total: 0,
  shipping: 0,
  isLoading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;
        state.items = data.cart?.items || [];
        state.totalItems = data.totalItems || 0;
        state.subtotal = data.subtotal || 0;
        state.total = state.subtotal + state.shipping;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;
        state.items = data.cart?.items || [];
        state.totalItems = data.totalItems || 0;
        state.subtotal = data.subtotal || 0;
        state.total = state.subtotal + state.shipping;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // ── addCustomItemToCart ──
      .addCase(addCustomItemToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addCustomItemToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;
        state.items = data.cart?.items || [];
        state.totalItems = data.totalItems || 0;
        state.subtotal = data.subtotal || 0;
        state.total = state.subtotal + state.shipping;
        // toast already shown in thunk
      })
      .addCase(addCustomItemToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // toast already shown in thunk
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        const data = action.payload;
        state.items = data.cart?.items || [];
        state.totalItems = data.totalItems || 0;
        state.subtotal = data.subtotal || 0;
        state.total = state.subtotal + state.shipping;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        const data = action.payload;
        state.items = data.cart?.items || [];
        state.totalItems = data.totalItems || 0;
        state.subtotal = data.subtotal || 0;
        state.total = state.subtotal + state.shipping;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.totalItems = 0;
        state.subtotal = 0;
        state.total = 0;
        state.shipping = 0;
      });
  },
});

// ─── Selectors ──────────────────────────────────────
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotalItems = (state) => state.cart.totalItems;
export const selectCartSubtotal = (state) => state.cart.subtotal;
export const selectCartTotal = (state) => state.cart.total;
export const selectCartShipping = (state) => state.cart.shipping;
export const selectCartLoading = (state) => state.cart.isLoading;

export default cartSlice.reducer;