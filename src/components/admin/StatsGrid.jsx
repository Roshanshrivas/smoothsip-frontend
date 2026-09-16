// src/components/admin/StatsGrid.jsx
import React from "react";
import StatCard from "./StatCard";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 12 } },
};

const StatsGrid = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
      {stats.map((stat, idx) => (
        <StatCard key={idx} {...stat} itemVariants={itemVariants} />
      ))}
    </div>
  );
};

export default StatsGrid;