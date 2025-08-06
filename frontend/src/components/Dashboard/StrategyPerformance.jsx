import React from 'react'
import { Target, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

const StrategyPerformance = ({ strategies, isLoading }) => {
  // Mock data for demonstration
  const mockStrategies = [
    {
      id: 1,
      name: 'DCA Bitcoin',
      type: 'DCA',
      performance: 12.5,
      totalReturn: 2450.30,
      winRate: 68.5,
      status: 'active',
      lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      name: 'Momentum Trading',
      type: 'Technical',
      performance: -3.2,
      totalReturn: -156.80,
      winRate: 45.2,
      status: 'active',
      lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      name: 'Mean Reversion',
      type: 'Statistical',
      performance: 8.7,
      totalReturn: 1234.50,
      winRate: 72.1,
      status: 'paused',
      lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
  ]

  const displayStrategies = strategies.length > 0 ? strategies : mockStrategies

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatPercentage = (value) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'stopped':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Strategy Performance</h3>
          <Target className="h-5 w-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Strategy Performance</h3>
        <Target className="h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {displayStrategies.map((strategy) => (
          <div key={strategy.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">{strategy.name}</h4>
                <p className="text-xs text-gray-500">{strategy.type}</p>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(strategy.status)}`}>
                {strategy.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <div className="flex items-center space-x-1">
                  {strategy.performance >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    strategy.performance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(strategy.performance)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Performance</p>
              </div>

              <div>
                <div className="flex items-center space-x-1">
                  <BarChart3 className="h-3 w-3 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {strategy.winRate.toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-gray-500">Win Rate</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Total Return</span>
                <span className={`text-sm font-medium ${
                  strategy.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(strategy.totalReturn)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {displayStrategies.length === 0 && (
        <div className="text-center py-6">
          <Target className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No strategies created yet</p>
          <button className="mt-2 text-sm text-primary-600 hover:text-primary-500 font-medium">
            Create your first strategy
          </button>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="text-sm text-primary-600 hover:text-primary-500 font-medium">
          View all strategies →
        </button>
      </div>
    </div>
  )
}

export default StrategyPerformance
