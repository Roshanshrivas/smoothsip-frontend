// src/store/slices/addressSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import { addressService } from '../../services/addressService';

// ─── Async Thunks ──────────────────────────────────
export const fetchAddresses = createAsyncThunk(
  'addresses/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const data = await addressService.fetchAddresses();
      return data; // array of addresses
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch addresses');
    }
  }
);

export const addAddress = createAsyncThunk(
  'addresses/add',
  async (addressData, { rejectWithValue }) => {
    try {
      const data = await addressService.createAddress(addressData);
      toast.success('Address added successfully');
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to add address';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const updateAddress = createAsyncThunk(
  'addresses/update',
  async ({ id, addressData }, { rejectWithValue }) => {
    try {
      const data = await addressService.updateAddress(id, addressData);
      toast.success('Address updated');
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update address';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const deleteAddress = createAsyncThunk(
  'addresses/delete',
  async (id, { rejectWithValue }) => {
    try {
      await addressService.deleteAddress(id);
      toast.success('Address deleted');
      return id;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete address';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const setDefaultAddress = createAsyncThunk(
  'addresses/setDefault',
  async (id, { rejectWithValue }) => {
    try {
      const data = await addressService.setDefaultAddress(id);
      toast.success('Default address updated');
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to set default';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// ─── Slice ─────────────────────────────────────────
const initialState = {
  items: [],
  isLoading: false,
  error: null,
};

const addressSlice = createSlice({
  name: 'addresses',
  initialState,
  reducers: {
    clearAddresses: (state) => {
      state.items = [];
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch ──
      .addCase(fetchAddresses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // ── Add ──
      .addCase(addAddress.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // ── Update ──
      .addCase(updateAddress.fulfilled, (state, action) => {
        const index = state.items.findIndex(a => a._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      // ── Delete ──
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.items = state.items.filter(a => a._id !== action.payload);
      })
      // ── Set Default ──
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        const updated = action.payload;
        state.items = state.items.map(a => ({
          ...a,
          isDefault: a._id === updated._id,
        }));
      });
  },
});

export const { clearAddresses } = addressSlice.actions;

// ─── Selectors ──────────────────────────────────────
export const selectAllAddresses = (state) => state.addresses.items;
export const selectAddressesLoading = (state) => state.addresses.isLoading;
export const selectDefaultAddress = (state) => {
  return state.addresses.items.find(a => a.isDefault) || state.addresses.items[0] || null;
};

export default addressSlice.reducer;