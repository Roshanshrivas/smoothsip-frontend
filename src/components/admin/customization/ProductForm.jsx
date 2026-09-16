// src/components/admin/customization/ProductForm.jsx – Final with Full Image Visibility
import React, { useState, useRef, useCallback, memo } from "react";
import { X, Upload, Type, Image, FileType, Loader2, Eye, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { customProductService } from "../../../services/customProductService";

// ----- Constants -----
const FONT_OPTIONS = [
  "Poppins", "Arial", "Brush Script MT", "Georgia", "Verdana", "Courier New", "Montserrat", "Roboto"
];

const TEXT_COLOR_PRESETS = [
  "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ff8c00", "#800080", "#ff69b4"
];

const TUMBLER_COLOR_PRESETS = [
  "#1a1a1a", "#6a0dad", "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ff8c00", "#800080"
];

const MAX_TEXT_LENGTH = 50;

// ----- Helper Components -----
const ImageDropZone = ({ imageUrl, onUpload, onRemove, uploading }) => {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) onUpload(file);
    else toast.error("Please drop an image file");
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-xl transition-all ${
        isDragOver ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-gray-50 hover:bg-gray-100"
      }`}
    >
      <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => onUpload(e.target.files[0])} className="hidden" />
      {imageUrl ? (
        <div className="relative group bg-gray-100 flex items-center justify-center rounded-xl overflow-hidden" style={{ minHeight: "192px" }}>
          <img src={imageUrl} alt="Preview" className="w-full h-auto max-h-48 object-contain" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
            <button type="button" onClick={() => fileInputRef.current.click()} className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition">
              <Upload size={18} />
            </button>
            <button type="button" onClick={onRemove} className="p-2 bg-white rounded-full text-red-600 hover:bg-gray-100 transition">
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
              <span className="text-xs">PNG, JPG up to 2MB</span>
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

const ColorSwatch = ({ color, isSelected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative w-8 h-8 rounded-full border transition-all duration-200 transform hover:scale-110 ${
      isSelected ? "border-orange-500 scale-110 shadow-md ring-2 ring-orange-200" : "border-white shadow-sm"
    }`}
    style={{ backgroundColor: color }}
  >
    {isSelected && <Check size={12} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white drop-shadow" />}
  </button>
);

// ----- Main Component -----
const ProductForm = memo(({ product, onSave, onClose }) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [form, setForm] = useState(() => product || {
    name: "",
    basePrice: "",
    tumblerColor: "#1a1a1a",
    mainImage: "",
    customization: {
      text: { enabled: true, maxLength: 20, defaultText: "Your Name", colors: ["#000000"] },
      logo: { enabled: false, maxFileSize: 2, allowedFormats: ["png", "jpg"] },
      font: { enabled: false, options: ["Poppins"] }
    }
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Live preview derived from form
  const preview = {
    text: form.customization.text.defaultText || "Sample Text",
    font: form.customization.font.options[0] || "Poppins",
    textColor: form.customization.text.colors?.[0] || "#000000",
    tumblerColor: form.tumblerColor,
    image: form.mainImage,
  };

  const handleChange = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCustomToggle = useCallback((feature, enabled) => {
    setForm(prev => ({
      ...prev,
      customization: {
        ...prev.customization,
        [feature]: { ...prev.customization[feature], enabled }
      }
    }));
  }, []);

  const handleTextCustomChange = useCallback((field, value) => {
    setForm(prev => ({
      ...prev,
      customization: {
        ...prev.customization,
        text: { ...prev.customization.text, [field]: value }
      }
    }));
  }, []);

  const handleTextColorToggle = useCallback((color) => {
    setForm(prev => {
      const currentColors = prev.customization.text.colors || [];
      const updated = currentColors.includes(color)
        ? currentColors.filter(c => c !== color)
        : [...currentColors, color];
      return {
        ...prev,
        customization: {
          ...prev.customization,
          text: { ...prev.customization.text, colors: updated }
        }
      };
    });
  }, []);

  const handleFontOptionToggle = useCallback((font) => {
    setForm(prev => {
      const current = prev.customization.font.options;
      const updated = current.includes(font)
        ? current.filter(f => f !== font)
        : [...current, font];
      return {
        ...prev,
        customization: {
          ...prev.customization,
          font: { ...prev.customization.font, options: updated }
        }
      };
    });
  }, []);

  const handleImageUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }
    setUploading(true);
    try {
      const imageUrl = await customProductService.uploadImage(file);
      handleChange("mainImage", imageUrl);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!form.basePrice || parseFloat(form.basePrice) <= 0) {
      toast.error("Valid base price is required");
      return;
    }
    if (!form.mainImage) {
      toast.error("Please upload a product image");
      return;
    }
    if (form.customization.text.enabled && (!form.customization.text.colors || form.customization.text.colors.length === 0)) {
      toast.error("At least one text color must be selected");
      return;
    }
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
                    activeTab === tab
                      ? "text-orange-600"
                      : "text-gray-500 hover:text-gray-700"
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
            {/* Live Preview Panel */}
            <div className="lg:w-2/5 bg-gray-50/40 p-6 border-r border-gray-100">
              <div className="sticky top-24">
                <h3 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
                  <Eye size={18} className="text-orange-500" /> Live Preview
                </h3>
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  {/* Preview Image - Full visibility, no cropping */}
                  <div className="bg-gray-100 flex items-center justify-center p-2" style={{ minHeight: "160px" }}>
                    {preview.image ? (
                      <img src={preview.image} alt="Preview" className="w-full h-auto max-h-40 object-contain" />
                    ) : (
                      <div className="text-gray-400 text-sm p-4">No image uploaded</div>
                    )}
                  </div>
                  <div
                    className="p-5 text-center transition-colors duration-200"
                    style={{ backgroundColor: preview.tumblerColor }}
                  >
                    <div
                      className="font-bold text-lg transition-all duration-200"
                      style={{
                        fontFamily: preview.font,
                        color: preview.textColor,
                      }}
                    >
                      {preview.text}
                    </div>
                  </div>
                  <div className="p-3 text-xs text-gray-500 border-t grid grid-cols-2 gap-1 bg-gray-50">
                    <div className="flex items-center gap-1">Tumbler: <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preview.tumblerColor }} /></div>
                    <div>Font: {preview.font}</div>
                    <div>Text color: <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: preview.textColor }} /></div>
                    <div>Text: "{preview.text.length > 15 ? preview.text.slice(0,12)+'…' : preview.text}"</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Panel – unchanged but we already fixed the dropzone image display */}
            <div className="flex-1 overflow-y-auto p-6 max-h-[calc(90vh-120px)]">
              <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence mode="wait">
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
                          <label className="block text-sm font-medium text-gray-700">Product Name *</label>
                          <input
                            required
                            value={form.name}
                            onChange={e => handleChange("name", e.target.value)}
                            className="mt-1 w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                            placeholder="e.g., Matte Black Tumbler"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Base Price (₹) *</label>
                          <input
                            required
                            type="number"
                            step="1"
                            min="1"
                            value={form.basePrice}
                            onChange={e => handleChange("basePrice", e.target.value)}
                            className="mt-1 w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            placeholder="e.g., 2499"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tumbler Color</label>
                        <div className="flex items-center gap-3 flex-wrap">
                          <input
                            type="color"
                            value={form.tumblerColor}
                            onChange={e => handleChange("tumblerColor", e.target.value)}
                            className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                          />
                          <div className="flex gap-2 flex-wrap">
                            {TUMBLER_COLOR_PRESETS.map(c => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => handleChange("tumblerColor", c)}
                                className={`w-8 h-8 rounded-full border transition-all duration-200 ${
                                  form.tumblerColor === c ? "border-orange-500 ring-2 ring-orange-200 scale-110" : "border-white shadow-sm"
                                }`}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Product Image *</label>
                        <ImageDropZone
                          imageUrl={form.mainImage}
                          onUpload={handleImageUpload}
                          onRemove={() => handleChange("mainImage", "")}
                          uploading={uploading}
                        />
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "customization" && (
                    <motion.div
                      key="customization"
                      variants={tabVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="space-y-5"
                    >
                      {/* Text Customization */}
                      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                          <div className="flex items-center gap-2">
                            <Type size={18} className="text-orange-500" />
                            <span className="font-medium text-gray-800">Text Personalization</span>
                          </div>
                          <Toggle enabled={form.customization.text.enabled} onChange={(val) => handleCustomToggle("text", val)} />
                        </div>
                        {form.customization.text.enabled && (
                          <div className="p-4 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider">Max characters</label>
                                <input
                                  type="number"
                                  min="1"
                                  max={MAX_TEXT_LENGTH}
                                  value={form.customization.text.maxLength}
                                  onChange={e => handleTextCustomChange("maxLength", parseInt(e.target.value) || 20)}
                                  className="mt-1 w-full border border-gray-200 rounded-lg p-2 text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider">Default placeholder</label>
                                <input
                                  value={form.customization.text.defaultText}
                                  onChange={e => handleTextCustomChange("defaultText", e.target.value)}
                                  className="mt-1 w-full border border-gray-200 rounded-lg p-2 text-sm"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Allowed text colors</label>
                              <div className="flex flex-wrap gap-2">
                                {TEXT_COLOR_PRESETS.map(color => (
                                  <ColorSwatch
                                    key={color}
                                    color={color}
                                    isSelected={form.customization.text.colors?.includes(color)}
                                    onClick={() => handleTextColorToggle(color)}
                                  />
                                ))}
                                <input
                                  type="color"
                                  onChange={(e) => handleTextColorToggle(e.target.value)}
                                  className="w-8 h-8 rounded-full border cursor-pointer"
                                />
                              </div>
                              <p className="text-xs text-gray-400 mt-2">Customer can choose any of these colors</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Logo Upload */}
                      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-4 flex items-center justify-between bg-gray-50/30">
                          <div className="flex items-center gap-2">
                            <Image size={18} className="text-orange-500" />
                            <span className="font-medium text-gray-800">Logo Upload</span>
                          </div>
                          <Toggle enabled={form.customization.logo.enabled} onChange={(val) => handleCustomToggle("logo", val)} />
                        </div>
                      </div>

                      {/* Font Selection */}
                      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                          <div className="flex items-center gap-2">
                            <FileType size={18} className="text-orange-500" />
                            <span className="font-medium text-gray-800">Font Selection</span>
                          </div>
                          <Toggle enabled={form.customization.font.enabled} onChange={(val) => handleCustomToggle("font", val)} />
                        </div>
                        {form.customization.font.enabled && (
                          <div className="p-4">
                            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Allowed fonts</label>
                            <div className="grid grid-cols-2 gap-2">
                              {FONT_OPTIONS.map(font => (
                                <label
                                  key={font}
                                  className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={form.customization.font.options.includes(font)}
                                    onChange={() => handleFontOptionToggle(font)}
                                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                                  />
                                  <span style={{ fontFamily: font }}>{font}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
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