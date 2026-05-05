import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiDownload, FiCalendar, FiDollarSign, 
  FiShoppingBag, FiUsers, FiPackage, FiTrendingUp
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const SellerReports = () => {
  const [reportType, setReportType] = useState('revenue');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [revenueData, setRevenueData] = useState([]);
  const [summary, setSummary] = useState({ totalRevenue: 0, totalOrders: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (reportType === 'revenue') {
      fetchRevenueReport();
    }
  }, [dateRange]);

  const fetchRevenueReport = async () => {
    setLoading(true);
    try {
      const response = await api.get('/seller/reports/revenue', {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          groupBy: 'day'
        }
      });
      setRevenueData(response.data.revenueData);
      setSummary(response.data.summary);
    } catch (error) {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const response = await api.get('/seller/reports/export', {
        params: {
          type: reportType === 'revenue' ? 'orders' : 'products',
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}-report-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report exported');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-gray-600">Generate and export business reports</p>
        </div>
        <button onClick={exportReport} className="btn-primary flex items-center gap-2">
          <FiDownload /> Export Report
        </button>
      </div>

      {/* Report Type Tabs */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex gap-2">
          {[
            { id: 'revenue', label: 'Revenue Report', icon: FiDollarSign },
            { id: 'products', label: 'Product Performance', icon: FiPackage },
            { id: 'customers', label: 'Customer Insights', icon: FiUsers }
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setReportType(type.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                reportType === type.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <type.icon className="w-5 h-5" />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date Range Picker */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              className="input"
            />
          </div>
          <button
            onClick={() => {
              setDateRange({
                startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0]
              });
            }}
            className="btn-secondary"
          >
            This Month
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {reportType === 'revenue' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-green-100 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold">BDT {summary.totalRevenue.toFixed(2)}</p>
              </div>
              <FiDollarSign className="w-12 h-12 text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-blue-100 text-sm">Total Orders</p>
                <p className="text-3xl font-bold">{summary.totalOrders}</p>
              </div>
              <FiShoppingBag className="w-12 h-12 text-blue-200" />
            </div>
          </div>
        </div>
      )}

      {/* Revenue Data Table */}
      {reportType === 'revenue' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Order Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </td>
                  </tr>
                ) : revenueData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      No data available
                    </td>
                  </tr>
                ) : (
                  revenueData.map((data, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{data._id}</td>
                      <td className="px-6 py-4">{data.orders}</td>
                      <td className="px-6 py-4 font-semibold">BDT {data.revenue.toFixed(2)}</td>
                      <td className="px-6 py-4">BDT {(data.revenue / data.orders).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Performance (Placeholder) */}
      {reportType === 'products' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-12">
            <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Product Performance Report</h3>
            <p className="text-gray-500">Coming soon. Track your best-selling products and inventory performance.</p>
          </div>
        </div>
      )}

      {/* Customer Insights (Placeholder) */}
      {reportType === 'customers' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-12">
            <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Customer Insights</h3>
            <p className="text-gray-500">Coming soon. Analyze customer behavior and purchase patterns.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerReports;