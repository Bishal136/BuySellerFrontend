import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiBell,
  FiCheckCircle, FiXCircle, FiClock, FiCalendar,
  FiRefreshCw, FiX, FiSave, FiEye, FiEyeOff,
  FiAlertCircle, FiInfo, FiAlertTriangle, FiCheck
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info',
    isActive: true,
    isGlobal: true,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/announcements');
      setAnnouncements(response.data.announcements);
    } catch (error) {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      if (editingAnnouncement) {
        await api.put(`/admin/announcements/${editingAnnouncement._id}`, formData);
        toast.success('Announcement updated successfully');
      } else {
        await api.post('/admin/announcements', formData);
        toast.success('Announcement created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchAnnouncements();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save announcement');
    }
  };

  const deleteAnnouncement = async (announcement) => {
    if (window.confirm(`Delete announcement "${announcement.title}"?`)) {
      try {
        await api.delete(`/admin/announcements/${announcement._id}`);
        toast.success('Announcement deleted successfully');
        fetchAnnouncements();
      } catch (error) {
        toast.error('Failed to delete announcement');
      }
    }
  };

  const toggleAnnouncementStatus = async (announcement) => {
    try {
      await api.put(`/admin/announcements/${announcement._id}`, { isActive: !announcement.isActive });
      toast.success(`Announcement ${!announcement.isActive ? 'activated' : 'deactivated'}`);
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'info',
      isActive: true,
      isGlobal: true,
      startDate: '',
      endDate: ''
    });
    setEditingAnnouncement(null);
  };

  const openEditModal = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      isActive: announcement.isActive,
      isGlobal: announcement.isGlobal,
      startDate: announcement.startDate ? new Date(announcement.startDate).toISOString().split('T')[0] : '',
      endDate: announcement.endDate ? new Date(announcement.endDate).toISOString().split('T')[0] : ''
    });
    setShowModal(true);
  };

  const getTypeIcon = (type) => {
    const icons = {
      info: <FiInfo className="w-4 h-4" />,
      warning: <FiAlertTriangle className="w-4 h-4" />,
      success: <FiCheck className="w-4 h-4" />,
      error: <FiAlertCircle className="w-4 h-4" />
    };
    return icons[type] || icons.info;
  };

  const getTypeColors = (type) => {
    const colors = {
      info: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      warning: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
      success: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
      error: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
    };
    return colors[type] || colors.info;
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

  const announcementTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'info', label: 'Info', icon: FiInfo },
    { value: 'warning', label: 'Warning', icon: FiAlertTriangle },
    { value: 'success', label: 'Success', icon: FiCheck },
    { value: 'error', label: 'Error', icon: FiAlertCircle }
  ];

  const filteredAnnouncements = announcements
    .filter(ann => typeFilter === 'all' || ann.type === typeFilter)
    .filter(ann =>
      ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ann.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Announcement Management
          </h1>
          <p className="text-gray-500 mt-1">Create and manage system announcements</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" /> Create Announcement
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-gray-500 text-sm">Total</p>
          <p className="text-2xl font-bold">{announcements.length}</p>
        </div>
        <div className="bg-green-50 rounded-xl shadow-sm border border-green-100 p-4">
          <p className="text-green-700 text-sm">Active</p>
          <p className="text-2xl font-bold text-green-700">{announcements.filter(a => a.isActive).length}</p>
        </div>
        <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-100 p-4">
          <p className="text-blue-700 text-sm">Global</p>
          <p className="text-2xl font-bold text-blue-700">{announcements.filter(a => a.isGlobal).length}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl shadow-sm border border-yellow-100 p-4">
          <p className="text-yellow-700 text-sm">Scheduled</p>
          <p className="text-2xl font-bold text-yellow-700">
            {announcements.filter(a => a.startDate && new Date(a.startDate) > new Date()).length}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
            />
          </div>
          <div className="flex gap-2">
            {announcementTypes.map(type => (
              <button
                key={type.value}
                onClick={() => setTypeFilter(type.value)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  typeFilter === type.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.icon && <type.icon className="w-4 h-4" />}
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <FiBell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No announcements</h3>
          <p className="text-gray-500">Create announcements to notify users</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement, index) => {
            const status = getStatusBadge(announcement.isActive, announcement.startDate, announcement.endDate);
            const StatusIcon = status.icon;
            const typeColors = getTypeColors(announcement.type);
            const TypeIcon = getTypeIcon(announcement.type);
            
            return (
              <motion.div
                key={announcement._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-xl shadow-sm border ${typeColors.border} overflow-hidden hover:shadow-md transition-shadow`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${typeColors.bg} ${typeColors.text}`}>
                        <TypeIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-semibold text-lg">{announcement.title}</h3>
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.text}
                          </span>
                          {!announcement.isGlobal && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              Targeted
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600">{announcement.content}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                          {announcement.startDate && (
                            <span className="flex items-center gap-1">
                              <FiCalendar className="w-3 h-3" />
                              Starts: {new Date(announcement.startDate).toLocaleDateString()}
                            </span>
                          )}
                          {announcement.endDate && (
                            <span className="flex items-center gap-1">
                              <FiCalendar className="w-3 h-3" />
                              Ends: {new Date(announcement.endDate).toLocaleDateString()}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <FiClock className="w-3 h-3" />
                            Created: {new Date(announcement.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleAnnouncementStatus(announcement)}
                        className={`p-2 rounded-lg transition-colors ${
                          announcement.isActive
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                        title={announcement.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {announcement.isActive ? <FiXCircle className="w-4 h-4" /> : <FiCheckCircle className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => openEditModal(announcement)}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteAnnouncement(announcement)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
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
                    {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
                  </h2>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full p-2 border border-gray-200 rounded-lg"
                    placeholder="Important Update"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Content *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    rows="4"
                    className="w-full p-2 border border-gray-200 rounded-lg"
                    placeholder="Announcement details..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Announcement Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full p-2 border border-gray-200 rounded-lg"
                    >
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="success">Success</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Visibility</label>
                    <select
                      value={formData.isGlobal ? 'global' : 'targeted'}
                      onChange={(e) => setFormData({...formData, isGlobal: e.target.value === 'global'})}
                      className="w-full p-2 border border-gray-200 rounded-lg"
                    >
                      <option value="global">All Users (Global)</option>
                      <option value="targeted">Targeted Users</option>
                    </select>
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
                  <label htmlFor="isActive" className="text-sm">Active (visible to users)</label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <FiSave /> {editingAnnouncement ? 'Update' : 'Create'}
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

export default AdminAnnouncements;