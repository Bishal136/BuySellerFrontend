import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Fetch notifications
export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async ({ page = 1, type = null, isRead = null }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (type) params.append('type', type);
      if (isRead !== null) params.append('isRead', isRead);
      
      const response = await api.get(`/notifications?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

// Mark notification as read
export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data.notification;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
    }
  }
);

// Mark all as read
export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.put('/notifications/read-all');
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all as read');
    }
  }
);

// Delete notification
export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (notificationId, { rejectWithValue }) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
    }
  }
);

// Delete all notifications
export const deleteAllNotifications = createAsyncThunk(
  'notifications/deleteAll',
  async (_, { rejectWithValue }) => {
    try {
      await api.delete('/notifications/delete-all');
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notifications');
    }
  }
);

// Create price alert
export const createPriceAlert = createAsyncThunk(
  'notifications/createPriceAlert',
  async ({ productId, targetPrice }, { rejectWithValue }) => {
    try {
      const response = await api.post('/notifications/price-alert', { productId, targetPrice });
      return response.data.alert;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create price alert');
    }
  }
);

// Create stock alert
export const createStockAlert = createAsyncThunk(
  'notifications/createStockAlert',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.post('/notifications/stock-alert', { productId });
      return response.data.alert;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create stock alert');
    }
  }
);

// Get price alerts
export const getPriceAlerts = createAsyncThunk(
  'notifications/getPriceAlerts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications/price-alerts');
      return response.data.alerts;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch price alerts');
    }
  }
);

// Get stock alerts
export const getStockAlerts = createAsyncThunk(
  'notifications/getStockAlerts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications/stock-alerts');
      return response.data.alerts;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stock alerts');
    }
  }
);

// Delete price alert
export const deletePriceAlert = createAsyncThunk(
  'notifications/deletePriceAlert',
  async (alertId, { rejectWithValue }) => {
    try {
      await api.delete(`/notifications/price-alert/${alertId}`);
      return alertId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete price alert');
    }
  }
);

// Delete stock alert
export const deleteStockAlert = createAsyncThunk(
  'notifications/deleteStockAlert',
  async (alertId, { rejectWithValue }) => {
    try {
      await api.delete(`/notifications/stock-alert/${alertId}`);
      return alertId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete stock alert');
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  priceAlerts: [],
  stockAlerts: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    pages: 1,
    total: 0
  }
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addNewNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    updateUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n._id === action.payload._id);
        if (index !== -1) {
          state.notifications[index].isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => { n.isRead = true; });
        state.unreadCount = 0;
      })
      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const deleted = state.notifications.find(n => n._id === action.payload);
        if (deleted && !deleted.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(n => n._id !== action.payload);
      })
      // Delete all
      .addCase(deleteAllNotifications.fulfilled, (state) => {
        state.notifications = [];
        state.unreadCount = 0;
      })
      // Price alerts
      .addCase(getPriceAlerts.fulfilled, (state, action) => {
        state.priceAlerts = action.payload;
      })
      .addCase(createPriceAlert.fulfilled, (state, action) => {
        state.priceAlerts.push(action.payload);
      })
      .addCase(deletePriceAlert.fulfilled, (state, action) => {
        state.priceAlerts = state.priceAlerts.filter(a => a._id !== action.payload);
      })
      // Stock alerts
      .addCase(getStockAlerts.fulfilled, (state, action) => {
        state.stockAlerts = action.payload;
      })
      .addCase(createStockAlert.fulfilled, (state, action) => {
        state.stockAlerts.push(action.payload);
      })
      .addCase(deleteStockAlert.fulfilled, (state, action) => {
        state.stockAlerts = state.stockAlerts.filter(a => a._id !== action.payload);
      });
  }
});

export const { clearError, addNewNotification, updateUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;