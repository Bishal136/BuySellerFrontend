import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  FiPackage, FiEye, FiClock, FiCheckCircle, 
  FiTruck, FiMapPin, FiDollarSign, FiRefreshCw,
  FiSearch, FiFilter, FiChevronLeft, FiChevronRight,
  FiCalendar, FiStar, FiShoppingBag, FiXCircle
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const OrdersPage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10
  });

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    fetchOrders();
    fetchOrderStats();
  }, [isAuthenticated, filter, pagination.page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filter !== 'all' && { status: filter })
      });
      const response = await api.get(`/orders?${params}`);
      setOrders(response.data.orders);
      setPagination(prev => ({
        ...prev,
        pages: response.data.pagination.pages,
        total: response.data.pagination.total
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const response = await api.get('/orders/stats/summary');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      out_for_delivery: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FiClock className="w-4 h-4" />,
      confirmed: <FiCheckCircle className="w-4 h-4" />,
      processing: <FiRefreshCw className="w-4 h-4" />,
      shipped: <FiTruck className="w-4 h-4" />,
      out_for_delivery: <FiTruck className="w-4 h-4" />,
      delivered: <FiCheckCircle className="w-4 h-4" />,
      cancelled: <FiXCircle className="w-4 h-4" />,
      refunded: <FiRefreshCw className="w-4 h-4" />
    };
    return icons[status] || <FiPackage className="w-4 h-4" />;
  };

  const getStatusLabel = (status) => {
    return status?.replace('_', ' ').toUpperCase() || 'UNKNOWN';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredOrders = orders.filter(order =>
    order._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filterOptions = [
    { value: 'all', label: 'All Orders', icon: FiPackage, count: stats.totalOrders },
    { value: 'pending', label: 'Pending', icon: FiClock, count: stats.pendingOrders },
    { value: 'confirmed', label: 'Confirmed', icon: FiCheckCircle, count: 0 },
    { value: 'processing', label: 'Processing', icon: FiRefreshCw, count: 0 },
    { value: 'shipped', label: 'Shipped', icon: FiTruck, count: 0 },
    { value: 'delivered', label: 'Delivered', icon: FiCheckCircle, count: stats.deliveredOrders },
    { value: 'cancelled', label: 'Cancelled', icon: FiXCircle, count: stats.cancelledOrders }
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <FiShoppingBag className="w-5 h-5 text-primary-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Spent</p>
                <p className="text-2xl font-bold">${stats.totalSpent?.toFixed(2)}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FiDollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Delivered</p>
                <p className="text-2xl font-bold">{stats.deliveredOrders}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FiCheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Cancelled</p>
                <p className="text-2xl font-bold">{stats.cancelledOrders}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <FiXCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    filter === option.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <option.icon className="w-4 h-4" />
                  <span>{option.label}</span>
                  {option.count > 0 && (
                    <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                      filter === option.value
                        ? 'bg-white text-primary-600'
                        : 'bg-gray-300 text-gray-700'
                    }`}>
                      {option.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full md:w-64"
              />
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading orders...</p>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? `No orders matching "${searchTerm}"` 
                : filter !== 'all' 
                  ? `You don't have any ${filter} orders` 
                  : "You haven't placed any orders yet"}
            </p>
            {!searchTerm && filter === 'all' && (
              <Link to="/products" className="btn-primary inline-flex items-center gap-2">
                <FiShoppingBag /> Start Shopping
              </Link>
            )}
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="btn-secondary inline-flex items-center gap-2"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {filteredOrders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b flex flex-wrap justify-between items-center gap-4">
                    <div className="flex flex-wrap gap-6 items-center">
                      <div>
                        <p className="text-xs text-gray-500">Order ID</p>
                        <p className="font-mono font-semibold text-sm">#{order._id?.slice(-8)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Placed on</p>
                        <p className="font-semibold text-sm flex items-center gap-1">
                          <FiCalendar className="w-3 h-3" />
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Amount</p>
                        <p className="font-bold text-primary-600">${order.totalPrice?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/orders/${order._id}`}
                      className="btn-secondary text-sm flex items-center gap-2"
                    >
                      <FiEye /> View Details
                    </Link>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-6">
                    <div className="flex flex-wrap gap-4">
                      {order.orderItems?.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <img
                            src={item.product?.images?.[0]?.url || item.image || 'https://via.placeholder.com/60'}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium text-sm line-clamp-1 max-w-[200px]">{item.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            <p className="text-xs font-semibold text-primary-600">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                      {order.orderItems?.length > 3 && (
                        <div className="flex items-center text-gray-500 text-sm">
                          +{order.orderItems.length - 3} more items
                        </div>
                      )}
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="mt-4 pt-4 border-t flex gap-3">
                      {order.status === 'pending' && (
                        <button
                          onClick={async () => {
                            if (window.confirm('Cancel this order?')) {
                              try {
                                await api.put(`/orders/${order._id}/cancel`, { reason: 'Cancelled by customer' });
                                toast.success('Order cancelled');
                                fetchOrders();
                                fetchOrderStats();
                              } catch (error) {
                                toast.error('Failed to cancel order');
                              }
                            }
                          }}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Cancel Order
                        </button>
                      )}
                      {order.status === 'delivered' && !order.returnRequest && (
                        <Link
                          to={`/orders/${order._id}`}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Request Return
                        </Link>
                      )}
                      <Link
                        to={`/orders/${order._id}`}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                        className={`w-10 h-10 rounded-lg transition-colors ${
                          pagination.page === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;