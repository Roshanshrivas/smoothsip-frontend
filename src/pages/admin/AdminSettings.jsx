// src/pages/admin/AdminSettings.jsx
import React, { useState, useEffect } from "react";
import {
  Settings,
  Mail,
  MessageCircle,
  Search,
  Shield,
  Database,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import { settingsService } from "../../services/settingsService";

import GeneralSettings from "./settings/GeneralSettings";
import EmailSettings from "./settings/EmailSettings";
import SmsSettings from "./settings/SmsSettings";
import SeoSettings from "./settings/SeoSettings";
import SecuritySettings from "./settings/SecuritySettings";
import BackupSettings from "./settings/BackupSettings";

// ─── Sidebar Navigation Item ──────────────────────
const SidebarNavItem = ({ icon, label, isActive, onClick, description }) => (
  <button
    onClick={onClick}
    className={`flex items-start gap-3 w-full px-4 py-2.5 text-sm rounded-lg transition ${
      isActive
        ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20"
        : "text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
    }`}
  >
    <div className="mt-0.5">{icon}</div>
    <div className="text-left">
      <p className="font-medium">{label}</p>
      {description && <p className="text-xs text-gray-400">{description}</p>}
    </div>
  </button>
);

// ─── Settings Skeleton ────────────────────────────
const SettingsSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-12 w-48"></div>
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
      </div>
      <div className="p-5 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── MAIN COMPONENT ────────────────────────────────
const AdminSettings = () => {
  const [activeSection, setActiveSection] = useState("general");
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ─── Load settings from API ──────────────────────
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await settingsService.getAll();
        setSettings(data);
      } catch (error) {
        toast.error("Failed to load settings");
        setSettings({});
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  // ─── Save section ────────────────────────────────
  const saveSection = async (section, data) => {
    setSaving(true);
    try {
      await settingsService.updateSection(section, data);
      setSettings((prev) => ({
        ...prev,
        [section]: data,
      }));
      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved`);
    } catch (error) {
      toast.error(error?.message || `Failed to save ${section} settings`);
    } finally {
      setSaving(false);
    }
  };

  // ─── Reset all settings ──────────────────────────
  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset all settings to default?")) return;
    try {
      const newSettings = await settingsService.resetAll();
      setSettings(newSettings);
      toast.success("All settings reset to default");
    } catch (error) {
      toast.error("Failed to reset settings");
    }
  };

  // ─── Sections configuration ──────────────────────
  const sections = [
    { key: "general", icon: <Settings size={18} />, label: "General", description: "Basic store and system settings" },
    { key: "email", icon: <Mail size={18} />, label: "Email Settings", description: "Configure email drivers" },
    { key: "sms", icon: <MessageCircle size={18} />, label: "SMS Settings", description: "Configure SMS providers" },
    { key: "seo", icon: <Search size={18} />, label: "SEO Settings", description: "Meta tags and keywords" },
    { key: "security", icon: <Shield size={18} />, label: "Security Settings", description: "Admin security options" },
    { key: "backup", icon: <Database size={18} />, label: "Backup & Update", description: "Database and system updates" },
  ];

  // ─── Loading State ───────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1"></div>
          </div>
          <div className="h-9 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-72 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 p-4 space-y-1">
              {sections.map((_, i) => (
                <div key={i} className="flex items-start gap-3 w-full px-4 py-2.5">
                  <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mt-1"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex-1 p-5">
              <SettingsSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Render ──────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your store configuration</p>
        </div>
        <button
          onClick={handleReset}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition disabled:opacity-50"
        >
          <RotateCcw size={16} /> Reset to Default
        </button>
      </div>

      {/* Main Layout */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar */}
          <div className="lg:w-72 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 p-4 space-y-1">
            {sections.map((section) => (
              <SidebarNavItem
                key={section.key}
                icon={section.icon}
                label={section.label}
                description={section.description}
                isActive={activeSection === section.key}
                onClick={() => setActiveSection(section.key)}
              />
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-5 space-y-6">
            {activeSection === "general" && (
              <GeneralSettings
                data={settings.general || {}}
                onSave={(data) => saveSection("general", data)}
              />
            )}
            {activeSection === "email" && (
              <EmailSettings
                data={settings.email || {}}
                onSave={(data) => saveSection("email", data)}
              />
            )}
            {activeSection === "sms" && (
              <SmsSettings
                data={settings.sms || {}}
                onSave={(data) => saveSection("sms", data)}
              />
            )}
            {activeSection === "seo" && (
              <SeoSettings
                data={settings.seo || {}}
                onSave={(data) => saveSection("seo", data)}
              />
            )}
            {activeSection === "security" && (
              <SecuritySettings
                data={settings.security || {}}
                onSave={(data) => saveSection("security", data)}
              />
            )}
            {activeSection === "backup" && (
              <BackupSettings
                data={settings.backup || {}}
                onSave={(data) => saveSection("backup", data)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;