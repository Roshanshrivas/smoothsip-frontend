import React from 'react';
import { Star, StarHalf } from 'lucide-react';
import { motion } from 'framer-motion';

const ReviewStats = ({ stats, ratingBreakdown }) => {
  const { total, avgRating } = stats;
  const breakdown = ratingBreakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const totalRatings = Object.values(breakdown).reduce((a, b) => a + b, 0) || 1;

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;
    const empty = 5 - full - (hasHalf ? 1 : 0);
    return (
      <div className="flex items-center">
        {[...Array(full)].map((_, i) => (
          <Star key={`full-${i}`} size={16} className="fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalf && <StarHalf size={16} className="fill-yellow-400 text-yellow-400" />}
        {[...Array(empty)].map((_, i) => (
          <Star key={`empty-${i}`} size={16} className="text-gray-300" />
        ))}
      </div>
    );
  };

  const getPercentage = (count) => {
    return totalRatings > 0 ? (count / totalRatings) * 100 : 0;
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Rating & Reviews</h3>
      
      <div className="flex items-center gap-6">
        <div className="text-center">
          <span className="text-5xl font-bold text-gray-900">{avgRating.toFixed(1)}</span>
          <div className="flex justify-center mt-1">
            {renderStars(avgRating)}
          </div>
          <p className="text-sm text-gray-500 mt-1">{total} reviews</p>
        </div>
        
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = breakdown[star] || 0;
            const percentage = getPercentage(count);
            return (
              <div key={star} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 w-8">{star}★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: (5 - star) * 0.05 }}
                    className="h-full bg-yellow-400 rounded-full"
                  />
                </div>
                <span className="text-sm text-gray-500 w-12 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReviewStats;