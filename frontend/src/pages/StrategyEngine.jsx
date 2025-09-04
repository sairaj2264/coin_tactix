import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Target, Plus, Settings, TrendingUp } from "lucide-react";
import EnhancedStrategyList from "../components/Strategy/EnhancedStrategyList";
import InvestmentPredictor from "../components/Strategy/InvestmentPredictor";
import { createYearlyStrategy } from "../store/slices/strategySlice";

const StrategyEngine = () => {
  const [config, setConfig] = useState({
    timeframe: "1d",
    risk_level: "moderate",
    initial_capital: 10000,
    target_return: 0.2,
    stop_loss: 0.15,
    max_position_size: 0.1,
  });

  const [activeTab, setActiveTab] = useState("yearly");
  const dispatch = useDispatch();

  const handleStrategyCreate = async () => {
    await dispatch(createYearlyStrategy({ symbol: "BTC", config }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Strategy Engine</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage your trading strategies with AI-powered predictions
          </p>
        </div>
        <button className="btn-primary mt-4 sm:mt-0" onClick={handleStrategyCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Strategy
        </button>
      </div>

      {/* AI Investment Predictor */}
      <InvestmentPredictor />

      {/* Strategy List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Your Strategies
          </h2>
          <button className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            New Strategy
          </button>
        </div>
        <EnhancedStrategyList />
      </div>

      <div className="mb-6">
        <div className="flex space-x-4 mt-4">
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "yearly"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("yearly")}
          >
            Yearly Strategy
          </button>
          {/* Other tabs */}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="strategy-config space-y-4">
          {/* Strategy Configuration Form */}
        </div>
        <div className="strategy-preview">
          {/* Strategy Preview Component */}
        </div>
      </div>
    </div>
  );
};

export default StrategyEngine;
