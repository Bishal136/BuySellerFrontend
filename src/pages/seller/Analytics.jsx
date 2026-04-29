import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiTrendingUp, FiTrendingDown, FiDollarSign, 
  FiShoppingBag, FiUsers, FiPackage, FiCalendar,
  FiDownload, FiRefreshCw
} from 'react-icons/fi';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SellerAnalytics = () => {
  const [period, setPeriod] = useState('weekly');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/seller/analytics?period=${period}`);
      setAnalytics(response.data.analytics);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const periods = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const salesChartData = {
    labels: analytics?.salesData?.map(d => d._id) || [],
    datasets: [
      {
        label: 'Revenue',
        data: analytics?.salesData?.map(d => d.totalRevenue) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Orders',
        data: analytics?.salesData?.map(d => d.totalSales) || [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (context.dataset.label === 'Revenue') {
              return `${label}: $${context.raw.toFixed(2)}`;
            }
            return `${label}: ${context.raw}`;
          }
        }
      }
    }
  };

  const topProductsData = {
    labels: analytics?.topProducts?.map(p => p.product?.name?.slice(0, 15)) || [],
    datasets: [
      {
        label: 'Units Sold',
        data: analytics?.topProducts?.map(p => p.totalSold) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 8
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Sales Analytics
          </h1>
          <p className="text-gray-500 mt-1">Track your sales performance and insights</p>
        </div>
        <div className="flex gap-2">
          {periods.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-lg transition-all ${
                period === p.value
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
          <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200">
            <FiDownload className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">$12,450</p>
              <p className="text-blue-200 text-xs mt-2 flex items-center gap-1">
                <FiTrendingUp className="w-3 h-3" /> +12.5% vs last period
              </p>
            </div>
            <FiDollarSign className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm">Total Orders</p>
              <p className="text-2xl font-bold mt-1">342</p>
              <p className="text-green-200 text-xs mt-2 flex items-center gap-1">
                <FiTrendingUp className="w-3 h-3" /> +8.2% vs last period
              </p>
            </div>
            <FiShoppingBag className="w-8 h-8 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-sm">Total Customers</p>
              <p className="text-2xl font-bold mt-1">156</p>
              <p className="text-purple-200 text-xs mt-2 flex items-center gap-1">
                <FiTrendingUp className="w-3 h-3" /> +15 new
              </p>
            </div>
            <FiUsers className="w-8 h-8 text-purple-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-orange-100 text-sm">Avg Order Value</p>
              <p className="text-2xl font-bold mt-1">$36.40</p>
              <p className="text-orange-200 text-xs mt-2 flex items-center gap-1">
                <FiTrendingUp className="w-3 h-3" /> +3.2%
              </p>
            </div>
            <FiPackage className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Sales Trend</h2>
          <button className="text-gray-400 hover:text-gray-600">
            <FiRefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="h-80">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <Line data={salesChartData} options={options} />
          )}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Top Selling Products</h2>
          <div className="h-64">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <Bar data={topProductsData} options={{ responsive: true, maintainAspectRatio: false }} />
            )}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Sales by Category</h2>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <FiPackage className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Category data will appear here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <FiShoppingBag className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">New order received</p>
                <p className="text-sm text-gray-500">Order #ORD-{Math.random().toString(36).substr(2, 8).toUpperCase()} - $124.99</p>
              </div>
              <p className="text-xs text-gray-400">2 minutes ago</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SellerAnalytics;