// src/components/TopOffersBar.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import { FiTruck, FiGift, FiArrowRight, FiTag } from 'react-icons/fi';

// Small dot separator — matches the offer rhythm
const Dot = () => (
  <span className="w-1 h-1 rounded-full bg-white/60 shrink-0" aria-hidden="true" />
);

// One full set of offers. Rendered twice for the seamless loop.
// Uses a Fragment so the parent's flex gap spaces each item evenly.
const OfferItems = () => (
  <>
    <span className="inline-flex items-center gap-1.5 sm:gap-2 shrink-0">
      <FiTag className="text-xs sm:text-sm shrink-0" />
      <span className="text-xs sm:text-sm font-semibold tracking-wide">
        50% OFF — Use Code:{' '}
        <span className="font-mono bg-white/25 px-1.5 py-0.5 rounded">
          SIP50
        </span>
      </span>
    </span>
    <Dot />

    <span className="inline-flex items-center gap-1.5 sm:gap-2 shrink-0">
      <FiTruck className="text-xs sm:text-sm shrink-0" />
      <span className="text-xs sm:text-sm font-semibold tracking-wide">
        Free Shipping on orders above ₹499
      </span>
    </span>
    <Dot />

    <span className="inline-flex items-center gap-1.5 sm:gap-2 shrink-0">
      <FiGift className="text-xs sm:text-sm shrink-0" />
      <span className="text-xs sm:text-sm font-semibold tracking-wide">
        Extra 10% off on your first order
      </span>
    </span>
    <Dot />

    <a
      href="/allproducts"
      className="group inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-white bg-white/20 hover:bg-white/35 px-3 py-1 rounded-lg transition-colors duration-200 shrink-0"
    >
      Shop Now
      <FiArrowRight className="group-hover:translate-x-0.5 transition-transform duration-200" />
    </a>
    <Dot />
  </>
);

const TopOffersBar = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('topOffersDismissed') === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('topOffersDismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="
            relative w-full overflow-hidden z-40
            bg-gradient-to-r from-[#14C6D8] via-[#0FB2C3] to-[#14C6D8]
            text-white shadow-md
          "
        >
          {/* ── Marquee viewport (reserves space for close button on right) ── */}
          <div className="flex items-center h-8 sm:h-10 pr-9 sm:pr-10">
            <div
              className="
                flex items-center gap-6 sm:gap-10
                whitespace-nowrap will-change-transform
                animate-scroll
                hover:[animation-play-state:paused]
              "
              style={{ animationDuration: '20s' }}
            >
              {/* Two identical rows → seamless -50% translateX loop */}
              <OfferItems />
              <OfferItems />
            </div>
          </div>

          {/* ── Close button ── */}
          <button
            onClick={handleDismiss}
            aria-label="Dismiss offer bar"
            className="
              absolute right-1.5 top-1/2 -translate-y-1/2 z-10
              w-6 h-6 rounded-full
              flex items-center justify-center
              bg-black/25 hover:bg-black/40
              text-white/90 hover:text-white
              transition-colors
            "
          >
            <IoClose size={13} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TopOffersBar;