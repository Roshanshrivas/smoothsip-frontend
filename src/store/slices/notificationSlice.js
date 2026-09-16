import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '../../services/notificationService';
import toast from 'react-hot-toast';

// ─── Fetch notifications ──────────────────────────
export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async ({ page = 1, limit = 20, filter = 'all' } = {}, { rejectWithValue }) => {
    try {
      const data = await notificationService.getNotifications({ page, limit, filter });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

// ─── Mark as read ──────────────────────────────────
export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try {
      const data = await notificationService.markAsRead(id);
      return data.notification;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
    }
  }
);

// ─── Mark all read ─────────────────────────────────
export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllRead();
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all as read');
    }
  }
);

// ─── Delete notification ──────────────────────────
export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (id, { rejectWithValue }) => {
    try {
      await notificationService.deleteNotification(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
    }
  }
);

// ─── Get unread count ──────────────────────────────
export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const data = await notificationService.getUnreadCount();
      return data.count;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count');
    }
  }
);

const initialState = {
  items: [],
  total: 0,
  page: 1,
  totalPages: 1,
  unreadCount: 0,
  isLoading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    resetNotifications: (state) => {
      state.items = [];
      state.total = 0;
      state.page = 1;
    },
    clearUnreadCount: (state) => {
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.notifications;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Mark read
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.items.findIndex(n => n._id === updated._id);
        if (index !== -1) {
          state.items[index] = updated;
          if (state.unreadCount > 0) state.unreadCount -= 1;
        }
      })
      // Mark all read
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items.forEach(n => n.isRead = true);
        state.unreadCount = 0;
      })
      // Delete
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.items = state.items.filter(n => n._id !== action.payload);
        state.total -= 1;
      })
      // Fetch unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });
  },
});

export const { resetNotifications, clearUnreadCount } = notificationSlice.actions;
export const selectNotifications = (state) => state.notifications.items;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectNotificationLoading = (state) => state.notifications.isLoading;

export default notificationSlice.reducer;