import React, { useState, useEffect } from 'react'
import { Activity, Wifi, WifiOff } from 'lucide-react'

const RealTimeData = ({ symbol }) => {
  const [data, setData] = useState(null)
  const [connected, setConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    // Fetch initial data
    fetchRealTimeData()
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchRealTimeData, 10000) // Every 10 seconds
    
    return () => clearInterval(interval)
  }, [symbol])

  const fetchRealTimeData = async () => {
    try {
      setConnected(true)
      
      // Fetch multiple endpoints for comprehensive data
      const [priceRes, indicatorsRes, sentimentRes] = await Promise.all([
        fetch(`http://localhost:5000/api/market/price/${symbol}`),
        fetch(`http://localhost:5000/api/market/indicators/${symbol}`),
        fetch(`http://localhost:5000/api/market/sentiment`)
      ])

      const [priceData, indicatorsData, sentimentData] = await Promise.all([
        priceRes.json(),
        indicatorsRes.json(),
        sentimentRes.json()
      ])

      setData({
        price: priceData,
        indicators: indicatorsData.indicators,
        sentiment: sentimentData.sentiment
      })
      
      setLastUpdate(new Date())
      
    } catch (error) {
      console.error('Error fetching real-time data:', error)
      setConnected(false)
    }
  }

  const formatTime = (date) => {
    return date?.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  }

  const getRSIColor = (rsi) => {
    if (rsi >= 70) return 'text-red-600 bg-red-50'
    if (rsi <= 30) return 'text-green-600 bg-green-50'
    return 'text-yellow-600 bg-yellow-50'
  }

  const getSentimentColor = (index) => {
    if (index >= 75) return 'text-red-600'
    if (index >= 50) return 'text-yellow-600'
    if (index >= 25) return 'text-green-600'
    return 'text-red-600'
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-600" />
            Real-Time Data
          </h3>
          <div className="animate-pulse">
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-blue-600" />
          Real-Time Data
        </h3>
        <div className="flex items-center space-x-2">
          {connected ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          <span className="text-xs text-gray-500">
            {lastUpdate ? formatTime(lastUpdate) : '--:--:--'}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Current Price */}
        {data.price && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Price</span>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  ${data.price.price?.toLocaleString()}
                </div>
                <div className={`text-sm font-medium ${
                  data.price.change_24h >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {data.price.change_24h >= 0 ? '+' : ''}{data.price.change_24h?.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Technical Indicators */}
        {data.indicators && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Technical Indicators</h4>
            
            {/* RSI */}
            {data.indicators.rsi && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">RSI (14)</span>
                <span className={`text-sm font-medium px-2 py-1 rounded ${getRSIColor(data.indicators.rsi)}`}>
                  {data.indicators.rsi.toFixed(1)}
                </span>
              </div>
            )}

            {/* MACD */}
            {data.indicators.macd && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">MACD</span>
                <span className={`text-sm font-medium ${
                  data.indicators.macd >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {data.indicators.macd.toFixed(3)}
                </span>
              </div>
            )}

            {/* Moving Averages */}
            {data.indicators.sma_20 && data.indicators.sma_50 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">SMA Cross</span>
                <span className={`text-sm font-medium ${
                  data.indicators.sma_20 > data.indicators.sma_50 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {data.indicators.sma_20 > data.indicators.sma_50 ? 'Bullish' : 'Bearish'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Market Sentiment */}
        {data.sentiment && (
          <div className="pt-3 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Market Sentiment</h4>
            
            {/* Fear & Greed Index */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Fear & Greed</span>
              <div className="text-right">
                <div className={`text-sm font-medium ${getSentimentColor(data.sentiment.fear_greed_index)}`}>
                  {data.sentiment.fear_greed_index}
                </div>
                <div className="text-xs text-gray-500">
                  {data.sentiment.fear_greed_classification}
                </div>
              </div>
            </div>

            {/* News Sentiment */}
            {data.sentiment.news_sentiment && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">News Sentiment</span>
                <span className={`text-sm font-medium ${
                  data.sentiment.news_sentiment.score >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {data.sentiment.news_sentiment.classification}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Data Sources */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Sources: CoinGecko, yFinance</span>
            <button 
              onClick={fetchRealTimeData}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RealTimeData
