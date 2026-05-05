import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiEye, FiTruck, FiCheckCircle, FiXCircle, FiClock,
  FiSearch, FiPackage, FiDownload, FiPrinter, FiFilter,
  FiCalendar, FiChevronDown, FiChevronUp, FiRefreshCw
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState({ trackingNumber: '', carrier: '' });
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, dateRange]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/seller/orders', {
        params: { 
          status: statusFilter !== 'all' ? statusFilter : undefined,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });
      setOrders(response.data.orders);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/seller/orders/${orderId}/status`, { status });
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const addTracking = async (orderId) => {
    if (!trackingInfo.trackingNumber) {
      toast.error('Please enter tracking number');
      return;
    }
    try {
      await api.put(`/seller/orders/${orderId}/status`, {
        status: 'shipped',
        trackingNumber: trackingInfo.trackingNumber,
        carrier: trackingInfo.carrier
      });
      toast.success('Tracking info added');
      setShowTrackingModal(false);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to add tracking');
    }
  };

  const generateShippingLabel = async (orderId) => {
    try {
      const response = await api.post(`/seller/orders/${orderId}/shipping-label`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `shipping-label-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Shipping label downloaded');
    } catch (error) {
      toast.error('Failed to generate label');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: FiClock, label: 'Pending' },
      processing: { color: 'bg-blue-100 text-blue-800', icon: FiRefreshCw, label: 'Processing' },
      shipped: { color: 'bg-purple-100 text-purple-800', icon: FiTruck, label: 'Shipped' },
      delivered: { color: 'bg-green-100 text-green-800', icon: FiCheckCircle, label: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: FiXCircle, label: 'Cancelled' }
    };
    return badges[status] || badges.pending;
  };

  const statusOptions = [
    { value: 'all', label: 'All Orders', count: orders.length },
    { value: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
    { value: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length },
    { value: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
    { value: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
    { value: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length }
  ];

  const filteredOrders = orders.filter(order =>
    order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Order Management
          </h1>
          <p className="text-gray-500 mt-1">Manage and track customer orders</p>
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <FiRefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {statusOptions.filter(s => s.value !== 'all').map(stat => (
          <div
            key={stat.value}
            className={`bg-white rounded-xl shadow-sm p-4 border-2 transition-all cursor-pointer ${
              statusFilter === stat.value ? 'border-primary-500 bg-primary-50' : 'border-gray-100'
            }`}
            onClick={() => setStatusFilter(stat.value)}
          >
            <p className="text-2xl font-bold">{stat.count}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <FiCalendar className="w-4 h-4" />
              {dateRange.startDate ? `${dateRange.startDate} - ${dateRange.endDate}` : 'Select Date Range'}
            </button>
            {showDatePicker && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border p-4 z-10 min-w-[300px]">
                <div className="space-y-3">
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <button
                    onClick={() => setDateRange({ startDate: '', endDate: '' })}
                    className="text-sm text-red-600"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <FiPackage className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No orders found</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, index) => {
                    const statusBadge = getStatusBadge(order.status);
                    const StatusIcon = statusBadge.icon;
                    return (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono text-sm font-medium text-gray-800">#{order.orderId?.slice(-8)}</td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-800">{order.customer?.name}</p>
                            <p className="text-xs text-gray-500">{order.customer?.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{order.items?.length} items</td>
                        <td className="px-6 py-4 font-semibold text-gray-800">BDT {order.totalAmount?.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                              className={`text-sm px-3 py-1 rounded-full font-semibold appearance-none cursor-pointer ${statusBadge.color}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {order.status === 'processing' && (
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowTrackingModal(true);
                                }}
                                className="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                                title="Add tracking"
                              >
                                <FiTruck className="w-4 h-4" />
                              </button>
                            )}
                            {order.status === 'shipped' && (
                              <button
                                onClick={() => generateShippingLabel(order._id)}
                                className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                title="Shipping label"
                              >
                                <FiPrinter className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => window.open(`/orders/${order._id}`, '_blank')}
                              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                              title="View details"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tracking Modal */}
      <AnimatePresence>
        {showTrackingModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-md w-full"
            >
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">Add Tracking Information</h2>
                <p className="text-gray-500 text-sm mt-1">Order #{selectedOrder.orderId?.slice(-8)}</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Carrier</label>
                  <select
                    value={trackingInfo.carrier}
                    onChange={(e) => setTrackingInfo({...trackingInfo, carrier: e.target.value})}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select carrier</option>
                    <option value="UPS">UPS</option>
                    <option value="FedEx">FedEx</option>
                    <option value="DHL">DHL</option>
                    <option value="USPS">USPS</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tracking Number</label>
                  <input
                    type="text"
                    value={trackingInfo.trackingNumber}
                    onChange={(e) => setTrackingInfo({...trackingInfo, trackingNumber: e.target.value})}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter tracking number"
                  />
                </div>
              </div>
              <div className="p-6 border-t bg-gray-50 flex gap-3">
                <button onClick={() => addTracking(selectedOrder._id)} className="btn-primary flex-1">
                  Save Tracking
                </button>
                <button onClick={() => setShowTrackingModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SellerOrders;