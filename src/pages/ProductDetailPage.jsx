import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShoppingCart, FiHeart, FiShare2, FiStar,
  FiTruck, FiShield, FiRefreshCw, FiMinus, FiPlus,
  FiCheck, FiAlertCircle, FiTag, FiMapPin, FiClock,
  FiZap, FiChevronDown, FiChevronUp, FiMessageCircle,
  FiAward, FiThumbsUp, FiFlag, FiUser, FiMail,
  FiPhone, FiHome, FiPackage, FiArrowLeft, FiZoomIn,
  FiX
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { addToCart, addToGuestCart } from '../redux/slices/cartSlice';
import { addToWishlist } from '../redux/slices/authSlice';
import api from '../services/api';
import { formatBDT, formatNumber, calculateDiscount } from '../utils/currency';
import ProductCard from '../components/product/ProductCard';
import ProductReviews from '../components/reviews/ProductReviews';
import YouTubeEmbed from '../components/common/YouTubeEmbed';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Product States
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // UI States
  const [activeTab, setActiveTab] = useState('description');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showSellerInfo, setShowSellerInfo] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [buyingNow, setBuyingNow] = useState(false);

  // Review States
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    average: 0,
    total: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });

  // Zoom States
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const imageContainerRef = useRef(null);

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      let response;
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

      if (isObjectId) {
        response = await api.get(`/products/${id}`);
      } else {
        response = await api.get(`/products/slug/${id}`);
      }

      const fetchedProduct = response.data.product;
      setProduct(fetchedProduct);
      setSeller(fetchedProduct.seller);

      if (fetchedProduct.variants && fetchedProduct.variants.length > 0) {
        setSelectedVariant(fetchedProduct.variants[0]);
      }

      const relatedResponse = await api.get(`/products/${fetchedProduct._id}/related?limit=10`);
      setRelatedProducts(relatedResponse.data.products);

      const reviewsResponse = await api.get(`/products/${fetchedProduct._id}/reviews`);
      setReviews(reviewsResponse.data.reviews);
      setReviewStats(reviewsResponse.data.stats);

    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    const maxStock = selectedVariant ? selectedVariant.stock : product?.stock;
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    const currentStock = selectedVariant ? selectedVariant.stock : product?.stock;
    if (currentStock < quantity) {
      toast.error('Insufficient stock');
      return;
    }

    const cartItem = {
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.images?.[selectedImage]?.url || product.images?.[0]?.url,
      stock: product.stock,
      sellerId: product.seller?._id || product.seller,
      sellerName: seller?.storeName || 'Seller',
      seller: {
        _id: product.seller?._id || product.seller,
        storeName: seller?.storeName
      },
      variant: selectedVariant,
    };

    if (isAuthenticated) {
      await dispatch(addToCart(cartItem));
      toast.success('Added to cart!');
    } else {
      dispatch(addToGuestCart({ product, quantity, variant: selectedVariant }));
      toast.success('Added to cart!');
    }
  };

const handleBuyNow = () => {
  if (product.stock < quantity) {
    toast.error('Insufficient stock');
    return;
  }

  // Create buy now item with seller info
  const buyNowItem = {
    productId: product._id,
    name: product.name,
    price: product.price,
    quantity: quantity,
    image: product.images?.[0]?.url || '',
    sellerId: product.seller?._id || product.seller,
    sellerName: product.seller?.storeName || 'Seller',
    stock: product.stock,
    brand: product.brand
  };

  navigate('/checkout', { 
    state: { 
      buyNowItem: buyNowItem,
      isBuyNow: true 
    } 
  });
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

  // Zoom handlers
  const handleMouseMove = (e) => {
    if (!imageContainerRef.current || !isZooming) return;
    const container = imageContainerRef.current;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x: Math.min(Math.max(x, 0), 100), y: Math.min(Math.max(y, 0), 100) });
  };

  const handleMouseEnter = () => setIsZooming(true);
  const handleMouseLeave = () => setIsZooming(false);
  const openZoomModal = () => setShowZoomModal(true);
  const closeZoomModal = () => setShowZoomModal(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const getCurrentImage = () => product?.images?.[selectedImage]?.url || '/placeholder.jpg';
  const getCurrentImageAlt = () => product?.images?.[selectedImage]?.alt || product?.name || 'Product image';
  const getCurrentPrice = () => selectedVariant ? selectedVariant.price : product?.price || 0;
  const getCurrentStock = () => selectedVariant ? selectedVariant.stock : product?.stock || 0;

  const currentPrice = getCurrentPrice();
  const discountValue = calculateDiscount(product?.comparePrice, currentPrice);
  const savings = product?.comparePrice && product.comparePrice > currentPrice
    ? product.comparePrice - currentPrice : 0;

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-200 h-96 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Back Button - Mobile */}
      <div className="lg:hidden bg-white sticky top-0 z-40 px-4 py-3 border-b">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600">
          <FiArrowLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6 hidden lg:block">
          <span className="hover:text-primary-600 cursor-pointer" onClick={() => navigate('/')}>
            Home
          </span>
          {' > '}
          <span className="hover:text-primary-600 cursor-pointer" onClick={() => navigate('/products')}>
            Products
          </span>
          {' > '}
          <span className="text-gray-900">{product.name}</span>
        </div>

        {/* Product Main Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">

            {/* Left Column - Images with Zoom */}
            <div>
              {/* Main Image Container */}
              <div
                className="relative bg-gray-100 rounded-lg overflow-hidden mb-4 cursor-zoom-in group"
                style={{ aspectRatio: '1 / 1', maxHeight: '500px' }}
                ref={imageContainerRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <img
                  src={getCurrentImage()}
                  alt={getCurrentImageAlt()}
                  className="w-full h-full object-contain transition-transform duration-200"
                  style={{
                    transform: isZooming ? 'scale(1.5)' : 'scale(1)',
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                  }}
                />

                {/* Zoom Indicator */}
                <div className="absolute bottom-2 right-2 bg-black/50 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiZoomIn className="w-4 h-4" />
                </div>

                {/* Fullscreen Zoom Button */}
                <button
                  onClick={openZoomModal}
                  className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <FiZoomIn className="w-4 h-4 text-gray-700" />
                </button>
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative flex-shrink-0 border-2 rounded-lg overflow-hidden transition-all ${selectedImage === idx
                          ? 'border-primary-600 ring-2 ring-primary-200'
                          : 'border-gray-200 hover:border-gray-400'
                        }`}
                      style={{ width: '80px', height: '80px' }}
                    >
                      <img
                        src={img.url}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {selectedImage === idx && (
                        <div className="absolute inset-0 bg-primary-600/10"></div>
                      )}
                    </button>
                  ))}
                </div>
              )}
              
              {/* YouTube Video Embed */}
              {product.youtubeVideoId && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Product Video</h3>
                  <YouTubeEmbed embedId={product.youtubeVideoId} />
                </div>
              )}
            </div>

            {/* Right Column - Product Info */}
            <div>
              {product.brand && (
                <p className="text-primary-600 text-sm mb-2 font-semibold">{product.brand}</p>
              )}

              <h1 className="text-2xl lg:text-3xl font-bold mb-3">{product.name}</h1>

              {/* Ratings Section */}
              <div className="flex items-center gap-4 mb-4 pb-4 border-b">
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400">
                    {'★'.repeat(Math.floor(reviewStats.average))}
                    {'☆'.repeat(5 - Math.floor(reviewStats.average))}
                  </div>
                  <span className="text-gray-600">
                    {reviewStats.average.toFixed(1)} ({reviewStats.total} reviews)
                  </span>
                </div>
                <div className="text-gray-400">|</div>
                <div className="text-gray-600">
                  {formatNumber(product.soldCount || 0)} Sold
                </div>
              </div>

              {/* Price Section */}
              <div className="bg-red-50 p-4 rounded-lg mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl lg:text-4xl font-bold text-red-600">
                    {formatBDT(currentPrice)}
                  </span>
                  {product.comparePrice && product.comparePrice > currentPrice && (
                    <>
                      <span className="text-gray-400 line-through text-lg">
                        {formatBDT(product.comparePrice)}
                      </span>
                      <span className="bg-red-600 text-white px-2 py-0.5 rounded text-sm">
                        -{discountValue}%
                      </span>
                    </>
                  )}
                </div>
                {savings > 0 && (
                  <div className="text-green-600 text-sm mt-1">
                    You save: {formatBDT(savings)}
                  </div>
                )}
              </div>

              {/* Delivery Info */}
              <div className="border rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3 mb-3">
                  <FiTruck className="w-5 h-5 text-primary-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Delivery</p>
                    <p className="text-sm text-gray-600">Free Delivery on orders over ৳5,000</p>
                    <p className="text-xs text-gray-500 mt-1">Estimated delivery: 3-5 business days</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiRefreshCw className="w-5 h-5 text-primary-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Returns</p>
                    <p className="text-sm text-gray-600">7 days easy returns. Learn more</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiShield className="w-5 h-5 text-primary-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Warranty</p>
                    <p className="text-sm text-gray-600">1 year manufacturer warranty</p>
                  </div>
                </div>
              </div>

              {/* Variants Selection */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-4">
                  <p className="font-semibold mb-2">Variants:</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedVariant(variant);
                          setQuantity(1);
                        }}
                        className={`px-4 py-2 border rounded-lg transition-all ${selectedVariant?.sku === variant.sku
                            ? 'border-primary-600 bg-primary-50 text-primary-600'
                            : 'border-gray-300 hover:border-primary-400'
                          }`}
                      >
                        {variant.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <p className="font-semibold mb-2">Quantity:</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="px-4 py-2 hover:bg-gray-100 border-r disabled:opacity-50"
                      disabled={quantity <= 1}
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>
                    <span className="w-16 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="px-4 py-2 hover:bg-gray-100 border-l disabled:opacity-50"
                      disabled={quantity >= getCurrentStock()}
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    {getCurrentStock()} items available
                  </span>
                </div>
              </div>

              {/* Low Stock Warning */}
              {getCurrentStock() <= 10 && getCurrentStock() > 0 && (
                <div className="mb-4 p-3 bg-orange-50 rounded-lg">
                  <p className="text-orange-600 text-sm flex items-center gap-2">
                    <FiAlertCircle className="w-4 h-4" />
                    Only {getCurrentStock()} left in stock! Order soon.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={getCurrentStock() === 0}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FiShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={getCurrentStock() === 0 || buyingNow}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {buyingNow ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <FiZap className="w-5 h-5" />
                      Buy Now
                    </>
                  )}
                </button>
                <button
                  onClick={handleAddToWishlist}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Add to Wishlist"
                >
                  <FiHeart className="w-5 h-5" />
                </button>
                <button
                  onClick={handleShare}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Share"
                >
                  <FiShare2 className="w-5 h-5" />
                </button>
              </div>

              {/* Seller Information */}
              {seller && (
                <div className="border-t pt-4">
                  <button
                    onClick={() => setShowSellerInfo(!showSellerInfo)}
                    className="flex items-center justify-between w-full py-2"
                  >
                    <span className="font-semibold">Seller Information</span>
                    {showSellerInfo ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                  <AnimatePresence>
                    {showSellerInfo && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">Store:</span> {seller.storeName}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Seller Rating:</span>{' '}
                            ⭐ {seller.rating || 'New Seller'}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Member Since:</span>{' '}
                            {seller.createdAt ? new Date(seller.createdAt).getFullYear() : '2024'}
                          </p>
                          <button className="text-primary-600 text-sm hover:underline">
                            View Store →
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-lg shadow-sm mt-6 overflow-hidden">
          <div className="border-b flex overflow-x-auto">
            {['description', 'specifications', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium whitespace-nowrap transition-colors ${activeTab === tab
                    ? 'border-b-2 border-red-600 text-red-600'
                    : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'reviews' && reviewStats.total > 0 && (
                  <span className="ml-1 text-sm">({reviewStats.total})</span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Description Tab */}
            {activeTab === 'description' && (
              <div>
                {product.description ? (
                  <>
                    <div
                      className={`prose max-w-none ${!showFullDescription ? 'max-h-60 overflow-hidden relative' : ''}`}
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                    {!showFullDescription && product.description.length > 500 && (
                      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
                    )}
                    {product.description.length > 500 && (
                      <button
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="text-red-600 mt-4 hover:underline flex items-center gap-1"
                      >
                        {showFullDescription ? 'Show Less' : 'Show More'}
                        <FiChevronDown className={`w-4 h-4 ${showFullDescription ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500">No description available.</p>
                )}

                {/* Additional Policies */}
                {product.returnPolicy && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <FiRefreshCw className="w-4 h-4 text-green-600" />
                      Return Policy
                    </h4>
                    <p className="text-gray-600 text-sm">{product.returnPolicy}</p>
                  </div>
                )}

                {product.warranty && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <FiShield className="w-4 h-4 text-blue-600" />
                      Warranty
                    </h4>
                    <p className="text-gray-600 text-sm">{product.warranty}</p>
                  </div>
                )}
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex border-b py-3">
                      <span className="font-semibold w-2/5 capitalize text-gray-700">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-gray-600 w-3/5">{value}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 col-span-2">No specifications available.</p>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <ProductReviews productId={product._id} />
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {relatedProducts.slice(0, 10).map((relatedProduct) => (
                <ProductCard key={relatedProduct._id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Zoom Modal */}
      <AnimatePresence>
        {showZoomModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={closeZoomModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeZoomModal}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <FiX className="w-8 h-8" />
              </button>
              <div className="bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '1 / 1', maxHeight: '80vh' }}>
                <img
                  ref={imageContainerRef}
                  src={getCurrentImage()}
                  alt={getCurrentImageAlt()}
                  className="w-full h-full object-contain"
                  onClick={closeZoomModal}
                />
              </div>
              <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
                Click anywhere to close
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetailPage;