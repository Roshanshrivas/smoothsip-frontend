// src/pages/admin/settings/SeoSettings.jsx
import React, { useState } from "react";
import { Search, Save } from "lucide-react";
import { SectionCard, SettingRow } from "../settings/SettingsHelpers";

const SeoSettings = ({ data, onSave }) => {
  const [formData, setFormData] = useState(data);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SectionCard title="SEO Settings" icon={<Search size={18} />}>
        <SettingRow label="Meta Title">
          <input
            type="text"
            name="metaTitle"
            value={formData.metaTitle || ""}
            onChange={handleChange}
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm w-full sm:w-72"
          />
        </SettingRow>
        <SettingRow label="Meta Description">
          <textarea
            name="metaDescription"
            rows="2"
            value={formData.metaDescription || ""}
            onChange={handleChange}
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm w-full sm:w-72 resize-none"
          />
        </SettingRow>
        <SettingRow label="Meta Keywords">
          <input
            type="text"
            name="metaKeywords"
            value={formData.metaKeywords || ""}
            onChange={handleChange}
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm w-full sm:w-72"
          />
        </SettingRow>
      </SectionCard>

      <div className="flex justify-end">
        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-sm transition"
        >
          <Save size={16} /> Save Changes
        </button>
      </div>
    </form>
  );
};

export default SeoSettings;