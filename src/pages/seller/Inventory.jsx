import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPackage, FiSearch, FiEdit2, FiPlus, FiMinus,
  FiAlertTriangle, FiDownload, FiUpload, FiRefreshCw,
  FiFilter, FiX, FiChevronDown, FiChevronUp,FiCheckCircle
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const SellerInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkUpdates, setBulkUpdates] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0
  });

  useEffect(() => {
    fetchInventory();
  }, [filterStatus, searchTerm, sortBy, sortOrder]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await api.get('/seller/inventory', {
        params: {
          stockStatus: filterStatus !== 'all' ? filterStatus : undefined,
          search: searchTerm || undefined,
          sortBy,
          sortOrder
        }
      });
      setProducts(response.data.products);
      setStats(response.data.stats);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (productId, newStock) => {
    if (newStock < 0) return;
    try {
      await api.put(`/seller/products/${productId}/stock`, { stock: newStock });
      toast.success('Stock updated');
      fetchInventory();
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  const handleBulkUpdate = async () => {
    try {
      await api.put('/seller/inventory/bulk-stock', { updates: bulkUpdates });
      toast.success(`${bulkUpdates.length} products updated`);
      setShowBulkModal(false);
      setBulkUpdates([]);
      fetchInventory();
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  const addToBulk = (productId, currentStock) => {
    setBulkUpdates(prev => {
      const existing = prev.find(u => u.productId === productId);
      if (existing) {
        return prev.map(u => u.productId === productId ? { ...u, newStock: currentStock } : u);
      }
      return [...prev, { productId, newStock: currentStock }];
    });
  };

  const getStockBadge = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: FiX };
    if (stock <= 10) return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800', icon: FiAlertTriangle };
    return { text: 'In Stock', color: 'bg-green-100 text-green-800', icon: FiCheckCircle };
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <FiChevronDown className="w-4 h-4 opacity-30" />;
    return sortOrder === 'asc' ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />;
  };

  const filterOptions = [
    { value: 'all', label: 'All Products', color: 'bg-gray-100 text-gray-700' },
    { value: 'low', label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'out', label: 'Out of Stock', color: 'bg-red-100 text-red-800' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Inventory Management
          </h1>
          <p className="text-gray-500 mt-1">Track and manage your product stock levels</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowBulkModal(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <FiRefreshCw className="w-4 h-4" /> Bulk Update
          </button>
          <button className="btn-primary flex items-center gap-2">
            <FiDownload className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Products</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FiPackage className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <FiAlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <FiX className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Inventory Value</p>
              <p className="text-2xl font-bold text-green-600">${stats.totalValue.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <FiDownload className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4">
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
              {filterOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setFilterStatus(option.value)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    filterStatus === option.value
                      ? `bg-primary-600 text-white shadow-md`
                      : `bg-gray-100 text-gray-700 hover:bg-gray-200`
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">Product <SortIcon field="name" /></div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('sku')}>
                  <div className="flex items-center gap-1">SKU <SortIcon field="sku" /></div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('price')}>
                  <div className="flex items-center gap-1">Price <SortIcon field="price" /></div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('stock')}>
                  <div className="flex items-center gap-1">Stock <SortIcon field="stock" /></div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {loading ? (
                  <tr key="loading">
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr key="empty">
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <FiPackage className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No products found</p>
                    </td>
                  </tr>
                ) : (
                  products.map((product, index) => {
                    const badge = getStockBadge(product.stock);
                    const BadgeIcon = badge.icon;
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
                              src={product.images?.[0]?.url || 'https://via.placeholder.com/40'}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-lg"
                            />
                            <span className="font-medium text-gray-800">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{product.sku || 'N/A'}</td>
                        <td className="px-6 py-4 font-semibold text-gray-800">${product.price?.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateStock(product._id, product.stock - 1)}
                              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                              disabled={product.stock <= 0}
                            >
                              <FiMinus className="w-3 h-3" />
                            </button>
                            <span className="w-12 text-center font-semibold text-gray-800">{product.stock}</span>
                            <button
                              onClick={() => updateStock(product._id, product.stock + 1)}
                              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            >
                              <FiPlus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${badge.color}`}>
                            <BadgeIcon className="w-3 h-3" />
                            {badge.text}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            to={`/seller/products/edit/${product._id}`}
                            className="text-primary-600 hover:text-primary-700 transition-colors"
                          >
                            <FiEdit2 className="w-5 h-5" />
                          </Link>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Update Modal */}
      <AnimatePresence>
        {showBulkModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">Bulk Stock Update</h2>
                <p className="text-gray-500 text-sm mt-1">Update multiple products at once</p>
              </div>
              <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
                {products.map(product => (
                  <div key={product._id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                    <img
                      src={product.images?.[0]?.url || 'https://via.placeholder.com/40'}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{product.name}</p>
                      <p className="text-sm text-gray-500">Current: {product.stock}</p>
                    </div>
                    <input
                      type="number"
                      defaultValue={product.stock}
                      onChange={(e) => addToBulk(product._id, parseInt(e.target.value))}
                      className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-center"
                      min="0"
                    />
                  </div>
                ))}
              </div>
              <div className="p-6 border-t bg-gray-50 flex gap-3">
                <button onClick={handleBulkUpdate} className="btn-primary flex-1">
                  Update {bulkUpdates.length} Product(s)
                </button>
                <button onClick={() => setShowBulkModal(false)} className="btn-secondary flex-1">
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

export default SellerInventory;