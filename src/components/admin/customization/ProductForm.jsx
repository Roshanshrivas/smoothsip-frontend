// src/components/admin/customization/ProductForm.jsx — Aligned with TumblerCustomizer
import React, { useState, useRef, useCallback, memo } from "react";
import {
  X, Upload, Type, Image as ImageIcon, FileType,
  Loader2, Eye, Check, Layers, LayoutGrid,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { customProductService } from "../../../services/customProductService";

// ⚠️ MUST match the AVAILABLE_FONTS array in TumblerCustomizer.jsx
const AVAILABLE_FONTS = [
  "Poppins", "Playfair Display", "Oswald", "Dancing Script", "Pacifico",
  "Bebas Neue", "Allura", "Bungee", "Cedarville Cursive", "Courgette",
  "Permanent Marker", "Satisfy", "Great Vibes", "Luckiest Guy",
];

const DEFAULT_TEXT_AREA = { left: 50, top: 200, width: 400, height: 200 };
const DEFAULT_LOGO_AREA = { left: 150, top: 50, width: 200, height: 150 };

// ─────────────────────── Helper Components ───────────────────────

const ImageDropZone = ({ imageUrl, onUpload, onRemove, uploading }) => {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) onUpload(file);
    else toast.error("Please drop an image file");
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-xl transition-all ${
        isDragOver ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-gray-50 hover:bg-gray-100"
      }`}
    >
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={(e) => onUpload(e.target.files[0])}
        className="hidden"
      />
      {imageUrl ? (
        <div
          className="relative group bg-gray-100 flex items-center justify-center rounded-xl overflow-hidden"
          style={{ minHeight: "192px" }}
        >
          <img src={imageUrl} alt="Preview" className="w-full h-auto max-h-48 object-contain" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition"
            >
              <Upload size={18} />
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="p-2 bg-white rounded-full text-red-600 hover:bg-gray-100 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="w-full h-48 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-orange-500 transition"
        >
          {uploading ? (
            <Loader2 size={32} className="animate-spin" />
          ) : (
            <>
              <Upload size={32} strokeWidth={1.5} />
              <span className="text-sm font-medium">Click or drag image here</span>
              <span className="text-xs">PNG, JPG up to 5MB</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

const Toggle = ({ enabled, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!enabled)}
    className={`relative w-10 h-5 rounded-full transition-all duration-200 ${
      enabled ? "bg-orange-500" : "bg-gray-300"
    }`}
  >
    <div
      className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-all duration-200 ${
        enabled ? "right-0.5" : "left-0.5"
      }`}
    />
  </button>
);

const AreaInput = ({ label, area, onChange }) => (
  <div>
    <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">
      {label}
    </label>
    <div className="grid grid-cols-4 gap-2">
      {["left", "top", "width", "height"].map((field) => (
        <div key={field}>
          <span className="text-[10px] text-gray-400 uppercase block mb-0.5">
            {field}
          </span>
          <input
            type="number"
            min="0"
            value={area[field]}
            onChange={(e) => onChange(field, parseInt(e.target.value) || 0)}
            className="w-full border border-gray-200 rounded-lg p-1.5 text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>
      ))}
    </div>
  </div>
);

// ─────────────────────── Main Component ───────────────────────

const ProductForm = memo(({ product, onSave, onClose }) => {
  const [activeTab, setActiveTab] = useState("basic");

  const [form, setForm] = useState(() => {
    if (product) {
      // Migrate / normalize existing product shape
      const cust = product.customization || {};
      return {
        ...product,
        description: product.description || "",
        status: product.status || "Draft",
        // Flatten nested objects → booleans (matches TumblerCustomizer expectations)
        customization: {
          text:    cust.text?.enabled    ?? cust.text    ?? true,
          font:    cust.font?.enabled    ?? cust.font    ?? true,
          logo:    cust.logo?.enabled    ?? cust.logo    ?? true,
          pattern: cust.pattern?.enabled ?? cust.pattern ?? true,
        },
        allowedFonts:
          product.allowedFonts?.length
            ? product.allowedFonts
            : product.customization?.font?.options?.length
              ? product.customization.font.options
              : ["Poppins", "Playfair Display"],
        textArea: product.textArea || DEFAULT_TEXT_AREA,
        logoArea: product.logoArea || DEFAULT_LOGO_AREA,
      };
    }
    return {
      name: "",
      description: "",
      basePrice: "",
      mainImage: "",
      status: "Draft",
      customization: { text: true, font: true, logo: true, pattern: true },
      allowedFonts: ["Poppins", "Playfair Display", "Dancing Script"],
      textArea: DEFAULT_TEXT_AREA,
      logoArea: DEFAULT_LOGO_AREA,
    };
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Derived live preview
  const preview = {
    text: form.name ? `Your Name` : "Sample Text",
    font: form.allowedFonts?.[0] || "Poppins",
    image: form.mainImage,
  };

  // ── Field handlers ─────────────────────────────
  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCustomToggle = useCallback((feature, enabled) => {
    setForm((prev) => ({
      ...prev,
      customization: { ...prev.customization, [feature]: enabled },
    }));
  }, []);

  const handleFontToggle = useCallback((font) => {
    setForm((prev) => {
      const current = prev.allowedFonts || [];
      const updated = current.includes(font)
        ? current.filter((f) => f !== font)
        : [...current, font];
      return { ...prev, allowedFonts: updated };
    });
  }, []);

  const handleAreaChange = useCallback((areaKey, field, value) => {
    setForm((prev) => ({
      ...prev,
      [areaKey]: { ...prev[areaKey], [field]: value },
    }));
  }, []);

  // ── Image upload ───────────────────────────────
  const handleImageUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }
    setUploading(true);
    try {
      const imageUrl = await customProductService.uploadImage(file);
      handleChange("mainImage", typeof imageUrl === "string" ? imageUrl : imageUrl?.url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ── Submit ─────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Product name is required");
    if (!form.basePrice || parseFloat(form.basePrice) <= 0)
      return toast.error("Valid base price is required");
    if (!form.mainImage) return toast.error("Please upload a product image");

    const anyCustom =
      form.customization.text ||
      form.customization.font ||
      form.customization.logo ||
      form.customization.pattern;
    if (!anyCustom)
      return toast.error("Enable at least one customization option");
    if (form.customization.font && form.allowedFonts.length === 0)
      return toast.error("Select at least one font");

    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex justify-between items-center z-20">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              {product ? "Edit Customizable Tumbler" : "Create Customizable Tumbler"}
            </h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition">
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-100 px-6 bg-white">
            <div className="flex gap-6">
              {["basic", "customization"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 text-sm font-medium transition relative ${
                    activeTab === tab ? "text-orange-600" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab === "basic" ? "Basic Information" : "Customization Options"}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="tabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* ─── Live Preview ─── */}
            <div className="lg:w-2/5 bg-gray-50/40 p-6 border-r border-gray-100">
              <div className="sticky top-24">
                <h3 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
                  <Eye size={18} className="text-orange-500" /> Live Preview
                </h3>
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div
                    className="relative bg-gray-100 flex items-center justify-center p-2"
                    style={{ minHeight: "320px" }}
                  >
                    {preview.image ? (
                      <>
                        <img
                          src={preview.image}
                          alt="Preview"
                          className="w-full h-auto max-h-80 object-contain"
                        />
                        {form.customization.text && (
                          <div
                            className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none"
                            style={{
                              top: `${(form.textArea.top / 700) * 100}%`,
                              width: `${(form.textArea.width / 500) * 100}%`,
                              fontFamily: preview.font,
                              color: "#111111",
                              fontWeight: 700,
                              fontSize: "1rem",
                            }}
                          >
                            {preview.text}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-gray-400 text-sm p-4">No image uploaded</div>
                    )}
                  </div>
                  <div className="p-3 text-xs text-gray-500 border-t grid grid-cols-2 gap-1 bg-gray-50">
                    <div>Font: {preview.font}</div>
                    <div>Text: "{preview.text}"</div>
                    <div className="col-span-2 flex gap-2 flex-wrap">
                      {Object.entries(form.customization).map(([k, v]) => (
                        <span
                          key={k}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            v ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {k}: {v ? "ON" : "OFF"}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Form Panel ─── */}
            <div className="flex-1 overflow-y-auto p-6 max-h-[calc(90vh-120px)]">
              <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence mode="wait">
                  {/* ─────────── BASIC TAB ─────────── */}
                  {activeTab === "basic" && (
                    <motion.div
                      key="basic"
                      variants={tabVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Product Name *
                          </label>
                          <input
                            required
                            value={form.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            className="mt-1 w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            placeholder="e.g., Matte Black Tumbler"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Base Price (₹) *
                          </label>
                          <input
                            required
                            type="number"
                            step="1"
                            min="1"
                            value={form.basePrice}
                            onChange={(e) => handleChange("basePrice", e.target.value)}
                            className="mt-1 w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            placeholder="e.g., 2499"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Status
                          </label>
                          <select
                            value={form.status}
                            onChange={(e) => handleChange("status", e.target.value)}
                            className="mt-1 w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                          >
                            <option value="Draft">Draft</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                          <p className="text-xs text-gray-400 mt-1">
                            Only "Active" products appear in the Customize page.
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <input
                            value={form.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            className="mt-1 w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            placeholder="Short description..."
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product Image *
                        </label>
                        <ImageDropZone
                          imageUrl={form.mainImage}
                          onUpload={handleImageUpload}
                          onRemove={() => handleChange("mainImage", "")}
                          uploading={uploading}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* ─────────── CUSTOMIZATION TAB ─────────── */}
                  {activeTab === "customization" && (
                    <motion.div
                      key="customization"
                      variants={tabVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="space-y-5"
                    >
                      {/* Text Personalization */}
                      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                          <div className="flex items-center gap-2">
                            <Type size={18} className="text-orange-500" />
                            <span className="font-medium text-gray-800">Text Personalization</span>
                          </div>
                          <Toggle
                            enabled={form.customization.text}
                            onChange={(val) => handleCustomToggle("text", val)}
                          />
                        </div>
                        {form.customization.text && (
                          <div className="p-4">
                            <AreaInput
                              label="Text placement area (px)"
                              area={form.textArea}
                              onChange={(field, value) =>
                                handleAreaChange("textArea", field, value)
                              }
                            />
                            <p className="text-xs text-gray-400 mt-2">
                              Canvas is 500×700. This is where the customer's text will be constrained.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Font Selection */}
                      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                          <div className="flex items-center gap-2">
                            <FileType size={18} className="text-orange-500" />
                            <span className="font-medium text-gray-800">Font Selection</span>
                          </div>
                          <Toggle
                            enabled={form.customization.font}
                            onChange={(val) => handleCustomToggle("font", val)}
                          />
                        </div>
                        {form.customization.font && (
                          <div className="p-4">
                            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">
                              Fonts shown to customer ({form.allowedFonts.length} selected)
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                              {AVAILABLE_FONTS.map((font) => {
                                const checked = form.allowedFonts.includes(font);
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
                          </div>
                        )}
                      </div>

                      {/* Logo Upload */}
                      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                          <div className="flex items-center gap-2">
                            <ImageIcon size={18} className="text-orange-500" />
                            <span className="font-medium text-gray-800">Logo Upload</span>
                          </div>
                          <Toggle
                            enabled={form.customization.logo}
                            onChange={(val) => handleCustomToggle("logo", val)}
                          />
                        </div>
                        {form.customization.logo && (
                          <div className="p-4">
                            <AreaInput
                              label="Logo placement area (px)"
                              area={form.logoArea}
                              onChange={(field, value) =>
                                handleAreaChange("logoArea", field, value)
                              }
                            />
                          </div>
                        )}
                      </div>

                      {/* Pattern / Design */}
                      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-4 flex items-center justify-between bg-gray-50/30">
                          <div className="flex items-center gap-2">
                            <LayoutGrid size={18} className="text-orange-500" />
                            <span className="font-medium text-gray-800">Pattern / Design</span>
                          </div>
                          <Toggle
                            enabled={form.customization.pattern}
                            onChange={(val) => handleCustomToggle("pattern", val)}
                          />
                        </div>
                      </div>

                      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
                        <Layers size={14} className="mt-0.5 shrink-0" />
                        <span>
                          Text is always laser-engraved in dark color — color picker is
                          intentionally omitted to match the customizer's fixed engraving.
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                  >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : null}
                    {saving ? "Saving..." : "Save Product"}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

ProductForm.displayName = "ProductForm";

export default ProductForm;