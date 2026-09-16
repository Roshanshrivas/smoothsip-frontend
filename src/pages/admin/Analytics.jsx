// src/pages/admin/Analytics.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Percent,
  RefreshCw,
  Download,
  Calendar,
  Eye,
  PlusCircle,
  CreditCard,
  CheckCircle,
  Package,
  Truck,
  XCircle,
  Clock,
  BarChart3,
  ChevronDown,
  X,
  Globe,
  Smartphone,
} from "lucide-react";

import { FaFacebook } from "react-icons/fa";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import toast from "react-hot-toast";
import { analyticsService } from "../../services/analyticsService";
import StatsGrid from "../../components/admin/StatsGrid";

// ========== Helper Components ==========
const GrowthBadge = ({ value }) => {
  const isPositive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold ${
        isPositive ? "text-emerald-600" : "text-rose-600"
      }`}
    >
      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {Math.abs(value)}%
    </span>
  );
};

const PerformanceCard = ({ label, value, change, icon: Icon }) => (
  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-200">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
        <Icon size={18} className="text-gray-600 dark:text-gray-400" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-gray-800 dark:text-white">{value.toLocaleString()}</p>
      </div>
      {change !== undefined && (
        <span
          className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
            change >= 0
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
          }`}
        >
          {change >= 0 ? "+" : ""}
          {change}%
        </span>
      )}
    </div>
  </div>
);

const StatusProgress = ({ label, count, total, colorKey }) => {
  const percent = total > 0 ? (count / total) * 100 : 0;
  const colorClass = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    gray: "bg-gray-500",
  }[colorKey] || "bg-gray-500";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-gray-500">{count.toLocaleString()}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorClass} transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

// Modern tooltip
const ModernTooltip = ({ active, payload, label, unit = "₹" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.name}: {unit}{entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Skeleton loader
const SkeletonLoader = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
      ))}
    </div>
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
      <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  </div>
);

// ========== Main Component ==========
const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [revenueFilter, setRevenueFilter] = useState("daily");
  const [ordersFilter, setOrdersFilter] = useState("daily");
  const [topProductsFilter, setTopProductsFilter] = useState("weekly");
  const [exporting, setExporting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await analyticsService.fetchAnalyticsData({
        dateRange,
        revenueFilter,
        ordersFilter,
        topProductsFilter,
      });
      setData(result);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [dateRange, revenueFilter, ordersFilter, topProductsFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExport = async () => {
    setExporting(true);
    await analyticsService.exportReport("csv", dateRange);
    setExporting(false);
  };

  const clearFilters = () => {
    setDateRange({ start: "", end: "" });
    setRevenueFilter("daily");
    setOrdersFilter("daily");
    setTopProductsFilter("weekly");
  };

  const hasActiveFilters =
    dateRange.start ||
    dateRange.end ||
    revenueFilter !== "daily" ||
    ordersFilter !== "daily" ||
    topProductsFilter !== "weekly";

  const totalOrdersByStatus = useMemo(() => {
    if (!data) return 0;
    return data.orderStatus.reduce((acc, curr) => acc + curr.value, 0);
  }, [data]);

  if (loading) return <div className="p-6"><SkeletonLoader /></div>;
  if (!data) return null;

  // 6 stat cards as per image
  const statsCards = [
    { title: "Total Revenue", value: `₹${data.kpis.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "green", growth: data.kpis.revenueGrowth },
    { title: "Total Orders", value: data.kpis.totalOrders, icon: ShoppingCart, color: "blue", growth: data.kpis.ordersGrowth },
    { title: "Total Customers", value: data.kpis.totalCustomers, icon: Users, color: "purple", growth: data.kpis.customersGrowth },
    { title: "Avg. Order Value", value: `₹${data.kpis.avgOrderValue.toLocaleString()}`, icon: TrendingUp, color: "yellow", growth: data.kpis.avgOrderGrowth },
    { title: "Conversion Rate", value: `${data.kpis.conversionRate}%`, icon: Percent, color: "pink", growth: data.kpis.conversionGrowth },
  ];

  // Colors for pie chart
  const CHANNEL_COLORS = ["#f97316", "#3b82f6", "#8b5cf6", "#10b981", "#ef4444"];
  const CATEGORY_COLORS = ["#f97316", "#3b82f6", "#8b5cf6"];
  const SEGMENT_COLORS = ["#10b981", "#f59e0b"];


  const chartContainerStyle = {
  outline: 'none',
  focus: 'none',
  };

  return (
    <>
    <style>{`
      .recharts-wrapper:focus,
      .recharts-surface:focus,
      .recharts-wrapper *:focus {
        outline: none !important;
      }
      .analytics-chart-container:focus {
        outline: none !important;
      }
    `}</style>
    <div className="space-y-6">
      <StatsGrid stats={statsCards} />

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="px-6 py-4 bg-gray-50/40 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="flex flex-wrap items-center gap-3">
              {/* Date Range Picker */}
              <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 rounded-lg">
                <Calendar size={14} className="text-gray-400" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, start: e.target.value }))
                  }
                  className="bg-transparent text-sm outline-none w-32"
                />
                <span className="text-gray-400">—</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, end: e.target.value }))
                  }
                  className="bg-transparent text-sm outline-none w-32"
                />
                {dateRange.start && (
                  <button onClick={() => setDateRange({ start: "", end: "" })}>
                    <X
                      size={12}
                      className="text-gray-400 hover:text-gray-600"
                    />
                  </button>
                )}
              </div>

              {/* Revenue Filter */}
              <div className="relative">
                <select
                  value={revenueFilter}
                  onChange={(e) => setRevenueFilter(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-2 bg-white dark:bg-gray-900 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="daily">Revenue: Daily</option>
                  <option value="weekly">Revenue: Weekly</option>
                  <option value="monthly">Revenue: Monthly</option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>

              {/* Orders Filter */}
              <div className="relative">
                <select
                  value={ordersFilter}
                  onChange={(e) => setOrdersFilter(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-2 bg-white dark:bg-gray-900 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="daily">Orders: Daily</option>
                  <option value="weekly">Orders: Weekly</option>
                  <option value="monthly">Orders: Monthly</option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>

              {/* Top Products Filter */}
              <div className="relative">
                <select
                  value={topProductsFilter}
                  onChange={(e) => setTopProductsFilter(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-2 bg-white dark:bg-gray-900 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="weekly">Top: Weekly</option>
                  <option value="monthly">Top: Monthly</option>
                  <option value="all">Top: All Time</option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-orange-600 flex items-center gap-1"
                >
                  <X size={14} /> Clear
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <Download size={16} className="inline mr-1" />
                {exporting ? "Exporting..." : "Export"}
              </button>
              <button
                onClick={loadData}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium shadow-sm"
              >
                <RefreshCw size={16} className="inline mr-1" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Revenue & Orders Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Area */}
            <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Revenue Overview
                </h3>
                <span className="text-xs text-gray-500">
                  {revenueFilter} view
                </span>
              </div>
              <div className="h-72 outline-none focus:outline-none analytics-chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.revenueData}>
                    <defs>
                      <linearGradient
                        id="revenueGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#f97316"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f97316"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="#e5e7eb"
                      opacity={0.3}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="period"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(v) => `₹${v / 1000}k`}
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<ModernTooltip unit="₹" />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#f97316"
                      strokeWidth={2}
                      fill="url(#revenueGrad)"
                      name="Revenue (₹)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Orders Bar */}
            <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Orders Overview
                </h3>
                <span className="text-xs text-gray-500">
                  {ordersFilter} view
                </span>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.ordersData}>
                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="#e5e7eb"
                      opacity={0.3}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="period"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<ModernTooltip unit="" />} />
                    <Legend />
                    <Bar
                      dataKey="orders"
                      fill="#3b82f6"
                      name="Orders"
                      radius={[4, 4, 0, 0]}
                      barSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sales by Channel + Top Selling Tumblers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales by Channel (Pie) */}
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-gray-50 dark:bg-gray-800/30">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Sales by Channel
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.salesByChannel}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(1)}%`
                      }
                      labelLine={false}
                    >
                      {data.salesByChannel.map((entry, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={CHANNEL_COLORS[idx % CHANNEL_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `₹${value.toLocaleString()}`}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Selling Tumblers with customers count */}
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-700">
                  🏆 Top Selling Tumblers
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-2 text-left">#</th>
                      <th className="px-4 py-2 text-left">Product</th>
                      <th className="px-4 py-2 text-right">Revenue</th>
                      <th className="px-4 py-2 text-right">Customers</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {data.topProducts.map((product, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/40"
                      >
                        <td className="px-4 py-2 text-gray-500">{idx + 1}</td>
                        <td className="px-4 py-2 font-medium flex items-center gap-2">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-6 h-6 rounded object-cover"
                          />
                          {product.name}
                        </td>
                        <td className="px-4 py-2 text-right font-semibold text-orange-600">
                          ₹{product.sales.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-right text-gray-600">
                          {product.customers?.toLocaleString() || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Category */}
            <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 bg-white dark:bg-gray-900 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-6">
                Revenue by Category
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.categoryRevenue}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="barGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#6d28d9" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="3 3"
                      stroke="#f3f4f6"
                    />
                    <XAxis
                      dataKey="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      tickFormatter={(v) => `₹${v / 1000}k`}
                    />
                    <Tooltip
                      cursor={{ fill: "#f3f4f6", opacity: 0.4 }}
                      content={<ModernTooltip unit="₹" />}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="url(#barGradient)"
                      radius={[6, 6, 0, 0]}
                      barSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Customer Growth */}
            <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 bg-white dark:bg-gray-900 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                  Customer Growth
                </h3>
                <GrowthBadge value={data.kpis.customersGrowth} />
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.customerGrowth}
                    margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="lineGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f3f4f6"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                    />
                    <Tooltip content={<ModernTooltip unit="" />} />
                    <Area
                      type="monotone"
                      dataKey="newCustomers"
                      stroke="#10b981"
                      fill="url(#lineGradient)"
                      strokeWidth={3}
                    />
                    <Line
                      type="monotone"
                      dataKey="newCustomers"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* New vs Returning Customers + Funnel Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* New vs Returning (Pie) */}
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-gray-50 dark:bg-gray-800/30">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                New vs Returning Customers
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.newVsReturning}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(1)}%`
                      }
                    >
                      {data.newVsReturning.map((entry, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={SEGMENT_COLORS[idx % SEGMENT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) =>
                        `${value.toLocaleString()} customers`
                      }
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Funnel Performance */}
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-gray-50 dark:bg-gray-800/30">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Performance Overview
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <PerformanceCard
                  label="Total Visitors"
                  value={data.funnel.totalVisitors}
                  change={data.funnel.visitorsChange}
                  icon={Eye}
                />
                <PerformanceCard
                  label="Product Views"
                  value={data.funnel.productViews}
                  change={data.funnel.productViewsChange}
                  icon={BarChart3}
                />
                <PerformanceCard
                  label="Add to Cart"
                  value={data.funnel.addToCart}
                  change={data.funnel.addToCartChange}
                  icon={PlusCircle}
                />
                <PerformanceCard
                  label="Checkout Init."
                  value={data.funnel.checkoutInitiated}
                  change={data.funnel.checkoutInitiatedChange}
                  icon={CreditCard}
                />
                <PerformanceCard
                  label="Checkout Comp."
                  value={data.funnel.checkoutCompleted}
                  change={data.funnel.checkoutCompletedChange}
                  icon={CheckCircle}
                />
                <PerformanceCard
                  label="Delivered"
                  value={
                    data.orderStatus.find((s) => s.name === "Delivered")
                      ?.value || 0
                  }
                  icon={Package}
                />
              </div>
            </div>
          </div>

          {/* Orders by Status Progress Bars */}
          <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Orders by Status
            </h3>
            <div className="space-y-4">
              {data.orderStatus.map((status) => {
                let colorKey = "gray",
                  Icon = Package;
                if (status.name === "Delivered") {
                  colorKey = "emerald";
                  Icon = CheckCircle;
                } else if (status.name === "Processing") {
                  colorKey = "blue";
                  Icon = Clock;
                } else if (status.name === "Shipped") {
                  colorKey = "purple";
                  Icon = Truck;
                } else if (status.name === "Pending") {
                  colorKey = "amber";
                  Icon = Clock;
                } else if (status.name === "Cancelled") {
                  colorKey = "rose";
                  Icon = XCircle;
                }
                return (
                  <div
                    key={status.name}
                    className="flex flex-wrap items-center gap-4"
                  >
                    <div className="w-28 flex items-center gap-2">
                      <Icon size={14} className={`text-${colorKey}-500`} />
                      <span className="text-sm font-medium">{status.name}</span>
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <StatusProgress
                        label=""
                        count={status.value}
                        total={totalOrdersByStatus}
                        colorKey={colorKey}
                      />
                    </div>
                    <div className="w-16 text-right text-sm font-semibold">
                      {status.value.toLocaleString()}
                    </div>
                    <div className="w-16 text-right text-xs text-gray-500">
                      {((status.value / totalOrdersByStatus) * 100).toFixed(1)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

// At the bottom of the file, after the export
const chartContainerStyles = `
  .recharts-wrapper:focus,
  .recharts-surface:focus,
  .recharts-wrapper *:focus {
    outline: none !important;
  }
  .analytics-chart-container:focus {
    outline: none !important;
  }
`;

export default Analytics;