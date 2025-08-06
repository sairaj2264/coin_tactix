import React from 'react'
import { Target, Plus, Settings, TrendingUp } from 'lucide-react'

const StrategyEngine = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Strategy Engine</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage your trading strategies with AI-powered predictions
          </p>
        </div>
        <button className="btn-primary mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          Create Strategy
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Strategy Creation Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Prediction & Strategy Engine
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cryptocurrency
                  </label>
                  <select className="input">
                    <option>Bitcoin (BTC)</option>
                    <option>Ethereum (ETH)</option>
                    <option>Cardano (ADA)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Investment Amount
                  </label>
                  <input type="number" className="input" placeholder="$1,000" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Horizon
                  </label>
                  <select className="input">
                    <option>1 Week</option>
                    <option>1 Month</option>
                    <option>3 Months</option>
                    <option>6 Months</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Risk Level
                  </label>
                  <select className="input">
                    <option>Conservative</option>
                    <option>Moderate</option>
                    <option>Aggressive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stop Loss (%)
                </label>
                <input type="number" className="input" placeholder="5" />
              </div>

              <button className="btn-primary w-full">
                <TrendingUp className="h-4 w-4 mr-2" />
                Generate Prediction
              </button>
            </div>
          </div>
        </div>

        {/* Prediction Results */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              AI Prediction
            </h3>
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Configure your strategy parameters and click "Generate Prediction" to see AI-powered insights.
              </p>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Risk Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Confidence Score</span>
                <span className="text-sm font-medium">--</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Expected Return</span>
                <span className="text-sm font-medium">--</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Max Drawdown</span>
                <span className="text-sm font-medium">--</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Sharpe Ratio</span>
                <span className="text-sm font-medium">--</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StrategyEngine
