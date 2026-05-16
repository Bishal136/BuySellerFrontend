import { useState } from 'react';
import { FiThumbsUp, FiMessageSquare } from 'react-icons/fi';
import RatingStars from '../common/RatingStars';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const ReviewCard = ({ review, onUpdate }) => {
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful?.length || 0);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const { user } = useSelector(state => state.auth);

  const handleHelpful = async () => {
    if (!user) {
      toast.error('Please login to vote');
      return;
    }
    if (user.id === review.user._id) {
      toast.error('You cannot vote on your own review');
      return;
    }

    try {
      const res = await api.post(`/products/reviews/${review._id}/helpful`);
      if (res.data.success) {
        setIsHelpful(res.data.hasVoted);
        setHelpfulCount(res.data.helpfulCount);
      }
    } catch (err) {
      toast.error('Failed to register vote');
    }
  };

  const submitReply = async () => {
    if (!replyText.trim()) return;
    try {
      const res = await api.post(`/products/reviews/${review._id}/reply`, { comment: replyText });
      if (res.data.success) {
        toast.success('Reply added');
        setShowReplyForm(false);
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      toast.error('Failed to add reply');
    }
  };

  return (
    <div className="border-b border-gray-100 py-6 last:border-0">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h4 className="font-semibold text-gray-900">{review.user?.name || 'Anonymous User'}</h4>
            {review.verifiedPurchase && (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                Verified Purchase
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <RatingStars rating={review.rating} />
            <span className="text-sm text-gray-500">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      
      {review.title && <h5 className="font-semibold text-gray-800 mb-2">{review.title}</h5>}
      <p className="text-gray-600 text-sm leading-relaxed mb-4">{review.comment}</p>
      
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-4">
          {review.images.map((img, idx) => (
            <img key={idx} src={img} alt="Review" className="w-16 h-16 object-cover rounded-lg border" />
          ))}
        </div>
      )}
      
      <div className="flex items-center gap-4">
        <button 
          onClick={handleHelpful}
          className={`flex items-center gap-1 text-sm ${isHelpful ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <FiThumbsUp className={isHelpful ? 'fill-primary-600 text-primary-600' : ''} />
          <span>Helpful ({helpfulCount})</span>
        </button>
        
        {user?.role === 'seller' && !review.sellerReply && (
          <button 
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600"
          >
            <FiMessageSquare />
            Reply as Seller
          </button>
        )}
      </div>

      {showReplyForm && (
        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your response..."
            className="w-full p-3 border rounded-lg text-sm mb-2"
            rows="3"
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowReplyForm(false)} className="px-3 py-1 text-sm text-gray-600">Cancel</button>
            <button onClick={submitReply} className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700">Submit Reply</button>
          </div>
        </div>
      )}

      {review.sellerReply && (
        <div className="mt-4 bg-gray-50 p-4 rounded-lg ml-4 border-l-4 border-primary-500">
          <div className="flex items-center gap-2 mb-2">
            <h5 className="font-semibold text-sm text-gray-900">Seller Response</h5>
            <span className="text-xs text-gray-500">{new Date(review.sellerReply.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-sm text-gray-600">{review.sellerReply.comment}</p>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
