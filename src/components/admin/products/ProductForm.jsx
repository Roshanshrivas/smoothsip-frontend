// src/pages/admin/components/products/ProductForm.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Save, Package, Image, Info, Ruler, Weight,
  Shield, Plus, Trash2, X, Upload, Loader,
} from "lucide-react";
import toast from "react-hot-toast";
import { productService } from "../../../services/productService";
import { categoryService } from "../../../services/categoryService";
import apiClient from "../../../api/client";

// ─── Helpers ────────────────────────────────────────
const formatDimensionsForForm = (dim) => {
  if (!dim) return "";
  if (typeof dim === "string") return dim;
  if (typeof dim === "object") {
    return `${dim.length || 0} x ${dim.width || 0} x ${dim.height || 0}`;
  }
  return "";
};

const parseDimensionsString = (str) => {
  const parts = String(str).match(/\d+(\.\d+)?/g);
  if (parts && parts.length >= 3) {
    return { length: Number(parts[0]), width: Number(parts[1]), height: Number(parts[2]) };
  }
  return { length: 0, width: 0, height: 0 };
};

const ensureArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [newFeature, setNewFeature] = useState("");
  const [newSpecLabel, setNewSpecLabel] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    comparePrice: "",
    costPrice: "",
    stock: "",
    status: "Active",
    color: "",
    material: "Stainless Steel",
    weight: "",
    weightUnit: "kg",
    dimensions: "10 x 10 x 20",
    description: "",
    metaTitle: "",
    metaDescription: "",
    features: [],
    specifications: [],
    images: [],
    mainImage: "",
    tags: [],
  });

  // ─── Fetch categories ────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await categoryService.fetchCategories({ limit: 100 });
        setCategories(res.categories || []);
      } catch {
        toast.error("Failed to load categories");
      } finally {
        setCategoriesLoading(false);
      }
    })();
  }, []);

  // ─── Load product if editing ─────────────────────
  useEffect(() => {
    if (!isEditing) { setLoading(false); return; }
    (async () => {
      try {
        const product = await productService.getProduct(id);

        const grams = product.weight || 0;
        const displayUnit = grams >= 1000 ? "kg" : "g";
        const displayWeight = grams >= 1000 ? String((grams / 1000).toFixed(2)) : String(grams);

        setFormData({
          name: product.name || "",
          category: product.category?.name || product.category || "",
          price: product.price ?? "",
          comparePrice: product.comparePrice ?? "",
          costPrice: product.costPrice ?? "",
          stock: product.stock ?? "",
          status: product.status || "Active",
          color: product.color || "",
          material: product.material || "Stainless Steel",
          weight: displayWeight,
          weightUnit: displayUnit,
          dimensions: formatDimensionsForForm(product.dimensions),
          description: product.description || "",
          metaTitle: product.metaTitle || "",
          metaDescription: product.metaDescription || "",
          features: ensureArray(product.features),
          specifications: ensureArray(product.specifications),
          images: ensureArray(product.images),
          mainImage: product.mainImage || product.images?.[0] || "",
          tags: ensureArray(product.tags),
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load product");
        navigate("/admin/products");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEditing, navigate]);

  // ─── Handlers ────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // ─── Upload single file to Cloudinary (via backend) ───
  const uploadToCloudinary = async (file) => {
    const fd = new FormData();
    fd.append("image", file);

    const response = await apiClient.post(
      "/admin/cloudinary/upload-product-image",
      fd,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Upload failed");
    }
    return response.data.url;
  };

  // ─── Multi-image upload with progress ───
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Validate size (5MB max)
    const MAX_MB = 5;
    const tooBig = files.find((f) => f.size > MAX_MB * 1024 * 1024);
    if (tooBig) {
      toast.error(`"${tooBig.name}" exceeds ${MAX_MB}MB`);
      e.target.value = "";
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const urls = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadToCloudinary(files[i]);
        urls.push(url);
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      setFormData((p) => {
        const updated = [...p.images, ...urls];
        return {
          ...p,
          images: updated,
          mainImage: p.mainImage || updated[0] || "",
        };
      });

      toast.success(`${urls.length} image${urls.length > 1 ? "s" : ""} uploaded`);
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err?.response?.data?.message || err.message || "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = ""; // reset input so same file can be re-selected
    }
  };

  const removeImage = (index) => {
    setFormData((p) => {
      const updated = p.images.filter((_, i) => i !== index);
      return {
        ...p,
        images: updated,
        mainImage: updated.includes(p.mainImage) ? p.mainImage : (updated[0] || ""),
      };
    });
  };

  const setMainImage = (index) => {
    const newImages = [...formData.images];
    const [main] = newImages.splice(index, 1);
    newImages.unshift(main);
    setFormData((p) => ({ ...p, images: newImages, mainImage: main }));
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setFormData((p) => ({ ...p, features: [...p.features, newFeature.trim()] }));
    setNewFeature("");
  };

  const removeFeature = (i) =>
    setFormData((p) => ({ ...p, features: p.features.filter((_, idx) => idx !== i) }));

  const addSpecification = () => {
    if (!newSpecLabel.trim() || !newSpecValue.trim()) return;
    setFormData((p) => ({
      ...p,
      specifications: [...p.specifications, { label: newSpecLabel.trim(), value: newSpecValue.trim() }],
    }));
    setNewSpecLabel("");
    setNewSpecValue("");
  };

  const removeSpecification = (i) =>
    setFormData((p) => ({ ...p, specifications: p.specifications.filter((_, idx) => idx !== i) }));

  const toggleTag = (tag) => {
    setFormData((p) => ({
      ...p,
      tags: p.tags.includes(tag) ? p.tags.filter((t) => t !== tag) : [...p.tags, tag],
    }));
  };

  // ─── Submit ──────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return toast.error("Product name is required");
    if (!formData.category.trim()) return toast.error("Category is required");
    if (!formData.price || parseFloat(formData.price) <= 0)
      return toast.error("Price must be greater than 0");
    if (formData.stock < 0) return toast.error("Stock cannot be negative");
    if (formData.images.length === 0)
      return toast.error("At least one image is required");

    setIsSaving(true);
    try {
      const productData = {
        name: formData.name.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
        stock: parseInt(formData.stock, 10),
        status: formData.status,
        color: formData.color,
        material: formData.material,
        weight: parseFloat(formData.weight) || 0,
        weightUnit: formData.weightUnit,
        dimensions: parseDimensionsString(formData.dimensions),
        description: formData.description,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        features: formData.features,
        specifications: formData.specifications,
        images: formData.images,      // ← Cloudinary URLs only
        mainImage: formData.mainImage || formData.images[0] || "",
        tags: formData.tags,
      };

      if (isEditing) {
        await productService.updateProduct(id, productData);
        toast.success("Product updated");
      } else {
        await productService.createProduct(productData);
        toast.success("Product created");
      }
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to save product");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || categoriesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/admin/products" className="hover:text-orange-600 flex items-center gap-1">
          <ArrowLeft size={16} /> Products
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">
          {isEditing ? "Edit Product" : "Add Product"}
        </span>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
          <Package size={20} className="text-orange-500" />
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            {isEditing ? "Edit Product" : "Create New Product"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* ── Name & Category ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Matte Black Tumbler 24oz"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-gray-900"
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id || cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Pricing ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Selling Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="e.g., 1299"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                MRP / Compare Price (₹)
              </label>
              <input
                type="number"
                name="comparePrice"
                value={formData.comparePrice}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="e.g., 1499"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-gray-900"
              />
              <p className="text-xs text-gray-400 mt-1">Shown as strikethrough</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cost Price (₹)
              </label>
              <input
                type="number"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="e.g., 650"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-gray-900"
              />
              <p className="text-xs text-gray-400 mt-1">Internal — not shown</p>
            </div>
          </div>

          {/* ── Stock ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Stock <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              placeholder="e.g., 50"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-gray-900"
              required
            />
          </div>

          {/* ── Status & Color & Material ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-gray-900"
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Color
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="e.g., Matte Black"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Info size={14} className="inline mr-1" /> Material
              </label>
              <input
                type="text"
                name="material"
                value={formData.material}
                onChange={handleChange}
                placeholder="e.g., SS304 Stainless Steel"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-gray-900"
              />
            </div>
          </div>

          {/* ── Weight + Dimensions ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Weight size={14} className="inline mr-1" /> Weight
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="e.g., 0.5"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-gray-900"
                />
                <select
                  name="weightUnit"
                  value={formData.weightUnit}
                  onChange={handleChange}
                  className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-gray-900 font-medium"
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                </select>
              </div>
              <p className="text-xs text-gray-400 mt-1">Used for shipping</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Ruler size={14} className="inline mr-1" /> Dimensions (L × W × H cm)
              </label>
              <input
                type="text"
                name="dimensions"
                value={formData.dimensions}
                onChange={handleChange}
                placeholder="e.g., 10 x 10 x 20"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-gray-900"
              />
            </div>
          </div>

          {/* ── Description ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Describe your product..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-gray-900 resize-none"
            />
          </div>

          {/* ── Images (Cloudinary Upload) ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Image size={14} className="inline mr-1" /> Product Images{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-3 mb-3">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <div
                    className={`w-20 h-20 rounded-lg border-2 overflow-hidden bg-gray-50 ${
                      formData.mainImage === img ? "border-orange-500" : "border-gray-200"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Product ${idx}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow"
                  >
                    <X size={12} />
                  </button>
                  {formData.mainImage === img && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded">
                      Main
                    </span>
                  )}
                  {formData.mainImage !== img && (
                    <button
                      type="button"
                      onClick={() => setMainImage(idx)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-medium rounded-lg"
                    >
                      Set Main
                    </button>
                  )}
                </div>
              ))}

              {/* Upload button with spinner */}
              <label
                className={`w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center transition bg-white dark:bg-gray-800 ${
                  uploading
                    ? "border-orange-400 cursor-wait"
                    : "border-gray-300 hover:border-orange-400 cursor-pointer text-gray-400 hover:text-orange-500"
                }`}
              >
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <Loader size={18} className="text-orange-500 animate-spin" />
                    <span className="text-[9px] text-orange-500 font-bold mt-1">
                      {uploadProgress}%
                    </span>
                  </div>
                ) : (
                  <>
                    <Upload size={20} />
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </>
                )}
              </label>
            </div>
            <p className="text-xs text-gray-500">
              First image is the main product image. Click "Set Main" to change it. Max 5MB per image.
            </p>
          </div>

          {/* ── Features ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Features
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="e.g., Anti-slip Base"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-gray-900"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
              />
              <button
                type="button"
                onClick={addFeature}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition flex items-center gap-1"
              >
                <Plus size={16} /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.features.map((f, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm"
                >
                  {f}
                  <button
                    type="button"
                    onClick={() => removeFeature(idx)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* ── Tags ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {["TRENDING", "BEST SELLER", "NEW ARRIVAL", "SALE"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                    formData.tags.includes(tag)
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {formData.tags.includes(tag) ? "✓ " : ""}
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* ── Specifications ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Specifications
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSpecLabel}
                onChange={(e) => setNewSpecLabel(e.target.value)}
                placeholder="Label e.g., Capacity"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-gray-900"
              />
              <input
                type="text"
                value={newSpecValue}
                onChange={(e) => setNewSpecValue(e.target.value)}
                placeholder="Value e.g., 1200ml"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-gray-900"
              />
              <button
                type="button"
                onClick={addSpecification}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition flex items-center gap-1"
              >
                <Plus size={16} /> Add
              </button>
            </div>
            <div className="space-y-1 mt-2">
              {formData.specifications.map((spec, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/30 px-4 py-2 rounded-lg text-sm"
                >
                  <div className="flex gap-4">
                    <span className="font-medium">{spec.label}</span>
                    <span className="text-gray-500">{spec.value}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSpecification(idx)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── SEO ── */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
              <Shield size={16} /> SEO & Meta
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleChange}
                  placeholder="SEO title"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Meta Description
                </label>
                <input
                  type="text"
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleChange}
                  placeholder="SEO description"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-gray-900"
                />
              </div>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <Link
              to="/admin/products"
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving || uploading}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-lg shadow-sm transition flex items-center gap-2"
            >
              <Save size={16} />
              {isSaving ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;