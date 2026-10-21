// src/components/MobileEcommerceUI.jsx
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Edit3 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const CLOUDINARY_VIDEO =
  "https://res.cloudinary.com/ghqmmyvr/video/upload/v1792047921/herovdos.mp4";

const CLOUDINARY_POSTER =
  "https://res.cloudinary.com/ghqmmyvr/image/upload/q_auto:good,f_auto,w_800/v1779263583/ChatGPT_Image_May_20_2026_01_20_45_PM_bmblvd.png";

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
  const shouldReduceMotion = useReducedMotion();
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <section className="relative w-full h-[100svh] min-h-[600px] overflow-hidden bg-[#09AFBD]/18">
      {/* Video with Cloudinary URL + poster */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={CLOUDINARY_POSTER}
        className="absolute inset-0 w-full h-full object-cover object-center"
      >
        <source src={CLOUDINARY_VIDEO} type="video/mp4" />
      </video>

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/65" />

      {/* Content */}
      <motion.div
        className="relative z-10 h-full flex flex-col justify- px-4 sm:px-8 pt-14 pb-1"
        initial="hidden"
        animate="visible"
        variants={!shouldReduceMotion ? containerVariants : {}}
      >
        <motion.h1
          variants={itemVariants}
          className="
            mt-14 ssm:mt-12
            text-[34px]
            ssm:text-[38px]
            sssm:text-[38px]
            ssssm:text-[36px]
            xs:text-[42px]
            sm:text-[48px]
            leading-[1.30] sm:leading-[1.35]
            font-bold
            tracking-[-0.3px] ssm:tracking-[-0.5px] sm:tracking-[-1px]
            text-white drop-shadow-lg max-w-full
          "
        >
          From a{" "}
          <span className="text-[#14C6D8] relative inline-block">
            Mom's
            <span className="absolute -bottom-0.5 sm:-bottom-1 left-0 w-full h-[2px] sm:h-[3px] bg-[#14C6D8]/50 rounded-full"></span>
          </span>
          <br/>
          Heart to{" "} 
          <span className="text-[#14C6D8]">Your Everyday.</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mt-5 text-white/90 text-[15px] font-medium leading-relaxed max-w-[340px] drop-shadow"
        >
          Meet Smooth Sip — your everyday companion, thoughtfully crafted with
          premium-grade craftsmanship and loving care.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col gap-3.5 mt-8">
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
    </section>
  );
}