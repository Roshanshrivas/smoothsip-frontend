// src/pages/admin/AdminProfile.jsx
import React, { useState, useEffect, useCallback, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Settings,
  LogOut,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertCircle,
  Edit2,
  Save,
  X,
  Camera,
  CheckCircle,
  Clock,
  Zap,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { logoutUser, updateProfile, changePassword } from '../../store/slices/authSlice';

// ─── Animation Variants ──────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

// ─── Memoized Info Row ──────────────────────────────
const InfoRow = memo(({ label, value, icon: Icon, className = '' }) => (
  <div className={`flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 ${className}`}>
    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      {Icon && <Icon size={16} />}
      <span>{label}</span>
    </div>
    <span className="text-sm font-medium text-gray-800 dark:text-white">{value || '—'}</span>
  </div>
));
InfoRow.displayName = 'InfoRow';

// ─── Edit Profile Modal ──────────────────────────────
const EditProfileModal = memo(({ isOpen, onClose, user, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    description: user?.description || '',
    gender: user?.gender || 'Prefer not to say',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        description: user.description || '',
        gender: user.gender || 'Prefer not to say',
      });
    }
  }, [user]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        await onUpdate(formData);
        toast.success('Profile updated successfully!');
        onClose();
      } catch (error) {
        toast.error(error?.message || 'Failed to update profile');
      } finally {
        setLoading(false);
      }
    },
    [formData, onUpdate, onClose]
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Profile</h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                disabled={loading}
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Bio / Description
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});
EditProfileModal.displayName = 'EditProfileModal';

// ─── Change Password Modal ───────────────────────────
const ChangePasswordModal = memo(({ isOpen, onClose, onChangePassword }) => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (formData.newPassword.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      setLoading(true);
      try {
        await onChangePassword(formData.oldPassword, formData.newPassword);
        toast.success('Password changed successfully!');
        onClose();
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } catch (error) {
        toast.error(error?.message || 'Failed to change password');
      } finally {
        setLoading(false);
      }
    },
    [formData, onChangePassword, onClose]
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Change Password</h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                disabled={loading}
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={formData.oldPassword}
                  onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Shield size={18} /> Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});
ChangePasswordModal.displayName = 'ChangePasswordModal';

// ─── Quick Action Button ─────────────────────────────
const QuickAction = memo(({ icon: Icon, label, onClick, color = 'orange' }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`p-4 text-center rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-${color}-50 dark:hover:bg-${color}-900/20 transition group`}
  >
    <Icon size={20} className={`mx-auto text-${color}-500 mb-1.5 group-hover:scale-110 transition-transform`} />
    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
  </motion.button>
));
QuickAction.displayName = 'QuickAction';

// ─── Loading Skeleton ─────────────────────────────────
const ProfileSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
      <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64" />
        <div className="flex gap-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 h-24" />
      ))}
    </div>
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 h-64" />
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 h-64" />
    </div>
  </div>
);

// ─── MAIN COMPONENT ────────────────────────────────────
const AdminProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  // Stats – can be fetched from API later
  const [stats] = useState({
    totalProducts: 1248,
    totalOrders: 8520,
    totalUsers: 12458,
    revenueGenerated: '₹24,58,620',
    pendingOrders: 156,
    salesGrowth: 12.5,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isLoading && isAuthenticated && !isAdmin) {
      toast.error('Access denied. Admin only.');
      navigate('/admin/dashboard');
    }
  }, [isLoading, isAuthenticated, isAdmin, navigate]);

  const handleLogout = useCallback(async () => {
    await dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/login');
  }, [dispatch, navigate]);

  const handleUpdateProfile = useCallback(
    async (data) => {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });
      await dispatch(updateProfile(formData)).unwrap();
    },
    [dispatch]
  );

  const handleChangePassword = useCallback(
    async (oldPassword, newPassword) => {
      await dispatch(changePassword({ oldPassword, newPassword })).unwrap();
    },
    [dispatch]
  );

  if (isLoading || !user) {
    return <ProfileSkeleton />;
  }

  const initials = user.name?.charAt(0) || 'A';
  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';
  const lastLogin = user.lastLogin
    ? new Date(user.lastLogin).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6"
    >
      {/* ─── Profile Header ───────────────────────────── */}
      <motion.div
        variants={fadeInUp}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center gap-6"
      >
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {initials}
          </div>
          <button
            className="absolute bottom-0 right-0 p-1.5 bg-orange-500 rounded-full text-white hover:bg-orange-600 transition shadow-md"
            title="Change avatar"
            disabled
          >
            <Camera size={14} />
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircle size={12} /> Active
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
            <Mail size={14} /> {user.email}
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Shield size={14} className="text-orange-500" /> Administrator
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} /> Joined {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} /> Last login: {lastLogin}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setEditModalOpen(true)}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition flex items-center gap-2 shadow-sm"
          >
            <Edit2 size={16} /> Edit Profile
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm font-medium transition flex items-center gap-2"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </motion.div>

      {/* ─── Info Cards ────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <motion.div
          variants={fadeInUp}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500">
              <User size={18} />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white">Personal Information</h3>
          </div>
          <div className="space-y-1">
            <InfoRow label="Full Name" value={user.name} />
            <InfoRow label="Email Address" value={user.email} icon={Mail} />
            <InfoRow label="Phone Number" value={user.phone || '—'} icon={Phone} />
            <InfoRow label="Gender" value={user.gender || 'Prefer not to say'} />
            <InfoRow label="Bio" value={user.description || '—'} />
          </div>
        </motion.div>

        {/* Security & Account */}
        <motion.div
          variants={fadeInUp}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500">
              <Shield size={18} />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white">Security & Account</h3>
          </div>
          <div className="space-y-1">
            <InfoRow label="Account Status" value={<span className="text-green-600 font-medium">Active</span>} />
            <InfoRow label="Role" value={<span className="text-orange-600 font-medium">Administrator</span>} />
            <InfoRow label="Last Login" value={lastLogin} icon={Clock} />
            <InfoRow label="Member Since" value={formattedDate} icon={Calendar} />
            <InfoRow label="Two-Factor Auth" value={<span className="text-gray-400">Disabled</span>} />
          </div>
          <button
            onClick={() => setPasswordModalOpen(true)}
            className="mt-4 w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm font-medium flex items-center justify-center gap-2"
          >
            <Shield size={16} /> Change Password
          </button>
        </motion.div>
      </div>

      {/* ─── Quick Actions ────────────────────────────── */}
      <motion.div
        variants={fadeInUp}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6"
      >
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Zap size={18} className="text-orange-500" /> Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction
            icon={Package}
            label="Add Product"
            onClick={() => navigate('/admin/products/add')}
          />
          <QuickAction
            icon={ShoppingCart}
            label="View Orders"
            onClick={() => navigate('/admin/orders')}
          />
          <QuickAction
            icon={Users}
            label="Manage Users"
            onClick={() => navigate('/admin/users')}
          />
          <QuickAction
            icon={Settings}
            label="Settings"
            onClick={() => navigate('/admin/settings')}
          />
        </div>
      </motion.div>

      {/* ─── Modals ─────────────────────────────────────── */}
      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={user}
        onUpdate={handleUpdateProfile}
      />

      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onChangePassword={handleChangePassword}
      />
    </motion.div>
  );
};

export default AdminProfile;