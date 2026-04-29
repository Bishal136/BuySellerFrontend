import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShoppingBag,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiArrowRight,
  FiTag,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiHeart
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import {
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
  updateGuestCartItem,
  removeFromGuestCart,
  clearGuestCart,
  setGuestCoupon
} from '../redux/slices/cartSlice';
import { fetchCart } from '../redux/slices/cartSlice';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const {
    items,
    subtotal,
    discount,
    tax,
    shippingCost,
    total,
    coupon,
    isLoading,
    isGuestCart
  } = useSelector((state) => state.cart);

  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isGuestCart) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated, isGuestCart]);

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }

    const item = items.find(i => i._id === itemId);
    if (item && newQuantity > item.stock) {
      toast.error(`Only ${item.stock} items available in stock`);
      return;
    }

    if (isGuestCart) {
      dispatch(updateGuestCartItem({ itemId, quantity: newQuantity }));
    } else {
      dispatch(updateCartItem({ itemId, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (itemId) => {
    if (isGuestCart) {
      dispatch(removeFromGuestCart(itemId));
    } else {
      dispatch(removeFromCart(itemId));
    }
    toast.success('Item removed from cart');
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      if (isGuestCart) {
        dispatch(clearGuestCart());
      } else {
        dispatch(clearCart());
      }
      toast.success('Cart cleared');
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setApplyingCoupon(true);
    try {
      if (isGuestCart) {
        // Simulate coupon for guest cart
        const validCoupons = {
          'SAVE10': { discountType: 'percentage', discountValue: 10, maxDiscount: 50, minPurchase: 50 },
          'SAVE20': { discountType: 'percentage', discountValue: 20, maxDiscount: 100, minPurchase: 100 },
          'FLAT50': { discountType: 'fixed', discountValue: 50, minPurchase: 200 },
          'WELCOME': { discountType: 'percentage', discountValue: 15, maxDiscount: 30 }
        };
        
        const coupon = validCoupons[couponCode.toUpperCase()];
        if (!coupon) {
          toast.error('Invalid coupon code');
          return;
        }
        
        if (subtotal < coupon.minPurchase) {
          toast.error(`Minimum purchase of $${coupon.minPurchase} required`);
          return;
        }
        
        dispatch(setGuestCoupon({ code: couponCode.toUpperCase(), ...coupon }));
        toast.success('Coupon applied!');
      } else {
        await dispatch(applyCoupon(couponCode)).unwrap();
        toast.success('Coupon applied successfully!');
      }
      setCouponCode('');
    } catch (error) {
      toast.error(error || 'Invalid coupon code');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    if (isGuestCart) {
      dispatch(setGuestCoupon(null));
    } else {
      dispatch(removeCoupon());
    }
    toast.success('Coupon removed');
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    // Check stock for all items
    const outOfStock = items.filter(item => item.quantity > item.stock);
    if (outOfStock.length > 0) {
      toast.error('Some items are out of stock. Please update your cart.');
      return;
    }
    
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gray-100 rounded-full p-6 inline-flex mb-6">
            <FiShoppingBag className="w-16 h-16 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added any items yet</p>
          <Link to="/products" className="btn-primary inline-flex items-center">
            Start Shopping
            <FiArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 bg-gray-50 px-6 py-3 text-sm font-semibold text-gray-600 border-b">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            
            {/* Items */}
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-b last:border-b-0"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 items-center">
                    {/* Product Info */}
                    <div className="md:col-span-6 flex space-x-4">
                      <img
                        src={item.image || 'https://via.placeholder.com/100'}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <Link 
                          to={`/product/${item.productId || item.product?._id}`}
                          className="font-semibold text-gray-800 hover:text-primary-600 line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        {item.stock <= 5 && item.stock > 0 && (
                          <p className="text-xs text-orange-600 mt-1">
                            Only {item.stock} left in stock!
                          </p>
                        )}
                        <button
                          onClick={() => handleRemoveItem(item._id)}
                          className="text-red-500 text-sm hover:text-red-600 mt-2 flex items-center"
                        >
                          <FiTrash2 className="mr-1" /> Remove
                        </button>
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="md:col-span-2">
                      <div className="text-center">
                        <span className="md:hidden font-semibold mr-2">Price:</span>
                        <span className="text-gray-800">${item.price.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    {/* Quantity */}
                    <div className="md:col-span-2">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <FiMinus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                          disabled={item.quantity >= item.stock}
                        >
                          <FiPlus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Total */}
                    <div className="md:col-span-2">
                      <div className="text-right">
                        <span className="md:hidden font-semibold mr-2">Total:</span>
                        <span className="font-bold text-primary-600">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
              <button
                onClick={handleClearCart}
                className="text-red-500 hover:text-red-600 text-sm flex items-center"
              >
                <FiTrash2 className="mr-1" /> Clear Cart
              </button>
              <Link to="/products" className="text-primary-600 hover:text-primary-700 text-sm flex items-center">
                Continue Shopping
                <FiArrowRight className="ml-1" />
              </Link>
            </div>
          </div>
          
          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <FiTruck className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-sm font-semibold">Free Shipping</p>
                <p className="text-xs text-gray-500">On orders over $50</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <FiRefreshCw className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-sm font-semibold">30-Day Returns</p>
                <p className="text-xs text-gray-500">Easy returns policy</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <FiShield className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-sm font-semibold">Secure Payment</p>
                <p className="text-xs text-gray-500">100% secure transactions</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            {/* Coupon */}
            <div className="mb-4">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon code"
                    className="input pl-10 text-sm"
                    disabled={!!coupon}
                  />
                  <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <button
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon || !!coupon}
                  className="btn-secondary text-sm px-4"
                >
                  {applyingCoupon ? 'Applying...' : 'Apply'}
                </button>
              </div>
              
              {coupon && (
                <div className="mt-2 flex items-center justify-between bg-green-50 p-2 rounded">
                  <span className="text-sm text-green-700">
                    Coupon {coupon.code} applied!
                  </span>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-red-500 hover:text-red-600 text-xs"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            
            {/* Totals */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    `$${shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>
              
              <div className="flex justify-between text-gray-600">
                <span>Estimated Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              
              {shippingCost > 0 && subtotal - discount < 50 && (
                <div className="bg-blue-50 p-2 rounded text-sm text-blue-700">
                  <p>Add ${(50 - (subtotal - discount)).toFixed(2)} more for free shipping!</p>
                </div>
              )}
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              className="btn-primary w-full mt-6 py-3 text-lg"
            >
              Proceed to Checkout
              <FiArrowRight className="ml-2 inline" />
            </button>
            
            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="block text-center text-primary-600 hover:text-primary-700 text-sm mt-4 flex items-center justify-center"
            >
              <FiHeart className="mr-1" /> Move items to wishlist
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;