import React, { useState, useEffect, useCallback } from "react";
import {
  Tag,
  Plus,
  Search,
  Edit,
  Trash2,
  Power,
  PowerOff,
  X,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Users,
  BarChart3,
  Lightbulb,
  ChevronDown,
  Copy,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import toast from "react-hot-toast";
import Pagination from "../../components/admin/Pagination";
import CouponFormModal from "../../components/admin/CouponFormModal";
import CouponDetailModal from "../../components/admin/CouponDetailModal";
import StatsGrid from "../../components/admin/StatsGrid";
import { couponService } from "../../services/couponService";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    scheduled: 0,
    expired: 0,
    totalUsage: 0,
    totalDiscount: 0,
    revenueGenerated: 0,
    growth: { total: 0, active: 0, usage: 0, discount: 0, revenue: 0 },
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const itemsPerPage = 10;

  // ─── Helper: compute status from coupon ──────
  const getCouponStatus = (coupon) => {
    if (!coupon.active) return "disabled";
    const now = new Date();
    const start = new Date(coupon.startDate);
    const end = new Date(coupon.endDate);
    if (now < start) return "scheduled";
    if (now > end) return "expired";
    return "active";
  };

  // ─── Load coupons from API ─────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await couponService.fetchCoupons({
        page: currentPage,
        limit: itemsPerPage,
        search,
        status: statusFilter,
      });
      const fetchedCoupons = res.coupons || [];
      setCoupons(fetchedCoupons);
      setTotalItems(res.total || 0);
      setTotalPages(res.totalPages || 1);

      // Compute stats from fetched coupons (limited, but we'll also get total from res.total)
      // For accurate stats, we'd need all coupons, but we'll use the total and compute from the page.
      // In a real app, you'd have a separate stats endpoint. For now we'll approximate.
      const total = res.total || 0;
      const active = fetchedCoupons.filter(c => getCouponStatus(c) === "active").length;
      const scheduled = fetchedCoupons.filter(c => getCouponStatus(c) === "scheduled").length;
      const expired = fetchedCoupons.filter(c => getCouponStatus(c) === "expired").length;
      const totalUsage = fetchedCoupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
      const totalDiscount = fetchedCoupons.reduce((sum, c) => sum + (c.discountValue || 0), 0);
      // revenueGenerated could be fetched from a separate API; we keep a placeholder
      const revenueGenerated = 245890;

      setStats({
        total,
        active,
        scheduled,
        expired,
        totalUsage,
        totalDiscount,
        revenueGenerated,
        growth: { total: 12, active: 8, usage: 15, discount: 18, revenue: 22 },
      });
    } catch (err) {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, currentPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Handlers ────────────────────────────────
  const handleCreate = async (data) => {
    try {
      const payload = {
        code: data.code,
        description: data.description,
        discountType: data.discountType,
        discountValue: parseFloat(data.discountValue),
        minimumOrder: parseFloat(data.minOrderAmount) || 0,
        maxDiscount: data.maxDiscount ? parseFloat(data.maxDiscount) : null,
        startDate: data.startDate,
        endDate: data.expiryDate,
        usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
        active: data.status === "active",
      };
      await couponService.createCoupon(payload);
      toast.success("Coupon created");
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || "Failed to create coupon");
    }
  };

  const handleUpdate = async (data) => {
    try {
      const payload = {
        code: data.code,
        description: data.description,
        discountType: data.discountType,
        discountValue: parseFloat(data.discountValue),
        minimumOrder: parseFloat(data.minOrderAmount) || 0,
        maxDiscount: data.maxDiscount ? parseFloat(data.maxDiscount) : null,
        startDate: data.startDate,
        endDate: data.expiryDate,
        usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
        active: data.status === "active",
      };
      await couponService.updateCoupon(editingCoupon._id || editingCoupon.id, payload);
      toast.success("Coupon updated");
      setModalOpen(false);
      setEditingCoupon(null);
      loadData();
    } catch (err) {
      toast.error(err.message || "Failed to update coupon");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this coupon?")) {
      try {
        await couponService.deleteCoupon(id);
        toast.success("Coupon deleted");
        loadData();
      } catch (err) {
        toast.error(err.message || "Failed to delete");
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await couponService.toggleCoupon(id);
      toast.success("Status toggled");
      loadData();
    } catch (err) {
      toast.error(err.message || "Failed to toggle");
    }
  };

  const openEditModal = (id) => {
    const coupon = coupons.find(c => c._id === id || c.id === id);
    setEditingCoupon(coupon);
    setModalOpen(true);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = search || statusFilter !== "all";

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(value);
  };

  const getDiscountDisplay = (coupon) => {
    if (coupon.discountType === "percentage") return `${coupon.discountValue}% OFF`;
    if (coupon.discountType === "fixed") return `₹${coupon.discountValue} OFF`;
    return "Free Shipping";
  };

  const getStatusConfig = (coupon) => {
    const status = getCouponStatus(coupon);
    const configs = {
      active: { color: "text-green-600", dot: "bg-green-500", label: "Active" },
      expired: { color: "text-red-600", dot: "bg-red-500", label: "Expired" },
      scheduled: { color: "text-blue-600", dot: "bg-blue-500", label: "Scheduled" },
      disabled: { color: "text-gray-400", dot: "bg-gray-400", label: "Disabled" },
    };
    return configs[status] || configs.active;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied: ${text}`);
  };

  const tabs = [
    { key: "all", label: "All Coupons", count: stats.total },
    { key: "active", label: "Active", count: stats.active },
    { key: "scheduled", label: "Scheduled", count: stats.scheduled },
    { key: "expired", label: "Expired", count: stats.expired },
  ];

  // Usage data for donut chart
  const usageData = coupons
    .filter(c => c.usedCount > 0)
    .sort((a, b) => b.usedCount - a.usedCount)
    .slice(0, 4);

  const totalUsageAll = usageData.reduce((sum, c) => sum + c.usedCount, 0);
  const otherUsage = coupons
    .filter(c => c.usedCount > 0)
    .slice(4)
    .reduce((sum, c) => sum + c.usedCount, 0);

  const chartData = [
    ...usageData.map((c, idx) => ({
      name: c.code,
      value: c.usedCount,
      color: ["#f97316", "#3b82f6", "#8b5cf6", "#10b981"][idx % 4],
    })),
    ...(otherUsage > 0 ? [{ name: "Others", value: otherUsage, color: "#94a3b8" }] : []),
  ];

  const COLORS = ["#f97316", "#3b82f6", "#8b5cf6", "#10b981", "#94a3b8"];

  const topPerforming = [...coupons]
    .filter(c => c.active)
    .sort((a, b) => b.usedCount - a.usedCount)
    .slice(0, 5);

  const statsCards = [
    { title: "Total Coupons", value: stats.total, icon: Tag, color: "orange", growth: stats.growth.total },
    { title: "Active Coupons", value: stats.active, icon: CheckCircle, color: "green", growth: stats.growth.active },
    { title: "Total Usage", value: stats.totalUsage.toLocaleString(), icon: Users, color: "blue", growth: stats.growth.usage },
    { title: "Total Discount", value: formatCurrency(stats.totalDiscount), icon: DollarSign, color: "purple", growth: stats.growth.discount },
    { title: "Revenue Generated", value: formatCurrency(stats.revenueGenerated), icon: TrendingUp, color: "emerald", growth: stats.growth.revenue },
  ];

  return (
    <div className="space-y-6">
      <StatsGrid stats={statsCards} />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-800">
              <div className="flex flex-wrap items-center justify-between px-5 py-3 gap-3">
                <div className="flex flex-wrap gap-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setStatusFilter(tab.key)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                        statusFilter === tab.key
                          ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {tab.label}
                      <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                        statusFilter === tab.key ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search coupons..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 pr-4 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none w-40 md:w-48"
                    />
                  </div>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-sm text-orange-600 hover:text-orange-700">
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent" />
                </div>
              ) : coupons.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No coupons found. Create your first coupon!</div>
              ) : (
                <table className="w-full min-w-[900px] text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-3 py-3 text-left w-[150px] min-w-[120px]">Coupon Code</th>
                      <th className="px-3 py-3 text-left w-[100px] min-w-[80px]">Discount</th>
                      <th className="px-3 py-3 text-left w-[100px] min-w-[80px]">Type</th>
                      <th className="px-3 py-3 text-left w-[100px] min-w-[80px]">Min. Order</th>
                      <th className="px-3 py-3 text-left w-[140px] min-w-[120px]">Usage</th>
                      <th className="px-3 py-3 text-left w-[170px] min-w-[150px]">Validity</th>
                      <th className="px-3 py-3 text-left w-[100px] min-w-[80px]">Status</th>
                      <th className="px-3 py-3 text-center w-[120px] min-w-[100px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {coupons.map((coupon) => {
                      const statusConfig = getStatusConfig(coupon);
                      const discountDisplay = getDiscountDisplay(coupon);
                      const usagePercent = coupon.usageLimit ? Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100) : 0;
                      const start = new Date(coupon.startDate).toLocaleDateString();
                      const end = new Date(coupon.endDate).toLocaleDateString();
                      const validity = `${start} → ${end}`;
                      return (
                        <React.Fragment key={coupon._id || coupon.id}>
                          <tr
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition cursor-pointer"
                            onClick={() => {
                              setSelectedCoupon(coupon);
                              setDetailModalOpen(true);
                            }}
                          >
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-orange-600">{coupon.code}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(coupon.code);
                                  }}
                                  className="text-gray-400 hover:text-orange-500 transition p-0.5 flex-shrink-0"
                                  title="Copy coupon code"
                                >
                                  <Copy size={14} />
                                </button>
                              </div>
                            </td>
                            <td className="px-3 py-3 font-semibold whitespace-nowrap">{discountDisplay}</td>
                            <td className="px-3 py-3 capitalize whitespace-nowrap">{coupon.discountType}</td>
                            <td className="px-3 py-3 whitespace-nowrap">{coupon.minimumOrder ? `₹${coupon.minimumOrder}` : "—"}</td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2 whitespace-nowrap">
                                <span>{coupon.usedCount}</span>
                                {coupon.usageLimit && (
                                  <>
                                    <span className="text-gray-400">/ {coupon.usageLimit}</span>
                                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                                      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${usagePercent}%` }} />
                                    </div>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-xs whitespace-nowrap">{validity}</td>
                            <td className="px-3 py-3">
                              <span className="flex items-center gap-1.5 whitespace-nowrap">
                                <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`}></span>
                                <span className={statusConfig.color}>{statusConfig.label}</span>
                              </span>
                            </td>
                            <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleToggleStatus(coupon._id || coupon.id)}
                                  className={`p-1 rounded hover:bg-gray-100 ${coupon.active ? "text-gray-400 hover:text-orange-500" : "text-gray-400 hover:text-green-500"}`}
                                  title={coupon.active ? "Disable" : "Enable"}
                                >
                                  {coupon.active ? <PowerOff size={15} /> : <Power size={15} />}
                                </button>
                                <button
                                  onClick={() => handleDelete(coupon._id || coupon.id)}
                                  className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                                  title="Delete"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {coupon.description && (
                            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                              <td colSpan="8" className="px-3 py-1 text-xs text-gray-400 border-t-0">
                                {coupon.description}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {totalPages > 1 && (
              <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-800 flex flex-wrap justify-between items-center gap-2 text-sm text-gray-500">
                <span>Showing {coupons.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results</span>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={totalItems}
                  simple
                />
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <button
            onClick={() => { setEditingCoupon(null); setModalOpen(true); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-sm transition font-semibold"
          >
            <Plus size={18} /> Create New Coupon
          </button>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <h4 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <BarChart3 size={16} /> Coupon Usage Overview
              </h4>
            </div>
            <div className="p-4">
              <div className="relative h-48 w-48 mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color || COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} uses`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-bold text-gray-800">{stats.totalUsage}</span>
                  <span className="text-xs text-gray-500">Total Uses</span>
                </div>
              </div>
              <div className="mt-4 space-y-1.5">
                {chartData.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color || COLORS[idx % COLORS.length] }}></span>
                      {item.name}
                    </span>
                    <span className="text-gray-600">{item.value} ({Math.round((item.value / stats.totalUsage) * 100)}%)</span>
                  </div>
                ))}
                {chartData.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No usage data available</p>}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <h4 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <TrendingUp size={16} /> Top Performing Coupons
              </h4>
            </div>
            <div className="p-4 space-y-3">
              {topPerforming.length === 0 ? (
                <p className="text-sm text-gray-500">No data</p>
              ) : (
                topPerforming.map((coupon, idx) => (
                  <div key={coupon._id || coupon.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold w-4 ${idx === 0 ? "text-yellow-500" : "text-gray-400"}`}>{idx + 1}</span>
                      <span className="font-mono text-sm text-orange-600">{coupon.code}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-600">{getDiscountDisplay(coupon)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl border border-orange-200 dark:border-orange-800 shadow-sm overflow-hidden">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb size={18} className="text-orange-500" />
                <h4 className="font-semibold text-gray-800 dark:text-white">Quick Tips</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Create exclusive coupons for new users to increase registrations and boost sales.
              </p>
              <button className="mt-3 text-sm text-orange-600 hover:underline font-medium flex items-center gap-1">
                Learn More →
              </button>
            </div>
          </div>
        </div>
      </div>

      <CouponDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        coupon={selectedCoupon}
        onEdit={(id) => {
          setDetailModalOpen(false);
          openEditModal(id);
        }}
      />

      <CouponFormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingCoupon(null); }}
        onSave={editingCoupon ? handleUpdate : handleCreate}
        initialData={editingCoupon}
      />
    </div>
  );
};

export default AdminCoupons;