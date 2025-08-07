// Advanced Backtesting Engine with Optimized Algorithms

export class BacktestingEngine {
  constructor(strategy, data, initialCapital = 10000) {
    this.strategy = strategy
    this.data = data
    this.initialCapital = initialCapital
    this.portfolio = {
      cash: initialCapital,
      positions: {},
      equity: initialCapital,
      trades: [],
      equityCurve: []
    }
    this.metrics = {
      totalReturn: 0,
      annualReturn: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      winRate: 0,
      profitFactor: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      avgWin: 0,
      avgLoss: 0,
      largestWin: 0,
      largestLoss: 0,
      consecutiveWins: 0,
      consecutiveLosses: 0,
      returns: []
    }
  }

  // Main backtesting execution
  async runBacktest() {
    console.log('Starting backtest execution...')
    
    for (let i = 1; i < this.data.length; i++) {
      const currentBar = this.data[i]
      const previousBar = this.data[i - 1]
      
      // Update portfolio value
      this.updatePortfolioValue(currentBar)
      
      // Generate trading signals based on strategy
      const signals = this.generateSignals(currentBar, previousBar, i)
      
      // Execute trades
      this.executeTrades(signals, currentBar)
      
      // Record equity curve
      this.portfolio.equityCurve.push({
        date: currentBar.timestamp,
        equity: this.portfolio.equity,
        cash: this.portfolio.cash,
        positions: { ...this.portfolio.positions }
      })
    }
    
    // Calculate final metrics
    this.calculateMetrics()
    
    return {
      portfolio: this.portfolio,
      metrics: this.metrics,
      equityCurve: this.portfolio.equityCurve,
      trades: this.portfolio.trades
    }
  }

  // Generate trading signals based on strategy type
  generateSignals(currentBar, previousBar, index) {
    const signals = []
    
    switch (this.strategy.type) {
      case 'DCA':
        return this.generateDCASignals(currentBar, index)
      case 'Technical':
        return this.generateTechnicalSignals(currentBar, previousBar, index)
      case 'Statistical':
        return this.generateStatisticalSignals(currentBar, previousBar, index)
      default:
        return signals
    }
  }

  // Dollar Cost Averaging signals
  generateDCASignals(currentBar, index) {
    const signals = []
    const interval = this.strategy.parameters?.interval || 7 // Weekly DCA
    
    if (index % interval === 0) {
      const amount = this.strategy.parameters?.amount || 1000
      signals.push({
        type: 'BUY',
        symbol: this.strategy.symbol,
        amount: amount,
        price: currentBar.close,
        timestamp: currentBar.timestamp
      })
    }
    
    return signals
  }

  // Technical analysis signals
  generateTechnicalSignals(currentBar, previousBar, index) {
    const signals = []
    const lookback = 20
    
    if (index < lookback) return signals
    
    // Calculate technical indicators
    const sma20 = this.calculateSMA(index, 20)
    const sma50 = this.calculateSMA(index, 50)
    const rsi = this.calculateRSI(index, 14)
    
    // Golden Cross strategy
    if (sma20 > sma50 && this.calculateSMA(index - 1, 20) <= this.calculateSMA(index - 1, 50)) {
      signals.push({
        type: 'BUY',
        symbol: this.strategy.symbol,
        percentage: 0.5, // 50% of available cash
        price: currentBar.close,
        timestamp: currentBar.timestamp,
        reason: 'Golden Cross'
      })
    }
    
    // Death Cross strategy
    if (sma20 < sma50 && this.calculateSMA(index - 1, 20) >= this.calculateSMA(index - 1, 50)) {
      signals.push({
        type: 'SELL',
        symbol: this.strategy.symbol,
        percentage: 1.0, // Sell all positions
        price: currentBar.close,
        timestamp: currentBar.timestamp,
        reason: 'Death Cross'
      })
    }
    
    // RSI oversold/overbought
    if (rsi < 30 && this.portfolio.cash > 1000) {
      signals.push({
        type: 'BUY',
        symbol: this.strategy.symbol,
        percentage: 0.25,
        price: currentBar.close,
        timestamp: currentBar.timestamp,
        reason: 'RSI Oversold'
      })
    }
    
    if (rsi > 70 && this.portfolio.positions[this.strategy.symbol]) {
      signals.push({
        type: 'SELL',
        symbol: this.strategy.symbol,
        percentage: 0.5,
        price: currentBar.close,
        timestamp: currentBar.timestamp,
        reason: 'RSI Overbought'
      })
    }
    
    return signals
  }

  // Statistical arbitrage signals
  generateStatisticalSignals(currentBar, previousBar, index) {
    const signals = []
    const lookback = 50
    
    if (index < lookback) return signals
    
    // Mean reversion strategy
    const mean = this.calculateSMA(index, lookback)
    const std = this.calculateStandardDeviation(index, lookback)
    const zScore = (currentBar.close - mean) / std
    
    // Buy when price is 2 standard deviations below mean
    if (zScore < -2 && this.portfolio.cash > 1000) {
      signals.push({
        type: 'BUY',
        symbol: this.strategy.symbol,
        percentage: Math.min(0.3, Math.abs(zScore) / 10),
        price: currentBar.close,
        timestamp: currentBar.timestamp,
        reason: `Mean Reversion (Z-Score: ${zScore.toFixed(2)})`
      })
    }
    
    // Sell when price is 2 standard deviations above mean
    if (zScore > 2 && this.portfolio.positions[this.strategy.symbol]) {
      signals.push({
        type: 'SELL',
        symbol: this.strategy.symbol,
        percentage: Math.min(0.5, zScore / 10),
        price: currentBar.close,
        timestamp: currentBar.timestamp,
        reason: `Mean Reversion (Z-Score: ${zScore.toFixed(2)})`
      })
    }
    
    return signals
  }

  // Execute trading signals
  executeTrades(signals, currentBar) {
    signals.forEach(signal => {
      if (signal.type === 'BUY') {
        this.executeBuy(signal, currentBar)
      } else if (signal.type === 'SELL') {
        this.executeSell(signal, currentBar)
      }
    })
  }

  // Execute buy order
  executeBuy(signal, currentBar) {
    let buyAmount = 0
    
    if (signal.amount) {
      buyAmount = Math.min(signal.amount, this.portfolio.cash)
    } else if (signal.percentage) {
      buyAmount = this.portfolio.cash * signal.percentage
    }
    
    if (buyAmount < 10) return // Minimum trade size
    
    const shares = buyAmount / signal.price
    const commission = buyAmount * 0.001 // 0.1% commission
    
    if (!this.portfolio.positions[signal.symbol]) {
      this.portfolio.positions[signal.symbol] = 0
    }
    
    this.portfolio.positions[signal.symbol] += shares
    this.portfolio.cash -= (buyAmount + commission)
    
    // Record trade
    this.portfolio.trades.push({
      type: 'BUY',
      symbol: signal.symbol,
      shares: shares,
      price: signal.price,
      amount: buyAmount,
      commission: commission,
      timestamp: signal.timestamp,
      reason: signal.reason
    })
  }

  // Execute sell order
  executeSell(signal, currentBar) {
    if (!this.portfolio.positions[signal.symbol] || this.portfolio.positions[signal.symbol] <= 0) {
      return
    }
    
    let sharesToSell = 0
    
    if (signal.percentage) {
      sharesToSell = this.portfolio.positions[signal.symbol] * signal.percentage
    } else {
      sharesToSell = this.portfolio.positions[signal.symbol]
    }
    
    const sellAmount = sharesToSell * signal.price
    const commission = sellAmount * 0.001 // 0.1% commission
    
    this.portfolio.positions[signal.symbol] -= sharesToSell
    this.portfolio.cash += (sellAmount - commission)
    
    // Record trade
    this.portfolio.trades.push({
      type: 'SELL',
      symbol: signal.symbol,
      shares: sharesToSell,
      price: signal.price,
      amount: sellAmount,
      commission: commission,
      timestamp: signal.timestamp,
      reason: signal.reason
    })
  }

  // Update portfolio value
  updatePortfolioValue(currentBar) {
    let totalValue = this.portfolio.cash
    
    Object.keys(this.portfolio.positions).forEach(symbol => {
      if (symbol === this.strategy.symbol) {
        totalValue += this.portfolio.positions[symbol] * currentBar.close
      }
    })
    
    this.portfolio.equity = totalValue
  }

  // Calculate Simple Moving Average
  calculateSMA(index, period) {
    if (index < period - 1) return null
    
    let sum = 0
    for (let i = index - period + 1; i <= index; i++) {
      sum += this.data[i].close
    }
    return sum / period
  }

  // Calculate RSI
  calculateRSI(index, period) {
    if (index < period) return 50
    
    let gains = 0
    let losses = 0
    
    for (let i = index - period + 1; i <= index; i++) {
      const change = this.data[i].close - this.data[i - 1].close
      if (change > 0) {
        gains += change
      } else {
        losses += Math.abs(change)
      }
    }
    
    const avgGain = gains / period
    const avgLoss = losses / period
    
    if (avgLoss === 0) return 100
    
    const rs = avgGain / avgLoss
    return 100 - (100 / (1 + rs))
  }

  // Calculate Standard Deviation
  calculateStandardDeviation(index, period) {
    const mean = this.calculateSMA(index, period)
    let sumSquaredDiffs = 0
    
    for (let i = index - period + 1; i <= index; i++) {
      const diff = this.data[i].close - mean
      sumSquaredDiffs += diff * diff
    }
    
    return Math.sqrt(sumSquaredDiffs / period)
  }

  // Calculate comprehensive metrics
  calculateMetrics() {
    const finalEquity = this.portfolio.equity
    this.metrics.totalReturn = ((finalEquity - this.initialCapital) / this.initialCapital) * 100
    
    // Calculate returns array
    this.metrics.returns = []
    for (let i = 1; i < this.portfolio.equityCurve.length; i++) {
      const prevEquity = this.portfolio.equityCurve[i - 1].equity
      const currentEquity = this.portfolio.equityCurve[i].equity
      const dailyReturn = ((currentEquity - prevEquity) / prevEquity) * 100
      this.metrics.returns.push(dailyReturn)
    }
    
    // Calculate Sharpe Ratio
    const avgReturn = this.metrics.returns.reduce((a, b) => a + b, 0) / this.metrics.returns.length
    const variance = this.metrics.returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / this.metrics.returns.length
    const volatility = Math.sqrt(variance)
    this.metrics.sharpeRatio = volatility > 0 ? (avgReturn / volatility) * Math.sqrt(252) : 0
    
    // Calculate Maximum Drawdown
    let peak = this.initialCapital
    let maxDrawdown = 0
    
    this.portfolio.equityCurve.forEach(point => {
      if (point.equity > peak) {
        peak = point.equity
      }
      const drawdown = ((peak - point.equity) / peak) * 100
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
      }
    })
    
    this.metrics.maxDrawdown = maxDrawdown
    
    // Trade statistics
    const buyTrades = this.portfolio.trades.filter(t => t.type === 'BUY')
    const sellTrades = this.portfolio.trades.filter(t => t.type === 'SELL')
    
    this.metrics.totalTrades = Math.min(buyTrades.length, sellTrades.length)
    
    // Calculate win/loss statistics
    let wins = 0
    let losses = 0
    let totalProfit = 0
    let totalLoss = 0
    
    for (let i = 0; i < this.metrics.totalTrades; i++) {
      const buyTrade = buyTrades[i]
      const sellTrade = sellTrades[i]
      
      if (sellTrade && buyTrade) {
        const profit = (sellTrade.price - buyTrade.price) * buyTrade.shares
        if (profit > 0) {
          wins++
          totalProfit += profit
        } else {
          losses++
          totalLoss += Math.abs(profit)
        }
      }
    }
    
    this.metrics.winningTrades = wins
    this.metrics.losingTrades = losses
    this.metrics.winRate = this.metrics.totalTrades > 0 ? (wins / this.metrics.totalTrades) * 100 : 0
    this.metrics.avgWin = wins > 0 ? totalProfit / wins : 0
    this.metrics.avgLoss = losses > 0 ? totalLoss / losses : 0
    this.metrics.profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? 999 : 1
    
    // Annualized return
    const days = this.portfolio.equityCurve.length
    const years = days / 365
    this.metrics.annualReturn = years > 0 ? Math.pow(finalEquity / this.initialCapital, 1 / years) - 1 : 0
    this.metrics.annualReturn *= 100
  }
}
