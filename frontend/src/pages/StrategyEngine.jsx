import React from "react";
import { Target, Plus, Settings, TrendingUp } from "lucide-react";
import EnhancedStrategyList from "../components/Strategy/EnhancedStrategyList";
import InvestmentPredictor from "../components/Strategy/InvestmentPredictor";

const StrategyEngine = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Strategy Engine</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage your trading strategies with AI-powered
            predictions
          </p>
        </div>
        <button className="btn-primary mt-4 sm:mt-0">
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
    </div>
  );
};

export default StrategyEngine;
