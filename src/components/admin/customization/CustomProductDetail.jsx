// src/components/admin/customization/CustomProductDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  Palette,
  Type,
  Image,
  FileType,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Copy,
} from "lucide-react";
import toast from "react-hot-toast";
import { customProductService } from "../../../services/customProductService";

const CustomProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    // Guard against missing or invalid ID
    if (!id || id === 'undefined' || id === 'null') {
      toast.error('Invalid product ID');
      navigate('/admin/custom-products');
      return;
    }

    const loadProduct = async () => {
      try {
        const data = await customProductService.getCustomProductById(id); // ✅ correct method
        setProduct(data);
      } catch (error) {
        toast.error("Product not found");
        navigate("/admin/custom-products");
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm("Delete this product permanently?")) {
      try {
        await customProductService.deleteCustomProduct(id);
        toast.success("Product deleted");
        navigate("/admin/custom-products");
      } catch (error) {
        toast.error("Failed to delete");
      }
    }
  };

  const handleDuplicate = async () => {
    try {
      const newProduct = {
        ...product,
        id: undefined,
        name: `${product.name} (Copy)`,
        status: "Draft",
      };
      await customProductService.createCustomProduct(newProduct);
      toast.success("Product duplicated");
      navigate("/admin/custom-products");
    } catch (error) {
      toast.error("Failed to duplicate");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (!product) return null;

  const customizationSections = [
    { key: "text", label: "Text", icon: Type, enabled: product.customization?.text?.enabled },
    { key: "logo", label: "Logo", icon: Image, enabled: product.customization?.logo?.enabled },
    { key: "font", label: "Font", icon: FileType, enabled: product.customization?.font?.enabled },
    { key: "color", label: "Color", icon: Palette, enabled: product.customization?.color?.enabled },
  ];

  const statusColors = {
    Active: "bg-green-100 text-green-700",
    Draft: "bg-yellow-100 text-yellow-700",
    Inactive: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/admin/custom-products" className="hover:text-orange-600 flex items-center gap-1">
          <ArrowLeft size={16} /> Custom Products
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{product.name}</span>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
              <img
                src={product.mainImage || "https://placehold.co/80x80/FFF4E6/78350F?text=No"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{product.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[product.status] || "bg-gray-100"}`}>
                  {product.status}
                </span>
                <span className="text-2xl font-bold text-orange-600">₹{product.basePrice}</span>
                {product.color && (
                  <span
                    className="w-6 h-6 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: product.color }}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDuplicate}
              className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition flex items-center gap-2"
            >
              <Copy size={16} /> Duplicate
            </button>
            <Link
              to={`/admin/custom-products/${id}/edit`}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-sm transition flex items-center gap-2"
            >
              <Edit size={16} /> Edit Product
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-2"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <ShoppingBag size={16} /> Total Orders
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{product.salesCount || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <TrendingUp size={16} /> Total Revenue
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            ₹{((product.salesCount || 0) * product.basePrice).toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Package size={16} /> SKU Count
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">1</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Sparkles size={16} /> Customizations
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {customizationSections.filter((s) => s.enabled).length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Description</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {product.description || "No description provided."}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Customization Options</h3>
            <div className="grid grid-cols-2 gap-3">
              {customizationSections.map((section) => (
                <div
                  key={section.key}
                  className={`p-3 rounded-lg border flex items-center gap-3 ${
                    section.enabled
                      ? "border-orange-200 bg-orange-50 dark:bg-orange-950/20"
                      : "border-gray-200 bg-gray-50 dark:bg-gray-800/30 text-gray-400"
                  }`}
                >
                  <section.icon size={18} className={section.enabled ? "text-orange-500" : "text-gray-400"} />
                  <span className={section.enabled ? "text-gray-700" : "text-gray-400"}>
                    {section.label}
                    {section.enabled && " ✅"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Metadata</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Product ID</span>
                <span className="font-mono text-gray-700 dark:text-gray-300">{product.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {new Date(product.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[product.status]}`}>
                  {product.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Base Price</span>
                <span className="font-bold text-orange-600">₹{product.basePrice}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to={`/admin/custom-products/${id}/edit`}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition"
              >
                <Edit size={16} /> Edit Product
              </Link>
              <button
                onClick={handleDuplicate}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition"
              >
                <Copy size={16} /> Duplicate
              </button>
              <button
                onClick={handleDelete}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomProductDetail;