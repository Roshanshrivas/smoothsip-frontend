// src/components/CategorySection.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Coffee,
  Plane,
  Dumbbell,
  Sparkles,
  CupSoda,
  Loader2,
} from "lucide-react";
import { publicCategoryService } from "../services/publicCategoryService";

// ─── Fallback icons for categories ──────────────────
const iconMap = {
  "Insulated Tumblers": <CupSoda size={18} />,
  "Travel Tumblers": <Plane size={18} />,
  "Sports Tumblers": <Dumbbell size={18} />,
  "Coffee Tumblers": <Coffee size={18} />,
  "Limited Edition": <Sparkles size={18} />,
};

const CategorySection = () => {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await publicCategoryService.getCategories();
        const transformed = data.map((cat) => ({
          id: cat._id, // ✅ mapped
          title: cat.name,
          description: cat.description,
          image: cat.image,
          icon: iconMap[cat.name] || <CupSoda size={18} />,
        }));
        setCategories(transformed);
      } catch (err) {
        console.error(err);
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);


  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", damping: 14, stiffness: 90 },
    },
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/allproducts?category=${categoryId}`);
  };

  const handleViewAll = () => {
    navigate("/allproducts");
  };


   // ─── Loading State ──────────────────────────────────
  if (loading) {
    return (
      <section className="w-full bg-white py-14 overflow-hidden px-4">
        <div className="w-full mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mt-6 text-[#111]">
                Shop By Category
              </h2>
            </div>
          </div>
          <div className="flex justify-center items-center h-64">
            <Loader2 size={40} className="animate-spin text-[#14C6D8]" />
          </div>
        </div>
      </section>
    );
  }

  // ─── Error State ────────────────────────────────────
  if (error) {
    return (
      <section className="w-full bg-white py-14 overflow-hidden px-4">
        <div className="w-full mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mt-6 text-[#111]">
                Shop By Category
              </h2>
            </div>
          </div>
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-[#14C6D8] hover:underline"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ─── No Categories ──────────────────────────────────
  if (categories.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="w-full bg-white py-14 overflow-hidden px-4"
    >
      <div className="w-full mx-auto px-4 md:px-6">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mt-6 text-[#111]">
              Shop By Category
            </h2>
          </div>
          {/* Desktop "View all" button – updated to teal */}
          <button
            onClick={handleViewAll}
            className="hidden md:flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-[#14C6D8] hover:text-white hover:border-[#14C6D8] transition-all duration-300 shadow-sm hover:shadow-md group"
            aria-label="View all categories"
          >
            View All
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform duration-300"
            />
          </button>
        </div>

        {/* ─── Desktop Grid ───────────────────────────────────── */}
        <motion.div
          className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {categories.map((category) => (
            <motion.div
              key={category.id}
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ type: "spring", damping: 15 }}
              onClick={() => handleCategoryClick(category.id)}
              className="
                relative
                h-[350px]
                w-full
                rounded-[22px]
                overflow-hidden
                group
                cursor-pointer
                shadow-sm
                hover:shadow-2xl
                transition-all duration-300
                focus:outline-none focus:ring-2 focus:ring-[#00C2D6]
              "
              role="button"
              tabIndex={0}
              aria-label={`Shop ${category.title}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCategoryClick(category.id);
                }
              }}
            >
              {/* Background Image */}
              <img
                src={category.image}
                alt={category.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Gradient Overlay for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-95" />

              {/* Floating Top Left Badge */}
              <div className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-white/95 text-[#00C2D6] backdrop-blur-md shadow-md flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                {category.icon}
              </div>

              {/* Bottom Overlaid Content */}
              <div className="absolute bottom-0 inset-x-0 p-5 z-10 flex items-end justify-between">
                <div className="max-w-[75%]">
                  <h3 className="text-lg md:text-xl font-bold text-white leading-tight drop-shadow-md">
                    {category.title}
                  </h3>
                  <p className="mt-1 text-xs text-gray-200/90 font-medium line-clamp-1 drop-shadow-sm">
                    {category.description}
                  </p>
                </div>

                {/* Bottom Right Arrow Button */}
                <div className="w-8 h-8 rounded-full bg-white text-gray-800 flex items-center justify-center shadow-md transition-all duration-300 group-hover:bg-[#00C2D6] group-hover:text-white group-hover:scale-110 flex-shrink-0">
                  <ArrowRight size={15} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* MOBILE CAROUSEL LAYOUT */}
        <div className="block md:hidden">
          <motion.div
            className="flex overflow-x-auto snap-x snap-mandatory gap-3.5 pb-4 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {categories.map((category) => (
              <motion.div
                key={category.id}
                variants={itemVariants}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategoryClick(category.id)}
                className="
                  relative
                  w-[240px]
                  h-[340px]
                  flex-shrink-0
                  snap-start
                  rounded-[20px]
                  overflow-hidden
                  group
                  cursor-pointer
                  shadow-sm
                  focus:outline-none
                "
                role="button"
                tabIndex={0}
                aria-label={`Shop ${category.title}`}
              >
                {/* Image */}
                <img
                  src={category.image}
                  alt={category.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Icon */}
                <div className="absolute top-3.5 left-3.5 z-10 w-8 h-8 rounded-full bg-white/95 text-[#00C2D6] flex items-center justify-center shadow-md">
                  {category.icon}
                </div>

                {/* Content */}
                <div className="absolute bottom-0 inset-x-0 p-4 z-10 flex items-end justify-between">
                  <div className="max-w-[75%]">
                    <h3 className="text-base font-bold text-white leading-tight">
                      {category.title}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-gray-200 line-clamp-1">
                      {category.description}
                    </p>
                  </div>

                  <div className="w-7 h-7 rounded-full bg-white text-gray-800 flex items-center justify-center shadow-md flex-shrink-0">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Swipe Hint */}
          <div className="flex justify-center mt-2">
            <span className="text-[11px] text-gray-400 font-medium">
              ← Swipe to explore categories →
            </span>
          </div>
        </div>

      </div>

      {/* Hide Scrollbar Style Rule */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default CategorySection;