import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiEye } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, addToGuestCart } from '../../redux/slices/cartSlice';
import { addToWishlist } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

const ProductCard = ({ product, featured = false }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      await dispatch(addToCart({ productId: product._id, quantity: 1 }));
      toast.success('Added to cart!');
    } else {
      dispatch(addToGuestCart({ product: product, quantity: 1 }));
      toast.success('Added to cart!');
    }
  };

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }
    await dispatch(addToWishlist(product._id));
    toast.success('Added to wishlist!');
  };

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="card group"
    >
      <Link to={`/product/${product._id}`}>
        <div className="relative overflow-hidden">
          <img
            src={product.images[0]?.url || 'https://via.placeholder.com/300'}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
          />
          
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-bold">
              -{discount}%
            </div>
          )}
          
          {featured && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-sm font-bold">
              Featured
            </div>
          )}
          
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Out of Stock</span>
            </div>
          )}
          
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100">
            <button
              onClick={handleAddToCart}
              className="bg-white text-gray-800 p-2 rounded-full hover:bg-primary-600 hover:text-white transition-colors"
              disabled={product.stock === 0}
            >
              <FiShoppingCart className="w-5 h-5" />
            </button>
            <button
              onClick={handleAddToWishlist}
              className="bg-white text-gray-800 p-2 rounded-full hover:bg-primary-600 hover:text-white transition-colors"
            >
              <FiHeart className="w-5 h-5" />
            </button>
            <Link
              to={`/product/${product._id}`}
              className="bg-white text-gray-800 p-2 rounded-full hover:bg-primary-600 hover:text-white transition-colors"
            >
              <FiEye className="w-5 h-5" />
            </Link>
          </div>
        </div>
        
        <div className="p-4">
          <div className="text-sm text-gray-500 mb-1">{product.category?.name || 'Uncategorized'}</div>
          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
          
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400">
              {'★'.repeat(Math.floor(product.ratings?.average || 0))}
              {'☆'.repeat(5 - Math.floor(product.ratings?.average || 0))}
            </div>
            <span className="text-sm text-gray-500 ml-2">({product.ratings?.count || 0})</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary-600">${product.price}</span>
            {product.comparePrice && (
              <span className="text-sm text-gray-500 line-through">${product.comparePrice}</span>
            )}
          </div>
          
          {product.stock > 0 && product.stock < 10 && (
            <p className="text-sm text-orange-600 mt-2">Only {product.stock} left in stock!</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;