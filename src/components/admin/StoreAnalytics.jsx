// src/components/admin/StoreAnalytics.jsx
import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  Percent,
  DollarSign,
  UserPlus,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

const getGrowthColor = (growth) => {
  if (growth > 0) return "text-emerald-600 dark:text-emerald-400";
  if (growth < 0) return "text-red-600 dark:text-red-400";
  return "text-gray-500 dark:text-gray-400";
};

const StatItem = ({ label, value, growth, icon: Icon, formatCurrency }) => {
  const isPositive = growth >= 0;
  const growthColor = getGrowthColor(growth);

  return (
    <div className="group flex items-center justify-between p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors duration-200">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
          <Icon size={18} className="text-orange-500 dark:text-orange-400" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white truncate">
            {value}
          </p>
        </div>
      </div>
      <div className={`flex items-center gap-1 text-sm font-semibold ${growthColor} flex-shrink-0 ml-2`}>
        {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
        {Math.abs(growth)}%
      </div>
    </div>
  );
};

const StoreAnalytics = ({ analytics, formatCurrency, itemVariants }) => {
  const safeAnalytics = {
    visitors: analytics?.visitors ?? 0,
    visitorsGrowth: analytics?.visitorsGrowth ?? 0,
    conversionRate: analytics?.conversionRate ?? 0,
    conversionGrowth: analytics?.conversionGrowth ?? 0,
    totalRevenue: analytics?.totalRevenue ?? 0,
    revenueGrowth: analytics?.revenueGrowth ?? 0,
    newCustomers: analytics?.newCustomers ?? 0,
    newCustomersGrowth: analytics?.newCustomersGrowth ?? 0,
  };

  const stats = [
    {
      label: "Visitors",
      value: safeAnalytics.visitors.toLocaleString(),
      growth: safeAnalytics.visitorsGrowth,
      icon: Users,
    },
    {
      label: "Conversion Rate",
      value: `${safeAnalytics.conversionRate}%`,
      growth: safeAnalytics.conversionGrowth,
      icon: Percent,
    },
    {
      label: "Total Revenue",
      value: formatCurrency(safeAnalytics.totalRevenue),
      growth: safeAnalytics.revenueGrowth,
      icon: DollarSign,
    },
    {
      label: "New Customers",
      value: safeAnalytics.newCustomers.toLocaleString(),
      growth: safeAnalytics.newCustomersGrowth,
      icon: UserPlus,
    },
  ];

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-all duration-200 h-full"
    >
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={18} className="text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Store Analytics</h3>
      </div>

      <div className="space-y-3">
        {stats.map((stat, idx) => (
          <StatItem
            key={idx}
            label={stat.label}
            value={stat.value}
            growth={stat.growth}
            icon={stat.icon}
            formatCurrency={formatCurrency}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default StoreAnalytics;