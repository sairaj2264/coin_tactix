import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Plus,
  Wallet,
  Target,
} from "lucide-react";

const PortfolioPage = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/portfolio/");
      const data = await response.json();
      setPortfolio(data.portfolio);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      // Set empty portfolio - no fake data
      setPortfolio({
        total_value: 0,
        total_change_24h: 0,
        total_pnl: 0,
        holdings: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  const getPerformanceColor = (value) => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getPerformanceIcon = (value) => {
    if (value > 0) return <TrendingUp className="h-4 w-4" />;
    if (value < 0) return <TrendingDown className="h-4 w-4" />;
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your cryptocurrency investments and performance
          </p>
        </div>
        <button className="btn-primary mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Investment
        </button>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wallet className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(portfolio.total_value)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div
              className={`p-2 rounded-lg ${
                portfolio.total_change_24h >= 0 ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {getPerformanceIcon(portfolio.total_change_24h)}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">24h Change</p>
              <p
                className={`text-2xl font-bold ${getPerformanceColor(
                  portfolio.total_change_24h
                )}`}
              >
                {formatPercentage(portfolio.total_change_24h)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div
              className={`p-2 rounded-lg ${
                portfolio.total_pnl >= 0 ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <Target className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total P&L</p>
              <p
                className={`text-2xl font-bold ${getPerformanceColor(
                  portfolio.total_pnl
                )}`}
              >
                {formatCurrency(portfolio.total_pnl)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Holdings */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Holdings</h2>
          <button className="btn-secondary">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Chart
          </button>
        </div>

        {portfolio.holdings.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Holdings Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start building your cryptocurrency portfolio by adding your first
              investment
            </p>
            <button className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add First Investment
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    24h Change
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    P&L
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {portfolio.holdings.map((holding, index) => {
                  const pnl =
                    (holding.current_price - holding.avg_buy_price) *
                    holding.amount;
                  const pnlPercentage =
                    ((holding.current_price - holding.avg_buy_price) /
                      holding.avg_buy_price) *
                    100;

                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {holding.symbol}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {holding.symbol}
                            </div>
                            <div className="text-sm text-gray-500">
                              Avg: {formatCurrency(holding.avg_buy_price)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {holding.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(holding.current_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(holding.value)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div
                          className={`flex items-center ${getPerformanceColor(
                            holding.change_24h
                          )}`}
                        >
                          {getPerformanceIcon(holding.change_24h)}
                          <span className="ml-1">
                            {formatPercentage(holding.change_24h)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className={getPerformanceColor(pnl)}>
                          <div className="font-medium">
                            {formatCurrency(pnl)}
                          </div>
                          <div className="text-xs">
                            {formatPercentage(pnlPercentage)}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Portfolio Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Asset Allocation
          </h3>
          <div className="space-y-4">
            {portfolio.holdings.map((holding, index) => {
              const percentage = (holding.value / portfolio.total_value) * 100;
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                    <span className="text-sm font-medium text-gray-900">
                      {holding.symbol}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {percentage.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(holding.value)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Invested</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(portfolio.total_value - portfolio.total_pnl)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Current Value</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(portfolio.total_value)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Return</span>
              <span
                className={`text-sm font-medium ${getPerformanceColor(
                  portfolio.total_pnl
                )}`}
              >
                {formatCurrency(portfolio.total_pnl)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Return %</span>
              <span
                className={`text-sm font-medium ${getPerformanceColor(
                  portfolio.total_pnl
                )}`}
              >
                {formatPercentage(
                  (portfolio.total_pnl /
                    (portfolio.total_value - portfolio.total_pnl)) *
                    100
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;
