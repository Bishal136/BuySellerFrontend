import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiPercent, FiSave, FiRefreshCw, FiInfo,
  FiDollarSign, FiTrendingUp, FiUsers, FiPackage
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const AdminCommission = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    defaultCommission: 10,
    categoryCommissions: [],
    sellerCommissions: []
  });

  const [formData, setFormData] = useState({
    defaultCommission: 10
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/commission');
      setSettings(response.data.settings);
      setFormData({
        defaultCommission: response.data.settings.defaultCommission
      });
    } catch (error) {
      toast.error('Failed to load commission settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/commission', formData);
      toast.success('Commission settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Commission Settings
          </h1>
          <p className="text-gray-500 mt-1">Manage platform commission rates</p>
        </div>
        <button onClick={fetchSettings} className="btn-secondary flex items-center gap-2">
          <FiRefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Default Commission</p>
              <p className="text-2xl font-bold text-primary-600">{formData.defaultCommission}%</p>
            </div>
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <FiPercent className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Platform Revenue</p>
              <p className="text-2xl font-bold text-green-600">$12,450</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <FiDollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Sellers</p>
              <p className="text-2xl font-bold text-blue-600">156</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FiUsers className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Products</p>
              <p className="text-2xl font-bold text-purple-600">2,543</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <FiPackage className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Default Commission Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Default Commission Rate</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Commission Rate (%)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  value={formData.defaultCommission}
                  onChange={(e) => setFormData({...formData, defaultCommission: parseFloat(e.target.value)})}
                  className="w-32 p-2 border border-gray-200 rounded-lg"
                  min="0"
                  max="100"
                />
                <span className="text-gray-500">% per sale</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This commission will be applied to all seller sales by default.
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FiSave />}
              Save Default Commission
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
          <div className="flex items-start gap-3">
            <FiInfo className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">How Commission Works</h3>
              <ul className="text-sm text-blue-700 space-y-2">
                <li>• Commission is calculated on the final sale price (excluding shipping and tax)</li>
                <li>• Commission is automatically deducted from seller payouts</li>
                <li>• Different commission rates can be set for specific categories or sellers</li>
                <li>• Commission rates are applied at the time of order completion</li>
                <li>• Platform revenue is generated from seller commissions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Category Commission (Placeholder) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Category Commission (Coming Soon)</h2>
          <div className="text-center py-8 text-gray-500">
            <FiTrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Set different commission rates for specific categories</p>
            <p className="text-sm mt-1">This feature will be available in the next update</p>
          </div>
        </div>

        {/* Seller Commission (Placeholder) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Seller Commission (Coming Soon)</h2>
          <div className="text-center py-8 text-gray-500">
            <FiUsers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Set custom commission rates for individual sellers</p>
            <p className="text-sm mt-1">This feature will be available in the next update</p>
          </div>
        </div>
      </div>

      {/* Recent Commission Calculations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Commission Calculations</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Seller</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Sale Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Commission</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((_, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">#ORD-{Math.random().toString(36).substr(2, 8).toUpperCase()}</td>
                  <td className="px-4 py-3">TechGadgets Store</td>
                  <td className="px-4 py-3">$124.99</td>
                  <td className="px-4 py-3 text-green-600">$12.50</td>
                  <td className="px-4 py-3 text-gray-500">{new Date().toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCommission;