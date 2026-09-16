// src/components/TestimonialSection.jsx
import React, { useEffect, useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { 
  FiUsers, 
  FiAward, 
  FiTruck, 
  FiCheckCircle, 
  FiShield 
} from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { Snowflake, Leaf, Droplets } from "lucide-react";

// Brand color – used consistently
const BRAND_CYAN = "#00C2D6";

// ––––––––––––––––––––––––––––––––––––––––––––––––––
// DATA
// ––––––––––––––––––––––––––––––––––––––––––––––––––

const testimonials = [
  {
    id: 1,
    name: "Ananya Verma",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=300&auto=format&fit=crop",
    review: "Perfect for travel and daily office use. The temperature retention is incredible. My SmoothSip keeps my drinks cold for hours!",
    role: "Verified Buyer",
  },
  {
    id: 2,
    name: "Priya Sharma",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop",
    review: "The quality is amazing! Keeps my coffee hot for hours and looks super stylish. My everyday hydration companion now!",
    role: "Verified Buyer",
  },
  {
    id: 3,
    name: "Rahul Mehta",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
    review: "Absolutely love the premium build and sleek modern look. Worth every penny, leak proof and super durable!",
    role: "Verified Buyer",
  },
];

const stats = [
  { icon: <FiUsers size={22} />, value: 50000, label: "Happy Customers", suffix: "+" },
  { icon: <FiAward size={22} />, value: 4.9, label: "Customer Rating", suffix: "/5" },
  { icon: <FiTruck size={22} />, value: 100, label: "Fast Delivery", suffix: "%" },
];

const bottomBadges = [
  { icon: <Snowflake size={18} />, title: "24H Cold", desc: "Long-lasting insulation" },
  { icon: <Leaf size={18} />, title: "BPA Free", desc: "Safe & Non-toxic" },
  { icon: <Droplets size={18} />, title: "Leak Proof", desc: "100% Reliable" },
];

// ––––––––––––––––––––––––––––––––––––––––––––––––––
// ANIMATED COUNTER
// ––––––––––––––––––––––––––––––––––––––––––––––––––

const AnimatedCounter = ({ value, suffix = "", prefix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const increment = end / 90;
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  const formattedCount =
    typeof count === "number"
      ? value % 1 === 0
        ? Math.floor(count).toLocaleString("en-IN")
        : count.toFixed(1)
      : count;

  return (
    <span ref={ref}>
      {prefix}
      {formattedCount}
      {suffix}
    </span>
  );
};

// ––––––––––––––––––––––––––––––––––––––––––––––––––
// MAIN COMPONENT
// ––––––––––––––––––––––––––––––––––––––––––––––––––

const TestimonialSection = () => {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  // Auto‑play interval
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActive((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section
      ref={sectionRef}
      className="w-full px-4 md:px-6 lg:px-8 py-12 md:py-16 bg-gradient-to-b from-white via-[#f7fafc] to-[#edf3f6] overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          className="relative bg-white rounded-[32px] border border-gray-100/80 shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.5 }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* TOP SECTION – 2‑column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[300px]">
            {/* LEFT – Testimonial Carousel */}
            <div className="lg:col-span-6 p-6 sm:p-8 md:p-10 relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#E6F9FA]/40 via-white to-white">
              {/* Giant quote mark */}
              <div
                className="absolute top-4 left-5 text-6xl font-serif select-none pointer-events-none opacity-80 leading-none"
                style={{ color: BRAND_CYAN }}
              >
                „
              </div>

              <div className="relative z-10 pt-4 pb-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.35 }}
                    className="flex flex-col sm:flex-row items-center sm:items-start gap-5"
                  >
                    {/* Avatar with verification badge */}
                    <div className="relative flex-shrink-0">
                      <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-[#00C2D6] to-[#80E1EB] shadow-sm">
                        <img
                          src={testimonials[active].image}
                          alt={testimonials[active].name}
                          className="w-full h-full rounded-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#00C2D6] text-white rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                        <FiCheckCircle size={12} strokeWidth={3} />
                      </div>
                    </div>

                    {/* Review text */}
                    <div className="space-y-2 text-center sm:text-left">
                      <p className="text-gray-700 text-sm sm:text-base font-medium leading-relaxed max-w-md">
                        “{testimonials[active].review}”
                      </p>
                      <div className="pt-1">
                        <h4 className="font-extrabold text-gray-900 text-base" style={{ color: BRAND_CYAN }}>
                          {testimonials[active].name}
                        </h4>
                        <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                          <div className="flex text-[#00C2D6] text-xs gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <FaStar key={i} />
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                            {testimonials[active].role}
                            <FiCheckCircle size={11} className="text-[#00C2D6]" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Slider dots */}
              <div className="flex items-center justify-center sm:justify-end gap-2 pt-2 relative z-10">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActive(idx)}
                    className="h-2 rounded-full transition-all duration-300 outline-none focus:ring-2 focus:ring-[#00C2D6] focus:ring-offset-2"
                    style={{
                      width: active === idx ? 20 : 8,
                      backgroundColor: active === idx ? BRAND_CYAN : "#D1D5DB",
                    }}
                    aria-label={`Go to testimonial ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Soft glow */}
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#00C2D6]/10 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* RIGHT – Stats counters */}
            <div className="hidden lg:col-span-6 border-t lg:border-t-0 lg:border-l border-gray-100 sm:grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 bg-white items-center p-6 lg:p-8">
              {stats.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center text-center p-3 space-y-1.5">
                  <div className="w-12 h-12 rounded-full bg-[#E6F9FA] text-[#00C2D6] flex items-center justify-center shadow-xs">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight" style={{ color: BRAND_CYAN }}>
                    <AnimatedCounter value={item.value} suffix={item.suffix} />
                  </h3>
                  <p className="text-xs font-bold text-gray-500">{item.label}</p>
                  <div className="h-1 w-6 bg-[#00C2D6] rounded-full mt-1" />
                </div>
              ))}
            </div>
          </div>

          {/* BOTTOM – Trust banner */}
          <div className="hidden sm:flex bg-[#00C2D6] text-white p-5 sm:px-8 flex-col lg:flex-row items-center justify-between gap-6">
            {/* Left message */}
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-11 h-11 rounded-full bg-white text-[#00C2D6] flex items-center justify-center shadow-xs flex-shrink-0">
                <FiShield size={22} />
              </div>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base leading-snug">
                  Trusted by thousands of happy customers
                </h4>
                <p className="text-white/80 text-xs font-medium">
                  Quality you can trust, service you can rely on.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden lg:block h-8 w-px bg-white/20" />

            {/* Feature badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 w-full lg:w-auto">
              {bottomBadges.map((badge, idx) => (
                <div key={idx} className="flex items-center gap-3 justify-center sm:justify-start">
                  <div className="w-10 h-10 rounded-full bg-white text-[#00C2D6] flex items-center justify-center flex-shrink-0 shadow-xs">
                    {badge.icon}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-xs sm:text-sm leading-tight">{badge.title}</p>
                    <p className="text-white/80 text-[11px] font-medium leading-tight">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialSection;