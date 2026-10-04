// src/pages/BulkOrders.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiPackage, FiUsers, FiGift, FiBriefcase,
  FiSend, FiCheckCircle, FiAlertCircle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { bulkInquiryService } from '../services/bulkInquiryService';
import SEO from '../components/SEO';

const SectionBadge = ({ children }) => (
  <span className="inline-block text-xs font-semibold text-[#00C2D6] uppercase tracking-wider bg-[#E6F9FA] px-3 py-1 rounded-full mb-4">
    {children}
  </span>
);

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const BulkOrders = () => {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '',
    inquiryType: 'bulk', quantity: '', message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Please enter your name';
    if (!form.email.trim()) errs.email = 'Please enter your email';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.phone.trim()) errs.phone = 'Please enter your phone number';
    else if (!/^[0-9+\-\s()]{7,20}$/.test(form.phone)) errs.phone = 'Enter a valid phone';
    if (!form.message.trim()) errs.message = 'Please describe your requirement';
    else if (form.message.trim().length < 10) errs.message = 'Add a bit more detail (min 10 chars)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const data = await bulkInquiryService.submit(form);
      toast.success(data.message || 'Inquiry sent!');
      setSubmitted(true);
      setForm({
        name: '', email: '', phone: '', company: '',
        inquiryType: 'bulk', quantity: '', message: '',
      });
      setTimeout(() => setSubmitted(false), 8000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inquiryTypes = [
    { value: 'bulk', label: 'Bulk Order', icon: FiPackage },
    { value: 'corporate', label: 'Corporate', icon: FiBriefcase },
    { value: 'gifting', label: 'Gifting', icon: FiGift },
    { value: 'collaboration', label: 'Collaboration', icon: FiUsers },
  ];

  const useCases = [
    { title: 'Corporate Gifting', desc: 'Premium tumblers with your company logo, delivered on-brand and on time.', icon: FiBriefcase },
    { title: 'Weddings & Events', desc: 'Custom-engraved tumblers for guests, bridesmaids, or anniversaries.', icon: FiGift },
    { title: 'Influencer Campaigns', desc: 'Product seeding and collab boxes that your audience will actually keep.', icon: FiUsers },
    { title: 'Brand Partnerships', desc: 'Co-branded merch or capsule collections that align with your story.', icon: FiPackage },
  ];

  return (
    <>
      <SEO
        title="Bulk & Custom Orders — Smooth Sip"
        description="Premium tumblers for corporate gifting, bulk orders, influencer campaigns and creative brand partnerships."
        type="website"
      />

      <div className="min-h-screen bg-gradient-to-b from-[#F8FBFC] to-white">
        {/* HERO */}
        <section className="relative overflow-hidden pt-12 sm:pt-20 pb-12 sm:pb-16">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#00C2D6]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#00C2D6]/5 rounded-full blur-3xl" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            <SectionBadge>Bulk & Custom Orders</SectionBadge>
            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-tight"
            >
              Need More Than One?
              <br />
              <span className="text-[#00C2D6]">We've Got You Covered.</span>
            </motion.h1>
            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.1 }}
              className="mt-5 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
            >
              Make Every Gift Remarkable. Whether it's corporate gifting, bulk
              orders, influencer campaigns, or creative brand partnerships — bring
              us your idea, and we'll build something valuable together.
            </motion.p>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
              className="mt-8 flex flex-wrap justify-center gap-3"
            >
              {['Bulk', 'Corporate', 'Gifting', 'Collaborations'].map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-1.5 bg-white border border-[#00C2D6]/30 text-[#00C2D6] text-sm font-semibold rounded-full shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* USE CASES */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {useCases.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    className="bg-[#F8FBFC] border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-[#00C2D6]/40 transition-all"
                  >
                    <div className="w-11 h-11 rounded-xl bg-white border border-[#00C2D6]/20 flex items-center justify-center text-[#00C2D6] mb-4">
                      <Icon size={20} />
                    </div>
                    <h3 className="font-bold text-gray-900 text-base mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FORM */}
        <section className="py-12 sm:py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Let's Talk
              </h2>
              <p className="mt-3 text-gray-600 text-sm sm:text-base">
                Share your requirement below. Our team will get back to you within 1–2 business days.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8"
            >
              {submitted ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                    <FiCheckCircle className="text-green-500" size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Inquiry Received</h3>
                  <p className="text-gray-600 text-sm max-w-md mx-auto">
                    Thank you for reaching out. We've sent a confirmation to your inbox and our team will contact you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Type chips */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      What are you looking for?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {inquiryTypes.map((type) => {
                        const Icon = type.icon;
                        const active = form.inquiryType === type.value;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setForm((p) => ({ ...p, inquiryType: type.value }))}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                              active
                                ? 'bg-[#00C2D6] text-white shadow-md shadow-[#00C2D6]/25'
                                : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            <Icon size={14} />
                            {type.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className={`w-full px-4 py-2.5 text-sm border rounded-xl outline-none transition-all ${
                          errors.name
                            ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                            : 'border-gray-200 focus:border-[#00C2D6] focus:ring-2 focus:ring-[#00C2D6]/20'
                        }`}
                      />
                      {errors.name && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                          <FiAlertCircle size={11} /> {errors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className={`w-full px-4 py-2.5 text-sm border rounded-xl outline-none transition-all ${
                          errors.email
                            ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                            : 'border-gray-200 focus:border-[#00C2D6] focus:ring-2 focus:ring-[#00C2D6]/20'
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                          <FiAlertCircle size={11} /> {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Phone + Company */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Phone / WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className={`w-full px-4 py-2.5 text-sm border rounded-xl outline-none transition-all ${
                          errors.phone
                            ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                            : 'border-gray-200 focus:border-[#00C2D6] focus:ring-2 focus:ring-[#00C2D6]/20'
                        }`}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                          <FiAlertCircle size={11} /> {errors.phone}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Company / Organisation
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={form.company}
                        onChange={handleChange}
                        placeholder="Optional"
                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#00C2D6] focus:ring-2 focus:ring-[#00C2D6]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Estimated Quantity
                    </label>
                    <input
                      type="text"
                      name="quantity"
                      value={form.quantity}
                      onChange={handleChange}
                      placeholder="e.g. 50–100 units"
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#00C2D6] focus:ring-2 focus:ring-[#00C2D6]/20 transition-all"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Tell us about your requirement <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows="5"
                      placeholder="Share your idea, timeline, budget or any specific customization needs..."
                      className={`w-full px-4 py-2.5 text-sm border rounded-xl outline-none transition-all resize-none ${
                        errors.message
                          ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                          : 'border-gray-200 focus:border-[#00C2D6] focus:ring-2 focus:ring-[#00C2D6]/20'
                      }`}
                    />
                    {errors.message && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <FiAlertCircle size={11} /> {errors.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#00C2D6] hover:bg-[#00A0B0] disabled:opacity-60 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FiSend size={16} />
                        Send Inquiry
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-400">
                    We reply within 1–2 business days. Your information is kept private.
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default BulkOrders;