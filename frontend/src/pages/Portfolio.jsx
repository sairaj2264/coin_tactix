import React from 'react'
import { Briefcase, Plus, TrendingUp } from 'lucide-react'

const Portfolio = () => {
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
          Add Transaction
        </button>
      </div>

      <div className="text-center py-12">
        <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Portfolio Empty
        </h3>
        <p className="text-gray-500 mb-4">
          Add your first transaction to start tracking your portfolio performance.
        </p>
        <button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Your First Transaction
        </button>
      </div>
    </div>
  )
}

export default Portfolio
