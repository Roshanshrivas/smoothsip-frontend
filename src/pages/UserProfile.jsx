import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Heart, Package, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import ProfileAvatar from "../components/profile/ProfileAvatar";
import ProfileFormFields from "../components/profile/ProfileFormFields";
import PasswordChangeForm from "../components/profile/PasswordChangeForm";

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [avatar, setAvatar] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (!storedUser || storedUser.role === "admin") {
      navigate("/login");
      return;
    }
    setUser(storedUser);
    setFormData({
      name: storedUser.name || "",
      email: storedUser.email || "",
      phone: storedUser.phone || "",
    });
    setAvatar(storedUser.avatar || null);
  }, [navigate]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const updatedUser = { ...user, ...formData, avatar };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    window.dispatchEvent(new Event("userUpdated"));
    setIsEditing(false);
    toast.success("Profile updated");
    setIsLoading(false);
  };

  const handlePasswordChange = async (pwdData) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Password changed");
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("userUpdated"));
    navigate("/login");
  };

  // Stats
  const stats = {
    orders: JSON.parse(localStorage.getItem("orders") || "[]").length,
    wishlist: JSON.parse(localStorage.getItem("wishlist") || "[]").length,
    cart: JSON.parse(localStorage.getItem("cart") || "[]").reduce((s, i) => s + i.quantity, 0),
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Account</h1>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg">
            <LogOut size={16} /> Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <ProfileAvatar avatar={avatar} onAvatarChange={setAvatar} name={user.name} />
              <div className="mt-4 text-center">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-semibold mb-3">Activity</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>📦 Orders</span><span>{stats.orders}</span></div>
                <div className="flex justify-between"><span>❤️ Wishlist</span><span>{stats.wishlist}</span></div>
                <div className="flex justify-between"><span>🛒 Cart items</span><span>{stats.cart}</span></div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="p-5 border-b flex justify-between">
                <h2 className="font-semibold">Personal Information</h2>
                {!isEditing && <button onClick={() => setIsEditing(true)} className="text-orange-500 text-sm">Edit</button>}
              </div>
              <form onSubmit={handleProfileUpdate} className="p-5">
                <ProfileFormFields formData={formData} setFormData={setFormData} isEditing={isEditing} />
                {isEditing && (
                  <div className="flex gap-3 mt-4">
                    <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded-xl">Save</button>
                    <button type="button" onClick={() => { setIsEditing(false); setFormData({ name: user.name, email: user.email, phone: user.phone }); }} className="border px-4 py-2 rounded-xl">Cancel</button>
                  </div>
                )}
              </form>
            </div>
            <PasswordChangeForm onPasswordChange={handlePasswordChange} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;