// src/components/TumblerCustomizer.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fabric } from 'fabric';
import toast from 'react-hot-toast';
import {
  FiType, FiUpload, FiShoppingCart,
  FiTrash2, FiPlus, FiChevronDown, FiChevronUp,
  FiXCircle, FiX, FiGrid,
} from 'react-icons/fi';
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

// ---------- Built‑in patterns ----------
const createPattern = (type, color = '#ff6b00') => {
  const canvas = document.createElement('canvas');
  canvas.width = 40;
  canvas.height = 40;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  switch (type) {
    case 'dots':
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(20, 20, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(40, 40, 4, 0, 2 * Math.PI);
      ctx.fill();
      break;
    case 'stripes':
      ctx.fillStyle = color;
      for (let i = 0; i < 40; i += 8) ctx.fillRect(i, 0, 3, 40);
      break;
    case 'chevron':
      ctx.fillStyle = color;
      for (let i = 0; i < 40; i += 12) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 6, 20);
        ctx.lineTo(i, 40);
        ctx.fill();
      }
      break;
    case 'floral':
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(20, 20, 6, 0, 2 * Math.PI);
      ctx.fill();
      for (let a = 0; a < 4; a++) {
        ctx.beginPath();
        ctx.ellipse(
          20 + 12 * Math.cos((a * Math.PI) / 2),
          20 + 12 * Math.sin((a * Math.PI) / 2),
          4, 8, 0, 0, 2 * Math.PI
        );
        ctx.fill();
      }
      break;
    default:
      return null;
  }
  return new fabric.Pattern({ source: canvas, repeat: 'repeat' });
};

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
  const [textColor] = useState('#111111');
  const [fontSize, setFontSize] = useState(34);
  const [fontWeight, setFontWeight] = useState('700');
  const [fontStyle, setFontStyle] = useState('normal');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeDesignObject, setActiveDesignObject] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const customization = selectedTumbler?.customization || {};
  const [openSections, setOpenSections] = useState({
    tumbler: true,
    text: customization.text !== false,
    font: customization.font !== false,
    logo: customization.logo !== false,
    pattern: customization.pattern !== false,
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
        logo: product.customization?.logo !== false,
        pattern: product.customization?.pattern !== false,
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
          const designObj = objects.find((obj) => obj.pattern && obj.fill?.source);
          setActiveDesignObject(designObj || null);
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
          const designObj = objects.find((obj) => obj.pattern && obj.fill?.source);
          setActiveDesignObject(designObj || null);
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
        img.scaleToWidth(500);
        img.selectable = false;
        img.evented = false;
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
    fabric.Image.fromURL(
      'https://placehold.co/500x700/FFF4E6/78350F?text=Image+Not+Found',
      (img) => {
        if (img) {
          img.scaleToWidth(500);
          img.selectable = false;
          img.evented = false;
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
      fill: textColor,
      fontFamily: selectedFont,
      fontWeight,
      fontStyle,
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

  const addNewText = () => {
    addText(userText.trim() || 'Your Text');
    toast.success('Text added');
  };

  const uploadLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      fabric.Image.fromURL(reader.result, (img) => {
        const area = selectedTumbler.logoArea || {
          left: 150, top: 50, width: 200, height: 150,
        };
        let scale = 1;
        if (img.width > area.width) scale = area.width / img.width;
        if (img.height * scale > area.height) scale = area.height / img.height;
        img.scale(scale);
        img.set({
          left: area.left + (area.width - img.width * scale) / 2,
          top: area.top + (area.height - img.height * scale) / 2,
          cornerColor: '#ff6b00',
          borderColor: '#ff6b00',
          hasRotatingPoint: true,
        });
        fabricCanvas.current.add(img);
        fabricCanvas.current.setActiveObject(img);
        fabricCanvas.current.renderAll();
        saveState();
        toast.success('Logo added');
      });
    };
    reader.readAsDataURL(file);
  };

  const applyDesign = (patternType) => {
    if (activeDesignObject) fabricCanvas.current.remove(activeDesignObject);
    const area = selectedTumbler.logoArea || {
      left: 150, top: 50, width: 200, height: 150,
    };
    const pattern = createPattern(patternType, '#ff6b00');
    if (!pattern) return;
    const rect = new fabric.Rect({
      left: area.left,
      top: area.top,
      width: area.width,
      height: area.height,
      fill: pattern,
      selectable: true,
      hasRotatingPoint: true,
      cornerColor: '#ff6b00',
    });
    fabricCanvas.current.add(rect);
    fabricCanvas.current.setActiveObject(rect);
    fabricCanvas.current.renderAll();
    setActiveDesignObject(rect);
    saveState();
    toast.success(`Applied ${patternType} pattern`);
  };

  // ---------- Add to Cart ----------
    const addToCart = async () => {
    const canvas = fabricCanvas.current;
    if (!canvas) return;

    // 1. Capture composite canvas as JPEG base64 (temporary)
    const base64Image = canvas.toDataURL({
      format: 'jpeg',
      quality: 0.85,
    });

    // 2. Convert base64 → Blob → File
    const blob = await (await fetch(base64Image)).blob();
    const file = new File([blob], `design-${Date.now()}.jpg`, {
      type: 'image/jpeg',
    });

   // 3. Upload to Cloudinary
    let designImage;
    try {
      const result = await customProductService.uploadDesignImage(file);
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
      text: allTexts[0]?.text || userText,
      allTexts,
      font: allTexts[0]?.fontFamily || selectedFont,
      fontSize: allTexts[0]?.fontSize || fontSize,
      fontWeight: allTexts[0]?.fontWeight || fontWeight,
      fontStyle: allTexts[0]?.fontStyle || fontStyle,
      hasDesign: !!activeDesignObject,
      pattern: activeDesignObject ? "pattern" : null,
    };

    dispatch(
      addCustomItemToCart({
        productId: selectedTumbler._id,
        name: selectedTumbler.name,
        price: selectedTumbler.basePrice,
        quantity: 1,
        customization: customizationData,   // 👈 design image inside here
      })
    );
  };

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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-row">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:relative top-0 left-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto z-40
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}
      >
        <div className="p-5">
          {/* ─── POLICY WARNING (always at top) ─── */}
          <PersonalizedOrderPolicyCompact />

          <div className="flex justify-between items-center mb-4 lg:hidden">
            <h2 className="text-xl font-bold">Tools</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-orange-500"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Product Info */}
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
                          product.allowedFonts?.[0] || AVAILABLE_FONTS[0]
                        );
                        setOpenSections((prev) => ({
                          ...prev,
                          text: product.customization?.text !== false,
                          font: product.customization?.font !== false,
                          logo: product.customization?.logo !== false,
                          pattern: product.customization?.pattern !== false,
                        }));
                      }}
                      className={`rounded-xl border p-2 transition ${
                        selectedTumbler._id === product._id
                          ? 'border-orange-500 shadow-md bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
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
              className="w-full bg-orange-500 text-white py-2 rounded-xl flex items-center justify-center gap-1 font-semibold hover:bg-orange-600 transition shadow-sm"
            >
              <FiShoppingCart /> Add to Cart – ₹{selectedTumbler.basePrice}
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col items-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 overflow-auto">
        <div className="relative bg-white shadow-2xl rounded-2xl p-2 inline-block">
          <canvas
            id="canvas"
            ref={canvasRef}
            className="rounded-xl shadow-inner max-w-full h-auto"
            style={{ maxHeight: '80vh', width: 'auto' }}
          />
        </div>
        <div className="mt-6 bg-white rounded-xl shadow-md p-3 max-w-md w-full">
          <div className="flex justify-between items-center text-sm">
            <div>
              <span className="font-semibold">Design summary:</span>{' '}
              {selectedTumbler.name} | {userText || 'No text'} | {selectedFont}
            </div>
            <div className="text-orange-600 font-bold">
              ₹{selectedTumbler.basePrice}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TumblerCustomizer;