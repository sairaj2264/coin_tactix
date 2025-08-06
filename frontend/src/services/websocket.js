import { io } from 'socket.io-client'
import { store } from '../store/store'
import { updateRealTimePrice } from '../store/slices/marketSlice'
import { addNotification, triggerAlert } from '../store/slices/alertSlice'

class WebSocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
  }

  static getInstance() {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService()
    }
    return WebSocketService.instance
  }

  connect() {
    if (this.socket && this.isConnected) {
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      console.warn('No authentication token found')
      return
    }

    this.socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:5000', {
      auth: {
        token: token
      },
      transports: ['websocket'],
      upgrade: false,
    })

    this.setupEventListeners()
  }

  setupEventListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('WebSocket connected')
      this.isConnected = true
      this.reconnectAttempts = 0
      
      // Notify user of successful connection
      store.dispatch(addNotification({
        id: Date.now(),
        type: 'success',
        title: 'Connected',
        message: 'Real-time data connection established',
        timestamp: new Date().toISOString(),
        read: false,
      }))
    })

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason)
      this.isConnected = false
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.handleReconnect()
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      this.handleReconnect()
    })

    // Price update events
    this.socket.on('price_update', (data) => {
      store.dispatch(updateRealTimePrice({
        price: data.price,
        change24h: data.change24h,
        symbol: data.symbol,
      }))
    })

    // Alert triggered events
    this.socket.on('alert_triggered', (data) => {
      store.dispatch(triggerAlert({
        alertId: data.alertId,
        currentValue: data.currentValue,
      }))

      store.dispatch(addNotification({
        id: Date.now(),
        type: 'warning',
        title: 'Alert Triggered',
        message: `${data.alertName}: ${data.message}`,
        timestamp: new Date().toISOString(),
        read: false,
      }))
    })

    // Market sentiment updates
    this.socket.on('sentiment_update', (data) => {
      store.dispatch(addNotification({
        id: Date.now(),
        type: 'info',
        title: 'Market Sentiment Update',
        message: `Fear & Greed Index: ${data.fearGreedIndex}`,
        timestamp: new Date().toISOString(),
        read: false,
      }))
    })

    // Strategy performance updates
    this.socket.on('strategy_update', (data) => {
      store.dispatch(addNotification({
        id: Date.now(),
        type: 'info',
        title: 'Strategy Update',
        message: `${data.strategyName}: ${data.message}`,
        timestamp: new Date().toISOString(),
        read: false,
      }))
    })

    // News updates
    this.socket.on('news_update', (data) => {
      if (data.sentiment === 'very_positive' || data.sentiment === 'very_negative') {
        store.dispatch(addNotification({
          id: Date.now(),
          type: data.sentiment === 'very_positive' ? 'success' : 'danger',
          title: 'Market News',
          message: data.headline,
          timestamp: new Date().toISOString(),
          read: false,
        }))
      }
    })
  }

  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      store.dispatch(addNotification({
        id: Date.now(),
        type: 'error',
        title: 'Connection Lost',
        message: 'Unable to establish real-time connection. Please refresh the page.',
        timestamp: new Date().toISOString(),
        read: false,
      }))
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    setTimeout(() => {
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      this.connect()
    }, delay)
  }

  subscribeToPrice(symbol) {
    if (this.socket && this.isConnected) {
      this.socket.emit('subscribe_price', { symbol })
    }
  }

  unsubscribeFromPrice(symbol) {
    if (this.socket && this.isConnected) {
      this.socket.emit('unsubscribe_price', { symbol })
    }
  }

  subscribeToAlerts() {
    if (this.socket && this.isConnected) {
      this.socket.emit('subscribe_alerts')
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }
}

export { WebSocketService }
