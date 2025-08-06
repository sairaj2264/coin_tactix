"""
Database Models for CoinTactix
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class OHLCVData(db.Model):
    """OHLCV (Open, High, Low, Close, Volume) price data"""
    __tablename__ = 'ohlcv_data'
    
    id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(10), nullable=False, index=True)
    timestamp = db.Column(db.DateTime, nullable=False, index=True)
    timeframe = db.Column(db.String(10), nullable=False)  # 1m, 5m, 1h, 1d, etc.
    open_price = db.Column(db.Float, nullable=False)
    high_price = db.Column(db.Float, nullable=False)
    low_price = db.Column(db.Float, nullable=False)
    close_price = db.Column(db.Float, nullable=False)
    volume = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        db.UniqueConstraint('symbol', 'timestamp', 'timeframe', name='unique_ohlcv'),
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'symbol': self.symbol,
            'timestamp': self.timestamp.isoformat(),
            'timeframe': self.timeframe,
            'open': self.open_price,
            'high': self.high_price,
            'low': self.low_price,
            'close': self.close_price,
            'volume': self.volume
        }

class TechnicalIndicators(db.Model):
    """Technical indicators data"""
    __tablename__ = 'technical_indicators'
    
    id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(10), nullable=False, index=True)
    timestamp = db.Column(db.DateTime, nullable=False, index=True)
    timeframe = db.Column(db.String(10), nullable=False)
    
    # Moving Averages
    sma_20 = db.Column(db.Float)
    sma_50 = db.Column(db.Float)
    ema_12 = db.Column(db.Float)
    ema_26 = db.Column(db.Float)
    
    # Oscillators
    rsi = db.Column(db.Float)
    macd = db.Column(db.Float)
    macd_signal = db.Column(db.Float)
    macd_histogram = db.Column(db.Float)
    
    # Bollinger Bands
    bb_upper = db.Column(db.Float)
    bb_middle = db.Column(db.Float)
    bb_lower = db.Column(db.Float)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'symbol': self.symbol,
            'timestamp': self.timestamp.isoformat(),
            'timeframe': self.timeframe,
            'sma_20': self.sma_20,
            'sma_50': self.sma_50,
            'ema_12': self.ema_12,
            'ema_26': self.ema_26,
            'rsi': self.rsi,
            'macd': self.macd,
            'macd_signal': self.macd_signal,
            'macd_histogram': self.macd_histogram,
            'bollinger_bands': {
                'upper': self.bb_upper,
                'middle': self.bb_middle,
                'lower': self.bb_lower
            }
        }

class OnChainMetrics(db.Model):
    """On-chain metrics for cryptocurrencies"""
    __tablename__ = 'onchain_metrics'
    
    id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(10), nullable=False, index=True)
    timestamp = db.Column(db.DateTime, nullable=False, index=True)
    
    # Fundamental metrics
    mvrv_ratio = db.Column(db.Float)  # Market Value to Realized Value
    puell_multiple = db.Column(db.Float)
    sopr = db.Column(db.Float)  # Spent Output Profit Ratio
    nvt_ratio = db.Column(db.Float)  # Network Value to Transactions
    
    # Network metrics
    active_addresses = db.Column(db.Integer)
    transaction_count = db.Column(db.Integer)
    hash_rate = db.Column(db.Float)
    difficulty = db.Column(db.Float)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'symbol': self.symbol,
            'timestamp': self.timestamp.isoformat(),
            'mvrv_ratio': self.mvrv_ratio,
            'puell_multiple': self.puell_multiple,
            'sopr': self.sopr,
            'nvt_ratio': self.nvt_ratio,
            'active_addresses': self.active_addresses,
            'transaction_count': self.transaction_count,
            'hash_rate': self.hash_rate,
            'difficulty': self.difficulty
        }

class Strategy(db.Model):
    """User-defined trading strategies"""
    __tablename__ = 'strategies'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    symbol = db.Column(db.String(10), nullable=False)
    strategy_type = db.Column(db.String(50), nullable=False)  # DCA, Technical, ML, etc.
    
    # Strategy parameters (stored as JSON)
    parameters = db.Column(db.Text)  # JSON string
    
    # Performance metrics
    total_return = db.Column(db.Float, default=0.0)
    win_rate = db.Column(db.Float, default=0.0)
    max_drawdown = db.Column(db.Float, default=0.0)
    sharpe_ratio = db.Column(db.Float, default=0.0)
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'symbol': self.symbol,
            'type': self.strategy_type,
            'parameters': json.loads(self.parameters) if self.parameters else {},
            'performance': {
                'total_return': self.total_return,
                'win_rate': self.win_rate,
                'max_drawdown': self.max_drawdown,
                'sharpe_ratio': self.sharpe_ratio
            },
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Alert(db.Model):
    """Price and condition alerts"""
    __tablename__ = 'alerts'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    symbol = db.Column(db.String(10), nullable=False)
    alert_type = db.Column(db.String(50), nullable=False)  # price_above, price_below, technical, etc.
    
    # Alert conditions (stored as JSON)
    conditions = db.Column(db.Text, nullable=False)  # JSON string
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    is_triggered = db.Column(db.Boolean, default=False)
    triggered_at = db.Column(db.DateTime)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'symbol': self.symbol,
            'type': self.alert_type,
            'conditions': json.loads(self.conditions),
            'is_active': self.is_active,
            'is_triggered': self.is_triggered,
            'triggered_at': self.triggered_at.isoformat() if self.triggered_at else None,
            'created_at': self.created_at.isoformat()
        }

class MarketSentiment(db.Model):
    """Market sentiment data"""
    __tablename__ = 'market_sentiment'
    
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, nullable=False, index=True)
    
    # Fear & Greed Index
    fear_greed_index = db.Column(db.Integer)
    fear_greed_classification = db.Column(db.String(20))
    
    # News sentiment
    news_sentiment_score = db.Column(db.Float)
    news_sentiment_classification = db.Column(db.String(20))
    
    # Social sentiment
    social_sentiment_score = db.Column(db.Float)
    social_mentions = db.Column(db.Integer)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'timestamp': self.timestamp.isoformat(),
            'fear_greed_index': self.fear_greed_index,
            'fear_greed_classification': self.fear_greed_classification,
            'news_sentiment': {
                'score': self.news_sentiment_score,
                'classification': self.news_sentiment_classification
            },
            'social_sentiment': {
                'score': self.social_sentiment_score,
                'mentions': self.social_mentions
            }
        }
