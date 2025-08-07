import React from 'react'

const TestChart = ({ symbol = 'BTC' }) => {
  // Generate simple mock data
  const mockData = []
  const basePrice = 45000
  
  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    const price = basePrice + (Math.random() - 0.5) * 5000
    mockData.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: price
    })
  }

  // Simple SVG chart
  const width = 400
  const height = 200
  const padding = 40

  const maxPrice = Math.max(...mockData.map(d => d.price))
  const minPrice = Math.min(...mockData.map(d => d.price))
  const priceRange = maxPrice - minPrice

  const points = mockData.map((d, i) => {
    const x = padding + (i / (mockData.length - 1)) * (width - 2 * padding)
    const y = height - padding - ((d.price - minPrice) / priceRange) * (height - 2 * padding)
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="h-64 w-full flex flex-col items-center justify-center bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{symbol} Price Chart</h3>
      
      <svg width={width} height={height} className="border border-gray-200 rounded">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Price line */}
        <polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          points={points}
        />
        
        {/* Data points */}
        {mockData.map((d, i) => {
          const x = padding + (i / (mockData.length - 1)) * (width - 2 * padding)
          const y = height - padding - ((d.price - minPrice) / priceRange) * (height - 2 * padding)
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="#3b82f6"
              className="hover:r-4 transition-all"
            />
          )
        })}
        
        {/* Y-axis labels */}
        <text x="10" y="50" fontSize="12" fill="#6b7280">
          ${Math.round(maxPrice).toLocaleString()}
        </text>
        <text x="10" y={height - 50} fontSize="12" fill="#6b7280">
          ${Math.round(minPrice).toLocaleString()}
        </text>
      </svg>
      
      <div className="mt-4 text-center">
        <div className="text-2xl font-bold text-blue-600">
          ${mockData[mockData.length - 1]?.price.toLocaleString()}
        </div>
        <div className="text-sm text-gray-500">Current Price</div>
      </div>
    </div>
  )
}

export default TestChart
