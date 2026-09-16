import React, { useEffect, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  FiTruck,
  FiRefreshCw,
  FiLock,
  FiAward,
  FiPhoneCall,
} from "react-icons/fi";

const bannerData = [
  { icon: <FiTruck />, title: "Free Shipping", subtitle: "Orders above ₹999" },
  { icon: <FiRefreshCw />, title: "7 Days Returns", subtitle: "No questions asked" },
  { icon: <FiLock />, title: "Safe Checkout", subtitle: "Secure payments" },
  { icon: <FiAward />, title: "Premium Quality", subtitle: "Built to last" },
  { icon: <FiPhoneCall />, title: "24/7 Support", subtitle: "We're here" },
];

// ─── Animation Variants ──────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 15, stiffness: 100 },
  },
};

const mobileItemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

// ─── Main Component ──────────────────────────────────
const FeaturesBanner = () => {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  return (
    <section
      ref={sectionRef}
      className="w-full bg-gradient-to-b from-white to-gray-50/80 border-y border-gray-100/80 py-4 md:py-8 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ─── Mobile: Horizontal Scroll ────────────── */}
        <div className="block md:hidden">
          <motion.div
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            initial="hidden"
            animate={isInView && !shouldReduceMotion ? "visible" : "hidden"}
            variants={containerVariants}
          >
            {bannerData.map((item, index) => (
              <motion.div
                key={index}
                variants={mobileItemVariants}
                whileTap={{ scale: 0.97 }}
                className="flex-shrink-0 w-[160px] snap-start bg-white rounded-2xl shadow-sm border border-gray-100/80 px-4 py-3.5 flex items-center gap-3 transition-all duration-300 hover:shadow-md"
              >
                <div className="text-[#14C6D8] text-2xl">{item.icon}</div>
                <div>
                  <h3 className="text-xs font-bold text-gray-800">{item.title}</h3>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
          <div className="flex justify-center mt-2">
            <span className="text-[9px] text-gray-300 font-medium tracking-wide">
              ← swipe →
            </span>
          </div>
        </div>

        {/* ─── Tablet & Desktop: Grid ──────────────────── */}
        <motion.div
          className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-6"
          initial="hidden"
          animate={isInView && !shouldReduceMotion ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {bannerData.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.02 }}
              className="flex items-center justify-center gap-4 p-3 rounded-2xl bg-white/50 backdrop-blur-sm border border-transparent hover:border-[#14C6D8]/20 hover:bg-white hover:shadow-md transition-all duration-300 group cursor-default"
            >
              <div className="text-[#14C6D8] text-3xl group-hover:scale-110 group-hover:text-[#09AFBD] transition-all duration-300">
                {item.icon}
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-gray-800 group-hover:text-[#14C6D8] transition-colors">
                  {item.title}
                </h3>
                <p className="text-[12px] text-gray-400 font-medium group-hover:text-gray-500 transition-colors">
                  {item.subtitle}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ─── Hide Scrollbar (for Chrome/Safari) ──────── */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default FeaturesBanner;