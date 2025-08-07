import React, { useEffect, useRef, useState } from 'react'

// Dynamically import Chart.js to avoid SSR issues
let Chart = null
let chartComponents = null

const React19Chart = ({ data, symbol, timeframe }) => {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)
  const [isChartReady, setIsChartReady] = useState(false)
  const [error, setError] = useState(null)

  // Generate mock data
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

  // Initialize Chart.js
  useEffect(() => {
    const initChart = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const chartModule = await import('chart.js/auto')
        Chart = chartModule.default || chartModule.Chart
        
        if (!Chart) {
          throw new Error('Chart.js failed to load')
        }

        setIsChartReady(true)
      } catch (err) {
        console.error('Failed to load Chart.js:', err)
        setError('Failed to load chart library')
      }
    }

    initChart()
  }, [])

  // Create/update chart
  useEffect(() => {
    if (!isChartReady || !canvasRef.current || !Chart) return

    try {
      // Destroy existing chart
      if (chartRef.current) {
        chartRef.current.destroy()
      }

      // Prepare data
      const safeData = data && Array.isArray(data) && data.length > 0 ? data : generateMockData()
      
      const chartData = {
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

      const options = {
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
      }

      // Create new chart
      chartRef.current = new Chart(canvasRef.current, {
        type: 'line',
        data: chartData,
        options: options
      })

    } catch (err) {
      console.error('Chart creation error:', err)
      setError('Failed to create chart')
    }
  }, [isChartReady, data, symbol, timeframe])

  // Cleanup
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [])

  // Error fallback
  if (error) {
    const safeData = data && Array.isArray(data) && data.length > 0 ? data : generateMockData()
    const latestPrice = safeData[safeData.length - 1]?.close

    return (
      <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{symbol} Price</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            ${latestPrice?.toLocaleString() || 'N/A'}
          </div>
          <div className="text-sm text-gray-500">Chart temporarily unavailable</div>
        </div>
      </div>
    )
  }

  // Loading state
  if (!isChartReady) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <canvas ref={canvasRef} />
    </div>
  )
}

export default React19Chart
