import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, Package, Upload, X, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { customProductService } from "../../../services/customProductService";

const extractPublicId = (url) => {
  if (!url) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(\.[^.]+)?$/);
  return match ? match[1].replace(/\.[^.]+$/, '') : null;
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
    tumblerColor: "#1a1a1a",
    customization: {
      text: true,
      color: true,
      font: true,
      logo: true,
      pattern: true,
    },
    allowedColors: ["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ff8c00"],
    allowedFonts: ["Poppins", "Arial", "Georgia"],
    textArea: { left: 50, top: 200, width: 400, height: 200 },
    logoArea: { left: 150, top: 50, width: 200, height: 150 },
  });

  // ─── Load product if editing ────────────────────────
  useEffect(() => {
    if (isEditing) {
      const loadProduct = async () => {
        try {
          const product = await customProductService.getCustomProductById(id);
          setFormData({
            ...product,
            customization: product.customization || { text: true, color: true, font: true, logo: true, pattern: true },
          });
        } catch (error) {
          toast.error("Failed to load product");
          navigate("/admin/custom-products");
        } finally {
          setLoading(false);
        }
      };
      loadProduct();
    }
  }, [id, isEditing, navigate]);

  // ─── Handle single image upload (mainImage) ──────
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

    // Upload to Cloudinary
    setUploading(true);
    try {
      const result = await customProductService.uploadProductImage(file);
      if (!result.url) throw new Error('Upload failed');
      setFormData(prev => ({ ...prev, mainImage: result.url }));
      toast.success('Image uploaded to Cloudinary');
    } catch (error) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // ─── Handle multiple images upload ────────────────
  const handleImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Validate each file
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
      if (!result.urls || result.urls.length === 0) throw new Error('Upload failed');
      // Append to existing images
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...result.urls],
        // If no mainImage set, set first uploaded as main
        mainImage: prev.mainImage || result.urls[0],
      }));
      toast.success(`${result.urls.length} images uploaded`);
    } catch (error) {
      toast.error(error.message || 'Failed to upload images');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // ─── Remove image ──────────────────────────────────
  const removeImage = async (index, url) => {
    // If it's a Cloudinary URL, delete from Cloudinary
    const publicId = extractPublicId(url);
    if (publicId) {
      try {
        await customProductService.deleteCloudinaryImage(publicId);
      } catch (err) {
        console.warn('Could not delete from Cloudinary:', err);
      }
    }
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      images: updatedImages,
      // If mainImage was removed, set new mainImage to first remaining
      mainImage: prev.mainImage === url ? (updatedImages[0] || '') : prev.mainImage,
    }));
  };

  // ─── Remove main image ─────────────────────────────
  const removeMainImage = async () => {
    const url = formData.mainImage;
    const publicId = extractPublicId(url);
    if (publicId) {
      try {
        await customProductService.deleteCloudinaryImage(publicId);
      } catch (err) {
        console.warn('Could not delete from Cloudinary:', err);
      }
    }
    setFormData(prev => ({
      ...prev,
      mainImage: prev.images[0] || '',
    }));
  };

  // ─── Form field handlers ────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomToggle = (key) => {
    setFormData(prev => ({
      ...prev,
      customization: { ...prev.customization, [key]: !prev.customization[key] }
    }));
  };

  const handleAreaChange = (area, field, value) => {
    setFormData(prev => ({
      ...prev,
      [area]: { ...prev[area], [field]: parseInt(value) || 0 }
    }));
  };

  const handleAllowedColorsChange = (e) => {
    const colors = e.target.value.split(',').map(s => s.trim());
    setFormData(prev => ({ ...prev, allowedColors: colors }));
  };

  const handleAllowedFontsChange = (e) => {
    const fonts = e.target.value.split(',').map(s => s.trim());
    setFormData(prev => ({ ...prev, allowedFonts: fonts }));
  };

  // ─── Submit ──────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Product name is required");
    if (formData.basePrice <= 0) return toast.error("Base price must be greater than 0");
    if (!formData.mainImage) return toast.error("Please upload a main image");
    setIsSaving(true);
    try {
      if (isEditing) {
        await customProductService.updateCustomProduct(id, formData);
        toast.success("Product updated");
      } else {
        await customProductService.createCustomProduct(formData);
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
          {/* Basic Info */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium">Tumbler Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="tumblerColor"
                  value={formData.tumblerColor}
                  onChange={handleChange}
                  className="w-12 h-12 rounded-lg border cursor-pointer"
                />
                <input
                  type="text"
                  name="tumblerColor"
                  value={formData.tumblerColor}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 border rounded-lg"
                />
              </div>
            </div>
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
            </div>
          </div>

          {/* Main Image Upload */}
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
              {formData.mainImage && (
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
              )}
              {!formData.mainImage && (
                <div className="w-20 h-20 rounded-lg border flex items-center justify-center text-gray-400">
                  <ImageIcon size={24} />
                </div>
              )}
              <span className="text-xs text-gray-500">PNG, JPG, WEBP, SVG (max 5MB)</span>
            </div>
          </div>

          {/* Multiple Images Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Additional Images</label>
            <div className="flex items-center gap-4 flex-wrap">
              <button
                type="button"
                onClick={() => document.getElementById('multiImageInput')?.click()}
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
                    <img src={url} alt={`Image ${index+1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index, url)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                    {url === formData.mainImage && (
                      <span className="absolute bottom-0 left-0 right-0 bg-orange-500 text-white text-[8px] text-center py-0.5">MAIN</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Upload up to 10 additional images</p>
          </div>

          {/* Description */}
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

          {/* Customisation Controls */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Customisation Options</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
              {['text', 'color', 'font', 'logo', 'pattern'].map((key) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.customization[key]}
                    onChange={() => handleCustomToggle(key)}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="capitalize">{key}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Allowed Colors & Fonts */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Allowed Colors (hex, comma)</label>
              <input
                type="text"
                value={formData.allowedColors.join(', ')}
                onChange={handleAllowedColorsChange}
                className="w-full border rounded p-2 text-sm mt-1"
                placeholder="#000000, #ffffff, #ff0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Allowed Fonts (comma)</label>
              <input
                type="text"
                value={formData.allowedFonts.join(', ')}
                onChange={handleAllowedFontsChange}
                className="w-full border rounded p-2 text-sm mt-1"
                placeholder="Poppins, Arial, Georgia"
              />
            </div>
          </div>

          {/* Placement Areas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Text Area (L, T, W, H)</label>
              <div className="flex gap-1">
                <input type="number" value={formData.textArea.left} onChange={e => handleAreaChange('textArea', 'left', e.target.value)} className="w-1/4 border rounded p-1" placeholder="L" />
                <input type="number" value={formData.textArea.top} onChange={e => handleAreaChange('textArea', 'top', e.target.value)} className="w-1/4 border rounded p-1" placeholder="T" />
                <input type="number" value={formData.textArea.width} onChange={e => handleAreaChange('textArea', 'width', e.target.value)} className="w-1/4 border rounded p-1" placeholder="W" />
                <input type="number" value={formData.textArea.height} onChange={e => handleAreaChange('textArea', 'height', e.target.value)} className="w-1/4 border rounded p-1" placeholder="H" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Logo Area (L, T, W, H)</label>
              <div className="flex gap-1">
                <input type="number" value={formData.logoArea.left} onChange={e => handleAreaChange('logoArea', 'left', e.target.value)} className="w-1/4 border rounded p-1" placeholder="L" />
                <input type="number" value={formData.logoArea.top} onChange={e => handleAreaChange('logoArea', 'top', e.target.value)} className="w-1/4 border rounded p-1" placeholder="T" />
                <input type="number" value={formData.logoArea.width} onChange={e => handleAreaChange('logoArea', 'width', e.target.value)} className="w-1/4 border rounded p-1" placeholder="W" />
                <input type="number" value={formData.logoArea.height} onChange={e => handleAreaChange('logoArea', 'height', e.target.value)} className="w-1/4 border rounded p-1" placeholder="H" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Link to="/admin/custom-products" className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</Link>
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