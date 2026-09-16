import React from "react";
import { User, Mail, Phone } from "lucide-react";

const ProfileFormFields = ({ formData, setFormData, isEditing, disabled }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={!isEditing}
            className={`w-full pl-9 pr-3 py-2 border rounded-xl ${!isEditing ? "bg-gray-50" : "bg-white"}`}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={!isEditing}
            className={`w-full pl-9 pr-3 py-2 border rounded-xl ${!isEditing ? "bg-gray-50" : "bg-white"}`}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Phone Number</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            disabled={!isEditing}
            className={`w-full pl-9 pr-3 py-2 border rounded-xl ${!isEditing ? "bg-gray-50" : "bg-white"}`}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileFormFields;