// WhyChooseSection.jsx – Dynamic with banner API
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  FiBox,
  FiShield,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
  FiAward,
  FiClock,
  FiDroplet,
  FiZap,
  FiHeart,
  FiSmile,
  FiTrendingUp,
} from "react-icons/fi";
import { FaRecycle } from "react-icons/fa6";
import * as Icons from "react-icons/fi";
import { bannerService } from "../services/bannerService";

// ─── Static fallback slides ─────────────────────────────
const staticSlides = [
  {
    id: 1,
    heading: 'Why Choose <span class="text-[#14C6D8]">Tumbler?</span>',
    image: "https://res.cloudinary.com/dbkpwluh0/image/upload/v1783755632/ChatGPT_Image_Jul_11_2026_01_10_16_PM_ilivvu.png",
    features: [
      { icon: "FiBox", title: "Top Quality", subtitle: "Materials" },
      { icon: "FiShield", title: "Stylish & Modern", subtitle: "Designs" },
      { icon: "FiUser", title: "Perfect For", subtitle: "Every Lifestyle" },
      { icon: "FaRecycle", title: "Sustainable", subtitle: "& Reusable" },
    ],
  },
  {
    id: 2,
    heading: 'Premium <span class="text-[#14C6D8]">Performance</span>',
    image: "https://res.cloudinary.com/dbkpwluh0/image/upload/v1784353050/ChatGPT_Image_Jul_18_2026_11_07_14_AM_abspmv.png",
    features: [
      { icon: "FiClock", title: "24H Cold", subtitle: "12H Hot" },
      { icon: "FiDroplet", title: "Leak Proof", subtitle: "Design" },
      { icon: "FiAward", title: "Premium", subtitle: "SS304 Steel" },
      { icon: "FaRecycle", title: "Eco-Friendly", subtitle: "BPA Free" },
    ],
  },
  {
    id: 3,
    heading: 'Designed <span class="text-[#14C6D8]">For You</span>',
    image: "https://res.cloudinary.com/dbkpwluh0/image/upload/v1783754440/ChatGPT_Image_Jul_11_2026_12_50_07_PM_byqnmq.png",
    features: [
      { icon: "FiHeart", title: "Health First", subtitle: "BPA-Free" },
      { icon: "FiSmile", title: "Modern Look", subtitle: "Sleek Design" },
      { icon: "FiZap", title: "Versatile", subtitle: "Every Occasion" },
      { icon: "FiTrendingUp", title: "Value", subtitle: "Long Lasting" },
    ],
  },
  {
    id: 4,
    heading: 'Sustainability <span class="text-[#14C6D8]">Matters</span>',
    image: "https://res.cloudinary.com/dbkpwluh0/image/upload/v1784353235/ChatGPT_Image_Jul_18_2026_11_10_17_AM_jwrokc.png",
    features: [
      { icon: "FaRecycle", title: "Reusable", subtitle: "Eco-Friendly" },
      { icon: "FiBox", title: "Recyclable", subtitle: "Materials" },
      { icon: "FiShield", title: "Ethical", subtitle: "Production" },
      { icon: "FiAward", title: "Long Life", subtitle: "Durable" },
    ],
  },
];

// ─── Icon renderer with support for both Fi and Fa6 icons ──
const renderIcon = (iconName) => {
  if (!iconName) return null;
  if (iconName === "FaRecycle") return <FaRecycle />;
  const IconComponent = Icons[iconName];
  return IconComponent ? <IconComponent /> : null;
};

const WhyChooseSection = () => {
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(1);
  const sectionRef = useRef(null);
  const intervalRef = useRef(null);

  // ─── Refs for stable values ──────────────────────────────
  const currentIndexRef = useRef(currentIndex);
  const totalSlidesRef = useRef(0);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const slides = banner?.content?.slides || staticSlides;
  totalSlidesRef.current = slides.length;

  // ─── Navigation functions ──────────────────────────────────
  const goToSlide = useCallback((index) => {
    setDirection(index > currentIndexRef.current ? 1 : -1);
    setCurrentIndex(index);
  }, []);

  const nextSlide = useCallback(() => {
    const next = (currentIndexRef.current + 1) % totalSlidesRef.current;
    goToSlide(next);
  }, [goToSlide]);

  const prevSlide = useCallback(() => {
    const prev = (currentIndexRef.current - 1 + totalSlidesRef.current) % totalSlidesRef.current;
    goToSlide(prev);
  }, [goToSlide]);

  // ─── Autoplay (stable interval) ──────────────────────────
  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = setInterval(() => {
        nextSlide();
      }, 4000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAutoPlaying, nextSlide]);

  // ─── Hover handlers ──────────────────────────────────────
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  // ─── Fetch banner data ──────────────────────────────────
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await bannerService.getActiveBanners({ section: "whychoose" });
        if (res.banners.length > 0) setBanner(res.banners[0]);
      } catch (err) {
        console.error("Failed to fetch whychoose banner:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBanner();
  }, []);

  // ─── Animation variants ──────────────────────────────
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", damping: 25, stiffness: 120 },
    },
    exit: (direction) => ({
      x: direction > 0 ? -80 : 80,
      opacity: 0,
      transition: { duration: 0.3 },
    }),
  };

  const featureVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", damping: 14 },
    },
  };

  const iconHoverVariants = {
    hover: { scale: 1.1, rotate: 5, transition: { type: "spring", stiffness: 300 } },
  };

  if (loading) return <div className="h-96 bg-gray-100 animate-pulse" />;

  return (
    <section
      ref={sectionRef}
      className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10 md:py-12 bg-gradient-to-b from-white to-[#f7fafc] overflow-hidden"
    >
      <div className="max-w-[1500px] mx-auto">
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#E6F9FA] border border-[#00C2D6]/20 shadow-sm min-h-[320px] sm:min-h-[380px] md:min-h-[360px] flex flex-col lg:flex-row"
            >
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#14C6D8]/5 rounded-full blur-3xl pointer-events-none" />

              {/* ─── Left Content ─────────────────────────── */}
              <div className="relative z-20 w-full lg:w-[58%] px-5 sm:px-8 md:px-12 lg:px-14 py-8 sm:py-10 md:py-12">
                <h2
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold text-gray-900 tracking-[-0.5px] sm:tracking-[-1px] leading-tight"
                  dangerouslySetInnerHTML={{ __html: slides[currentIndex].heading }}
                />
                <motion.div
                  className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-y-8 md:grid-cols-4 md:gap-y-10 mt-8 sm:mt-10"
                  initial="hidden"
                  animate="visible"
                  key={currentIndex}
                >
                  {slides[currentIndex].features.map((item, idx) => (
                    <motion.div
                      key={idx}
                      className="relative flex flex-col items-center text-center px-2 sm:px-3"
                      variants={featureVariants}
                      whileHover="hover"
                    >
                      {idx !== 0 && (
                        <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-[90px] bg-gradient-to-b from-transparent via-[#14C6D8]/30 to-transparent" />
                      )}
                      <motion.div
                        className="text-[#14C6D8] bg-white p-3 sm:p-4 rounded-full text-2xl sm:text-3xl md:text-[38px] mb-3 sm:mb-4 shadow-sm"
                        variants={iconHoverVariants}
                      >
                        {typeof item.icon === 'string' ? renderIcon(item.icon) : item.icon}
                      </motion.div>
                      <h3 className="text-sm sm:text-base font-semibold text-gray-800 leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 leading-tight mt-0.5 sm:mt-1">
                        {item.subtitle}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* ─── Right Image ───────────────────────────── */}
              <div className="relative w-full lg:w-[42%] min-h-[200px] sm:min-h-[280px] md:min-h-[320px] overflow-hidden">
                <img
                  src={slides[currentIndex].image}
                  alt="Premium Tumbler"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  loading="lazy"
                />
                <div className="absolute inset-y-0 left-0 w-16 sm:w-24 lg:w-28 bg-gradient-to-r from-[#E6F9FA] via-[#E6F9FA]/80 to-transparent pointer-events-none hidden lg:block" />
                <div className="absolute inset-x-0 top-0 h-16 sm:h-20 bg-gradient-to-b from-[#E6F9FA] via-[#E6F9FA]/80 to-transparent pointer-events-none lg:hidden" />
              </div>

              {/* ─── Slide counter ───────────────────────── */}
              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-30 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold text-gray-500 border border-gray-100 shadow-sm">
                {currentIndex + 1} / {totalSlidesRef.current}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* ─── Navigation arrows ────────────────────── */}
          <button
            onClick={prevSlide}
            className="absolute -left-2 sm:-left-3 md:-left-5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-600 hover:text-[#14C6D8] hover:border-[#14C6D8] transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#14C6D8] focus:ring-offset-2"
            aria-label="Previous slide"
          >
            <FiChevronLeft className="text-base sm:text-xl md:text-2xl" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute -right-2 sm:-right-3 md:-right-5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-600 hover:text-[#14C6D8] hover:border-[#14C6D8] transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#14C6D8] focus:ring-offset-2"
            aria-label="Next slide"
          >
            <FiChevronRight className="text-base sm:text-xl md:text-2xl" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;