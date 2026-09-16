import React, { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FiArrowRight, FiEdit3, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { GiCoffeeCup } from "react-icons/gi";
import { MdOutlineVerifiedUser, MdOutlineWaterDrop } from "react-icons/md";
import { BsShieldCheck } from "react-icons/bs";
import { FaStar } from "react-icons/fa";
import herovideo from "../assets/herovdos.mp4"; 

// ========== FEATURES DATA ==========
const features = [
  { icon: <GiCoffeeCup className="text-2xl text-[#09AFBD]" />, title: "24H Cold", subtitle: "12H Hot" },
  { icon: <MdOutlineVerifiedUser className="text-2xl text-[#09AFBD]" />, title: "Premium", subtitle: "SS304 Steel" },
  { icon: <MdOutlineWaterDrop className="text-2xl text-[#09AFBD]" />, title: "Eco-Friendly", subtitle: "BPA Free" },
  { icon: <BsShieldCheck className="text-2xl text-[#09AFBD]" />, title: "Leak Proof", subtitle: "Design" },
];

const carouselSlides = [
  { id: 1, image: "https://res.cloudinary.com/dbkpwluh0/image/upload/v1779476329/LoginPage_lrcwem.png", title: "24H Cold • 12H Hot", desc: "Keeps your drinks perfect all day" },
  { id: 2, image: "https://res.cloudinary.com/dbkpwluh0/image/upload/v1779180649/ChatGPT_Image_May_10_2026_08_30_31_PM_ztuifi.png", title: "Premium SS304 Steel", desc: "Rust‑proof, durable & food‑grade" },
  { id: 3, image: "https://res.cloudinary.com/dbkpwluh0/image/upload/v1779263583/ChatGPT_Image_May_20_2026_01_20_45_PM_bmblvd.png", title: "Eco‑Friendly & Leak Proof", desc: "BPA‑free, safe for you & the planet" },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// ========== DESKTOP HERO (with Framer Motion) ==========
const DesktopHero = () => {
  const shouldReduceMotion = useReducedMotion();
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    // Intersection Observer to lazy‑load video
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setVideoLoaded(true);
      },
      { threshold: 0.3 }
    );
    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="w-full bg-[#09AFBD]/18 overflow-hidden relative">
      <div className="grid lg:grid-cols-2 min-h-screen items-center">
        {/* Left Content – animated with stagger */}
        <motion.div
          className="relative z-20 flex justify-center items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={!shouldReduceMotion ? containerVariants : {}}
        >
          <div className="w-full max-w-full px-6 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-2 sm:py-16 mx-auto lg:mx-0">
            <motion.div variants={itemVariants}>
              <div className="hidden sm:inline-flex items-center rounded-full border border-[#14C6D8] bg-white/60 backdrop-blur-sm px-4 py-[7px] shadow-sm">
                <span className="text-[#14C6D8] text-[11px] font-bold tracking-wide uppercase">✨ Premium Quality</span>
              </div>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="mt-7 text-[54px] sm:text-[68px] lg:text-[54px] xl:text-[72px] leading-[1.2] font-bold tracking-[-3px] text-[#111111]"
            >
              Stay <span className="text-[#18C6D9] relative inline-block">
                Refreshed.
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-[#14C6D8]/30 rounded-full"></span>
              </span>
              <br />
              Everywhere <span className="text-[#14C6D8]">You Go.</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="mt-5 text-[#5F5F5F] text-base sm:text-lg max-w-[480px] font-medium leading-relaxed">
              Premium tumblers designed for work, gym, travel & lifestyle.
            </motion.p>

            {/* Social Proof */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-8 mt-8">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="" className="w-11 h-11 rounded-full border-2 border-white object-cover shadow-sm" loading="lazy" />
                  <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="" className="w-11 h-11 rounded-full border-2 border-white object-cover shadow-sm" loading="lazy" />
                  <img src="https://randomuser.me/api/portraits/men/46.jpg" alt="" className="w-11 h-11 rounded-full border-2 border-white object-cover shadow-sm" loading="lazy" />
                </div>
                <div><h4 className="text-base font-semibold text-[#222]">10,000+ <span className="font-normal text-[#777]">Happy Customers</span></h4></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1 text-[#ffb400]"><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></div>
                <p className="text-[15px] text-[#555]"><span className="font-semibold text-[#111]">4.9</span> (2.5k Reviews)</p>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-5 mt-10">
              <button className="h-[62px] px-9 rounded-2xl bg-[#14C6D8] hover:bg-[#09B0BE] text-white font-semibold text-[17px] flex items-center gap-3 transition-all duration-300 shadow-[0_15px_35px_rgba(20,198,216,0.28)] hover:scale-[1.02] active:scale-100">
                Shop Now <FiArrowRight className="text-xl" />
              </button>
              <button className="h-[62px] px-9 rounded-2xl border border-[#14C6D8] bg-white/90 backdrop-blur-md hover:bg-white hover:border-[#09B0BE] text-[#222] font-semibold text-[17px] flex items-center gap-3 transition-all duration-300 shadow-sm">
                <FiEdit3 className="text-[18px]" /> Customize Now
              </button>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-2 sm:grid-cols-4 gap-7 mt-16"
            >
              {features.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="relative flex flex-col items-center text-center group"
                >
                  <div className="w-[72px] h-[72px] rounded-full bg-white/90 backdrop-blur-md border border-[#ececec] flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                    {item.icon}
                  </div>
                  <h3 className="mt-4 text-[15px] font-semibold leading-6 text-[#222]">
                    {item.title}<br />{item.subtitle}
                  </h3>
                  {index !== features.length - 1 && (
                    <div className="hidden sm:block absolute right-[-15px] top-[18px] w-px h-[90px] bg-gradient-to-b from-[#e5e5e5] to-transparent" />
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side: Lazy‑loaded Video Background */}
        <div ref={videoRef} className="relative min-h-[500px] lg:min-h-full overflow-hidden">
          <img
            src="https://res.cloudinary.com/dbkpwluh0/image/upload/v1779263583/ChatGPT_Image_May_20_2026_01_20_45_PM_bmblvd.png"
            alt="Preview"
            className="absolute inset-0 w-full h-full object-cover object-center"
            loading="lazy"
          />
          {videoLoaded && (
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              className="absolute inset-0 w-full h-full object-cover object-center"
            >
              <source src={herovideo} type="video/mp4" />
            </video>
          )}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#D3F0F3] to-transparent pointer-events-none hidden lg:block" /> 
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#D3F0F3] to-transparent pointer-events-none lg:hidden" /> 
          <div className="absolute inset-0 bg-[#D3F0F3]/10 pointer-events-none mix-blend-multiply" />
          </div>
      </div>
    </section>
  );
};

// ========== MOBILE HERO (with Framer Motion) ==========
const MobileHero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef(null);
  const totalSlides = carouselSlides.length;
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % totalSlides);
      }, 4000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isAutoPlaying, totalSlides]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 100);
  };
  const nextSlide = () => goToSlide((currentIndex + 1) % totalSlides);
  const prevSlide = () => goToSlide((currentIndex - 1 + totalSlides) % totalSlides);

  return (
    <section className="w-full bg-gradient-to-b from-[#FEE9DC]/90 to-white overflow-hidden pb-10">
      <div className="px-4 pt-6">
        {/* Carousel (no motion needed, CSS transition is enough) */}
        <div className="relative mb-6">
          <div className="overflow-hidden rounded-2xl shadow-lg">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {carouselSlides.map((slide) => (
                <div key={slide.id} className="w-full flex-shrink-0 relative">
                  <img src={slide.image} alt={slide.title} className="w-full h-64 object-cover" loading="lazy" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-white font-bold text-lg">{slide.title}</p>
                    <p className="text-white/80 text-sm">{slide.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur rounded-full p-2 shadow-md hover:bg-white transition">
            <FiChevronLeft className="text-[#ff6b00] text-xl" />
          </button>
          <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur rounded-full p-2 shadow-md hover:bg-white transition">
            <FiChevronRight className="text-[#ff6b00] text-xl" />
          </button>
          <div className="flex justify-center gap-2 mt-3">
            {carouselSlides.map((_, idx) => (
              <button key={idx} onClick={() => goToSlide(idx)} className={`h-2 rounded-full transition-all ${idx === currentIndex ? "w-6 bg-[#ff6b00]" : "w-2 bg-gray-400"}`} />
            ))}
          </div>
        </div>

        {/* Animated content */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={!shouldReduceMotion ? containerVariants : {}}
        >
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center rounded-full border border-[#ffd6bf] bg-[#fff4ec] px-4 py-[7px] mb-4">
              <span className="text-[#ff6b00] text-[11px] font-bold tracking-wide uppercase">Premium Quality</span>
            </div>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-[36px] leading-[1.2] font-bold tracking-[-1px] text-[#111111]">
            Stay <span className="text-[#ff6b00]">Refreshed.</span><br />
            Everywhere <span className="text-[#ff6b00]">You Go.</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="mt-3 text-[#5F5F5F] text-[15px] font-medium leading-relaxed">
            Premium tumblers for work, gym, travel & lifestyle.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-4 mt-5">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="" className="w-10 h-10 rounded-full border-2 border-white object-cover" loading="lazy" />
                <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="" className="w-10 h-10 rounded-full border-2 border-white object-cover" loading="lazy" />
                <img src="https://randomuser.me/api/portraits/men/46.jpg" alt="" className="w-10 h-10 rounded-full border-2 border-white object-cover" loading="lazy" />
              </div>
              <div><h4 className="text-[14px] font-semibold text-[#222]">10,000+ <span className="font-normal text-[#777]">Happy Customers</span></h4></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex text-[#ffb400] text-sm"><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></div>
              <p className="text-[13px] text-[#555]"><span className="font-semibold">4.9</span> (2.5k)</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col gap-4 mt-6">
            <button className="w-full py-4 rounded-xl bg-[#ff6b00] hover:bg-[#eb6200] text-white font-semibold text-[16px] flex items-center justify-center gap-2 transition shadow-md">
              Shop Now <FiArrowRight />
            </button>
            <button className="w-full py-4 rounded-xl border border-[#cfcfcf] bg-white/90 backdrop-blur hover:bg-white text-[#222] font-semibold text-[16px] flex items-center justify-center gap-2 transition">
              <FiEdit3 /> Customize Now
            </button>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid grid-cols-2 gap-5 mt-8"
          >
            {features.map((item, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="flex flex-col items-center text-center bg-white/70 rounded-xl p-3 shadow-sm border border-[#ffe0d0]"
              >
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md">{item.icon}</div>
                <h3 className="mt-2 text-[13px] font-semibold text-[#222]">{item.title}<br />{item.subtitle}</h3>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// ========== RESPONSIVE WRAPPER ==========
const HeroSection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 768);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return isMobile ? <MobileHero /> : <DesktopHero />;
};

export default HeroSection;