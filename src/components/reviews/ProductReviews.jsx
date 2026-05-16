import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FiEdit3, FiFilter } from 'react-icons/fi';
import api from '../../services/api';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import RatingStars from '../common/RatingStars';

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average: 0, count: 0, distribution: { 1:0, 2:0, 3:0, 4:0, 5:0 } });
  const [canReview, setCanReview] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('newest'); // newest, highest, lowest
  const { user } = useSelector(state => state.auth);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/products/${productId}/reviews?sort=${filter}`);
      if (res.data.success) {
        setReviews(res.data.reviews || []);
        setStats({
          average: res.data.averageRating || 0,
          count: res.data.totalReviews || 0,
          distribution: res.data.ratingDistribution || { 1:0, 2:0, 3:0, 4:0, 5:0 }
        });
        setCanReview(res.data.canReview || false);
      }
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, filter]);

  const handleReviewSuccess = () => {
    setShowForm(false);
    setCanReview(false);
    fetchReviews();
  };

  if (loading) {
    return <div className="py-8 text-center text-gray-500">Loading reviews...</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 my-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {/* Rating Summary */}
        <div className="col-span-1 flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl">
          <div className="text-5xl font-bold text-gray-900 mb-2">{stats.average?.toFixed(1)}</div>
          <div className="mb-2 scale-110"><RatingStars rating={stats.average} /></div>
          <p className="text-sm text-gray-500">Based on {stats.count} reviews</p>
        </div>
        
        {/* Rating Distribution */}
        <div className="col-span-1 md:col-span-2 flex flex-col justify-center space-y-2">
          {[5, 4, 3, 2, 1].map(star => {
            const count = stats.distribution[star] || 0;
            const percentage = stats.count > 0 ? (count / stats.count) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 w-12 font-medium text-gray-600">
                  {star} <RatingStars rating={1} />
                </div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-10 text-right text-gray-500">{count}</div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Review Action & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center pb-6 border-b border-gray-100 gap-4">
        <div>
          {canReview ? (
            <button 
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              <FiEdit3 /> Write a Review
            </button>
          ) : user ? (
            <p className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">Only users who purchased this item can write a review.</p>
          ) : (
            <p className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">Please login to write a review.</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-400" />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border-none bg-transparent font-medium text-gray-700 focus:ring-0 cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>
      
      {/* Reviews List */}
      <div className="mt-2">
        {reviews.length > 0 ? (
          reviews.map(review => (
            <ReviewCard key={review._id} review={review} onUpdate={fetchReviews} />
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            No reviews yet. Be the first to review this product!
          </div>
        )}
      </div>

      {showForm && (
        <ReviewForm 
          productId={productId} 
          onClose={() => setShowForm(false)} 
          onSuccess={handleReviewSuccess} 
        />
      )}
    </div>
  );
};

export default ProductReviews;
