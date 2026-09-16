import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Star, Upload, X, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { reviewService } from '../../services/reviewService';

const ReviewForm = ({ productId, onReviewSubmitted }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        if (file.size > 2 * 1024 * 1024) {
          toast.error(`"${file.name}" exceeds 2MB limit`);
          continue;
        }
        const url = await reviewService.uploadReviewImage(file);
        uploadedUrls.push(url);
      }
      setImages(prev => [...prev, ...uploadedUrls]);
      if (uploadedUrls.length > 0) {
        toast.success(`${uploadedUrls.length} image(s) uploaded`);
      }
    } catch (error) {
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to submit a review');
      return;
    }
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please write your review');
      return;
    }
    setSubmitting(true);
    try {
      await reviewService.createReview({
        productId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        images,
      });
      toast.success('Review submitted! Waiting for admin approval.');
      setRating(0);
      setTitle('');
      setComment('');
      setImages([]);
      onReviewSubmitted?.();
    } catch (error) {
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-gray-500">
          Please <Link to="/login" className="text-orange-500 hover:underline font-semibold">sign in</Link> to write a review.
        </p>
      </div>
    );
  }

  const stars = [1, 2, 3, 4, 5];

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-5">
        <Star size={20} className="text-[#00A9C0]" /> Write a Review
      </h3>

      {/* Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating *</label>
        <div className="flex items-center gap-1">
          {stars.map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`w-6 h-6 sm:w-8 sm:h-8 transition-colors  ${
                  (hoverRating || rating) >= star
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          <span className="hidden sm:block ml-3 text-sm font-medium text-gray-500">
            {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Tap to rate'}
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label htmlFor="review-title" className="block text-sm font-medium text-gray-700">
          Review Title
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience..."
          className="mt-1 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A9C0] focus:border-transparent outline-none transition"
          maxLength="100"
        />
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700">
          Your Review *
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="4"
          placeholder="Share your experience with this product..."
          className="mt-1 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A9C0] focus:border-transparent outline-none resize-none transition"
          required
        />
        <p className="text-xs text-gray-400 mt-1">{comment.length} characters</p>
      </div>

      {/* Image Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Photos <span className="text-gray-400 font-normal">(optional, max 5)</span>
        </label>
        <div className="flex flex-wrap gap-3">
          {images.map((url, index) => (
            <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 group">
              <img src={url} alt={`Review ${index}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition shadow-sm"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition bg-gray-50">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
              {uploading ? (
                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Upload size={20} className="text-gray-400" />
                  <span className="text-[10px] text-gray-400 mt-1">Upload</span>
                </>
              )}
            </label>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2">Upload up to 5 images (PNG, JPG, up to 2MB each)</p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting || rating === 0 || !comment.trim()}
        className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Review'
        )}
      </button>
    </form>
  );
};

export default ReviewForm;