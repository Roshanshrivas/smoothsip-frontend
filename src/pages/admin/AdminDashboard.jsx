// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { dashboardService } from "../../services/dashboardService";
import SkeletonCard from "../../components/admin/SkeletonCard";
import KPIGrid from "../../components/admin/KPIGrid";
import SalesChart from "../../components/admin/SalesChart";
import RecentOrdersTable from "../../components/admin/RecentOrdersTable";
import TopProductsTable from "../../components/admin/TopProductsTable";
import OrderStatusPie from "../../components/admin/OrderStatusPie";
import StoreAnalytics from "../../components/admin/StoreAnalytics";
import RecentActivities from "../../components/admin/RecentActivities";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 12 } }
};

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await dashboardService.fetchDashboardData();
      setData(result);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, retryCount]);

  const handleRetry = () => setRetryCount(prev => prev + 1);
  const formatCurrency = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(value);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 h-80 animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 h-64 animate-pulse"></div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 h-64 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
        <div className="text-red-500 text-lg mb-2">⚠️ {error}</div>
        <button onClick={handleRetry} className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2">
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      {/* KPI Cards */}
      <KPIGrid data={data} formatCurrency={formatCurrency} itemVariants={itemVariants} />

      {/* Sales Chart */}
      <SalesChart data={data.salesChart} formatCurrency={formatCurrency} itemVariants={itemVariants} />

      {/* Two‑column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrdersTable orders={data.recentOrders} formatCurrency={formatCurrency} itemVariants={itemVariants} isLoading={loading} />
        <TopProductsTable products={data.topProducts} formatCurrency={formatCurrency} itemVariants={itemVariants} />
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <OrderStatusPie data={data.orderStatus} itemVariants={itemVariants} />
        <StoreAnalytics analytics={data.storeAnalytics} formatCurrency={formatCurrency} itemVariants={itemVariants} />
        <RecentActivities activities={data.recentActivities} itemVariants={itemVariants} />
      </div>
    </motion.div>
  );
};

export default AdminDashboard;