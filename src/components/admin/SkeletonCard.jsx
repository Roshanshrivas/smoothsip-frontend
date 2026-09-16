import React from "react";

// src/pages/admin/components/SkeletonCard.jsx
const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 animate-pulse">
    <div className="flex justify-between items-start">
      <div><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div><div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-28"></div></div>
      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
    </div>
    <div className="mt-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div></div>
  </div>
);

export default SkeletonCard;