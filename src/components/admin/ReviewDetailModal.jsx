// src/components/admin/ReviewDetailModal.jsx
import React, { useState } from 'react';
import {
  X,
  Star,
  Calendar,
  User,
  Mail,
  Package,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ReviewDetailModal = ({
  isOpen,
  onClose,
  review,
  onReply,
  onToggleStatus,
  onDelete,
}) => {
  const [reply, setReply] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  if (!isOpen || !review) return null;

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const handleReplySubmit = async () => {
    if (!reply.trim()) {
      toast.error('Please enter a reply');
      return;
    }
    setSubmittingReply(true);
    try {
      await onReply(review.id, reply);
      setReply('');
      onClose();
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      pending: { label: 'Pending', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
      approved: { label: 'Approved', color: 'bg-green-50 text-green-700 border-green-200' },
      rejected: { label: 'Rejected', color: 'bg-red-50 text-red-700 border-red-200' },
    };
    const config = configs[status] || configs.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Review Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-4">
          {/* Product & Customer Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <img
                src={
                  review.product?.mainImage ||
                  review.productImage ||
                  'https://placehold.co/60x60/FFF4E6/78350F?text=Product'
                }
                alt={review.product?.name || 'Product'}
                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
              />
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">
                  {review.product?.name || 'Product'}
                </p>
                <p className="text-xs text-gray-500">SKU: TMB-{String(review.id).padStart(5, '0')}</p>
              </div>
            </div>
            <div className="text-right">{getStatusBadge(review.status)}</div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4">
            <div className="flex items-center gap-2 text-sm">
              <User size={16} className="text-gray-400" />
              <span className="font-medium">{review.customer}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail size={16} className="text-gray-400" />
              <span>{review.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-gray-400" />
              <span>{formatDate(review.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {review.isVerifiedPurchase && (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle size={16} /> Verified Purchase
                </span>
              )}
            </div>
          </div>

          {/* Rating & Comment */}
          <div>
            <div className="flex items-center gap-3">
              {renderStars(review.rating)}
              <span className="font-bold text-lg">{review.rating}.0</span>
            </div>
            {review.title && (
              <p className="font-semibold text-gray-800 dark:text-white mt-2">{review.title}</p>
            )}
            <p className="text-gray-600 dark:text-gray-300 mt-2">{review.comment}</p>

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
          </div>

          {/* Admin Reply */}
          {review.reply && (
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
              <p className="text-xs font-semibold text-orange-600 mb-1">Admin Reply:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{review.reply}</p>
              {review.repliedAt && (
                <p className="text-xs text-gray-400 mt-1">
                  Replied on {formatDate(review.repliedAt)}
                </p>
              )}
            </div>
          )}

          {/* Reply Input */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reply to Customer
            </label>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows="3"
              placeholder="Write your reply here..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <div className="flex gap-3 mt-3">
              <button
                onClick={handleReplySubmit}
                disabled={submittingReply || !reply.trim()}
                className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
              >
                {submittingReply ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reply'
                )}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={() => onToggleStatus(review.id, review.status === 'approved' ? 'rejected' : 'approved')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                review.status === 'approved'
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {review.status === 'approved' ? 'Reject' : 'Approve'}
            </button>
            <button
              onClick={() => onDelete(review.id)}
              className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetailModal;