// src/components/admin/users/UserModal.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  Mail,
  Phone,
  User as UserIcon,
  Shield,
  Activity,
  Calendar,
  Edit,
  UserCheck,
  Clock,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";

const UserModal = ({
  isOpen,
  onClose,
  user,
  mode = "view",
  onSave,
  onEditMode,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
    status: "Active",
  });
  const [loading, setLoading] = useState(false);
  const isEditing = !!user;
  const isViewMode = mode === "view";
  const isCreateMode = !isEditing && mode === "edit";

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "", // never pre-fill password
        role: user.role || "user",
        status: user.status || "Active",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "user",
        status: "Active",
      });
    }
  }, [user, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error("Name and email are required");
      return;
    }
    // For create, password is required
    if (isCreateMode && !formData.password) {
      toast.error("Password is required for new users");
      return;
    }
    setLoading(true);
    try {
      // Only include password if creating or if it's provided
      const payload = { ...formData };
      if (!isCreateMode && !payload.password) {
        delete payload.password; // don't send empty password on update
      }
      await onSave(payload);
      onClose();
    } catch (err) {
      toast.error(err.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderField = (label, value, icon, className = "") => {
    const Icon = icon;
    return (
      <div className="flex items-start gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
        <Icon size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {label}
          </p>
          <p className={`text-sm text-gray-900 dark:text-white truncate ${className}`}>
            {value || "—"}
          </p>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-orange-50 to-white dark:from-gray-800 dark:to-gray-900 flex-shrink-0">
              <div className="flex justify-between items-center">
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                    {isViewMode ? "User Details" : isEditing ? "Edit User" : "Create User"}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                    {isViewMode
                      ? `Viewing ${user?.name}`
                      : isEditing
                      ? "Update user information"
                      : "Add a new user to the system"}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors flex-shrink-0 ml-2"
                >
                  <X size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isViewMode ? (
                // ---------- VIEW MODE ----------
                <div className="space-y-1">
                  <div className="flex items-center gap-4 mb-6">
                    <img
                      src={
                        user?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user?.name || "User"
                        )}&background=ff6b00&color=fff&size=80`
                      }
                      alt={user?.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-orange-200 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                        {user?.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                    <div className="space-y-1">
                      {renderField("Full Name", user?.name, UserIcon)}
                      {renderField("Email", user?.email, Mail)}
                      {renderField("Phone", user?.phone, Phone)}
                    </div>
                    <div className="space-y-1">
                      {renderField("Role", user?.role === "admin" ? "Admin" : "User", Shield)}
                      {renderField(
                        "Status",
                        user?.status,
                        Activity,
                        user?.status === "Active"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      )}
                      {renderField("Joined", user?.joined, Calendar)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 mt-2">
                    {renderField("Last Login", user?.lastLogin || "Never", Clock)}
                    {renderField("Orders", user?.ordersCount || 0, UserCheck)}
                    {renderField("Total Spent", `₹${user?.totalSpent || 0}`, UserCheck)}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-800 mt-4">
                    <button
                      onClick={onEditMode}
                      className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      <Edit size={18} /> Edit User
                    </button>
                    <button
                      onClick={onClose}
                      className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                // ---------- EDIT / CREATE MODE ----------
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all dark:bg-gray-800"
                        placeholder="e.g., John Doe"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all dark:bg-gray-800"
                        placeholder="user@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all dark:bg-gray-800"
                        placeholder="+91 12345 67890"
                      />
                    </div>
                  </div>

                  {/* Password field – only for create mode */}
                  {isCreateMode && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all dark:bg-gray-800"
                          placeholder="Min 6 characters"
                          minLength={6}
                          required={isCreateMode}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Role
                      </label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all dark:bg-gray-800 appearance-none"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Status
                      </label>
                      <div className="relative">
                        <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all dark:bg-gray-800 appearance-none"
                        >
                          <option value="Active">Active</option>
                          <option value="Blocked">Blocked</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading && <Loader2 size={18} className="animate-spin" />}
                      {isEditing ? "Update User" : "Create User"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UserModal;