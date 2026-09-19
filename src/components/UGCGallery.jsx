// UGCReels.jsx – Auto-playing, production-ready UGC section
import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  FiHeart,
  FiShare2,
  FiVolume2,
  FiVolumeX,
  FiPlay,
  FiPause,
  FiLoader,
  FiInstagram,
} from "react-icons/fi";
import { bannerService } from "../services/bannerService";

const fallbackVideos = [
  {
    url: "https://res.cloudinary.com/dbkpwluh0/video/upload/v1789737213/a5da4176c7c04131abb796b8d37edfea.HD-720p-1.6Mbps-87464406_zoe04n.mp4",
    caption: "Kiki's morning hydration ritual 🐕 #MyTumblerStyle",
  },
  {
    url: "https://res.cloudinary.com/dbkpwluh0/video/upload/v1789737227/94f8f04997014e67aa8038d524083983.HD-1080p-7.2Mbps-65495277_e5v7jz.mp4",
    caption: "Cold brew, warm vibes ☕ Custom engraved tumbler",
  },
  {
    url: "https://res.cloudinary.com/dbkpwluh0/video/upload/v1789737221/39214cc84ee84d409c1c4504b391a171.HD-720p-1.6Mbps-89573504_hh3fsv.mp4",
    caption: "Safari-ready hydration 🌿 24oz Matte Black",
  },
  {
    url: "https://res.cloudinary.com/dbkpwluh0/video/upload/v1789737211/aa68f15259d64d62a6682ac0bcec8b67.HD-1080p-2.5Mbps-37924130_gmtudk.mp4",
    caption: "Gym day essentials 💪 Stay cold for 24 hours",
  },
  {
    url: "https://res.cloudinary.com/demo/video/upload/cld-sample-video.mp4",
    caption: "Personalized for Priya 💕 Rose Gold Edition",
  },
];

// ─── Helper: Detect and construct embed URL with autoplay parameters ──
const getEmbedUrl = (url) => {
  if (!url) return null;

  // Instagram Reel / Post embed
  if (url.includes("instagram.com") || url.includes("instagr.am")) {
    const match = url.match(/\/p\/([^\/?#]+)/) || url.match(/\/reel\/([^\/?#]+)/);
    if (match) {
      return `https://www.instagram.com/p/${match[1]}/embed/captioned/`;
    }
    return null;
  }

  // YouTube Shorts / Normal video embed with autoplay + mute query params
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const videoId = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId[1]}?autoplay=1&mute=1&loop=1&playlist=${videoId[1]}&controls=0&modestbranding=1`;
    }
    return null;
  }

  // Direct video file (MP4, WebM, MOV)
  if (url.match(/\.(mp4|webm|mov)(\?.*)?$/i) || url.includes("/video/upload/")) {
    return url;
  }

  return url; // Default fallback
};

// ─── Skeleton Loader ──────────────────────────────────────
const ReelSkeleton = () => (
  <div className="aspect-[9/16] w-full bg-gray-200 rounded-2xl animate-pulse flex flex-col items-center justify-between p-4">
    <div className="w-full h-full bg-gray-300 rounded-lg" />
  </div>
);

// ─── Single Reel Card Component ────────────────────────────
const ReelCard = ({ video }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const videoRef = useRef(null);
  const cardRef = useRef(null);
  const embedUrl = getEmbedUrl(video.url);
  const isDirectVideo = !video.url?.includes("instagram.com") && !video.url?.includes("youtube.com") && !video.url?.includes("youtu.be");

  // ─── Intersection Observer for Smart Scroll Autoplay ────────
  useEffect(() => {
    if (!isDirectVideo || !videoRef.current) return;

    const currentVideo = videoRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Video is visible on screen -> attempt play
            currentVideo.muted = true; // Crucial for browser autoplay policy
            setIsMuted(true);

            const playPromise = currentVideo.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  setIsPlaying(true);
                  setAutoplayBlocked(false);
                })
                .catch((err) => {
                  console.warn("Autoplay prevented by browser:", err);
                  setAutoplayBlocked(true);
                  setIsPlaying(false);
                });
            }
          } else {
            // Video scrolled off screen -> pause to save resource
            currentVideo.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.5 } // Trigger when 50% of the video is visible
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [isDirectVideo]);

  // ─── Play / Pause Toggle ───────────────────────────────────
  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        })
        .catch((err) => console.error("Manual play error:", err));
    }
  };

  // ─── Mute / Unmute Toggle ──────────────────────────────────
  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked(!liked);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleVideoLoaded = () => setIsVideoLoading(false);

  // ─── Render Card ───────────────────────────────────────────
  return (
    <div
      ref={cardRef}
      className="relative bg-black rounded-2xl overflow-hidden shadow-xl group aspect-[9/16] w-full select-none"
    >
      {!isDirectVideo ? (
        // Embed Video (Instagram / YouTube)
        <iframe
          src={embedUrl}
          title={video.caption || "UGC Reel"}
          className="w-full h-full border-0"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          scrolling="no"
          loading="lazy"
        />
      ) : video.url ? (
        // Direct Video File (MP4, WebM, Cloudinary)
        <div className="relative w-full h-full cursor-pointer" onClick={handlePlayPause}>
          <video
            ref={videoRef}
            src={video.url}
            className="w-full h-full object-cover"
            loop
            muted
            playsInline
            autoPlay
            preload="auto"
            onLoadedData={handleVideoLoaded}
            onPlaying={() => {
              setIsPlaying(true);
              setIsVideoLoading(false);
            }}
            onPause={() => setIsPlaying(false)}
          />

          {/* Video Loading Spinner */}
          {isVideoLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs">
              <FiLoader className="text-white text-3xl animate-spin" />
            </div>
          )}

          {/* Autoplay Blocked Fallback Overlay */}
          {autoplayBlocked && !isPlaying && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-20">
              <div className="w-14 h-14 rounded-full bg-[#14C6D8] text-white flex items-center justify-center shadow-lg animate-bounce">
                <FiPlay size={28} className="ml-1" />
              </div>
              <p className="text-white text-xs font-semibold mt-2">Tap to play</p>
            </div>
          )}

          {/* Overlay Controls */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* Play/Pause Center Indicator */}
            <button
              onClick={handlePlayPause}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white hover:bg-black/60 transition"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <FiPause size={22} /> : <FiPlay size={22} className="ml-0.5" />}
            </button>

            {/* Mute Button */}
            <button
              onClick={toggleMute}
              className="absolute bottom-16 right-3 w-9 h-9 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white hover:bg-black/80 transition z-10"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}
            </button>
          </div>

          {/* Bottom Caption Overlay */}
          <div className="absolute bottom-0 left-0 right-12 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
            <p className="text-white text-xs font-medium line-clamp-2 leading-relaxed">
              {video.caption || "Check this custom tumbler!"}
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-400">
          <p className="text-xs">Video unavailable</p>
        </div>
      )}

      {/* Engagement Floating Column (Right Side) */}
      <div className="absolute right-2 bottom-4 flex flex-col items-center gap-3 z-10">
        <motion.button
          onClick={handleLike}
          whileTap={{ scale: 1.25 }}
          className="flex flex-col items-center"
          aria-label="Like"
        >
          <div className="w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition">
            <FiHeart className={liked ? "fill-red-500 text-red-500" : ""} size={18} />
          </div>
          <span className="text-white text-[10px] font-semibold mt-0.5">{likesCount}</span>
        </motion.button>

        <button className="flex flex-col items-center" aria-label="Share">
          <div className="w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition">
            <FiShare2 size={18} />
          </div>
        </button>

        {!isDirectVideo && embedUrl?.includes("instagram") && (
          <div className="text-white text-[10px] font-semibold bg-black/60 backdrop-blur rounded-full px-2 py-0.5 flex items-center gap-1">
            <FiInstagram size={10} /> IG
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Section Component ────────────────────────────────
const UGCReels = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  // ─── Fetch UGC Banners from API ──────────────────────────
  useEffect(() => {
    const fetchUGC = async () => {
      try {
        const res = await bannerService.getActiveBanners({ section: "ugc" });
        const videoList = res?.banners?.[0]?.content?.videos || [];
        // Use API videos if they exist, otherwise show demo videos
        setVideos(videoList.length > 0 ? videoList : fallbackVideos);
      } catch (err) {
        console.error("Failed to fetch UGC videos:", err);
        setVideos(fallbackVideos);;
      } finally {
        setLoading(false);
      }
    };
    fetchUGC();
  }, []);

  // ─── Loading State ───────────────────────────────────────
  if (loading) {
    return (
      <section className="w-full py-16 bg-gradient-to-b from-[#EAF9FB]/40 via-white to-[#f0f8fa]">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
            Real People, <span className="text-[#14C6D8]">Real Style</span>
          </h2>
        </div>
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto px-4">
          {[...Array(5)].map((_, i) => (
            <ReelSkeleton key={i} />
          ))}
        </div>
        <div className="block md:hidden px-4">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-[260px] flex-shrink-0">
                <ReelSkeleton />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ─── Empty State ─────────────────────────────────────────
  if (videos.length === 0) {
    return (
      <section ref={sectionRef} className="w-full py-16 bg-gradient-to-b from-[#EAF9FB]/40 via-white to-[#f0f8fa]">
        <div className="text-center text-gray-500 max-w-md mx-auto px-4">
          <p className="text-base font-medium">No UGC videos yet. Be the first to share your custom tumbler!</p>
          <p className="text-sm mt-2">
            Tag us on social media with <span className="font-semibold text-[#14C6D8]">#MyTumblerStyle</span>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="w-full py-5 xs:py-16 bg-gradient-to-b from-[#EAF9FB]/40 via-white to-[#f0f8fa] overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
            Real People, <span className="text-[#14C6D8]">Real Style</span>
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            See how our customers customize and style their everyday tumblers.
          </p>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {videos.map((video, idx) => (
            <div key={idx} className="transition-transform duration-300 hover:-translate-y-1">
              <ReelCard video={video} />
            </div>
          ))}
        </div>

        {/* Mobile Horizontal Scroll Carousel */}
        <div className="block md:hidden">
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 scrollbar-hide px-2">
            {videos.map((video, idx) => (
              <div key={idx} className="w-[260px] flex-shrink-0 snap-center">
                <ReelCard video={video} />
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2">
            <span className="text-[11px] font-medium text-gray-400">← Swipe to explore more →</span>
          </div>
        </div>
      </div>

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

export default UGCReels;