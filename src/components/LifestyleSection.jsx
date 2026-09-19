// LifestyleSection.jsx – Dynamic with banner API
import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FiArrowRight, FiCoffee, FiSun, FiMoon, FiDroplet, FiHeart } from "react-icons/fi";
import * as Icons from "react-icons/fi";
import { bannerService } from "../services/bannerService";

// ─── Static fallback ─────────────────────────────────────
const staticFeatures = [
  { icon: "FiSun", label: "24H Cold / 12H Hot" },
  { icon: "FiMoon", label: "Leak‑Proof & Durable" },
  { icon: "FiDroplet", label: "Sweat‑Free Exterior" },
  { icon: "FiHeart", label: "Made with Care" },
];

const renderIcon = (iconName) => {
  if (!iconName) return null;
  const IconComponent = Icons[iconName];
  return IconComponent ? <IconComponent className="w-4 h-4 text-[#14C6D8]" /> : null;
};


const LifestyleSection = () => {
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await bannerService.getActiveBanners({ section: "lifestyle" });
        if (res.banners.length > 0) setBanner(res.banners[0]);
      } catch (err) {
        console.error("Failed to fetch lifestyle banner:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBanner();
  }, []);

  // ─── Use banner data if available ──────────────────────
  const heading = banner?.title || "Made for your every moment";
  const subtitle = banner?.subtitle || "From sunrise coffee to late‑night focus, our tumblers keep every sip at the perfect temperature.";
  const imageSrc = banner?.image || "https://res.cloudinary.com/dbkpwluh0/image/upload/v1783754440/ChatGPT_Image_Jul_11_2026_12_50_07_PM_byqnmq.png";
  const ctaLink = banner?.link || "/allproducts";
  const ctaText = banner?.ctaText || "Shop Lifestyle";
  const features = banner?.content?.features || staticFeatures;

  // ─── Animation variants ──────────────────────────────
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const leftVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", damping: 12, stiffness: 80 } },
  };

  const rightVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", damping: 12, stiffness: 80, delay: 0.1 } },
  };

  const badgeVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const headingVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1 } },
  };

  const featureItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  };

  const buttonVariants = {
    hover: { scale: 1.02, transition: { type: "spring", stiffness: 400 } },
    tap: { scale: 0.98 },
  };

  const imageVariants = {
    hover: { scale: 1.05, transition: { duration: 0.5 } },
  };

  const underlineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { pathLength: 1, opacity: 1, transition: { duration: 0.8, delay: 0.3, ease: "easeInOut" } },
  };

  if (loading) return <div className="h-96 bg-gray-100 animate-pulse" />;

  return (
    <section
      ref={sectionRef}
      className="w-full bg-gradient-to-b from-[#EAF9FB]/30 via-white to-white overflow-hidden py-6 md:py-14">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
          variants={containerVariants}>
          {/* LEFT COLUMN: Image */}
          <motion.div
            className="relative group rounded-2xl overflow-hidden shadow-xl"
            variants={leftVariants}
            whileHover="hover">
            <motion.img
              src={imageSrc}
              alt={heading}
              className="w-full h-full object-cover"
              variants={imageVariants}
              style={{ willChange: "transform" }}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          </motion.div>
          {/* RIGHT COLUMN: Content */}
          <motion.div className="space-y-5 md:space-y-6" variants={rightVariants}>
            <motion.div
              className="hidden sm:inline-flex items-center gap-2 bg-[#EAF9FB] text-[#14C6D8] px-3 py-1 rounded-full text-sm font-medium"
              variants={badgeVariants}>
              <FiCoffee className="w-4 h-4" />
              <span>Everyday Essential</span>
            </motion.div>
            <motion.h2
              className="text-[20px] sssm:text-2xl mb-2 sm:mb-[20px] sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900"
              variants={headingVariants}>
              {heading}
            </motion.h2>
            <motion.p
              className="text-gray-600 text-[15px] xsm:m-0 sm:my-6  sssm:text-base md:text-lg leading-relaxed max-w-md"
              variants={textVariants}>
              {subtitle}
            </motion.p>

            <motion.div
              className="grid grid-cols-2 sm:grid-cols-2 sm:gap-3 sm:pt-2"
              variants={containerVariants}
            >
              {features.map((item, idx) => {
                const IconComponent = typeof item.icon === 'string' ? renderIcon(item.icon) : item.icon;
                return (
                  <motion.div
                    key={idx}
                    className="md:flex items-center gap-1 sm:gap-3 xsm:hidden"
                    variants={featureItemVariants}
                  >
                    <div className="w-8 h-8 sm:w-6 sm:h-6 rounded-full bg-[#EAF9FB] flex items-center justify-center flex-shrink-0">
                      {IconComponent || <FiSun className="w-4 h-4 text-[#14C6D8]" />}
                    </div>
                    <span className="text-[11px] sm:text-sm text-gray-700 font-medium">{item.label}</span>
                  </motion.div>
                );
              })}
            </motion.div>

            <motion.a
              href={ctaLink}
              className="group text-[12px] mt-1 sm:mt-4 inline-flex items-center gap-2 bg-[#14C6D8] hover:bg-[#09AFC0] text-white font-semibold px-4 py-2 rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {ctaText}
              <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default LifestyleSection;