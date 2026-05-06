import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiMapPin, FiPackage, FiCreditCard, FiCheck,
  FiArrowLeft, FiArrowRight, FiTruck, FiShield,
  FiSmartphone, FiDollarSign, FiUser, FiPhone,
  FiTag, FiChevronDown, FiChevronUp, FiEdit2
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { clearCart } from '../redux/slices/cartSlice';
import api from '../services/api';
import { formatBDT } from '../utils/currency';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [selectedCheckoutItems, setSelectedCheckoutItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showAddressSelect, setShowAddressSelect] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [expandedSections, setExpandedSections] = useState({ 
    shipping: true, 
    payment: true,
    items: true 
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [isBuyNow, setIsBuyNow] = useState(false);

  const [newAddress, setNewAddress] = useState({
    name: user?.name || '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Bangladesh',
    phone: user?.phone || '',
    email: user?.email || ''
  });

  useEffect(() => {
   

    // Handle Buy Now item first
    if (location.state?.buyNowItem) {
      const buyNowItem = location.state.buyNowItem;
     
      
      // Ensure buy now item has seller information
      const enhancedItem = {
        ...buyNowItem,
        // Add seller info if missing (fallback)
        sellerId: buyNowItem.sellerId || buyNowItem.seller?._id || buyNowItem.seller || 'default_seller',
        sellerName: buyNowItem.sellerName || buyNowItem.seller?.storeName || 'TechGadgets Bangladesh',
        // Ensure product ID is correct
        productId: buyNowItem.productId || buyNowItem.product?._id || buyNowItem.id,
        price: Number(buyNowItem.price),
        quantity: Number(buyNowItem.quantity) || 1
      };
      
    
      setSelectedCheckoutItems([enhancedItem]);
      setIsBuyNow(true);
    }
    else if (location.state?.selectedItems) {
    
      setSelectedCheckoutItems(location.state.selectedItems);
      setIsBuyNow(false);
    }
    else {
  
      toast.error('No items selected for checkout');
      navigate('/cart');
    }
  }, [location.state, navigate]);

  // Group items by seller
  const groupedItems = selectedCheckoutItems.reduce((groups, item) => {
    const sellerName = item.sellerName || item.seller?.storeName || 'TechGadgets Bangladesh';
    const sellerId = item.sellerId || item.seller?._id || 'default_seller';

    if (!groups[sellerId]) {
      groups[sellerId] = {
        sellerId,
        sellerName,
        items: [],
        subtotal: 0,
        shippingFee: 100
      };
    }
    groups[sellerId].items.push(item);
    groups[sellerId].subtotal += item.price * item.quantity;
    return groups;
  }, {});

  const selectedSubtotal = selectedCheckoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const selectedItemsCount = selectedCheckoutItems.length;
  const totalShippingFee = Object.values(groupedItems).reduce((sum, group) => sum + group.shippingFee, 0);
  const discountAmount = appliedCoupon ? (appliedCoupon.type === 'percentage' ? (selectedSubtotal * appliedCoupon.value / 100) : appliedCoupon.discount) : 0;
  const finalTotal = selectedSubtotal + totalShippingFee - discountAmount;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (selectedCheckoutItems.length === 0) {
      return;
    }
    fetchAddresses();
    calculateDeliveryDate();
  }, [isAuthenticated, selectedCheckoutItems]);

  const calculateDeliveryDate = () => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 5);
    setDeliveryDate({ start: startDate, end: endDate });
  };

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/users/addresses');
      setAddresses(response.data.addresses);
      const defaultAddress = response.data.addresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (response.data.addresses.length > 0) {
        setSelectedAddress(response.data.addresses[0]);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.postalCode || !newAddress.phone) {
      toast.error('Please fill all address fields');
      return;
    }

    try {
      const response = await api.post('/users/addresses', newAddress);
      setAddresses(response.data.addresses);
      setSelectedAddress(response.data.addresses[response.data.addresses.length - 1]);
      setShowAddressForm(false);
      setShowAddressSelect(false);
      setNewAddress({
        name: user?.name || '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Bangladesh',
        phone: user?.phone || '',
        email: user?.email || ''
      });
      toast.success('Address added successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add address');
    }
  };

  const handleAddressChange = (address) => {
    setSelectedAddress(address);
    setShowAddressSelect(false);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setApplyingCoupon(true);
    try {
      if (couponCode.toUpperCase() === 'SAVE10') {
        setAppliedCoupon({
          code: 'SAVE10',
          discount: selectedSubtotal * 0.1,
          type: 'percentage',
          value: 10
        });
        toast.success('Coupon applied successfully!');
      } else if (couponCode.toUpperCase() === 'SAVE20') {
        setAppliedCoupon({
          code: 'SAVE20',
          discount: selectedSubtotal * 0.2,
          type: 'percentage',
          value: 20
        });
        toast.success('Coupon applied successfully!');
      } else {
        toast.error('Invalid coupon code');
      }
      setCouponCode('');
    } catch (error) {
      toast.error('Failed to apply coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.success('Coupon removed');
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const placeOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return;
    }

    if (selectedCheckoutItems.length === 0) {
      toast.error('No items to checkout');
      return;
    }

    setLoading(true);

    try {
      const orderItemsList = [];

      for (const item of selectedCheckoutItems) {
        // Get seller ID from multiple possible sources
        const sellerId = item.sellerId || item.seller?._id || item.seller;
        
        console.log(`Processing item: ${item.name}, Seller ID: ${sellerId}`);
        
        if (!sellerId) {
          console.error('Missing seller ID for item:', item);
          toast.error(`Missing seller information for ${item.name}. Please try again.`);
          setLoading(false);
          return;
        }

        orderItemsList.push({
          product: item.productId || item.product?._id,
          name: item.name,
          image: item.image || '',
          price: Number(item.price),
          quantity: Number(item.quantity),
          seller: sellerId
        });
      }

      // Calculate totals
      const itemsTotal = selectedSubtotal;
      const totalShippingFeeCalc = totalShippingFee;
      const discountAmountCalc = discountAmount;
      const finalTotalAmount = itemsTotal + totalShippingFeeCalc - discountAmountCalc;

      const orderData = {
        paymentMethod: paymentMethod,
        orderItems: orderItemsList,
        itemsPrice: Number(itemsTotal),
        taxPrice: 0,
        shippingPrice: totalShippingFeeCalc,
        discountPrice: discountAmountCalc,
        totalPrice: finalTotalAmount,
        notes: ''
      };

      // Add shipping address
      orderData.shippingAddress = {
        name: selectedAddress.name,
        street: selectedAddress.street,
        city: selectedAddress.city,
        state: selectedAddress.state,
        postalCode: selectedAddress.postalCode,
        country: selectedAddress.country || 'Bangladesh',
        phone: selectedAddress.phone,
        email: selectedAddress.email || user?.email
      };

      console.log('Sending order data:', JSON.stringify(orderData, null, 2));

      const response = await api.post('/orders/create', orderData);
      const newOrderId = response.data.order._id;
      setOrderId(newOrderId);

      toast.success('Order placed successfully!');
      
      // Clear cart only if not buy now
      if (!isBuyNow) {
        await dispatch(clearCart());
      }
      
      navigate(`/order-success/${newOrderId}`);
      
    } catch (error) {
      console.error('Order placement error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to place order';
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  if (selectedCheckoutItems.length === 0 && !location.state?.selectedItems && !location.state?.buyNowItem) {
    return (
      <div className="bg-gray-100 min-h-screen py-6">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedCheckoutItems.length === 0) {
    return (
      <div className="bg-gray-100 min-h-screen py-6">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">No Items Selected</h2>
            <p className="text-gray-500 mb-6">Please select items from your cart to checkout.</p>
            <button onClick={() => navigate('/cart')} className="bg-primary-600 text-white px-6 py-2 rounded-lg">
              Go to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-6">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/cart')} className="text-gray-600 hover:text-gray-800">
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Checkout ({selectedItemsCount} items)</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Checkout Form */}
          <div className="flex-1 space-y-4">
            {/* Items Section */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection('items')}
                className="w-full p-5 flex items-center justify-between hover:bg-gray-50"
                aria-expanded={expandedSections.items}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiPackage className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-semibold text-lg">Order Items ({selectedItemsCount})</span>
                </div>
                <FiChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.items ? 'rotate-180' : ''}`} />
              </button>

              {expandedSections.items && (
                <div className="px-5 pb-5">
                  {Object.entries(groupedItems).map(([sellerId, group]) => (
                    <div key={sellerId} className="mb-4 last:mb-0">
                      <p className="font-medium text-gray-700 mb-2">{group.sellerName}</p>
                      <div className="space-y-3">
                        {group.items.map((item, idx) => (
                          <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                            <img
                              src={item.image || 'https://placehold.co/80x80?text=Product'}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded"
                              onError={(e) => { e.target.src = 'https://placehold.co/80x80?text=Product'; }}
                            />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                              <p className="text-sm font-semibold text-primary-600 mt-1">
                                {formatBDT(item.price)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatBDT(item.price * item.quantity)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shipping Section */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection('shipping')}
                className="w-full p-5 flex items-center justify-between hover:bg-gray-50"
                aria-expanded={expandedSections.shipping}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <FiMapPin className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="font-semibold text-lg">Shipping Address</span>
                </div>
                <FiChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.shipping ? 'rotate-180' : ''}`} />
              </button>

              {expandedSections.shipping && (
                <div className="px-5 pb-5">
                  {selectedAddress && !showAddressSelect && !showAddressForm ? (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{selectedAddress.name}</span>
                            <span className="text-sm text-gray-500">{selectedAddress.phone}</span>
                          </div>
                          <p className="text-gray-600 text-sm">
                            {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state}
                          </p>
                          <p className="text-gray-500 text-sm mt-1">{selectedAddress.country}</p>
                        </div>
                        <button onClick={() => setShowAddressSelect(true)} className="text-primary-600 text-sm flex items-center gap-1">
                          <FiEdit2 className="w-3 h-3" /> EDIT
                        </button>
                      </div>
                    </div>
                  ) : showAddressForm ? (
                    <div className="space-y-4 border p-4 rounded-lg bg-gray-50">
                      <h4 className="font-semibold mb-2">Add New Address</h4>
                      <input type="text" id="newAddressName" name="newAddressName" placeholder="Full Name" className="w-full p-2 border rounded outline-none focus:border-primary-500" value={newAddress.name} onChange={(e) => setNewAddress({...newAddress, name: e.target.value})} />
                      <input type="text" id="newAddressStreet" name="newAddressStreet" placeholder="Street Address" className="w-full p-2 border rounded outline-none focus:border-primary-500" value={newAddress.street} onChange={(e) => setNewAddress({...newAddress, street: e.target.value})} />
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" id="newAddressCity" name="newAddressCity" placeholder="City" className="w-full p-2 border rounded outline-none focus:border-primary-500" value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} />
                        <input type="text" id="newAddressState" name="newAddressState" placeholder="State/Division" className="w-full p-2 border rounded outline-none focus:border-primary-500" value={newAddress.state} onChange={(e) => setNewAddress({...newAddress, state: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" id="newAddressPostalCode" name="newAddressPostalCode" placeholder="Postal Code" className="w-full p-2 border rounded outline-none focus:border-primary-500" value={newAddress.postalCode} onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})} />
                        <input type="text" id="newAddressPhone" name="newAddressPhone" placeholder="Phone Number" className="w-full p-2 border rounded outline-none focus:border-primary-500" value={newAddress.phone} onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})} />
                      </div>
                      <div className="flex gap-2 justify-end mt-4">
                        <button onClick={() => setShowAddressForm(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
                        <button onClick={handleAddAddress} className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors">Save Address</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((addr, idx) => (
                        <label key={idx} className={`flex items-start p-4 border-2 rounded-lg cursor-pointer ${selectedAddress?._id === addr._id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                          <input
                            type="radio"
                            name="address"
                            value={addr._id}
                            checked={selectedAddress?._id === addr._id}
                            onChange={() => handleAddressChange(addr)}
                            className="mt-1 mr-3"
                            id={`address-${addr._id}`}
                          />
                          <div className="flex-1">
                            <p className="font-semibold">{addr.name}</p>
                            <p className="text-sm text-gray-600">{addr.street}</p>
                            <p className="text-sm text-gray-600">{addr.city}, {addr.state}</p>
                            <p className="text-sm text-gray-600">Phone: {addr.phone}</p>
                          </div>
                        </label>
                      ))}
                      <button onClick={() => setShowAddressForm(true)} className="w-full p-3 border-2 border-dashed rounded-lg text-primary-600 text-sm">
                        + Add New Address
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Payment Section */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection('payment')}
                className="w-full p-5 flex items-center justify-between hover:bg-gray-50"
                aria-expanded={expandedSections.payment}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <FiCreditCard className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="font-semibold text-lg">Payment Method</span>
                </div>
                <FiChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.payment ? 'rotate-180' : ''}`} />
              </button>

              {expandedSections.payment && (
                <div className="px-5 pb-5">
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash_on_delivery"
                        checked={paymentMethod === 'cash_on_delivery'}
                        onChange={() => handlePaymentMethodChange('cash_on_delivery')}
                        className="w-4 h-4"
                        id="payment-cod"
                      />
                      <FiDollarSign className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">Cash on Delivery</p>
                        <p className="text-xs text-gray-500">Pay when you receive</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Promotion Section */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <FiTag className="w-5 h-5 text-orange-500" />
                <span className="font-semibold">Promotion</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="couponCode"
                  name="couponCode"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter Coupon Code"
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={!!appliedCoupon}
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon || !!appliedCoupon}
                  className="px-4 py-2 bg-gray-200 rounded-lg text-sm hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  {applyingCoupon ? '...' : 'APPLY'}
                </button>
              </div>
              {appliedCoupon && (
                <div className="mt-2 flex justify-between bg-green-50 p-2 rounded">
                  <span className="text-sm text-green-700">Coupon {appliedCoupon.code} applied!</span>
                  <button onClick={handleRemoveCoupon} className="text-red-500 text-xs hover:text-red-600">
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-96">
            <div className="bg-white rounded-lg shadow-sm p-5 sticky top-24">
              <h2 className="font-semibold text-lg mb-4">Order Summary</h2>

              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Items Total ({selectedItemsCount})</span>
                  <span>{formatBDT(selectedSubtotal)}</span>
                </div>

                {Object.entries(groupedItems).map(([sellerId, group]) => (
                  <div key={sellerId} className="border-t pt-2">
                    <p className="text-sm font-medium mb-1">{group.sellerName}</p>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Delivery Fee</span>
                      <span>{formatBDT(group.shippingFee)}</span>
                    </div>
                  </div>
                ))}

                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 border-t pt-2">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-{formatBDT(discountAmount)}</span>
                  </div>
                )}

                <div className="border-t pt-3 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-primary-600">{formatBDT(finalTotal)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">VAT and taxes included</p>
                </div>
              </div>

              <button
                onClick={placeOrder}
                disabled={loading}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold mt-5 hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                ) : (
                  'Place Order'
                )}
              </button>

              {/* Security Badges */}
              <div className="mt-4 pt-4 border-t text-center">
                <div className="flex justify-center gap-3 text-gray-500 text-xs">
                  <span>🔒 Secure Payment</span>
                  <span>🚚 Fast Delivery</span>
                  <span>🔄 Easy Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;