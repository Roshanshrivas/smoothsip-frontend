// src/pages/admin/AdminReviews.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Star,
  StarHalf,
  MessageCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  X,
  Eye,
  User,
  Package,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Search,
  Download,
  Settings,
} from "lucide-react";
import toast from "react-hot-toast";
import { reviewService } from "../../services/reviewService";
import Pagination from "../../components/admin/Pagination";
import ReviewDetailModal from "../../components/admin/ReviewDetailModal";
import DeleteConfirmModal from "../../components/admin/ConfirmDialog";
import StatsGrid from "../../components/admin/StatsGrid";

const AdminReviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    avgRating: 0,
    growth: { total: 18.6, approved: 16.3, pending: 8.4, rejected: 4.2, avgRating: 0.2 },
  });
  const [productStats, setProductStats] = useState([]);
  const [ratingBreakdown, setRatingBreakdown] = useState([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const itemsPerPage = 10;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [reviewsRes, statsRes, allReviewsRes] = await Promise.all([
        reviewService.fetchReviews({
          search,
          status: statusFilter,
          rating: ratingFilter,
          page: currentPage,
          limit: itemsPerPage,
        }),
        reviewService.getStats(),
        reviewService.fetchAllReviews(),
      ]);
      setReviews(reviewsRes.reviews);
      setAllReviews(allReviewsRes);
      setTotalItems(reviewsRes.total);
      setTotalPages(Math.ceil(reviewsRes.total / itemsPerPage));
      setStats((prev) => ({
        ...prev,
        total: statsRes.total,
        pending: statsRes.pending,
        approved: statsRes.approved,
        rejected: statsRes.flagged || 0,
        avgRating: statsRes.avgRating,
      }));

      // Rating breakdown
      const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      allReviewsRes.forEach((r) => {
        if (r.rating >= 1 && r.rating <= 5) breakdown[r.rating]++;
      });
      const total = allReviewsRes.length || 1;
      const breakdownArray = Object.entries(breakdown)
        .map(([stars, count]) => ({
          stars: parseInt(stars),
          count,
          percentage: total > 0 ? (count / total) * 100 : 0,
        }))
        .sort((a, b) => b.stars - a.stars);
      setRatingBreakdown(breakdownArray);

      // Product stats
      const productMap = {};
      allReviewsRes.forEach((r) => {
        const productId = r.product?._id || r.product;
        const productName = r.product?.name || "Unknown Product";
        const productImage = r.product?.mainImage || "";
        if (!productMap[productId]) {
          productMap[productId] = {
            name: productName,
            count: 0,
            ratingSum: 0,
            image: productImage,
          };
        }
        productMap[productId].count++;
        productMap[productId].ratingSum += r.rating;
      });
      const productStatsArray = Object.values(productMap)
        .map((data) => ({
          name: data.name,
          count: data.count,
          avgRating: (data.ratingSum / data.count).toFixed(1),
          image:
            data.image || "https://placehold.co/400x400/FFF4E6/78350F?text=Product",
        }))
        .sort((a, b) => b.count - a.count);
      setProductStats(productStatsArray.slice(0, 5));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, ratingFilter, currentPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = (id) => {
    setDeleteTargetId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      reviewService.deleteReview(deleteTargetId);
      setDeleteModalOpen(false);
      setDeleteTargetId(null);
      loadData();
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    if (!id) {
      toast.error("Invalid review ID");
      return;
    }
    setStatusUpdating((prev) => ({ ...prev, [id]: true }));
    try {
      await reviewService.updateReviewStatus(id, newStatus);
      toast.success(`Review ${newStatus}`);
      loadData();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setStatusUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleReply = async (id, reply) => {
    await reviewService.replyReview(id, reply);
    loadData();
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setRatingFilter("all");
    setCurrentPage(1);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />
        );
      } else if (i - 0.5 === rating) {
        stars.push(
          <StarHalf key={i} size={12} className="fill-yellow-400 text-yellow-400" />
        );
      } else {
        stars.push(<Star key={i} size={12} className="text-gray-300" />);
      }
    }
    return stars;
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: "text-blue-600", dot: "bg-blue-500", label: "Pending" },
      approved: { color: "text-green-600", dot: "bg-green-500", label: "Approved" },
      rejected: { color: "text-red-600", dot: "bg-red-500", label: "Rejected" },
      flagged: { color: "text-red-600", dot: "bg-red-500", label: "Rejected" },
    };
    return configs[status] || configs.pending;
  };

  const tabs = [
    { key: "all", label: "All Reviews", count: stats.total },
    { key: "pending", label: "Pending", count: stats.pending },
    { key: "approved", label: "Approved", count: stats.approved },
    { key: "rejected", label: "Rejected", count: stats.rejected },
  ];

  const statsCards = [
    {
      title: "Total Reviews",
      value: stats.total,
      icon: MessageCircle,
      color: "blue",
      growth: stats.growth.total,
    },
    {
      title: "Approved Reviews",
      value: stats.approved,
      icon: CheckCircle,
      color: "green",
      growth: stats.growth.approved,
    },
    {
      title: "Pending Reviews",
      value: stats.pending,
      icon: Clock,
      color: "yellow",
      growth: stats.growth.pending,
    },
    {
      title: "Rejected Reviews",
      value: stats.rejected,
      icon: AlertCircle,
      color: "red",
      growth: stats.growth.rejected,
    },
    {
      title: "Average Rating",
      value: stats.avgRating,
      icon: Star,
      color: "orange",
      growth: stats.growth.avgRating,
    },
  ];

  return (
    <div className="space-y-6">
      <StatsGrid stats={statsCards} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            {/* Filter Bar */}
            <div className="border-b border-gray-200 dark:border-gray-800 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                      statusFilter === tab.key
                        ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                        statusFilter === tab.key
                          ? "bg-orange-100 text-orange-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search reviews.."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-4 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none w-40 md:w-48"
                  />
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition">
                  <Download size={14} /> Export
                </button>
                {(search || statusFilter !== "all") && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-orange-600 hover:text-orange-700"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No reviews found.
                </div>
              ) : (
                <table className="w-full text-sm table-fixed">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-2 py-3 text-left w-[15%] whitespace-nowrap">
                        Product
                      </th>
                      <th className="px-2 py-2 text-left w-[16%] whitespace-nowrap">
                        Reviewer
                      </th>
                      <th className="px-2 py-2 text-left w-[10%] whitespace-nowrap">
                        Rating
                      </th>
                      <th className="px-2 py-2 text-left w-[22%] whitespace-nowrap">
                        Review
                      </th>
                      <th className="px-2 py-2 text-left w-[12%] whitespace-nowrap">
                        Date
                      </th>
                      <th className="px-2 py-2 text-left w-[10%] whitespace-nowrap">
                        Status
                      </th>
                      <th className="px-2 py-2 text-center w-[15%] whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {reviews.map((review) => {
                      const statusConfig = getStatusConfig(review.status);
                      return (
                        <tr
                          key={review._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition"
                        >
                          {/* Product */}
                          <td className="px-2 py-3">
                            <div className="flex items-center gap-2">
                              <img
                                src={
                                  review.product?.mainImage ||
                                  review.productImage ||
                                  "https://placehold.co/400x400/FFF4E6/78350F?text=Product"
                                }
                                alt={review.product?.name || "Product"}
                                className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="font-medium text-gray-800 dark:text-white text-sm truncate">
                                  {review.product?.name || "Product"}
                                </div>
                                <div className="text-xs text-gray-400 truncate">
                                  SKU:{" "}
                                  {review.sku ||
                                    `TMB-${String(review._id).slice(-5)}`}
                                </div>
                              </div>
                            </div>
                          </td>
                          {/* Reviewer - using user.name and user.email */}
                          <td className="px-2 py-2">
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium text-gray-800 dark:text-white text-sm truncate">
                                {review.user?.name || "Anonymous"}
                              </span>
                              <span className="text-xs text-gray-400 truncate">
                                {review.user?.email || "No email"}
                              </span>
                              {review.isVerifiedPurchase && (
                                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                  <CheckCircle size={12} className="text-green-500" />
                                  Verified Purchase
                                </span>
                              )}
                            </div>
                          </td>
                          {/* Rating */}
                          <td className="px-2 py-2">
                            <div className="flex items-center gap-0.5">
                              {renderStars(review.rating)}
                            </div>
                            <span className="text-xs text-gray-400">
                              {review.rating}.0
                            </span>
                          </td>
                          {/* Review */}
                          <td className="px-2 py-2">
                            <div className="text-gray-600 dark:text-gray-300 text-sm truncate max-w-xs">
                              {review.comment}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                              <ThumbsUp size={12} /> {review.helpful || 0}
                              <ThumbsDown size={12} /> {review.notHelpful || 0}
                            </div>
                          </td>
                          {/* Date */}
                          <td className="px-2 py-2 text-xs whitespace-nowrap">
                            <div>{formatDate(review.createdAt)}</div>
                            <div className="text-gray-400">
                              {new Date(review.createdAt).toLocaleTimeString()}
                            </div>
                          </td>
                          {/* Status Dropdown */}
                          <td className="px-2 py-2 whitespace-nowrap">
                            <select
                              value={review.status}
                              onChange={(e) =>
                                handleStatusChange(review._id, e.target.value)
                              }
                              disabled={statusUpdating[review._id]}
                              className={`text-xs font-medium rounded-lg px-2 py-1 border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition ${
                                review.status === "approved"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : review.status === "rejected"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-yellow-50 text-yellow-700 border-yellow-200"
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </td>
                          {/* Actions */}
                          <td className="px-2 py-2">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => {
                                  setSelectedReview(review);
                                  setDetailModalOpen(true);
                                }}
                                className="text-gray-400 hover:text-blue-500 p-1 rounded hover:bg-blue-50 transition"
                                title="View"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                onClick={() => handleDelete(review._id)}
                                className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition"
                                title="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {totalPages > 1 && (
              <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-800 flex flex-wrap justify-between items-center gap-2 text-sm text-gray-500">
                <span>
                  Showing{" "}
                  {reviews.length > 0
                    ? (currentPage - 1) * itemsPerPage + 1
                    : 0}{" "}
                  to {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                  {totalItems} reviews
                </span>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={totalItems}
                  simple
                />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar – unchanged */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <h4 className="font-semibold text-gray-800 dark:text-white">
                Rating Overview
              </h4>
            </div>
            <div className="p-4">
              <div className="mb-6">
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white leading-none">
                    {parseFloat(stats.avgRating).toFixed(1)}
                  </span>
                  <div className="flex text-orange-400 mb-1">★★★★★</div>
                </div>
                <p className="text-xs text-gray-400">
                  Based on {stats.total} reviews
                </p>
              </div>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const item =
                    ratingBreakdown.find((r) => r.stars === star) || {
                      count: 0,
                      percentage: 0,
                    };
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300 w-10">
                        {star} Star
                      </span>
                      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-400 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-10 text-right">
                        {item.count}
                      </span>
                      <span className="text-xs text-gray-400 w-12 text-right">
                        ({item.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h4 className="font-semibold text-gray-800 dark:text-white">
                Reviews by Product
              </h4>
              <button
                onClick={() => navigate("/admin/products?tab=reviews")}
                className="text-xs font-medium text-gray-500 hover:text-orange-600 transition"
              >
                View All
              </button>
            </div>
            <div className="p-2">
              {productStats.length === 0 ? (
                <div className="text-center py-6 text-sm text-gray-500">
                  No product reviews yet
                </div>
              ) : (
                productStats.map((product, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-8 h-8 rounded object-cover border border-gray-100 dark:border-gray-700"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 dark:text-white truncate">
                        {product.name}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {product.count} reviews
                      </p>
                    </div>
                    <div className="text-[10px] font-bold text-gray-600 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                      {parseFloat(product.avgRating).toFixed(1)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <h4 className="font-semibold text-gray-800 dark:text-white">
                Quick Actions
              </h4>
            </div>
            <div className="p-4 space-y-2">
              <button
                onClick={async () => {
                  try {
                    await reviewService.updateReviewStatus("all", "approved");
                    toast.success("All pending reviews approved");
                    loadData();
                  } catch (error) {
                    toast.error("Failed to approve all");
                  }
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg text-sm font-medium transition-colors"
              >
                <CheckCircle size={16} /> Approve All Pending
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium transition-colors">
                <Download size={16} /> Export All Reviews
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-sm font-medium transition-colors">
                <Settings size={16} /> Review Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      <ReviewDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        review={selectedReview}
        onReply={handleReply}
        onToggleStatus={handleStatusChange}
        onDelete={handleDelete}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteTargetId(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
      />
    </div>
  );
};

export default AdminReviews;