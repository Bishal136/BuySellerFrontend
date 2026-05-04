import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/cart');
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await api.post('/cart/add', { productId, quantity });
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/cart/update/${itemId}`, { quantity });
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/cart/remove/${itemId}`);
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove item');
    }
  }
);

export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async (code, { rejectWithValue }) => {
    try {
      const response = await api.post('/cart/coupon', { code });
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Invalid coupon code');
    }
  }
);

export const removeCoupon = createAsyncThunk(
  'cart/removeCoupon',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete('/cart/coupon');
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove coupon');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await api.delete('/cart/clear');
      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
  }
);

export const syncGuestCart = createAsyncThunk(
  'cart/syncGuestCart',
  async (guestItems, { getState, rejectWithValue }) => {
    try {
      // Format guest items for backend with seller info
      const formattedItems = guestItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
        sellerId: item.sellerId,
        sellerName: item.sellerName
      }));

      const response = await api.post('/cart/sync', { guestItems: formattedItems });
      return response.data.cart;
    } catch (error) {
      console.error('Sync cart error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to sync cart');
    }
  }
);

// Helper functions for guest cart
const loadGuestCart = () => {
  const savedCart = localStorage.getItem('guestCart');
  if (savedCart) {
    try {
      return JSON.parse(savedCart);
    } catch (e) {
      return { items: [], subtotal: 0, total: 0 };
    }
  }
  return { items: [], subtotal: 0, total: 0 };
};

const saveGuestCart = (cart) => {
  localStorage.setItem('guestCart', JSON.stringify(cart));
};

const calculateGuestTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = 0;
  const tax = (subtotal - discount) * 0.10;
  const shippingCost = subtotal - discount > 5000 ? 0 : 100; // Changed to BDT
  const total = subtotal - discount + tax + shippingCost;

  return { subtotal, discount, tax, shippingCost, total };
};

const initialState = {
  items: [],
  subtotal: 0,
  discount: 0,
  tax: 0,
  shippingCost: 0,
  total: 0,
  coupon: null,
  isLoading: false,
  error: null,
  isGuestCart: !localStorage.getItem('token'),
  ...loadGuestCart(),
  ...calculateGuestTotals(loadGuestCart().items)
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToGuestCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item.productId === product._id);

      // Get seller ID - try multiple sources
      const sellerId = product.seller?._id || product.seller || product.sellerId;
      const sellerName = product.seller?.storeName || product.sellerName || 'TechGadgets Bangladesh';

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          _id: Date.now().toString(),
          productId: product._id,
          name: product.name,
          image: product.images?.[0]?.url || '',
          price: product.price,
          quantity: quantity,
          sellerId: sellerId,
          sellerName: sellerName,
          seller: sellerId, // Ensure this is set
          stock: product.stock,
          brand: product.brand,
          comparePrice: product.comparePrice
        });
      }

      const totals = calculateGuestTotals(state.items);
      state.subtotal = totals.subtotal;
      state.discount = totals.discount;
      state.tax = totals.tax;
      state.shippingCost = totals.shippingCost;
      state.total = totals.total;

      saveGuestCart({ items: state.items, coupon: state.coupon });
    },
    updateGuestCartItem: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find(item => item._id === itemId);
      if (item) {
        item.quantity = quantity;
        const totals = calculateGuestTotals(state.items);
        state.subtotal = totals.subtotal;
        state.discount = totals.discount;
        state.tax = totals.tax;
        state.shippingCost = totals.shippingCost;
        state.total = totals.total;
        saveGuestCart({ items: state.items, coupon: state.coupon });
      }
    },
    removeFromGuestCart: (state, action) => {
      state.items = state.items.filter(item => item._id !== action.payload);
      const totals = calculateGuestTotals(state.items);
      state.subtotal = totals.subtotal;
      state.discount = totals.discount;
      state.tax = totals.tax;
      state.shippingCost = totals.shippingCost;
      state.total = totals.total;
      saveGuestCart({ items: state.items, coupon: state.coupon });
    },
    clearGuestCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.discount = 0;
      state.tax = 0;
      state.shippingCost = 0;
      state.total = 0;
      state.coupon = null;
      localStorage.removeItem('guestCart');
    },
    setGuestCoupon: (state, action) => {
      state.coupon = action.payload;
      // Recalculate totals with coupon
      const totals = calculateGuestTotals(state.items);
      let discount = 0;
      if (action.payload.discountType === 'percentage') {
        discount = (totals.subtotal * action.payload.discountValue) / 100;
        if (action.payload.maxDiscount && discount > action.payload.maxDiscount) {
          discount = action.payload.maxDiscount;
        }
      } else {
        discount = action.payload.discountValue;
      }
      state.discount = Math.min(discount, totals.subtotal);
      state.tax = (totals.subtotal - state.discount) * 0.10;
      state.shippingCost = totals.subtotal - state.discount > 5000 ? 0 : 100;
      state.total = totals.subtotal - state.discount + state.tax + state.shippingCost;
      saveGuestCart({ items: state.items, coupon: state.coupon });
    },
    setCartFromSync: (state, action) => {
      state.items = action.payload.items;
      state.subtotal = action.payload.subtotal;
      state.discount = action.payload.discount;
      state.tax = action.payload.tax;
      state.shippingCost = action.payload.shippingCost;
      state.total = action.payload.total;
      state.coupon = action.payload.coupon;
      state.isGuestCart = false;
      state.isLoading = false;
      localStorage.removeItem('guestCart');
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items || [];
        state.subtotal = action.payload.subtotal || 0;
        state.discount = action.payload.discount || 0;
        state.tax = action.payload.tax || 0;
        state.shippingCost = action.payload.shippingCost || 0;
        state.total = action.payload.total || 0;
        state.coupon = action.payload.coupon || null;
        state.isGuestCart = false;
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.subtotal = action.payload.subtotal;
        state.discount = action.payload.discount;
        state.tax = action.payload.tax;
        state.shippingCost = action.payload.shippingCost;
        state.total = action.payload.total;
        state.coupon = action.payload.coupon;
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Cart
      .addCase(updateCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.subtotal = action.payload.subtotal;
        state.discount = action.payload.discount;
        state.tax = action.payload.tax;
        state.shippingCost = action.payload.shippingCost;
        state.total = action.payload.total;
        state.coupon = action.payload.coupon;
        state.error = null;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.subtotal = action.payload.subtotal;
        state.discount = action.payload.discount;
        state.tax = action.payload.tax;
        state.shippingCost = action.payload.shippingCost;
        state.total = action.payload.total;
        state.coupon = action.payload.coupon;
        state.error = null;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Apply Coupon
      .addCase(applyCoupon.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.isLoading = false;
        state.coupon = action.payload.coupon;
        state.discount = action.payload.discount;
        state.tax = action.payload.tax;
        state.shippingCost = action.payload.shippingCost;
        state.total = action.payload.total;
        state.error = null;
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Remove Coupon
      .addCase(removeCoupon.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeCoupon.fulfilled, (state, action) => {
        state.isLoading = false;
        state.coupon = null;
        state.discount = action.payload.discount;
        state.tax = action.payload.tax;
        state.shippingCost = action.payload.shippingCost;
        state.total = action.payload.total;
        state.error = null;
      })
      .addCase(removeCoupon.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Clear Cart
      .addCase(clearCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.isLoading = false;
        state.items = [];
        state.subtotal = 0;
        state.discount = 0;
        state.tax = 0;
        state.shippingCost = 0;
        state.total = 0;
        state.coupon = null;
        state.error = null;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Sync Guest Cart
      .addCase(syncGuestCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(syncGuestCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items || [];
        state.subtotal = action.payload.subtotal || 0;
        state.discount = action.payload.discount || 0;
        state.tax = action.payload.tax || 0;
        state.shippingCost = action.payload.shippingCost || 0;
        state.total = action.payload.total || 0;
        state.coupon = action.payload.coupon || null;
        state.isGuestCart = false;
        state.error = null;
        localStorage.removeItem('guestCart');
      })
      .addCase(syncGuestCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  addToGuestCart,
  updateGuestCartItem,
  removeFromGuestCart,
  clearGuestCart,
  setGuestCoupon,
  setCartFromSync
} = cartSlice.actions;

export default cartSlice.reducer;