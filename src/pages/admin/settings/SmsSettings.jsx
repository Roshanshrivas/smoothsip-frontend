// src/pages/admin/settings/SmsSettings.jsx
import React, { useState } from "react";
import { MessageCircle, Save } from "lucide-react";
import { SectionCard, SettingRow } from "../settings/SettingsHelpers";

const SmsSettings = ({ data, onSave }) => {
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
      <SectionCard title="SMS Settings" icon={<MessageCircle size={18} />}>
        <SettingRow label="SMS Provider">
          <select
            name="provider"
            value={formData.provider || "Twilio"}
            onChange={handleChange}
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm w-full sm:w-72"
          >
            <option value="Twilio">Twilio</option>
            <option value="AWS SNS">AWS SNS</option>
            <option value="Vonage">Vonage</option>
            <option value="TextLocal">TextLocal</option>
          </select>
        </SettingRow>
        <SettingRow label="Account SID">
          <input
            type="text"
            name="accountSid"
            value={formData.accountSid || ""}
            onChange={handleChange}
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm w-full sm:w-72"
          />
        </SettingRow>
        <SettingRow label="Auth Token">
          <input
            type="text"
            name="authToken"
            value={formData.authToken || ""}
            onChange={handleChange}
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm w-full sm:w-72"
          />
        </SettingRow>
        <SettingRow label="From Number">
          <input
            type="text"
            name="fromNumber"
            value={formData.fromNumber || ""}
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

export default SmsSettings;