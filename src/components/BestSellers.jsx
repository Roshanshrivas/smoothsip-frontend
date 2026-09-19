// src/components/BestSellers.jsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import { productService } from "../services/productService";

// ─── Fallback ──────────────────────────────────────
const fallbackProducts = [
  {
    id: 1,
    image: "https://res.cloudinary.com/dbkpwluh0/image/upload/v1779190990/imgi_1001_8901372268840_2_p0mioc.jpg",
    title: "Matte Black 24oz",
    price: 600,
    oldPrice: 750,
    rating: 5,
    reviews: 128,
    bg: "#fff5f2",
    discount: 20,
  },
  {
    id: 2,
    image: "https://res.cloudinary.com/dbkpwluh0/image/upload/v1779190990/imgi_1001_8901372268840_2_p0mioc.jpg",
    title: "Matte Black 24oz",
    price: 600,
    oldPrice: 750,
    rating: 5,
    reviews: 128,
    bg: "#fff5f2",
    discount: 20,
  },
];

// ─── Timing ────────────────────────────────────────
const isTouchDevice =
  typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;
const AUTOPLAY_INTERVAL = isTouchDevice ? 3500 : 4500;   // faster on mobile
const RESUME_DELAY      = 5000;                          // resume after user stops
const GAP_PX            = 20;                            // matches gap-5

// ─── Skeleton card ─────────────────────────────────
const SkeletonCard = () => (
  <div className="flex-shrink-0 basis-[78%] xs:basis-[60%] sm:basis-[46%] md:basis-[31%] lg:basis-[23%] xl:basis-[18.5%]">
    <div className="w-full rounded-2xl bg-white shadow-sm overflow-hidden">
      <div
        className="aspect-square bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%]"
        style={{ animation: "shimmer 1.6s linear infinite" }}
      />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
      </div>
    </div>
  </div>
);

const BestSellers = () => {
  const navigate = useNavigate();

  const [products, setProducts]   = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canScrollLeft, setLeft]  = useState(false);
  const [canScrollRight, setRight] = useState(false);

  const scrollRef   = useRef(null);
  const autoTimer   = useRef(null);
  const resumeTimer = useRef(null);
  const pausedRef   = useRef(false);

  // ─── Fetch ────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await productService.getProducts({ tag: "BEST SELLER", limit: 8 });
        if (cancelled) return;
        setProducts(data.products?.length ? data.products : fallbackProducts);
      } catch {
        if (!cancelled) setProducts(fallbackProducts);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ─── Arrow visibility ────────────────────────────
  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setLeft(el.scrollLeft > 4);
    setRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [products, updateArrows]);

  // ─── Helpers ─────────────────────────────────────
  const getStep = () => {
    const el = scrollRef.current;
    if (!el) return 300;
    const first = el.firstElementChild;
    return (first ? first.getBoundingClientRect().width : 280) + GAP_PX;
  };

  const clearTimers = () => {
    if (autoTimer.current)   { clearTimeout(autoTimer.current); autoTimer.current = null; }
    if (resumeTimer.current) { clearTimeout(resumeTimer.current); resumeTimer.current = null; }
  };

  const pauseAuto = useCallback(() => {
    pausedRef.current = true;
    if (autoTimer.current) clearTimeout(autoTimer.current);
  }, []);

  const scheduleResume = useCallback(() => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => { pausedRef.current = false; }, RESUME_DELAY);
  }, []);

  // ─── Autoplay — runs on ALL devices ─────────────
  useEffect(() => {
    if (isLoading || products.length === 0) return;

    const tick = () => {
      const el = scrollRef.current;

      if (!el || pausedRef.current) {
        autoTimer.current = setTimeout(tick, AUTOPLAY_INTERVAL);
        return;
      }

      const step  = getStep();
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - step * 0.6;

      el.scrollBy({ left: atEnd ? -el.scrollWidth : step, behavior: "smooth" });

      autoTimer.current = setTimeout(tick, AUTOPLAY_INTERVAL);
    };

    autoTimer.current = setTimeout(tick, AUTOPLAY_INTERVAL);
    return () => { if (autoTimer.current) clearTimeout(autoTimer.current); };
  }, [isLoading, products.length]);

  useEffect(() => () => clearTimers(), []);

  // ─── Arrow click ─────────────────────────────────
  const scrollByCard = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    pauseAuto();
    el.scrollBy({ left: dir === "left" ? -getStep() : getStep(), behavior: "smooth" });
    scheduleResume();
  };

  // ─── Desktop mouse drag only (touch handled natively) ───
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: false, id: null });

  const onPointerDown = (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = scrollRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, startLeft: el.scrollLeft, moved: false, id: e.pointerId };
    el.style.cursor = "grabbing";
    el.style.userSelect = "none";
    try { el.setPointerCapture(e.pointerId); } catch {}
    pauseAuto();
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d.active) return;
    const el = scrollRef.current;
    if (!el) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 4) d.moved = true;
    el.scrollLeft = d.startLeft - dx;
  };

  const endDrag = () => {
    const d = drag.current;
    if (!d.active) return;
    const el = scrollRef.current;
    if (el) {
      el.style.cursor = "";
      el.style.userSelect = "";
      try { el.releasePointerCapture(d.id); } catch {}
    }
    d.active = false;
    scheduleResume();
  };

  const onClickCapture = (e) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  return (
    <section className="w-full py-4 sm:py-12 bg-[#e6f7ff]/30 overflow-hidden">
      <div className="w-full mx-auto px-3 sm:px-4 lg:px-6">

        {/* Header */}
        <motion.div
          className="flex flex-row justify-between items-center mb-5 sm:mb-10 gap-4"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ type: "spring", damping: 14 }}
        >
          <div className="text-left">
            <h2 className="text-[25px] sm:text-3xl md:text-4xl font-bold md:font-extrabold text-gray-900">
              Best <span className="text-[#02B5D1]">Sellers</span>
            </h2>
            <p className="text-gray-500 mt-1 text-sm md:text-base hidden md:block">
              Top picks from our happy customers
            </p>
          </div>

          <motion.button
            onClick={() => navigate("/allproducts")}
            className="flex items-center text-[12px] sm:text-[14px] gap-1 sm:gap-2 sm:border border-[#02B5D1] sm:px-5 sm:py-2.5 rounded-full text-[#00a8bb] sm:text-[#02B5D1] font-medium hover:bg-gray-900 hover:text-white transition-all"
            whileHover={{ scale: 1.02, backgroundColor: "#111", color: "#fff" }}
            whileTap={{ scale: 0.98 }}
          >
            View all<FiChevronRight className="text-sm" />
          </motion.button>
        </motion.div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={pauseAuto}
          onMouseLeave={scheduleResume}
        >
          {/* Left arrow */}
          <AnimatePresence>
            {canScrollLeft && (
              <motion.button
                key="left"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }}
                onClick={() => scrollByCard("left")}
                aria-label="Scroll left"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 hidden sm:flex items-center justify-center hover:bg-gray-900 hover:text-white transition-colors -ml-3 lg:-ml-5"
              >
                <FiChevronLeft size={22} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Right arrow */}
          <AnimatePresence>
            {canScrollRight && (
              <motion.button
                key="right"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.18 }}
                onClick={() => scrollByCard("right")}
                aria-label="Scroll right"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 hidden sm:flex items-center justify-center hover:bg-gray-900 hover:text-white transition-colors -mr-3 lg:-mr-5"
              >
                <FiChevronRight size={22} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Track */}
          <div
            ref={scrollRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onClickCapture={onClickCapture}
            onTouchStart={pauseAuto}
            onTouchEnd={scheduleResume}
            className="flex gap-5 overflow-x-auto pb-6 hide-scrollbar cursor-grab active:cursor-grabbing"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
              overscrollBehaviorX: "contain",
              willChange: "scroll-position",
            }}
          >
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
              : products.map((product, i) => (
                  <motion.div
                    key={product.id || product._id || i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut", delay: Math.min(i * 0.05, 0.3) }}
                    className="flex-shrink-0 basis-[78%] xs:basis-[60%] sm:basis-[46%] md:basis-[31%] lg:basis-[23%] xl:basis-[18.5%]"
                  >
                    <ProductCard product={product} displayTag="BEST SELLER" />
                  </motion.div>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BestSellers;