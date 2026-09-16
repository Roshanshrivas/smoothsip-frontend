import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Lock, Save, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { changePassword } from '../../store/slices/authSlice';

// ─── Brand Colors ───────────────────────────────────
const BRAND_PRIMARY = '#14C6D8';
const BRAND_HOVER = '#0FB2C3';
const BRAND_DARK = '#18212A';
const BRAND_TEXT = '#5F6C7B';
const BRAND_BORDER = '#E8EEF2';
const BRAND_SECTION = '#F8FBFC';
const BRAND_SUCCESS = '#22C55E';
const BRAND_DANGER = '#EF4444';
const BRAND_WARNING = '#F59E0B';

const ChangePassword = () => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);

  // ─── Password Strength ─────────────────────────────
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const levels = [
      { score: 0, label: 'Weak', color: BRAND_DANGER },
      { score: 1, label: 'Weak', color: BRAND_DANGER },
      { score: 2, label: 'Fair', color: BRAND_WARNING },
      { score: 3, label: 'Good', color: BRAND_PRIMARY },
      { score: 4, label: 'Strong', color: BRAND_SUCCESS },
      { score: 5, label: 'Very Strong', color: BRAND_SUCCESS },
    ];
    return levels[Math.min(score, 5)];
  };

  const strength = getPasswordStrength(formData.newPassword);

  // ─── Submit Handler ────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (formData.currentPassword === formData.newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    setLoading(true);
    try {
      // Call the Redux thunk
      const result = await dispatch(
        changePassword({
          oldPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        })
      ).unwrap();

      toast.success('Password changed successfully');
      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error(error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPasswords(!showPasswords);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="border-b border-[#E8EEF2] dark:border-[#18212A]/30 pb-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[#18212A] dark:text-white flex items-center gap-2">
          <Lock size={24} className="text-[#14C6D8]" />
          Change Password
        </h2>
        <p className="text-xs sm:text-sm text-[#5F6C7B] dark:text-[#5F6C7B] mt-1">
          Update your password to keep your account secure.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-[#18212A] rounded-2xl border border-[#E8EEF2] dark:border-[#18212A]/30 shadow-sm p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Password */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#18212A] dark:text-white mb-1.5">
              Current Password <span className="text-[#EF4444]">*</span>
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5F6C7B]/60" />
              <input
                type={showPasswords ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                className="w-full pl-10 pr-10 py-2.5 border border-[#E8EEF2] dark:border-[#18212A]/30 rounded-xl bg-white dark:bg-[#18212A] text-[#18212A] dark:text-white text-sm focus:ring-2 focus:ring-[#14C6D8] focus:border-transparent outline-none transition"
                placeholder="Enter your current password"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5F6C7B]/60 hover:text-[#18212A] dark:hover:text-white transition"
                aria-label={showPasswords ? 'Hide password' : 'Show password'}
              >
                {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#18212A] dark:text-white mb-1.5">
              New Password <span className="text-[#EF4444]">*</span>
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5F6C7B]/60" />
              <input
                type={showPasswords ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full pl-10 pr-10 py-2.5 border border-[#E8EEF2] dark:border-[#18212A]/30 rounded-xl bg-white dark:bg-[#18212A] text-[#18212A] dark:text-white text-sm focus:ring-2 focus:ring-[#14C6D8] focus:border-transparent outline-none transition"
                placeholder="Enter new password (min 6 characters)"
                required
                minLength={6}
              />
            </div>

            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#E8EEF2] dark:bg-[#18212A]/30 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300 rounded-full"
                      style={{
                        width: `${(strength.score / 5) * 100}%`,
                        backgroundColor: strength.color,
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
                <p className="text-[10px] text-[#5F6C7B] mt-1">
                  Use 8+ characters with uppercase, lowercase, numbers & symbols for strong password.
                </p>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#18212A] dark:text-white mb-1.5">
              Confirm New Password <span className="text-[#EF4444]">*</span>
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5F6C7B]/60" />
              <input
                type={showPasswords ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full pl-10 pr-10 py-2.5 border border-[#E8EEF2] dark:border-[#18212A]/30 rounded-xl bg-white dark:bg-[#18212A] text-[#18212A] dark:text-white text-sm focus:ring-2 focus:ring-[#14C6D8] focus:border-transparent outline-none transition"
                placeholder="Re-enter new password"
                required
              />
              {formData.confirmPassword && formData.newPassword && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {formData.confirmPassword === formData.newPassword ? (
                    <CheckCircle size={16} className="text-[#22C55E]" />
                  ) : (
                    <AlertCircle size={16} className="text-[#EF4444]" />
                  )}
                </div>
              )}
            </div>
            {formData.confirmPassword && formData.newPassword && formData.confirmPassword !== formData.newPassword && (
              <p className="mt-1 text-xs text-[#EF4444]">Passwords do not match</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#14C6D8] hover:bg-[#0FB2C3] text-white text-sm font-semibold rounded-xl transition shadow-sm hover:shadow-md disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save size={18} /> Update Password
              </>
            )}
          </button>

          {/* Additional Info */}
          <div className="text-[10px] sm:text-xs text-[#5F6C7B] border-t border-[#E8EEF2] dark:border-[#18212A]/30 pt-4 mt-2">
            <p className="flex items-center gap-1.5">
              <Lock size={12} className="text-[#14C6D8]" /> Your password must be at least 6 characters and should not be easily guessable.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;