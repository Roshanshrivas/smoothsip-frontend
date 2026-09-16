import React, { useState, useEffect } from "react";
import { Globe, Edit2, Save, X } from "lucide-react";
import toast from "react-hot-toast";

const StoreSettingsCard = () => {
  const [settings, setSettings] = useState([
    { label: "Store Name", value: "Tumbler Store", editable: true },
    { label: "Currency", value: "INR (₹)", editable: true },
    { label: "Timezone", value: "Asia/Kolkata (GMT+05:30)", editable: false },
    { label: "Support Email", value: "support@tumbler.com", editable: true },
    { label: "Support Phone", value: "+91 9876543210", editable: true },
  ]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("storeSettings");
    if (saved) setSettings(JSON.parse(saved));
  }, []);

  const saveSetting = (index) => {
    const updated = [...settings];
    updated[index].value = editValue;
    setSettings(updated);
    localStorage.setItem("storeSettings", JSON.stringify(updated));
    setEditingIndex(null);
    toast.success(`${updated[index].label} updated`);
  };

  const startEdit = (index, currentValue) => {
    setEditingIndex(index);
    setEditValue(currentValue);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
            <Globe size={18} className="text-orange-500" />
          </div>
          <h3 className="font-semibold text-gray-800">Store Settings</h3>
        </div>
      </div>

      {/* Settings list */}
      <div className="p-5 space-y-3">
        {settings.map((item, idx) => (
          <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-2 border-b border-gray-100 last:border-0">
            <span className="text-sm text-gray-500 sm:w-1/3">{item.label}</span>
            <div className="flex items-center justify-between sm:justify-end gap-2 sm:w-2/3">
              {editingIndex === idx ? (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
                    autoFocus
                  />
                  <button onClick={() => saveSetting(idx)} className="text-green-600 hover:bg-green-50 p-1.5 rounded">
                    <Save size={16} />
                  </button>
                  <button onClick={() => setEditingIndex(null)} className="text-red-500 hover:bg-red-50 p-1.5 rounded">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-sm font-medium text-gray-800 text-right flex-1 sm:flex-none">{item.value}</span>
                  {item.editable && (
                    <button onClick={() => startEdit(idx, item.value)} className="text-gray-400 hover:text-orange-500 p-1">
                      <Edit2 size={14} />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer link */}
      <div className="px-5 pb-5 pt-2">
        <button className="text-orange-500 text-sm font-medium hover:underline flex items-center gap-1">
          Manage Store Settings →
        </button>
      </div>
    </div>
  );
};

export default StoreSettingsCard;