// src/components/TrendingSection.jsx
import React, { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import { productService } from "../services/productService";

// ─── Fallback static data ──────────────────────────
const fallbackProducts = [
  // ... (your original Trending products array)
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
  // ... add all the others
];

const TrendingSection = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const scrollRef = useRef(null);
  const autoScrollInterval = useRef(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setIsLoading(true);
        const data = await productService.getProducts({ tag: "TRENDING", limit: 8 });
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        } else {
          setProducts(fallbackProducts);
        }
      } catch (error) {
        console.error("Failed to fetch trending:", error);
        setProducts(fallbackProducts);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrending();
  }, []);

  // ─── Carousel logic (original) ──────────────────────
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 15);
    }
  };

  const startAutoScroll = () => {
    if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
    autoScrollInterval.current = setInterval(() => {
      if (!isPaused && scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
        }
      }
    }, 5000);
  };

  useEffect(() => {
    startAutoScroll();
    return () => {
      if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
    };
  }, [isPaused]);

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      checkScrollButtons();
      container.addEventListener("scroll", checkScrollButtons);
      window.addEventListener("resize", checkScrollButtons);
      return () => {
        container.removeEventListener("scroll", checkScrollButtons);
        window.removeEventListener("resize", checkScrollButtons);
      };
    }
  }, [products]);

  // ─── Drag handlers ──────────────────────────────────
  const handleDragStart = (e) => {
    const pageX = e.pageX ?? e.touches[0]?.pageX;
    if (!pageX) return;
    setIsDragging(true);
    setStartX(pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    setIsPaused(true);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const pageX = e.pageX ?? e.touches[0]?.pageX;
    if (!pageX) return;
    e.preventDefault();
    const x = pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setIsPaused(false);
  };

  // ─── Animation variants ──────────────────────────────
  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 12 } },
  };

  const cardContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", damping: 12 } },
  };

  if (isLoading) {
    return (
      <div className="w-full py-12 md:py-20 bg-gradient-to-b from-blue-50/40 via-white to-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-40">
            <div className="w-8 h-8 border-4 border-[#00C2D6] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <section ref={sectionRef} className="w-full py-2 sm:py-12 bg-gradient-to-b from-blue-50/40 via-white to-white overflow-hidden">
      <div className="w-full mx-auto px-3 sm:px-4 lg:px-6">
        <motion.div
          className="flex flex-row sm:flex-row justify-between items-center mb-5 sm:mb-10 gap-4"
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="text-left">
            <h2 className="text-[21px] sm:text-3xl md:text-4xl font-bold text-gray-900">Trending Now</h2>
            {/* <p className="text-gray-500 mt-1 text-sm md:text-base">See what's hot in the world of tumblers</p> */}
          </div>
          <motion.button
            onClick={() => navigate("/allproducts")}
            className="flex items-center text-[12px] sm:text-[14px] gap-1 sm:gap-2 sm:border border-gray-200 sm:px-5 sm:py-2.5 rounded-full text-[#00C2D6] sm:text-gray-700 font-medium hover:bg-gray-900 hover:text-white transition-all"
            whileHover={{ scale: 1.02, backgroundColor: "#111", color: "#fff" }}
            whileTap={{ scale: 0.98 }}
          >
            View all <FiChevronRight className="text-sm" />
          </motion.button>
        </motion.div>

        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <AnimatePresence>
            {showLeftArrow && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all -ml-4 lg:-ml-5 cursor-pointer"
              >
                <FiChevronLeft size={22} />
              </motion.button>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {showRightArrow && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all -mr-4 lg:-mr-5 cursor-pointer"
              >
                <FiChevronRight size={22} />
              </motion.button>
            )}
          </AnimatePresence>

          <motion.div
            ref={scrollRef}
            className="flex overflow-x-auto gap-5 pb-6 scroll-smooth hide-scrollbar cursor-grab active:cursor-grabbing"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            variants={cardContainerVariants}
            initial="visible"
            animate="visible"
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            {products.map((product) => (
              <motion.div
                key={product.id}
                className="min-w-[200px] sm:min-w-[270px] md:min-w-[275px] flex-shrink-0 w-full max-w-[275px]"
                variants={cardVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <ProductCard product={product} displayTag="TRENDING" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;