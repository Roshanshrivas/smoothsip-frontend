// src/pages/admin/CustomProducts/index.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Palette,
  Type,
  Image,
  FileType,
  ShoppingBag,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Eye,
  Copy,
} from "lucide-react";
import toast from "react-hot-toast";
import StatsGrid from "../../components/admin/StatsGrid";
import FilterBar from "../../components/admin/FilterBar";
import Pagination from "../../components/admin/Pagination";
import { customProductService } from "../../services/customProductService"; // ✅ correct path

const CustomProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    draft: 0,
    inactive: 0,
    revenue: 0,
  });

  // ---------- Load Data ----------
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await customProductService.fetchCustomProducts();
      setProducts(data);

      // Compute stats (adjust according to your product structure)
      const total = data.length;
      const active = data.filter((p) => p.status === "Active").length;
      const draft = data.filter((p) => p.status === "Draft").length;
      const inactive = data.filter((p) => p.status === "Inactive").length;
      const revenue = data.reduce((sum, p) => sum + (p.salesCount || 0) * (p.basePrice || 0), 0);

      setStats({ total, active, draft, inactive, revenue });
    } catch (error) {
      toast.error("Failed to load products");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ---------- Filter & Paginate ----------
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? p.status === "Active"
        : p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalFiltered = filteredProducts.length;
  const totalPages = Math.ceil(totalFiltered / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ---------- Handlers ----------
  const handleDelete = async (id) => {
    if (window.confirm("Delete this product permanently?")) {
      try {
        await customProductService.deleteCustomProduct(id);
        toast.success("Product deleted");
        loadData();
      } catch (error) {
        toast.error("Failed to delete");
      }
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const original = products.find((p) => p.id === id);
      if (!original) return;
      const newProduct = {
        ...original,
        id: undefined,
        name: `${original.name} (Copy)`,
        status: "Draft",
      };
      await customProductService.createCustomProduct(newProduct);
      toast.success("Product duplicated");
      loadData();
    } catch (error) {
      toast.error("Failed to duplicate");
    }
  };

  // ---------- Get Customization Icons ----------
  const getCustomizationIcons = (customization) => {
    if (!customization) return [];
    const icons = [];
    if (customization.text?.enabled) icons.push({ icon: Type, label: "Text" });
    if (customization.logo?.enabled) icons.push({ icon: Image, label: "Logo" });
    if (customization.font?.enabled) icons.push({ icon: FileType, label: "Font" });
    if (customization.color?.enabled) icons.push({ icon: Palette, label: "Color" });
    return icons;
  };

  // ---------- Stats Cards ----------
  const statsCards = [
    {
      title: "Total Tumblers",
      value: stats.total,
      icon: ShoppingBag,
      color: "blue",
      growth: "+12%",
    },
    {
      title: "Active",
      value: stats.active,
      icon: Sparkles,
      color: "green",
      growth: "+8%",
    },
    {
      title: "Draft",
      value: stats.draft,
      icon: AlertCircle,
      color: "yellow",
      growth: "-2%",
    },
    {
      title: "Inactive",
      value: stats.inactive,
      icon: Package,
      color: "gray",
      growth: "+1%",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.revenue.toLocaleString()}`,
      icon: TrendingUp,
      color: "emerald",
      growth: "+18.5%",
    },
  ];

  // ---------- Filter Config ----------
  const filterConfig = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "all", label: "All" },
        { value: "Active", label: "Active", dot: "bg-green-500" },
        { value: "Draft", label: "Draft", dot: "bg-yellow-500" },
        { value: "Inactive", label: "Inactive", dot: "bg-gray-400" },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
    },
  ];

  // ---------- Render ----------
  return (
    <div className="space-y-6">
      <StatsGrid stats={statsCards} />

      <FilterBar
        title="Customizable Tumblers"
        subtitle={`${totalFiltered} products`}
        searchTerm={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by product name..."
        filters={filterConfig}
        onClearFilters={() => {
          setSearch("");
          setStatusFilter("all");
          setCurrentPage(1);
        }}
        addButton={{
          label: "Add Product",
          onClick: () => navigate("/admin/custom-products/add"),
          icon: <Plus size={18} />,
        }}
      />

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-2 text-gray-500">Loading products...</p>
        </div>
      ) : paginatedProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <Package className="mx-auto h-16 w-16 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first customizable tumbler.</p>
          <button
            onClick={() => navigate("/admin/custom-products/add")}
            className="mt-4 inline-flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition shadow-sm"
          >
            <Plus size={18} /> Add Product
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => {
              const customizationIcons = getCustomizationIcons(product.customization);
              const isDraft = product.status === "Draft";
              const isInactive = product.status === "Inactive";

              return (
                <div
                  key={product._id}
                  className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                >
                  <div
                    className="relative h-56 bg-gray-100 flex items-center justify-center p-4 cursor-pointer"
                    onClick={() => navigate(`/admin/custom-products/${product._id}`)}
                  >
                    <img
                      src={product.mainImage || "https://placehold.co/400x400/FFF4E6/78350F?text=No+Image"}
                      alt={product.name}
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {(isDraft || isInactive) && (
                      <span
                        className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium shadow-sm
                          ${isDraft ? "bg-yellow-100 text-yellow-700" : "bg-gray-200 text-gray-600"}`}
                      >
                        {isDraft ? "Draft" : "Inactive"}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium text-gray-800 flex items-center gap-2">
                        <Eye size={16} /> Quick View
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3
                          className="text-lg font-bold text-gray-800 line-clamp-1 cursor-pointer hover:text-orange-600 transition"
                          onClick={() => navigate(`/admin/custom-products/${product.id}`)}
                        >
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-2xl font-bold text-orange-600">₹{product.basePrice}</span>
                          <span className="text-xs text-gray-400">+ customisation</span>
                        </div>
                      </div>
                      {product.color && (
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white shadow-md flex-shrink-0"
                          style={{ backgroundColor: product.color }}
                          title="Tumbler color"
                        />
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {customizationIcons.length > 0 ? (
                        customizationIcons.map(({ icon: Icon, label }, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
                          >
                            <Icon size={12} /> {label}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">No customisations</span>
                      )}
                    </div>

                    {product.salesCount > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        📦 {product.salesCount} orders
                      </div>
                    )}

                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                      <Link
                        to={`/admin/custom-products/${product.id}/edit`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-orange-50 text-gray-700 hover:text-orange-600 rounded-lg transition text-sm"
                      >
                        <Edit size={15} /> Edit
                      </Link>
                      <button
                        onClick={() => handleDuplicate(product.id)}
                        className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition text-sm"
                        title="Duplicate"
                      >
                        <Copy size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex items-center justify-center px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition text-sm"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalFiltered}
            />
          )}
        </>
      )}
    </div>
  );
};

export default CustomProducts;