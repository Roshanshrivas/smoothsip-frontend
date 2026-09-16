import React from "react";
import { X, Edit, Calendar, Tag, Users, DollarSign, ShoppingBag, Percent } from "lucide-react";

const CouponDetailModal = ({ isOpen, onClose, coupon, onEdit }) => {
  if (!isOpen || !coupon) return null;

  // ─── Compute status from active + dates ──────
  const getCouponStatus = (c) => {
    if (!c.active) return "disabled";
    const now = new Date();
    const start = new Date(c.startDate);
    const end = new Date(c.endDate);
    if (now < start) return "scheduled";
    if (now > end) return "expired";
    return "active";
  };

  const status = getCouponStatus(coupon);

  const getStatusBadge = (status) => {
    const configs = {
      active: "bg-green-100 text-green-700",
      expired: "bg-red-100 text-red-700",
      scheduled: "bg-blue-100 text-blue-700",
      disabled: "bg-gray-100 text-gray-600",
    };
    return configs[status] || configs.disabled;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const getDiscountDisplay = (coupon) => {
    if (coupon.discountType === "percentage") return `${coupon.discountValue}% OFF`;
    if (coupon.discountType === "fixed") return `₹${coupon.discountValue} OFF`;
    return "Free Shipping";
  };

  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

  // Use _id or id
  const couponId = coupon._id || coupon.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Tag size={20} className="text-orange-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">{coupon.code}</h3>
              <p className="text-xs text-gray-500">{coupon.description || "No description"}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(status)}`}>
              {statusLabel}
            </span>
            <span className="text-2xl font-bold text-orange-600">{getDiscountDisplay(coupon)}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
                <ShoppingBag size={16} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="font-medium text-gray-800 dark:text-white capitalize">{coupon.discountType}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
                <DollarSign size={16} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Min. Order</p>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {coupon.minimumOrder ? `₹${coupon.minimumOrder}` : "No minimum"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
                <Users size={16} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Usage</p>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : ""}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
                <Calendar size={16} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Validity</p>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {formatDate(coupon.startDate)} → {formatDate(coupon.endDate)}
                  </p>
                </div>
              </div>
              {coupon.maxDiscount && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
                  <Percent size={16} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Max Discount</p>
                    <p className="font-medium text-gray-800 dark:text-white">₹{coupon.maxDiscount}</p>
                  </div>
                </div>
              )}
              {coupon.perUserLimit && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
                  <Users size={16} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Per-User Limit</p>
                    <p className="font-medium text-gray-800 dark:text-white">{coupon.perUserLimit}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition">
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(couponId);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-sm transition"
          >
            <Edit size={16} /> Edit Coupon
          </button>
        </div>
      </div>
    </div>
  );
};

export default CouponDetailModal;