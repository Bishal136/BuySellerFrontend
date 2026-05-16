import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiPackage, FiMessageSquare } from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import ReviewForm from '../components/reviews/ReviewForm';
import RatingStars from '../components/common/RatingStars';
import { PLACEHOLDER_IMAGE } from '../utils/placeholder';

const ReviewsPage = () => {
  const [activeTab, setActiveTab] = useState('to-review'); // 'to-review' or 'history'
  const [toReviewItems, setToReviewItems] = useState([]);
  const [reviewHistory, setReviewHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const fetchMyReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products/my-reviews');
      if (res.data.success) {
        setToReviewItems(res.data.toReview);
        setReviewHistory(res.data.reviews);
      }
    } catch (error) {
      toast.error('Failed to load reviews data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const handleWriteReview = (productId) => {
    setSelectedProductId(productId);
    setShowReviewForm(true);
  };

  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    setSelectedProductId(null);
    fetchMyReviews(); // Refresh lists
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your reviews...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">My Reviews</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('to-review')}
            className={`flex-1 py-4 font-medium transition-colors ${
              activeTab === 'to-review'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            To Review ({toReviewItems.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-4 font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            History ({reviewHistory.length})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'to-review' && (
            <div className="space-y-4">
              {toReviewItems.length > 0 ? (
                toReviewItems.map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-xl gap-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img 
                        src={item.product?.images?.[0]?.url || PLACEHOLDER_IMAGE} 
                        alt={item.product?.name} 
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <Link to={`/product/${item.product?.slug || item.product?._id}`} className="font-semibold text-gray-900 hover:text-primary-600 line-clamp-2">
                          {item.product?.name}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          Delivered on {new Date(item.deliveredAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleWriteReview(item.product._id)}
                      className="w-full sm:w-auto bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors shrink-0"
                    >
                      Write Review
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FiPackage className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>You have no pending items to review.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              {reviewHistory.length > 0 ? (
                reviewHistory.map((review) => (
                  <div key={review._id} className="p-4 border rounded-xl">
                    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 pb-4 border-b">
                      <div className="flex items-center gap-3">
                        <img 
                          src={review.product?.images?.[0]?.url || PLACEHOLDER_IMAGE} 
                          alt={review.product?.name} 
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <Link to={`/product/${review.product?.slug || review.product?._id}`} className="font-medium text-gray-900 hover:text-primary-600">
                            {review.product?.name}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <RatingStars rating={review.rating} />
                            <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className={`px-2 py-1 rounded-full ${review.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    {review.title && <h5 className="font-semibold text-gray-800 mb-1">{review.title}</h5>}
                    <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                    
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {review.images.map((img, i) => (
                          <img key={i} src={img} alt="Review" className="w-16 h-16 object-cover rounded-lg border" />
                        ))}
                      </div>
                    )}

                    {review.sellerReply && (
                      <div className="mt-4 bg-gray-50 p-3 rounded-lg border-l-4 border-primary-500">
                        <div className="flex items-center gap-2 mb-1">
                          <FiMessageSquare className="text-gray-500 w-4 h-4" />
                          <h6 className="font-semibold text-xs text-gray-900">Seller Response</h6>
                        </div>
                        <p className="text-sm text-gray-600">{review.sellerReply.comment}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FiStar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>You haven't written any reviews yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showReviewForm && selectedProductId && (
        <ReviewForm 
          productId={selectedProductId}
          onClose={() => {
            setShowReviewForm(false);
            setSelectedProductId(null);
          }}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
};

export default ReviewsPage;
