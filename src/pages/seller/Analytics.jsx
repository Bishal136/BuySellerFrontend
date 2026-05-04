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
  const [exporting, setExporting] = useState(false);

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
      console.error('Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Client-side CSV export
  const handleExport = () => {
    if (!analytics) {
      toast.error('No data to export');
      return;
    }

    setExporting(true);
    try {
      // Prepare CSV data
      const csvRows = [];
      
      // Headers
      csvRows.push(['Metric', 'Value'].join(','));
      csvRows.push(['Total Revenue (BDT)', analytics.summary?.totalRevenue || 0].join(','));
      csvRows.push(['Total Orders', analytics.summary?.totalOrders || 0].join(','));
      csvRows.push(['Total Customers', analytics.summary?.uniqueCustomers || 0].join(','));
      csvRows.push(['New Customers', analytics.summary?.newCustomers || 0].join(','));
      csvRows.push(['Average Order Value (BDT)', analytics.summary?.averageOrderValue || 0].join(','));
      csvRows.push(['Total Items Sold', analytics.summary?.totalItemsSold || 0].join(','));
      csvRows.push(['']);
      
      // Sales Data
      csvRows.push(['Sales Trend Data'].join(','));
      csvRows.push(['Period', 'Revenue (BDT)', 'Orders'].join(','));
      analytics?.salesData?.forEach(data => {
        csvRows.push([data._id, data.totalRevenue, data.totalSales].join(','));
      });
      csvRows.push(['']);
      
      // Top Products
      csvRows.push(['Top Selling Products'].join(','));
      csvRows.push(['Product Name', 'Units Sold', 'Revenue (BDT)'].join(','));
      analytics?.topProducts?.forEach(product => {
        csvRows.push([
          product.product?.name || 'Unknown',
          product.totalSold,
          product.totalRevenue
        ].join(','));
      });
      csvRows.push(['']);
      
      // Category Distribution
      csvRows.push(['Sales by Category'].join(','));
      csvRows.push(['Category', 'Revenue (BDT)'].join(','));
      analytics?.categoryDistribution?.forEach(category => {
        csvRows.push([category._id, category.totalRevenue].join(','));
      });
      csvRows.push(['']);
      
      // Recent Orders
      csvRows.push(['Recent Orders'].join(','));
      csvRows.push(['Order ID', 'Total Amount (BDT)', 'Date'].join(','));
      analytics?.recentOrders?.forEach(order => {
        csvRows.push([
          order.orderId,
          order.totalAmount,
          new Date(order.createdAt).toLocaleString()
        ].join(','));
      });
      
      // Create and download CSV file
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute('download', `analytics_${period}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Analytics exported successfully');
    } catch (error) {
      toast.error('Failed to export analytics');
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const periods = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  // Format currency in BDT
  const formatBDT = (amount) => {
    return `৳${amount?.toFixed(2) || '0.00'}`;
  };

  const salesChartData = {
    labels: analytics?.salesData?.map(d => {
      // Format date labels based on period
      if (period === 'daily') return new Date(d._id).toLocaleDateString();
      if (period === 'weekly') return `Week ${d._id}`;
      if (period === 'monthly') return new Date(2000, d._id - 1).toLocaleString('default', { month: 'short' });
      return d._id;
    }) || [],
    datasets: [
      {
        label: 'Revenue (BDT)',
        data: analytics?.salesData?.map(d => d.totalRevenue) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Orders',
        data: analytics?.salesData?.map(d => d.totalSales) || [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 8
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (context.dataset.label.includes('Revenue')) {
              return `${label}: ${formatBDT(context.raw)}`;
            }
            return `${label}: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Revenue (BDT)',
          color: 'rgb(59, 130, 246)'
        },
        ticks: {
          callback: function(value) {
            return formatBDT(value);
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Number of Orders',
          color: 'rgb(16, 185, 129)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    }
  };

  const topProductsData = {
    labels: analytics?.topProducts?.map(p => p.product?.name?.slice(0, 20)) || [],
    datasets: [
      {
        label: 'Units Sold',
        data: analytics?.topProducts?.map(p => p.totalSold) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 8,
        barPercentage: 0.7,
        categoryPercentage: 0.8
      }
    ]
  };

  const topProductsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Units Sold'
        }
      }
    }
  };

  const categoryData = {
    labels: analytics?.categoryDistribution?.map(c => c._id) || [],
    datasets: [
      {
        data: analytics?.categoryDistribution?.map(c => c.totalRevenue) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(6, 182, 212, 0.8)',
        ],
        borderWidth: 0,
      }
    ]
  };

  const categoryOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `${context.label}: ${formatBDT(context.raw)} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Calculate percentage change
  const getPercentageChange = (current, previous) => {
    if (!previous || previous === 0) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0
    };
  };

  const revenueChange = analytics?.comparison ? 
    getPercentageChange(analytics.summary.totalRevenue, analytics.comparison.totalRevenue) : 
    { value: 0, isPositive: true };
    
  const ordersChange = analytics?.comparison ?
    getPercentageChange(analytics.summary.totalOrders, analytics.comparison.totalOrders) :
    { value: 0, isPositive: true };

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
        <div className="flex gap-2 flex-wrap">
          {periods.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-lg transition-all ${period === p.value
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {p.label}
            </button>
          ))}
          <button 
            onClick={handleExport}
            disabled={exporting || !analytics}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            <FiDownload className={`w-5 h-5 text-gray-600 ${exporting ? 'animate-pulse' : ''}`} />
          </button>
          <button 
            onClick={fetchAnalytics}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            disabled={loading}
          >
            <FiRefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">
                {formatBDT(analytics?.summary?.totalRevenue)}
              </p>
              <p className="text-blue-200 text-xs mt-2 flex items-center gap-1">
                {revenueChange.isPositive ? (
                  <FiTrendingUp className="w-3 h-3" />
                ) : (
                  <FiTrendingDown className="w-3 h-3" />
                )}
                {revenueChange.value}% vs last {period}
              </p>
            </div>
            <FiDollarSign className="w-8 h-8 text-blue-200" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-5 text-white"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm">Total Orders</p>
              <p className="text-2xl font-bold mt-1">{analytics?.summary?.totalOrders || 0}</p>
              <p className="text-green-200 text-xs mt-2 flex items-center gap-1">
                {ordersChange.isPositive ? (
                  <FiTrendingUp className="w-3 h-3" />
                ) : (
                  <FiTrendingDown className="w-3 h-3" />
                )}
                {ordersChange.value}% vs last {period}
              </p>
            </div>
            <FiShoppingBag className="w-8 h-8 text-green-200" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-5 text-white"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-sm">Total Customers</p>
              <p className="text-2xl font-bold mt-1">{analytics?.summary?.uniqueCustomers || 0}</p>
              <p className="text-purple-200 text-xs mt-2 flex items-center gap-1">
                <FiUsers className="w-3 h-3" /> {analytics?.summary?.newCustomers || 0} new this period
              </p>
            </div>
            <FiUsers className="w-8 h-8 text-purple-200" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-5 text-white"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-orange-100 text-sm">Avg Order Value</p>
              <p className="text-2xl font-bold mt-1">
                {formatBDT(analytics?.summary?.averageOrderValue)}
              </p>
              <p className="text-orange-200 text-xs mt-2 flex items-center gap-1">
                <FiPackage className="w-3 h-3" /> 
                {analytics?.summary?.totalItemsSold || 0} items sold
              </p>
            </div>
            <FiPackage className="w-8 h-8 text-orange-200" />
          </div>
        </motion.div>
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Sales Trend</h2>
          <button 
            onClick={fetchAnalytics}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="h-80">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : analytics?.salesData?.length > 0 ? (
            <Line data={salesChartData} options={options} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <FiPackage className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No sales data available for this period</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Top Selling Products</h2>
          <div className="h-80">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : analytics?.topProducts?.length > 0 ? (
              <Bar data={topProductsData} options={topProductsOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <FiPackage className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No product data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Sales by Category</h2>
          <div className="h-80">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : analytics?.categoryDistribution?.length > 0 ? (
              <Doughnut data={categoryData} options={categoryOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <FiPackage className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No category data available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : analytics?.recentOrders?.length > 0 ? (
            analytics.recentOrders.map((order, i) => (
              <motion.div 
                key={order._id || i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <FiShoppingBag className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">New order received</p>
                  <p className="text-sm text-gray-500">
                    Order #{order.orderId} - {formatBDT(order.totalAmount)}
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                </p>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FiShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No recent orders</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerAnalytics;