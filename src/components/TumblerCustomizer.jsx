// src/components/TumblerCustomizer.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fabric } from 'fabric';
import toast from 'react-hot-toast';
import { FiType, FiShoppingCart, FiTrash2, FiPlus, FiChevronDown, FiChevronUp, FiX, FiGrid } from 'react-icons/fi';
import { CiUndo, CiRedo } from 'react-icons/ci';
import { addCustomItemToCart } from '../store/slices/cartSlice';
import { PersonalizedOrderPolicyCompact } from './PersonalizedOrderPolicy';
import { customProductService } from '../services/customProductService';


// ─── Available fonts (14 total) ───
const AVAILABLE_FONTS = [
  // Original set
  'Poppins',
  'Playfair Display',
  'Oswald',
  'Dancing Script',
  'Pacifico',
  'Bebas Neue',
  // Client additions
  'Allura',
  'Bungee',
  'Cedarville Cursive',
  'Courgette',
  'Permanent Marker',
  'Satisfy',
  'Great Vibes',
  'Luckiest Guy',
];


const TumblerCustomizer = ({
  products = [],
  loadingProducts = false,
  activeProductId = null,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const canvasRef = useRef(null);
  const fabricCanvas = useRef(null);

  // Match by string to be safe (id vs _id)
  const initialProduct =
    products.find((p) => String(p._id) === String(activeProductId)) ||
    products[0] ||
    null;

  const [selectedTumbler, setSelectedTumbler] = useState(initialProduct);
  const [userText, setUserText] = useState('');
  const [selectedFont, setSelectedFont] = useState(
    initialProduct?.allowedFonts?.[0] || AVAILABLE_FONTS[0]
  );
  // Fixed engraving color — dark, no user selection
  const [textColor, setTextColor] = useState('#111111');
  const [fontSize, setFontSize] = useState(34);
  const [fontWeight, setFontWeight] = useState('700');
  const [fontStyle, setFontStyle] = useState('normal');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const customization = selectedTumbler?.customization || {};
  const [openSections, setOpenSections] = useState({
    tumbler: true,
    text: customization.text !== false,
    font: customization.font !== false,
    actions: true,
  });

  // ---------- Sync when activeProductId changes ----------
  useEffect(() => {
    if (!activeProductId) return;
    const product = products.find(
      (p) => String(p._id) === String(activeProductId)
    );
    if (product) {
      setSelectedTumbler(product);
      setSelectedFont(product.allowedFonts?.[0] || AVAILABLE_FONTS[0]);
      setOpenSections((prev) => ({
        ...prev,
        text: product.customization?.text !== false,
        font: product.customization?.font !== false,
      }));
    }
  }, [activeProductId, products]);

  // ---------- Undo / Redo ----------
  const saveState = useCallback(() => {
    if (!fabricCanvas.current) return;
    const json = JSON.stringify(fabricCanvas.current.toJSON());
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(json);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      fabricCanvas.current.loadFromJSON(
        JSON.parse(history[newIndex]),
        () => {
          fabricCanvas.current.renderAll();
          const objects = fabricCanvas.current.getObjects();
        }
      );
      toast.success('Undo');
    } else {
      toast.error('Nothing to undo');
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      fabricCanvas.current.loadFromJSON(
        JSON.parse(history[newIndex]),
        () => {
          fabricCanvas.current.renderAll();
          const objects = fabricCanvas.current.getObjects();
        }
      );
      toast.success('Redo');
    } else {
      toast.error('Nothing to redo');
    }
  };

  // ---------- Initialize canvas ----------
  useEffect(() => {
    const canvas = new fabric.Canvas('canvas', {
      width: 500,
      height: 700,
      preserveObjectStacking: true,
      backgroundColor: '#ffffff',
      allowTouchScrolling: true,
    });
    fabricCanvas.current = canvas;
    canvas.on('object:modified', saveState);
    canvas.on('object:added', saveState);
    canvas.on('object:removed', saveState);
    saveState();
    return () => canvas.dispose();
  }, []);

  // ---------- Load tumbler background ----------
  useEffect(() => {
    if (!fabricCanvas.current || !selectedTumbler) return;
    loadTumbler();
  }, [selectedTumbler]);

  const loadTumbler = () => {
    const canvas = fabricCanvas.current;
    canvas.clear();

    const CANVAS_W = 500;
    const CANVAS_H = 700;

    const imageUrl =
      selectedTumbler.mainImage ||
      'https://placehold.co/500x700/FFF4E6/78350F?text=No+Image';

    fabric.Image.fromURL(
      imageUrl,
      (img) => {
        if (!img) {
          loadFallback(canvas);
          return;
        }

      // ✅ Fit image to BOTH dimensions (contain) — never crops
      const scale = Math.min(
        CANVAS_W / img.width,
        CANVAS_H / img.height
      );
      img.scale(scale);

      // ✅ Center the scaled image inside the canvas
      img.set({
        left: (CANVAS_W - img.width * scale) / 2,
        top:  (CANVAS_H - img.height * scale) / 2,
        originX: 'left',
        originY: 'top',
        selectable: false,
        evented: false,
      });

        canvas.setBackgroundImage(img, () => {
          canvas.renderAll();
          addGuideAreas();
          saveState();
        });
      },
      { crossOrigin: 'anonymous' },
      () => loadFallback(canvas)
    );
  };

  const loadFallback = (canvas) => {
  const CANVAS_W = 500;
  const CANVAS_H = 700;

  fabric.Image.fromURL(
    'https://placehold.co/500x700/FFF4E6/78350F?text=Image+Not+Found',
    (img) => {
      if (img) {
        const scale = Math.min(
          CANVAS_W / img.width,
          CANVAS_H / img.height
        );
        img.scale(scale);
        img.set({
          left: (CANVAS_W - img.width * scale) / 2,
          top:  (CANVAS_H - img.height * scale) / 2,
          originX: 'left',
          originY: 'top',
          selectable: false,
          evented: false,
        });
        canvas.setBackgroundImage(img, () => {
          canvas.renderAll();
          addGuideAreas();
          saveState();
        });
      }
    },
    { crossOrigin: 'anonymous' }
  );
};

  const addGuideAreas = () => {
    const canvas = fabricCanvas.current;
    const textArea = selectedTumbler.textArea || {
      left: 50, top: 200, width: 400, height: 200,
    };
    const logoArea = selectedTumbler.logoArea || {
      left: 150, top: 50, width: 200, height: 150,
    };

    const textGuide = new fabric.Rect({
      left: textArea.left,
      top: textArea.top,
      width: textArea.width,
      height: textArea.height,
      fill: 'transparent',
      stroke: '#ccc',
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false,
    });
    canvas.add(textGuide);

    const logoGuide = new fabric.Rect({
      left: logoArea.left,
      top: logoArea.top,
      width: logoArea.width,
      height: logoArea.height,
      fill: 'transparent',
      stroke: '#aaa',
      strokeDashArray: [3, 3],
      selectable: false,
      evented: false,
    });
    canvas.add(logoGuide);
    canvas.renderAll();
  };

  const constrainToArea = (obj, area) => {
    const rect = obj.getBoundingRect();
    let { left, top } = rect;
    const right = rect.left + rect.width;
    const bottom = rect.top + rect.height;
    let dx = 0, dy = 0;
    if (left < area.left) dx = area.left - left;
    if (right > area.left + area.width) dx = area.left + area.width - right;
    if (top < area.top) dy = area.top - top;
    if (bottom > area.top + area.height) dy = area.top + area.height - bottom;
    if (dx !== 0 || dy !== 0) {
      obj.left += dx;
      obj.top += dy;
      obj.setCoords();
    }
  };

  const addText = (initialText) => {
    const canvas = fabricCanvas.current;
    const area = selectedTumbler.textArea || {
      left: 50, top: 200, width: 400, height: 200,
    };
    const textToAdd = initialText || userText || 'Your Text';
    const textbox = new fabric.Textbox(textToAdd, {
      left: area.left + 20,
      top: area.top + 40,
      width: area.width - 40,
      fontSize,
      fontFamily: selectedFont,
      fontWeight,
      fontStyle,
      fill: textColor,
      textAlign: 'center',
      editable: true,
      cornerColor: '#ff6b00',
      borderColor: '#ff6b00',
      cornerStyle: 'circle',
      padding: 10,
      hasRotatingPoint: true,
    });
    textbox.on('moving', () => constrainToArea(textbox, area));
    textbox.on('modified', () => constrainToArea(textbox, area));
    textbox.on('scaling', () => constrainToArea(textbox, area));
    canvas.add(textbox);
    canvas.setActiveObject(textbox);
    canvas.renderAll();
    saveState();
    return textbox;
  };

  const deleteSelectedObject = () => {
    const active = fabricCanvas.current.getActiveObject();
    if (!active) {
      toast.error('No object selected');
      return;
    }
    fabricCanvas.current.remove(active);
    fabricCanvas.current.renderAll();
    saveState();
    toast.success('Deleted');
  };

  const updateActiveText = (props) => {
    const active = fabricCanvas.current.getActiveObject();
    if (active && active instanceof fabric.Textbox) {
      active.set(props);
      fabricCanvas.current.renderAll();
      saveState();
    } else {
      const textObjects = fabricCanvas.current
        .getObjects()
        .filter((obj) => obj instanceof fabric.Textbox);
      if (textObjects.length) {
        textObjects[0].set(props);
        fabricCanvas.current.renderAll();
        saveState();
      }
    }
  };

  useEffect(() => {
    if (userText) updateActiveText({ text: userText });
  }, [userText]);
  useEffect(() => updateActiveText({ fontFamily: selectedFont }), [selectedFont]);
  useEffect(() => updateActiveText({ fontSize }), [fontSize]);
  useEffect(() => updateActiveText({ fontWeight }), [fontWeight]);
  useEffect(() => updateActiveText({ fontStyle }), [fontStyle]);
  useEffect(() => updateActiveText({ fill: textColor }), [textColor]);

  const addNewText = () => {
    addText(userText.trim() || 'Your Text');
    toast.success('Text added');
  };


  // ---------- Add to Cart ----------
    const addToCart = async () => {
      if (isAddingToCart) return; // block double-clicks 
    const canvas = fabricCanvas.current;
    if (!canvas) {
      toast.error('Canvas not ready');
      return;
    }
    setIsAddingToCart(true);
    console.log('=== ADD TO CART STARTED ===');
    console.log('Product:', selectedTumbler._id, selectedTumbler.name);
    try {
    // 1. Capture composite canvas as JPEG base64 (temporary)
    const base64Image = canvas.toDataURL({
      format: 'jpeg',
      quality: 0.85,
    });
    console.log('Base64 size:', base64Image.length, 'chars');

    // 2. Convert base64 → Blob → File
    const blob = await (await fetch(base64Image)).blob();
    const file = new File([blob], `design-${Date.now()}.jpg`, {
      type: 'image/jpeg',
    });
    console.log('File size:', file.size, 'bytes');

   // 3. Upload to Cloudinary
    let designImage;
    try {
      const result = await customProductService.uploadDesignImage(file);
      console.log('Upload result:', result);
      designImage = result.url;   // ✅ now a Cloudinary URL, NOT base64
      if (!designImage) throw new Error('No URL returned');
    } catch (err) {
      toast.error('Failed to upload design. Please try again.');
      return;
    }

    // 4. Extract text objects for admin
    const allTexts = canvas
      .getObjects()
      .filter((o) => o instanceof fabric.Textbox)
      .map((t) => ({
        text: t.text || "",
        fontFamily: t.fontFamily || "Poppins",
        fontSize: Math.round(t.fontSize || 34),
        fontWeight: String(t.fontWeight || "700"),
        fontStyle: t.fontStyle || "normal",
        fill: t.fill || "#111111",
        left: Math.round(t.left || 0),
        top: Math.round(t.top || 0),
        width: Math.round((t.width || 0) * (t.scaleX || 1)),
      }));

    // 5. Send URL (not base64) to the cart
    const customizationData = {
      designImage,
      productId: selectedTumbler._id,
      productName: selectedTumbler.name,
      text: allTexts[0]?.text || userText,
      allTexts,
      font: allTexts[0]?.fontFamily || selectedFont,
      fontSize: allTexts[0]?.fontSize || fontSize,
      fontWeight: allTexts[0]?.fontWeight || fontWeight,
      fontStyle: allTexts[0]?.fontStyle || fontStyle,
      textColor,
    };

    console.log('Dispatching to cart:', customizationData);

    dispatch(
      addCustomItemToCart({
        productId: selectedTumbler._id,
        name: selectedTumbler.name,
        price: selectedTumbler.basePrice,
        quantity: 1,
        customization: customizationData,
      })
    ).unwrap();
  } catch(err){
   // toast is already shown by the thunk
    } finally {
      setIsAddingToCart(false);
      // Close sidebar on mobile after adding
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    } 
  }

// Lock body scroll when sidebar opens on mobile
useEffect(() => {
  if (!sidebarOpen) return;
  if (typeof window === "undefined") return;
  if (window.innerWidth >= 1024) return; // desktop — no lock needed

  const original = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  return () => {
    document.body.style.overflow = original;
  };
}, [sidebarOpen]);

  // ---------- UI helpers ----------
  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const SectionHeader = ({ title, icon, section, enabled }) => {
    if (!enabled) return null;
    return (
      <button
        onClick={() => toggleSection(section)}
        className="flex items-center justify-between w-full py-3 text-left font-semibold text-gray-700 border-b border-gray-100 hover:text-orange-500 transition"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </div>
        {openSections[section] ? (
          <FiChevronUp size={18} />
        ) : (
          <FiChevronDown size={18} />
        )}
      </button>
    );
  };

  if (loadingProducts || !selectedTumbler) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm font-medium text-gray-500">
          Loading product...
        </p>
      </div>
    );
  }

  const { customization: cust } = selectedTumbler;

  return (
    <div className="h-[100dvh] bg-gradient-to-br from-gray-100 to-gray-200 flex flex-row overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
           sidebar-scroll
           fixed lg:relative top-0 left-0 h-full w-[88vw] max-w-sm sm:w-80
           bg-white shadow-2xl transform transition-transform duration-300 ease-in-out
           overflow-y-auto overscroll-contain z-50 lg:z-40
           ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
         `}
      >
        {/* Sticky header — outside padding wrapper, sticks to sidebar top */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex justify-between items-center lg:hidden">
          <h2 className="text-base font-bold text-gray-800">Customize</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"
            aria-label="Close"
          >
            <FiX size={18} />
          </button>
        </div>
        <div className="p-4 sm:p-5">
          {/* ─── POLICY WARNING (always at top) ─── */}
          <PersonalizedOrderPolicyCompact />

          {/* Product Info — keep everything below */}
          <div className="mb-4 p-3 bg-gray-50 rounded-xl">
            <h3 className="font-bold text-gray-800">{selectedTumbler.name}</h3>
            <p className="text-sm text-gray-500">
              Base Price: ₹{selectedTumbler.basePrice}
            </p>
          </div>

          {/* Tumbler Selection */}
          {products.length > 0 && (
            <div>
              <SectionHeader
                title="Choose Tumbler"
                icon={<FiGrid size={18} />}
                section="tumbler"
                enabled={true}
              />
              {openSections.tumbler && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {products.map((product) => (
                    <button
                      key={product._id}
                      onClick={() => {
                        setSelectedTumbler(product);
                        setSelectedFont(
                          product.allowedFonts?.[0] || AVAILABLE_FONTS[0],
                        );
                        setOpenSections((prev) => ({
                          ...prev,
                          text: product.customization?.text !== false,
                          font: product.customization?.font !== false,
                        }));
                      }}
                      className={`rounded-xl border p-2 transition ${
                        selectedTumbler._id === product._id
                          ? "border-orange-500 shadow-md bg-orange-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <img
                        src={product.mainImage}
                        alt={product.name}
                        className="h-12 object-contain mx-auto"
                      />
                      <p className="mt-1 text-xs font-medium truncate">
                        {product.name}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Text Settings */}
          {cust.text !== false && (
            <div className="mt-4">
              <SectionHeader
                title="Text Settings"
                icon={<FiType size={18} />}
                section="text"
                enabled
              />
              {openSections.text && (
                <div className="space-y-3 mt-3">
                  <input
                    type="text"
                    value={userText}
                    onChange={(e) => setUserText(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="Your text"
                  />
                  {cust.font !== false && (
                    <select
                      value={selectedFont}
                      onChange={(e) => setSelectedFont(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl p-2 text-sm outline-none"
                      style={{ fontFamily: selectedFont }}
                    >
                      {AVAILABLE_FONTS.map((font) => (
                        <option
                          key={font}
                          value={font}
                          style={{ fontFamily: font }}
                        >
                          {font}
                        </option>
                      ))}
                    </select>
                  )}
                  <div>
                    <label className="text-xs text-gray-500">
                      Size: {fontSize}px
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="80"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  {cust.font !== false && (
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={fontWeight}
                        onChange={(e) => setFontWeight(e.target.value)}
                        className="border border-gray-300 rounded-xl p-2 text-sm outline-none"
                      >
                        <option value="400">Normal</option>
                        <option value="700">Bold</option>
                      </select>
                      <select
                        value={fontStyle}
                        onChange={(e) => setFontStyle(e.target.value)}
                        className="border border-gray-300 rounded-xl p-2 text-sm outline-none"
                      >
                        <option value="normal">Normal</option>
                        <option value="italic">Italic</option>
                      </select>
                    </div>
                  )}
                  {/* ─── Text Color ─── */}
                  <div>
                    <label className="text-xs text-gray-500 block mb-1.5">
                      Text Color
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Native color picker */}
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-9 h-9 rounded-full border-2 border-gray-200 cursor-pointer p-0.5 bg-white hover:border-orange-400 transition"
                        title="Custom color"
                      />

                      {/* Preset swatches */}
                      {[
                        "#111111", // Black (default engraving)
                        "#ffffff", // White
                        "#ef4444", // Red
                        "#3b82f6", // Blue
                        "#22c55e", // Green
                        "#eab308", // Yellow
                        "#a855f7", // Purple
                        "#f97316", // Orange
                        "#ec4899", // Pink
                        "#14b8a6", // Teal
                      ].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setTextColor(c)}
                          className={`w-7 h-7 rounded-full border-2 transition ${
                            textColor === c
                              ? "border-orange-500 ring-2 ring-orange-200 scale-110"
                              : "border-gray-200 hover:border-gray-400"
                          }`}
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Default is black — matches laser engraving. Pick any color
                      for preview.
                    </p>
                  </div>
                  <button
                    onClick={addNewText}
                    className="w-full bg-black text-white py-2 rounded-xl flex items-center justify-center gap-1 text-sm hover:bg-gray-800 transition"
                  >
                    <FiPlus /> Add Text
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════
              COLOR SECTION — REMOVED
              Product uses direct laser engraving (no color)
             ═══════════════════════════════════════════════ */}
          {/* Actions */}
          <div className="mt-4">
            <SectionHeader
              title="Actions"
              icon={<FiTrash2 size={18} />}
              section="actions"
              enabled
            />
            {openSections.actions && (
              <div className="space-y-2 mt-3">
                <div className="flex gap-2">
                  <button
                    onClick={undo}
                    className="flex-1 border border-gray-300 py-2 rounded-xl flex items-center justify-center gap-1 text-sm hover:bg-gray-50 transition"
                  >
                    <CiUndo /> Undo
                  </button>
                  <button
                    onClick={redo}
                    className="flex-1 border border-gray-300 py-2 rounded-xl flex items-center justify-center gap-1 text-sm hover:bg-gray-50 transition"
                  >
                    <CiRedo /> Redo
                  </button>
                </div>
                <button
                  onClick={deleteSelectedObject}
                  className="w-full bg-red-500 text-white py-2 rounded-xl flex items-center justify-center gap-1 text-sm hover:bg-red-600 transition"
                >
                  <FiTrash2 /> Delete Selected
                </button>
              </div>
            )}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={addToCart}
              disabled={isAddingToCart}
              className={`w-full py-2 rounded-xl flex items-center justify-center gap-2 font-semibold transition shadow-sm
              ${
                isAddingToCart
                  ? "bg-orange-400 cursor-not-allowed text-white/90"
                  : "bg-orange-500 hover:bg-orange-600 text-white"
              }`}
            >
              {isAddingToCart ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-90"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Adding to cart…
                </>
              ) : (
                <>
                  <FiShoppingCart /> Add to Cart – ₹{selectedTumbler.basePrice}
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 min-w-0 h-full overflow-hidden">
        {/* ─── MOBILE TOP BAR ─── */}
        <div className="lg:hidden flex-shrink-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
              Personalize
            </p>
            <h1 className="font-bold text-gray-900 text-sm truncate">
              {selectedTumbler.name}
            </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-1.5 ml-3 px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 active:scale-95 transition"
          >
            <FiGrid size={14} />
            Customize
          </button>
        </div>

        {/* ─── CANVAS AREA (scrolls internally) ─── */}
        <div className="scroll-smooth-mobile flex-1 flex flex-col items-center justify-start p-3 sm:p-4 overflow-y-auto overflow-x-hidden">
          <div
            className="tumbler-canvas-wrapper mx-auto bg-white rounded-2xl shadow-2xl p-2 w-full"
            style={{
              maxWidth: "min(400px, calc((100dvh - 200px) * 5 / 7))",
            }}
          >
            <div
              style={{
                width: "100%",
                aspectRatio: "500 / 700",
                position: "relative",
              }}
            >
              <canvas id="canvas" ref={canvasRef} />
            </div>
          </div>

          {/* Design summary */}
          <div className="mt-3 sm:mt-6 bg-white rounded-xl shadow-md p-3 w-full max-w-md">
            <div className="flex justify-between items-center gap-2 text-xs sm:text-sm">
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-gray-700">Design:</span>{" "}
                <span className="text-gray-600">
                  {selectedTumbler.name}
                  {userText && ` · "${userText}"`}
                  {` · ${selectedFont}`}
                </span>
              </div>
              <div className="text-orange-600 font-bold whitespace-nowrap">
                ₹{selectedTumbler.basePrice}
              </div>
            </div>
          </div>
        </div>

        {/* ─── MOBILE STICKY ACTION BAR (always visible at bottom) ─── */}
        <div className="lg:hidden flex-shrink-0 z-30 bg-white border-t border-gray-200 px-3 py-2.5 flex gap-2 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex-1 py-2.5 border-2 border-orange-500 text-orange-500 rounded-xl text-sm font-bold hover:bg-orange-50 transition active:scale-[0.98]"
          >
            <FiType className="inline mr-1" size={14} /> Edit Design
          </button>
          <button
            onClick={addToCart}
            disabled={isAddingToCart}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition active:scale-[0.98] flex items-center justify-center gap-1.5 ${
              isAddingToCart
                ? "bg-orange-300 text-white cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20"
            }`}
          >
            {isAddingToCart ? (
              <>
                <svg
                  className="animate-spin h-3.5 w-3.5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-90"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Adding…
              </>
            ) : (
              <>
                <FiShoppingCart size={14} /> Add — ₹{selectedTumbler.basePrice}
              </>
            )}
          </button>
        </div>

        {/* ─── Fabric CSS override (single instance, moved here) ─── */}
        <style>{`
          .tumbler-canvas-wrapper .canvas-container {
            width: 100% !important;
            height: 100% !important;
          }
          .tumbler-canvas-wrapper .canvas-container > canvas {
            width: 100% !important;
            height: 100% !important;
          }
        `}</style>
            </main>
          </div>
        );
      };

export default TumblerCustomizer;