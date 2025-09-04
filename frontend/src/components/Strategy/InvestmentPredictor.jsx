import React, { useState } from "react";
import {
  Brain,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

const InvestmentPredictor = () => {
  const [formData, setFormData] = useState({
    symbol: "BTC",
    timeframe: "1d",
    investment_amount: 1000,
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const symbols = ["BTC", "ETH", "ADA", "SOL", "DOT", "LINK"];
  const timeframes = [
    { value: "1d", label: "1 Day" },
    { value: "1w", label: "1 Week" },
    { value: "1m", label: "1 Month" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "investment_amount" ? parseFloat(value) || 0 : value,
    }));
  };

  const getPrediction = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/strategies/predictions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      setPrediction(data.prediction);
    } catch (error) {
      console.error("Error getting prediction:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDirectionIcon = (direction) => {
    switch (direction) {
      case "bullish":
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case "bearish":
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <Target className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case "Low":
        return "text-green-600 bg-green-50 border-green-200";
      case "Medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "High":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <Brain className="h-6 w-6 text-blue-600 mr-3" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            AI Investment Predictor
          </h2>
          <p className="text-sm text-gray-600">
            Get AI-powered predictions for your investment strategy
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cryptocurrency
            </label>
            <select
              name="symbol"
              value={formData.symbol}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {symbols.map((symbol) => (
                <option key={symbol} value={symbol}>
                  {symbol}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Horizon
            </label>
            <select
              name="timeframe"
              value={formData.timeframe}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {timeframes.map((tf) => (
                <option key={tf.value} value={tf.value}>
                  {tf.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Investment Amount ($)
            </label>
            <input
              type="number"
              name="investment_amount"
              value={formData.investment_amount}
              onChange={handleInputChange}
              min="100"
              max="1000000"
              step="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Get Prediction Button */}
        <button
          onClick={getPrediction}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Zap className="h-5 w-5" />
              <span>Get AI Prediction</span>
            </>
          )}
        </button>

        {/* Prediction Results */}
        {prediction && (
          <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Investment Analysis
              </h3>
              <div className="flex items-center space-x-2">
                {getDirectionIcon(prediction.direction)}
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {prediction.direction}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price Prediction */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Price Forecast</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Current Price:
                    </span>
                    <span className="font-medium">
                      ${prediction.current_price?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Predicted Price:
                    </span>
                    <span className="font-medium">
                      ${prediction.predicted_price?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Expected Change:
                    </span>
                    <span
                      className={`font-medium ${
                        prediction.price_change_percent >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {prediction.price_change_percent >= 0 ? "+" : ""}
                      {prediction.price_change_percent?.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Investment Analysis */}
              {prediction.investment_analysis && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">
                    Investment Impact
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Investment:</span>
                      <span className="font-medium">
                        $
                        {prediction.investment_analysis.investment_amount?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Potential Profit:
                      </span>
                      <span
                        className={`font-medium ${
                          prediction.investment_analysis.potential_profit >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {prediction.investment_analysis.potential_profit >= 0
                          ? "+"
                          : ""}
                        $
                        {prediction.investment_analysis.potential_profit?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Risk Level:</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium border ${getRiskColor(
                          prediction.investment_analysis.risk_level
                        )}`}
                      >
                        {prediction.investment_analysis.risk_level}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confidence and Model Info */}
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Confidence:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          prediction.confidence >= 0.8
                            ? "bg-green-500"
                            : prediction.confidence >= 0.6
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${prediction.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {(prediction.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {prediction.model_type}
                </span>
              </div>
            </div>

            {/* Key Factors */}
            {prediction.factors && prediction.factors.length > 0 && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Key Analysis Factors
                </h4>
                <ul className="space-y-1">
                  {prediction.factors.slice(0, 3).map((factor, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-600 flex items-start"
                    >
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentPredictor;
