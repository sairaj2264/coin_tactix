import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

const MetricsCard = ({ title, value, change, changeType, icon: Icon }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${
              changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {changeType === 'positive' ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${
          changeType === 'positive' 
            ? 'bg-green-100 text-green-600' 
            : changeType === 'negative'
            ? 'bg-red-100 text-red-600'
            : 'bg-gray-100 text-gray-600'
        }`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}

export default MetricsCard
