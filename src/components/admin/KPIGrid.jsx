import React from "react";
import StatCard from "./StatCard";
import { DollarSign, ShoppingCart, Users, TrendingUp, Eye } from "lucide-react";

const KPIGrid = ({ data, formatCurrency, itemVariants }) => {
  const cards = [
    { title: "Total Sales", value: formatCurrency(data.totalSales), icon: DollarSign, color: "green", growth: data.salesGrowth },
    { title: "Total Orders", value: data.totalOrders.toLocaleString(), icon: ShoppingCart, color: "blue", growth: data.ordersGrowth },
    { title: "Total Customers", value: data.totalCustomers.toLocaleString(), icon: Users, color: "purple", growth: data.customersGrowth },
    { title: "Avg. Order Value", value: formatCurrency(data.avgOrderValue), icon: TrendingUp, color: "yellow", growth: data.avgOrderGrowth },
    { title: "Total Reviews", value: data.totalReviews.toLocaleString(), icon: Eye, color: "pink", growth: data.reviewsGrowth },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
      {cards.map((card, idx) => (
        <StatCard key={idx} {...card} itemVariants={itemVariants} />
      ))}
    </div>
  );
};

export default KPIGrid;