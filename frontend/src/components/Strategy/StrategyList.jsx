import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Play,
  Pause,
  Settings,
  BarChart3,
  Plus,
} from "lucide-react";

const StrategyList = () => {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/strategies/");
      const data = await response.json();
      setStrategies(data.strategies || []);
    } catch (error) {
      console.error("Error fetching strategies:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (returnValue) => {
    if (returnValue > 0) return "text-green-600";
    if (returnValue < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getStrategyIcon = (type) => {
    switch (type) {
      case "DCA":
        return <Target className="h-5 w-5 text-blue-600" />;
      case "Technical":
        return <BarChart3 className="h-5 w-5 text-purple-600" />;
      case "Statistical":
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      default:
        return <Target className="h-5 w-5 text-gray-600" />;
    }
  };

  const runBacktest = async (strategyId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/strategies/${strategyId}/backtest`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            start_date: "2023-01-01",
            end_date: "2024-01-01",
            initial_capital: 10000,
          }),
        }
      );

      const data = await response.json();

      if (data.backtest_results) {
        alert(
          `Backtest completed!\nTotal Return: ${data.backtest_results.total_return}%\nSharpe Ratio: ${data.backtest_results.sharpe_ratio}`
        );
      }
    } catch (error) {
      console.error("Error running backtest:", error);
      alert("Error running backtest");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {strategies.map((strategy) => (
        <div
          key={strategy.id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {getStrategyIcon(strategy.type)}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {strategy.name}
                </h3>
                <p className="text-sm text-gray-600">{strategy.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  strategy.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {strategy.is_active ? "Active" : "Inactive"}
              </span>
              <button
                onClick={() => runBacktest(strategy.id)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                title="Run Backtest"
              >
                <Play className="h-4 w-4" />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Symbol</p>
              <p className="text-lg font-semibold text-gray-900">
                {strategy.symbol}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Return</p>
              <p
                className={`text-lg font-semibold ${getPerformanceColor(
                  strategy.performance.total_return
                )}`}
              >
                {strategy.performance.total_return >= 0 ? "+" : ""}
                {strategy.performance.total_return.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Win Rate</p>
              <p className="text-lg font-semibold text-gray-900">
                {strategy.performance.win_rate.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sharpe Ratio</p>
              <p className="text-lg font-semibold text-gray-900">
                {strategy.performance.sharpe_ratio.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Type: {strategy.type}</span>
              <span>
                Max Drawdown: {strategy.performance.max_drawdown.toFixed(1)}%
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Updated: {new Date(strategy.updated_at).toLocaleDateString()}
            </div>
          </div>

          {/* Strategy Parameters Preview */}
          {Object.keys(strategy.parameters).length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Parameters
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(strategy.parameters)
                  .slice(0, 3)
                  .map(([key, value]) => (
                    <span
                      key={key}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {key}:{" "}
                      {typeof value === "number" ? value.toFixed(2) : value}
                    </span>
                  ))}
                {Object.keys(strategy.parameters).length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                    +{Object.keys(strategy.parameters).length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {strategies.length === 0 && !loading && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No strategies found
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first trading strategy to get started
          </p>
          <button className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Create Strategy
          </button>
        </div>
      )}
    </div>
  );
};

export default StrategyList;
