import React, { useState, useEffect } from 'react'
import { 
  Play, 
  BarChart3, 
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react'

const BacktestingPage = () => {
  const [strategies, setStrategies] = useState([])
  const [selectedStrategy, setSelectedStrategy] = useState(null)
  const [backtestParams, setBacktestParams] = useState({
    start_date: '2023-01-01',
    end_date: '2024-01-01',
    initial_capital: 10000
  })
  const [backtestResults, setBacktestResults] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStrategies()
  }, [])

  const fetchStrategies = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/strategies/')
      const data = await response.json()
      setStrategies(data.strategies || [])
      if (data.strategies && data.strategies.length > 0) {
        setSelectedStrategy(data.strategies[0])
      }
    } catch (error) {
      console.error('Error fetching strategies:', error)
    } finally {
      setLoading(false)
    }
  }

  const runBacktest = async () => {
    if (!selectedStrategy) return
    
    setIsRunning(true)
    try {
      const response = await fetch(`http://localhost:5000/api/strategies/${selectedStrategy.id}/backtest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backtestParams)
      })
      
      const data = await response.json()
      setBacktestResults(data.backtest_results)
    } catch (error) {
      console.error('Error running backtest:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const handleParamChange = (param, value) => {
    setBacktestParams(prev => ({
      ...prev,
      [param]: value
    }))
  }

  const getPerformanceColor = (value) => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Strategy Backtesting</h1>
          <p className="mt-1 text-sm text-gray-500">
            Test your trading strategies against historical data
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={runBacktest}
            disabled={isRunning || !selectedStrategy}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Backtest
              </>
            )}
          </button>
          {backtestResults && (
            <button className="btn-secondary">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Strategy Selection */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategy Selection</h3>
            <div className="space-y-3">
              {strategies.map((strategy) => (
                <div
                  key={strategy.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedStrategy?.id === strategy.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedStrategy(strategy)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{strategy.name}</h4>
                      <p className="text-sm text-gray-600">{strategy.symbol} • {strategy.type}</p>
                    </div>
                    <div className={`text-sm font-medium ${getPerformanceColor(strategy.performance.total_return)}`}>
                      {formatPercentage(strategy.performance.total_return)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Backtest Parameters */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Backtest Parameters</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={backtestParams.start_date}
                  onChange={(e) => handleParamChange('start_date', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={backtestParams.end_date}
                  onChange={(e) => handleParamChange('end_date', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Capital ($)
                </label>
                <input
                  type="number"
                  value={backtestParams.initial_capital}
                  onChange={(e) => handleParamChange('initial_capital', parseFloat(e.target.value))}
                  min="1000"
                  step="1000"
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Strategy Details */}
          {selectedStrategy && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategy Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">{selectedStrategy.name}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className="ml-2 font-medium">{selectedStrategy.type}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Symbol:</span>
                  <span className="ml-2 font-medium">{selectedStrategy.symbol}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Description:</span>
                  <p className="mt-1 text-sm text-gray-700">{selectedStrategy.description}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {backtestResults ? (
            <>
              {/* Performance Metrics */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(backtestResults.final_capital)}
                    </div>
                    <div className="text-sm text-gray-600">Final Capital</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className={`text-2xl font-bold ${getPerformanceColor(backtestResults.total_return)}`}>
                      {formatPercentage(backtestResults.total_return)}
                    </div>
                    <div className="text-sm text-gray-600">Total Return</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {backtestResults.sharpe_ratio.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Sharpe Ratio</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      -{backtestResults.max_drawdown.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Max Drawdown</div>
                  </div>
                </div>
              </div>

              {/* Trade Statistics */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Trade Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{backtestResults.total_trades}</div>
                    <div className="text-sm text-gray-600">Total Trades</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-green-600">{backtestResults.winning_trades}</div>
                    <div className="text-sm text-gray-600">Winning Trades</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{backtestResults.win_rate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Win Rate</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{backtestResults.duration_days}</div>
                    <div className="text-sm text-gray-600">Days</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card">
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Backtest Results</h3>
                <p className="text-gray-600 mb-4">
                  Select a strategy and configure parameters to run a backtest
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BacktestingPage
