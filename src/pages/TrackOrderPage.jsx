// src/pages/TrackOrderPage.jsx
// Public track order page — no login required
// Uses order number + email/phone OR tracking number
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiPackage, FiSearch, FiMail, FiPhone, FiAlertCircle,
  FiCheckCircle, FiTruck, FiMapPin, FiClock, FiHash,
  FiUser, FiLogIn, FiShoppingBag,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import apiClient from '../api/client';
import SEO from '../components/SEO';

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  Processing: 'bg-blue-100 text-blue-700 border-blue-300',
  Shipped: 'bg-purple-100 text-purple-700 border-purple-300',
  Delivered: 'bg-green-100 text-green-700 border-green-300',
  Cancelled: 'bg-red-100 text-red-700 border-red-300',
  Returned: 'bg-gray-100 text-gray-700 border-gray-300',
};

const TrackOrderPage = () => {
  const [activeTab, setActiveTab] = useState('order'); // 'order' | 'tracking'

  const [orderForm, setOrderForm] = useState({
    orderNumber: '',
    contact: '',
    contactType: 'email',
  });

  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // ── Track by order number + email/phone ──
  const handleTrackByOrder = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!orderForm.orderNumber.trim()) {
      setError('Please enter your order number');
      return;
    }
    if (!orderForm.contact.trim()) {
      setError(`Please enter your ${orderForm.contactType}`);
      return;
    }

    setLoading(true);
    try {
      // Public endpoint — passes email/phone as verification
      const { data } = await apiClient.get(
        `/orders/track/${encodeURIComponent(orderForm.orderNumber.trim())}`,
        {
          params: {
            [orderForm.contactType]: orderForm.contact.trim(),
          },
        }
      );

      if (!data.success || !data.order) {
        throw new Error('Order not found');
      }
      setResult(data.order);
      toast.success('Order found!');
    } catch (err) {
      const msg =
        err.response?.status === 404
          ? 'Order not found. Please check your order number and email/phone.'
          : err.response?.data?.message || 'Order not found. Please check your details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Track by tracking number ──
  const handleTrackByTracking = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!trackingNumber.trim()) {
      setError('Please enter your tracking number');
      return;
    }

    setLoading(true);
    try {
      const { data } = await apiClient.get(
        `/orders/track-by-awb/${encodeURIComponent(trackingNumber.trim())}`
      );

      if (!data.success || !data.order) {
        throw new Error('Shipment not found');
      }
      setResult(data.order);
      toast.success('Shipment found!');
    } catch (err) {
      const msg =
        err.response?.status === 404
          ? 'Tracking number not found. Please check and try again.'
          : err.response?.data?.message || 'Tracking number not found.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Track Your Order — Smooth Sip"
        description="Track your Smooth Sip order in real time. No login required."
        type="website"
      />

      <div className="min-h-screen bg-gradient-to-b from-[#F8FBFC] to-white">
        {/* HERO */}
        <section className="pt-1 sm:pt-8 pb-5 text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Track Your Order
            </h1>
            <p className="mt-3 text-gray-600 text-sm sm:text-base">
              Enter your details below — no login required.
            </p>
          </div>
        </section>

        <section className="pb-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Tabs */}
              <div className="grid grid-cols-2 border-b border-gray-100">
                <button
                  onClick={() => { setActiveTab('order'); setError(''); setResult(null); }}
                  className={`py-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'order'
                      ? 'text-[#00C2D6] border-b-2 border-[#00C2D6] -mb-px'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FiHash size={14} /> Order Number
                </button>
                <button
                  onClick={() => { setActiveTab('tracking'); setError(''); setResult(null); }}
                  className={`py-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'tracking'
                      ? 'text-[#00C2D6] border-b-2 border-[#00C2D6] -mb-px'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FiTruck size={14} /> Tracking Number
                </button>
              </div>

              <div className="p-6 sm:p-8">
                <AnimatePresence mode="wait">
                  {activeTab === 'order' ? (
                    <motion.form
                      key="order-form"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleTrackByOrder}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                          Order Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FiHash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                          <input
                            type="text"
                            value={orderForm.orderNumber}
                            onChange={(e) => setOrderForm((p) => ({ ...p, orderNumber: e.target.value }))}
                            placeholder="e.g. ORD-XXXXX or SS-2026-12345"
                            className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#00C2D6] focus:ring-2 focus:ring-[#00C2D6]/20 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                          Verify with Email or Phone <span className="text-red-500">*</span>
                        </label>

                        <div className="flex gap-2 mb-2">
                          <button
                            type="button"
                            onClick={() => setOrderForm((p) => ({ ...p, contactType: 'email', contact: '' }))}
                            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                              orderForm.contactType === 'email'
                                ? 'bg-[#00C2D6] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <FiMail size={12} className="inline mr-1" /> Email
                          </button>
                          <button
                            type="button"
                            onClick={() => setOrderForm((p) => ({ ...p, contactType: 'phone', contact: '' }))}
                            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                              orderForm.contactType === 'phone'
                                ? 'bg-[#00C2D6] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <FiPhone size={12} className="inline mr-1" /> Phone
                          </button>
                        </div>

                        <div className="relative">
                          {orderForm.contactType === 'email' ? (
                            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                          ) : (
                            <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                          )}
                          <input
                            type={orderForm.contactType === 'email' ? 'email' : 'tel'}
                            value={orderForm.contact}
                            onChange={(e) => setOrderForm((p) => ({ ...p, contact: e.target.value }))}
                            placeholder={orderForm.contactType === 'email' ? 'you@example.com' : '+91 98765 43210'}
                            className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#00C2D6] focus:ring-2 focus:ring-[#00C2D6]/20 transition-all"
                          />
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          Use the same {orderForm.contactType} you used at checkout.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[#00C2D6] hover:bg-[#00A0B0] disabled:opacity-60 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Searching...
                          </>
                        ) : (
                          <>
                            <FiSearch size={16} /> Track Order
                          </>
                        )}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="tracking-form"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleTrackByTracking}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                          Tracking / AWB Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FiTruck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                          <input
                            type="text"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="e.g. 1234567890"
                            className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#00C2D6] focus:ring-2 focus:ring-[#00C2D6]/20 transition-all"
                          />
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          You'll find this in your shipping confirmation email.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[#00C2D6] hover:bg-[#00A0B0] disabled:opacity-60 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Searching...
                          </>
                        ) : (
                          <>
                            <FiSearch size={16} /> Track Shipment
                          </>
                        )}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2"
                  >
                    <FiAlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </motion.div>
                )}

                {/* Result */}
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 border-t border-gray-100 pt-6"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <FiCheckCircle className="text-green-500" size={18} />
                      <h3 className="font-bold text-gray-900">
                        Order {result.orderNumber}
                      </h3>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3 p-3 bg-[#F8FBFC] rounded-xl">
                        <FiClock className="text-[#00C2D6] mt-0.5" size={15} />
                        <div>
                          <p className="text-xs text-gray-500">Status</p>
                          <span className={`inline-block mt-1 text-xs px-2 py-1 rounded-full border font-semibold capitalize ${STATUS_COLORS[result.status] || 'bg-gray-100 text-gray-700 border-gray-300'}`}>
                            {result.status || 'Processing'}
                          </span>
                        </div>
                      </div>

                      {result.trackingNumber && (
                        <div className="flex items-start gap-3 p-3 bg-[#F8FBFC] rounded-xl">
                          <FiTruck className="text-[#00C2D6] mt-0.5" size={15} />
                          <div>
                            <p className="text-xs text-gray-500">Tracking Number</p>
                            <p className="font-mono text-gray-900">{result.trackingNumber}</p>
                          </div>
                        </div>
                      )}

                      {result.shippedDate && (
                        <div className="flex items-start gap-3 p-3 bg-[#F8FBFC] rounded-xl">
                          <FiMapPin className="text-[#00C2D6] mt-0.5" size={15} />
                          <div>
                            <p className="text-xs text-gray-500">Shipped On</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(result.shippedDate).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'long', year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                      )}

                      {result.deliveredDate && (
                        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                          <FiCheckCircle className="text-green-500 mt-0.5" size={15} />
                          <div>
                            <p className="text-xs text-gray-500">Delivered On</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(result.deliveredDate).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'long', year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Sign-in nudge for logged-out users */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 mb-3">Already have an account?</p>
              <Link
                to="/dashboard/orders"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#00C2D6]/40 text-[#00C2D6] hover:bg-[#E6F9FA] font-semibold rounded-xl transition-all text-sm"
              >
                <FiLogIn size={14} />
                Sign in to see all your orders
              </Link>
            </div>

            <div className="mt-6 text-center text-xs text-gray-500">
              Need help? Email{' '}
              <a href="mailto:support@smoothsip.in" className="text-[#00C2D6] font-semibold hover:underline">
                support@smoothsip.in
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default TrackOrderPage;