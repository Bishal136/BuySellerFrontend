import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiImage,
  FiCheckCircle, FiXCircle, FiClock, FiCalendar,
  FiRefreshCw, FiX, FiSave, FiEye, FiEyeOff,
  FiMove, FiLink, FiType, FiAlignLeft
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    link: '',
    type: 'promo_banner',
    position: 0,
    isActive: true,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/banners');
      setBanners(response.data.banners);
    } catch (error) {
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post('/admin/banners/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, image: response.data.imageUrl }));
      setImagePreview(response.data.imageUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.image) {
      toast.error('Please fill all required fields (Title and Image)');
      return;
    }

    try {
      if (editingBanner) {
        await api.put(`/admin/banners/${editingBanner._id}`, formData);
        toast.success('Banner updated successfully');
      } else {
        await api.post('/admin/banners', formData);
        toast.success('Banner created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchBanners();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save banner');
    }
  };

  const deleteBanner = async (banner) => {
    if (window.confirm(`Delete banner "${banner.title}"?`)) {
      try {
        await api.delete(`/admin/banners/${banner._id}`);
        toast.success('Banner deleted successfully');
        fetchBanners();
      } catch (error) {
        toast.error('Failed to delete banner');
      }
    }
  };

  const toggleBannerStatus = async (banner) => {
    try {
      await api.put(`/admin/banners/${banner._id}`, { isActive: !banner.isActive });
      toast.success(`Banner ${!banner.isActive ? 'activated' : 'deactivated'}`);
      fetchBanners();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      image: '',
      link: '',
      type: 'promo_banner',
      position: 0,
      isActive: true,
      startDate: '',
      endDate: ''
    });
    setImagePreview(null);
    setEditingBanner(null);
  };

  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      image: banner.image,
      link: banner.link || '',
      type: banner.type,
      position: banner.position || 0,
      isActive: banner.isActive,
      startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
      endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : ''
    });
    setImagePreview(banner.image);
    setShowModal(true);
  };

  const getTypeBadge = (type) => {
    const badges = {
      main_slider: { label: 'Main Slider', color: 'bg-purple-100 text-purple-800' },
      promo_banner: { label: 'Promo Banner', color: 'bg-blue-100 text-blue-800' },
      category_banner: { label: 'Category Banner', color: 'bg-green-100 text-green-800' }
    };
    return badges[type] || badges.promo_banner;
  };

  const getStatusBadge = (isActive, startDate, endDate) => {
    const now = new Date();
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    if (!isActive) return { text: 'Inactive', color: 'bg-gray-100 text-gray-800', icon: FiXCircle };
    if (start && now < start) return { text: 'Scheduled', color: 'bg-yellow-100 text-yellow-800', icon: FiClock };
    if (end && now > end) return { text: 'Expired', color: 'bg-red-100 text-red-800', icon: FiXCircle };
    return { text: 'Active', color: 'bg-green-100 text-green-800', icon: FiCheckCircle };
  };

  const bannerTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'main_slider', label: 'Main Slider' },
    { value: 'promo_banner', label: 'Promo Banner' },
    { value: 'category_banner', label: 'Category Banner' }
  ];

  const filteredBanners = banners
    .filter(banner => typeFilter === 'all' || banner.type === typeFilter)
    .filter(banner =>
      banner.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Banner Management
          </h1>
          <p className="text-gray-500 mt-1">Manage homepage banners and promotional sliders</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" /> Add Banner
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-gray-500 text-sm">Total Banners</p>
          <p className="text-2xl font-bold">{banners.length}</p>
        </div>
        <div className="bg-green-50 rounded-xl shadow-sm border border-green-100 p-4">
          <p className="text-green-700 text-sm">Active</p>
          <p className="text-2xl font-bold text-green-700">{banners.filter(b => b.isActive).length}</p>
        </div>
        <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-100 p-4">
          <p className="text-blue-700 text-sm">Main Slider</p>
          <p className="text-2xl font-bold text-blue-700">{banners.filter(b => b.type === 'main_slider').length}</p>
        </div>
        <div className="bg-purple-50 rounded-xl shadow-sm border border-purple-100 p-4">
          <p className="text-purple-700 text-sm">Promo Banners</p>
          <p className="text-2xl font-bold text-purple-700">{banners.filter(b => b.type === 'promo_banner').length}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search banners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
            />
          </div>
          <div className="flex gap-2">
            {bannerTypes.map(type => (
              <button
                key={type.value}
                onClick={() => setTypeFilter(type.value)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  typeFilter === type.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Banners Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <FiImage className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No banners found</h3>
          <p className="text-gray-500">Create your first banner to promote products and offers</p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="btn-primary mt-4 inline-flex items-center gap-2"
          >
            <FiPlus /> Add Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBanners.map((banner, index) => {
            const status = getStatusBadge(banner.isActive, banner.startDate, banner.endDate);
            const StatusIcon = status.icon;
            const typeBadge = getTypeBadge(banner.type);
            
            return (
              <motion.div
                key={banner._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex h-48">
                  {/* Banner Image */}
                  <div className="w-48 h-48 flex-shrink-0 overflow-hidden bg-gray-100">
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Banner Info */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${typeBadge.color}`}>
                          {typeBadge.label}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.text}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg">{banner.title}</h3>
                      {banner.subtitle && (
                        <p className="text-sm text-gray-500 mt-1">{banner.subtitle}</p>
                      )}
                      {banner.link && (
                        <p className="text-xs text-primary-600 mt-2 flex items-center gap-1">
                          <FiLink className="w-3 h-3" />
                          {banner.link}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mt-4 pt-3 border-t">
                      <button
                        onClick={() => toggleBannerStatus(banner)}
                        className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 text-sm transition-colors ${
                          banner.isActive
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {banner.isActive ? <FiXCircle className="w-3 h-3" /> : <FiCheckCircle className="w-3 h-3" />}
                        {banner.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => openEditModal(banner)}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteBanner(banner)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
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
                    {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                  </h2>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-1">Banner Image *</label>
                  <div className="mt-1 flex items-center gap-4">
                    {imagePreview ? (
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({...formData, image: ''});
                            setImagePreview(null);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                        {uploading ? (
                          <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <FiImage className="w-6 h-6 text-gray-400 mb-1" />
                            <span className="text-xs text-gray-500">Upload</span>
                          </>
                        )}
                      </label>
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Recommended size: 1200 x 400 pixels</p>
                      <p className="text-xs text-gray-400 mt-1">Max file size: 5MB. Formats: JPG, PNG, GIF, WEBP</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full p-2 border border-gray-200 rounded-lg"
                      placeholder="Summer Sale"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                      className="w-full p-2 border border-gray-200 rounded-lg"
                      placeholder="Up to 50% off"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Banner Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full p-2 border border-gray-200 rounded-lg"
                    >
                      <option value="main_slider">Main Slider</option>
                      <option value="promo_banner">Promo Banner</option>
                      <option value="category_banner">Category Banner</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Link URL</label>
                    <input
                      type="text"
                      value={formData.link}
                      onChange={(e) => setFormData({...formData, link: e.target.value})}
                      className="w-full p-2 border border-gray-200 rounded-lg"
                      placeholder="/products?category=sale"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="w-full p-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="w-full p-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    id="isActive"
                  />
                  <label htmlFor="isActive" className="text-sm">Active (visible on website)</label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <FiSave /> {editingBanner ? 'Update Banner' : 'Create Banner'}
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

export default AdminBanners;