import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Play,
  Settings,
  BarChart3,
  Plus,
  Info,
  Calendar,
  DollarSign,
  Percent,
  Activity,
  Shield,
  AlertTriangle
} from "lucide-react";

const EnhancedStrategyList = () => {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedStrategy, setExpandedStrategy] = useState(null);

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

  const getRiskLevel = (sharpeRatio, maxDrawdown) => {
    if (sharpeRatio > 1.5 && maxDrawdown < 10) return { level: "Low", color: "text-green-600 bg-green-50" };
    if (sharpeRatio > 1 && maxDrawdown < 20) return { level: "Medium", color: "text-yellow-600 bg-yellow-50" };
    return { level: "High", color: "text-red-600 bg-red-50" };
  };

  const getStrategyDetails = (strategy) => {
    const details = {
      DCA: {
        description: "Dollar Cost Averaging systematically invests a fixed amount at regular intervals, reducing the impact of volatility through time diversification.",
        pros: [
          "Reduces timing risk through systematic investing",
          "Simple and disciplined approach",
          "Effective in volatile markets",
          "Requires minimal market knowledge"
        ],
        cons: [
          "May miss significant market opportunities",
          "Less effective in trending markets",
          "Requires long-term commitment",
          "May accumulate during downtrends"
        ],
        riskFactors: [
          "Market direction risk",
          "Opportunity cost in bull markets",
          "Requires consistent cash flow"
        ],
        bestFor: "Long-term investors seeking steady accumulation with reduced volatility impact"
      },
      Technical: {
        description: "Technical Analysis strategy uses price patterns, indicators, and market momentum to identify optimal entry and exit points.",
        pros: [
          "Can capitalize on short-term price movements",
          "Uses quantifiable market signals",
          "Adaptable to different market conditions",
          "Can provide quick profits in trending markets"
        ],
        cons: [
          "Requires active monitoring and expertise",
          "Higher transaction costs from frequent trading",
          "Susceptible to false signals and whipsaws",
          "Performance varies with market volatility"
        ],
        riskFactors: [
          "Signal accuracy risk",
          "High volatility exposure",
          "Emotional trading decisions",
          "Technology and execution risks"
        ],
        bestFor: "Active traders with market knowledge and time for regular monitoring"
      },
      Statistical: {
        description: "Statistical Arbitrage uses mathematical models to identify price discrepancies and mean reversion opportunities in the market.",
        pros: [
          "Data-driven approach with quantifiable edge",
          "Can profit in various market conditions",
          "Systematic and emotion-free execution",
          "Potential for consistent returns"
        ],
        cons: [
          "Requires sophisticated modeling and backtesting",
          "Model risk and parameter sensitivity",
          "May underperform in regime changes",
          "Requires significant computational resources"
        ],
        riskFactors: [
          "Model breakdown risk",
          "Market regime changes",
          "Liquidity and execution risks",
          "Over-optimization dangers"
        ],
        bestFor: "Quantitative investors with strong analytical skills and risk management discipline"
      }
    };
    return details[strategy.type] || details.DCA;
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
    <div className="space-y-6">
      {strategies.map((strategy) => {
        const riskLevel = getRiskLevel(strategy.performance.sharpe_ratio, Math.abs(strategy.performance.max_drawdown));
        const strategyDetails = getStrategyDetails(strategy);
        const isExpanded = expandedStrategy === strategy.id;

        return (
          <div
            key={strategy.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
          >
            {/* Main Strategy Card */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  {getStrategyIcon(strategy.type)}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{strategy.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{strategy.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Created: {new Date(strategy.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        Updated: {new Date(strategy.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${riskLevel.color}`}>
                    {riskLevel.level} Risk
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    strategy.is_active 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    {strategy.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => runBacktest(strategy.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    title="Run Backtest"
                  >
                    <Play className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setExpandedStrategy(isExpanded ? null : strategy.id)}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    title="View Details"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <DollarSign className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="text-sm text-gray-600">Symbol</div>
                  <div className="text-lg font-semibold text-gray-900">{strategy.symbol}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Percent className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="text-sm text-gray-600">Total Return</div>
                  <div className={`text-lg font-semibold ${getPerformanceColor(strategy.performance.total_return)}`}>
                    {strategy.performance.total_return >= 0 ? '+' : ''}{strategy.performance.total_return.toFixed(2)}%
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="text-sm text-gray-600">Win Rate</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {strategy.performance.win_rate.toFixed(1)}%
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Activity className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="text-sm text-gray-600">Sharpe Ratio</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {strategy.performance.sharpe_ratio.toFixed(2)}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="text-sm text-gray-600">Max Drawdown</div>
                  <div className="text-lg font-semibold text-red-600">
                    {strategy.performance.max_drawdown.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Strategy Parameters Preview */}
              {Object.keys(strategy.parameters).length > 0 && (
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Strategy Parameters</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(strategy.parameters).map(([key, value]) => (
                      <span key={key} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                        {key}: {typeof value === 'number' ? value.toFixed(2) : value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="border-t border-gray-100 p-6 bg-gray-50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Strategy Description */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Strategy Overview</h4>
                    <p className="text-sm text-gray-700 mb-4">{strategyDetails.description}</p>
                    <p className="text-sm text-blue-600 font-medium">{strategyDetails.bestFor}</p>
                  </div>

                  {/* Risk Factors */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Risk Factors
                    </h4>
                    <ul className="space-y-2">
                      {strategyDetails.riskFactors.map((risk, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pros */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                      Advantages
                    </h4>
                    <ul className="space-y-2">
                      {strategyDetails.pros.map((pro, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Cons */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <TrendingDown className="h-4 w-4 mr-2 text-red-600" />
                      Considerations
                    </h4>
                    <ul className="space-y-2">
                      {strategyDetails.cons.map((con, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {strategies.length === 0 && !loading && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No strategies found</h3>
          <p className="text-gray-600 mb-4">Create your first trading strategy to get started</p>
          <button className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Create Strategy
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedStrategyList;
