import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPackage, FiTruck, FiCheckCircle, FiClock, 
  FiMapPin, FiCreditCard, FiDownload, FiRefreshCw,
  FiXCircle, FiAlertCircle, FiMessageSquare, FiArrowLeft,
  FiUser, FiMail, FiPhone, FiCalendar, FiDollarSign,
  FiChevronDown, FiChevronUp, FiStar, FiPrinter
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [returnItemId, setReturnItemId] = useState('');
  const [returnQuantity, setReturnQuantity] = useState(1);
  const [returnComments, setReturnComments] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    items: true,
    shipping: true,
    payment: true,
    timeline: true
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (id) {
      fetchOrderDetails();
      fetchTrackingInfo();
    }
  }, [id, isAuthenticated]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data.order);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error(error.response?.data?.message || 'Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackingInfo = async () => {
    try {
      const response = await api.get(`/orders/${id}/track`);
      setTrackingInfo(response.data.tracking);
    } catch (error) {
      console.error('Failed to load tracking:', error);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      await api.put(`/orders/${id}/cancel`, { reason: cancelReason });
      toast.success('Order cancelled successfully');
      setShowCancelModal(false);
      fetchOrderDetails();
      fetchTrackingInfo();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleReturnRequest = async () => {
    if (!returnReason) {
      toast.error('Please select a reason for return');
      return;
    }

    try {
      await api.post(`/orders/${id}/return`, {
        reason: returnReason,
        itemId: returnItemId,
        quantity: returnQuantity,
        comments: returnComments
      });
      toast.success('Return request submitted successfully');
      setShowReturnModal(false);
      fetchOrderDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit return request');
    }
  };

  const downloadInvoice = async () => {
    try {
      const response = await api.get(`/orders/${id}/invoice`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      processing: 'bg-purple-100 text-purple-800 border-purple-200',
      shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      out_for_delivery: 'bg-orange-100 text-orange-800 border-orange-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      refunded: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FiClock className="w-5 h-5" />,
      confirmed: <FiCheckCircle className="w-5 h-5" />,
      processing: <FiPackage className="w-5 h-5" />,
      shipped: <FiTruck className="w-5 h-5" />,
      out_for_delivery: <FiTruck className="w-5 h-5" />,
      delivered: <FiCheckCircle className="w-5 h-5" />,
      cancelled: <FiXCircle className="w-5 h-5" />,
      refunded: <FiRefreshCw className="w-5 h-5" />
    };
    return icons[status] || <FiPackage className="w-5 h-5" />;
  };

  const getStatusMessage = (status) => {
    const messages = {
      pending: 'Your order has been placed and is awaiting confirmation.',
      confirmed: 'Your order has been confirmed and is being processed.',
      processing: 'Your order is being prepared for shipment.',
      shipped: 'Your order has been shipped and is on its way.',
      out_for_delivery: 'Your order is out for delivery!',
      delivered: 'Your order has been delivered. Hope you enjoy your purchase!',
      cancelled: 'This order has been cancelled.',
      refunded: 'This order has been refunded.'
    };
    return messages[status] || 'Your order is being processed.';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
          <Link to="/orders" className="btn-primary">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const canCancel = ['pending', 'confirmed'].includes(order.status);
  const canReturn = order.status === 'delivered' && !order.returnRequest;
  const hasReturnRequest = order.returnRequest && order.returnRequest.status !== 'rejected';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Back Button */}
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6 transition-colors"
        >
          <FiArrowLeft /> Back to Orders
        </button>

        {/* Order Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-2xl font-bold">Order #{order._id?.slice(-8)}</h1>
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status?.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-gray-600 flex items-center gap-2">
                <FiCalendar className="w-4 h-4" />
                Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>
            
            <div className="flex gap-3 flex-wrap">
              {canCancel && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <FiXCircle /> Cancel Order
                </button>
              )}
              {canReturn && (
                <button
                  onClick={() => setShowReturnModal(true)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <FiRefreshCw /> Return Items
                </button>
              )}
              <button
                onClick={downloadInvoice}
                className="btn-primary flex items-center gap-2"
              >
                <FiDownload /> Invoice
              </button>
              <button
                onClick={handlePrint}
                className="btn-secondary flex items-center gap-2"
              >
                <FiPrinter /> Print
              </button>
            </div>
          </div>
          
          {/* Status Message */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">{getStatusMessage(order.status)}</p>
          </div>
        </motion.div>

        {/* Order Status Timeline */}
        {trackingInfo && trackingInfo.timeline && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-md p-6 mb-6"
          >
            <button
              onClick={() => toggleSection('timeline')}
              className="flex justify-between items-center w-full"
            >
              <h2 className="text-xl font-semibold">Order Status Timeline</h2>
              {expandedSections.timeline ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            
            {expandedSections.timeline && (
              <div className="mt-6">
                <div className="relative">
                  {trackingInfo.timeline.map((step, index) => (
                    <div key={step.status} className="flex mb-8 last:mb-0">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          step.completed 
                            ? 'bg-green-500 text-white shadow-lg' 
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {step.completed ? <FiCheckCircle className="w-5 h-5" /> : <FiClock className="w-5 h-5" />}
                        </div>
                        {index < trackingInfo.timeline.length - 1 && (
                          <div className={`absolute top-10 left-5 w-0.5 h-16 transition-all duration-300 ${
                            trackingInfo.timeline[index + 1]?.completed ? 'bg-green-500' : 'bg-gray-200'
                          }`} />
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-semibold text-lg">{step.status}</h3>
                        <p className="text-gray-600 mt-1">{step.description}</p>
                        {step.timestamp && (
                          <p className="text-sm text-gray-400 mt-2 flex items-center gap-1">
                            <FiClock className="w-3 h-3" />
                            {new Date(step.timestamp).toLocaleString()}
                          </p>
                        )}
                        {step.trackingNumber && step.carrier && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-semibold">Tracking Information:</p>
                            <p className="text-sm text-gray-600">Carrier: {step.carrier}</p>
                            <p className="text-sm text-gray-600">Tracking Number: {step.trackingNumber}</p>
                            <button 
                              onClick={() => window.open(`https://www.google.com/search?q=track+${step.carrier}+${step.trackingNumber}`, '_blank')}
                              className="text-primary-600 text-sm mt-1 hover:underline"
                            >
                              Track Package →
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <button
                onClick={() => toggleSection('items')}
                className="flex justify-between items-center w-full mb-4"
              >
                <h2 className="text-xl font-semibold">Order Items ({order.orderItems?.length || 0})</h2>
                {expandedSections.items ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              
              {expandedSections.items && (
                <div className="space-y-4">
                  {order.orderItems?.map((item, idx) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex gap-4 pb-4 border-b last:border-0"
                    >
                      <img
                        src={item.product?.images?.[0]?.url || item.image || 'https://via.placeholder.com/100'}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <Link 
                          to={`/product/${item.product?.slug || item.product?._id}`}
                          className="font-semibold hover:text-primary-600 transition-colors line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        {item.product?.brand && (
                          <p className="text-sm text-gray-500 mt-1">Brand: {item.product.brand}</p>
                        )}
                        <div className="flex flex-wrap gap-4 mt-2">
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-sm text-gray-600">Price: ${item.price?.toFixed(2)}</p>
                          <p className="text-sm font-semibold text-primary-600">
                            Total: ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        {order.status === 'delivered' && !hasReturnRequest && (
                          <button
                            onClick={() => {
                              setReturnItemId(item._id);
                              setReturnQuantity(item.quantity);
                              setShowReturnModal(true);
                            }}
                            className="text-sm text-red-600 hover:text-red-700 mt-2 flex items-center gap-1"
                          >
                            <FiRefreshCw className="w-3 h-3" /> Return this item
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-md p-6 mb-6"
            >
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${order.itemsPrice?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>${order.shippingPrice?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span>${order.taxPrice?.toFixed(2)}</span>
                </div>
                {order.discountPrice > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${order.discountPrice?.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary-600">${order.totalPrice?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Payment Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-md p-6 mb-6"
            >
              <button
                onClick={() => toggleSection('payment')}
                className="flex justify-between items-center w-full"
              >
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FiCreditCard className="w-5 h-5" />
                  Payment Information
                </h2>
                {expandedSections.payment ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              
              {expandedSections.payment && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium capitalize">{order.paymentMethod?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${order.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                      {order.isPaid ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                  {order.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paid on:</span>
                      <span>{new Date(order.paidAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  {order.paymentResult?.transactionId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-mono text-sm">{order.paymentResult.transactionId}</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Shipping Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <button
                onClick={() => toggleSection('shipping')}
                className="flex justify-between items-center w-full"
              >
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FiMapPin className="w-5 h-5" />
                  Shipping Address
                </h2>
                {expandedSections.shipping ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              
              {expandedSections.shipping && order.shippingAddress && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <FiUser className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span>{order.shippingAddress.name}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FiMail className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span>{order.shippingAddress.email}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FiPhone className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span>{order.shippingAddress.phone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FiMapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p>{order.shippingAddress.street}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Return Request Status */}
            {hasReturnRequest && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-orange-50 rounded-lg shadow-md p-6 mt-6 border border-orange-200"
              >
                <div className="flex items-center gap-2 mb-3">
                  <FiRefreshCw className="w-5 h-5 text-orange-600" />
                  <h3 className="font-semibold text-orange-800">Return Request Status</h3>
                </div>
                <p className="text-sm text-orange-700 mb-2">
                  Status: <span className="font-semibold capitalize">{order.returnRequest?.status}</span>
                </p>
                <p className="text-sm text-orange-700">
                  Requested on: {new Date(order.returnRequest?.requestedAt).toLocaleDateString()}
                </p>
                {order.returnRequest?.refundAmount && (
                  <p className="text-sm text-orange-700 mt-2">
                    Refund Amount: <span className="font-semibold">${order.returnRequest.refundAmount.toFixed(2)}</span>
                  </p>
                )}
                {order.returnRequest?.adminComments && (
                  <p className="text-sm text-orange-700 mt-2">
                    Admin Note: {order.returnRequest.adminComments}
                  </p>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <FiAlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold">Cancel Order</h2>
              </div>
              
              <p className="text-gray-600 mb-4">
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Reason for cancellation</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please tell us why you're cancelling..."
                  className="input"
                  rows="3"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleCancelOrder}
                  className="btn-primary flex-1 bg-red-600 hover:bg-red-700"
                >
                  Yes, Cancel Order
                </button>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="btn-secondary flex-1"
                >
                  No, Keep Order
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Return Request Modal */}
      <AnimatePresence>
        {showReturnModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowReturnModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiRefreshCw className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold">Return Items</h2>
              </div>
              
              <p className="text-gray-600 mb-4">
                Please provide details about the items you want to return.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Reason for return *</label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="input"
                  >
                    <option value="">Select a reason...</option>
                    <option value="defective">Product is defective / damaged</option>
                    <option value="wrong_item">Wrong item received</option>
                    <option value="size_issue">Size doesn't fit</option>
                    <option value="not_as_described">Not as described</option>
                    <option value="changed_mind">Changed my mind</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Quantity</label>
                  <input
                    type="number"
                    value={returnQuantity}
                    onChange={(e) => setReturnQuantity(parseInt(e.target.value))}
                    min="1"
                    max={order.orderItems?.find(i => i._id === returnItemId)?.quantity || 1}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Additional Comments</label>
                  <textarea
                    value={returnComments}
                    onChange={(e) => setReturnComments(e.target.value)}
                    placeholder="Any additional information..."
                    className="input"
                    rows="3"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleReturnRequest}
                  className="btn-primary flex-1"
                >
                  Submit Request
                </button>
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderDetailsPage;