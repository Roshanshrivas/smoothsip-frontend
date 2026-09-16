// src/pages/admin/settings/EmailSettings.jsx
import React, { useState } from "react";
import { Mail, Save, Send, Loader2 } from "lucide-react";
import { SectionCard, SettingRow } from "./SettingsHelpers";
import toast from "react-hot-toast";
import apiClient from "../../../api/client";

const EmailSettings = ({ data, onSave }) => {
  const [formData, setFormData] = useState(data || {});
  const [isSaving, setIsSaving] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testing, setTesting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      toast.error("Failed to save email settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTestEmail = async () => {
    if (!testEmail.trim()) {
      toast.error("Please enter a test email address");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setTesting(true);
    try {
      const response = await apiClient.post('/admin/settings/test-email', {
        email: testEmail,
        settings: formData,
      });
      toast.success('✅ Test email sent successfully!');
      setTestEmail('');
    } catch (error) {
      toast.error('❌ Failed to send test email: ' + (error.response?.data?.message || 'Please check your SMTP settings'));
    } finally {
      setTesting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SectionCard title="Email Settings" icon={<Mail size={18} />}>
        <SettingRow label="Mail Driver">
          <select
            name="driver"
            value={formData.driver || "SMTP"}
            onChange={handleChange}
            className="w-full sm:w-72 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="SMTP">SMTP</option>
            <option value="Sendmail">Sendmail</option>
            <option value="Mailgun">Mailgun</option>
            <option value="SES">SES</option>
          </select>
        </SettingRow>
        <SettingRow label="Mail Host">
          <input
            type="text"
            name="host"
            value={formData.host || ""}
            onChange={handleChange}
            className="w-full sm:w-72 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </SettingRow>
        <SettingRow label="Mail Port">
          <input
            type="text"
            name="port"
            value={formData.port || ""}
            onChange={handleChange}
            className="w-full sm:w-32 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </SettingRow>
        <SettingRow label="Mail Username">
          <input
            type="text"
            name="username"
            value={formData.username || ""}
            onChange={handleChange}
            className="w-full sm:w-72 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </SettingRow>
        <SettingRow label="Mail Password">
          <div className="flex items-center gap-2">
            <input
              type="password"
              name="password"
              value={formData.password || ""}
              onChange={handleChange}
              className="w-full sm:w-72 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <span className="text-xs text-gray-400">********</span>
          </div>
        </SettingRow>
        <SettingRow label="Mail Encryption">
          <select
            name="encryption"
            value={formData.encryption || "TLS"}
            onChange={handleChange}
            className="w-full sm:w-72 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="TLS">TLS</option>
            <option value="SSL">SSL</option>
            <option value="none">None</option>
          </select>
        </SettingRow>
        
        {/* ✅ TEST EMAIL SECTION */}
        <SettingRow label="Test Email">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-72">
            <input
              type="email"
              placeholder="Enter email to test"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <button
              type="button"
              onClick={handleTestEmail}
              disabled={testing}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg text-sm font-medium transition"
            >
              {testing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {testing ? 'Sending...' : 'Test'}
            </button>
          </div>
        </SettingRow>
      </SectionCard>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium rounded-lg shadow-sm transition"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default EmailSettings;