import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, password, name) => api.post('/auth/register', { email, password, name }),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  getProfile: () => api.get('/auth/profile'),
}

// Market Data API
export const marketAPI = {
  getOHLCVData: (symbol, timeframe = '1d', limit = 100) => 
    api.get(`/market/ohlcv/${symbol}`, { params: { timeframe, limit } }),
  
  getTechnicalIndicators: (symbol, indicators) => 
    api.get(`/market/indicators/${symbol}`, { params: { indicators: indicators.join(',') } }),
  
  getOnChainMetrics: (symbol) => 
    api.get(`/market/onchain/${symbol}`),
  
  getMarketSentiment: () => 
    api.get('/market/sentiment'),
  
  getRealTimePrice: (symbol) => 
    api.get(`/market/price/${symbol}`),
  
  getMarketOverview: () => 
    api.get('/market/overview'),
}

// Strategy API
export const strategyAPI = {
  getStrategies: () => api.get('/strategies'),
  
  getStrategy: (id) => api.get(`/strategies/${id}`),
  
  createStrategy: (strategyData) => api.post('/strategies', strategyData),
  
  updateStrategy: (id, strategyData) => api.put(`/strategies/${id}`, strategyData),
  
  deleteStrategy: (id) => api.delete(`/strategies/${id}`),
  
  runBacktest: (strategyId, backtestParams) => 
    api.post(`/strategies/${strategyId}/backtest`, backtestParams),
  
  getPrediction: (symbol, timeframe, investmentAmount) => 
    api.post('/predictions', { symbol, timeframe, investmentAmount }),
  
  getBacktestHistory: (strategyId) => 
    api.get(`/strategies/${strategyId}/backtest-history`),
}

// Alerts API
export const alertAPI = {
  getAlerts: () => api.get('/alerts'),
  
  getAlert: (id) => api.get(`/alerts/${id}`),
  
  createAlert: (alertData) => api.post('/alerts', alertData),
  
  updateAlert: (id, alertData) => api.put(`/alerts/${id}`, alertData),
  
  deleteAlert: (id) => api.delete(`/alerts/${id}`),
  
  getAlertHistory: () => api.get('/alerts/history'),
}

// Portfolio API
export const portfolioAPI = {
  getPortfolio: () => api.get('/portfolio'),
  
  getPortfolioHistory: (timeframe = '1M') => 
    api.get('/portfolio/history', { params: { timeframe } }),
  
  getPortfolioPerformance: () => api.get('/portfolio/performance'),
  
  addTransaction: (transactionData) => api.post('/portfolio/transactions', transactionData),
  
  getTransactions: (limit = 50) => 
    api.get('/portfolio/transactions', { params: { limit } }),
}

export default api
