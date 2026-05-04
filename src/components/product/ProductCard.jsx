import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiShoppingCart, FiHeart, FiEye, FiStar, 
  FiCheck, FiAlertCircle, FiTag
} from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, addToGuestCart } from '../../redux/slices/cartSlice';
import { addToWishlist } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';
import { formatBDT, formatNumber, calculateDiscount } from '../../utils/currency';
import { PRODUCT_PLACEHOLDER } from '../../utils/placeholderImages';

const ProductCard = ({ product, featured = false, viewMode = 'grid' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);

  // Check if product is already in cart
  const isInCart = items?.some(item => 
    (item.productId === product._id || item.product?._id === product._id)
  );

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock === 0) {
      toast.error('Out of stock!');
      return;
    }
    
    setIsAddingToCart(true);
    
    try {
      if (isAuthenticated) {
        await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
        toast.success('Added to cart!', { icon: '🛒' });
      } else {
        dispatch(addToGuestCart({ product, quantity: 1 }));
        toast.success('Added to cart!', { icon: '🛒' });
      }
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }
    
    setIsAddingToWishlist(true);
    try {
      await dispatch(addToWishlist(product._id)).unwrap();
      toast.success('Added to wishlist!', { icon: '❤️' });
    } catch (error) {
      toast.error('Failed to add to wishlist');
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const discount = calculateDiscount(product.comparePrice, product.price);
  const savings = product.comparePrice && product.comparePrice > product.price 
    ? product.comparePrice - product.price 
    : 0;
  
  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  const rating = product.ratings?.average || 0;
  const reviewCount = product.ratings?.count || 0;

  // List view card
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/product/${product.slug || product._id}`} className="block">
          <div className="flex flex-col sm:flex-row">
            {/* Image Section */}
            <div className="relative sm:w-48 h-48 bg-gray-100 overflow-hidden flex-shrink-0">
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
                </div>
              )}
              <img
                src={primaryImage?.url || PRODUCT_PLACEHOLDER}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  isHovered ? 'scale-110' : 'scale-100'
                } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = PRODUCT_PLACEHOLDER;
                }}
              />
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {discount > 0 && (
                  <span className="bg-red-500 text-white px-2 py-0.5 rounded-md text-xs font-bold">
                    -{discount}%
                  </span>
                )}
                {featured && (
                  <span className="bg-yellow-500 text-white px-2 py-0.5 rounded-md text-xs font-bold">
                    Featured
                  </span>
                )}
                {product.stock === 0 && (
                  <span className="bg-gray-700 text-white px-2 py-0.5 rounded-md text-xs font-bold">
                    Out of Stock
                  </span>
                )}
              </div>
              
              {/* Stock Warning */}
              {product.stock > 0 && product.stock <= 10 && (
                <div className="absolute bottom-2 left-2 right-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded text-center">
                  Only {product.stock} left!
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="flex-1 p-4">
              <div className="flex flex-col h-full">
                {/* Brand & SKU */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {product.brand && (
                      <span className="text-xs text-primary-600 font-semibold">{product.brand}</span>
                    )}
                    {product.sku && (
                      <span className="text-xs text-gray-400">SKU: {product.sku}</span>
                    )}
                  </div>
                  {savings > 0 && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <FiTag className="w-3 h-3" />
                      Save {formatBDT(savings)}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-semibold text-gray-800 hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.floor(rating)
                            ? 'text-yellow-400 fill-current'
                            : star <= rating
                            ? 'text-yellow-400 half-fill'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                  {product.soldCount > 0 && (
                    <span className="text-xs text-gray-500">
                      • {formatNumber(product.soldCount)} sold
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {product.shortDescription || product.description?.substring(0, 120) || 'No description available'}
                </p>

                {/* Price & Actions */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-primary-600">
                        {formatBDT(product.price)}
                      </span>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatBDT(product.comparePrice)}
                        </span>
                      )}
                    </div>
                    {discount > 0 && (
                      <p className="text-xs text-green-600">
                        You save {formatBDT(savings)} ({discount}% off)
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddToCart}
                      disabled={product.stock === 0 || isAddingToCart}
                      className={`btn-primary py-2 px-4 text-sm flex items-center gap-2 transition-all ${
                        product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isAddingToCart ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : isInCart ? (
                        <>
                          <FiCheck className="w-4 h-4" />
                          Added
                        </>
                      ) : (
                        <>
                          <FiShoppingCart className="w-4 h-4" />
                          Add to Cart
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleAddToWishlist}
                      disabled={isAddingToWishlist}
                      className="btn-secondary py-2 px-3 text-sm"
                      title="Add to wishlist"
                    >
                      {isAddingToWishlist ? (
                        <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <FiHeart className="w-4 h-4" />
                      )}
                    </button>
                    <Link
                      to={`/product/${product.slug || product._id}`}
                      className="btn-secondary py-2 px-3 text-sm"
                      title="Quick view"
                    >
                      <FiEye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Grid view card (default)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.slug || product._id}`} className="block">
        {/* Image Container */}
        <div className="relative overflow-hidden bg-gray-100 aspect-square">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
          )}
          <img
            src={primaryImage?.url || PRODUCT_PLACEHOLDER}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isHovered ? 'scale-110' : 'scale-100'
            } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = PRODUCT_PLACEHOLDER;
            }}
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <span className="bg-red-500 text-white px-2 py-0.5 rounded-md text-xs font-bold z-10">
                -{discount}%
              </span>
            )}
            {featured && (
              <span className="bg-yellow-500 text-white px-2 py-0.5 rounded-md text-xs font-bold z-10">
                Featured
              </span>
            )}
            {product.isNew && (
              <span className="bg-green-500 text-white px-2 py-0.5 rounded-md text-xs font-bold z-10">
                New
              </span>
            )}
          </div>
          
          {/* Stock Badge */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <span className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm font-bold">
                Out of Stock
              </span>
            </div>
          )}
          
          {/* Low Stock Indicator */}
          {product.stock > 0 && product.stock <= 10 && (
            <div className="absolute bottom-2 left-2 right-2 bg-orange-500/90 text-white text-xs px-2 py-1 rounded text-center z-10">
              <FiAlertCircle className="w-3 h-3 inline mr-1" />
              Only {product.stock} left!
            </div>
          )}
          
          {/* Action Buttons - Appear on hover */}
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-2 transition-opacity duration-300 z-10 ${
            isHovered && product.stock > 0 ? 'opacity-100' : 'opacity-0'
          }`}>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAddingToCart}
              className="bg-white text-gray-800 p-2 rounded-full hover:bg-primary-600 hover:text-white transition-all duration-200 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Add to cart"
            >
              {isAddingToCart ? (
                <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              ) : isInCart ? (
                <FiCheck className="w-5 h-5" />
              ) : (
                <FiShoppingCart className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={handleAddToWishlist}
              disabled={isAddingToWishlist}
              className="bg-white text-gray-800 p-2 rounded-full hover:bg-primary-600 hover:text-white transition-all duration-200 transform hover:scale-110"
              title="Add to wishlist"
            >
              {isAddingToWishlist ? (
                <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FiHeart className="w-5 h-5" />
              )}
            </button>
            <Link
              to={`/product/${product.slug || product._id}`}
              className="bg-white text-gray-800 p-2 rounded-full hover:bg-primary-600 hover:text-white transition-all duration-200 transform hover:scale-110"
              title="Quick view"
            >
              <FiEye className="w-5 h-5" />
            </Link>
          </div>
        </div>
        
        {/* Product Info */}
        <div className="p-4">
          {/* Brand */}
          {product.brand && (
            <p className="text-xs text-primary-600 font-semibold mb-1 truncate">{product.brand}</p>
          )}
          
          {/* Category */}
          {product.category && (
            <p className="text-xs text-gray-500 mb-1 truncate">{product.category.name}</p>
          )}
          
          {/* Name */}
          <h3 className="font-semibold text-gray-800 hover:text-primary-600 transition-colors line-clamp-2 mb-2 min-h-[3rem]">
            {product.name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    className={`w-3 h-3 ${
                      star <= Math.floor(rating)
                        ? 'text-yellow-400 fill-current'
                        : star <= rating
                        ? 'text-yellow-400 half-fill'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">({reviewCount})</span>
            </div>
            {product.soldCount > 0 && (
              <span className="text-xs text-gray-400">{formatNumber(product.soldCount)} sold</span>
            )}
          </div>
          
          {/* Price */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-lg font-bold text-primary-600">
              {formatBDT(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                {formatBDT(product.comparePrice)}
              </span>
            )}
            {discount > 0 && (
              <span className="text-xs text-green-600 font-medium">
                Save {discount}%
              </span>
            )}
          </div>
          
          {/* Free Shipping Indicator */}
          {product.price >= 5000 && (
            <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
              <FiCheck className="w-3 h-3" />
              Free Shipping
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;