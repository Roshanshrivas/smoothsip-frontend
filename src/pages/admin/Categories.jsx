import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, CheckCircle, XCircle, Package, Plus, FolderTree } from "lucide-react";
import toast from "react-hot-toast";

import StatsGrid from "../../components/admin/StatsGrid";
import Pagination from "../../components/admin/Pagination";
import FilterBar from "../../components/admin/FilterBar";
import CategoryTable from "../../components/admin/categories/CategoryTable";
import { categoryService } from "../../services/categoryService";

// ========== SKELETON COMPONENTS ==========
const StatsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm animate-pulse">
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
    <table className="w-full min-w-[700px]">
      <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
        <tr>
          {["Category", "Slug", "Products", "Status", "Created", "Actions"].map((heading) => (
            <th key={heading} className="px-6 py-4 text-left">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
        {[...Array(5)].map((_, i) => (
          <tr key={i}>
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                </div>
              </div>
            </td>
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" /></td>
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" /></td>
            <td className="px-6 py-4"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" /></td>
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" /></td>
            <td className="px-6 py-4"><div className="flex gap-2"><div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded" /><div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded" /></div></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ========== MAIN COMPONENT ==========
const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [statsData, setStatsData] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalProducts: 0,
  });
  const itemsPerPage = 10;

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoryService.fetchCategories({
        page: currentPage,
        limit: itemsPerPage,
        search,
        status: statusFilter,
      });
      setCategories(res.categories);
      setTotalPages(res.totalPages || Math.ceil(res.total / itemsPerPage));
      setTotalItems(res.total || 0);
      if (res.stats) {
        setStatsData({
          total: res.stats.total || 0,
          active: res.stats.active || 0,
          inactive: res.stats.inactive || 0,
          totalProducts: res.stats.totalProducts || 0,
        });
      }
    } catch (err) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [currentPage, search, statusFilter]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // ---------- Handlers ----------
  const handleRowClick = (categoryId) => {
    navigate(`/admin/categories/${categoryId}`);
  };

  const handleEdit = (category) => {
    navigate(`/admin/categories/${category.id}/edit`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this category?")) {
      await categoryService.deleteCategory(id);
      loadCategories();
    }
  };

  const handleBulkDelete = async (ids) => {
    if (window.confirm(`Delete ${ids.length} selected categories?`)) {
      await categoryService.bulkDeleteCategories(ids);
      loadCategories();
    }
  };

  const handleExport = async () => {
    try {
      const all = await categoryService.fetchAllCategories({ search, status: statusFilter });
      if (!all.length) {
        toast.error("No categories to export");
        return;
      }
      const headers = ["ID", "Name", "Slug", "Products", "Status", "Created At"];
      const csvRows = [
        headers.join(","),
        ...all.map(c => [
          c.id,
          `"${c.name.replace(/"/g, '""')}"`,
          c.slug,
          c.products || 0,
          c.status,
          c.createdAt,
        ].join(",")),
      ];
      const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `categories_export_${new Date().toISOString().slice(0, 19)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${all.length} categories`);
    } catch (err) {
      toast.error("Export failed");
    }
  };

  // ---------- Stats (now using statsData) ----------
  const stats = [
    { title: "Total Categories", value: isInitialLoad ? "—" : statsData.total, icon: Tag, color: "blue", growth: 12.5 },
    { title: "Active Categories", value: isInitialLoad ? "—" : statsData.active, icon: CheckCircle, color: "green", growth: 8.2 },
    { title: "Inactive Categories", value: isInitialLoad ? "—" : statsData.inactive, icon: XCircle, color: "red", growth: -3.1 },
    { title: "Total Products", value: isInitialLoad ? "—" : statsData.totalProducts, icon: Package, color: "orange", growth: 15.7 },
    { title: "Categories", value: isInitialLoad ? "—" : statsData.total, icon: FolderTree, color: "purple", growth: 4.2 },
  ];

  const filterConfigs = [
    {
      key: "status",
      label: "Status",
      icon: CheckCircle,
      options: [
        { value: "all", label: "All Status" },
        { value: "Active", label: "Active", dot: "bg-green-500" },
        { value: "Inactive", label: "Inactive", dot: "bg-red-500" },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Stats Grid */}
      {isInitialLoad ? <StatsSkeleton /> : <StatsGrid stats={stats} />}
      
      {/* Filter Bar */}
      <FilterBar
        title="Categories"
        subtitle="Manage your product categories"
        searchTerm={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or slug..."
        filters={filterConfigs}
        onClearFilters={() => { setSearch(""); setStatusFilter("all"); }}
        addButton={{ 
          label: "Add Category", 
          onClick: () => navigate("/admin/categories/add"),
          icon: <Plus size={18} />
        }}
        exportButton={{ label: "Export", onClick: handleExport }}
        isLoading={isInitialLoad}
      />

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
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
              <CategoryTable
                categories={categories}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onBulkDelete={handleBulkDelete}
                isLoading={loading}
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

export default Categories;