import React, { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const SimplePriceChart = ({ data, symbol, timeframe }) => {
  const chartRef = useRef(null)

  // Generate mock data if no real data is provided
  const generateMockData = () => {
    const mockData = []
    const basePrice = symbol === 'BTC' ? 45000 : symbol === 'ETH' ? 3200 : 100
    
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      
      const randomChange = (Math.random() - 0.5) * 0.1
      const price = basePrice * (1 + randomChange * i * 0.01)
      
      mockData.push({
        timestamp: date.toISOString(),
        close: price,
        open: price * 0.99,
        high: price * 1.02,
        low: price * 0.97,
        volume: Math.random() * 1000000
      })
    }
    return mockData
  }

  // Safely handle data
  const safeData = React.useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return generateMockData()
    }
    return data
  }, [data, symbol])

  // Prepare chart data
  const chartData = React.useMemo(() => {
    return {
      labels: safeData.map(item => {
        const date = new Date(item.timestamp)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }),
      datasets: [
        {
          label: `${symbol} Price`,
          data: safeData.map(item => item.close),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 4,
        }
      ]
    }
  }, [safeData, symbol])

  // Chart options
  const options = React.useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `${symbol}: $${context.parsed.y.toLocaleString()}`
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false
        }
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString()
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  }), [symbol])

  // Error boundary for chart rendering
  const [hasError, setHasError] = React.useState(false)

  React.useEffect(() => {
    setHasError(false)
  }, [data, symbol, timeframe])

  if (hasError) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{symbol} Price</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            ${safeData[safeData.length - 1]?.close?.toLocaleString() || 'N/A'}
          </div>
          <div className="text-sm text-gray-500">Chart temporarily unavailable</div>
        </div>
      </div>
    )
  }

  try {
    return (
      <div className="h-64 w-full">
        <Line 
          ref={chartRef} 
          data={chartData} 
          options={options}
          onError={() => setHasError(true)}
        />
      </div>
    )
  } catch (error) {
    console.error('Chart rendering error:', error)
    setHasError(true)
    return null
  }
}

export default SimplePriceChart
