// src/store/slices/customProductsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { customProductService } from "../../services/customProductService";

const ONE_HOUR = 60 * 60 * 1000;

export const fetchCustomProducts = createAsyncThunk(
  "customProducts/fetchActive",
  async (_, { rejectWithValue }) => {
    try {
      return await customProductService.fetchActiveProducts();
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  },
  {
    // Skip if fetched within the last hour
    condition: (_, { getState }) => {
      const { customProducts } = getState();
      if (customProducts.status === "loading") return false;
      if (
        customProducts.status === "succeeded" &&
        customProducts.lastFetched &&
        Date.now() - customProducts.lastFetched < ONE_HOUR
      ) {
        return false;
      }
      return true;
    },
  }
);

const customProductsSlice = createSlice({
  name: "customProducts",
  initialState: {
    items: [],
    status: "idle", // idle | loading | succeeded | failed
    error: null,
    lastFetched: null,
  },
  reducers: {
    // Call after admin creates/updates a product so the next visit refetches
    invalidateCustomProducts: (state) => {
      state.lastFetched = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCustomProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload || [];
        state.lastFetched = Date.now();
      })
      .addCase(fetchCustomProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { invalidateCustomProducts } = customProductsSlice.actions;
export default customProductsSlice.reducer;