import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  FiPackage, FiDollarSign, FiShoppingBag, FiUsers,
  FiTruck, FiCheckCircle, FiClock, FiXCircle,
  FiTrendingUp, FiTrendingDown, FiRefreshCw
} from 'react-icons/fi';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import RecentOrdersTable from '../../components/seller/RecentOrdersTable';
import LowStockAlert from '../../components/seller/LowStockAlert';
import SalesChart from '../../components/seller/SalesChart';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SellerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('weekly');

  useEffect(() => {
    fetchDashboardData();
    fetchAnalytics();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/seller/dashboard');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get(`/seller/analytics?period=${period}`);
      // Handle analytics data
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: `BDT ${stats?.totalRevenue?.toFixed(2) || '0'}`,
      icon: FiDollarSign,
      color: 'bg-green-500',
      change: '+12.5%',
      trend: 'up'
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: FiShoppingBag,
      color: 'bg-blue-500',
      change: '+8.2%',
      trend: 'up'
    },
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: FiPackage,
      color: 'bg-purple-500',
      change: '+5',
      trend: 'up'
    },
    {
      title: 'Total Sales',
      value: stats?.totalSales || 0,
      icon: FiTrendingUp,
      color: 'bg-orange-500',
      change: '+15.3%',
      trend: 'up'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Seller Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? <FiTrendingUp /> : <FiTrendingDown />}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Order Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Pending', value: stats?.pendingOrders || 0, icon: FiClock, color: 'bg-yellow-100 text-yellow-600' },
            { label: 'Processing', value: stats?.processingOrders || 0, icon: FiRefreshCw, color: 'bg-blue-100 text-blue-600' },
            { label: 'Shipped', value: stats?.shippedOrders || 0, icon: FiTruck, color: 'bg-purple-100 text-purple-600' },
            { label: 'Delivered', value: stats?.deliveredOrders || 0, icon: FiCheckCircle, color: 'bg-green-100 text-green-600' },
            { label: 'Cancelled', value: stats?.cancelledOrders || 0, icon: FiXCircle, color: 'bg-red-100 text-red-600' }
          ].map((status, index) => (
            <motion.div
              key={status.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="bg-white rounded-lg shadow-md p-4 text-center"
            >
              <div className={`w-10 h-10 ${status.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                <status.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">{status.value}</p>
              <p className="text-sm text-gray-600">{status.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sales Chart */}
          <div className="lg:col-span-2">
            <SalesChart period={period} onPeriodChange={setPeriod} />
          </div>

          {/* Low Stock Alerts */}
          <div>
            <LowStockAlert />
          </div>
        </div>

        {/* Recent Orders */}
        <div className="mt-8">
          <RecentOrdersTable />
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;