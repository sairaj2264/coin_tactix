import React, { useState, useEffect } from 'react'
import { Brain, TrendingUp, TrendingDown, Target, Zap } from 'lucide-react'

const AIPredictionCard = ({ symbol }) => {
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPrediction()
  }, [symbol])

  const fetchPrediction = async () => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:5000/api/market/prediction/${symbol}`)
      const data = await response.json()
      setPrediction(data.prediction)
    } catch (error) {
      console.error('Error fetching prediction:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDirectionIcon = (direction) => {
    switch (direction) {
      case 'bullish':
        return <TrendingUp className="h-5 w-5 text-green-500" />
      case 'bearish':
        return <TrendingDown className="h-5 w-5 text-red-500" />
      default:
        return <Target className="h-5 w-5 text-gray-500" />
    }
  }

  const getDirectionColor = (direction) => {
    switch (direction) {
      case 'bullish':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'bearish':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Brain className="h-5 w-5 mr-2 text-blue-600" />
            AI Prediction
          </h3>
          <Zap className="h-5 w-5 text-blue-500 animate-pulse" />
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (!prediction) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Brain className="h-5 w-5 mr-2 text-blue-600" />
            AI Prediction
          </h3>
        </div>
        <div className="text-center py-4">
          <p className="text-gray-500">Unable to load prediction</p>
          <button 
            onClick={fetchPrediction}
            className="mt-2 text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Brain className="h-5 w-5 mr-2 text-blue-600" />
          AI Prediction
        </h3>
        <div className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center space-x-1 ${getDirectionColor(prediction.direction)}`}>
          {getDirectionIcon(prediction.direction)}
          <span className="capitalize">{prediction.direction}</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Price Prediction */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Current Price</p>
            <p className="text-lg font-semibold text-gray-900">
              ${prediction.current_price?.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Predicted Price</p>
            <p className="text-lg font-semibold text-gray-900">
              ${prediction.predicted_price?.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Price Change */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Expected Change</span>
          <span className={`text-sm font-medium ${
            prediction.price_change_percent >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {prediction.price_change_percent >= 0 ? '+' : ''}{prediction.price_change_percent?.toFixed(2)}%
          </span>
        </div>

        {/* Confidence */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Confidence</span>
          <div className="flex items-center space-x-2">
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  prediction.confidence >= 0.8 ? 'bg-green-500' :
                  prediction.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${(prediction.confidence * 100)}%` }}
              ></div>
            </div>
            <span className={`text-sm font-medium ${getConfidenceColor(prediction.confidence)}`}>
              {(prediction.confidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Model Info */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{prediction.model_type}</span>
            <span>{prediction.timeframe} forecast</span>
          </div>
        </div>

        {/* Key Factors */}
        {prediction.factors && prediction.factors.length > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-2">Key Factors</p>
            <ul className="space-y-1">
              {prediction.factors.slice(0, 2).map((factor, index) => (
                <li key={index} className="text-xs text-gray-600 flex items-start">
                  <span className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Refresh Button */}
        <button 
          onClick={fetchPrediction}
          className="w-full mt-4 py-2 px-4 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <Zap className="h-4 w-4" />
          <span>Refresh Prediction</span>
        </button>
      </div>
    </div>
  )
}

export default AIPredictionCard
