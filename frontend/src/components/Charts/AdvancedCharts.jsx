import React, { useEffect, useRef, useState } from 'react'
import { Bar, Doughnut, Scatter, Radar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Equity Curve Chart with Drawdown
export const EquityCurveChart = ({ equityData, initialCapital = 10000 }) => {
  const chartData = {
    labels: equityData?.map(point => new Date(point.date).toLocaleDateString()) || [],
    datasets: [
      {
        label: 'Portfolio Value',
        data: equityData?.map(point => point.equity) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
        fill: true,
        yAxisID: 'y'
      },
      {
        label: 'Drawdown',
        data: equityData?.map(point => {
          const peak = Math.max(...equityData.slice(0, equityData.indexOf(point) + 1).map(p => p.equity))
          return ((point.equity - peak) / peak) * 100
        }) || [],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.1,
        fill: true,
        yAxisID: 'y1'
      },
      {
        label: 'Initial Capital',
        data: equityData?.map(() => initialCapital) || [],
        borderColor: 'rgb(156, 163, 175)',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0,
        yAxisID: 'y'
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Portfolio Performance & Drawdown'
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Portfolio Value ($)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Drawdown (%)'
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  }

  return (
    <div className="h-80">
      <Bar data={chartData} options={options} />
    </div>
  )
}

// Returns Distribution Chart
export const ReturnsDistributionChart = ({ returns = [] }) => {
  // Calculate histogram bins
  const bins = 20
  const minReturn = Math.min(...returns)
  const maxReturn = Math.max(...returns)
  const binWidth = (maxReturn - minReturn) / bins
  
  const histogram = Array(bins).fill(0)
  const binLabels = []
  
  for (let i = 0; i < bins; i++) {
    const binStart = minReturn + i * binWidth
    const binEnd = binStart + binWidth
    binLabels.push(`${binStart.toFixed(1)}%`)
    
    returns.forEach(ret => {
      if (ret >= binStart && ret < binEnd) {
        histogram[i]++
      }
    })
  }

  const chartData = {
    labels: binLabels,
    datasets: [
      {
        label: 'Frequency',
        data: histogram,
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1
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
      title: {
        display: true,
        text: 'Returns Distribution'
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Frequency'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Return (%)'
        }
      }
    }
  }

  return (
    <div className="h-80">
      <Bar data={chartData} options={options} />
    </div>
  )
}

// Risk-Return Scatter Plot
export const RiskReturnChart = ({ strategies = [] }) => {
  const chartData = {
    datasets: [
      {
        label: 'Strategies',
        data: strategies.map(strategy => ({
          x: strategy.volatility || Math.random() * 20,
          y: strategy.annualReturn || Math.random() * 30 - 10
        })),
        backgroundColor: strategies.map((_, index) => 
          `hsl(${index * 60}, 70%, 50%)`
        ),
        borderColor: strategies.map((_, index) => 
          `hsl(${index * 60}, 70%, 40%)`
        ),
        borderWidth: 2,
        pointRadius: 8,
        pointHoverRadius: 10
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
      title: {
        display: true,
        text: 'Risk vs Return Analysis'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const strategy = strategies[context.dataIndex]
            return `${strategy?.name || 'Strategy'}: Risk ${context.parsed.x.toFixed(1)}%, Return ${context.parsed.y.toFixed(1)}%`
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Risk (Volatility %)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Annual Return (%)'
        }
      }
    }
  }

  return (
    <div className="h-80">
      <Scatter data={chartData} options={options} />
    </div>
  )
}

// Strategy Performance Radar Chart
export const StrategyRadarChart = ({ strategy }) => {
  const metrics = {
    'Total Return': (strategy?.performance?.total_return || 0) / 10, // Normalize to 0-10
    'Sharpe Ratio': Math.min((strategy?.performance?.sharpe_ratio || 0) * 2, 10),
    'Win Rate': (strategy?.performance?.win_rate || 0) / 10,
    'Max Drawdown': 10 - Math.abs(strategy?.performance?.max_drawdown || 0) / 2,
    'Profit Factor': Math.min((strategy?.performance?.profit_factor || 1) * 2, 10),
    'Consistency': Math.random() * 10 // Mock data
  }

  const chartData = {
    labels: Object.keys(metrics),
    datasets: [
      {
        label: strategy?.name || 'Strategy',
        data: Object.values(metrics),
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(59, 130, 246)'
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Strategy Performance Metrics'
      }
    },
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 10,
        ticks: {
          stepSize: 2
        }
      }
    }
  }

  return (
    <div className="h-80">
      <Radar data={chartData} options={options} />
    </div>
  )
}

// Asset Allocation Pie Chart
export const AssetAllocationChart = ({ allocations = [] }) => {
  const chartData = {
    labels: allocations.map(item => item.symbol),
    datasets: [
      {
        data: allocations.map(item => item.percentage),
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
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right'
      },
      title: {
        display: true,
        text: 'Asset Allocation'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed}%`
          }
        }
      }
    }
  }

  return (
    <div className="h-80">
      <Doughnut data={chartData} options={options} />
    </div>
  )
}
