import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPackage,
  FiTruck,
  FiMapPin,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiSearch,
  FiFilter,
  FiDownload,
  FiPrinter,
  FiEye,
  FiSend,
  FiAlertCircle,
  FiRefreshCw,
  FiChevronRight,
  FiUser,
  FiPhone,
  FiMail,
  FiCalendar
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const SellerShipping = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierService, setCourierService] = useState('');
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/seller/orders/shipping');
      setOrders(response.data.orders);
      calculateStats(response.data.orders);
    } catch (error) {
      toast.error('Failed to load orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ordersData) => {
    const newStats = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };
    
    ordersData.forEach(order => {
      if (order.shippingStatus === 'pending') newStats.pending++;
      else if (order.shippingStatus === 'processing') newStats.processing++;
      else if (order.shippingStatus === 'shipped') newStats.shipped++;
      else if (order.shippingStatus === 'delivered') newStats.delivered++;
      else if (order.shippingStatus === 'cancelled') newStats.cancelled++;
    });
    
    setStats(newStats);
  };

  const updateShippingStatus = async (orderId, status, trackingInfo = null) => {
    setUpdating(true);
    try {
      const updateData = {
        shippingStatus: status,
        ...(trackingInfo && { trackingInfo })
      };
      
      const response = await api.put(`/seller/orders/${orderId}/shipping`, updateData);
      
      // Update local state
      setOrders(orders.map(order => 
        order._id === orderId ? response.data.order : order
      ));
      
      // Recalculate stats
      calculateStats(orders.map(order => 
        order._id === orderId ? response.data.order : order
      ));
      
      toast.success(`Order ${status === 'shipped' ? 'marked as shipped' : 'updated'} successfully`);
      
      if (status === 'shipped') {
        setShowTrackingModal(false);
        setTrackingNumber('');
        setCourierService('');
      }
    } catch (error) {
      toast.error('Failed to update shipping status');
      console.error('Error updating shipping:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleShipOrder = async () => {
    if (!trackingNumber || !courierService) {
      toast.error('Please provide tracking number and courier service');
      return;
    }
    
    await updateShippingStatus(selectedOrder._id, 'shipped', {
      trackingNumber,
      courierService,
      estimatedDelivery: getEstimatedDeliveryDate(),
      trackingUrl: generateTrackingUrl(courierService, trackingNumber)
    });
  };

  const getEstimatedDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 3); // 3 days estimated delivery
    return date.toISOString();
  };

  const generateTrackingUrl = (courier, tracking) => {
    const urls = {
      'sundarban': `https://sundarban.com/track/${tracking}`,
      's a paribahan': `https://saparbahan.com/track/${tracking}`,
      'pathao': `https://pathao.com/track/${tracking}`,
      'redx': `https://redx.com.bd/track/${tracking}`,
      'paperfly': `https://paperfly.com.bd/track/${tracking}`
    };
    return urls[courier.toLowerCase()] || '#';
  };

  const printShippingLabel = async (orderId) => {
    try {
      const response = await api.get(`/seller/orders/${orderId}/shipping-label`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `shipping-label-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Shipping label downloaded');
    } catch (error) {
      toast.error('Failed to generate shipping label');
    }
  };

  const formatBDT = (amount) => {
    return `৳${amount?.toFixed(2) || '0.00'}`;
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: FiClock, text: 'Pending' },
      processing: { color: 'bg-blue-100 text-blue-800', icon: FiPackage, text: 'Processing' },
      shipped: { color: 'bg-purple-100 text-purple-800', icon: FiTruck, text: 'Shipped' },
      delivered: { color: 'bg-green-100 text-green-800', icon: FiCheckCircle, text: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: FiXCircle, text: 'Cancelled' }
    };
    
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.shippingStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const courierOptions = [
    { value: 'sundarban', label: 'Sundarban Courier' },
    { value: 's a paribahan', label: 'S.A. Paribahan' },
    { value: 'pathao', label: 'Pathao' },
    { value: 'redx', label: 'Redx' },
    { value: 'paperfly', label: 'Paperfly' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Shipping Management
          </h1>
          <p className="text-gray-500 mt-1">Manage your orders and shipping process</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchOrders}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-2"
            disabled={loading}
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors flex items-center gap-2">
            <FiDownload className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <FiClock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Processing</p>
              <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <FiPackage className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Shipped</p>
              <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <FiTruck className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Delivered</p>
              <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <FiCheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <FiXCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg capitalize transition-all ${
                  statusFilter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <FiPackage className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No orders found</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">#{order.orderId}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <FiUser className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium">{order.customer?.name}</div>
                          <div className="text-xs text-gray-500">{order.customer?.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{order.items?.length || 0} items</div>
                      <div className="text-xs text-gray-500">
                        {order.items?.slice(0, 2).map(item => item.name).join(', ')}
                        {order.items?.length > 2 && '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{formatBDT(order.totalAmount)}</div>
                      <div className="text-xs text-gray-500">
                        {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.shippingStatus)}
                      {order.trackingInfo?.trackingNumber && (
                        <div className="text-xs text-gray-500 mt-1">
                          Tracking: {order.trackingInfo.trackingNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {order.shippingStatus === 'pending' && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowTrackingModal(true);
                            }}
                            className="px-3 py-1 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors flex items-center gap-1"
                          >
                            <FiSend className="w-3 h-3" />
                            Ship
                          </button>
                        )}
                        {order.shippingStatus === 'processing' && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowTrackingModal(true);
                            }}
                            className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors flex items-center gap-1"
                          >
                            <FiTruck className="w-3 h-3" />
                            Add Tracking
                          </button>
                        )}
                        {(order.shippingStatus === 'shipped' || order.shippingStatus === 'delivered') && (
                          <button
                            onClick={() => printShippingLabel(order._id)}
                            className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors flex items-center gap-1"
                          >
                            <FiPrinter className="w-3 h-3" />
                            Label
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center gap-1"
                        >
                          <FiEye className="w-3 h-3" />
                          Details
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && !showTrackingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <FiXCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-medium">#{selectedOrder.orderId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Order Date</p>
                    <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium capitalize">{selectedOrder.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Shipping Status</p>
                    {getStatusBadge(selectedOrder.shippingStatus)}
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold mb-3">Customer Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <FiUser className="w-4 h-4 text-gray-500" />
                      <span>{selectedOrder.customer?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiPhone className="w-4 h-4 text-gray-500" />
                      <span>{selectedOrder.customer?.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiMail className="w-4 h-4 text-gray-500" />
                      <span>{selectedOrder.customer?.email}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <FiMapPin className="w-4 h-4 text-gray-500 mt-1" />
                      <span>{selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.zipCode}</span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="font-semibold mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={item.image || '/placeholder.png'}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatBDT(item.price)}</p>
                          <p className="text-sm text-gray-500">Total: {formatBDT(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatBDT(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping Fee</span>
                      <span>{formatBDT(selectedOrder.shippingFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>{formatBDT(selectedOrder.tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span className="text-primary-600">{formatBDT(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shipping Modal */}
      <AnimatePresence>
        {showTrackingModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTrackingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <FiTruck className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Ship Order</h2>
                    <p className="text-sm text-gray-500">Order #{selectedOrder.orderId}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Courier Service *
                    </label>
                    <select
                      value={courierService}
                      onChange={(e) => setCourierService(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select courier service</option>
                      {courierOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tracking Number *
                    </label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Enter tracking number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex gap-2">
                      <FiAlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                      <p className="text-sm text-yellow-800">
                        Make sure to enter the correct tracking number. This will be shared with the customer.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowTrackingModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleShipOrder}
                    disabled={updating || !trackingNumber || !courierService}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {updating ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <FiSend className="w-4 h-4" />
                        Confirm Shipment
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SellerShipping;