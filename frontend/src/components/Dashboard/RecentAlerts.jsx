import React from 'react'
import { AlertTriangle, TrendingUp, TrendingDown, Info, Bell } from 'lucide-react'

const RecentAlerts = ({ alerts, notifications }) => {
  const getAlertIcon = (type) => {
    switch (type) {
      case 'price_above':
      case 'bullish':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'price_below':
      case 'bearish':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'danger':
      case 'error':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Bell className="h-4 w-4 text-blue-500" />
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  // Mock data for demonstration
  const mockAlerts = [
    {
      id: 1,
      type: 'price_above',
      title: 'BTC Price Alert',
      message: 'Bitcoin reached $47,500',
      triggeredAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      currentValue: 47500
    },
    {
      id: 2,
      type: 'warning',
      title: 'High Volatility',
      message: 'ETH showing unusual volatility',
      triggeredAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      currentValue: 3200
    }
  ]

  const mockNotifications = [
    {
      id: 1,
      type: 'success',
      title: 'Strategy Update',
      message: 'DCA Strategy performed +2.3% today',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: false
    },
    {
      id: 2,
      type: 'info',
      title: 'Market News',
      message: 'Bitcoin ETF approval rumors circulating',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: true
    }
  ]

  const displayAlerts = alerts.length > 0 ? alerts : mockAlerts
  const displayNotifications = notifications.length > 0 ? notifications : mockNotifications

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <Bell className="h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {/* Active Alerts */}
        {displayAlerts.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Active Alerts</h4>
            <div className="space-y-2">
              {displayAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex-shrink-0 mt-0.5">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(alert.triggeredAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Notifications */}
        {displayNotifications.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Notifications</h4>
            <div className="space-y-2">
              {displayNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${
                    !notification.read 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(notification.timestamp)}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {displayAlerts.length === 0 && displayNotifications.length === 0 && (
          <div className="text-center py-6">
            <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No recent activity</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="text-sm text-primary-600 hover:text-primary-500 font-medium">
          View all alerts →
        </button>
      </div>
    </div>
  )
}

export default RecentAlerts
