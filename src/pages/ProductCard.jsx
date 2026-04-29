import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiEye, FiStar } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, addToGuestCart } from '../../redux/slices/cartSlice';
import { addToWishlist } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

const ProductCard = ({ product, featured = false }) => {
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.slug || product._id}`}>
        {/* Image Container */}
        <div className="relative overflow-hidden bg-gray-100 aspect-square">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
          )}
          <img
            src={primaryImage?.url || 'https://via.placeholder.com/400x400?text=No+Image'}
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
            {featured && (
              <span className="bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                Featured
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
          
          {/* Action Buttons */}
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-2 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="bg-white text-gray-800 p-2 rounded-full hover:bg-primary-600 hover:text-white transition-all duration-200 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiShoppingCart className="w-5 h-5" />
            </button>
            <button
              onClick={handleAddToWishlist}
              className="bg-white text-gray-800 p-2 rounded-full hover:bg-primary-600 hover:text-white transition-all duration-200 transform hover:scale-110"
            >
              <FiHeart className="w-5 h-5" />
            </button>
            <Link
              to={`/product/${product.slug || product._id}`}
              className="bg-white text-gray-800 p-2 rounded-full hover:bg-primary-600 hover:text-white transition-all duration-200 transform hover:scale-110"
            >
              <FiEye className="w-5 h-5" />
            </Link>
          </div>
        </div>
        
        {/* Product Info */}
        <div className="p-4">
          {/* Brand */}
          {product.brand && (
            <p className="text-xs text-primary-600 font-semibold mb-1">{product.brand}</p>
          )}
          
          {/* Category */}
          {product.category && (
            <p className="text-xs text-gray-500 mb-1">{product.category.name}</p>
          )}
          
          {/* Name */}
          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 h-12">
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
          
          {/* Price */}
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
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;