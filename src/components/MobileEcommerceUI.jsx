
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const CLOUDINARY_VIDEO =
  "https://res.cloudinary.com/ghqmmyvr/video/upload/v1792047921/herovdos.mp4";

const CLOUDINARY_POSTER =
  "https://res.cloudinary.com/ghqmmyvr/image/upload/q_auto:good,f_auto,w_800/v1779263583/ChatGPT_Image_May_20_2026_01_20_45_PM_bmblvd.png";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function MobileEcommerceUI() {
  const shouldReduceMotion = useReducedMotion();
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const animationProps = shouldReduceMotion
    ? {}
    : {
        variants: itemVariants,
      };

  return (
    <section
      aria-labelledby="smoothsip-hero-title"
      className="
        relative isolate flex min-h-[380px] w-full
        min-h-[100svh] flex-col overflow-hidden
        bg-[#101A20] text-white
        sm:min-h-[720px]
      "
    >
      {/* Poster is immediately available while video loads */}
      <img
        src={CLOUDINARY_POSTER}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        decoding="async"
        className="
          absolute inset-0 -z-30 h-full w-full
          object-cover object-center
        "
      />

      {/* Background video */}
      {!videoFailed && (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster={CLOUDINARY_POSTER}
          aria-hidden="true"
          tabIndex={-1}
          onCanPlay={() => setVideoReady(true)}
          onError={() => setVideoFailed(true)}
          className={`
            absolute inset-0 -z-20 h-full w-full
            object-cover object-center
            transition-opacity duration-700
            ${videoReady ? "opacity-100" : "opacity-0"}
          `}
        >
          <source src={CLOUDINARY_VIDEO} type="video/mp4" />
        </video>
      )}

      {/* Contrast overlay */}
      <div
        aria-hidden="true"
        className="
          absolute inset-0 -z-10
          bg-gradient-to-b
          from-[#07141A]/65
          via-[#07141A]/35
          to-[#07141A]/85
        "
      />

      {/* Subtle brand-color glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute -right-32 top-1/4
          -z-10 h-72 w-72 rounded-full
          bg-[#14C6D8]/15 blur-[90px]
        "
      />

      {/* Main content */}
      <motion.div
        initial={shouldReduceMotion ? false : "hidden"}
        animate="visible"
        variants={
          shouldReduceMotion ? undefined : containerVariants
        }
        className="
          mx-auto flex w-full max-w-7xl flex-1
          flex-col justify-center
          px-5 pb-12 pt-24
          sm:px-10 sm:pb-16 sm:pt-28
          lg:px-16
        "
      >
        <div className="max-w-xl">
          {/* Headline */}
          <motion.h1
            {...animationProps}
            id="smoothsip-hero-title"
            className="
              mt-7 max-w-[540px]
              text-[clamp(2.7rem,10vw,4.5rem)]
              font-extrabold leading-[1.20]
              tracking-[-0.035em]
              text-white
              [text-wrap:balance]
            "
          >
            From a{" "}
            <span className="relative inline-block text-[#48DCE7]">
              Mom's
              <span
                aria-hidden="true"
                className="
                  absolute -bottom-1 left-0 h-[3px]
                  w-3/4 rounded-full
                  bg-[#48DCE7]
                "
              />
            </span>
            <br />
            Heart to Your
            <br />
            Everyday<span className="text-[#48DCE7]">.</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            {...animationProps}
            className="
              mt-6 max-w-[390px]
              text-[15px] leading-7
              text-white/80
              sm:text-base sm:leading-8
            "
          >
            Meet SmoothSip — your everyday companion,
            thoughtfully crafted to bring a little more
            comfort and joy to every sip.
          </motion.p>

          {/* Calls to action */}
          <motion.div
            {...animationProps}
            className="
              mt-8 grid w-full max-w-[390px]
              grid-cols-1 gap-3
              min-[380px]:grid-cols-2
            "
          >
            <Link
              to="/allproducts"
              className="
                group inline-flex min-h-[54px]
                items-center justify-center gap-2
                rounded-2xl bg-[#14C6D8]
                px-5 py-3.5
                text-[15px] font-bold text-[#ffffff]
                shadow-lg shadow-[#14C6D8]/20
                transition-colors duration-200
                hover:bg-[#48DCE7]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#48DCE7]
                focus-visible:ring-offset-2
                focus-visible:ring-offset-[#101A20]
                active:scale-[0.98]
              "
            >
              Shop Collection
              <ArrowRight
                size={18}
                strokeWidth={2.5}
                aria-hidden="true"
                className="
                  transition-transform duration-200
                  group-hover:translate-x-1
                "
              />
            </Link>

            <Link
              to="/customize"
              className="
                inline-flex min-h-[54px]
                items-center justify-center gap-2
                rounded-2xl border border-white/35
                bg-white/[0.08] px-5 py-3.5
                text-[15px] font-semibold text-white
                backdrop-blur-md
                transition-colors duration-200
                hover:bg-white/[0.16]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-white
                focus-visible:ring-offset-2
                focus-visible:ring-offset-[#101A20]
                active:scale-[0.98]
              "
            >
              Personalize It
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom fade for a seamless transition */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-x-0 bottom-0
          h-16 bg-gradient-to-t
          from-[#101A20]/40 to-transparent
        "
      />
    </section>
  );
}
