import React from 'react'
import { TrendingUp } from 'lucide-react'

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 lg:py-12 bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="mx-auto max-w-md">
          <div className="flex items-center mb-8">
            <TrendingUp className="h-12 w-12 text-white" />
            <h1 className="ml-3 text-3xl font-bold text-white">CoinTactix</h1>
          </div>
          
          <div className="space-y-6 text-white">
            <div>
              <h2 className="text-2xl font-semibold mb-4">
                Advanced Cryptocurrency Trading Intelligence
              </h2>
              <p className="text-primary-100 text-lg leading-relaxed">
                Harness the power of machine learning and real-time market analysis 
                to make informed trading decisions in the cryptocurrency market.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-primary-300 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium">Predictive Analytics</h3>
                  <p className="text-primary-100 text-sm">
                    LSTM and XGBoost models for accurate price predictions
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-primary-300 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium">Strategy Backtesting</h3>
                  <p className="text-primary-100 text-sm">
                    Test your strategies against historical data with detailed metrics
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-primary-300 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium">Real-time Alerts</h3>
                  <p className="text-primary-100 text-sm">
                    Custom notifications for price movements and market conditions
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-primary-300 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium">On-chain Analysis</h3>
                  <p className="text-primary-100 text-sm">
                    MVRV, SOPR, Puell Multiple and other fundamental metrics
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <TrendingUp className="h-8 w-8 text-primary-600" />
            <h1 className="ml-2 text-2xl font-bold text-gray-900">CoinTactix</h1>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
