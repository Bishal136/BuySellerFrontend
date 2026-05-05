import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Add this import
import { motion } from 'framer-motion';
import { 
  FiUsers, FiUserCheck, FiPackage, FiShoppingBag,
  FiDollarSign, FiTrendingUp, FiClock, FiCheckCircle,
  FiAlertCircle, FiEye
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data.stats);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: FiUsers, color: 'bg-blue-500', link: '/admin/users' },
    { title: 'Total Sellers', value: stats?.totalSellers || 0, icon: FiUserCheck, color: 'bg-green-500', link: '/admin/sellers' },
    { title: 'Total Products', value: stats?.totalProducts || 0, icon: FiPackage, color: 'bg-purple-500', link: '/admin/products' },
    { title: 'Total Orders', value: stats?.totalOrders || 0, icon: FiShoppingBag, color: 'bg-orange-500', link: '/admin/orders' },
    { title: 'Total Revenue', value: `BDT ${stats?.totalRevenue?.toFixed(2) || 0}`, icon: FiDollarSign, color: 'bg-yellow-500', link: '/admin/reports' },
    { title: 'Pending Sellers', value: stats?.pendingSellers || 0, icon: FiClock, color: 'bg-red-500', link: '/admin/sellers?status=pending' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, Admin!</h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your platform today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Link
            key={stat.title}
            to={stat.link}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow block"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pending Verifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Pending Verifications</h2>
            <FiAlertCircle className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium">Seller Verifications</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.pendingSellers || 0}</p>
              </div>
              <Link to="/admin/sellers?status=pending" className="text-primary-600 hover:text-primary-700">
                Review →
              </Link>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium">Pending Orders</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.pendingOrders || 0}</p>
              </div>
              <Link to="/admin/orders?status=pending" className="text-primary-600 hover:text-primary-700">
                Review →
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Revenue Summary</h2>
            <FiTrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Weekly Revenue</p>
                <p className="text-xl font-bold text-green-600">BDT {stats?.weeklyRevenue?.toFixed(2) || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-xl font-bold text-blue-600">BDT {stats?.monthlyRevenue?.toFixed(2) || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      {stats?.topProducts?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Top Selling Products</h2>
          <div className="space-y-3">
            {stats.topProducts.map((product, index) => (
              <div key={product._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 font-medium">#{index + 1}</span>
                  <img
                    src={product.images?.[0]?.url || 'https://placehold.co/40x40'}
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/40x40';
                    }}
                  />
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">${product.price?.toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{product.soldCount || 0} sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;