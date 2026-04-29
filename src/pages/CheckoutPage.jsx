import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMapPin, FiPackage, FiCreditCard, FiCheck, 
  FiArrowLeft, FiArrowRight, FiTruck, FiShield,
  FiSmartphone, FiDollarSign
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { fetchCart } from '../redux/slices/cartSlice';
import api from '../services/api';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items, subtotal, discount, tax, shippingCost, total } = useSelector((state) => state.cart);
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [bkashNumber, setBkashNumber] = useState('');
  const [nagadNumber, setNagadNumber] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [paymentModal, setPaymentModal] = useState({ show: false, type: '', data: null });

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
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (items.length === 0) {
      navigate('/cart');
      return;
    }
    fetchAddresses();
  }, [isAuthenticated, items]);

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
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.postalCode) {
      toast.error('Please fill all address fields');
      return;
    }

    try {
      const response = await api.post('/users/addresses', newAddress);
      setAddresses(response.data.addresses);
      setSelectedAddress(response.data.addresses[response.data.addresses.length - 1]);
      setShowAddressForm(false);
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

  const createOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        shippingAddress: selectedAddress,
        paymentMethod: paymentMethod,
        orderItems: items.map(item => ({
          product: item.productId || item.product?._id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          seller: item.seller
        })),
        itemsPrice: subtotal,
        taxPrice: tax,
        shippingPrice: shippingCost,
        discountPrice: discount,
        totalPrice: total,
        coupon: null,
        notes: ''
      };

      const response = await api.post('/orders/create', orderData);
      setOrderId(response.data.order._id);
      
      if (paymentMethod === 'cash_on_delivery') {
        await confirmCashOnDelivery(response.data.order._id);
      } else if (paymentMethod === 'bkash') {
        await initiateBkashPayment(response.data.order._id);
      } else if (paymentMethod === 'nagad') {
        await initiateNagadPayment(response.data.order._id);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create order');
      setLoading(false);
    }
  };

  const initiateBkashPayment = async (orderId) => {
    try {
      const response = await api.post('/payment/bkash/init', {
        orderId: orderId,
        amount: total
      });
      
      setPaymentModal({
        show: true,
        type: 'bkash',
        data: response.data
      });
      setLoading(false);
    } catch (error) {
      toast.error('Failed to initiate bKash payment');
      setLoading(false);
    }
  };

  const confirmBkashPayment = async () => {
    setLoading(true);
    try {
      const transactionId = document.getElementById('transactionId').value;
      if (!transactionId) {
        toast.error('Please enter transaction ID');
        setLoading(false);
        return;
      }

      await api.post('/payment/bkash/confirm', {
        orderId: orderId,
        paymentId: paymentModal.data.paymentId,
        transactionId: transactionId
      });

      setPaymentModal({ show: false, type: '', data: null });
      navigate(`/order-success/${orderId}`);
    } catch (error) {
      toast.error('Payment confirmation failed');
      setLoading(false);
    }
  };

  const initiateNagadPayment = async (orderId) => {
    try {
      const response = await api.post('/payment/nagad/init', {
        orderId: orderId,
        amount: total
      });
      
      setPaymentModal({
        show: true,
        type: 'nagad',
        data: response.data
      });
      setLoading(false);
    } catch (error) {
      toast.error('Failed to initiate Nagad payment');
      setLoading(false);
    }
  };

  const confirmNagadPayment = async () => {
    setLoading(true);
    try {
      const transactionId = document.getElementById('transactionId').value;
      if (!transactionId) {
        toast.error('Please enter transaction ID');
        setLoading(false);
        return;
      }

      await api.post('/payment/nagad/confirm', {
        orderId: orderId,
        paymentId: paymentModal.data.paymentId,
        transactionId: transactionId
      });

      setPaymentModal({ show: false, type: '', data: null });
      navigate(`/order-success/${orderId}`);
    } catch (error) {
      toast.error('Payment confirmation failed');
      setLoading(false);
    }
  };

  const confirmCashOnDelivery = async (orderId) => {
    try {
      await api.post('/payment/cod/confirm', { orderId });
      navigate(`/order-success/${orderId}`);
    } catch (error) {
      toast.error('Failed to place order');
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !selectedAddress) {
      toast.error('Please select or add a shipping address');
      return;
    }
    if (step === 2 && !paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    if (step === 2) {
      createOrder();
    } else {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const paymentMethods = [
    { id: 'bkash', name: 'bKash', icon: <FiSmartphone />, color: 'bg-pink-500' },
    { id: 'nagad', name: 'Nagad', icon: <FiSmartphone />, color: 'bg-red-500' },
    { id: 'cash_on_delivery', name: 'Cash on Delivery', icon: <FiDollarSign />, color: 'bg-green-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex justify-between items-center">
            {[
              { step: 1, title: 'Shipping', icon: FiMapPin },
              { step: 2, title: 'Payment', icon: FiCreditCard },
              { step: 3, title: 'Confirmation', icon: FiCheck }
            ].map((s) => (
              <div key={s.step} className="flex-1 relative">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    step >= s.step 
                      ? 'bg-primary-600 border-primary-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-medium mt-2">{s.title}</div>
                </div>
                {s.step < 3 && (
                  <div className={`absolute top-6 left-1/2 w-full h-0.5 transition-all duration-300 ${
                    step > s.step ? 'bg-primary-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <AnimatePresence mode="wait">
                {/* Step 1: Shipping Address */}
                {step === 1 && (
                  <motion.div
                    key="shipping"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                    
                    {/* Existing Addresses */}
                    {addresses.length > 0 && (
                      <div className="space-y-3 mb-6">
                        {addresses.map((addr, idx) => (
                          <label key={idx} className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="radio"
                              name="address"
                              checked={selectedAddress?._id === addr._id}
                              onChange={() => setSelectedAddress(addr)}
                              className="mt-1 mr-3"
                            />
                            <div className="flex-1">
                              <p className="font-semibold">{addr.name}</p>
                              <p className="text-sm text-gray-600">{addr.street}</p>
                              <p className="text-sm text-gray-600">
                                {addr.city}, {addr.state} {addr.postalCode}
                              </p>
                              <p className="text-sm text-gray-600">{addr.country}</p>
                              <p className="text-sm text-gray-600">Phone: {addr.phone}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Add New Address Button */}
                    {!showAddressForm ? (
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        + Add New Address
                      </button>
                    ) : (
                      <div className="mt-4 space-y-4">
                        <h3 className="font-semibold">New Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={newAddress.name}
                            onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                            className="input"
                          />
                          <input
                            type="text"
                            placeholder="Street Address"
                            value={newAddress.street}
                            onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                            className="input"
                          />
                          <input
                            type="text"
                            placeholder="City"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                            className="input"
                          />
                          <input
                            type="text"
                            placeholder="State"
                            value={newAddress.state}
                            onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                            className="input"
                          />
                          <input
                            type="text"
                            placeholder="Postal Code"
                            value={newAddress.postalCode}
                            onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})}
                            className="input"
                          />
                          <input
                            type="text"
                            placeholder="Phone"
                            value={newAddress.phone}
                            onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                            className="input"
                          />
                        </div>
                        <div className="flex space-x-3">
                          <button onClick={handleAddAddress} className="btn-primary">
                            Save Address
                          </button>
                          <button onClick={() => setShowAddressForm(false)} className="btn-secondary">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 2: Payment Method */}
                {step === 2 && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                    <div className="space-y-3">
                      {paymentMethods.map((method) => (
                        <label
                          key={method.id}
                          className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                            paymentMethod === method.id
                              ? 'border-primary-600 bg-primary-50'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={method.id}
                            checked={paymentMethod === method.id}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="mr-3"
                          />
                          <div className={`${method.color} w-10 h-10 rounded-full flex items-center justify-center text-white`}>
                            {method.icon}
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="font-semibold">{method.name}</p>
                            {method.id === 'bkash' && (
                              <p className="text-xs text-gray-500">Pay with bKash mobile banking</p>
                            )}
                            {method.id === 'nagad' && (
                              <p className="text-xs text-gray-500">Pay with Nagad mobile banking</p>
                            )}
                            {method.id === 'cash_on_delivery' && (
                              <p className="text-xs text-gray-500">Pay when you receive the order</p>
                            )}
                          </div>
                          {paymentMethod === method.id && (
                            <FiCheck className="text-primary-600 w-5 h-5" />
                          )}
                        </label>
                      ))}
                    </div>

                    {/* bKash Instructions */}
                    {paymentMethod === 'bkash' && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm font-semibold text-blue-800">bKash Payment Instructions:</p>
                        <ul className="text-sm text-blue-700 mt-2 space-y-1">
                          <li>1. Go to your bKash app</li>
                          <li>2. Select "Send Money"</li>
                          <li>3. Enter merchant number: 017XXXXXXXX</li>
                          <li>4. Enter the amount: ${total.toFixed(2)}</li>
                          <li>5. Enter reference: ORDER-{orderId || 'XXXX'}</li>
                          <li>6. Complete payment and enter transaction ID</li>
                        </ul>
                      </div>
                    )}

                    {/* Nagad Instructions */}
                    {paymentMethod === 'nagad' && (
                      <div className="mt-4 p-4 bg-red-50 rounded-lg">
                        <p className="text-sm font-semibold text-red-800">Nagad Payment Instructions:</p>
                        <ul className="text-sm text-red-700 mt-2 space-y-1">
                          <li>1. Go to your Nagad app</li>
                          <li>2. Select "Send Money"</li>
                          <li>3. Enter merchant number: 018XXXXXXXX</li>
                          <li>4. Enter the amount: ${total.toFixed(2)}</li>
                          <li>5. Enter reference: ORDER-{orderId || 'XXXX'}</li>
                          <li>6. Complete payment and enter transaction ID</li>
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                {items.map((item) => (
                  <div key={item._id} className="flex space-x-3">
                    <img
                      src={item.image || 'https://via.placeholder.com/60'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-2">
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
                  <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary-600">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="mt-6 space-y-3">
                {step > 1 && (
                  <button onClick={prevStep} className="btn-secondary w-full flex items-center justify-center">
                    <FiArrowLeft className="mr-2" /> Back
                  </button>
                )}
                <button
                  onClick={nextStep}
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : step === 2 ? (
                    <>Place Order <FiArrowRight className="ml-2" /></>
                  ) : (
                    <>Continue <FiArrowRight className="ml-2" /></>
                  )}
                </button>
              </div>

              {/* Security Badges */}
              <div className="mt-4 pt-4 border-t text-center">
                <div className="flex justify-center space-x-2 text-gray-500 text-xs">
                  <FiShield className="w-4 h-4" />
                  <span>Secure Payment</span>
                  <FiTruck className="w-4 h-4 ml-2" />
                  <span>Free Shipping over $50</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg max-w-md w-full p-6"
          >
            <h2 className="text-xl font-semibold mb-4">
              {paymentModal.type === 'bkash' ? 'bKash Payment' : 'Nagad Payment'}
            </h2>
            <p className="text-gray-600 mb-4">
              Please complete the payment and enter your transaction ID below.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount to Pay</label>
                <input
                  type="text"
                  value={`$${paymentModal.data?.amount || total}`}
                  disabled
                  className="input bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Transaction ID</label>
                <input
                  id="transactionId"
                  type="text"
                  placeholder="Enter transaction ID"
                  className="input"
                />
              </div>
              <button
                onClick={paymentModal.type === 'bkash' ? confirmBkashPayment : confirmNagadPayment}
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Processing...' : 'Confirm Payment'}
              </button>
              <button
                onClick={() => setPaymentModal({ show: false, type: '', data: null })}
                className="btn-secondary w-full"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;