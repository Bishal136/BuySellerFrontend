import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHeart, FiTrash2, FiShoppingCart, FiStar, 
  FiAlertCircle, FiShare2, FiMove, FiGrid,
  FiList, FiSearch, FiX
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { addToCart, addToGuestCart } from '../redux/slices/cartSlice';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [searchTerm, setSearchTerm] = useState('');
  const [movingItem, setMovingItem] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isBulkMode, setIsBulkMode] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    fetchWishlist();
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/wishlist');
      setWishlist(response.data.wishlist || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await api.delete(`/users/wishlist/${productId}`);
      setWishlist(prev => prev.filter(item => item._id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const handleAddToCart = async (product) => {
    if (product.stock === 0) {
      toast.error('Out of stock!');
      return;
    }

    if (isAuthenticated) {
      await dispatch(addToCart({ productId: product._id, quantity: 1 }));
      toast.success('Added to cart!');
    } else {
      dispatch(addToGuestCart({ product, quantity: 1 }));
      toast.success('Added to cart!');
    }
  };

  const handleMoveToCart = async (product) => {
    await handleAddToCart(product);
    await handleRemoveFromWishlist(product._id);
  };

  const handleBulkRemove = async () => {
    if (selectedItems.length === 0) return;
    
    if (window.confirm(`Remove ${selectedItems.length} item(s) from wishlist?`)) {
      for (const productId of selectedItems) {
        await api.delete(`/users/wishlist/${productId}`);
      }
      setWishlist(prev => prev.filter(item => !selectedItems.includes(item._id)));
      setSelectedItems([]);
      setIsBulkMode(false);
      toast.success(`${selectedItems.length} item(s) removed from wishlist`);
    }
  };

  const handleBulkAddToCart = async () => {
    if (selectedItems.length === 0) return;
    
    const productsToAdd = wishlist.filter(item => selectedItems.includes(item._id));
    for (const product of productsToAdd) {
      if (product.stock > 0) {
        if (isAuthenticated) {
          await dispatch(addToCart({ productId: product._id, quantity: 1 }));
        } else {
          dispatch(addToGuestCart({ product, quantity: 1 }));
        }
      }
    }
    
    // Remove from wishlist after adding to cart
    for (const productId of selectedItems) {
      await api.delete(`/users/wishlist/${productId}`);
    }
    
    setWishlist(prev => prev.filter(item => !selectedItems.includes(item._id)));
    setSelectedItems([]);
    setIsBulkMode(false);
    toast.success(`${selectedItems.length} item(s) moved to cart`);
  };

  const handleShare = async (product) => {
    const url = `${window.location.origin}/product/${product.slug || product._id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Product link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const toggleSelectItem = (productId) => {
    setSelectedItems(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAll = () => {
    if (selectedItems.length === filteredWishlist.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredWishlist.map(item => item._id));
    }
  };

  const filteredWishlist = wishlist.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FiStar
          key={i}
          className={`w-4 h-4 ${
            i <= Math.floor(rating || 0)
              ? 'text-yellow-400 fill-current'
              : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
            <p className="text-gray-600">
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
          
          <div className="flex gap-3">
            {wishlist.length > 0 && (
              <>
                <button
                  onClick={() => setIsBulkMode(!isBulkMode)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <FiMove /> {isBulkMode ? 'Exit Bulk Mode' : 'Bulk Actions'}
                </button>
                {viewMode === 'grid' ? (
                  <button
                    onClick={() => setViewMode('list')}
                    className="btn-secondary p-2"
                    title="List view"
                  >
                    <FiList className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setViewMode('grid')}
                    className="btn-secondary p-2"
                    title="Grid view"
                  >
                    <FiGrid className="w-5 h-5" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Search Bar */}
        {wishlist.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search in wishlist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 pr-10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Bulk Actions Bar */}
        {isBulkMode && selectedItems.length > 0 && (
          <div className="bg-primary-50 rounded-lg p-4 mb-6 flex flex-wrap justify-between items-center">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedItems.length === filteredWishlist.length && filteredWishlist.length > 0}
                onChange={selectAll}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">
                {selectedItems.length} item(s) selected
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleBulkAddToCart}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <FiShoppingCart /> Add to Cart
              </button>
              <button
                onClick={handleBulkRemove}
                className="btn-secondary flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
              >
                <FiTrash2 /> Remove
              </button>
            </div>
          </div>
        )}

        {/* Wishlist Content */}
        {wishlist.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiHeart className="w-12 h-12 text-pink-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6">
              Save items you love to your wishlist and come back to them later
            </p>
            <Link to="/products" className="btn-primary inline-flex items-center gap-2">
              <FiShoppingCart /> Start Shopping
            </Link>
          </div>
        ) : filteredWishlist.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FiSearch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No matching items</h3>
            <p className="text-gray-600 mb-6">
              No items match "{searchTerm}" in your wishlist
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="btn-secondary"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            <AnimatePresence>
              {filteredWishlist.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  {/* Bulk Select Checkbox */}
                  {isBulkMode && (
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(product._id)}
                        onChange={() => toggleSelectItem(product._id)}
                        className="w-4 h-4"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}

                  {/* Product Image */}
                  <Link 
                    to={`/product/${product.slug || product._id}`}
                    className={viewMode === 'list' ? 'w-48 flex-shrink-0' : 'block'}
                  >
                    <img
                      src={product.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=No+Image'}
                      alt={product.name}
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  {/* Product Info */}
                  <div className={`p-4 flex-1 ${viewMode === 'grid' ? '' : 'flex flex-col justify-between'}`}>
                    <div>
                      {/* Brand */}
                      {product.brand && (
                        <p className="text-xs text-primary-600 font-semibold mb-1">{product.brand}</p>
                      )}
                      
                      {/* Name */}
                      <Link to={`/product/${product.slug || product._id}`}>
                        <h3 className="font-semibold text-gray-800 hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                          {product.name}
                        </h3>
                      </Link>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex">
                          {getRatingStars(product.ratings?.average)}
                        </div>
                        <span className="text-xs text-gray-500">
                          ({product.ratings?.count || 0})
                        </span>
                      </div>
                      
                      {/* Price */}
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-xl font-bold text-primary-600">
                          ${product.price?.toFixed(2)}
                        </span>
                        {product.comparePrice && product.comparePrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            ${product.comparePrice?.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Stock Status */}
                      <div className="mb-3">
                        {product.stock > 0 ? (
                          <span className="text-xs text-green-600">In Stock</span>
                        ) : (
                          <span className="text-xs text-red-600">Out of Stock</span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {!isBulkMode && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0}
                          className="flex-1 btn-primary py-2 text-sm flex items-center justify-center gap-1"
                        >
                          <FiShoppingCart className="w-4 h-4" />
                          Add to Cart
                        </button>
                        <button
                          onClick={() => handleMoveToCart(product)}
                          disabled={product.stock === 0}
                          className="btn-secondary py-2 px-3 text-sm"
                          title="Move to cart"
                        >
                          <FiMove className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveFromWishlist(product._id)}
                          className="btn-secondary py-2 px-3 text-sm text-red-600 hover:text-red-700"
                          title="Remove from wishlist"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleShare(product)}
                          className="btn-secondary py-2 px-3 text-sm"
                          title="Share product"
                        >
                          <FiShare2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Wishlist Tips */}
        {wishlist.length > 0 && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <FiHeart className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Wishlist Tips</p>
                <p className="text-sm text-blue-700">
                  • Items in your wishlist are saved until you remove them<br />
                  • You'll receive price drop alerts for items in your wishlist<br />
                  • Add items to cart directly from your wishlist
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;