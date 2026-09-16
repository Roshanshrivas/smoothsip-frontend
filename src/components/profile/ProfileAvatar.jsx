import React, { useRef } from "react";
import { Camera } from "lucide-react";
import toast from "react-hot-toast";

const ProfileAvatar = ({ avatar, onAvatarChange, name }) => {
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => onAvatarChange(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="text-center">
      <div className="relative inline-block">
        <div className="w-28 h-28 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center overflow-hidden mx-auto">
          {avatar ? (
            <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl font-bold text-white">{name?.charAt(0).toUpperCase() || "U"}</span>
          )}
        </div>
        <button
          onClick={() => fileInputRef.current.click()}
          className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100"
        >
          <Camera size={16} className="text-gray-600" />
        </button>
        <input type="file" ref={fileInputRef} onChange={handleChange} accept="image/*" hidden />
      </div>
    </div>
  );
};

export default ProfileAvatar;