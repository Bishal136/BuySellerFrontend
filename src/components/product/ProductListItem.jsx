import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiEye, FiStar, FiTruck, FiRefreshCw } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, addToGuestCart } from '../../redux/slices/cartSlice';
import { addToWishlist } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

const ProductListItem = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }
    await dispatch(addToWishlist(product._id));
    toast.success('Added to wishlist!');
  };

  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.slug || product._id}`} className="block">
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="relative md:w-48 h-48 bg-gray-100 overflow-hidden">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
              </div>
            )}
            <img
              src={primaryImage?.url || 'https://via.placeholder.com/200x200?text=No+Image'}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-500 ${
                isHovered ? 'scale-110' : 'scale-100'
              } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
            />
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {discount > 0 && (
                <span className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                  -{discount}%
                </span>
              )}
              {product.stock === 0 && (
                <span className="bg-gray-700 text-white px-2 py-1 rounded-md text-xs font-bold">
                  Out of Stock
                </span>
              )}
              {product.stock > 0 && product.stock < 10 && (
                <span className="bg-orange-500 text-white px-2 py-1 rounded-md text-xs">
                  Only {product.stock} left
                </span>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1 p-4">
            <div className="flex flex-col h-full">
              {/* Brand & Category */}
              <div className="mb-2">
                {product.brand && (
                  <span className="text-xs text-primary-600 font-semibold">{product.brand}</span>
                )}
                {product.category && (
                  <span className="text-xs text-gray-500 ml-2">{product.category.name}</span>
                )}
              </div>

              {/* Title */}
              <h3 className="font-semibold text-gray-800 hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                {product.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.ratings?.average || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-1">
                  ({product.ratings?.count || 0})
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {product.shortDescription || product.description?.substring(0, 150)}
              </p>

              {/* Price & Actions */}
              <div className="flex items-center justify-between mt-auto">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-primary-600">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.comparePrice && product.comparePrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.comparePrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {discount > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      Save ${(product.comparePrice - product.price).toFixed(2)}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="btn-primary py-2 px-4 text-sm flex items-center gap-1"
                  >
                    <FiShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                  <button
                    onClick={handleAddToWishlist}
                    className="btn-secondary py-2 px-3 text-sm"
                    title="Add to wishlist"
                  >
                    <FiHeart className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="flex gap-3 mt-3 pt-3 border-t text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <FiTruck className="w-3 h-3" /> Free Shipping
                </span>
                <span className="flex items-center gap-1">
                  <FiRefreshCw className="w-3 h-3" /> 30-Day Returns
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductListItem;