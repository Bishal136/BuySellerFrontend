import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiCopy,
  FiCheckCircle, FiXCircle, FiClock, FiCalendar,
  FiTag, FiDollarSign, FiPercent, FiRefreshCw,
  FiX, FiSave, FiEye, FiEyeOff
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    maxDiscount: '',
    minPurchase: '',
    maxUses: '',
    perUserLimit: '1',
    startDate: '',
    endDate: '',
    isActive: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/coupons');
      setCoupons(response.data.coupons);
    } catch (error) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.code || !formData.name || !formData.discountValue || !formData.startDate || !formData.endDate) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      if (editingCoupon) {
        await api.put(`/admin/coupons/${editingCoupon._id}`, formData);
        toast.success('Coupon updated successfully');
      } else {
        await api.post('/admin/coupons', formData);
        toast.success('Coupon created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save coupon');
    }
  };

  const deleteCoupon = async (coupon) => {
    if (window.confirm(`Delete coupon "${coupon.code}"?`)) {
      try {
        await api.delete(`/admin/coupons/${coupon._id}`);
        toast.success('Coupon deleted successfully');
        fetchCoupons();
      } catch (error) {
        toast.error('Failed to delete coupon');
      }
    }
  };

  const toggleCouponStatus = async (coupon) => {
    try {
      await api.put(`/admin/coupons/${coupon._id}`, { isActive: !coupon.isActive });
      toast.success(`Coupon ${!coupon.isActive ? 'activated' : 'deactivated'}`);
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const duplicateCoupon = async (coupon) => {
    try {
      const newCoupon = {
        ...coupon,
        code: `${coupon.code}_COPY`,
        name: `${coupon.name} (Copy)`,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      delete newCoupon._id;
      await api.post('/admin/coupons', newCoupon);
      toast.success('Coupon duplicated successfully');
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to duplicate coupon');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      maxDiscount: '',
      minPurchase: '',
      maxUses: '',
      perUserLimit: '1',
      startDate: '',
      endDate: '',
      isActive: true
    });
    setEditingCoupon(null);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscount: coupon.maxDiscount || '',
      minPurchase: coupon.minPurchase || '',
      maxUses: coupon.maxUses || '',
      perUserLimit: coupon.perUserLimit || '1',
      startDate: new Date(coupon.startDate).toISOString().split('T')[0],
      endDate: new Date(coupon.endDate).toISOString().split('T')[0],
      isActive: coupon.isActive
    });
    setShowModal(true);
  };

  const getDiscountIcon = (type) => {
    return type === 'percentage' ? <FiPercent className="w-4 h-4" /> : <FiDollarSign className="w-4 h-4" />;
  };

  const getStatusBadge = (isActive, startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!isActive) return { text: 'Inactive', color: 'bg-gray-100 text-gray-800', icon: FiXCircle };
    if (now < start) return { text: 'Scheduled', color: 'bg-yellow-100 text-yellow-800', icon: FiClock };
    if (now > end) return { text: 'Expired', color: 'bg-red-100 text-red-800', icon: FiXCircle };
    return { text: 'Active', color: 'bg-green-100 text-green-800', icon: FiCheckCircle };
  };

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coupon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Coupon Management
          </h1>
          <p className="text-gray-500 mt-1">Create and manage promotional coupons</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-gray-500 text-sm">Total Coupons</p>
          <p className="text-2xl font-bold">{coupons.length}</p>
        </div>
        <div className="bg-green-50 rounded-xl shadow-sm border border-green-100 p-4">
          <p className="text-green-700 text-sm">Active</p>
          <p className="text-2xl font-bold text-green-700">{coupons.filter(c => c.isActive && new Date(c.endDate) > new Date()).length}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl shadow-sm border border-yellow-100 p-4">
          <p className="text-yellow-700 text-sm">Expiring Soon</p>
          <p className="text-2xl font-bold text-yellow-700">
            {coupons.filter(c => {
              const daysLeft = (new Date(c.endDate) - new Date()) / (1000 * 60 * 60 * 24);
              return c.isActive && daysLeft <= 7 && daysLeft > 0;
            }).length}
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-100 p-4">
          <p className="text-blue-700 text-sm">Total Used</p>
          <p className="text-2xl font-bold text-blue-700">{coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by coupon code or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
          />
        </div>
      </div>

      {/* Coupons Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <FiTag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No coupons found</h3>
          <p className="text-gray-500">Create your first coupon to start offering discounts</p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="btn-primary mt-4 inline-flex items-center gap-2"
          >
            <FiPlus /> Create Coupon
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCoupons.map((coupon, index) => {
            const status = getStatusBadge(coupon.isActive, coupon.startDate, coupon.endDate);
            const StatusIcon = status.icon;
            const discountIcon = getDiscountIcon(coupon.discountType);
            const daysLeft = Math.ceil((new Date(coupon.endDate) - new Date()) / (1000 * 60 * 60 * 24));

            return (
              <motion.div
                key={coupon._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono font-bold text-lg bg-gray-100 px-3 py-1 rounded-lg">
                          {coupon.code}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.text}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-800">{coupon.name}</h3>
                      {coupon.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{coupon.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Discount</span>
                      <span className="font-semibold flex items-center gap-1">
                        {discountIcon}
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                        {coupon.maxDiscount && coupon.discountType === 'percentage' && ` (Max $${coupon.maxDiscount})`}
                      </span>
                    </div>
                    {coupon.minPurchase > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Min Purchase</span>
                        <span className="font-semibold">${coupon.minPurchase}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Valid Period</span>
                      <span className="text-sm">
                        {new Date(coupon.startDate).toLocaleDateString()} - {new Date(coupon.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    {daysLeft > 0 && daysLeft <= 7 && coupon.isActive && (
                      <div className="bg-yellow-50 p-2 rounded-lg text-center">
                        <p className="text-xs text-yellow-700">Expires in {daysLeft} days</p>
                      </div>
                    )}
                    {coupon.usedCount !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Used</span>
                        <span className="font-semibold">{coupon.usedCount} {coupon.maxUses ? `/ ${coupon.maxUses}` : ''}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={() => toggleCouponStatus(coupon)}
                      className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${coupon.isActive
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                    >
                      {coupon.isActive ? <FiXCircle className="w-4 h-4" /> : <FiCheckCircle className="w-4 h-4" />}
                      {coupon.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => duplicateCoupon(coupon)}
                      className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center gap-2"
                    >
                      <FiCopy className="w-4 h-4" /> Duplicate
                    </button>
                    <button
                      onClick={() => openEditModal(coupon)}
                      className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteCoupon(coupon)}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">
                    {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                  </h2>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Coupon Code *</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full p-2 border border-gray-200 rounded-lg"
                      placeholder="SUMMER20"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Uppercase letters and numbers only</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Coupon Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-2 border border-gray-200 rounded-lg"
                      placeholder="Summer Sale 20% Off"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="2"
                    className="w-full p-2 border border-gray-200 rounded-lg"
                    placeholder="Describe the coupon offer..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Discount Type *</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      className="w-full p-2 border border-gray-200 rounded-lg"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Discount Value *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      className="w-full p-2 border border-gray-200 rounded-lg"
                      placeholder={formData.discountType === 'percentage' ? '20' : '10'}
                      required
                    />
                  </div>
                  {formData.discountType === 'percentage' && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Max Discount ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.maxDiscount}
                        onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                        className="w-full p-2 border border-gray-200 rounded-lg"
                        placeholder="50"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Min Purchase ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.minPurchase}
                      onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                      className="w-full p-2 border border-gray-200 rounded-lg"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Uses (Global)</label>
                    <input
                      type="number"
                      value={formData.maxUses}
                      onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                      className="w-full p-2 border border-gray-200 rounded-lg"
                      placeholder="Unlimited"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Per User Limit</label>
                    <input
                      type="number"
                      value={formData.perUserLimit}
                      onChange={(e) => setFormData({ ...formData, perUserLimit: e.target.value })}
                      className="w-full p-2 border border-gray-200 rounded-lg"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date *</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full p-2 border border-gray-200 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date *</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full p-2 border border-gray-200 rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    id="isActive"
                  />
                  <label htmlFor="isActive" className="text-sm">Active (visible to customers)</label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <FiSave /> {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCoupons;