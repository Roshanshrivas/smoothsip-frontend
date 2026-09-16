import React, { useState, useRef, useEffect } from "react";
import { FiEye, FiShoppingCart } from "react-icons/fi";
import {
  TbPalette, TbLetterT, TbTypography, TbSticker,
  TbPrinter, TbRuler, TbStack2, TbPackage,
} from "react-icons/tb";
import toast from "react-hot-toast";

const CustomizeTumbler = () => {
  // State
  const [selectedColor, setSelectedColor] = useState("matte-black");
  const [customText, setCustomText] = useState("");
  const [quote, setQuote] = useState("");
  const [selectedFont, setSelectedFont] = useState("modern");
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [engravingFinish, setEngravingFinish] = useState("laser");
  const [selectedSize, setSelectedSize] = useState("24");
  const [lidType, setLidType] = useState("straw");
  const [accessories, setAccessories] = useState({ extraStraw: true, giftPack: true });

  // Canvas ref
  const canvasRef = useRef(null);

  // Image mapping (replace with your actual image URLs)
  const colorImages = {
    "matte-black": "https://res.cloudinary.com/dbkpwluh0/image/upload/v1779272979/imgi_260_Citron_tumbler_light_green_parrot_a5367393-2d6a-48b3-a095-13b1cb9e880e_bmtdor.jpg",
    "rose-gold": "/images/tumblers/rose-gold.png",
    "midnight-blue": "/images/tumblers/midnight-blue.png",
    "olive-green": "/images/tumblers/olive-green.png",
    "blush-pink": "/images/tumblers/blush-pink.png",
    "silver": "/images/tumblers/silver.png",
  };

  const colors = [
    { name: "Matte Black", id: "matte-black", code: "#1a1a1a" },
    { name: "Rose Gold", id: "rose-gold", code: "#b76e79" },
    { name: "Midnight Blue", id: "midnight-blue", code: "#2c3e50" },
    { name: "Olive Green", id: "olive-green", code: "#556b2f" },
    { name: "Blush Pink", id: "blush-pink", code: "#f4c2c2" },
    { name: "Silver", id: "silver", code: "#c0c0c0" },
  ];

  // Fonts
  const fonts = [
    { id: "elegant", name: "Elegant Script", fontFamily: "'Brush Script MT', cursive" },
    { id: "modern", name: "Modern Sans", fontFamily: "Arial, sans-serif" },
    { id: "serif", name: "Minimal Serif", fontFamily: "'Times New Roman', serif" },
    { id: "bold", name: "Bold Premium", fontFamily: "'Impact', sans-serif" },
    { id: "hand", name: "Handwritten Style", fontFamily: "'Comic Sans MS', cursive" },
  ];

  const icons = [
    { id: "star", svg: "⭐" },
    { id: "heart", svg: "❤️" },
    { id: "flower", svg: "🌸" },
    { id: "crown", svg: "👑" },
    { id: "leaf", svg: "🍃" },
  ];

  const finishes = [
    { id: "laser", label: "Laser Engrave", color: "#fff", shadow: "0 0 0 rgba(0,0,0,0)" },
    { id: "gloss", label: "Gloss Print", color: "#ffcc00", shadow: "0 0 5px gold" },
    { id: "matte", label: "Matte Print", color: "#dddddd", shadow: "none" },
    { id: "foil", label: "Metallic Foil", color: "#c0c0c0", shadow: "0 0 8px silver" },
  ];

  const sizes = [
    { oz: 16, price: 0 },
    { oz: 24, price: 100 },
    { oz: 32, price: 200 },
    { oz: 40, price: 350 },
  ];

  const lids = [
    { id: "straw", label: "Straw Lid", icon: "🥤" },
    { id: "flip", label: "Flip Lid", icon: "🔄" },
    { id: "sip", label: "Sip Lid", icon: "☕" },
    { id: "leakproof", label: "Leakproof Lid", icon: "🔒" },
  ];

  // Pricing (unchanged)
  const basePrice = 1299;
  const customizationPrice = 199;
  const accessoryPrices = { cleaningBrush: 149, extraStraw: 99, carryPouch: 249, giftPack: 199 };
  const totalAccessories = Object.entries(accessories).reduce((sum, [key, val]) => sum + (val ? accessoryPrices[key] : 0), 0);
  const totalPrice = basePrice + customizationPrice + totalAccessories;

  // Handle accessory change
  const handleAccessoryChange = (key) => {
    setAccessories((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Draw on canvas whenever any customization changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = colorImages[selectedColor] || colorImages["matte-black"];

    img.onload = () => {
      // Set canvas size to match image dimensions
      canvas.width = img.width;
      canvas.height = img.height;

      // Clear and draw tumbler image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Prepare text style
      const currentFont = fonts.find(f => f.id === selectedFont);
      const finish = finishes.find(f => f.id === engravingFinish);

      // Text settings – adapt position & curvature for a tumbler (cylindrical effect)
      ctx.save();
      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";

      // Main text (Name) – placed centrally with slight arc
      if (customText) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height * 0.65; // adjust based on your image
        const radius = canvas.width * 0.25;
        const angleStep = (Math.PI * 0.4) / customText.length; // curved arc

        ctx.font = `bold ${Math.floor(canvas.width * 0.06)}px ${currentFont.fontFamily}`;
        ctx.fillStyle = finish.color;
        ctx.shadowBlur = finish.shadow === "none" ? 0 : 8;
        ctx.shadowColor = finish.shadow;

        let startAngle = -Math.PI * 0.2;
        for (let i = 0; i < customText.length; i++) {
          const angle = startAngle + i * angleStep;
          const x = centerX + radius * Math.sin(angle);
          const y = centerY + radius * (1 - Math.cos(angle)) * 0.5;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angle + Math.PI / 2);
          ctx.fillText(customText[i], 0, 0);
          ctx.restore();
        }
      }

      // Quote (smaller, below name, also curved)
      if (quote) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height * 0.75;
        const radius = canvas.width * 0.22;
        const angleStep = (Math.PI * 0.3) / quote.length;
        ctx.font = `italic ${Math.floor(canvas.width * 0.04)}px ${currentFont.fontFamily}`;
        ctx.fillStyle = finish.color;
        let startAngle = -Math.PI * 0.15;
        for (let i = 0; i < quote.length; i++) {
          const angle = startAngle + i * angleStep;
          const x = centerX + radius * Math.sin(angle);
          const y = centerY + radius * (1 - Math.cos(angle)) * 0.5;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angle + Math.PI / 2);
          ctx.fillText(quote[i], 0, 0);
          ctx.restore();
        }
      }

      // Icon / Logo – placed in a fixed area (e.g., above the name)
      if (selectedIcon) {
        const iconX = canvas.width * 0.5;
        const iconY = canvas.height * 0.52;
        ctx.font = `${Math.floor(canvas.width * 0.08)}px "Segoe UI Emoji"`;
        ctx.fillStyle = finish.color;
        ctx.shadowBlur = finish.shadow === "none" ? 0 : 6;
        ctx.fillText(selectedIcon, iconX - 20, iconY);
      }

      ctx.restore();
    };
  }, [selectedColor, customText, quote, selectedFont, selectedIcon, engravingFinish]);

  const handleAddToCart = () => {
    toast.success("Added to cart! 🎉", { duration: 3000, position: "top-center", style: { background: "#ff6b00", color: "#fff" } });
  };

  return (
    <section className="w-full bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Design Your Signature Tumbler</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Choose color, add text, pick a finish – see it live on a realistic 3D tumbler.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* LEFT: Customization Options */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Color */}
            <div className="bg-gray-50 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4"><TbPalette className="text-[#ff6b00] text-xl" /><h3 className="text-xl font-semibold">1. Choose Your Color</h3></div>
              <div className="flex flex-wrap gap-3">
                {colors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color.id)}
                    className={`w-12 h-12 rounded-full shadow-md transition-all ${selectedColor === color.id ? "ring-2 ring-[#ff6b00] ring-offset-2 scale-110" : "hover:scale-105"}`}
                    style={{ backgroundColor: color.code }}
                    aria-label={color.name}
                  />
                ))}
              </div>
            </div>

            {/* 2. Text & Quote */}
            <div className="bg-gray-50 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4"><TbLetterT className="text-[#ff6b00] text-xl" /><h3 className="text-xl font-semibold">2. Add Your Text</h3></div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                  <input type="text" maxLength="15" value={customText} onChange={(e) => setCustomText(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Enter name" />
                  <p className="text-xs text-gray-400 mt-1">{customText.length}/15</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short quote (optional)</label>
                  <input type="text" maxLength="25" value={quote} onChange={(e) => setQuote(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Stay Hydrated" />
                  <p className="text-xs text-gray-400 mt-1">{quote.length}/25</p>
                </div>
              </div>
            </div>

            {/* 3. Font Style */}
            <div className="bg-gray-50 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4"><TbTypography className="text-[#ff6b00] text-xl" /><h3 className="text-xl font-semibold">3. Select Font Style</h3></div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {fonts.map((font) => (
                  <button key={font.id} onClick={() => setSelectedFont(font.id)} className={`p-3 border rounded-xl text-center transition-all ${selectedFont === font.id ? "border-[#ff6b00] bg-[#fff4ec] ring-1 ring-[#ff6b00]" : "border-gray-200"}`}>
                    <span className={`text-lg block`} style={{ fontFamily: font.fontFamily }}>Aa</span>
                    <span className="text-xs text-gray-500 mt-1">{font.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Icon / Artwork */}
            <div className="bg-gray-50 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4"><TbSticker className="text-[#ff6b00] text-xl" /><h3 className="text-xl font-semibold">4. Add Icon / Artwork</h3></div>
              <div className="flex flex-wrap gap-4">
                {icons.map((icon) => (
                  <button key={icon.id} onClick={() => setSelectedIcon(selectedIcon === icon.svg ? null : icon.svg)} className={`text-3xl p-2 rounded-full transition-all ${selectedIcon === icon.svg ? "bg-[#ff6b00] text-white shadow-md scale-110" : "bg-gray-200 hover:bg-gray-300"}`}>
                    {icon.svg}
                  </button>
                ))}
                <button className="text-gray-500 text-sm flex items-center gap-1 bg-white border border-dashed border-gray-300 rounded-full px-4 py-2 hover:bg-gray-100">+ Upload</button>
              </div>
            </div>

            {/* 5. Engraving Finish */}
            <div className="bg-gray-50 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4"><TbPrinter className="text-[#ff6b00] text-xl" /><h3 className="text-xl font-semibold">5. Engraving Finish</h3></div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {finishes.map((finish) => (
                  <button key={finish.id} onClick={() => setEngravingFinish(finish.id)} className={`p-2 border rounded-lg text-center transition-all ${engravingFinish === finish.id ? "border-[#ff6b00] bg-[#fff4ec] font-semibold" : "border-gray-200"}`}>
                    {finish.label}
                    {finish.id !== "laser" && <span className="text-xs text-gray-500 block">+ ₹{finish.id === "foil" ? 149 : 99}</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Size + 7. Lid Type */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4"><TbRuler className="text-[#ff6b00] text-xl" /><h3 className="text-xl font-semibold">6. Choose Size</h3></div>
                <div className="grid grid-cols-2 gap-2">
                  {sizes.map((size) => (
                    <button key={size.oz} onClick={() => setSelectedSize(size.oz)} className={`p-2 rounded-lg border transition-all ${selectedSize === size.oz ? "border-[#ff6b00] bg-[#fff4ec] font-bold" : "border-gray-200"}`}>
                      {size.oz} oz{size.price > 0 && <span className="text-xs text-gray-500 block">+ ₹{size.price}</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4"><TbStack2 className="text-[#ff6b00] text-xl" /><h3 className="text-xl font-semibold">7. Lid Type</h3></div>
                <div className="grid grid-cols-2 gap-2">
                  {lids.map((lid) => (
                    <button key={lid.id} onClick={() => setLidType(lid.id)} className={`p-2 rounded-lg border flex items-center justify-center gap-2 transition-all ${lidType === lid.id ? "border-[#ff6b00] bg-[#fff4ec] font-semibold" : "border-gray-200"}`}>
                      <span>{lid.icon}</span> {lid.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 8. Accessories */}
            <div className="bg-gray-50 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4"><TbPackage className="text-[#ff6b00] text-xl" /><h3 className="text-xl font-semibold">8. Add Accessories</h3></div>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { key: "cleaningBrush", label: "Cleaning Brush", price: 149 },
                  { key: "extraStraw", label: "Extra Straw", price: 99 },
                  { key: "carryPouch", label: "Carry Pouch", price: 249 },
                  { key: "giftPack", label: "Gift Packaging", price: 199 },
                ].map((item) => (
                  <label key={item.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:bg-gray-100 cursor-pointer">
                    <span>{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">+ ₹{item.price}</span>
                      <input type="checkbox" checked={accessories[item.key] || false} onChange={() => handleAccessoryChange(item.key)} className="w-5 h-5 accent-[#ff6b00]" />
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Canvas Preview + Price */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-5 sticky top-24">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><FiEye className="text-[#ff6b00]" /> Live Preview (3D effect)</h3>
              <div className="flex justify-center bg-gray-100 rounded-xl p-4">
                <canvas ref={canvasRef} className="max-w-full h-auto rounded-lg shadow-inner" style={{ maxHeight: "400px" }} />
              </div>
              <p className="text-sm text-gray-500 text-center mt-3">Text & icon appear curved on the tumbler surface.</p>
            </div>

            {/* Price Summary (unchanged) */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-5">
              <h3 className="text-xl font-bold mb-4">Price Summary</h3>
              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between"><span>Base Price</span><span>₹{basePrice}</span></div>
                <div className="flex justify-between"><span>Customization Fee</span><span>₹{customizationPrice}</span></div>
                <div className="flex justify-between"><span>Accessories</span><span>+ ₹{totalAccessories}</span></div>
                <hr className="my-2" />
                <div className="flex justify-between text-lg font-bold text-[#ff6b00]"><span>Total Price</span><span>₹{totalPrice}</span></div>
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={handleAddToCart} className="flex-1 bg-[#ff6b00] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#eb6200] transition"><FiShoppingCart size={18} /> Add to Cart</button>
                <button className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition">Preview in 3D</button>
              </div>
              <p className="text-xs text-gray-400 text-center mt-4">Your design is safe & secure. We never share your personal information.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomizeTumbler;