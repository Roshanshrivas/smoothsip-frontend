import React, { useState } from "react";
import { User, Edit2, Save, X, Mail, Phone, Calendar, Shield } from "lucide-react";
import toast from "react-hot-toast";

const PersonalInfoCard = ({ admin, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: admin.name,
    email: admin.email,
    phone: admin.phone,
  });

  const handleSave = () => {
    onUpdate({ ...admin, ...formData });
    setIsEditing(false);
    toast.success("Personal info updated");
  };

  const InfoField = ({ icon, label, value, field, isEditable = true }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-xs text-gray-400">{label}</p>
          {isEditing && isEditable ? (
            <input
              type={field === "email" ? "email" : "text"}
              value={formData[field]}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              className="mt-1 border-2 border-gray-200 rounded-lg px-3 py-1.5 text-sm w-48 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none transition"
            />
          ) : (
            <p className="text-sm font-medium text-gray-700 mt-0.5">{value || "—"}</p>
          )}
        </div>
      </div>
      {!isEditing && isEditable && (
        <button
          onClick={() => setIsEditing(true)}
          className="text-gray-400 hover:text-orange-500 transition"
        >
          <Edit2 size={14} />
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
            <User size={18} className="text-orange-500" />
          </div>
          <h3 className="font-semibold text-gray-800">Personal Information</h3>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-orange-50 transition"
          >
            <Edit2 size={12} /> Edit
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-5 pb-5">
        <InfoField icon={<Mail size={16} className="text-gray-400" />} label="Email" value={admin.email} field="email" />
        <InfoField icon={<Phone size={16} className="text-gray-400" />} label="Phone" value={admin.phone} field="phone" />
        <InfoField icon={<User size={16} className="text-gray-400" />} label="Full Name" value={admin.name} field="name" />
        <InfoField icon={<Shield size={16} className="text-gray-400" />} label="Role" value="Super Admin" isEditable={false} />
        <InfoField icon={<Calendar size={16} className="text-gray-400" />} label="Joined" value="15 Jan 2024" isEditable={false} />
      </div>

      {/* Edit mode footer */}
      {isEditing && (
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition shadow-sm"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default PersonalInfoCard;