import React from "react";

const statusConfig = {
  Pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  Processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Shipped: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const OrderStatusBadge = ({ status }) => {
  const className = statusConfig[status] || statusConfig.Pending;
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>{status}</span>;
};

export default OrderStatusBadge;