import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import cartReducer from './slices/cartSlice'
import productReducer from './slices/productSlice'
import orderReducer from './slices/orderSlice'
import uiReducer from './slices/uiSlice'
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        products: productReducer,
        orders: orderReducer,
        ui: uiReducer,
        notifications: notificationReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
                ignoredActionPaths: ['payload.createdAt', 'payload.updatedAt', 'payload.timestamp'],
                ignoredPaths: ['auth.user.createdAt', 'auth.user.updatedAt', 'cart.items.product.createdAt'],
            },
            thunk: {
                extraArgument: {},
            },
        }),
    devTools: process.env.NODE_ENV !== 'production',
})

export default store