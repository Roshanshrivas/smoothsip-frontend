// src/pages/admin/settings/GeneralSettings.jsx
import React, { useState } from "react";
import { Settings, Save, Loader2, AlertTriangle } from "lucide-react";
import { SectionCard, SettingRow, ToggleSwitch } from "./SettingsHelpers";
import toast from "react-hot-toast";

const GeneralSettings = ({ data, onSave }) => {
  const [formData, setFormData] = useState(data || {});
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.storeName?.trim()) {
      toast.error("Store Name is required");
      return;
    }
    if (!formData.storeEmail?.trim()) {
      toast.error("Store Email is required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.storeEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleMaintenance = () => {
    setFormData((prev) => ({
      ...prev,
      maintenanceMode: !prev.maintenanceMode,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SectionCard title="General Settings" icon={<Settings size={18} />}>
        <SettingRow label="Store Name" required>
          <input
            type="text"
            name="storeName"
            value={formData.storeName || ""}
            onChange={handleChange}
            className="w-full sm:w-72 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            required
          />
        </SettingRow>
        <SettingRow label="Store Email" required>
          <input
            type="email"
            name="storeEmail"
            value={formData.storeEmail || ""}
            onChange={handleChange}
            className="w-full sm:w-72 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            required
          />
        </SettingRow>
        <SettingRow label="Store Phone">
          <input
            type="tel"
            name="storePhone"
            value={formData.storePhone || ""}
            onChange={handleChange}
            className="w-full sm:w-72 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </SettingRow>
        <SettingRow label="Store Address">
          <textarea
            name="storeAddress"
            rows="2"
            value={formData.storeAddress || ""}
            onChange={handleChange}
            className="w-full sm:w-72 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
          />
        </SettingRow>
        <SettingRow label="Store Language">
          <select
            name="storeLanguage"
            value={formData.storeLanguage || "English"}
            onChange={handleChange}
            className="w-full sm:w-72 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
          </select>
        </SettingRow>
        <SettingRow label="Store Currency">
          <select
            name="currency"
            value={formData.currency || "INR"}
            onChange={handleChange}
            className="w-full sm:w-72 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="INR">INR (₹) - Indian Rupee</option>
            <option value="USD">USD ($) - US Dollar</option>
            <option value="EUR">EUR (€) - Euro</option>
            <option value="GBP">GBP (£) - British Pound</option>
          </select>
        </SettingRow>
        <SettingRow label="Timezone">
          <select
            name="timezone"
            value={formData.timezone || "Asia/Kolkata (GMT+05:30)"}
            onChange={handleChange}
            className="w-full sm:w-72 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="Asia/Kolkata (GMT+05:30)">Asia/Kolkata (GMT+05:30)</option>
            <option value="America/New_York (GMT-05:00)">America/New_York (GMT-05:00)</option>
            <option value="Europe/London (GMT+00:00)">Europe/London (GMT+00:00)</option>
            <option value="Australia/Sydney (GMT+11:00)">Australia/Sydney (GMT+11:00)</option>
          </select>
        </SettingRow>
        <SettingRow label="Date Format">
          <select
            name="dateFormat"
            value={formData.dateFormat || "DD MMM YYYY"}
            onChange={handleChange}
            className="w-full sm:w-72 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="DD MMM YYYY">DD MMM YYYY</option>
            <option value="MMM DD, YYYY">MMM DD, YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </SettingRow>
        <SettingRow label="Time Format">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="radio"
                name="timeFormat"
                value="12 Hours"
                checked={formData.timeFormat === "12 Hours"}
                onChange={handleChange}
                className="w-4 h-4 text-orange-500 focus:ring-orange-500"
              />
              12 Hours
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="radio"
                name="timeFormat"
                value="24 Hours"
                checked={formData.timeFormat === "24 Hours"}
                onChange={handleChange}
                className="w-4 h-4 text-orange-500 focus:ring-orange-500"
              />
              24 Hours
            </label>
          </div>
        </SettingRow>
        
        {/* ✅ MAINTENANCE MODE TOGGLE WITH STATUS */}
        <SettingRow
          label="Maintenance Mode"
          description="Enable to put your store in maintenance mode. Only admins can access the site."
        >
          <ToggleSwitch
            enabled={formData.maintenanceMode || false}
            onChange={toggleMaintenance}
          />
        </SettingRow>
        
        {/* ✅ MAINTENANCE MODE STATUS BANNER */}
        {formData.maintenanceMode && (
          <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                🚧 Maintenance Mode is ENABLED
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Your store is currently showing a maintenance page to all visitors.
                Only logged-in admins can bypass this.
              </p>
            </div>
          </div>
        )}
      </SectionCard>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium rounded-lg shadow-sm transition disabled:cursor-not-allowed"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default GeneralSettings;