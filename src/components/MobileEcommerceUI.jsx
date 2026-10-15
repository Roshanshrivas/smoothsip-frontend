// src/components/MobileEcommerceUI.jsx
import React, { useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Edit3 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import herovideo from "../assets/herovdos.mp4";

// Animation variants (same as desktop)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function MobileEcommerceUI() {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const videoRef = useRef(null);

  // Autoplay video on mount (some mobile browsers need explicit play)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked — fallback image will stay visible
      });
    }
  }, []);

  return (
    <section className="relative w-full h-[100svh] min-h-[600px] overflow-hidden bg-[#09AFBD]/18">
      {/* ═══════════════════════════════════════════
          Background: Full-Screen Video
         ═══════════════════════════════════════════ */}
      {/* Fallback image (visible until video loads) */}
      <img
        src="https://res.cloudinary.com/dbkpwluh0/image/upload/v1779263583/ChatGPT_Image_May_20_2026_01_20_45_PM_bmblvd.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="eager"
      />

      {/* Video overlay */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover object-center"
      >
        <source src={herovideo} type="video/mp4" />
      </video>

      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/65" />

      {/* ═══════════════════════════════════════════
          Content Overlay
         ═══════════════════════════════════════════ */}
      <motion.div
        className="relative z-10 h-full flex flex-col justify-center px-4 sm:px-8 pt-1 pb-1"
        initial="hidden"
        animate="visible"
        variants={!shouldReduceMotion ? containerVariants : {}}
      >
        {/* Badge */}
        {/* <motion.div variants={itemVariants}>
          <div className="inline-flex items-center rounded-full border border-[#14C6D8] bg-white/15 backdrop-blur-md px-3.5 py-1.5 shadow-sm">
            <span className="text-white text-[10px] font-bold tracking-wider uppercase">
              ✨ Premium Quality
            </span>
          </div>
        </motion.div> */}

        {/* Heading — same text as desktop */}
        <motion.h1
          variants={itemVariants}
          className="mt-5 text-[38px] sm:text-[44px] leading-[1.15] font-bold tracking-[-1.5px] text-white drop-shadow-lg"
        >
          From a{" "}
          <span className="text-[#14C6D8] relative inline-block">
            Mom's
            <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-[#14C6D8]/50 rounded-full"></span>
          </span>
          <br />
          Heart to{" "}
          <span className="text-[#14C6D8]">Your Everyday.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={itemVariants}
          className="mt-5 text-white/90 text-[15px] font-medium leading-relaxed max-w-[340px] drop-shadow"
        >
          Meet Smooth Sip — your everyday companion, thoughtfully crafted with
          premium-grade craftsmanship and loving care.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col gap-3.5 mt-8"
        >
          <Link
            to="/allproducts"
            className="w-full h-[58px] rounded-2xl bg-[#14C6D8] hover:bg-[#09B0BE] text-white font-bold text-[16px] flex items-center justify-center gap-2.5 transition-all duration-300 shadow-lg shadow-[#14C6D8]/35 active:scale-[0.98]"
          >
            Shop Now <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
          </Link>

          <Link
            to="/customize"
            className="w-full h-[58px] rounded-2xl border-2 border-white bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-bold text-[16px] flex items-center justify-center gap-2.5 transition-all duration-300 active:scale-[0.98]"
          >
            <Edit3 className="w-5 h-5" strokeWidth={2.5} /> Personalize It
          </Link>
        </motion.div>
      </motion.div>

      {/* Bottom fade to white (transition into page below) */}
      {/* <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white/90 to-transparent pointer-events-none" /> */}
    </section>
  );
}