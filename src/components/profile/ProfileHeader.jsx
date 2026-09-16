import React, { useState } from "react";
import { Edit, Package, ShoppingBag, Users, DollarSign, Clock, Camera, Check, X, MapPin, Monitor, Smartphone } from "lucide-react";
import toast from "react-hot-toast";

const ProfileHeader = ({ admin, stats, onProfileUpdate, onStatsUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: admin.name,
    email: admin.email,
    phone: admin.phone,
    location: admin.location || "Kolkata, India",
  });
  const [avatar, setAvatar] = useState(admin.avatar || null);

  // Mock percentage data (replace with actual data from props)
  const percentages = [
    { label: "Sales Growth", value: 18.6, color: "bg-orange-500" },
    { label: "User Growth", value: 22.1, color: "bg-blue-500" },
    { label: "Order Increase", value: 16.3, color: "bg-green-500" },
    { label: "Revenue Increase", value: 32.4, color: "bg-purple-500" },
    { label: "Conversion Rate", value: 8.4, color: "bg-red-500" },
  ];

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
        onProfileUpdate({ ...admin, avatar: reader.result });
        toast.success("Avatar updated");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = () => {
    onProfileUpdate({ ...admin, ...formData });
    setIsEditing(false);
    toast.success("Profile updated");
  };

  const handlePasswordChange = () => {
    toast.success("Password change – integrate actual API");
  };

  const lastLogin = "Today, 10:35 AM";
  const device = "Chrome, Windows";

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 md:p-8">
        {/* Top Section: Avatar + Info + Actions */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          {/* Left: Avatar and basic info */}
          <div className="flex items-center gap-5">
            {/* Avatar with upload */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full ring-4 ring-white shadow-xl overflow-hidden bg-gradient-to-br from-orange-100 to-red-100">
                <img
                  src={avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${admin.name}`}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="absolute bottom-0 right-0 bg-orange-500 text-white p-1.5 rounded-full shadow-md cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Camera size={14} />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>

            {/* Name, email, phone, location, status */}
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-2xl font-bold border-2 border-orange-200 rounded-lg px-3 py-1 mb-1 focus:border-orange-500 outline-none"
                />
              ) : (
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{admin.name}</h2>
              )}
              
              {isEditing ? (
                <div className="mt-2 space-y-1">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="block text-sm border-2 border-gray-200 rounded-lg px-3 py-1 w-full focus:border-orange-500 outline-none"
                    placeholder="Email"
                  />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="block text-sm border-2 border-gray-200 rounded-lg px-3 py-1 w-full focus:border-orange-500 outline-none"
                    placeholder="Phone"
                  />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="block text-sm border-2 border-gray-200 rounded-lg px-3 py-1 w-full focus:border-orange-500 outline-none"
                    placeholder="Location"
                  />
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mt-1">{admin.email}</p>
                  <p className="text-sm text-gray-500">{admin.phone}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin size={14} className="text-gray-400" />
                    <p className="text-sm text-gray-500">{formData.location}</p>
                  </div>
                </>
              )}
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm text-gray-600">Account Status: <span className="font-medium text-green-600">Active</span></span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button onClick={handleProfileSave} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl shadow-md transition">
                  <Check size={16} /> Save
                </button>
                <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2.5 rounded-xl transition">
                  <X size={16} /> Cancel
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-orange-300 text-gray-700 px-5 py-2.5 rounded-xl transition hover:shadow-md">
                  <Edit size={16} /> Edit Profile
                </button>
                <button onClick={handlePasswordChange} className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-5 py-2.5 rounded-xl shadow-md transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Change Password
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats Row – exactly as image */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 text-center shadow-sm hover:shadow-md transition">
            <Package className="w-5 h-5 text-orange-600 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Total Products</p>
            <p className="text-xl font-bold text-gray-800">{stats.totalProducts.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center shadow-sm hover:shadow-md transition">
            <ShoppingBag className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Total Orders</p>
            <p className="text-xl font-bold text-gray-800">{stats.totalOrders.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 text-center shadow-sm hover:shadow-md transition">
            <Users className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Total Users</p>
            <p className="text-xl font-bold text-gray-800">{stats.totalUsers.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 text-center shadow-sm hover:shadow-md transition">
            <DollarSign className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Revenue Generated</p>
            <p className="text-xl font-bold text-gray-800">₹{stats.revenueGenerated.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 text-center shadow-sm hover:shadow-md transition">
            <Clock className="w-5 h-5 text-red-600 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Pending Orders</p>
            <p className="text-xl font-bold text-gray-800">{stats.pendingOrders.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;