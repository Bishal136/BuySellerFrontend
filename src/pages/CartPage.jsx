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
  FiHeart,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiAlertCircle
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
import { formatBDT } from '../utils/currency';
import Price from '../components/common/Price';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const {
    items,
    subtotal,
    discount,
    shippingCost,
    total,
    coupon,
    isLoading,
    isGuestCart
  } = useSelector((state) => state.cart);

  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [selectAll, setSelectAll] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [expandedSellers, setExpandedSellers] = useState({});

  useEffect(() => {
    if (isAuthenticated && !isGuestCart) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated, isGuestCart]);

  useEffect(() => {
    // Initialize selected items
    setSelectedItems(items.map(item => item._id));
    setSelectAll(true);
  }, [items]);

  // Group items by seller
  const groupedItems = items.reduce((groups, item) => {
    const sellerName = item.sellerName || item.seller?.storeName || 'Other Sellers';
    const sellerId = item.sellerId || item.seller?._id || 'other';
    
    if (!groups[sellerId]) {
      groups[sellerId] = {
        sellerId,
        sellerName,
        items: [],
        subtotal: 0
      };
    }
    groups[sellerId].items.push(item);
    groups[sellerId].subtotal += item.price * item.quantity;
    return groups;
  }, {});

  // Calculate selected items totals
  const selectedItemsData = items.filter(item => selectedItems.includes(item._id));
  const selectedSubtotal = selectedItemsData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const selectedDiscount = discount;
  const selectedShipping = selectedSubtotal - selectedDiscount > 5000 ? 0 : 100;
  const selectedTotal = selectedSubtotal - selectedDiscount + selectedShipping;

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleSellerItems = (sellerId, sellerItems) => {
    const sellerItemIds = sellerItems.map(item => item._id);
    const allSelected = sellerItemIds.every(id => selectedItems.includes(id));
    
    if (allSelected) {
      setSelectedItems(prev => prev.filter(id => !sellerItemIds.includes(id)));
    } else {
      setSelectedItems(prev => [...new Set([...prev, ...sellerItemIds])]);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item._id));
    }
    setSelectAll(!selectAll);
  };

  const toggleSellerExpand = (sellerId) => {
    setExpandedSellers(prev => ({
      ...prev,
      [sellerId]: !prev[sellerId]
    }));
  };

  const updateQuantity = async (itemId, newQuantity) => {
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
      await dispatch(updateCartItem({ itemId, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (isGuestCart) {
      dispatch(removeFromGuestCart(itemId));
    } else {
      await dispatch(removeFromCart(itemId));
    }
    toast.success('Item removed from cart');
    setSelectedItems(prev => prev.filter(id => id !== itemId));
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      if (isGuestCart) {
        dispatch(clearGuestCart());
      } else {
        dispatch(clearCart());
      }
      setSelectedItems([]);
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
        const validCoupons = {
          'SAVE10': { discountType: 'percentage', discountValue: 10, maxDiscount: 500, minPurchase: 5000 },
          'SAVE20': { discountType: 'percentage', discountValue: 20, maxDiscount: 1000, minPurchase: 10000 },
          'FLAT50': { discountType: 'fixed', discountValue: 50, minPurchase: 20000 },
          'WELCOME': { discountType: 'percentage', discountValue: 15, maxDiscount: 300, minPurchase: 0 }
        };

        const coupon = validCoupons[couponCode.toUpperCase()];
        if (!coupon) {
          toast.error('Invalid coupon code');
          return;
        }

        if (selectedSubtotal < coupon.minPurchase) {
          toast.error(`Minimum purchase of ${formatBDT(coupon.minPurchase)} required`);
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

 // Updated handleCheckout function with seller info
const handleCheckout = () => {
  console.log('=== HANDLE CHECKOUT CALLED ===');
  console.log('Selected items IDs:', selectedItems);
  console.log('All items:', items);
  
  if (selectedItems.length === 0) {
    toast.error('Please select at least one item to checkout');
    return;
  }

  // Get the selected items data with all details including seller info
  const itemsToCheckout = items.filter(item => selectedItems.includes(item._id)).map(item => ({
    _id: item._id,
    productId: item.productId || item.product?._id,
    name: item.name,
    image: item.image,
    price: item.price,
    quantity: item.quantity,
    stock: item.stock,
    brand: item.brand,
    // Critical: Include seller information
    sellerId: item.sellerId || item.seller?._id || item.seller || 'default_seller',
    sellerName: item.sellerName || item.seller?.storeName || 'Default Seller',
    seller: item.seller || item.sellerId || 'default_seller',
    // Include any other relevant fields
    color: item.color,
    size: item.size,
    selected: true
  }));
  
  console.log('Items to checkout (with seller info):', JSON.stringify(itemsToCheckout, null, 2));
  
  // Validate seller info for each item
  const missingSellerInfo = itemsToCheckout.filter(item => !item.sellerId);
  if (missingSellerInfo.length > 0) {
    console.error('Missing seller info for items:', missingSellerInfo);
    toast.error('Some items are missing seller information. Please try adding them to cart again.');
    return;
  }
  
  if (itemsToCheckout.length === 0) {
    toast.error('No items found for checkout');
    return;
  }
  
  const outOfStock = itemsToCheckout.filter(item => item.quantity > item.stock);
  if (outOfStock.length > 0) {
    toast.error('Some selected items are out of stock. Please update your cart.');
    return;
  }

  // Navigate to checkout page with selected items
  navigate('/checkout', { 
    state: { 
      selectedItems: itemsToCheckout 
    } 
  });
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
          <Link to="/products" className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center">
            Start Shopping
            <FiArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-6">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Cart Items */}
          <div className="flex-1">
            {/* Select All Header */}
            <div className="bg-white rounded-t-lg p-4 border-b flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  id="selectAll"
                  name="selectAll"
                  checked={selectAll && selectedItems.length === items.length}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="font-medium">
                  SELECT ALL ({items.length} ITEM{items.length !== 1 ? 'S' : ''})
                </span>
              </label>
              <button
                onClick={handleClearCart}
                className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1"
              >
                <FiTrash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>

            {/* Items Grouped by Seller */}
            {Object.entries(groupedItems).map(([sellerId, sellerGroup]) => {
              const sellerItemIds = sellerGroup.items.map(item => item._id);
              const allSellerSelected = sellerItemIds.every(id => selectedItems.includes(id));
              const someSellerSelected = sellerItemIds.some(id => selectedItems.includes(id));
              const isExpanded = expandedSellers[sellerId] !== false;

              return (
                <div key={sellerId} className="bg-white rounded-b-lg mb-4 overflow-hidden shadow-sm">
                  {/* Seller Header */}
                  <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={`select-seller-${sellerId}`}
                        name={`select-seller-${sellerId}`}
                        checked={allSellerSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = !allSellerSelected && someSellerSelected;
                        }}
                        onChange={() => toggleSellerItems(sellerId, sellerGroup.items)}
                        className="w-5 h-5 rounded border-gray-300 text-primary-600"
                      />
                      <div>
                        <span className="font-semibold text-gray-800">{sellerGroup.sellerName}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({sellerGroup.items.length} items)
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSellerExpand(sellerId)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                  </div>

                  {/* Seller Items */}
                  {isExpanded && (
                    <AnimatePresence>
                      {sellerGroup.items.map((item) => (
                        <motion.div
                          key={item._id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-b last:border-b-0 p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex gap-4">
                            {/* Checkbox */}
                            <div className="flex-shrink-0">
                              <input
                                type="checkbox"
                                id={`select-item-${item._id}`}
                                name={`select-item-${item._id}`}
                                checked={selectedItems.includes(item._id)}
                                onChange={() => toggleItemSelection(item._id)}
                                className="w-5 h-5 rounded border-gray-300 text-primary-600 mt-6"
                              />
                            </div>

                            {/* Product Image */}
                            <div className="flex-shrink-0">
                              <img
                                src={item.image || 'https://placehold.co/100x100?text=Product'}
                                alt={item.name}
                                className="w-24 h-24 object-cover rounded-lg border"
                                onError={(e) => {
                                  e.target.src = 'https://placehold.co/100x100?text=Product';
                                }}
                              />
                            </div>

                            {/* Product Details */}
                            <div className="flex-1">
                              <Link
                                to={`/product/${item.productId || item.product?._id}`}
                                className="font-medium text-gray-800 hover:text-primary-600 line-clamp-2"
                              >
                                {item.name}
                              </Link>
                              {item.brand && (
                                <p className="text-xs text-gray-500 mt-1">Brand: {item.brand}</p>
                              )}
                              {item.color && (
                                <p className="text-xs text-gray-500">Color: {item.color}</p>
                              )}
                              
                              {/* Price and Quantity Row */}
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-primary-600 text-lg">
                                    {formatBDT(item.price)}
                                  </span>
                                  {item.comparePrice && item.comparePrice > item.price && (
                                    <span className="text-gray-400 line-through text-sm">
                                      {formatBDT(item.comparePrice)}
                                    </span>
                                  )}
                                </div>
                                
                                {/* Quantity Selector */}
                                <div className="flex items-center border rounded-lg overflow-hidden">
                                  <button
                                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                    className="px-3 py-1 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                    disabled={item.quantity <= 1}
                                  >
                                    <FiMinus className="w-4 h-4" />
                                  </button>
                                  <span className="w-12 text-center font-medium">{item.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                    className="px-3 py-1 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                    disabled={item.quantity >= item.stock}
                                  >
                                    <FiPlus className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Total Price */}
                              <div className="flex justify-end mt-2">
                                <span className="font-semibold text-gray-800">
                                  Total: {formatBDT(item.price * item.quantity)}
                                </span>
                              </div>

                              {/* Remove Button */}
                              <button
                                onClick={() => handleRemoveItem(item._id)}
                                className="text-red-500 text-sm hover:text-red-600 mt-2 flex items-center gap-1"
                              >
                                <FiTrash2 className="w-3 h-3" />
                                Remove
                              </button>

                              {/* Low Stock Warning */}
                              {item.stock <= 5 && item.stock > 0 && (
                                <div className="mt-2 flex items-center gap-1 text-orange-600 text-xs">
                                  <FiAlertCircle className="w-3 h-3" />
                                  Only {item.stock} left in stock!
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}

            {/* Continue Shopping Link */}
            <Link 
              to="/products" 
              className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1 mt-4"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-96">
            <div className="bg-white rounded-lg shadow-sm p-5 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">ORDER SUMMARY</h2>

              {/* Subtotal */}
              <div className="flex justify-between text-gray-600 mb-3">
                <span>Subtotal ({selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''})</span>
                <span className="font-medium">{formatBDT(selectedSubtotal)}</span>
              </div>

              {/* Shipping Fee */}
              <div className="flex justify-between text-gray-600 mb-3">
                <span>Shipping Fee</span>
                <span>
                  {selectedShipping === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    formatBDT(selectedShipping)
                  )}
                </span>
              </div>

              {/* Free Shipping Message */}
              {selectedShipping > 0 && selectedSubtotal - selectedDiscount < 5000 && (
                <div className="bg-blue-50 p-2 rounded text-xs text-blue-700 mb-3">
                  Add {formatBDT(5000 - (selectedSubtotal - selectedDiscount))} more for free shipping!
                </div>
              )}

              {/* Discount */}
              {discount > 0 && (
                <div className="flex justify-between text-green-600 mb-3">
                  <span>Discount</span>
                  <span>-{formatBDT(discount)}</span>
                </div>
              )}

              {/* Coupon Input */}
              <div className="mt-4 mb-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      id="cartCouponCode"
                      name="cartCouponCode"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter Voucher Code"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      disabled={!!coupon}
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon || !!coupon}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {applyingCoupon ? '...' : 'APPLY'}
                  </button>
                </div>
                {coupon && (
                  <div className="mt-2 flex items-center justify-between bg-green-50 p-2 rounded">
                    <span className="text-sm text-green-700">
                      Coupon {coupon.code} applied! -{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : formatBDT(coupon.discountValue)}
                    </span>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-red-500 hover:text-red-600 text-xs flex items-center gap-1"
                    >
                      <FiX className="w-3 h-3" /> Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t pt-4 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary-600">{formatBDT(selectedTotal)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Including all charges</p>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={selectedItems.length === 0}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                PROCEED TO CHECKOUT ({selectedItems.length})
              </button>

              {/* Security Badges */}
              <div className="mt-5 pt-4 border-t text-center">
                <div className="flex justify-center gap-4 text-gray-500 text-xs">
                  <div className="flex items-center gap-1">
                    <FiShield className="w-3 h-3" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiTruck className="w-3 h-3" />
                    <span>Fast Delivery</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiRefreshCw className="w-3 h-3" />
                    <span>Easy Returns</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Message */}
            <div className="mt-4 text-center text-xs text-gray-400">
              <p>Prices and delivery costs are inclusive of VAT</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;