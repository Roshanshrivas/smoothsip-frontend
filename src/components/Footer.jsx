import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiYoutube,
  FiMail,
  FiPhone,
  FiMapPin,
  FiArrowRight,
} from "react-icons/fi";
import { TbHeartHandshake } from "react-icons/tb";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "Customize", path: "/customize" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const supportLinks = [
    { name: "FAQ", path: "/faq" },
    { name: "Shipping Info", path: "/shipping" },
    { name: "Returns", path: "/returns" },
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
  ];

  const socialLinks = [
    { icon: <FiFacebook />, url: "https://facebook.com", label: "Facebook", color: "#1877F2" },
    { icon: <FiTwitter />, url: "https://twitter.com", label: "Twitter", color: "#1DA1F2" },
    { icon: <FiInstagram />, url: "https://instagram.com", label: "Instagram", color: "#E4405F" },
    { icon: <FiYoutube />, url: "https://youtube.com", label: "YouTube", color: "#FF0000" },
  ];

  const paymentMethods = [
    "Visa", "Mastercard", "PayPal", "Razorpay", "Google Pay", "PhonePe"
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 12 } },
  };
  const brandVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", damping: 15 } },
  };
  const bottomVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.5 } },
  };

  return (
    <footer ref={sectionRef} className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Brand Column */}
          <motion.div variants={brandVariants} className="space-y-4">
            <Link to="/" className="inline-block">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-white tracking-tight">
                  Smooth<span className="text-[#14C6D8]"> Sip</span>
                </span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Premium insulated tumblers designed for your daily hydration. 
              Customize your own and sip in style.
            </p>
            <div className="flex space-x-3 pt-2">
              {socialLinks.map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors duration-300"
                  whileHover={{ scale: 1.1, backgroundColor: social.color }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-[#14C6D8] hover:font-bold transition text-sm inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div variants={itemVariants}>
            <h3 className="text-white font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-[#14C6D8] hover:font-bold  transition text-sm inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact & Newsletter */}
          <motion.div variants={itemVariants}>
            <h3 className="text-white font-semibold text-lg mb-4">Get in Touch</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <FiMapPin className="mt-0.5 flex-shrink-0 text-[#14C6D8]" />
                <span>123 Tumbler Street, Mumbai, India</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <FiMail className="flex-shrink-0 text-[#14C6D8]" />
                <a href="mailto:hello@tumblerco.com" className="hover:text-[#14C6D8] transition">
                  hello@tumblerco.com
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <FiPhone className="flex-shrink-0 text-[#14C6D8]" />
                <a href="tel:+911234567890" className="hover:text-[#14C6D8] transition">
                  +91 12345 67890
                </a>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">Subscribe for offers</p>
              <form className="flex" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-md text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#09AFC0] transition"
                />
                <motion.button
                  type="submit"
                  className="px-3 py-2 bg-[#14C6D8] text-white rounded-r-md hover:bg-[#09AFC0] transition"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiArrowRight size={18} />
                </motion.button>
              </form>
            </div>
          </motion.div>
        </motion.div>

        {/* Payment Methods & Copyright */}
        <motion.div
          className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          variants={bottomVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div className="flex flex-wrap justify-center gap-2">
            {paymentMethods.map((method) => (
              <motion.span
                key={method}
                className="px-3 py-1 bg-gray-800 text-gray-400 text-xs rounded-full cursor-default"
                whileHover={{ scale: 1.05, backgroundColor: "#09AFC0", color: "#fff" }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {method}
              </motion.span>
            ))}
          </div>
          <div className="text-center text-sm text-gray-500">
            © {currentYear} SmoothSip. All rights reserved. | 
            <span className="inline-flex items-center gap-1 mx-1">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.5 }}
              >
                <TbHeartHandshake size={14} className="text-[#09AFC0]" />
              </motion.span>
              Designed with care
            </span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;