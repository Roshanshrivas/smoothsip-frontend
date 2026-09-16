import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import { FiTruck, FiGift, FiArrowRight } from 'react-icons/fi';

const TopOffersBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const dismissed = localStorage.getItem('topOffersDismissed');
    if (dismissed === 'true') setIsVisible(false);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('topOffersDismissed', 'true');
  };

  // Desktop static content
  const desktopContent = (
    <div className="flex items-center justify-center gap-3 text-center">
      <FiGift className="text-base sm:text-lg animate-pulse" />
      <p className="text-xs sm:text-sm font-semibold tracking-wide">
        50% OFF + Code:{" "}
        <span className="font-mono bg-white/20 px-1.5 py-0.5 rounded">
          SIP50
        </span>{" "}
        | Free Shipping on ₹499+
      </p>
      <a
        href="/allproducts"
        className="group inline-flex items-center gap-1.5 text-[13px] font-bold text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl transition-all duration-200"
      >
        Shop Now
        <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-200" />
      </a>
    </div>
  );

  // Mobile auto‑scrolling ticker (marquee)
  const mobileTicker = (
    <div className="relative overflow-hidden whitespace-nowrap">
      <div
        ref={scrollRef}
        className="inline-flex animate-scroll"
        style={{
          animation: 'scroll 15s linear infinite',
        }}
      >
        <span className="inline-flex items-center gap-3 px-4">
          <FiTruck className="text-xs" />
          <span>🔥 50% OFF – Use Code: SIP50</span>
          <span className="mx-2">•</span>
          <FiGift className="text-sm" />
          <span>Free Shipping above ₹499</span>
          <span className="mx-2">•</span>
          <a href="/allproducts"
            className="group inline-flex items-center gap-1.5 text-[11px] font-semibold text-white bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-all duration-200"
          > Shop Now
           <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-200" />
          </a>
        </span>
        {/* Duplicate for seamless loop */}
        <span className="inline-flex items-center gap-3 px-4">
          <FiTruck className="text-sm" />
          <span>🔥 50% OFF – Use Code: SIP50</span>
          <span className="mx-2">•</span>
          <FiGift className="text-sm" />
          <span>Free Shipping above ₹499</span>
          <span className="mx-2">•</span>
          <a href="/allproducts"
            className="group inline-flex items-center gap-1.5 text-[11px] font-semibold text-white bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-all duration-200"
          >
            Shop Now
            <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-200" />
          </a>
        </span>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative w-full bg-gradient-to-r from-[#14C6D8] to-[#09B0BE] text-white shadow-md z-40"
        >
          {/* Container with different content based on screen size */}
          <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3">
            {/* Desktop & Tablet: static centered content */}
            <div className="hidden sm:block">{desktopContent}</div>
            {/* Mobile: scrolling ticker */}
            <div className="block sm:hidden">{mobileTicker}</div>
          </div>
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition p-1 z-10 bg-black/20 rounded-full w-6 h-6 flex items-center justify-center"
            aria-label="Close"
          >
            <IoClose size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


export default TopOffersBar;