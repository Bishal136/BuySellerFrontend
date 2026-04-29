import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiEye, FiCheckCircle, FiXCircle,
  FiClock, FiFileText, FiMapPin, FiPhone, FiMail,
  FiRefreshCw
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const Sellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [action, setAction] = useState('verify');

  useEffect(() => {
    fetchSellers();
  }, [statusFilter]);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/sellers', {
        params: {
          status: statusFilter !== 'all' ? statusFilter : undefined
        }
      });
      setSellers(response.data.sellers);
    } catch (error) {
      toast.error('Failed to load sellers');
    } finally {
      setLoading(false);
    }
  };

  const verifySeller = async () => {
    try {
      await api.put(`/admin/sellers/${selectedSeller._id}/verify`, {
        status: action === 'verify' ? 'verified' : 'rejected',
        notes: verificationNotes
      });
      toast.success(`Seller ${action === 'verify' ? 'verified' : 'rejected'} successfully`);
      setShowVerifyModal(false);
      setSelectedSeller(null);
      setVerificationNotes('');
      fetchSellers();
    } catch (error) {
      toast.error('Failed to verify seller');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: FiClock },
      verified: { color: 'bg-green-100 text-green-800', icon: FiCheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: FiXCircle }
    };
    return badges[status] || badges.pending;
  };

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'verified', label: 'Verified' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const filteredSellers = sellers.filter(seller =>
    seller.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.businessEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Seller Management</h1>
          <p className="text-gray-500 mt-1">Verify and manage seller accounts</p>
        </div>
        <button onClick={fetchSellers} className="btn-secondary flex items-center gap-2">
          <FiRefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusOptions.filter(s => s.value !== 'all').map(status => {
          const count = sellers.filter(s => s.verificationStatus === status.value).length;
          const badge = getStatusBadge(status.value);
          return (
            <div key={status.value} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{status.label}</p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
                <div className={`w-10 h-10 ${badge.color} rounded-full flex items-center justify-center`}>
                  <badge.icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by store name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
            />
          </div>
          <div className="flex gap-2">
            {statusOptions.map(status => (
              <button
                key={status.value}
                onClick={() => setStatusFilter(status.value)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  statusFilter === status.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sellers List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="col-span-2 bg-white rounded-xl p-12 text-center text-gray-500">
            No sellers found
          </div>
        ) : (
          filteredSellers.map((seller, index) => {
            const statusBadge = getStatusBadge(seller.verificationStatus);
            return (
              <motion.div
                key={seller._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{seller.storeName}</h3>
                    <p className="text-sm text-gray-500">{seller.businessName}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${statusBadge.color}`}>
                    <statusBadge.icon className="w-3 h-3" />
                    {seller.verificationStatus}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiMail className="w-4 h-4" />
                    {seller.businessEmail}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiPhone className="w-4 h-4" />
                    {seller.businessPhone}
                  </div>
                  {seller.businessAddress && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <FiMapPin className="w-4 h-4 mt-0.5" />
                      <div>
                        <p>{seller.businessAddress.street}</p>
                        <p>{seller.businessAddress.city}, {seller.businessAddress.state}</p>
                      </div>
                    </div>
                  )}
                </div>

                {seller.verificationStatus === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedSeller(seller);
                        setAction('verify');
                        setShowVerifyModal(true);
                      }}
                      className="flex-1 btn-primary flex items-center justify-center gap-2"
                    >
                      <FiCheckCircle /> Verify
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSeller(seller);
                        setAction('reject');
                        setShowVerifyModal(true);
                      }}
                      className="flex-1 btn-secondary flex items-center justify-center gap-2 text-red-600"
                    >
                      <FiXCircle /> Reject
                    </button>
                  </div>
                )}

                <button
                  onClick={() => window.open(`/seller/${seller.storeSlug}`, '_blank')}
                  className="mt-3 w-full btn-secondary flex items-center justify-center gap-2"
                >
                  <FiEye /> View Store
                </button>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Verification Modal */}
      <AnimatePresence>
        {showVerifyModal && selectedSeller && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-md w-full"
            >
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">
                  {action === 'verify' ? 'Verify Seller' : 'Reject Seller'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {selectedSeller.storeName}
                </p>
              </div>
              <div className="p-6">
                <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  rows="4"
                  className="w-full p-2 border border-gray-200 rounded-lg"
                  placeholder={`${action === 'verify' ? 'Verification notes...' : 'Reason for rejection...'}`}
                />
              </div>
              <div className="p-6 border-t bg-gray-50 flex gap-3">
                <button
                  onClick={verifySeller}
                  className={`flex-1 ${action === 'verify' ? 'btn-primary' : 'btn-secondary text-red-600'}`}
                >
                  {action === 'verify' ? 'Verify Seller' : 'Reject Seller'}
                </button>
                <button onClick={() => setShowVerifyModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sellers;