import React from 'react'
import { BarChart3, Play, Settings, Download } from 'lucide-react'

const Backtesting = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Backtesting Simulator</h1>
          <p className="mt-1 text-sm text-gray-500">
            Test your strategies against historical data with detailed performance metrics
          </p>
        </div>
        <button className="btn-primary mt-4 sm:mt-0">
          <Play className="h-4 w-4 mr-2" />
          Run Backtest
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Backtest Configuration */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Backtest Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Strategy
                </label>
                <select className="input">
                  <option>DCA Bitcoin</option>
                  <option>Momentum Trading</option>
                  <option>Mean Reversion</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input type="date" className="input" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input type="date" className="input" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Capital
                </label>
                <input type="number" className="input" placeholder="$10,000" />
              </div>

              <button className="btn-secondary w-full">
                <Settings className="h-4 w-4 mr-2" />
                Advanced Settings
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Backtest Results
              </h2>
              <button className="btn-secondary">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
            
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Backtest Results
              </h3>
              <p className="text-gray-500 mb-4">
                Configure your backtest parameters and run a simulation to see detailed performance metrics.
              </p>
              <button className="btn-primary">
                <Play className="h-4 w-4 mr-2" />
                Run Your First Backtest
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Backtesting
