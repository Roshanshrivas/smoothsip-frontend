// src/pages/admin/settings/SettingsHelpers.jsx
import React from "react";

export const ToggleSwitch = ({ enabled, onChange, label }) => (
  <button
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
      enabled ? "bg-orange-500" : "bg-gray-300 dark:bg-gray-600"
    }`}
    aria-label={label || "Toggle switch"}
    type="button"
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ${
        enabled ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

export const SettingRow = ({ label, description, children, required = false }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
    <div className="mb-2 sm:mb-0">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </p>
      {description && <p className="text-xs text-gray-400">{description}</p>}
    </div>
    <div className="sm:ml-4 flex-shrink-0">{children}</div>
  </div>
);

export const SectionCard = ({ title, icon, children }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-800 dark:text-white">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);