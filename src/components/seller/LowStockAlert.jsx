import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiAlertTriangle, FiPackage, FiEdit2, 
  FiPlus, FiMinus, FiX, FiRefreshCw
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { Link } from 'react-router-dom';

const LowStockAlert = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [newStock, setNewStock] = useState(0);

  useEffect(() => {
    fetchLowStockProducts();
  }, []);

  const fetchLowStockProducts = async () => {
    try {
      const response = await api.get('/seller/low-stock');
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching low stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async () => {
    if (newStock < 0) {
      toast.error('Stock cannot be negative');
      return;
    }

    try {
      await api.put(`/seller/products/${selectedProduct._id}/stock`, { stock: newStock });
      toast.success('Stock updated successfully');
      setShowStockModal(false);
      fetchLowStockProducts();
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  const getStockLevel = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-100' };
    if (stock <= 5) return { text: 'Critical', color: 'text-red-500', bg: 'bg-red-50' };
    if (stock <= 10) return { text: 'Low', color: 'text-orange-500', bg: 'bg-orange-50' };
    return { text: 'Normal', color: 'text-green-500', bg: 'bg-green-50' };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      <div className="p-6 border-b bg-gradient-to-r from-orange-50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <FiAlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Low Stock Alerts</h2>
            <p className="text-sm text-gray-600">
              {products.length} product{products.length !== 1 ? 's' : ''} need attention
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y">
        <AnimatePresence>
          {products.map((product, index) => {
            const stockLevel = getStockLevel(product.stock);
            return (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex gap-4">
                  <img
                    src={product.images?.[0]?.url || 'https://via.placeholder.com/60'}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <Link 
                      to={`/seller/products/edit/${product._id}`}
                      className="font-semibold hover:text-primary-600 line-clamp-2"
                    >
                      {product.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${stockLevel.bg} ${stockLevel.color}`}>
                        {stockLevel.text}
                      </span>
                      <span className="text-sm text-gray-600">
                        Stock: <span className="font-semibold">{product.stock}</span> units
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            product.stock === 0 ? 'bg-red-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${Math.min((product.stock / 50) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setNewStock(product.stock);
                      setShowStockModal(true);
                    }}
                    className="btn-secondary py-1 px-3 text-sm flex items-center gap-1"
                  >
                    <FiEdit2 className="w-3 h-3" /> Update
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {products.length === 0 && (
        <div className="p-12 text-center">
          <FiPackage className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <p className="text-gray-500">All products have healthy stock levels!</p>
          <p className="text-sm text-gray-400 mt-1">Great job keeping inventory updated</p>
        </div>
      )}

      {/* Update Stock Modal */}
      {showStockModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg max-w-md w-full p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Update Stock</h2>
              <button
                onClick={() => setShowStockModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Update stock for: <span className="font-semibold">{selectedProduct.name}</span>
            </p>
            
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={() => setNewStock(Math.max(0, newStock - 1))}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >
                <FiMinus />
              </button>
              <div className="text-center">
                <span className="text-3xl font-bold">{newStock}</span>
                <p className="text-xs text-gray-500">units</p>
              </div>
              <button
                onClick={() => setNewStock(newStock + 1)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >
                <FiPlus />
              </button>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={updateStock}
                className="btn-primary flex-1"
              >
                Update Stock
              </button>
              <button
                onClick={() => setShowStockModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default LowStockAlert;