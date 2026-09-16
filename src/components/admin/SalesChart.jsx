import React from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// ─── Fallback sample data to demonstrate design ───
const sampleData = [
  { day: "Mon", thisWeek: 12000, lastWeek: 8000 },
  { day: "Tue", thisWeek: 15000, lastWeek: 10000 },
  { day: "Wed", thisWeek: 18000, lastWeek: 14000 },
  { day: "Thu", thisWeek: 22000, lastWeek: 16000 },
  { day: "Fri", thisWeek: 28000, lastWeek: 20000 },
  { day: "Sat", thisWeek: 25000, lastWeek: 18000 },
  { day: "Sun", thisWeek: 30000, lastWeek: 22000 },
];

const SalesChart = ({ data, formatCurrency, itemVariants }) => {
  // Use provided data if it exists and has length, otherwise use sample
  const chartData = (data && data.length > 0) ? data : sampleData;

  return (
    <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Sales Overview</h3>
          <p className="text-sm text-gray-500">Weekly sales comparison</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>This Week</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
            <span>Last Week</span>
          </div>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="thisWeekGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="lastWeekGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#9ca3af" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" stroke="#6b7280" />
            <YAxis tickFormatter={(v) => `₹${v/1000}k`} stroke="#6b7280" />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Legend />
            <Area type="monotone" dataKey="thisWeek" stroke="#f97316" strokeWidth={2} fill="url(#thisWeekGradient)" name="This Week" />
            <Area type="monotone" dataKey="lastWeek" stroke="#9ca3af" strokeWidth={2} fill="url(#lastWeekGradient)" name="Last Week" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default SalesChart;