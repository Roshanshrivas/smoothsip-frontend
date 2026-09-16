import React from "react";

const StatCard = ({ icon, title, value }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <h4 className="font-bold text-lg">{value}</h4>
      </div>
    </div>
  );
};

export default StatCard;