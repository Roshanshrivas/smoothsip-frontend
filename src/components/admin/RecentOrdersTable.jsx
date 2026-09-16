// src/components/admin/RecentOrdersCard.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, ShoppingBag, ArrowRight } from "lucide-react";

const statusStyles = {
  Delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Shipped: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  Cancelled: "bg-gray-100 text-gray-700 dark:bg-gray-800 text-gray-400",
};

// Image with lazy loading and fallback
const OrderImage = ({ src, alt }) => {
  const [error, setError] = useState(false);
  return (
    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center flex-shrink-0 border border-gray-200 dark:border-gray-700">
      {!error ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="w-9 h-9 object-contain transition-transform duration-300 group-hover:scale-110"
          onError={() => setError(true)}
        />
      ) : (
        <Package size={20} className="text-gray-400" />
      )}
    </div>
  );
};

// Skeleton loader
const SkeletonRow = () => (
  <div className="flex items-center justify-between gap-3 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
      <div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
      </div>
    </div>
    <div className="text-right">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 ml-auto" />
    </div>
  </div>
);

const RecentOrdersCard = ({ orders, formatCurrency, isLoading = false }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: -8 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 15 } },
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm h-full">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-orange-500" />
            <h3 className="font-semibold text-gray-800 dark:text-white">Recent Orders</h3>
          </div>
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <ShoppingBag size={18} className="text-orange-500" />
          <h3 className="font-semibold text-gray-800 dark:text-white">Recent Orders</h3>
        </div>
        <Link
          to="/admin/orders"
          className="flex items-center gap-1 text-xs font-medium text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition"
        >
          View All
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Orders List */}
      <motion.div
        className="p-4 space-y-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {orders.map((order) => (
          <motion.div
            key={order.id}
            variants={itemVariants}
            className="flex items-center justify-between gap-3 group p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
          >
            {/* Left: Image + Details */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <OrderImage src={order.image} alt={order.customer} />
              <div className="min-w-0">
                <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                  #{order.id}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {order.customer}
                </p>
              </div>
            </div>

            {/* Right: Price + Status */}
            <div className="text-right flex-shrink-0">
              <p className="font-semibold text-sm text-gray-900 dark:text-white">
                {formatCurrency(order.total)}
              </p>
              <span className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded-full ${statusStyles[order.status]}`}>
                {order.status}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default React.memo(RecentOrdersCard);