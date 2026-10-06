// src/pages/AboutUs.jsx – Teal Theme, Production‑Ready
import React, { useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import {
  Award,
  Shield,
  Users,
  Heart,
  CheckCircle,
  Zap,
  Globe,
  TrendingUp,
  Sparkles,
  Rocket,
  Leaf,
  Star,
  Thermometer,
  Droplets,
  Hand,
  Coffee,
  Car,
  Gift,
} from "lucide-react";

// ==============================================
// BRAND COLOR
// ==============================================
const BRAND_TEAL = "#00C2D6";
const BRAND_HOVER = "#00A0B0";

// ==============================================
// ANIMATION VARIANTS
// ==============================================
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 25 },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const floatAnimation = {
  y: [0, -10, 0],
  transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
};

// ==============================================
// REUSABLE COMPONENT
// ==============================================
const SectionBadge = ({ text }) => (
  <span className="inline-block text-xs font-semibold text-[#00C2D6] uppercase tracking-wider bg-[#E6F9FA] dark:bg-[#00C2D6]/20 px-3 py-1 rounded-full mb-4">
    {text}
  </span>
);

// ==============================================
// MAIN COMPONENT
// ==============================================
const AboutUs = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.1 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  // ─── Product highlights (replaces fake team) ───
  const productHighlights = [
    {
      name: "1200 ML Capacity",
      role: "Perfect Everyday Size",
      bio: "Large enough to last a full day, compact enough to carry everywhere.",
      image: "https://res.cloudinary.com/dbkpwluh0/image/upload/v1779963032/blacktumbler_dbd4a2.png",
    },
    {
      name: "24H Cold · 8H Hot",
      role: "Double-Wall Insulation",
      bio: "Vacuum-sealed technology keeps drinks at the perfect temperature.",
      image: "https://res.cloudinary.com/dbkpwluh0/image/upload/v1779963032/blacktumbler_dbd4a2.png",
    },
    {
      name: "Everyday Essentials",
      role: "Straw + Cleaning Brush",
      bio: "Comes with a reusable straw, cleaning brush, and spill-resistant lid.",
      image: "https://res.cloudinary.com/dbkpwluh0/image/upload/v1779963032/blacktumbler_dbd4a2.png",
    },
    {
      name: "Personalize It",
      role: "Your Name, Your Colour",
      bio: "Beautiful colours and name personalization make it uniquely yours.",
      image: "https://res.cloudinary.com/dbkpwluh0/image/upload/v1779963032/blacktumbler_dbd4a2.png",
    },
  ];

  // ─── Values (founder-aligned) ───
  const values = [
    {
      icon: Heart,
      title: "Made with Love",
      description: "Every tumbler carries the same care a mother puts into every reminder.",
    },
    {
      icon: Shield,
      title: "Built to Last",
      description: "Premium stainless-steel construction that stays with you for years.",
    },
    {
      icon: Leaf,
      title: "Eco-Conscious",
      description: "Reusable design means fewer plastic bottles and a lighter footprint.",
    },
    {
      icon: Sparkles,
      title: "Thoughtfully Yours",
      description: "Personalization options make every Smooth Sip uniquely yours.",
    },
  ];

  // ─── Honest product stats ───
  const stats = [
    { label: "Pure Care", value: "100%", icon: Heart },
    { label: "Tumbler Capacity", value: "1200ml", icon: Droplets },
    { label: "Cold Retention", value: "24H", icon: Thermometer },
    { label: "Hot Retention", value: "8H", icon: Coffee },
  ];

  // ─── Founder's journey (replaces fake timeline) ───
  const milestones = [
    {
      year: "The Reminder",
      title: "A Mother's Daily Words",
      description: "\"Paani pee lo.\" — spoken for years, to children, students, and loved ones.",
    },
    {
      year: "The Observation",
      title: "We Know. We Still Forget.",
      description: "She noticed something simple: knowing we should drink water doesn't mean we do.",
    },
    {
      year: "The Question",
      title: "\"What If It Could Be Enjoyable?\"",
      description: "A mother's wondering became the seed of a brand built on everyday care.",
    },
    {
      year: "The Answer",
      title: "Smooth Sip Is Born",
      description: "A product designed to stay within reach — and gently remind you to take a sip.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-white to-gray-50/80 dark:from-gray-900 dark:to-gray-950"
    >
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden pt-20 pb-24 bg-white dark:bg-gray-900">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#00C2D6]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#00C2D6]/10 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <SectionBadge text="Our Story" />
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight">
                It All <span className="text-[#00C2D6]">Began</span> With a{" "}
                <span className="text-[#00C2D6]">Mother's</span> Reminder
              </h1>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
                <span className="font-semibold text-[#00C2D6]">"Paani pee lo."</span> ❤️
                <br />
                For our founder — a 60-year-old mother and school teacher — these
                were more than just words. She had spent years reminding her
                children, students, and loved ones to stay hydrated and take care
                of themselves.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="/allproducts"
                  className="px-6 py-3 bg-[#00C2D6] hover:bg-[#00A0B0] text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-[#00C2D6]/30"
                >
                  Explore Collection
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="/contact"
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl font-medium text-gray-700 dark:text-gray-300 transition-all"
                >
                  Get in Touch
                </motion.a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative flex justify-center"
            >
              <div className="relative w-full max-w-md aspect-square">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#00C2D6]/20 via-[#00C2D6]/10 to-transparent rounded-3xl -rotate-6 scale-105" />
                <motion.img
                  animate={floatAnimation}
                  src="https://res.cloudinary.com/dbkpwluh0/image/upload/v1779963032/blacktumbler_dbd4a2.png"
                  alt="Premium Tumbler"
                  className="relative w-full h-full object-contain drop-shadow-2xl"
                />
                <div className="absolute -bottom-4 -right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg px-5 py-3 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-bold text-gray-900 dark:text-white">4.9/5</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">(2,340 reviews)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="relative py-16 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#E6F9FA]/20 via-transparent to-[#E6F9FA]/20 dark:from-[#00C2D6]/10 dark:to-[#00C2D6]/10 pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#00C2D6]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#00C2D6]/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            ref={ref}
            variants={staggerContainer}
            initial="hidden"
            animate={controls}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  variants={scaleIn}
                  className="group relative flex flex-col items-center text-center p-6 rounded-2xl bg-gradient-to-b from-gray-50/80 to-white dark:from-gray-800/50 dark:to-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 rounded-2xl bg-[#00C2D6]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-[#00C2D6]/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300 scale-75 group-hover:scale-100" />
                    <div className="relative w-14 h-14 rounded-2xl bg-[#E6F9FA] dark:bg-[#00C2D6]/30 flex items-center justify-center group-hover:bg-[#E6F9FA] dark:group-hover:bg-[#00C2D6]/50 transition-all duration-300 border border-[#00C2D6]/20 dark:border-[#00C2D6]/30">
                      <Icon className="w-7 h-7 text-[#00C2D6] group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>

                  <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white group-hover:text-[#00C2D6] transition-colors duration-300">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium tracking-wide">
                    {stat.label}
                  </p>

                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-12 h-0.5 bg-[#00C2D6] transition-all duration-300" />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ===== MISSION & VISION ===== */}
      <section className="py-20 bg-gray-50/50 dark:bg-gray-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#E6F9FA] dark:bg-[#00C2D6]/20 flex items-center justify-center mb-4 group-hover:bg-[#E6F9FA] dark:group-hover:bg-[#00C2D6]/30 transition-all">
                <Globe className="w-7 h-7 text-[#00C2D6]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Our Mission
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                To make hydration something you actually look forward to — by
                creating premium drinkware that gently reminds you to take care
                of yourself, every day.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ delay: 0.15 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#E6F9FA] dark:bg-[#00C2D6]/20 flex items-center justify-center mb-4 group-hover:bg-[#E6F9FA] dark:group-hover:bg-[#00C2D6]/30 transition-all">
                <Rocket className="w-7 h-7 text-[#00C2D6]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Our Promise
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Every Smooth Sip carries the same care a mother puts into every
                reminder — because sometimes, care can be something you carry.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== VALUES ===== */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <SectionBadge text="Core Values" />
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              What We Stand For
            </h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              Our principles guide every decision we make and every product we create.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={idx}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  transition={{ delay: idx * 0.08 }}
                  className="group relative bg-gray-50 dark:bg-gray-800/30 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-[#00C2D6]/40 dark:hover:border-[#00C2D6]/40 transition-all hover:shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00C2D6]/0 to-[#00C2D6]/0 group-hover:from-[#00C2D6]/10 group-hover:to-[#00C2D6]/20 dark:group-hover:from-[#00C2D6]/10 dark:group-hover:to-[#00C2D6]/20 rounded-2xl transition-all" />
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-[#E6F9FA] dark:bg-[#00C2D6]/20 flex items-center justify-center mb-4 group-hover:bg-[#E6F9FA] dark:group-hover:bg-[#00C2D6]/40 transition-colors">
                      <Icon className="w-6 h-6 text-[#00C2D6] group-hover:scale-110 transition-transform" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {value.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== FOUNDER'S JOURNEY (was timeline) ===== */}
      <section className="py-20 bg-gray-50/50 dark:bg-gray-950/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <SectionBadge text="The Story Behind Smooth Sip" />
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              From Reminder to Reality
            </h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#00C2D6]/30 dark:bg-[#00C2D6]/40 -translate-x-1/2 hidden md:block" />

            <div className="space-y-12">
              {milestones.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex flex-col md:flex-row items-center gap-6 ${
                    idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div className="flex-1 md:text-right">
                    <div className={`bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all ${
                      idx % 2 === 0 ? "md:ml-auto md:max-w-md" : "md:mr-auto md:max-w-md"
                    }`}>
                      <span className="text-sm font-bold text-[#00C2D6]">{item.year}</span>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{item.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>
                    </div>
                  </div>

                  <div className="flex-shrink-0 relative">
                    <div className="w-8 h-8 rounded-full bg-[#00C2D6] border-4 border-white dark:border-gray-900 shadow-md z-10 relative" />
                  </div>

                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRODUCT HIGHLIGHTS (was team) ===== */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <SectionBadge text="Our Signature Tumbler" />
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Thoughtfully Designed.
              <br />
              Effortlessly Everyday.
            </h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              Our signature 1200 ML stainless-steel vacuum-insulated tumbler
              combines style with everyday functionality.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productHighlights.map((item, idx) => (
              <motion.div
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ delay: idx * 0.08 }}
                className="group bg-gray-50 dark:bg-gray-800/30 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-[#00C2D6]/40 dark:hover:border-[#00C2D6]/40 hover:shadow-xl transition-all text-center"
              >
                <div className="relative inline-block">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-contain bg-white p-2 border-2 border-[#00C2D6]/30 group-hover:border-[#00C2D6] transition-colors"
                  />
                  <div className="absolute -bottom-1 right-1 bg-[#00C2D6] rounded-full p-1 border-2 border-white dark:border-gray-900">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {item.name}
                </h4>
                <p className="text-sm text-[#00C2D6] font-medium mt-0.5">
                  {item.role}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                  {item.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-16 bg-gradient-to-r from-[#00C2D6] to-[#0098A8] dark:from-[#00A0B0] dark:to-[#008F9E] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJIMjR2LTJoMTJ6TTM2IDI0djJIMjR2LTJoMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Love in Every Sip.
            </h2>
            <p className="text-[#D6F5F8] text-lg max-w-2xl mx-auto mb-8">
              Because sometimes, care can be something you carry. Join us in
              making hydration feel like home.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/allproducts"
                className="px-8 py-3 bg-white text-[#00C2D6] hover:bg-[#E6F9FA] rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Shop Now
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/contact"
                className="px-8 py-3 border-2 border-white text-white hover:bg-white/10 rounded-xl font-semibold transition-all"
              >
                Contact Us
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default AboutUs;