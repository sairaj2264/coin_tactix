import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  AlertTriangle,
  Target,
  BarChart3,
  Clock
} from 'lucide-react'
import { fetchMarketData, setCurrentSymbol } from '../store/slices/marketSlice'
import { fetchStrategies } from '../store/slices/strategySlice'
import PriceChart from '../components/Charts/PriceChart'
import MetricsCard from '../components/Dashboard/MetricsCard'
import RecentAlerts from '../components/Dashboard/RecentAlerts'
import StrategyPerformance from '../components/Dashboard/StrategyPerformance'

const Dashboard = () => {
  const dispatch = useDispatch()
  const [selectedTimeframe, setSelectedTimeframe] = useState('1d')
  
  const {
    currentSymbol,
    realTimePrice,
    priceChange24h,
    ohlcvData,
    isLoading: marketLoading
  } = useSelector((state) => state.market)
  
  const {
    strategies,
    isLoading: strategyLoading
  } = useSelector((state) => state.strategy)
  
  const {
    notifications,
    activeAlerts
  } = useSelector((state) => state.alerts)

  useEffect(() => {
    // Fetch initial data
    dispatch(fetchMarketData({ symbol: currentSymbol, timeframe: selectedTimeframe }))
    dispatch(fetchStrategies())
  }, [dispatch, currentSymbol, selectedTimeframe])

  const cryptoSymbols = ['BTC', 'ETH', 'ADA', 'SOL', 'DOT', 'LINK']
  const timeframes = [
    { value: '1h', label: '1H' },
    { value: '4h', label: '4H' },
    { value: '1d', label: '1D' },
    { value: '1w', label: '1W' },
    { value: '1M', label: '1M' }
  ]

  const handleSymbolChange = (symbol) => {
    dispatch(setCurrentSymbol(symbol))
  }

  const formatPrice = (price) => {
    if (!price) return '--'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  const formatPriceChange = (change) => {
    if (!change) return '--'
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(2)}%`
  }

  // Mock data for demonstration
  const portfolioValue = 125430.50
  const portfolioChange = 2.34
  const totalPnL = 8234.12
  const winRate = 68.5

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
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
                  px-3 py-2 text-sm font-medium border
                  ${tf.value === selectedTimeframe
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }
                  ${tf === timeframes[0] ? 'rounded-l-md' : ''}
                  ${tf === timeframes[timeframes.length - 1] ? 'rounded-r-md' : ''}
                  ${tf !== timeframes[0] ? '-ml-px' : ''}
                `}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="Current Price"
          value={formatPrice(realTimePrice)}
          change={formatPriceChange(priceChange24h)}
          changeType={priceChange24h >= 0 ? 'positive' : 'negative'}
          icon={DollarSign}
        />
        
        <MetricsCard
          title="Portfolio Value"
          value={formatPrice(portfolioValue)}
          change={formatPriceChange(portfolioChange)}
          changeType={portfolioChange >= 0 ? 'positive' : 'negative'}
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
              <PriceChart 
                data={ohlcvData[currentSymbol] || []}
                symbol={currentSymbol}
                timeframe={selectedTimeframe}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Alerts */}
          <RecentAlerts 
            alerts={activeAlerts.slice(0, 5)}
            notifications={notifications.slice(0, 3)}
          />
          
          {/* Strategy Performance */}
          <StrategyPerformance 
            strategies={strategies.slice(0, 3)}
            isLoading={strategyLoading}
          />
        </div>
      </div>

      {/* Market Overview */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Market Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {cryptoSymbols.map((symbol) => (
            <div
              key={symbol}
              className={`
                p-4 rounded-lg border cursor-pointer transition-colors
                ${symbol === currentSymbol 
                  ? 'border-primary-200 bg-primary-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              onClick={() => handleSymbolChange(symbol)}
            >
              <div className="text-sm font-medium text-gray-900">{symbol}</div>
              <div className="text-lg font-semibold text-gray-900 mt-1">
                {symbol === currentSymbol ? formatPrice(realTimePrice) : '--'}
              </div>
              <div className={`text-sm mt-1 ${
                symbol === currentSymbol && priceChange24h >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {symbol === currentSymbol ? formatPriceChange(priceChange24h) : '--'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
