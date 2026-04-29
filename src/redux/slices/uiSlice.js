import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isLoading: false,
  sidebarOpen: false,
  searchOpen: false,
  cartOpen: false,
  modal: {
    isOpen: false,
    type: null,
    data: null,
  },
  notifications: [],
  theme: localStorage.getItem('theme') || 'light',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    toggleSearch: (state) => {
      state.searchOpen = !state.searchOpen
    },
    toggleCart: (state) => {
      state.cartOpen = !state.cartOpen
    },
    openModal: (state, action) => {
      state.modal.isOpen = true
      state.modal.type = action.payload.type
      state.modal.data = action.payload.data || null
    },
    closeModal: (state) => {
      state.modal.isOpen = false
      state.modal.type = null
      state.modal.data = null
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        read: false,
        ...action.payload,
      })
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification) {
        notification.read = true
      }
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', state.theme)
      if (state.theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
  },
})

export const {
  setLoading,
  toggleSidebar,
  toggleSearch,
  toggleCart,
  openModal,
  closeModal,
  addNotification,
  removeNotification,
  markNotificationAsRead,
  toggleTheme,
} = uiSlice.actions

export default uiSlice.reducer