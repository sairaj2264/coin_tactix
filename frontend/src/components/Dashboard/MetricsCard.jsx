import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const MetricsCard = ({ title, value, change, changeType, icon: Icon }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">
            {value}
          </p>
          {change && (
            <div
              className={`flex items-center mt-3 text-sm font-medium ${
                changeType === "positive" ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {changeType === "positive" ? (
                <TrendingUp className="h-4 w-4 mr-1.5" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1.5" />
              )}
              <span>{change}</span>
              <span className="text-gray-500 ml-1">24h</span>
            </div>
          )}
        </div>
        <div
          className={`p-4 rounded-xl ${
            changeType === "positive"
              ? "bg-emerald-50 text-emerald-600"
              : changeType === "negative"
              ? "bg-red-50 text-red-600"
              : "bg-blue-50 text-blue-600"
          }`}
        >
          <Icon className="h-7 w-7" />
        </div>
      </div>
    </div>
  );
};

export default MetricsCard;
