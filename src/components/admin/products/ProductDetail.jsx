import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Package,
  Tag,
  DollarSign,
  ShoppingBag,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Image,
  Trash2,
  Ruler,
  Weight,
  Info,
  Shield,
  IndianRupee,
  Check,
  List,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import DeleteConfirmModal from "../ConfirmDialog";
import { productService } from "../../../services/productService";


// ─── Helper to format dimensions object or string ───
const formatDimensions = (dim) => {
  if (!dim) return "—";
  if (typeof dim === "string") return dim;
  if (typeof dim === "object" && dim.length !== undefined) {
    return `${dim.length} x ${dim.width} x ${dim.height} cm`;
  }
  return "—";
};

// ─── Helper to ensure array is displayed properly ───
const ensureArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value) return [value];
  return [];
};


// ─── Helper: format weight from grams ───
const formatWeight = (grams) => {
  if (!grams || grams === 0) return "—";
  if (grams >= 1000) return `${(grams / 1000).toFixed(2)} kg`;
  return `${grams} g`;
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await productService.getProduct(id);
        // Map fields for display
        const mappedProduct = {
          ...data,
          id: data._id || data.id,
          image: data.mainImage || (data.images && data.images[0]) || "https://placehold.co/600x400/FFF4E6/78350F?text=No+Image",
          category: data.category?.name || data.category || "Uncategorized",
          dimensions: formatDimensions(data.dimensions),
          // Ensure arrays are actually arrays
          features: ensureArray(data.features),
          specifications: ensureArray(data.specifications),
        };
        setProduct(mappedProduct);
      } catch (err) {
        console.error(err);
        setError("Product not found");
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  const handleDelete = async () => {
    try {
      await productService.deleteProduct(id);
      setDeleteModalOpen(false);
      toast.success("Product deleted");
      navigate("/admin/products");
    } catch (err) {
      toast.error("Failed to delete product");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <Package size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800">Product not found</h2>
        <Link to="/admin/products" className="text-orange-500 hover:underline mt-2 inline-block">
          Back to Products
        </Link>
      </div>
    );
  }

  const StatusIcon = product.status === "Active" ? CheckCircle : product.status === "Draft" ? AlertTriangle : XCircle;
  const StatusColor = product.status === "Active" ? "text-green-500" : product.status === "Draft" ? "text-yellow-500" : "text-red-500";

  return (
    <div className="space-y-6">
      {/* ─── Breadcrumb ────────────────────────────────── */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link
          to="/admin/products"
          className="hover:text-orange-600 flex items-center gap-1"
        >
          <ArrowLeft size={16} /> Products
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{product.name}</span>
      </div>

      {/* ─── Header with actions ──────────────────────── */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {product.name}
            </h1>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${StatusColor} bg-opacity-10`}
            >
              {product.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
            <span>
              SKU: {product.sku || `TMB-${String(product.id).slice(-4)}`}
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span>Category: {product.category}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span>Product ID: #{product.id}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-2"
          >
            <Trash2 size={16} /> Delete
          </button>
          <Link
            to={`/admin/products/${id}/edit`}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-sm transition flex items-center gap-2"
          >
            <Edit size={16} /> Edit Product
          </Link>
        </div>
      </div>

      {/* ─── Main content grid ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Left Column: Image ────────────────────── */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-64 object-cover rounded-xl border border-gray-200 dark:border-gray-700"
            />
            <div className="mt-3 flex items-center gap-2 justify-center text-sm text-gray-500">
              <Image size={16} /> Product image
            </div>
          </div>

          {/* Quick stats cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 text-center shadow-sm">
              <p className="text-xs text-gray-500">Stock</p>
              <p className="text-lg font-bold text-gray-800 dark:text-white">
                {product.stock}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 text-center shadow-sm">
              <p className="text-xs text-gray-500">Price</p>
              <p className="text-lg font-bold text-orange-500">
                ₹{product.price}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Right Column: Details ──────────────────── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Main details grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Tag size={16} /> Category
              </div>
              <p className="font-semibold text-gray-800 dark:text-white">
                {product.category}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <IndianRupee size={16} /> Price
              </div>
              <p className="font-semibold text-gray-800 dark:text-white">
                ₹{product.price}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <ShoppingBag size={16} /> Stock
              </div>
              <p className="font-semibold text-gray-800 dark:text-white">
                {product.stock} units
                {product.stock === 0 && (
                  <span className="ml-2 text-red-500 text-xs font-medium">
                    (Out of stock)
                  </span>
                )}
                {product.stock > 0 && product.stock <= 10 && (
                  <span className="ml-2 text-orange-500 text-xs font-medium">
                    (Low stock)
                  </span>
                )}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Calendar size={16} /> Created
              </div>
              <p className="font-semibold text-gray-800 dark:text-white">
                {new Date(product.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* ─── Product Attributes ────────────────────── */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Info size={16} /> Product Attributes
              </h4>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Color</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {product.color || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Weight</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {formatWeight(product.weight)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Dimensions</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {product.dimensions || "10 x 10 x 20 cm"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Material</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {product.material || "Stainless Steel"}
                </p>
              </div>
            </div>
          </div>

          {/* ─── Description ───────────────────────────── */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
              <Package size={16} /> Description
            </h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {product.description || "No description provided."}
            </p>
          </div>

          {/* ─── Features ──────────────────────────────── */}
          {product.features && product.features.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
                <Check size={16} className="text-green-500" /> Features
              </h4>
              <ul className="space-y-1.5">
                {product.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#14C6D8] mt-1.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ─── Tags ────────────────────────────────── */}
          {product.tags && product.tags.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
                <Tag size={16} className="text-blue-500" /> Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ─── Specifications ────────────────────────── */}
          {product.specifications && product.specifications.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <List size={16} className="text-blue-500" /> Specifications
                </h4>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {product.specifications.map((spec, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between border-b border-gray-100 dark:border-gray-800 py-2 last:border-0"
                    >
                      <span className="font-medium text-gray-600 dark:text-gray-400">
                        {spec.label}
                      </span>
                      <span className="text-gray-800 dark:text-gray-200">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── SEO & Meta ────────────────────────────── */}
          {(product.metaTitle || product.metaDescription) && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
                <Shield size={16} className="text-purple-500" /> SEO & Meta
              </h4>
              <div className="space-y-3 text-sm">
                {product.metaTitle && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Meta Title
                    </p>
                    <p className="text-gray-800 dark:text-white mt-0.5 font-medium">
                      {product.metaTitle}
                    </p>
                  </div>
                )}
                {product.metaDescription && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Meta Description
                    </p>
                    <p className="text-gray-800 dark:text-white mt-0.5">
                      {product.metaDescription}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Delete Modal ─────────────────────────────── */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default ProductDetail;