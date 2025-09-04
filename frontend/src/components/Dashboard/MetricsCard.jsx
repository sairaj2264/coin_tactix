import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

const MetricsCard = ({ data }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold">{data.title}</h3>
      <div className="mt-2">
        <div className="text-2xl font-bold">
          {formatCurrency(data.value, "INR")}
        </div>
        <div className="text-sm text-gray-500">
          {formatCurrency(data.usdValue, "USD")}
        </div>
      </div>
    </div>
  );
};

export default MetricsCard;
