import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  FiShoppingCart, FiHeart, FiShare2, FiStar, 
  FiTruck, FiShield, FiRefreshCw, FiMinus, FiPlus,
  FiCheck, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { addToCart, addToGuestCart } from '../redux/slices/cartSlice';
import { addToWishlist } from '../redux/slices/authSlice';
import api from '../services/api';
import ProductCard from '../components/product/ProductCard';
// import ReviewCard from '../components/product/ReviewCard';
// import ReviewForm from '../components/product/ReviewForm';
// Import the custom gallery instead of react-image-gallery
import SimpleImageGallery from '../components/product/SimpleImageGallery';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data.product);
      
      // Fetch related products
      const relatedResponse = await api.get(`/products/${id}/related`);
      setRelatedProducts(relatedResponse.data.products);
      
      // Add to recently viewed if authenticated
      if (isAuthenticated) {
        await api.post(`/users/recently-viewed/${id}`);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (product.stock < quantity) {
      toast.error('Insufficient stock');
      return;
    }
    
    if (isAuthenticated) {
      await dispatch(addToCart({ productId: product._id, quantity }));
      toast.success('Added to cart!');
    } else {
      dispatch(addToGuestCart({ product: product, quantity }));
      toast.success('Added to cart!');
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      navigate('/login');
      return;
    }
    await dispatch(addToWishlist(product._id));
    toast.success('Added to wishlist!');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  // Prepare images for the gallery
  const images = product?.images?.map(img => ({
    url: img.url,
    alt: img.alt || product?.name
  })) || [];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-200 h-96 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const discount = product.comparePrice 
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <span className="hover:text-primary-600 cursor-pointer" onClick={() => navigate('/')}>
          Home
        </span>
        {' / '}
        <span className="hover:text-primary-600 cursor-pointer" onClick={() => navigate('/products')}>
          Products
        </span>
        {' / '}
        <span className="text-gray-900">{product.name}</span>
      </div>

      {/* Product Main Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Image Gallery - Using custom SimpleImageGallery */}
        <div className="sticky top-24">
          <SimpleImageGallery images={images} />
        </div>

        {/* Product Info */}
        <div>
          {product.brand && (
            <p className="text-primary-600 text-sm mb-2">{product.brand}</p>
          )}
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          
          {/* Ratings */}
          <div className="flex items-center mb-4">
            <div className="flex text-yellow-400">
              {'★'.repeat(Math.floor(product.ratings?.average || 0))}
              {'☆'.repeat(5 - Math.floor(product.ratings?.average || 0))}
            </div>
            <span className="text-gray-600 ml-2">
              ({product.ratings?.count || 0} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-primary-600">
                ${product.price}
              </span>
              {product.comparePrice && (
                <span className="text-xl text-gray-500 line-through">
                  ${product.comparePrice}
                </span>
              )}
              {discount > 0 && (
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded-md text-sm font-semibold">
                  Save {discount}%
                </span>
              )}
            </div>
          </div>

          {/* Short Description */}
          <p className="text-gray-600 mb-6">{product.shortDescription || product.description?.substring(0, 200)}</p>

          {/* Stock Status */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <p className="text-green-600 flex items-center">
                <FiCheck className="mr-1" /> In Stock ({product.stock} available)
              </p>
            ) : (
              <p className="text-red-600">Out of Stock</p>
            )}
          </div>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-gray-700">Quantity:</span>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100"
                  disabled={quantity <= 1}
                >
                  <FiMinus />
                </button>
                <span className="w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 hover:bg-gray-100"
                  disabled={quantity >= product.stock}
                >
                  <FiPlus />
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="btn-primary flex-1 flex items-center justify-center py-3"
            >
              <FiShoppingCart className="mr-2" />
              Add to Cart
            </button>
            <button
              onClick={handleAddToWishlist}
              className="btn-secondary py-3 px-6"
            >
              <FiHeart />
            </button>
            <button
              onClick={handleShare}
              className="btn-secondary py-3 px-6"
            >
              <FiShare2 />
            </button>
          </div>

          {/* Shipping Info */}
          <div className="border-t pt-6 space-y-3">
            <div className="flex items-center text-gray-600">
              <FiTruck className="mr-3 text-primary-600" />
              <div>
                <p className="font-semibold">Free Shipping</p>
                <p className="text-sm">Free delivery on orders over $50</p>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <FiRefreshCw className="mr-3 text-primary-600" />
              <div>
                <p className="font-semibold">30-Day Returns</p>
                <p className="text-sm">Return or exchange within 30 days</p>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <FiShield className="mr-3 text-primary-600" />
              <div>
                <p className="font-semibold">Secure Payment</p>
                <p className="text-sm">100% secure payment methods</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mb-12">
        <div className="border-b flex space-x-8">
          {['description', 'specifications', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-primary-600 text-primary-600 font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="pt-6">
          {activeTab === 'description' && (
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
          )}
          
          {activeTab === 'specifications' && product.specifications && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex border-b py-2">
                  <span className="font-semibold w-1/3 capitalize">{key}:</span>
                  <span className="text-gray-600 w-2/3">{value}</span>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Customer Reviews</h3>
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="btn-primary"
                >
                  Write a Review
                </button>
              </div>
              
              {showReviewForm && (
                <ReviewForm productId={product._id} onSuccess={() => {
                  setShowReviewForm(false);
                  fetchProduct();
                }} />
              )}
              
              {product.reviews?.length > 0 ? (
                <div className="space-y-4">
                  {product.reviews.map((review) => (
                    <ReviewCard key={review._id} review={review} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;