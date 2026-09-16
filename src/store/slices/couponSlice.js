import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { couponService } from '../../services/couponService';
import toast from 'react-hot-toast';

// ─── Fetch available coupons ──────────────────────
export const fetchAvailableCoupons = createAsyncThunk(
  'coupons/fetchAvailable',
  async (subtotal = 0, { rejectWithValue }) => {
    try {
      const data = await couponService.getAvailableCoupons(subtotal);
      return data.coupons;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch coupons');
    }
  }
);

// ─── Validate coupon ──────────────────────────────
export const validateCoupon = createAsyncThunk(
  'coupons/validate',
  async ({ code, subtotal }, { rejectWithValue }) => {
    try {
      const data = await couponService.validateCoupon(code, subtotal);
      return data.coupon;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Invalid coupon');
    }
  }
);

// ─── Clear applied coupon ──────────────────────────
export const clearAppliedCoupon = createAsyncThunk(
  'coupons/clearApplied',
  () => null
);

const initialState = {
  available: [],
  applied: null,
  isLoading: false,
  error: null,
};

const couponSlice = createSlice({
  name: 'coupons',
  initialState,
  reducers: {
    resetCouponState: (state) => {
      state.available = [];
      state.applied = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailableCoupons.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAvailableCoupons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.available = action.payload;
      })
      .addCase(fetchAvailableCoupons.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(validateCoupon.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.isLoading = false;
        state.applied = action.payload;
        toast.success(`Coupon "${action.payload.code}" applied!`);
      })
      .addCase(validateCoupon.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Invalid coupon');
      })
      .addCase(clearAppliedCoupon.fulfilled, (state) => {
        state.applied = null;
        state.error = null;
      });
  },
});

export const { resetCouponState } = couponSlice.actions;
export const selectAvailableCoupons = (state) => state.coupons.available;
export const selectAppliedCoupon = (state) => state.coupons.applied;
export const selectCouponLoading = (state) => state.coupons.isLoading;

export default couponSlice.reducer;