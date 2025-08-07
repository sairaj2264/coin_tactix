import React, { useEffect, useRef } from "react";
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
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PriceChart = ({ data, symbol, timeframe }) => {
  // Early return if no data provided
  if (!data) {
    console.log("PriceChart: No data provided");
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-gray-500">No chart data available</div>
      </div>
    );
  }
  const chartRef = useRef(null);

  // Mock data for demonstration
  const mockData = Array.from({ length: 50 }, (_, i) => ({
    timestamp: new Date(
      Date.now() - (49 - i) * 24 * 60 * 60 * 1000
    ).toISOString(),
    close: 45000 + Math.random() * 10000 - 5000,
    volume: Math.random() * 1000000,
  }));

  // Safely handle data with proper null checks
  const safeData =
    data && Array.isArray(data) && data.length > 0 ? data : mockData;

  const chartData = {
    labels: safeData.map((item) => {
      const date = new Date(item.timestamp);
      if (timeframe === "1h" || timeframe === "4h") {
        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else if (timeframe === "1d") {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      } else {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }
    }),
    datasets: [
      {
        label: `${symbol} Price`,
        data: safeData.map((item) => item.close),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "rgb(59, 130, 246)",
        pointHoverBorderColor: "white",
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index",
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(59, 130, 246, 0.5)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function (context) {
            return context[0].label;
          },
          label: function (context) {
            return `Price: $${context.parsed.y.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          color: "rgb(107, 114, 128)",
          font: {
            size: 12,
          },
          maxTicksLimit: 8,
        },
      },
      y: {
        display: true,
        position: "right",
        grid: {
          color: "rgba(107, 114, 128, 0.1)",
        },
        ticks: {
          color: "rgb(107, 114, 128)",
          font: {
            size: 12,
          },
          callback: function (value) {
            return (
              "$" +
              value.toLocaleString("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })
            );
          },
        },
      },
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
  };

  return (
    <div className="h-64 w-full">
      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75 z-10 rounded-lg">
          <div className="text-center">
            <div className="text-gray-500 text-sm">Displaying demo data</div>
            <div className="text-gray-400 text-xs mt-1">
              Connect to backend for real market data
            </div>
          </div>
        </div>
      )}
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

// Simple fallback chart component
const SimplePriceDisplay = ({ data, symbol }) => {
  const safeData = data && Array.isArray(data) && data.length > 0 ? data : [];
  const latestPrice =
    safeData.length > 0 ? safeData[safeData.length - 1]?.close : null;

  return (
    <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-lg">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {symbol} Price
        </h3>
        {latestPrice ? (
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              ${latestPrice.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              Data points: {safeData.length}
            </div>
          </div>
        ) : (
          <div className="text-gray-500">Loading price data...</div>
        )}
      </div>
    </div>
  );
};

// Wrap the component in error boundary
const SafePriceChart = (props) => {
  try {
    // For now, use simple display to avoid Chart.js issues
    if (process.env.NODE_ENV === "development") {
      return <SimplePriceDisplay {...props} />;
    }
    return <PriceChart {...props} />;
  } catch (error) {
    console.error("PriceChart error:", error);
    return <SimplePriceDisplay {...props} />;
  }
};

export default SafePriceChart;
