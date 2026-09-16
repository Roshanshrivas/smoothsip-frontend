// src/pages/dashboard/Addresses.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Home,
  Briefcase,
  Users,
  Star,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmDialog from '../../components/ConfirmDialog';
import {
  fetchAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  selectAllAddresses,
  selectAddressesLoading,
} from '../../store/slices/addressSlice';

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

// ----------------------------------------------
// Main Component
// ----------------------------------------------
const Addresses = () => {
  const dispatch = useDispatch();
  const addresses = useSelector(selectAllAddresses);
  const loading = useSelector(selectAddressesLoading);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    id: null,
    isLoading: false,
  });

  // ─── Fetch addresses on mount ──────────────────────
  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  // ─── Handlers ──────────────────────────────────────
  const handleDelete = (id) => {
    setConfirmDialog({ isOpen: true, id, isLoading: false });
  };

  const confirmDelete = async () => {
    const { id } = confirmDialog;
    if (!id) return;
    setConfirmDialog(prev => ({ ...prev, isLoading: true }));
    try {
      await dispatch(deleteAddress(id)).unwrap();
      // toast is already shown in the thunk
    } catch (error) {
      // error toast already shown
    } finally {
      setConfirmDialog({ isOpen: false, id: null, isLoading: false });
    }
  };

  const cancelDelete = () => {
    setConfirmDialog({ isOpen: false, id: null, isLoading: false });
  };

  const handleSetDefault = (id) => {
    dispatch(setDefaultAddress(id));
  };

  const handleSave = (data) => {
    if (editingAddress) {
      dispatch(updateAddress({ id: editingAddress._id, addressData: data }));
    } else {
      dispatch(addAddress(data));
    }
    setShowForm(false);
    setEditingAddress(null);
  };

  // ─── Real Pincode Fetch using India Post API ──────
  const fetchAddressByPincode = async (pincode) => {
    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );
      const data = await response.json();
      if (data[0]?.Status === 'Success') {
        const postOffice = data[0].PostOffice[0];
        return {
          address: postOffice.Name,
          city: postOffice.District,
          state: postOffice.State,
          pinCode: pincode,
          country: 'India',
        };
      }
      return null;
    } catch (error) {
      console.error('Pincode API error:', error);
      return null;
    }
  };

  const handlePincodeFetch = async () => {
    const cleanPincode = pincodeInput.replace(/\D/g, '');
    if (cleanPincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }
    setPincodeLoading(true);
    try {
      const result = await fetchAddressByPincode(cleanPincode);
      if (result) {
        const prefillData = {
          label: 'Other',
          fullName: '',
          phoneNumber: '',
          address: result.address,
          city: result.city,
          state: result.state,
          pinCode: result.pinCode,
          country: result.country,
          isDefault: false,
        };
        setEditingAddress(null);
        window.__prefillAddress = prefillData;
        setShowForm(true);
        toast.success('Address details fetched!');
      } else {
        toast.error('No address found for this pincode');
      }
    } catch {
      toast.error('Failed to fetch address');
    } finally {
      setPincodeLoading(false);
    }
  };

  // ─── Helpers ──────────────────────────────────────
  const getAddressIcon = (label) => {
    switch (label) {
      case 'Home':
        return Home;
      case 'Office':
      case 'Work':
        return Briefcase;
      case 'Parents Home':
        return Users;
      default:
        return Star;
    }
  };

  const getIconColor = (label) => {
    switch (label) {
      case 'Home':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
      case 'Office':
      case 'Work':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Parents Home':
        return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return `text-[#14C6D8] bg-[#E6F9FA] dark:bg-[#14C6D8]/20 dark:text-[#14C6D8]`;
    }
  };

  // ─── Render ──────────────────────────────────────
  if (loading && addresses.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 size={40} className="animate-spin text-[#14C6D8]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#18212A] dark:text-white tracking-tight">
            Saved Addresses
          </h1>
          <p className="text-sm text-[#5F6C7B] dark:text-[#5F6C7B] mt-0.5">
            Manage your shipping and delivery addresses
          </p>
        </div>
        <button
          onClick={() => {
            window.__prefillAddress = null;
            setEditingAddress(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#14C6D8] hover:bg-[#0FB2C3] text-white rounded-xl text-sm font-medium transition shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-[#14C6D8] focus:ring-offset-2"
        >
          <Plus size={18} /> Add Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState
          onAdd={() => {
            window.__prefillAddress = null;
            setEditingAddress(null);
            setShowForm(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => {
            const Icon = getAddressIcon(addr.label);
            const iconColor = getIconColor(addr.label);
            return (
              <motion.div
                key={addr._id || addr.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`relative bg-white dark:bg-[#18212A] rounded-2xl p-6 border ${
                  addr.isDefault
                    ? 'border-[#14C6D8]/40 dark:border-[#14C6D8]/40 shadow-md'
                    : 'border-[#E8EEF2] dark:border-[#18212A]/30 shadow-sm'
                } hover:shadow-lg transition-shadow duration-200 flex flex-col`}
              >
                {/* Default Badge */}
                {addr.isDefault && (
                  <div className="absolute top-4 left-5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#22C55E]/10 dark:bg-[#22C55E]/20 text-[#22C55E] dark:text-[#22C55E] border border-[#22C55E]/30 dark:border-[#22C55E]/30">
                      <Check size={12} /> Default
                    </span>
                  </div>
                )}

                {/* Card Content */}
                <div className="flex items-start gap-4 mt-1">
                  <div className={`p-3 rounded-xl ${iconColor} flex-shrink-0`}>
                    <Icon size={22} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#18212A] dark:text-white text-lg">
                      {addr.label === 'Office' ? 'Work' : addr.label}
                    </h3>
                    <p className="text-sm font-medium text-[#18212A] dark:text-white">
                      {addr.fullName || 'Name not set'}
                    </p>
                    <p className="text-sm text-[#5F6C7B] dark:text-[#5F6C7B]">
                      {addr.phoneNumber || 'Phone not set'}
                    </p>
                    <p className="text-sm text-[#5F6C7B] dark:text-[#5F6C7B] mt-2 leading-relaxed">
                      {addr.address}
                      <br />
                      {addr.city}, {addr.state} - {addr.pinCode}
                      <br />
                      {addr.country || 'India'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-[#E8EEF2] dark:border-[#18212A]/30">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        window.__prefillAddress = null;
                        setEditingAddress(addr);
                        setShowForm(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#5F6C7B] dark:text-[#5F6C7B] bg-[#F8FBFC] dark:bg-[#18212A]/50 hover:bg-[#E8EEF2] dark:hover:bg-[#18212A]/70 rounded-lg transition border border-[#E8EEF2] dark:border-[#18212A]/30"
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(addr._id || addr.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#EF4444] hover:bg-[#FEE2E2] dark:hover:bg-[#EF4444]/20 rounded-lg transition border border-[#E8EEF2] dark:border-[#18212A]/30"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr._id || addr.id)}
                      className="px-4 py-1.5 text-xs font-medium text-[#14C6D8] border border-[#14C6D8]/30 rounded-lg hover:bg-[#E6F9FA] dark:hover:bg-[#14C6D8]/20 transition"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Quick Pincode Fetch */}
      <div className="bg-[#E6F9FA] dark:bg-[#14C6D8]/10 border border-[#14C6D8]/30 rounded-2xl p-5 mt-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <MapPin size={22} className="text-[#14C6D8] flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-[#18212A] dark:text-white">
                Need an address added quickly?
              </h4>
              <p className="text-xs text-[#5F6C7B] dark:text-[#5F6C7B]">
                Use pincode to fetch address details automatically.
              </p>
            </div>
          </div>
          <div className="flex flex-1 items-center gap-3">
            <input
              type="text"
              placeholder="Enter Pincode"
              value={pincodeInput}
              onChange={(e) =>
                setPincodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              className="flex-1 min-w-[120px] px-4 py-2.5 bg-white dark:bg-[#18212A] border border-[#E8EEF2] dark:border-[#18212A]/30 rounded-xl text-sm focus:ring-2 focus:ring-[#14C6D8] focus:border-transparent outline-none text-[#18212A] dark:text-white"
            />
            <button
              onClick={handlePincodeFetch}
              disabled={pincodeLoading}
              className="px-5 py-2.5 bg-[#14C6D8] hover:bg-[#0FB2C3] text-white rounded-xl text-sm font-medium transition shadow-sm disabled:opacity-70 flex items-center gap-2 whitespace-nowrap"
            >
              {pincodeLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Check size={18} />
              )}
              Fetch Address
            </button>
          </div>
        </div>
      </div>

      {/* Address Form Modal */}
      <AnimatePresence>
        {showForm && (
          <AddressForm
            onClose={() => {
              setShowForm(false);
              setEditingAddress(null);
              window.__prefillAddress = null;
            }}
            onSave={handleSave}
            address={editingAddress}
          />
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Address"
        message="Are you sure you want to delete this address? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={confirmDialog.isLoading}
      />
    </div>
  );
};

// ----------------------------------------------
// Empty State
// ----------------------------------------------
const EmptyState = ({ onAdd }) => (
  <div className="text-center py-16 bg-white dark:bg-[#18212A] rounded-2xl border border-[#E8EEF2] dark:border-[#18212A]/30">
    <MapPin size={48} className="mx-auto text-[#5F6C7B]/40 dark:text-[#5F6C7B]/30 mb-3" />
    <h3 className="text-lg font-medium text-[#18212A] dark:text-white">
      No addresses saved
    </h3>
    <p className="text-sm text-[#5F6C7B] dark:text-[#5F6C7B] mt-1">
      Add your first delivery destination
    </p>
    <button
      onClick={onAdd}
      className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#14C6D8] hover:bg-[#0FB2C3] text-white rounded-xl text-sm font-medium transition shadow-sm"
    >
      <Plus size={18} /> Add Address
    </button>
  </div>
);

// ----------------------------------------------
// Address Form Modal (Brand Theme)
// ----------------------------------------------
const AddressForm = ({ onClose, onSave, address }) => {
  const getInitialData = () => {
    const prefill = window.__prefillAddress || null;
    if (prefill) {
      window.__prefillAddress = null;
      return prefill;
    }
    if (address) {
      return { ...address };
    }
    return {
      label: 'Home',
      fullName: '',
      phoneNumber: '',
      address: '',
      city: '',
      state: '',
      pinCode: '',
      country: 'India',
      isDefault: false,
    };
  };

  const [formData, setFormData] = useState(getInitialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    else if (formData.phoneNumber.replace(/\D/g, '').length < 10)
      newErrors.phoneNumber = 'Enter a valid phone number';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pinCode.trim()) newErrors.pinCode = 'Pin code is required';
    else if (formData.pinCode.replace(/\D/g, '').length !== 6)
      newErrors.pinCode = 'Enter a 6-digit pin code';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch {
      // error handled in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-[#18212A] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-[#E8EEF2] dark:border-[#18212A]/30"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-[#18212A] border-b border-[#E8EEF2] dark:border-[#18212A]/30 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-[#18212A] dark:text-white">
            {address ? 'Edit Address' : 'Add New Address'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#F8FBFC] dark:hover:bg-[#18212A]/50 transition text-[#5F6C7B]"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-[#18212A] dark:text-white mb-1">
              Label
            </label>
            <select
              name="label"
              value={formData.label}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-[#E8EEF2] dark:border-[#18212A]/30 rounded-xl bg-white dark:bg-[#18212A] text-[#18212A] dark:text-white text-sm focus:ring-2 focus:ring-[#14C6D8] focus:border-transparent"
            >
              <option value="Home">Home</option>
              <option value="Office">Office / Work</option>
              <option value="Parents Home">Parents Home</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#18212A] dark:text-white mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-[#18212A] text-[#18212A] dark:text-white text-sm focus:ring-2 focus:ring-[#14C6D8] focus:border-transparent ${
                  errors.fullName ? 'border-red-500' : 'border-[#E8EEF2] dark:border-[#18212A]/30'
                }`}
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#18212A] dark:text-white mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className={`w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-[#18212A] text-[#18212A] dark:text-white text-sm focus:ring-2 focus:ring-[#14C6D8] focus:border-transparent ${
                  errors.phoneNumber ? 'border-red-500' : 'border-[#E8EEF2] dark:border-[#18212A]/30'
                }`}
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-xs text-red-500">{errors.phoneNumber}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-[#18212A] dark:text-white mb-1">
              Address Line <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Flat, Building, Street, Landmark"
              className={`w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-[#18212A] text-[#18212A] dark:text-white text-sm focus:ring-2 focus:ring-[#14C6D8] focus:border-transparent ${
                errors.address ? 'border-red-500' : 'border-[#E8EEF2] dark:border-[#18212A]/30'
              }`}
            />
            {errors.address && (
              <p className="mt-1 text-xs text-red-500">{errors.address}</p>
            )}
          </div>

          {/* City / State / Pin */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#18212A] dark:text-white mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-[#18212A] text-[#18212A] dark:text-white text-sm focus:ring-2 focus:ring-[#14C6D8] focus:border-transparent ${
                  errors.city ? 'border-red-500' : 'border-[#E8EEF2] dark:border-[#18212A]/30'
                }`}
              />
              {errors.city && (
                <p className="mt-1 text-xs text-red-500">{errors.city}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#18212A] dark:text-white mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-[#18212A] text-[#18212A] dark:text-white text-sm focus:ring-2 focus:ring-[#14C6D8] focus:border-transparent ${
                  errors.state ? 'border-red-500' : 'border-[#E8EEF2] dark:border-[#18212A]/30'
                }`}
              />
              {errors.state && (
                <p className="mt-1 text-xs text-red-500">{errors.state}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#18212A] dark:text-white mb-1">
                Pin Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="pinCode"
                value={formData.pinCode}
                onChange={handleChange}
                placeholder="110017"
                className={`w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-[#18212A] text-[#18212A] dark:text-white text-sm focus:ring-2 focus:ring-[#14C6D8] focus:border-transparent ${
                  errors.pinCode ? 'border-red-500' : 'border-[#E8EEF2] dark:border-[#18212A]/30'
                }`}
              />
              {errors.pinCode && (
                <p className="mt-1 text-xs text-red-500">{errors.pinCode}</p>
              )}
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-[#18212A] dark:text-white mb-1">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="India"
              className="w-full px-4 py-2.5 border border-[#E8EEF2] dark:border-[#18212A]/30 rounded-xl bg-white dark:bg-[#18212A] text-[#18212A] dark:text-white text-sm focus:ring-2 focus:ring-[#14C6D8] focus:border-transparent"
            />
          </div>

          {/* Default Checkbox */}
          <div className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleChange}
              className="h-4 w-4 rounded border-[#E8EEF2] text-[#14C6D8] focus:ring-[#14C6D8]"
            />
            <label className="text-sm text-[#18212A] dark:text-white">
              Set as default address
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-[#E8EEF2] dark:border-[#18212A]/30">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-[#E8EEF2] dark:border-[#18212A]/30 rounded-xl text-[#5F6C7B] dark:text-[#5F6C7B] font-medium hover:bg-[#F8FBFC] dark:hover:bg-[#18212A]/50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-[#14C6D8] hover:bg-[#0FB2C3] text-white rounded-xl font-medium transition shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 size={18} className="animate-spin" />}
              {address ? 'Update Address' : 'Save Address'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Addresses;