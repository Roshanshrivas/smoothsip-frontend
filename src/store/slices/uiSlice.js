// src/store/slices/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoading: false,
  loadingMessage: null,
  error: null,
  successMessage: null,
  isCartOpen: false,
  isMobileFilterOpen: false,
  isSearchOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
      if (action.payload === false) {
        state.loadingMessage = null;
      }
    },
    setLoadingWithMessage: (state, action) => {
      state.isLoading = true;
      state.loadingMessage = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setSuccess: (state, action) => {
      state.successMessage = action.payload;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
    setCartOpen: (state, action) => {
      state.isCartOpen = action.payload;
    },
    setMobileFilterOpen: (state, action) => {
      state.isMobileFilterOpen = action.payload;
    },
    setSearchOpen: (state, action) => {
      state.isSearchOpen = action.payload;
    },
    toggleSearch: (state) => {
      state.isSearchOpen = !state.isSearchOpen;
    },
    resetUI: (state) => {
      state.error = null;
      state.successMessage = null;
      state.isLoading = false;
      state.loadingMessage = null;
    },
  },
});

export const {
  setLoading,
  setLoadingWithMessage,
  setError,
  clearError,
  setSuccess,
  clearSuccess,
  toggleCart,
  setCartOpen,
  setMobileFilterOpen,
  setSearchOpen,
  toggleSearch,
  resetUI,
} = uiSlice.actions;

// ─── Selectors ──────────────────────────────────────
export const selectIsLoading = (state) => state.ui.isLoading;
export const selectLoadingMessage = (state) => state.ui.loadingMessage;
export const selectError = (state) => state.ui.error;
export const selectSuccess = (state) => state.ui.successMessage;
export const selectIsCartOpen = (state) => state.ui.isCartOpen;
export const selectIsMobileFilterOpen = (state) => state.ui.isMobileFilterOpen;
export const selectIsSearchOpen = (state) => state.ui.isSearchOpen;

export default uiSlice.reducer;