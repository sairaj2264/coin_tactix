import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { alertAPI } from '../../services/api'

// Async thunks
export const fetchAlerts = createAsyncThunk(
  'alerts/fetchAlerts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await alertAPI.getAlerts()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch alerts')
    }
  }
)

export const createAlert = createAsyncThunk(
  'alerts/createAlert',
  async (alertData, { rejectWithValue }) => {
    try {
      const response = await alertAPI.createAlert(alertData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create alert')
    }
  }
)

export const updateAlert = createAsyncThunk(
  'alerts/updateAlert',
  async ({ id, alertData }, { rejectWithValue }) => {
    try {
      const response = await alertAPI.updateAlert(id, alertData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update alert')
    }
  }
)

export const deleteAlert = createAsyncThunk(
  'alerts/deleteAlert',
  async (id, { rejectWithValue }) => {
    try {
      await alertAPI.deleteAlert(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete alert')
    }
  }
)

const initialState = {
  alerts: [],
  activeAlerts: [],
  notifications: [],
  isLoading: false,
  error: null,
  unreadCount: 0,
}

const alertSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload)
      state.unreadCount += 1
    },
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification && !notification.read) {
        notification.read = true
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(n => n.read = true)
      state.unreadCount = 0
    },
    removeNotification: (state, action) => {
      const index = state.notifications.findIndex(n => n.id === action.payload)
      if (index !== -1) {
        const notification = state.notifications[index]
        if (!notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
        state.notifications.splice(index, 1)
      }
    },
    clearError: (state) => {
      state.error = null
    },
    triggerAlert: (state, action) => {
      const alert = state.alerts.find(a => a.id === action.payload.alertId)
      if (alert) {
        state.activeAlerts.push({
          ...alert,
          triggeredAt: new Date().toISOString(),
          currentValue: action.payload.currentValue,
        })
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch alerts
      .addCase(fetchAlerts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.isLoading = false
        state.alerts = action.payload
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Create alert
      .addCase(createAlert.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createAlert.fulfilled, (state, action) => {
        state.isLoading = false
        state.alerts.push(action.payload)
      })
      .addCase(createAlert.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Update alert
      .addCase(updateAlert.fulfilled, (state, action) => {
        const index = state.alerts.findIndex(a => a.id === action.payload.id)
        if (index !== -1) {
          state.alerts[index] = action.payload
        }
      })
      // Delete alert
      .addCase(deleteAlert.fulfilled, (state, action) => {
        state.alerts = state.alerts.filter(a => a.id !== action.payload)
        state.activeAlerts = state.activeAlerts.filter(a => a.id !== action.payload)
      })
  },
})

export const { 
  addNotification, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  removeNotification, 
  clearError, 
  triggerAlert 
} = alertSlice.actions

export default alertSlice.reducer
