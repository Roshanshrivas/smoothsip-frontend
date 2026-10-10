// src/components/admin/customization/CustomProductForm.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Save, Package, Upload, X,
  Image as ImageIcon, Plus, Type, FileType,
  LayoutGrid,
} from "lucide-react";
import toast from "react-hot-toast";
import { customProductService } from "../../../services/customProductService";

// ⚠️ MUST match AVAILABLE_FONTS in TumblerCustomizer.jsx
const AVAILABLE_FONTS = [
  "Poppins", "Playfair Display", "Oswald", "Dancing Script", "Pacifico",
  "Bebas Neue", "Allura", "Bungee", "Cedarville Cursive", "Courgette",
  "Permanent Marker", "Satisfy", "Great Vibes", "Luckiest Guy",
];

const DEFAULT_TEXT_AREA = { left: 50, top: 200, width: 400, height: 200 };
const DEFAULT_LOGO_AREA = { left: 150, top: 50, width: 200, height: 150 };

const extractPublicId = (url) => {
  if (!url) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(\.[^.]+)?$/);
  return match ? match[1].replace(/\.[^.]+$/, "") : null;
};

// Normalize any legacy product shape → the flat shape TumblerCustomizer expects
const normalizeProduct = (p) => {
  const cust = p.customization || {};
  return {
    ...p,
    description: p.description || "",
    status: p.status || "Draft",
    customization: {
      text:    cust.text?.enabled    ?? cust.text    ?? true,
      font:    cust.font?.enabled    ?? cust.font    ?? true,
      logo:    cust.logo?.enabled    ?? cust.logo    ?? true,
      pattern: cust.pattern?.enabled ?? cust.pattern ?? true,
    },
    allowedFonts: p.allowedFonts?.length
      ? p.allowedFonts
      : p.customization?.font?.options?.length
        ? p.customization.font.options
        : ["Poppins", "Playfair Display", "Dancing Script"],
    textArea: p.textArea || DEFAULT_TEXT_AREA,
    logoArea: p.logoArea || DEFAULT_LOGO_AREA,
    images: p.images || [],
  };
};

const CustomProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [loading, setLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: 0,
    mainImage: "",
    images: [],
    status: "Draft",
    customization: {
      text: true,
      font: true,
      logo: true,
      pattern: true,
    },
    allowedFonts: ["Poppins", "Playfair Display", "Dancing Script"],
    textArea: DEFAULT_TEXT_AREA,
    logoArea: DEFAULT_LOGO_AREA,
  });

  // ─── Load product if editing ────────────────────────
  useEffect(() => {
    if (!isEditing) return;
    const loadProduct = async () => {
      try {
        const product = await customProductService.getCustomProductById(id);
        setFormData(normalizeProduct(product));
      } catch (error) {
        toast.error("Failed to load product");
        navigate("/admin/custom-products");
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id, isEditing, navigate]);

  // ─── Upload main image ──────────────────────────────
  const handleMainImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(file.type)) {
      toast.error("Only PNG, JPG, WEBP, or SVG images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.");
      return;
    }
    setUploading(true);
    try {
      const result = await customProductService.uploadProductImage(file);
      const url = result?.url || result;
      if (!url) throw new Error("Upload failed");
      setFormData((prev) => ({ ...prev, mainImage: url }));
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // ─── Upload additional images ───────────────────────
  const handleImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    for (const file of files) {
      if (!["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(file.type)) {
        toast.error(`"${file.name}" is not a supported image type.`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds 5MB limit.`);
        return;
      }
    }

    setUploading(true);
    try {
      const result = await customProductService.uploadProductImages(files);
      const urls = result?.urls || result;
      if (!urls || !urls.length) throw new Error("Upload failed");
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...urls],
        mainImage: prev.mainImage || urls[0],
      }));
      toast.success(`${urls.length} image(s) uploaded`);
    } catch (error) {
      toast.error(error.message || "Failed to upload images");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // ─── Remove additional image ────────────────────────
  const removeImage = async (index, url) => {
    const publicId = extractPublicId(url);
    if (publicId) {
      try {
        await customProductService.deleteCloudinaryImage(publicId);
      } catch (err) {
        console.warn("Could not delete from Cloudinary:", err);
      }
    }
    setFormData((prev) => {
      const updatedImages = [...prev.images];
      updatedImages.splice(index, 1);
      return {
        ...prev,
        images: updatedImages,
        mainImage: prev.mainImage === url ? updatedImages[0] || "" : prev.mainImage,
      };
    });
  };

  // ─── Remove main image ──────────────────────────────
  const removeMainImage = async () => {
    const url = formData.mainImage;
    const publicId = extractPublicId(url);
    if (publicId) {
      try {
        await customProductService.deleteCloudinaryImage(publicId);
      } catch (err) {
        console.warn("Could not delete from Cloudinary:", err);
      }
    }
    setFormData((prev) => ({ ...prev, mainImage: prev.images[0] || "" }));
  };

  // ─── Field handlers ─────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomToggle = (key) => {
    setFormData((prev) => ({
      ...prev,
      customization: { ...prev.customization, [key]: !prev.customization[key] },
    }));
  };

  const handleFontToggle = (font) => {
    setFormData((prev) => {
      const current = prev.allowedFonts || [];
      const updated = current.includes(font)
        ? current.filter((f) => f !== font)
        : [...current, font];
      return { ...prev, allowedFonts: updated };
    });
  };

  const handleAreaChange = (area, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [area]: { ...prev[area], [field]: parseInt(value) || 0 },
    }));
  };

  // ─── Submit ─────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Product name is required");
    if (formData.basePrice <= 0) return toast.error("Base price must be greater than 0");
    if (!formData.mainImage) return toast.error("Please upload a main image");
    if (formData.customization.font && formData.allowedFonts.length === 0) {
      return toast.error("Select at least one font");
    }

    // Build a clean payload — no tumblerColor, no allowedColors, no nested objects
    const payload = {
      name: formData.name.trim(),
      description: formData.description || "",
      basePrice: Number(formData.basePrice),
      mainImage: formData.mainImage,
      images: formData.images,
      status: formData.status,
      customization: {
        text:    !!formData.customization.text,
        font:    !!formData.customization.font,
        logo:    !!formData.customization.logo,
        pattern: !!formData.customization.pattern,
      },
      allowedFonts: formData.allowedFonts,
      textArea: formData.textArea,
      logoArea: formData.logoArea,
    };

    setIsSaving(true);
    try {
      if (isEditing) {
        await customProductService.updateCustomProduct(id, payload);
        toast.success("Product updated");
      } else {
        await customProductService.createCustomProduct(payload);
        toast.success("Product created");
      }
      navigate("/admin/custom-products");
    } catch (error) {
      toast.error(error.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
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
        <Link to="/admin/custom-products" className="hover:text-orange-600 flex items-center gap-1">
          <ArrowLeft size={16} /> Custom Products
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">
          {isEditing ? `Edit "${formData.name}"` : "Create New Product"}
        </span>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
          <Package size={20} className="text-orange-500" />
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            {isEditing ? "Edit Custom Tumbler" : "Create New Custom Tumbler"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* ─── Basic Info ─── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Base Price (₹) *</label>
              <input
                type="number"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleChange}
                min="0"
                step="50"
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
          </div>

          {/* ─── Status ─── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Only <b>Active</b> products appear on the Customize page.
              </p>
            </div>
          </div>

          {/* ─── Main Image ─── */}
          <div>
            <label className="block text-sm font-medium mb-2">Main Image *</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg hover:border-orange-500"
              >
                <Upload size={18} />
                {uploading ? "Uploading..." : "Choose Image"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleMainImageChange}
                className="hidden"
              />
              {formData.mainImage ? (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border">
                  <img src={formData.mainImage} alt="Main" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={removeMainImage}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-lg border flex items-center justify-center text-gray-400">
                  <ImageIcon size={24} />
                </div>
              )}
              <span className="text-xs text-gray-500">PNG, JPG, WEBP, SVG (max 5MB)</span>
            </div>
          </div>

          {/* ─── Additional Images ─── */}
          <div>
            <label className="block text-sm font-medium mb-2">Additional Images</label>
            <div className="flex items-center gap-4 flex-wrap">
              <button
                type="button"
                onClick={() => document.getElementById("multiImageInput")?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg hover:border-orange-500"
              >
                <Plus size={18} />
                {uploading ? "Uploading..." : "Add Images"}
              </button>
              <input
                id="multiImageInput"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
                className="hidden"
              />
              <div className="flex flex-wrap gap-2">
                {formData.images.map((url, index) => (
                  <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden border">
                    <img src={url} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index, url)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                    {url === formData.mainImage && (
                      <span className="absolute bottom-0 left-0 right-0 bg-orange-500 text-white text-[8px] text-center py-0.5">
                        MAIN
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Upload up to 10 additional images</p>
          </div>

          {/* ─── Description ─── */}
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border rounded-lg resize-none"
              placeholder="Describe the product..."
            />
          </div>

          {/* ─── Customization Options ─── */}
          {/* <div className="border-t pt-4 ">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Customisation Options
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              These toggles control which sections appear in the customer customizer.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
              {[
                { key: "text",    label: "Text",    icon: Type },
                { key: "font",    label: "Font",    icon: FileType },
                { key: "logo",    label: "Logo",    icon: ImageIcon },
                { key: "pattern", label: "Pattern", icon: LayoutGrid },
              ].map(({ key, label, icon: Icon }) => (
                <label
                  key={key}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition ${
                    formData.customization[key]
                      ? "border-orange-300 bg-orange-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!formData.customization[key]}
                    onChange={() => handleCustomToggle(key)}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <Icon size={16} className="text-orange-500" />
                  <span className="capitalize text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div> */}

          {/* ─── Allowed Fonts (checkbox grid) ─── */}
          {/* <div>
            <label className="block text-sm font-medium mb-2">
              Allowed Fonts
              {formData.customization.font && (
                <span className="text-xs text-gray-500 ml-2">
                  ({formData.allowedFonts.length} selected — customers see these in the dropdown)
                </span>
              )}
            </label>
            <div
              className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto border rounded-lg p-3 ${
                formData.customization.font ? "" : "opacity-50 pointer-events-none"
              }`}
            >
              {AVAILABLE_FONTS.map((font) => {
                const checked = formData.allowedFonts.includes(font);
                return (
                  <label
                    key={font}
                    className={`flex items-center gap-2 text-sm p-2 rounded-lg transition cursor-pointer border ${
                      checked
                        ? "border-orange-300 bg-orange-50"
                        : "border-transparent hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleFontToggle(font)}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span style={{ fontFamily: font }}>{font}</span>
                  </label>
                );
              })}
            </div>
          </div> */}

          {/* ─── Placement Areas ─── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Text Area (L, T, W, H) — canvas is 500×700
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.textArea.left}
                  onChange={(e) => handleAreaChange("textArea", "left", e.target.value)}
                  className="w-1/4 border rounded p-1.5 text-sm"
                  placeholder="L"
                />
                <input
                  type="number"
                  value={formData.textArea.top}
                  onChange={(e) => handleAreaChange("textArea", "top", e.target.value)}
                  className="w-1/4 border rounded p-1.5 text-sm"
                  placeholder="T"
                />
                <input
                  type="number"
                  value={formData.textArea.width}
                  onChange={(e) => handleAreaChange("textArea", "width", e.target.value)}
                  className="w-1/4 border rounded p-1.5 text-sm"
                  placeholder="W"
                />
                <input
                  type="number"
                  value={formData.textArea.height}
                  onChange={(e) => handleAreaChange("textArea", "height", e.target.value)}
                  className="w-1/4 border rounded p-1.5 text-sm"
                  placeholder="H"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Where the customer's text is constrained on the canvas.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Logo Area (L, T, W, H)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.logoArea.left}
                  onChange={(e) => handleAreaChange("logoArea", "left", e.target.value)}
                  className="w-1/4 border rounded p-1.5 text-sm"
                  placeholder="L"
                />
                <input
                  type="number"
                  value={formData.logoArea.top}
                  onChange={(e) => handleAreaChange("logoArea", "top", e.target.value)}
                  className="w-1/4 border rounded p-1.5 text-sm"
                  placeholder="T"
                />
                <input
                  type="number"
                  value={formData.logoArea.width}
                  onChange={(e) => handleAreaChange("logoArea", "width", e.target.value)}
                  className="w-1/4 border rounded p-1.5 text-sm"
                  placeholder="W"
                />
                <input
                  type="number"
                  value={formData.logoArea.height}
                  onChange={(e) => handleAreaChange("logoArea", "height", e.target.value)}
                  className="w-1/4 border rounded p-1.5 text-sm"
                  placeholder="H"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Where the customer's logo is constrained on the canvas.
              </p>
            </div>
          </div>

          {/* ─── Actions ─── */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Link
              to="/admin/custom-products"
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-lg shadow-sm flex items-center gap-2"
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

export default CustomProductForm;