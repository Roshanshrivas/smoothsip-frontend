// src/components/CustomizeTeaser.jsx
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import {
  TbPalette,
  TbLetterT,
  TbTypography,
  TbSticker,
  TbRuler,
  TbPackage,
  TbSparkles,
  TbCheck,
  TbClock,
} from "react-icons/tb";
import {
  FiArrowRight,
  FiStar,
  FiTrendingUp,
  FiShield,
  FiSmile,
} from "react-icons/fi";

import tumblerBlack from "../assets/tumblerimg.png";
import tumblerOrange from "../assets/tumblerorangee.png";
import tumblerWhite from "../assets/tumblerwhite.png";

// ─── Brand Constants ──────────────────────────────────
const BRAND_CYAN = "#00C2D6";
const BRAND_HOVER = "#00A0B0";

const CustomizeTeaser = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  // ─── Sample Data ──────────────────────────────────────
  const samples = [
    {
      id: 1,
      name: "Roshan's Custom",
      text: "Roshan",
      color: "#FFFFFF",
      image: tumblerBlack,
      label: "Name Engraving",
    },
    {
      id: 2,
      name: "Priya's Rose Gold",
      text: "Priya ♥",
      color: "#FFD700",
      image: tumblerOrange,
      label: "Custom Text + Icon",
    },
    {
      id: 3,
      name: "Amit's Quote",
      text: "Stay Hydrated",
      color: "#FFFFFF",
      image: tumblerWhite,
      label: "Motivational Quote",
    },
  ];

  // ─── Features ────────────────────────────────────────
  const features = [
    { icon: <TbPalette />, text: "10+ Colors", desc: "Matte, gloss, metallic" },
    { icon: <TbLetterT />, text: "Personalized Text", desc: "Name, quote, or message" },
    { icon: <TbTypography />, text: "Custom Fonts", desc: "10+ styles to choose" },
    { icon: <TbSticker />, text: "Artwork / Icons", desc: "Upload your own design" },
    { icon: <TbRuler />, text: "4 Sizes", desc: "16oz – 40oz available" },
    { icon: <TbPackage />, text: "Accessories", desc: "Lids, straws, sleeves" },
  ];

  // ─── Animation Variants ──────────────────────────────
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 15, stiffness: 100 } },
  };

  const sampleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 16 } },
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  };

  return (
    <section
      ref={sectionRef}
      className="w-full bg-gradient-to-b from-[#E6F9FA]/60 via-white to-[#E6F9FA]/30 py-12 sm:py-16 md:py-20 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">
        {/* ─── Header ────────────────────────────────────── */}
        <motion.div
          className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-[#E6F9FA] border border-[#00C2D6]/20 text-[#00C2D6] px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-wider uppercase"
            variants={badgeVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <TbSparkles className="w-3 h-3 sm:w-4 sm:h-4" /> Create Your Signature
          </motion.div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-950 tracking-tight leading-tight">
            Design Your Own{" "}
            <span className="relative inline-block" style={{ color: BRAND_CYAN }}>
              Tumbler
              <svg
                className="absolute -bottom-2 left-0 w-full h-2"
                viewBox="0 0 200 10"
                fill="currentColor"
                style={{ color: BRAND_CYAN }}
              >
                <motion.path
                  d="M0,5 Q50,0 100,5 T200,5"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
                  transition={{ duration: 0.8, delay: 0.3, ease: "easeInOut" }}
                />
              </svg>
            </span>
          </h2>

          <p className="text-sm sm:text-base text-gray-500 font-medium max-w-xl mx-auto leading-relaxed px-2">
            Choose your colours, add a name, pick from custom typography,
            or upload your own artwork – make a tumbler that's undeniably you.
          </p>
        </motion.div>

        {/* ─── Sample Gallery (Horizontally Scrollable on Mobile) ── */}
        <div className="space-y-4 sm:space-y-6">
          <motion.div
            className="flex items-center justify-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wider"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
          >
            <FiTrendingUp style={{ color: BRAND_CYAN }} />
            <span>What Others Are Creating</span>
          </motion.div>

          {/* ─── Scrollable container ───────────────────── */}
          <div className="relative">
            {/* Gradient fade indicators on mobile */}
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none sm:hidden" />
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none sm:hidden" />

            <motion.div
              className="flex sm:grid sm:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 max-w-5xl mx-auto px-1 sm:px-0 scroll-smooth"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
              }}
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              {/* Hide scrollbar on all browsers */}
              <style jsx>{`
                .scroll-smooth::-webkit-scrollbar {
                  display: none;
                }
              `}</style>

              {samples.map((sample) => (
                <motion.div
                  key={sample.id}
                  variants={sampleVariants}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="flex-shrink-0 w-[260px] sm:w-full bg-white rounded-3xl p-3 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
                >
                  <div className="relative bg-gradient-to-br from-[#F8FAFC] to-[#F1F3F5] rounded-2xl h-56 sm:h-64 flex items-center justify-center p-4 overflow-hidden">
                    <img
                      src={sample.image}
                      alt={sample.name}
                      className="h-44 sm:h-52 object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-sm"
                      loading="lazy"
                    />
                    {/* Customization preview badge */}
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md rounded-full px-2.5 sm:px-3 py-1 text-[9px] sm:text-[10px] font-bold text-[#00C2D6] shadow-md border border-gray-100/50 flex items-center gap-1">
                      <TbCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> “{sample.text}”
                    </div>
                    {/* Tag */}
                    <div className="absolute top-3 left-3 bg-[#00C2D6]/10 text-[#00C2D6] text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full border border-[#00C2D6]/20">
                      {sample.label}
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 text-center space-y-0.5">
                    <p className="font-bold text-sm text-gray-900">{sample.name}</p>
                    <p className="text-xs text-gray-400 font-medium">Custom engraved tumbler</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Scroll hint for mobile */}
          <motion.p
            className="text-center text-[10px] text-gray-400 font-medium sm:hidden"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
          >
            ← Swipe to see more →
          </motion.p>
        </div>

        {/* ─── Features Grid (Horizontally Scrollable on Mobile) ── */}
        <div className="relative">
          {/* Gradient fade on mobile */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none sm:hidden" />
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none sm:hidden" />

          <motion.div
            className="flex sm:grid sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 max-w-5xl mx-auto px-1 sm:px-0 scroll-smooth"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {features.map((feat, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -6, transition: { duration: 0.15 } }}
                className="flex-shrink-0 w-[140px] sm:w-full flex flex-col items-center text-center p-3 sm:p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group cursor-default"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#E6F9FA] text-[#00C2D6] flex items-center justify-center text-2xl sm:text-3xl group-hover:bg-[#00C2D6] group-hover:text-white transition-all duration-300 mb-2 sm:mb-2.5">
                  {feat.icon}
                </div>
                <p className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-[#00C2D6] transition-colors leading-tight">
                  {feat.text}
                </p>
                <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium mt-0.5">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ─── Call to Action ────────────────────────────── */}
        <motion.div
          className="text-center space-y-4 pt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
        >
          <Link to="/customize" className="inline-block">
            <motion.button
              className="inline-flex items-center gap-3 bg-[#00C2D6] hover:bg-[#00A0B0] text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-2xl font-bold text-xs sm:text-sm md:text-base shadow-lg shadow-[#00C2D6]/25 transition-all duration-300 outline-none"
              whileHover={{ scale: 1.03, boxShadow: "0 20px 40px -12px rgba(0,194,214,0.4)" }}
              whileTap={{ scale: 0.97 }}
            >
              Start Customizing Now
              <FiArrowRight className="text-base sm:text-lg transition-transform group-hover:translate-x-1" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CustomizeTeaser;