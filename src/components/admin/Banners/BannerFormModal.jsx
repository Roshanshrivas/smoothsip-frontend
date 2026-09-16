import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { X, Save, Image, Link, Calendar, Tag, Layout, Plus, Trash2, Upload, Loader, Cloud, Trash } from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "../../../api/client";

const positionOptions = [
  { value: "home_top", label: "Home Top" },
  { value: "home_middle", label: "Home Middle" },
  { value: "home_bottom", label: "Home Bottom" },
  { value: "sidebar", label: "Sidebar" },
];

const sectionOptions = [
  { value: "hero", label: "Hero" },
  { value: "features", label: "Features Banner" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "whychoose", label: "Why Choose" },
  { value: "ugc", label: "UGC Gallery" },
  { value: "customize", label: "Customize" },
  { value: "footer", label: "Footer" },
];

// ─── Default content per section ────────────────────────
const defaultContent = {
  hero: {
    features: [
      { icon: "GiCoffeeCup", title: "24H Cold", subtitle: "12H Hot" },
      { icon: "MdOutlineVerifiedUser", title: "Premium", subtitle: "SS304 Steel" },
      { icon: "MdOutlineWaterDrop", title: "Eco-Friendly", subtitle: "BPA Free" },
      { icon: "BsShieldCheck", title: "Leak Proof", subtitle: "Design" },
    ],
  },
  features: {
    features: [
      { icon: "FiTruck", title: "Free Shipping", subtitle: "Orders above ₹999" },
      { icon: "FiRefreshCw", title: "7 Days Returns", subtitle: "No questions asked" },
      { icon: "FiLock", title: "Safe Checkout", subtitle: "Secure payments" },
      { icon: "FiAward", title: "Premium Quality", subtitle: "Built to last" },
      { icon: "FiPhoneCall", title: "24/7 Support", subtitle: "We're here" },
    ],
  },
  lifestyle: {
    features: [
      { icon: "FiSun", label: "24H Cold / 12H Hot" },
      { icon: "FiMoon", label: "Leak‑Proof & Durable" },
      { icon: "FiDroplet", label: "Sweat‑Free Exterior" },
      { icon: "FiHeart", label: "Made with Care" },
    ],
  },
  whychoose: {
    slides: [
      {
        heading: 'Why Choose <span class="text-[#14C6D8]">Tumbler?</span>',
        image: "https://res.cloudinary.com/dbkpwluh0/image/upload/v1783755632/ChatGPT_Image_Jul_11_2026_01_10_16_PM_ilivvu.png",
        features: [
          { icon: "FiBox", title: "Top Quality", subtitle: "Materials" },
          { icon: "FiShield", title: "Stylish & Modern", subtitle: "Designs" },
          { icon: "FiUser", title: "Perfect For", subtitle: "Every Lifestyle" },
          { icon: "BiRecycle", title: "Sustainable", subtitle: "& Reusable" },
        ],
      },
    ],
  },
  ugc: {
    videos: [
      { url: "", caption: "" },
    ],
  },
};

// ─── Image compression helper ────────────────────────────
const compressImage = (file, maxWidth = 1200, maxHeight = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// ─── Extract public_id from Cloudinary URL ──────────────
const extractPublicIdFromUrl = (url) => {
  if (!url) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(\.[^.]+)?$/);
  if (match) {
    return match[1].replace(/\.[^.]+$/, '');
  }
  return null;
};

// ─── Video upload via Backend API ──────────────────────
const uploadVideoToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('video', file);

  try {
    const response = await apiClient.post('/admin/cloudinary/upload-video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { url: response.data.url, public_id: response.data.publicId };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Upload failed');
  }
};

// ─── Video delete via Backend API ──────────────────────
const deleteVideoFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await apiClient.post('/admin/cloudinary/delete-video', { publicId });
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Delete failed');
  }
};

const BannerFormModal = ({ isOpen, onClose, onSave, initialData = null, preselectedSection = null }) => {
  const isEditing = !!initialData;
  const initialVideosRef = useRef([]);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image: "",
    videoUrl: "",
    mediaType: "image",
    link: "",
    ctaText: "",
    position: "home_top",
    section: "hero",
    content: {},
    order: 0,
    isActive: true,
    startDate: "",
    endDate: "",
  });
  const [videoUploadMethod, setVideoUploadMethod] = useState('url');
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoPublicId, setVideoPublicId] = useState(null);
  // ─── Track which video entry is currently uploading ──
  const [uploadingIndex, setUploadingIndex] = useState(null);

  // ─── Reset form ─────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      const initialSection = preselectedSection || (initialData?.section) || "hero";
      if (initialData) {
        setFormData({
          title: initialData.title || "",
          subtitle: initialData.subtitle || "",
          image: initialData.image || "",
          videoUrl: initialData.videoUrl || "",
          mediaType: initialData.mediaType || "image",
          link: initialData.link || "",
          ctaText: initialData.ctaText || "",
          position: initialData.position || "home_top",
          section: initialData.section || initialSection,
          content: initialData.content || defaultContent[initialSection] || {},
          order: initialData.order || 0,
          isActive: initialData.isActive !== undefined ? initialData.isActive : true,
          startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().slice(0, 10) : "",
          endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().slice(0, 10) : "",
        });
        setVideoUploadMethod(initialData.videoUrl ? 'url' : 'url');
        if (initialData.videoUrl && initialData.videoUrl.includes('cloudinary.com')) {
          setVideoPublicId(extractPublicIdFromUrl(initialData.videoUrl));
        } else {
          setVideoPublicId(null);
        }
        initialVideosRef.current = initialData.content?.videos || [];
      } else {
        setFormData({
          title: "",
          subtitle: "",
          image: "",
          videoUrl: "",
          mediaType: "image",
          link: "",
          ctaText: "",
          position: "home_top",
          section: initialSection,
          content: defaultContent[initialSection] || {},
          order: 0,
          isActive: true,
          startDate: new Date().toISOString().slice(0, 10),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        });
        setVideoUploadMethod('url');
        setVideoPublicId(null);
        initialVideosRef.current = [];
      }
    }
  }, [isOpen, initialData, preselectedSection]);

  // ─── Handlers ────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      content: { ...prev.content, [key]: value },
    }));
  };

  // ─── Feature helpers ──────────────────────────────────
  const updateFeature = (index, field, value) => {
    const features = [...(formData.content.features || [])];
    features[index][field] = value;
    handleContentChange("features", features);
  };
  const addFeature = () => {
    const features = [...(formData.content.features || [])];
    features.push({ icon: "", title: "", subtitle: "" });
    handleContentChange("features", features);
  };
  const removeFeature = (index) => {
    const features = [...(formData.content.features || [])];
    features.splice(index, 1);
    handleContentChange("features", features);
  };
  const updateLifestyleFeature = (index, field, value) => {
    const features = [...(formData.content.features || [])];
    features[index][field] = value;
    handleContentChange("features", features);
  };
  const addLifestyleFeature = () => {
    const features = [...(formData.content.features || [])];
    features.push({ icon: "", label: "" });
    handleContentChange("features", features);
  };
  const removeLifestyleFeature = (index) => {
    const features = [...(formData.content.features || [])];
    features.splice(index, 1);
    handleContentChange("features", features);
  };
  const updateSlide = (index, field, value) => {
    const slides = [...(formData.content.slides || [])];
    slides[index][field] = value;
    handleContentChange("slides", slides);
  };
  const addSlide = () => {
    const slides = [...(formData.content.slides || [])];
    slides.push({ heading: "", image: "", features: [] });
    handleContentChange("slides", slides);
  };
  const removeSlide = (index) => {
    const slides = [...(formData.content.slides || [])];
    slides.splice(index, 1);
    handleContentChange("slides", slides);
  };
  const updateSlideFeature = (slideIndex, featureIndex, field, value) => {
    const slides = [...(formData.content.slides || [])];
    slides[slideIndex].features[featureIndex][field] = value;
    handleContentChange("slides", slides);
  };
  const addSlideFeature = (slideIndex) => {
    const slides = [...(formData.content.slides || [])];
    if (!slides[slideIndex].features) slides[slideIndex].features = [];
    slides[slideIndex].features.push({ icon: "", title: "", subtitle: "" });
    handleContentChange("slides", slides);
  };
  const removeSlideFeature = (slideIndex, featureIndex) => {
    const slides = [...(formData.content.slides || [])];
    slides[slideIndex].features.splice(featureIndex, 1);
    handleContentChange("slides", slides);
  };
  const updateVideo = (index, field, value) => {
    const videos = [...(formData.content.videos || [])];
    videos[index][field] = value;
    handleContentChange("videos", videos);
  };
  const addVideo = () => {
    const videos = [...(formData.content.videos || [])];
    videos.push({ url: "", caption: "" });
    handleContentChange("videos", videos);
  };
  const removeVideo = async (index) => {
  const videos = [...(formData.content.videos || [])];
  const video = videos[index];
  if (video && video.url) {
    const publicId = extractPublicIdFromUrl(video.url);
    if (publicId) {
      try {
        await deleteVideoFromCloudinary(publicId);
      } catch (err) {
        console.error('Failed to delete video from Cloudinary:', err);
        // Don't throw – we still want to remove the entry
      }
    }
  }
  videos.splice(index, 1);
  handleContentChange("videos", videos);
};

  // ─── Image upload ────────────────────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 1200, 800, 0.7);
      setFormData(prev => ({ ...prev, image: compressed }));
      toast.success("Image uploaded and compressed");
    } catch (err) {
      toast.error("Failed to process image");
    }
  };

  // ─── Main video upload (for Hero) ────────────────────
  const handleMainVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only MP4, WebM, MOV, and AVI files are allowed');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video file must be less than 50MB');
      return;
    }

    setIsVideoUploading(true);
    setVideoUploadProgress(10);
    
    try {
      const interval = setInterval(() => {
        setVideoUploadProgress(prev => Math.min(prev + 10, 90));
      }, 300);
      
      const result = await uploadVideoToCloudinary(file);
      
      clearInterval(interval);
      setVideoUploadProgress(100);
      setFormData(prev => ({ ...prev, videoUrl: result.url }));
      setVideoPublicId(result.public_id);
      setVideoUploadMethod('upload');
      toast.success("Video uploaded successfully");
    } catch (err) {
      toast.error(err.message || "Failed to upload video");
      setVideoUploadProgress(0);
    } finally {
      setIsVideoUploading(false);
      setTimeout(() => setVideoUploadProgress(0), 1000);
    }
  };

  // ─── Delete main video ──────────────────────────────────
  const handleMainVideoDelete = async () => {
    if (!videoPublicId) {
      setFormData(prev => ({ ...prev, videoUrl: "" }));
      setVideoPublicId(null);
      toast.success("Video removed");
      return;
    }
    try {
      await deleteVideoFromCloudinary(videoPublicId);
      setFormData(prev => ({ ...prev, videoUrl: "" }));
      setVideoPublicId(null);
      toast.success("Video deleted from Cloudinary");
    } catch (err) {
      toast.error(err.message || "Failed to delete video");
    }
  };

  // ─── Per‑video upload for UGC ────────────────────────
  const handleUgcVideoUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only MP4, WebM, MOV, and AVI files are allowed');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video file must be less than 50MB');
      return;
    }

    setUploadingIndex(index);
    
    try {
      const result = await uploadVideoToCloudinary(file);
      // Update the specific video entry
      const videos = [...(formData.content.videos || [])];
      videos[index].url = result.url;
      // Optionally set a default caption if empty
      if (!videos[index].caption) {
        videos[index].caption = "Check out this amazing tumbler!";
      }
      handleContentChange("videos", videos);
      toast.success("Video uploaded successfully");
    } catch (err) {
      toast.error(err.message || "Failed to upload video");
    } finally {
      setUploadingIndex(null);
    }
  };

  // ─── Submit ──────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) return toast.error("Title is required");

    const isHero = formData.section === "hero";
    const isFeatures = formData.section === "features";
    const isLifestyle = formData.section === "lifestyle";
    const isWhyChoose = formData.section === "whychoose";
    const isUgc = formData.section === "ugc";

    if (isHero) {
      if (!formData.image.trim() && !formData.videoUrl.trim()) {
        return toast.error("Please provide either an image or a video URL for the Hero section.");
      }
    }

    if (isLifestyle) {
      if (!formData.image.trim()) return toast.error("Lifestyle image is required");
      if (!formData.link.trim()) return toast.error("Link URL is required");
      if (!formData.endDate) return toast.error("End date is required");
    }

    if (isWhyChoose) {
      if (!formData.content.slides || formData.content.slides.length === 0) {
        return toast.error("Please add at least one slide.");
      }
    }

    // If editing UGC, delete removed videos from Cloudinary
if (isEditing && isUgc) {
  const oldVideos = initialVideosRef.current;
  const newVideos = formData.content.videos || [];
  const removedVideos = oldVideos.filter(
    (old) => !newVideos.some((newV) => newV.url === old.url)
  );
  for (const removed of removedVideos) {
    if (removed.url) {
      const publicId = extractPublicIdFromUrl(removed.url);
      if (publicId) {
        try {
          await deleteVideoFromCloudinary(publicId);
        } catch (err) {
          console.error('Failed to delete video from Cloudinary:', err);
          // Continue with saving the banner
        }
      }
    }
  }
}

    if (isUgc) {
      if (!formData.content.videos || formData.content.videos.length === 0) {
        return toast.error("Please add at least one video.");
      }
      const invalid = formData.content.videos.some(v => !v.url.trim());
      if (invalid) {
        return toast.error("Please provide a valid URL for each video.");
      }
    }

    if (!isFeatures && !isUgc) {
      if (!formData.link.trim()) return toast.error("Link URL is required");
      if (!formData.endDate) return toast.error("End date is required");
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      return toast.error("Start date cannot be after end date");
    }

    const payload = {
      title: formData.title,
      subtitle: formData.subtitle,
      image: formData.image || "",
      videoUrl: formData.videoUrl || "",
      mediaType: formData.mediaType,
      link: formData.link || "",
      ctaText: formData.ctaText || "",
      position: formData.position,
      section: formData.section,
      content: formData.content,
      order: parseInt(formData.order) || 0,
      isActive: formData.isActive,
      startDate: formData.startDate,
      endDate: formData.endDate,
    };
    onSave(payload);
  };

  if (!isOpen) return null;

  const isHero = formData.section === "hero";
  const isFeatures = formData.section === "features";
  const isLifestyle = formData.section === "lifestyle";
  const isWhyChoose = formData.section === "whychoose";
  const isUgc = formData.section === "ugc";
  const isSectionLocked = !!preselectedSection && !isEditing;

  // ─── Render UGC videos list ────────────────────────────
  const renderUgcVideos = () => {
    const videos = formData.content.videos || [];
    return videos.map((video, idx) => (
      <div
        key={idx}
        className="flex flex-wrap items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50"
      >
        {/* URL input */}
        <div className="flex-1 min-w-[180px]">
          <input
            type="url"
            value={video.url || ""}
            onChange={(e) => updateVideo(idx, "url", e.target.value)}
            placeholder="Paste video URL (YouTube, Instagram, or MP4)"
            className="w-full border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-sm bg-white dark:bg-gray-900"
          />
        </div>

        {/* Upload button with file input */}
        <div className="relative flex-shrink-0">
          <input
            type="file"
            accept="video/*"
            onChange={(e) => handleUgcVideoUpload(e, idx)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploadingIndex === idx}
          />
          <button
            type="button"
            className={`px-3 py-2 text-sm rounded-lg flex items-center gap-1.5 transition ${
              uploadingIndex === idx
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
            disabled={uploadingIndex === idx}
          >
            {uploadingIndex === idx ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Upload
          </button>
        </div>

        {/* Caption input */}
        <input
          type="text"
          value={video.caption || ""}
          onChange={(e) => updateVideo(idx, "caption", e.target.value)}
          placeholder="Caption (optional)"
          className="flex-1 min-w-[120px] border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-sm bg-white dark:bg-gray-900"
        />

        {/* Remove button */}
        <button
          type="button"
          onClick={() => removeVideo(idx)}
          className="text-red-400 hover:text-red-600 p-1.5"
          title="Remove video"
        >
          <Trash2 size={16} />
        </button>
      </div>
    ));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Image size={18} className="text-orange-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {isEditing ? "Edit Banner" : "Create New Banner"}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-100px)] space-y-5">
          {/* ─── Title ─────────────────────────────────────── */}
          <div>
            <label className="block text-sm font-medium mb-1">Banner Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Summer Sale 2026"
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* ─── Subtitle ────────────────────────────────── */}
          {!isHero && !isFeatures && !isUgc && (
            <div>
              <label className="block text-sm font-medium mb-1">Subtitle</label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                placeholder="e.g., Up to 50% off"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          )}

          {/* ─── Image Upload ───────────────────────────── */}
          {!isFeatures && !isUgc && (
            <div>
              <label className="block text-sm font-medium mb-1">Banner Image</label>
              <div className="flex gap-3 items-start">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {isHero ? "Optional for Hero (if video provided)" : "Upload an image (recommended size: 1200 x 400px)"}
                  </p>
                </div>
                {formData.image && (
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <img src={formData.image} alt="banner preview" className="w-full h-full object-cover rounded-lg border" />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: "" }))}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── Section & Position ────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Section</label>
              <select
                name="section"
                value={formData.section}
                onChange={handleChange}
                disabled={isSectionLocked}
                className={`w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 ${
                  isSectionLocked ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""
                }`}
              >
                {sectionOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {isSectionLocked && <p className="text-xs text-gray-400 mt-1">Section locked for this creation.</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Position</label>
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
              >
                {positionOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ─── Hero: Media Type ───────────────────────── */}
          {isHero && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Media Type</label>
                <select
                  name="mediaType"
                  value={formData.mediaType}
                  onChange={handleChange}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
            </div>
          )}

          {/* ─── Video Upload/URL (only for Hero) ───────── */}
          {isHero && (
            <div>
              <label className="block text-sm font-medium mb-1">Video (optional)</label>
              <div className="flex flex-wrap gap-3 mb-2">
                <button
                  type="button"
                  onClick={() => setVideoUploadMethod('url')}
                  className={`px-3 py-1 rounded-lg text-sm transition ${
                    videoUploadMethod === 'url'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Enter URL
                </button>
                <button
                  type="button"
                  onClick={() => setVideoUploadMethod('upload')}
                  className={`px-3 py-1 rounded-lg text-sm transition ${
                    videoUploadMethod === 'upload'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Upload Video
                </button>
                {formData.videoUrl && (
                  <button
                    type="button"
                    onClick={handleMainVideoDelete}
                    className="px-3 py-1 rounded-lg text-sm bg-red-500 text-white hover:bg-red-600 transition flex items-center gap-1"
                  >
                    <Trash size={14} /> Remove
                  </button>
                )}
              </div>

              {videoUploadMethod === 'url' ? (
                <input
                  type="url"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/video.mp4"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
                />
              ) : (
                <div>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleMainVideoUpload}
                      className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                      disabled={isVideoUploading}
                    />
                    {isVideoUploading && (
                      <div className="flex items-center gap-2">
                        <Loader className="animate-spin text-orange-500" size={20} />
                        <span className="text-sm text-gray-600">{videoUploadProgress}%</span>
                      </div>
                    )}
                  </div>
                  {formData.videoUrl && videoUploadMethod === 'upload' && !isVideoUploading && (
                    <p className="text-sm text-green-600 mt-1 break-all">✅ Uploaded: {formData.videoUrl}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Upload a video (MP4, WebM, MOV) – max 50MB.</p>
                </div>
              )}
            </div>
          )}

          {/* ─── Link & CTA ────────────────────────────── */}
          {!isFeatures && !isUgc && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Link URL {!isHero && <span className="text-red-500">*</span>}</label>
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  placeholder="https://tumbler.com/products"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
                  required={!isHero}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CTA Button Text</label>
                <input
                  type="text"
                  name="ctaText"
                  value={formData.ctaText}
                  onChange={handleChange}
                  placeholder="e.g., Shop Now"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}

          {/* ─── Order & Status ────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Priority (order)</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                min="0"
                step="1"
                placeholder="0"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="isActive"
                value={formData.isActive ? "active" : "inactive"}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === "active" }))}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* ─── Start & End Date ────────────────────── */}
          {!isFeatures && !isUgc && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
            </div>
          )}

          {/* ─── Dynamic Content ────────────────────────── */}

          {(isHero || isFeatures) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isHero ? "Hero Features" : "Features Grid"}
              </label>
              <div className="space-y-3">
                {(formData.content.features || []).map((feature, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <input
                      type="text"
                      value={feature.icon || ""}
                      onChange={(e) => updateFeature(idx, "icon", e.target.value)}
                      placeholder="Icon name (e.g., FiTruck)"
                      className="flex-1 min-w-[80px] border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-sm"
                    />
                    <input
                      type="text"
                      value={feature.title || ""}
                      onChange={(e) => updateFeature(idx, "title", e.target.value)}
                      placeholder="Title"
                      className="flex-1 min-w-[100px] border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-sm"
                    />
                    <input
                      type="text"
                      value={feature.subtitle || ""}
                      onChange={(e) => updateFeature(idx, "subtitle", e.target.value)}
                      placeholder="Subtitle"
                      className="flex-1 min-w-[100px] border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-sm"
                    />
                    <button type="button" onClick={() => removeFeature(idx)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addFeature} className="inline-flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600">
                  <Plus size={16} /> Add Feature
                </button>
              </div>
            </div>
          )}

          {isLifestyle && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lifestyle Features</label>
              <div className="space-y-3">
                {(formData.content.features || []).map((feature, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <input
                      type="text"
                      value={feature.icon || ""}
                      onChange={(e) => updateLifestyleFeature(idx, "icon", e.target.value)}
                      placeholder="Icon name (e.g., FiSun)"
                      className="flex-1 min-w-[80px] border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-sm"
                    />
                    <input
                      type="text"
                      value={feature.label || ""}
                      onChange={(e) => updateLifestyleFeature(idx, "label", e.target.value)}
                      placeholder="Label"
                      className="flex-1 min-w-[120px] border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-sm"
                    />
                    <button type="button" onClick={() => removeLifestyleFeature(idx)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addLifestyleFeature} className="inline-flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600">
                  <Plus size={16} /> Add Feature
                </button>
              </div>
            </div>
          )}

          {isWhyChoose && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Carousel Slides</label>
              <div className="space-y-4">
                {(formData.content.slides || []).map((slide, idx) => (
                  <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Slide {idx + 1}</span>
                      <button type="button" onClick={() => removeSlide(idx)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={slide.heading || ""}
                      onChange={(e) => updateSlide(idx, "heading", e.target.value)}
                      placeholder="Heading (HTML allowed)"
                      className="w-full border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-sm"
                    />
                    <input
                      type="url"
                      value={slide.image || ""}
                      onChange={(e) => updateSlide(idx, "image", e.target.value)}
                      placeholder="Image URL"
                      className="w-full border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-sm"
                    />
                    <div>
                      <label className="text-xs font-medium text-gray-500">Slide Features</label>
                      {(slide.features || []).map((feature, fi) => (
                        <div key={fi} className="flex items-center gap-2 mt-2">
                          <input
                            type="text"
                            value={feature.icon || ""}
                            onChange={(e) => updateSlideFeature(idx, fi, "icon", e.target.value)}
                            placeholder="Icon"
                            className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm"
                          />
                          <input
                            type="text"
                            value={feature.title || ""}
                            onChange={(e) => updateSlideFeature(idx, fi, "title", e.target.value)}
                            placeholder="Title"
                            className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm"
                          />
                          <input
                            type="text"
                            value={feature.subtitle || ""}
                            onChange={(e) => updateSlideFeature(idx, fi, "subtitle", e.target.value)}
                            placeholder="Subtitle"
                            className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeSlideFeature(idx, fi)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addSlideFeature(idx)}
                        className="text-sm text-orange-500 hover:text-orange-600 mt-2 inline-flex items-center gap-1"
                      >
                        <Plus size={14} /> Add Feature
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addSlide} className="inline-flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600">
                  <Plus size={16} /> Add Slide
                </button>
              </div>
            </div>
          )}

          {/* ─── UGC Videos (Improved) ───────────────────── */}
          {isUgc && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                UGC Videos
              </label>
              <div className="space-y-3">
                {renderUgcVideos()}
                <button
                  type="button"
                  onClick={addVideo}
                  className="inline-flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600 transition"
                >
                  <Plus size={16} /> Add Video
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                For each video, you can either paste a URL (YouTube, Instagram, or direct MP4) or upload a video file.
              </p>
            </div>
          )}

          {/* ─── Footer ────────────────────────────────────── */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition">
              Cancel
            </button>
            <button type="submit" className="flex items-center gap-2 px-5 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-sm transition">
              <Save size={16} /> {isEditing ? "Update Banner" : "Create Banner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BannerFormModal;