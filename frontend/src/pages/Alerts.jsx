import React from 'react'
import { Bell, Plus, Settings } from 'lucide-react'

const Alerts = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts & Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">
            Set up custom alerts for price movements and market conditions
          </p>
        </div>
        <button className="btn-primary mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          Create Alert
        </button>
      </div>

      <div className="text-center py-12">
        <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Alerts Configured
        </h3>
        <p className="text-gray-500 mb-4">
          Create your first alert to get notified about important market movements.
        </p>
        <button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Create Your First Alert
        </button>
      </div>
    </div>
  )
}

export default Alerts
