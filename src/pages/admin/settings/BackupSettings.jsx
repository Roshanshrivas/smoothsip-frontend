// src/pages/admin/settings/BackupSettings.jsx
import React, { useState } from "react";
import { Database, Save } from "lucide-react";
import toast from "react-hot-toast";
import { SectionCard, SettingRow } from "../settings/SettingsHelpers";

const BackupSettings = ({ data, onSave }) => {
  const [formData, setFormData] = useState(data);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SectionCard title="Backup & Update" icon={<Database size={18} />}>
        <SettingRow label="Database Backup">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{formData.dbLastBackup || "No backup"}</span>
            <button
              type="button"
              className="text-orange-500 hover:text-orange-600 text-sm font-medium"
              onClick={() => toast.success("Database backup initiated")}
            >
              Backup Now
            </button>
          </div>
        </SettingRow>
        <SettingRow label="File Backup">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{formData.fileLastBackup || "No backup"}</span>
            <button
              type="button"
              className="text-orange-500 hover:text-orange-600 text-sm font-medium"
              onClick={() => toast.success("File backup initiated")}
            >
              Backup Now
            </button>
          </div>
        </SettingRow>
        <SettingRow label="System Update">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              You are using the latest version. {formData.systemVersion && `(v${formData.systemVersion})`}
            </span>
            <button
              type="button"
              className="text-orange-500 hover:text-orange-600 text-sm font-medium"
              onClick={() => toast.success("Checking for updates...")}
            >
              Check Update
            </button>
          </div>
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

export default BackupSettings;