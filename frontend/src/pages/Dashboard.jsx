import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  AlertTriangle,
  Target,
  BarChart3,
  Clock,
} from "lucide-react";
import {
  fetchMarketData,
  setCurrentSymbol,
  updateRealTimePrice,
} from "../store/slices/marketSlice";
import { fetchStrategies } from "../store/slices/strategySlice";
import React19Chart from "../components/Charts/React19Chart";
import ErrorBoundary from "../components/ErrorBoundary";
import MetricsCard from "../components/Dashboard/MetricsCard";
import RecentAlerts from "../components/Dashboard/RecentAlerts";
import StrategyPerformance from "../components/Dashboard/StrategyPerformance";
import AIPredictionCard from "../components/Dashboard/AIPredictionCard";
import RealTimeData from "../components/Dashboard/RealTimeData";

const Dashboard = () => {
  const dispatch = useDispatch();
  const [selectedTimeframe, setSelectedTimeframe] = useState("1d");

  const {
    currentSymbol,
    realTimePrice,
    priceChange24h,
    ohlcvData,
    isLoading: marketLoading,
  } = useSelector((state) => state.market);

  const { strategies, isLoading: strategyLoading } = useSelector(
    (state) => state.strategy
  );

  // Mock alerts data since alerts slice might not exist
  const notifications = [];
  const activeAlerts = [];

  useEffect(() => {
    // Fetch initial data from backend
    dispatch(
      fetchMarketData({ symbol: currentSymbol, timeframe: selectedTimeframe })
    );
    dispatch(fetchStrategies());

    // Fetch real-time price every 30 seconds
    const priceInterval = setInterval(() => {
      fetch(`http://localhost:5000/api/market/price/${currentSymbol}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.price) {
            // Update real-time price in Redux store
            dispatch(
              updateRealTimePrice({
                price: data.price,
                change24h: data.change_24h,
              })
            );
          }
        })
        .catch((err) => console.log("Price fetch error:", err));
    }, 30000);

    // Initial price fetch
    fetch(`http://localhost:5000/api/market/price/${currentSymbol}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.price) {
          dispatch(
            updateRealTimePrice({
              price: data.price,
              change24h: data.change_24h,
            })
          );
        }
      })
      .catch((err) => console.log("Initial price fetch error:", err));

    return () => clearInterval(priceInterval);
  }, [dispatch, currentSymbol, selectedTimeframe]);

  const cryptoSymbols = ["BTC", "ETH", "ADA", "SOL", "DOT", "LINK"];
  const timeframes = [
    { value: "1h", label: "1H" },
    { value: "4h", label: "4H" },
    { value: "1d", label: "1D" },
    { value: "1w", label: "1W" },
    { value: "1M", label: "1M" },
  ];

  const handleSymbolChange = (symbol) => {
    dispatch(setCurrentSymbol(symbol));
  };

  const formatPrice = (price) => {
    if (!price) return "--";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatPriceChange = (change) => {
    if (!change) return "--";
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  };

  // Mock data for demonstration
  const portfolioValue = 125430.5;
  const portfolioChange = 2.34;
  const totalPnL = 8234.12;
  const winRate = 68.5;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="mt-2 text-base text-gray-600">
            Overview of your trading performance and market insights
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {/* Symbol selector */}
          <select
            value={currentSymbol}
            onChange={(e) => handleSymbolChange(e.target.value)}
            className="input w-24"
          >
            {cryptoSymbols.map((symbol) => (
              <option key={symbol} value={symbol}>
                {symbol}
              </option>
            ))}
          </select>

          {/* Timeframe selector */}
          <div className="flex rounded-md shadow-sm">
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setSelectedTimeframe(tf.value)}
                className={`
                  px-3 py-2 text-sm font-medium border transition-all duration-200
                  ${
                    tf.value === selectedTimeframe
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                  }
                  ${tf === timeframes[0] ? "rounded-l-md" : ""}
                  ${
                    tf === timeframes[timeframes.length - 1]
                      ? "rounded-r-md"
                      : ""
                  }
                  ${tf !== timeframes[0] ? "-ml-px" : ""}
                `}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        <MetricsCard
          title="Current Price"
          value={formatPrice(realTimePrice)}
          change={formatPriceChange(priceChange24h)}
          changeType={priceChange24h >= 0 ? "positive" : "negative"}
          icon={DollarSign}
        />

        <MetricsCard
          title="Portfolio Value"
          value={formatPrice(portfolioValue)}
          change={formatPriceChange(portfolioChange)}
          changeType={portfolioChange >= 0 ? "positive" : "negative"}
          icon={BarChart3}
        />

        <MetricsCard
          title="Total P&L"
          value={formatPrice(totalPnL)}
          change="+12.5%"
          changeType="positive"
          icon={TrendingUp}
        />

        <MetricsCard
          title="Win Rate"
          value={`${winRate}%`}
          change="+3.2%"
          changeType="positive"
          icon={Target}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price Chart */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {currentSymbol} Price Chart
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Real-time</span>
              </div>
            </div>

            {marketLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <ErrorBoundary fallbackMessage="Chart failed to load. The dashboard will continue to work without the chart.">
                <React19Chart
                  data={
                    ohlcvData && ohlcvData[currentSymbol]
                      ? ohlcvData[currentSymbol]
                      : []
                  }
                  symbol={currentSymbol}
                  timeframe={selectedTimeframe}
                />
              </ErrorBoundary>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Real-Time Data */}
          <RealTimeData symbol={currentSymbol} />
          {/* AI Prediction */}
          <AIPredictionCard symbol={currentSymbol} />
          {/* Recent Alerts */}
          <RecentAlerts
            alerts={activeAlerts.slice(0, 5)}
            notifications={notifications.slice(0, 3)}
          />
          {/* Strategy Performance */}
          // After
          <StrategyPerformance
            strategies={Array.isArray(strategies) ? strategies.slice(0, 3) : []}
            isLoading={strategyLoading}
          />
        </div>
      </div>

      {/* Market Sentiment & Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {/* Market Sentiment */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Market Sentiment
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Fear & Greed Index</span>
              <div className="flex items-center">
                <div className="w-20 h-2 bg-gray-200 rounded-full mr-3">
                  <div className="w-3/5 h-2 bg-orange-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-orange-600">
                  65 - Greed
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Social Sentiment</span>
              <span className="text-sm font-medium text-green-600">
                Positive (0.15)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">News Sentiment</span>
              <span className="text-sm font-medium text-green-600">
                Bullish (0.3)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Market Volatility</span>
              <span className="text-sm font-medium text-yellow-600">
                Medium
              </span>
            </div>
          </div>
        </div>

        {/* Top Movers */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Movers (24h)
          </h3>
          <div className="space-y-3">
            {[
              { symbol: "SOL", change: 8.4, price: 103.05 },
              { symbol: "ADA", change: 3.9, price: 0.52 },
              { symbol: "DOT", change: 4.2, price: 26.06 },
              { symbol: "LINK", change: -2.7, price: 14.6 },
            ].map((coin, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xs font-bold text-blue-600">
                      {coin.symbol}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{coin.symbol}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">${coin.price}</div>
                  <div
                    className={`text-xs ${
                      coin.change >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {coin.change >= 0 ? "+" : ""}
                    {coin.change}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Indicators */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Technical Indicators
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">RSI (14)</span>
              <div className="flex items-center">
                <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                  <div className="w-3/5 h-2 bg-yellow-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-yellow-600">
                  58.4
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">MACD</span>
              <span className="text-sm font-medium text-green-600">
                Bullish
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Bollinger Bands</span>
              <span className="text-sm font-medium text-blue-600">Middle</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Support</span>
              <span className="text-sm font-medium">
                ${formatPrice(realTimePrice * 0.95 || 108000)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Resistance</span>
              <span className="text-sm font-medium">
                ${formatPrice(realTimePrice * 1.05 || 120000)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Market Overview */}
      <div className="card mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Market Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {cryptoSymbols.map((symbol) => (
            <div
              key={symbol}
              className={`
                p-4 rounded-lg border cursor-pointer transition-colors
                ${
                  symbol === currentSymbol
                    ? "border-primary-200 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                }
              `}
              onClick={() => handleSymbolChange(symbol)}
            >
              <div className="text-sm font-medium text-gray-900">{symbol}</div>
              <div className="text-lg font-semibold text-gray-900 mt-1">
                {symbol === currentSymbol ? formatPrice(realTimePrice) : "--"}
              </div>
              <div
                className={`text-sm mt-1 ${
                  symbol === currentSymbol && priceChange24h >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {symbol === currentSymbol
                  ? formatPriceChange(priceChange24h)
                  : "--"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
