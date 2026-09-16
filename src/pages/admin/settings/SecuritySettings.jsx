// src/pages/admin/settings/SecuritySettings.jsx
import React, { useState } from "react";
import { Shield, Save } from "lucide-react";
import { SectionCard, SettingRow, ToggleSwitch } from "../settings/SettingsHelpers";

const SecuritySettings = ({ data, onSave }) => {
  const [formData, setFormData] = useState(data);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const toggle = (key) => {
    setFormData((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SectionCard title="Security Settings" icon={<Shield size={18} />}>
        <SettingRow
          label="Two-Factor Authentication"
          description="Enable 2FA for admin login"
        >
          <ToggleSwitch
            enabled={formData.twoFactor || false}
            onChange={() => toggle("twoFactor")}
          />
        </SettingRow>
        <SettingRow
          label="Login Notification"
          description="Get notified on new login"
        >
          <ToggleSwitch
            enabled={formData.loginNotification || false}
            onChange={() => toggle("loginNotification")}
          />
        </SettingRow>
        <SettingRow
          label="Strong Password"
          description="Force strong password for admins"
        >
          <ToggleSwitch
            enabled={formData.strongPassword || false}
            onChange={() => toggle("strongPassword")}
          />
        </SettingRow>
        <SettingRow
          label="Session Timeout"
          description="Automatically logout inactive sessions"
        >
          <ToggleSwitch
            enabled={formData.sessionTimeout || false}
            onChange={() => toggle("sessionTimeout")}
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

export default SecuritySettings;