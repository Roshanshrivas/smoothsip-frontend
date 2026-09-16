// src/components/BrandPanel.jsx – Teal Theme, Enhanced Readability
import React from "react";
import {
  Truck, ShieldCheck, RefreshCw, Headphones, Leaf,
  Snowflake, Flame,
} from "lucide-react";

const FeatureBadge = ({ icon, title, desc }) => (
  <div className="flex items-start gap-2 bg-white/20 backdrop-blur-sm rounded-lg p-2 border border-white/10">
    <div className="mt-0.5 text-[#14C6D8]">{icon}</div>
    <div>
      <p className="text-xs font-black text-white leading-tight">{title}</p>
      <p className="text-[10px] text-white/80">{desc}</p>
    </div>
  </div>
);

const TrustItem = ({ icon, title, desc }) => (
  <div className="space-y-0.5">
    <div className="flex items-center gap-1 text-white/90">
      {icon}
      <span className="text-[10px] font-bold tracking-tight">{title}</span>
    </div>
    <p className="text-[9px] text-white/70 pl-5">{desc}</p>
  </div>
);

export default function BrandPanel() {
  return (
    <div
      className="relative w-full lg:w-1/2 min-h-[400px] lg:min-h-screen bg-cover bg-center order-2 lg:order-1"
      style={{ backgroundImage: `url('https://res.cloudinary.com/dbkpwluh0/image/upload/v1783755632/ChatGPT_Image_Jul_11_2026_01_10_16_PM_ilivvu.png')` }}
    >
      {/* Darker overlay for better text legibility */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-black/40" />

      <div className="relative z-10 flex flex-col justify-between h-full p-6 sm:p-8 lg:p-12">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="border-2 border-white/30 p-1.5 rounded-xl bg-white/20 backdrop-blur-sm">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 3h12l-1 14a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3L6 3Z" />
              <path d="M6 7h12" />
            </svg>
          </div>
          <div>
            <span className="text-xl font-black tracking-[0.2em] text-white block leading-none drop-shadow-md">TUMBLRÉ</span>
            <span className="text-[10px] text-white/90 font-medium tracking-wider drop-shadow">Sip • Style • Repeat</span>
          </div>
        </div>

        {/* Main message */}
        <div className="my-auto py-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
            Sip Your <span className="text-[#14C6D8]">Style</span>,<br />
            Live Your <span className="text-[#14C6D8]">Vibe</span>.
          </h1>
          <div className="w-12 h-1 bg-[#14C6D8] rounded-full my-5 shadow-sm" />
          <p className="text-white/95 text-base max-w-md drop-shadow">
            Premium tumblers designed for every mood, every moment, every you.
          </p>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-3 max-w-md mt-8">
            <FeatureBadge icon={<Snowflake className="w-3 h-3" />} title="24H Cold" desc="Keeps drinks cold for 24h" />
            <FeatureBadge icon={<Flame className="w-3 h-3" />} title="12H Hot" desc="Keeps drinks hot for 12h" />
            <FeatureBadge icon={<ShieldCheck size={14} />} title="Premium SS304" desc="Food grade steel" />
            <FeatureBadge icon={<Leaf size={14} />} title="BPA Free" desc="Non‑toxic & safe" />
          </div>
        </div>

        {/* Trust ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/10 backdrop-blur-lg p-3 rounded-xl border border-white/30 shadow-lg">
          <TrustItem icon={<Truck size={14} />} title="Free Delivery" desc="Orders above ₹499" />
          <TrustItem icon={<ShieldCheck size={14} />} title="Secure Payment" desc="100% encrypted" />
          <TrustItem icon={<RefreshCw size={12} />} title="Easy Returns" desc="Hassle free" />
          <TrustItem icon={<Headphones size={14} />} title="Support" desc="24/7 care" />
        </div>
      </div>
    </div>
  );
}