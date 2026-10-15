// src/components/CustomizeTeaser.jsx
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import {
  TbSparkles,
} from "react-icons/tb";
import { FiArrowRight } from "react-icons/fi";

// ─── Brand Constants ──────────────────────────────────
const BRAND_CYAN = "#00C2D6";

const CustomizeTeaser = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  // ─── Sample Data ──────────────────────────────────────
  const samples = [
    {
      id: 1,
      name: "Cotton Candy Ombre",
      color: "#FFFFFF",
      image:
        "https://res.cloudinary.com/ghqmmyvr/image/upload/v1792041238/tumbler/products/roqpuzzybudlnbrr8m3z.jpg",
      label: "Name Engraving",
    },
    {
      id: 2,
      name: "Black Midnight Matte",
      color: "#FFD700",
      image:
        "https://res.cloudinary.com/ghqmmyvr/image/upload/v1792041285/tumbler/products/e1wt4ciqkhlkbixyghzh.jpg",
      label: "Name Engraving",
    },
    {
      id: 3,
      name: "LAVENDER MUSE",
      color: "#FFFFFF",
      image:
        "https://res.cloudinary.com/ghqmmyvr/image/upload/v1792042567/LAVENDER_MUSE_1.jpg",
      label: "Name Engraving",
    },
  ];

  // ─── Animation Variants ──────────────────────────────
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
  };

  const sampleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", damping: 16 },
    },
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
        {/* ─── Header ─── */}
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
            <span
              className="relative inline-block"
              style={{ color: BRAND_CYAN }}
            >
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
                  animate={
                    isInView ? { pathLength: 1, opacity: 1 } : {}
                  }
                  transition={{
                    duration: 0.8,
                    delay: 0.3,
                    ease: "easeInOut",
                  }}
                />
              </svg>
            </span>
          </h2>

          <p className="text-sm sm:text-base text-gray-500 font-medium max-w-xl mx-auto leading-relaxed px-2">
            Choose your colours, add a name, pick from custom typography,
            or upload your own artwork – make a tumbler that's undeniably you.
          </p>
        </motion.div>

        {/* ─── Sample Gallery ───────────────────────────────
            MOBILE  : grid-cols-2 with first card spanning 2 cols
                      → Row 1: Full-width card
                      → Row 2: Two cards side-by-side
            DESKTOP : sm:grid-cols-3 (same 3 cards in a row as before)
           ─────────────────────────────────────────────────── */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {samples.map((sample, index) => (
            <motion.div
              key={sample.id}
              variants={sampleVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className={`
                bg-white rounded-2xl sm:rounded-3xl p-1 sm:p-3
                border border-gray-100 shadow-sm hover:shadow-xl
                transition-all duration-300 group flex flex-col justify-between
                ${index === 0 ? "col-span-2 sm:col-span-1" : "col-span-1"}
              `}
            >
              <div
                className={`
                  relative bg-gradient-to-br from-[#F8FAFC] to-[#F1F3F5]
                  rounded-xl sm:rounded-2xl flex items-center justify-center p-1 overflow-hidden
                  ${index === 0 ? "h-56 sm:h-64" : "h-44 sm:h-64"}
                `}
              >
                <img
                  src={sample.image}
                  alt={sample.name}
                  className={`
                    object-contain transition-transform duration-500
                    group-hover:scale-105 drop-shadow-sm
                    ${index === 0 ? "h-44 sm:h-52" : "h-36 sm:h-52"}
                  `}
                  loading="lazy"
                  decoding="async"
                />
                {/* Tag */}
                <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-[#00C2D6]/10 text-[#00C2D6] text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full border border-[#00C2D6]/20">
                  {sample.label}
                </div>
              </div>

              <div className="p-2 sm:p-3 text-center space-y-0.5">
                <p
                  className={`
                    hidden sm:block font-bold text-gray-900
                    ${index === 0 ? "text-sm sm:text-sm" : "text-[12px] sm:text-sm"}
                    leading-tight
                  `}
                >
                  {sample.name}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-400 font-medium">
                  Custom engraved tumbler
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ─── Call to Action ─── */}
        <motion.div
          className="text-center space-y-4 pt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
        >
          <Link to="/customize" className="inline-block">
            <motion.button
              className="inline-flex items-center gap-3 bg-[#00C2D6] hover:bg-[#00A0B0] text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-2xl font-bold text-xs sm:text-sm md:text-base shadow-lg shadow-[#00C2D6]/25 transition-all duration-300 outline-none"
              whileHover={{
                scale: 1.03,
                boxShadow: "0 20px 40px -12px rgba(0,194,214,0.4)",
              }}
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