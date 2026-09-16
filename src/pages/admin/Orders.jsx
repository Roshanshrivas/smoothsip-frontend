// src/pages/admin/Orders.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  DollarSign,
  TrendingUp,
  Users,
  RefreshCw,
  Plus,
  FileText,
  IndianRupee,
} from "lucide-react";
import toast from "react-hot-toast";
import StatsGrid from "../../components/admin/StatsGrid";
import Pagination from "../../components/admin/Pagination";
import FilterBar from "../../components/admin/FilterBar";
import OrderTable from "../../components/admin/orders/OrderTable";
import { orderService } from "../../services/orderService";

// ========== SKELETON COMPONENTS ==========
const StatsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm animate-pulse"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            <div className="mt-2 h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          </div>
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

const TableSkeleton = () => (
  <div className="overflow-x-auto animate-pulse">
    <table className="w-full min-w-[900px]">
      <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
        <tr>
          {[
            "Order ID",
            "Customer",
            "Date",
            "Total",
            "Status",
            "Payment",
            "Actions",
          ].map((h) => (
            <th key={h} className="px-6 py-4 text-left">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
        {[...Array(5)].map((_, i) => (
          <tr key={i}>
            <td className="px-6 py-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
            </td>
            <td className="px-6 py-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
            </td>
            <td className="px-6 py-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            </td>
            <td className="px-6 py-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            </td>
            <td className="px-6 py-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
            </td>
            <td className="px-6 py-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            </td>
            <td className="px-6 py-4">
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ========== MAIN COMPONENT ==========
const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [fulfillmentFilter, setFulfillmentFilter] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const itemsPerPage = 10;

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderService.fetchOrders({
        page: currentPage,
        limit: itemsPerPage,
        search,
        status: statusFilter,
        paymentStatus: paymentFilter,
        fulfillment: fulfillmentFilter,
        startDate,
        endDate,
      });
      // Format dates for display
      const formatted = res.orders.map((order) => ({
        ...order,
        id: order._id,
        displayId: order.orderNumber || order._id,
        date: new Date(order.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        time: new Date(order.createdAt).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        // Map shippingAddress to a flat address for convenience (if needed)
        address: order.shippingAddress?.address || order.address || "—",
      }));
      setOrders(formatted);
      setTotalPages(res.totalPages || Math.ceil(res.total / itemsPerPage));
      setTotalItems(res.total);
      setSelectedOrders([]);
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [
    currentPage,
    search,
    statusFilter,
    paymentFilter,
    fulfillmentFilter,
    startDate,
    endDate,
  ]);

useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    totalCustomers: 0,
    salesGrowth: 12.5,
    avgOrderGrowth: 8.2,
    customersGrowth: 15.7,
    refunds: 0,
    refundsGrowth: -2.4,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await orderService.getOrderStats();
        setStats(statsData);
      } catch (err) {
        console.error(err);
      }
    };
    loadStats();
  }, []);

  // Handlers
  const handleRowClick = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  const handleExport = async () => {
    try {
      const allOrders = await orderService.fetchAllOrders({
        search,
        status: statusFilter,
        paymentStatus: paymentFilter,
        fulfillment: fulfillmentFilter,
        startDate,
        endDate,
      });
      if (!allOrders.length) {
        toast.error("No orders to export");
        return;
      }
      const headers = [
        "Order ID",
        "Customer",
        "Email",
        "Date",
        "Total",
        "Status",
        "Payment Method",
        "Payment Status",
      ];
      const csvRows = [
        headers.join(","),
        ...allOrders.map((o) =>
          [
            o.id,
            `"${o.customer}"`,
            o.email,
            o.date,
            o.total,
            o.status,
            o.paymentMethod,
            o.paymentStatus,
          ].join(","),
        ),
      ];
      const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders_export_${new Date().toISOString().slice(0, 19)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${allOrders.length} orders`);
    } catch (err) {
      toast.error("Export failed");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setFulfillmentFilter("all");
    setStartDate(null);
    setEndDate(null);
    setCurrentPage(1);
  };

  const handleSelectAll = (selectAll) => {
    if (selectAll) {
      setSelectedOrders(orders.map((o) => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const hasActiveFilters =
    search !== "" ||
    statusFilter !== "all" ||
    paymentFilter !== "all" ||
    fulfillmentFilter !== "all" ||
    startDate ||
    endDate;

  const statsCards = [
    {
      title: "Total Orders",
      value: stats.total || 0,
      icon: Package,
      color: "blue",
      growth: stats.salesGrowth,
    },
    {
      title: "Total Revenue",
      value: `₹${(stats.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "green",
      growth: stats.salesGrowth,
    },
    {
      title: "Avg. Order Value",
      value: `₹${(stats.avgOrderValue || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: "orange",
      growth: stats.avgOrderGrowth,
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers || 0,
      icon: Users,
      color: "purple",
      growth: stats.customersGrowth,
    },
    {
      title: "Pending Orders",
      value: stats.pending || 0,
      icon: RefreshCw,
      color: "red",
      growth: stats.refundsGrowth,
    },
  ];

  const filterConfigs = [
    {
      key: "status",
      label: "Status",
      icon: Package,
      options: [
        { value: "all", label: "All Status" },
        { value: "Pending", label: "Pending", dot: "bg-yellow-500" },
        { value: "Processing", label: "Processing", dot: "bg-blue-500" },
        { value: "Shipped", label: "Shipped", dot: "bg-orange-500" },
        { value: "Delivered", label: "Delivered", dot: "bg-green-500" },
        { value: "Cancelled", label: "Cancelled", dot: "bg-red-500" },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
    },
    {
      key: "payment",
      label: "Payment",
      icon:  IndianRupee,
      options: [
        { value: "all", label: "All Payment" },
        { value: "Paid", label: "Paid", dot: "bg-green-500" },
        { value: "Unpaid", label: "Unpaid", dot: "bg-red-500" },
        { value: "Refunded", label: "Refunded", dot: "bg-purple-500" },
      ],
      value: paymentFilter,
      onChange: setPaymentFilter,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const handleUpdateStatus = async (id, newStatus) => {
    await orderService.updateOrderStatus(id, newStatus);
    loadOrders();
  };

  const handleEditOrder = (id) => {
    navigate(`/admin/orders/${id}/edit`);
  };

  const handleDuplicateOrder = async (id) => {
    await orderService.duplicateOrder(id);
    loadOrders();
  };

  const handleDeleteOrder = async (id) => {
    await orderService.deleteOrder(id);
    loadOrders();
  };

  const handleSendEmail = (id) => {
    toast.success(`Email invoice sent for order ${id}`);
  };

  const handleCancelOrder = async (id) => {
    await orderService.updateOrderStatus(id, "Cancelled");
    loadOrders();
  };

  const handlePrintInvoice = (id) => {
    toast.success(`Print invoice for order ${id} (demo)`);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Stats Grid */}
      {isInitialLoad ? <StatsSkeleton /> : <StatsGrid stats={statsCards} />}

      {/* Filter Bar */}
      <div className="relative z-50">
      <FilterBar
        title="Orders"
        subtitle="Manage all customer orders"
        searchTerm={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by order ID, customer, or email..."
        filters={filterConfigs}
        onClearFilters={clearFilters}
        addButton={{
          label: "Create Order",
          onClick: () => navigate("/admin/orders/add"),
          icon: <Plus size={18} />,
        }}
        exportButton={{ label: "Export", onClick: handleExport }}
        isLoading={isInitialLoad}
      />
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden relative z-10">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TableSkeleton />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <OrderTable
                orders={orders}
                onRowClick={handleRowClick}
                onViewDetails={handleRowClick}
                onUpdateStatus={handleUpdateStatus}
                onEditOrder={handleEditOrder}
                onDuplicateOrder={handleDuplicateOrder}
                onDeleteOrder={handleDeleteOrder}
                onSendEmail={handleSendEmail}
                onCancelOrder={handleCancelOrder}
                // onPrintInvoice={handlePrintInvoice}
                isLoading={loading}
                selectedOrders={selectedOrders}
                onSelectOrder={setSelectedOrders}
                onSelectAll={handleSelectAll}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
          />
        )}
      </div>
    </motion.div>
  );
};

export default Orders;
