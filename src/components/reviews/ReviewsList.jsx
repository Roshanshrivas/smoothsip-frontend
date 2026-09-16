import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Star, StarHalf, CheckCircle, User, ThumbsUp, ThumbsDown, Image, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { reviewService } from '../../services/reviewService';
import ReviewStats from './ReviewStats';

const ReviewsList = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ total: 0, avgRating: 0 });
  const [breakdown, setBreakdown] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState('recent');
  const [expandedReviews, setExpandedReviews] = useState(new Set());

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId, page, sort]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await reviewService.getProductReviews(productId, { page, limit: 5, sort });
      setReviews(data.reviews || []);
      setStats(data.stats || { total: 0, avgRating: 0 });
      setBreakdown(data.stats?.breakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (id) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const renderStars = (rating, size = 16) => {
    const full = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;
    const empty = 5 - full - (hasHalf ? 1 : 0);
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(full)].map((_, i) => (
          <Star key={`full-${i}`} size={size} className="fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalf && <StarHalf size={size} className="fill-yellow-400 text-yellow-400" />}
        {[...Array(empty)].map((_, i) => (
          <Star key={`empty-${i}`} size={size} className="text-gray-300" />
        ))}
      </div>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleHelpful = async (reviewId, isHelpful) => {
    // Implement helpful voting
    toast.success('Thanks for your feedback!');
  };

  if (loading && page === 1) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (reviews.length === 0 && stats.total === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <MessageCircle size={48} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">No reviews yet</p>
        <p className="text-sm text-gray-400">Be the first to review this product!</p>
      </div>
    );
  }

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'highest', label: 'Highest Rating' },
    { value: 'lowest', label: 'Lowest Rating' },
    { value: 'helpful', label: 'Most Helpful' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <ReviewStats stats={stats} ratingBreakdown={breakdown} />

      {/* Sort & Count */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">{stats.total} reviews</p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        {reviews.map((review, idx) => {
          const isExpanded = expandedReviews.has(review._id);
          const isLongComment = review.comment && review.comment.length > 200;
          const displayComment = isExpanded || !isLongComment 
            ? review.comment 
            : `${review.comment.slice(0, 200)}...`;

          return (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">
                  {review.user?.name?.[0] || 'U'}
                </div>
                
                <div className="flex-1 min-w-0">
                  {/* User & Rating */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-gray-900">{review.user?.name || 'Anonymous'}</span>
                    {review.isVerifiedPurchase && (
                      <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <CheckCircle size={12} /> Verified
                      </span>
                    )}
                    <span className="text-xs text-gray-400">• {formatDate(review.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(review.rating, 16)}
                    {review.title && (
                      <span className="text-sm font-semibold text-gray-800 ml-1">{review.title}</span>
                    )}
                  </div>

                  {/* Comment */}
                  {review.comment && (
                    <div className="mt-3 text-gray-700 text-sm leading-relaxed">
                      <p>{displayComment}</p>
                      {isLongComment && (
                        <button
                          onClick={() => toggleExpanded(review._id)}
                          className="text-orange-500 hover:text-orange-600 text-xs font-medium mt-1"
                        >
                          {isExpanded ? 'Show less' : 'Read more'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {review.images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`Review ${i}`}
                          className="w-20 h-20 rounded-lg object-cover border border-gray-200 cursor-pointer hover:opacity-80 transition"
                          onClick={() => window.open(img, '_blank')}
                        />
                      ))}
                    </div>
                  )}

                  {/* Helpful buttons */}
                  <div className="flex items-center gap-4 mt-3">
                    <button
                      onClick={() => handleHelpful(review._id, true)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-600 transition"
                    >
                      <ThumbsUp size={14} /> Helpful ({review.helpful || 0})
                    </button>
                    <button
                      onClick={() => handleHelpful(review._id, false)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition"
                    >
                      <ThumbsDown size={14} />
                    </button>
                  </div>

                  {/* Admin Reply */}
                  {review.reply && (
                    <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                        <User size={14} className="text-orange-500" /> Admin
                      </div>
                      <p className="text-sm text-gray-600">{review.reply}</p>
                      {review.repliedAt && (
                        <p className="text-xs text-gray-400 mt-1">Replied on {formatDate(review.repliedAt)}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm font-medium text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewsList;