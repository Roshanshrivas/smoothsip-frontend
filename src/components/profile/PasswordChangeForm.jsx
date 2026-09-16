import React, { useState } from "react";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";

const PasswordChangeForm = ({ onPasswordChange, isLoading }) => {
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordData.new.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    await onPasswordChange(passwordData);
    setPasswordData({ current: "", new: "", confirm: "" });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
      <div className="p-5 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Lock size={18} /> Change Password</h2>
      </div>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Current Password</label>
          <input
            type="password"
            value={passwordData.current}
            onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
            required
            className="w-full border rounded-xl px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">New Password</label>
          <input
            type="password"
            value={passwordData.new}
            onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
            required
            className="w-full border rounded-xl px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Confirm New Password</label>
          <input
            type="password"
            value={passwordData.confirm}
            onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
            required
            className="w-full border rounded-xl px-3 py-2"
          />
        </div>
        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-gray-800 text-white rounded-xl hover:bg-gray-900">
          {isLoading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
};

export default PasswordChangeForm;