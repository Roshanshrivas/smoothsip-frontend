// src/components/admin/StatCard.jsx
import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

const GrowthBadge = ({ value }) => {
  const isPositive = value >= 0;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {Math.abs(value)}%
    </span>
  );
};

const StatCard = ({ title, value, icon: Icon, color, growth, itemVariants }) => (
  <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:shadow-md">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-700 dark:text-white mt-1">{value}</p>
      </div>
      <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
        <Icon size={20} className={`text-${color}-600`} />
      </div>
    </div>
    {growth !== undefined && (
      <div className="mt-3 flex items-center gap-2">
        <GrowthBadge value={growth} />
        <span className="text-xs text-gray-500">vs last week</span>
      </div>
    )}
  </motion.div>
);

export default StatCard;