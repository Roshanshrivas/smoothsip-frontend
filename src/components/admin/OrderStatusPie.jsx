// src/components/admin/OrderStatusPie.jsx
import React from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Package } from "lucide-react";

// Predefined professional color palette
const COLORS = {
  Delivered: "#10b981",   // emerald
  Processing: "#3b82f6",  // blue
  Shipped: "#f59e0b",     // amber
  Cancelled: "#6b7280",   // gray
  Pending: "#8b5cf6",     // purple
  Refunded: "#ef4444",    // red
};

// Fallback colors for unknown statuses
const getColor = (name) => COLORS[name] || "#94a3b8";

// Custom tooltip for better UX
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-900 p-3 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-medium text-gray-800 dark:text-white">{data.name}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {data.value} orders ({data.percent.toFixed(1)}%)
        </p>
      </div>
    );
  }
  return null;
};

// Center label component (total orders)
const CenterLabel = ({ total }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
    <span className="text-2xl font-bold text-gray-800 dark:text-white">{total}</span>
    <span className="text-xs text-gray-500 dark:text-gray-400">Total Orders</span>
  </div>
);

const OrderStatusPie = ({ data, itemVariants }) => {
  // Ensure data is an array and filter out zero/undefined values
  const safeData = React.useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data
      .filter(item => item && item.value > 0)
      .map(item => ({
        ...item,
        color: item.color || getColor(item.name),
        percent: 0,
      }));
  }, [data]);

  // Calculate total for center label
  const totalOrders = safeData.reduce((sum, item) => sum + item.value, 0);

  // If no data, show empty state
  if (safeData.length === 0) {
    return (
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-all duration-200 h-full flex flex-col items-center justify-center"
      >
        <Package size={48} className="text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No order status data</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">Orders will appear here once available</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-all duration-200 h-full flex flex-col"
    >
      {/* Header with icon */}
      <div className="flex items-center gap-2 mb-4">
        <Package size={18} className="text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Orders Status</h3>
      </div>

      {/* Chart */}
      <div className="relative flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={safeData}
              cx="50%"
              cy="50%"
              innerRadius="50%"
              outerRadius="75%"
              paddingAngle={4}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {safeData.map((entry, idx) => (
                <Cell
                  key={`cell-${idx}`}
                  fill={entry.color}
                  stroke="white"
                  strokeWidth={2}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <CenterLabel total={totalOrders} />
      </div>

      {/* Legend – grid layout with colors */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
        {safeData.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-600 dark:text-gray-400 truncate">{item.name}</span>
            </div>
            <span className="font-semibold text-gray-800 dark:text-white ml-2">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default OrderStatusPie;