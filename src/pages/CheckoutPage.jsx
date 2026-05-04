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
  const [expandedSections, setExpandedSections] = useState({ shipping: true });
  const [collectionPoints, setCollectionPoints] = useState([]);
  const [selectedCollectionPoint, setSelectedCollectionPoint] = useState(null);
  const [showCollectionPoints, setShowCollectionPoints] = useState(false);
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
    console.log('=== CHECKOUT PAGE MOUNTED ===');
    console.log('Location state:', location.state);

    // Handle Buy Now item first
    if (location.state?.buyNowItem) {
      console.log('Buy Now item:', location.state.buyNowItem);
      setSelectedCheckoutItems([location.state.buyNowItem]);
      setIsBuyNow(true);
    }
    else if (location.state?.selectedItems) {
      console.log('Selected items from cart:', location.state.selectedItems);
      setSelectedCheckoutItems(location.state.selectedItems);
      setIsBuyNow(false);
    }
    else {
      console.log('No items found - redirecting to cart');
      toast.error('No items selected for checkout');
      navigate('/cart');
    }
  }, [location.state, navigate]);

  // Group items by seller
  const groupedItems = selectedCheckoutItems.reduce((groups, item) => {
    const sellerName = item.sellerName || item.seller?.storeName || 'Other Sellers';
    const sellerId = item.sellerId || item.seller?._id || 'other';

    if (!groups[sellerId]) {
      groups[sellerId] = {
        sellerId,
        sellerName,
        items: [],
        subtotal: 0,
        shippingFee: 110
      };
    }
    groups[sellerId].items.push(item);
    groups[sellerId].subtotal += item.price * item.quantity;
    return groups;
  }, {});

  const selectedSubtotal = selectedCheckoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const selectedItemsCount = selectedCheckoutItems.length;

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
    fetchCollectionPoints();
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

  const fetchCollectionPoints = async () => {
    setCollectionPoints([
      {
        id: 1,
        name: 'Click N Pick Collection Point',
        address: 'House #12, Road #5, Sector #6, Uttara, Dhaka-1230',
        distance: '1.2 km',
        fee: 0
      },
      {
        id: 2,
        name: 'Daraz Collection Point - Gulshan',
        address: 'Gulshan 2, Dhaka-1212',
        distance: '3.5 km',
        fee: 50
      }
    ]);
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

  const getTotalPrice = () => {
    let total = selectedSubtotal;
    Object.values(groupedItems).forEach(group => {
      total += group.shippingFee;
    });
    if (appliedCoupon) {
      total -= appliedCoupon.discount;
    }
    return total;
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };


  const placeOrder = async () => {
    if (!selectedAddress && !selectedCollectionPoint) {
      toast.error('Please select a shipping address or collection point');
      return;
    }

    if (selectedCheckoutItems.length === 0) {
      toast.error('No items to checkout');
      return;
    }

    setLoading(true);

    try {
      const orderItemsList = [];

      for (const group of Object.values(groupedItems)) {
        for (const item of group.items) {
          const sellerId = item.sellerId || item.seller?._id;

          if (!sellerId) {
            console.error('Missing seller ID for item:', item);
            toast.error(`Missing seller information for ${item.name}`);
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
      }

      let shippingFee = 0;
      Object.values(groupedItems).forEach(group => {
        shippingFee += group.shippingFee;
      });

      const orderData = {
        paymentMethod: paymentMethod,
        orderItems: orderItemsList,
        itemsPrice: Number(selectedSubtotal),
        taxPrice: 0,
        shippingPrice: selectedCollectionPoint ? (selectedCollectionPoint.fee || 0) : shippingFee,
        discountPrice: appliedCoupon ? Number(appliedCoupon.discount) : 0,
        notes: ''
      };

      if (selectedAddress && !selectedCollectionPoint) {
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
      }

      if (selectedCollectionPoint) {
        orderData.collectionPoint = {
          name: selectedCollectionPoint.name,
          address: selectedCollectionPoint.address,
          fee: selectedCollectionPoint.fee
        };
      }

      console.log('Sending order data:', JSON.stringify(orderData, null, 2));

      const response = await api.post('/orders/create', orderData);

      if (response.data.success) {
        toast.success('Order placed successfully!');

        // ✅ For Buy Now, don't clear the cart (since item wasn't added to cart)
        if (!isBuyNow) {
          await dispatch(clearCart());
        }

        navigate(`/order-success/${response.data.order._id}`);
      } else {
        toast.error(response.data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order placement error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to place order';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  if (selectedCheckoutItems.length === 0 && location.state?.selectedItems === undefined) {
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
            {/* Shipping Section */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection('shipping')}
                className="w-full p-5 flex items-center justify-between hover:bg-gray-50"
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
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((addr, idx) => (
                        <label key={idx} className={`flex items-start p-4 border-2 rounded-lg cursor-pointer ${selectedAddress?._id === addr._id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                          <input type="radio" checked={selectedAddress?._id === addr._id} onChange={() => { setSelectedAddress(addr); setShowAddressSelect(false); }} className="mt-1 mr-3" />
                          <div className="flex-1">
                            <p className="font-semibold">{addr.name}</p>
                            <p className="text-sm text-gray-600">{addr.street}</p>
                            <p className="text-sm text-gray-600">{addr.city}, {addr.state}</p>
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

            {/* Promotion Section */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <FiTag className="w-5 h-5 text-orange-500" />
                <span className="font-semibold">Promotion</span>
              </div>
              <div className="flex gap-2">
                <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Enter Coupon Code" className="flex-1 px-3 py-2 border rounded-lg text-sm" disabled={!!appliedCoupon} />
                <button onClick={handleApplyCoupon} disabled={applyingCoupon || !!appliedCoupon} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">
                  {applyingCoupon ? '...' : 'APPLY'}
                </button>
              </div>
              {appliedCoupon && (
                <div className="mt-2 flex justify-between bg-green-50 p-2 rounded">
                  <span className="text-sm text-green-700">Coupon {appliedCoupon.code} applied!</span>
                  <button onClick={handleRemoveCoupon} className="text-red-500 text-xs">Remove</button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-96">
            <div className="bg-white rounded-lg shadow-sm p-5 sticky top-24">
              <h2 className="font-semibold text-lg mb-4">Order Summary</h2>

              <div className="flex justify-between text-gray-600 mb-3">
                <span>Items Total ({selectedItemsCount})</span>
                <span>{formatBDT(selectedSubtotal)}</span>
              </div>

              {Object.entries(groupedItems).map(([sellerId, group]) => (
                <div key={sellerId} className="border-t pt-3 mt-3">
                  <p className="text-sm font-medium mb-2">{group.sellerName}</p>
                  <div className="space-y-2">
                    {group.items.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <img src={item.image || 'https://placehold.co/60x60'} alt="" className="w-12 h-12 object-cover rounded" />
                        <div className="flex-1">
                          <p className="text-xs">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          <p className="text-sm font-medium">{formatBDT(item.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm mt-2 pt-2 border-t">
                    <span className="text-gray-500">Delivery Fee</span>
                    <span>{formatBDT(group.shippingFee)}</span>
                  </div>
                </div>
              ))}

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-primary-600">{formatBDT(getTotalPrice())}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mt-4">
                <label className="font-medium text-sm block mb-2">Payment Method</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer">
                    <input type="radio" value="cash_on_delivery" checked={paymentMethod === 'cash_on_delivery'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4" />
                    <FiDollarSign className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-sm">Cash on Delivery</p>
                      <p className="text-xs text-gray-500">Pay when you receive</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer">
                    <input type="radio" value="bkash" checked={paymentMethod === 'bkash'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4" />
                    <FiSmartphone className="w-5 h-5 text-pink-600" />
                    <div>
                      <p className="font-medium text-sm">bKash</p>
                      <p className="text-xs text-gray-500">Pay with bKash</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer">
                    <input type="radio" value="nagad" checked={paymentMethod === 'nagad'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4" />
                    <FiSmartphone className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium text-sm">Nagad</p>
                      <p className="text-xs text-gray-500">Pay with Nagad</p>
                    </div>
                  </label>
                </div>
              </div>

              <button onClick={placeOrder} disabled={loading} className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold mt-5 disabled:opacity-50">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div> : 'Proceed to Pay'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;