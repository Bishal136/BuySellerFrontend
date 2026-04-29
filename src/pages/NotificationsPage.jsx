import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiPackage, FiTag, FiPercent, FiAlertCircle, FiCheckCircle,
  FiTrash2, FiCheck, FiBell, FiFilter, FiX
} from 'react-icons/fi';
import { 
  fetchNotifications, markAsRead, markAllAsRead, 
  deleteNotification, deleteAllNotifications 
} from '../redux/slices/notificationSlice';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, pagination, isLoading } = useSelector((state) => state.notifications);
  const [filter, setFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchNotificationsData();
  }, [filter]);

  const fetchNotificationsData = async () => {
    const params = { page: 1 };
    if (filter !== 'all') params.type = filter;
    await dispatch(fetchNotifications(params));
  };

  const handleMarkAsRead = async (id) => {
    await dispatch(markAsRead(id));
    toast.success('Marked as read');
  };

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllAsRead());
    toast.success('All notifications marked as read');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this notification?')) {
      await dispatch(deleteNotification(id));
      toast.success('Notification deleted');
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Delete all notifications? This cannot be undone.')) {
      await dispatch(deleteAllNotifications());
      toast.success('All notifications deleted');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'order':
        return <FiPackage className="w-6 h-6 text-blue-500" />;
      case 'price_drop':
        return <FiTag className="w-6 h-6 text-green-500" />;
      case 'promotion':
        return <FiPercent className="w-6 h-6 text-purple-500" />;
      case 'back_in_stock':
        return <FiAlertCircle className="w-6 h-6 text-orange-500" />;
      default:
        return <FiCheckCircle className="w-6 h-6 text-gray-500" />;
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All', icon: FiBell },
    { value: 'order', label: 'Orders', icon: FiPackage },
    { value: 'price_drop', label: 'Price Drops', icon: FiTag },
    { value: 'promotion', label: 'Promotions', icon: FiPercent },
    { value: 'back_in_stock', label: 'Back in Stock', icon: FiAlertCircle }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-gray-600 mt-1">Stay updated with your latest alerts</p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="btn-secondary flex items-center gap-2"
              >
                <FiCheck /> Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="btn-secondary flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <FiTrash2 /> Delete all
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
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
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FiBell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No notifications</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "You don't have any notifications yet" 
                : `No ${filter} notifications found`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-lg shadow-md p-5 transition-all ${
                  !notification.isRead ? 'border-l-4 border-primary-600' : ''
                }`}
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{notification.title}</h3>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                        {notification.data?.couponCode && (
                          <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-2 inline-block">
                            <p className="text-sm">
                              <span className="font-semibold">Coupon Code:</span>{' '}
                              <span className="font-mono font-bold text-primary-600">
                                {notification.data.couponCode}
                              </span>
                            </p>
                          </div>
                        )}
                        {notification.data?.discount && (
                          <p className="text-sm text-green-600 mt-1">
                            You save: ${notification.data.discount.toFixed(2)}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="text-primary-600 hover:text-primary-700 p-1"
                            title="Mark as read"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification._id)}
                          className="text-red-500 hover:text-red-600 p-1"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {notification.data?.link && (
                      <Link
                        to={notification.data.link}
                        className="inline-block mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View Details →
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              disabled={pagination.page === 1}
              onClick={() => dispatch(fetchNotifications({ page: pagination.page - 1, type: filter !== 'all' ? filter : null }))}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              disabled={pagination.page === pagination.pages}
              onClick={() => dispatch(fetchNotifications({ page: pagination.page + 1, type: filter !== 'all' ? filter : null }))}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;