import React, { useState, useEffect } from "react";
import { Shield, CheckCircle, Eye, Lock, Smartphone, Globe, Clock, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const SecurityCenterCard = ({ admin }) => {
  const [security, setSecurity] = useState({
    passwordLastChanged: "15 days ago",
    twoFactorEnabled: true,
    activeSessions: 3,
    lastLogin: new Date().toLocaleString(),
  });

  useEffect(() => {
    const saved = localStorage.getItem("adminSecurity");
    if (saved) setSecurity(JSON.parse(saved));
  }, []);

  const updateSecurity = (key, value) => {
    const updated = { ...security, [key]: value };
    setSecurity(updated);
    localStorage.setItem("adminSecurity", JSON.stringify(updated));
    toast.success(`${key.replace(/([A-Z])/g, ' $1').trim()} updated`);
  };

  const SecurityRow = ({ icon, label, value, action, actionLabel, isToggle = false, toggleState }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">{label}</p>
          {value && <p className="text-xs text-gray-400">{value}</p>}
        </div>
      </div>
      {isToggle ? (
        <button
          onClick={() => updateSecurity(toggleState.key, !toggleState.value)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
            toggleState.value ? "bg-orange-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ${
              toggleState.value ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      ) : (
        <button
          onClick={action}
          className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1 transition"
        >
          {actionLabel}
          <span className="text-xs">→</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
            <Shield size={18} className="text-orange-500" />
          </div>
          <h3 className="font-semibold text-gray-800">Security Center</h3>
        </div>
        <p className="text-xs text-gray-400 mt-1">Manage your account security and authentication</p>
      </div>

      {/* Content */}
      <div className="px-5 pb-5">
        <SecurityRow
          icon={<Lock size={16} className="text-gray-400" />}
          label="Password"
          value={`Last changed ${security.passwordLastChanged}`}
          action={() => toast.success("Open password change modal")}
          actionLabel="Change"
        />
        <SecurityRow
          icon={<Smartphone size={16} className="text-gray-400" />}
          label="Two-Factor Authentication"
          value="Add an extra layer of security to your account"
          isToggle={true}
          toggleState={{ key: "twoFactorEnabled", value: security.twoFactorEnabled }}
        />
        <SecurityRow
          icon={<Globe size={16} className="text-gray-400" />}
          label="Active Sessions"
          value={`${security.activeSessions} device${security.activeSessions !== 1 ? "s" : ""} currently logged in`}
          action={() => toast.success("View active sessions")}
          actionLabel="Manage"
        />
        <SecurityRow
          icon={<Clock size={16} className="text-gray-400" />}
          label="Last Login"
          value={security.lastLogin}
          action={() => toast.success("View login history")}
          actionLabel="History"
        />
      </div>

      {/* Security Status */}
      <div className="mx-5 mb-5 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
        <div className="flex items-center gap-2">
          <CheckCircle size={16} className="text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800">Account Secure</p>
            <p className="text-xs text-green-600">All security settings are up to date</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityCenterCard;