import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  ArrowRight,
  User,
  Building,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";
import { FaFacebook, FaInstagramSquare, FaTwitterSquare, FaYoutube } from "react-icons/fa";
import { contactService } from '../services/contactService';


// ==============================================
// BRAND COLOR
// ==============================================
const BRAND_TEAL = "#00C2D6";
const BRAND_HOVER = "#00A0B0";

// ==============================================
// ANIMATION VARIANTS
// ==============================================
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 25 },
  },
};

// ==============================================
// REUSABLE COMPONENT
// ==============================================
const SectionBadge = ({ text }) => (
  <span className="inline-block text-xs font-semibold text-[#00C2D6] uppercase tracking-wider bg-[#E6F9FA] dark:bg-[#00C2D6]/20 px-3 py-1 rounded-full mb-4">
    {text}
  </span>
);

// ==============================================
// FAQ ACCORDION COMPONENT
// ==============================================
const FAQItem = ({ question, answer, isOpen, onToggle }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900 hover:border-[#00C2D6]/40 dark:hover:border-[#00C2D6]/40 transition-all"
  >
    <button
      onClick={onToggle}
      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
    >
      <span className="font-medium text-gray-900 dark:text-white pr-4">{question}</span>
      {isOpen ? (
        <ChevronUp size={18} className="text-[#00C2D6] flex-shrink-0" />
      ) : (
        <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />
      )}
    </button>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="px-6 pb-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
      >
        {answer}
      </motion.div>
    )}
  </motion.div>
);

// ==============================================
// MAIN COMPONENT
// ==============================================
const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!formData.subject.trim()) errors.subject = "Subject is required";
    if (!formData.message.trim()) errors.message = "Message is required";
    if (formData.message.trim().length < 10) {
      errors.message = "Message must be at least 10 characters";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setIsSubmitting(true);
  try {
    const data = await contactService.submitContactForm(formData);
    toast.success(data.message || 'Your message has been sent!');
    setIsSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setFormErrors({});
    setTimeout(() => setIsSubmitted(false), 5000);
  } catch (error) {
    const errorMsg =
      error.response?.data?.message || 'Failed to send message. Please try again.';
    toast.error(errorMsg);
  } finally {
    setIsSubmitting(false);
  }
};

  const faqs = [
    {
      id: 1,
      question: "What are your business hours?",
      answer: "We are open Monday through Saturday from 10:00 AM to 7:00 PM. We are closed on Sundays and major public holidays.",
    },
    {
      id: 2,
      question: "How long does shipping take?",
      answer: "Standard shipping typically takes 3-5 business days. Express shipping is available for 1-2 business days. You'll receive a tracking number once your order ships.",
    },
    {
      id: 3,
      question: "Can I customize my tumbler?",
      answer: "Yes! We offer custom text engraving, logo printing, and color customization. Visit our Customize page to design your perfect tumbler.",
    },
    {
      id: 4,
      question: "What is your return policy?",
      answer: "We offer a 30-day hassle-free return policy on all unused products in original packaging. For customized items, returns are handled on a case-by-case basis.",
    },
    {
      id: 5,
      question: "Do you ship internationally?",
      answer: "Yes, we ship to over 30 countries worldwide. Shipping costs and delivery times vary by destination. Contact us for a specific quote.",
    },
  ];

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "support@tumblerstudio.com",
      sub: "We reply within 24 hours",
    },
    {
      icon: Phone,
      label: "Phone",
      value: "+91 98765 43210",
      sub: "Mon–Sat, 10 AM – 7 PM",
    },
    {
      icon: MapPin,
      label: "Address",
      value: "Sector 62, Noida",
      sub: "Uttar Pradesh, India - 201301",
    },
    {
      icon: Clock,
      label: "Business Hours",
      value: "Mon–Sat: 10 AM – 7 PM",
      sub: "Sunday: Closed",
    },
  ];

  const socialLinks = [
    { icon: FaInstagramSquare, label: "Instagram", href: "#" },
    { icon: FaFacebook, label: "Facebook", href: "#" },
    { icon: FaTwitterSquare, label: "Twitter", href: "#" },
    { icon: FaYoutube, label: "YouTube", href: "#" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-white to-gray-50/80 dark:from-gray-900 dark:to-gray-950"
    >
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden pt-20 pb-16 bg-white dark:bg-gray-900">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#00C2D6]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#00C2D6]/10 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <SectionBadge text="Contact Us" />
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
              We'd Love to <span className="text-[#00C2D6]">Hear From You</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Have questions, feedback, or want to collaborate? Reach out to us – we're
              here to help and would love to connect.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== CONTACT FORM + INFO ===== */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ===== CONTACT FORM ===== */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Send Us a Message
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Fill in the details below and we'll get back to you as soon as possible.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 border ${
                          formErrors.name ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                        } rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00C2D6] focus:border-transparent outline-none transition-all`}
                        placeholder="John Doe"
                      />
                    </div>
                    {formErrors.name && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={12} /> {formErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 border ${
                          formErrors.email ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                        } rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00C2D6] focus:border-transparent outline-none transition-all`}
                        placeholder="john@example.com"
                      />
                    </div>
                    {formErrors.email && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={12} /> {formErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 border ${
                        formErrors.subject ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                      } rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00C2D6] focus:border-transparent outline-none transition-all`}
                      placeholder="How can we help you?"
                    />
                  </div>
                  {formErrors.subject && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={12} /> {formErrors.subject}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    className={`w-full px-4 py-2.5 border ${
                      formErrors.message ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                    } rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00C2D6] focus:border-transparent outline-none transition-all resize-none`}
                    placeholder="Write your message here..."
                  />
                  {formErrors.message && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={12} /> {formErrors.message}
                    </p>
                  )}
                  <p className="mt-1.5 text-xs text-gray-400">
                    {formData.message.length} characters (minimum 10)
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isSubmitted}
                  className="w-full sm:w-auto px-8 py-3 bg-[#00C2D6] hover:bg-[#00A0B0] disabled:bg-[#00C2D6]/50 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : isSubmitted ? (
                    <>
                      <CheckCircle size={18} /> Sent!
                    </>
                  ) : (
                    <>
                      <Send size={18} /> Send Message
                    </>
                  )}
                </button>

                {isSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-300 text-sm flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Your message was sent successfully! We'll get back to you soon.
                  </motion.div>
                )}
              </form>
            </motion.div>

            {/* ===== CONTACT INFO ===== */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="space-y-4"
            >
              {contactInfo.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={idx}
                    variants={scaleIn}
                    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-all hover:border-[#00C2D6]/40 dark:hover:border-[#00C2D6]/40 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-[#E6F9FA] dark:bg-[#00C2D6]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#E6F9FA] dark:group-hover:bg-[#00C2D6]/30 transition-colors">
                        <Icon className="w-5 h-5 text-[#00C2D6]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {item.label}
                        </p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {item.value}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {item.sub}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Social Links */}
              <motion.div
                variants={scaleIn}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm"
              >
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Follow Us
                </p>
                <div className="flex gap-3">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-[#00C2D6] hover:text-white transition-all hover:scale-105"
                        aria-label={social.label}
                      >
                        <Icon size={18} />
                      </a>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== MAP / LOCATION SECTION ===== */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Find Us Here
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Visit our store or reach out to us at our headquarters.
              </p>
            </div>
            <div className="relative h-64 md:h-80 bg-gray-200 dark:bg-gray-800">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.639929740043!2d77.318653775735!3d28.58151977569374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce44c6c0ffd73%3A0xc3be4c3f5b607ff9!2sSector%2062%2C%20Noida%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Tumbler Studio Location"
                className="w-full h-full"
              />
              <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-900 rounded-lg shadow-lg px-4 py-2 border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  📍 Sector 62, Bhopal M.P.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FAQ SECTION ===== */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <SectionBadge text="FAQs" />
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              Find quick answers to common questions about our products and services.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-3"
          >
            {faqs.map((faq) => (
              <FAQItem
                key={faq.id}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === faq.id}
                onToggle={() => toggleFAQ(faq.id)}
              />
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mt-8"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Still have questions?{" "}
              <a
                href="mailto:support@tumblerstudio.com"
                className="text-[#00C2D6] hover:text-[#00A0B0] font-medium transition"
              >
                Contact our support team
              </a>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-16 bg-gradient-to-r from-[#00C2D6] to-[#0098A8] dark:from-[#0098A8] dark:to-[#008F9E] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJIMjR2LTJoMTJ6TTM2IDI0djJIMjR2LTJoMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Let's Create Something Amazing Together
            </h2>
            <p className="text-[#D6F5F8] text-lg max-w-2xl mx-auto mb-8">
              Whether you have a question, a collaboration idea, or just want to say hi
              – we're always excited to hear from you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="mailto:support@tumblerstudio.com"
                className="px-8 py-3 bg-white text-[#00C2D6] hover:bg-[#E6F9FA] rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Mail size={18} /> Email Us
              </a>
              <a
                href="#"
                className="px-8 py-3 border-2 border-white text-white hover:bg-white/10 rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                <MessageCircle size={18} /> Live Chat
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Contact;