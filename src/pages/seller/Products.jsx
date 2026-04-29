import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiCopy,
  FiEye, FiEyeOff, FiMoreVertical, FiFilter,
  FiChevronDown, FiChevronUp, FiPackage, FiAlertCircle
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { PLACEHOLDER_IMAGE } from '../../utils/placeholder';

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [summary, setSummary] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    draft: 0,
    lowStock: 0,
    outOfStock: 0
  });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    fetchProducts();
  }, [statusFilter, searchTerm, pagination.page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/seller/products', {
        params: {
          page: pagination.page,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchTerm || undefined
        }
      });
      setProducts(response.data.products);
      setSummary(response.data.summary);
      setPagination({
        page: response.data.pagination.page,
        pages: response.data.pagination.pages,
        total: response.data.pagination.total
      });
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const updateProductStatus = async (productId, status) => {
    try {
      await api.put(`/seller/products/${productId}/status`, { status });
      toast.success(`Product ${status === 'active' ? 'published' : status === 'inactive' ? 'unpublished' : 'saved as draft'}`);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const deleteProduct = async () => {
    if (!selectedProduct) return;
    try {
      await api.delete(`/seller/products/${selectedProduct._id}`);
      toast.success('Product deleted successfully');
      setShowDeleteModal(false);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const duplicateProduct = async (productId) => {
    try {
      await api.post(`/seller/products/${productId}/duplicate`);
      toast.success('Product duplicated successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to duplicate product');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { color: 'bg-green-100 text-green-800', icon: FiEye, label: 'Active' },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: FiEyeOff, label: 'Inactive' },
      draft: { color: 'bg-yellow-100 text-yellow-800', icon: FiPackage, label: 'Draft' }
    };
    return badges[status] || badges.draft;
  };

  const statusOptions = [
    { value: 'all', label: 'All Products', count: summary.total },
    { value: 'active', label: 'Active', count: summary.active },
    { value: 'inactive', label: 'Inactive', count: summary.inactive },
    { value: 'draft', label: 'Draft', count: summary.draft }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Product Management
          </h1>
          <p className="text-gray-500 mt-1">Manage your products, inventory, and pricing</p>
        </div>
        <Link to="/seller/products/add" className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" /> Add New Product
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {statusOptions.map(stat => (
          <div
            key={stat.value}
            className={`bg-white rounded-xl shadow-sm p-4 border-2 transition-all cursor-pointer ${statusFilter === stat.value ? 'border-primary-500 bg-primary-50' : 'border-gray-100'
              }`}
            onClick={() => setStatusFilter(stat.value)}
          >
            <p className="text-xl font-bold">{stat.count}</p>
            <p className="text-xs text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50">
              <FiFilter className="w-4 h-4" /> Filter
            </button>
            <button className="px-4 py-2 border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50">
              Bulk Actions
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sold</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr key="loading">
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr key="empty">
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <FiPackage className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No products found</p>
                    <Link to="/seller/products/add" className="text-primary-600 hover:underline mt-2 inline-block">
                      Add your first product →
                    </Link>
                  </td>
                </tr>
              ) : (
                products.map((product, index) => {
                  const statusBadge = getStatusBadge(product.status);
                  const StatusIcon = statusBadge.icon;
                  return (
                    <motion.tr
                      key={product._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images?.[0]?.url || PLACEHOLDER_IMAGE}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                          <div>
                            <p className="font-medium text-gray-800">{product.name}</p>
                            {product.stock <= 10 && product.stock > 0 && (
                              <p className="text-xs text-yellow-600 flex items-center gap-1 mt-0.5">
                                <FiAlertCircle className="w-3 h-3" /> Low stock
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.sku || 'N/A'}</td>
                      <td className="px-6 py-4 font-semibold text-gray-800">${product.price?.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${product.stock === 0 ? 'text-red-600' : 'text-gray-800'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.soldCount || 0}</td>
                      <td className="px-6 py-4">
                        <select
                          value={product.status}
                          onChange={(e) => updateProductStatus(product._id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-full font-semibold ${statusBadge.color}`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="draft">Draft</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link
                            to={`/seller/products/edit/${product._id}`}
                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => duplicateProduct(product._id)}
                            className="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                            title="Duplicate"
                          >
                            <FiCopy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/product/${product.slug || product._id}`}
                            target="_blank"
                            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                            title="View"
                          >
                            <FiEye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * 20 + 1} to {Math.min(pagination.page * 20, pagination.total)} of {pagination.total} products
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="px-3 py-1 border rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1">Page {pagination.page} of {pagination.pages}</span>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 border rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <FiTrash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold">Delete Product</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete <span className="font-semibold">"{selectedProduct.name}"</span>? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button onClick={deleteProduct} className="btn-primary flex-1 bg-red-600 hover:bg-red-700">
                    Yes, Delete
                  </button>
                  <button onClick={() => setShowDeleteModal(false)} className="btn-secondary flex-1">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SellerProducts;