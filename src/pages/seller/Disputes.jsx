import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiAlertCircle, FiCheckCircle, FiXCircle, 
  FiEye, FiMessageSquare, FiSearch, FiFilter
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const SellerDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [resolution, setResolution] = useState({
    action: 'approve',
    refundAmount: '',
    notes: ''
  });

  useEffect(() => {
    fetchDisputes();
  }, [statusFilter]);

  const fetchDisputes = async () => {
    try {
      const response = await api.get('/seller/disputes');
      setDisputes(response.data.disputes);
    } catch (error) {
      toast.error('Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  const resolveDispute = async () => {
    try {
      await api.put(`/seller/disputes/${selectedDispute._id}`, {
        resolution: resolution.action === 'approve' ? 'refund' : 'none',
        resolutionAmount: resolution.refundAmount,
        resolutionNotes: resolution.notes
      });
      toast.success(`Dispute ${resolution.action === 'approve' ? 'approved' : 'rejected'}`);
      setShowResolutionModal(false);
      fetchDisputes();
    } catch (error) {
      toast.error('Failed to resolve dispute');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredDisputes = disputes.filter(dispute =>
    statusFilter === 'all' ? true : dispute.status === statusFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dispute Resolution Center</h1>
        <p className="text-gray-600">Manage and resolve customer disputes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Open Disputes', value: disputes.filter(d => d.status === 'open').length, color: 'bg-yellow-100 text-yellow-800' },
          { label: 'Under Review', value: disputes.filter(d => d.status === 'under_review').length, color: 'bg-blue-100 text-blue-800' },
          { label: 'Resolved', value: disputes.filter(d => d.status === 'resolved').length, color: 'bg-green-100 text-green-800' },
          { label: 'Total', value: disputes.length, color: 'bg-gray-100 text-gray-800' }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-4">
            <p className="text-gray-600 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex gap-2">
          {['all', 'open', 'under_review', 'resolved', 'closed'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg capitalize ${
                statusFilter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Disputes List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                   </td>
                 </tr>
              ) : filteredDisputes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No disputes found
                   </td>
                 </tr>
              ) : (
                filteredDisputes.map((dispute) => (
                  <tr key={dispute._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-sm">#{dispute.order?._id?.slice(-8)}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{dispute.customer?.name}</p>
                        <p className="text-xs text-gray-500">{dispute.customer?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm capitalize">{dispute.reason?.replace('_', ' ')}</td>
                    <td className="px-6 py-4 font-semibold">${dispute.order?.totalPrice?.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(dispute.status)}`}>
                        {dispute.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(dispute.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedDispute(dispute);
                            setShowResolutionModal(true);
                          }}
                          className="text-primary-600 hover:text-primary-700"
                          title="Resolve"
                        >
                          <FiCheckCircle />
                        </button>
                        <button
                          onClick={() => window.open(`/orders/${dispute.order?._id}`, '_blank')}
                          className="text-gray-600 hover:text-gray-700"
                          title="View Order"
                        >
                          <FiEye />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolution Modal */}
      {showResolutionModal && selectedDispute && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Resolve Dispute</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Action</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="approve"
                      checked={resolution.action === 'approve'}
                      onChange={(e) => setResolution({...resolution, action: e.target.value})}
                    />
                    <span>Approve Refund</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="reject"
                      checked={resolution.action === 'reject'}
                      onChange={(e) => setResolution({...resolution, action: e.target.value})}
                    />
                    <span>Reject</span>
                  </label>
                </div>
              </div>
              {resolution.action === 'approve' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Refund Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={resolution.refundAmount}
                    onChange={(e) => setResolution({...resolution, refundAmount: e.target.value})}
                    className="input"
                    placeholder="Enter refund amount"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Resolution Notes</label>
                <textarea
                  value={resolution.notes}
                  onChange={(e) => setResolution({...resolution, notes: e.target.value})}
                  className="input"
                  rows="3"
                  placeholder="Add notes about the resolution..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={resolveDispute} className="btn-primary flex-1">
                  Submit Resolution
                </button>
                <button onClick={() => setShowResolutionModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDisputes;