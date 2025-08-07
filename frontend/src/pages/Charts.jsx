import React, { useState, useEffect } from 'react'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { TrendingUp, BarChart3, PieChart, Activity, RefreshCw } from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const Charts = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('BTC')
  const [timeframe, setTimeframe] = useState('1d')
  const [priceData, setPriceData] = useState(null)
  const [marketOverview, setMarketOverview] = useState(null)
  const [indicators, setIndicators] = useState(null)
  const [loading, setLoading] = useState(true)

  const symbols = ['BTC', 'ETH', 'ADA', 'SOL', 'DOT', 'LINK']
  const timeframes = [
    { value: '1h', label: '1 Hour' },
    { value: '1d', label: '1 Day' },
    { value: '1w', label: '1 Week' },
    { value: '1M', label: '1 Month' }
  ]

  useEffect(() => {
    fetchAllData()
  }, [selectedSymbol, timeframe])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [priceRes, overviewRes, indicatorsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/market/ohlcv/${selectedSymbol}?timeframe=${timeframe}&limit=50`),
        fetch('http://localhost:5000/api/market/overview'),
        fetch(`http://localhost:5000/api/market/indicators/${selectedSymbol}`)
      ])

      const [priceData, overviewData, indicatorsData] = await Promise.all([
        priceRes.json(),
        overviewRes.json(),
        indicatorsRes.json()
      ])

      setPriceData(priceData.data || [])
      setMarketOverview(overviewData.overview || [])
      setIndicators(indicatorsData.indicators || null)
    } catch (error) {
      console.error('Error fetching chart data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Price Chart Data
  const priceChartData = priceData ? {
    labels: priceData.map(item => new Date(item.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: `${selectedSymbol} Price`,
        data: priceData.map(item => item.close),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
        fill: true
      }
    ]
  } : null

  // Volume Chart Data
  const volumeChartData = priceData ? {
    labels: priceData.map(item => new Date(item.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'Volume',
        data: priceData.map(item => item.volume),
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1
      }
    ]
  } : null

  // Market Overview Pie Chart
  const marketPieData = marketOverview ? {
    labels: marketOverview.map(item => item.symbol),
    datasets: [
      {
        label: 'Market Cap Distribution',
        data: marketOverview.map(item => item.volume_24h),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 2
      }
    ]
  } : null

  // Technical Indicators Chart
  const indicatorsChartData = priceData && indicators ? {
    labels: priceData.slice(-20).map(item => new Date(item.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'Price',
        data: priceData.slice(-20).map(item => item.close),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'transparent',
        yAxisID: 'y'
      },
      {
        label: 'SMA 20',
        data: Array(20).fill(indicators.sma_20),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        yAxisID: 'y'
      },
      {
        label: 'RSI',
        data: Array(20).fill(indicators.rsi),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'transparent',
        yAxisID: 'y1'
      }
    ]
  } : null

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        position: 'left'
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        min: 0,
        max: 100,
        grid: {
          drawOnChartArea: false
        }
      }
    }
  }

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right'
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Market Charts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive market analysis and visualization
          </p>
        </div>
        <button
          onClick={fetchAllData}
          className="btn-primary mt-4 sm:mt-0"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </button>
      </div>

      {/* Controls */}
      <div className="card">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cryptocurrency
            </label>
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="input"
            >
              {symbols.map(symbol => (
                <option key={symbol} value={symbol}>{symbol}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timeframe
            </label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="input"
            >
              {timeframes.map(tf => (
                <option key={tf.value} value={tf.value}>{tf.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Chart */}
        <div className="card">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedSymbol} Price Chart
            </h3>
          </div>
          <div className="h-80">
            {priceChartData && (
              <Line data={priceChartData} options={chartOptions} />
            )}
          </div>
        </div>

        {/* Volume Chart */}
        <div className="card">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Volume Analysis
            </h3>
          </div>
          <div className="h-80">
            {volumeChartData && (
              <Bar data={volumeChartData} options={chartOptions} />
            )}
          </div>
        </div>

        {/* Market Overview */}
        <div className="card">
          <div className="flex items-center mb-4">
            <PieChart className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Market Distribution
            </h3>
          </div>
          <div className="h-80">
            {marketPieData && (
              <Doughnut data={marketPieData} options={pieOptions} />
            )}
          </div>
        </div>

        {/* Technical Indicators */}
        <div className="card">
          <div className="flex items-center mb-4">
            <Activity className="h-5 w-5 text-orange-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Technical Indicators
            </h3>
          </div>
          <div className="h-80">
            {indicatorsChartData && (
              <Line data={indicatorsChartData} options={chartOptions} />
            )}
          </div>
        </div>
      </div>

      {/* Market Stats */}
      {marketOverview && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {marketOverview.map((coin, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">{coin.symbol}</div>
                <div className="text-sm text-gray-600">
                  ${coin.price?.toLocaleString()}
                </div>
                <div className={`text-sm font-medium ${
                  coin.change_24h >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {coin.change_24h >= 0 ? '+' : ''}{coin.change_24h?.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Charts
