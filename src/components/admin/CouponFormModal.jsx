import React, { useState, useEffect } from "react";
import { X, Save, Tag } from "lucide-react";
import toast from "react-hot-toast";

const CouponFormModal = ({ isOpen, onClose, onSave, initialData = null }) => {
  const isEditing = !!initialData;

  const getDefaultForm = () => ({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "",
    maxDiscount: "",
    startDate: "",
    expiryDate: "",
    usageLimit: "",
    perUserLimit: "",
    status: "active",
  });

  const [formData, setFormData] = useState(getDefaultForm());

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          code: initialData.code || "",
          description: initialData.description || "",
          discountType: initialData.discountType || "percentage",
          discountValue: initialData.discountValue || "",
          minOrderAmount: initialData.minimumOrder || initialData.minOrderAmount || "",
          maxDiscount: initialData.maxDiscount || "",
          startDate: initialData.startDate
            ? new Date(initialData.startDate).toISOString().slice(0, 10)
            : "",
          expiryDate: initialData.endDate
            ? new Date(initialData.endDate).toISOString().slice(0, 10)
            : "",
          usageLimit: initialData.usageLimit || "",
          perUserLimit: initialData.perUserLimit || "",
          status: initialData.active ? "active" : "disabled",
        });
      } else {
        setFormData({
          ...getDefaultForm(),
          code: generateCode(),
          startDate: new Date().toISOString().slice(0, 10),
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 10),
        });
      }
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.error("Coupon code is required");
      return;
    }
    if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
      toast.error("Discount value must be greater than 0");
      return;
    }
    if (!formData.expiryDate) {
      toast.error("Expiry date is required");
      return;
    }
    if (formData.discountType === "percentage" && parseFloat(formData.discountValue) > 100) {
      toast.error("Percentage discount cannot exceed 100%");
      return;
    }
    onSave(formData);
  };

  const regenerateCode = () => {
    setFormData((prev) => ({ ...prev, code: generateCode() }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Tag size={18} className="text-orange-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {isEditing ? "Edit Coupon" : "Create New Coupon"}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-100px)] space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Coupon Code <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800"
                  required
                />
                {!isEditing && (
                  <button
                    type="button"
                    onClick={regenerateCode}
                    className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    ⟳
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g., Summer Sale 2026"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Discount Type <span className="text-red-500">*</span>
              </label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Discount Value <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                min="1"
                step="0.01"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Max Discount (optional)
              </label>
              <input
                type="number"
                name="maxDiscount"
                value={formData.maxDiscount}
                onChange={handleChange}
                min="1"
                step="0.01"
                placeholder="e.g., 500"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Minimum Order Amount
              </label>
              <input
                type="number"
                name="minOrderAmount"
                value={formData.minOrderAmount}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="e.g., 999"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Total Usage Limit
              </label>
              <input
                type="number"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleChange}
                min="1"
                placeholder="e.g., 100"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Per-User Limit
              </label>
              <input
                type="number"
                name="perUserLimit"
                value={formData.perUserLimit}
                onChange={handleChange}
                min="1"
                placeholder="e.g., 1"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
              >
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-sm transition"
            >
              <Save size={16} /> {isEditing ? "Update Coupon" : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponFormModal;