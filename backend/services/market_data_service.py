"""
Market Data Service
Handles fetching and processing market data from various sources
"""

import requests
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from models import db, OHLCVData, TechnicalIndicators, OnChainMetrics, MarketSentiment
# import talib  # Commented out for now - requires special installation
from typing import Dict, List, Optional
import aiohttp
import asyncio
import logging
from cachetools import TTLCache
from services.currency_service import CurrencyService

class MarketDataService:
    def __init__(self, currency_service: CurrencyService):
        self.currency_service = currency_service
        self.coingecko_base_url = "https://api.coingecko.com/api/v3"
        self.session = requests.Session()
        self.logger = logging.getLogger(__name__)
        self.price_cache = TTLCache(maxsize=100, ttl=60)  # 60 second cache
        self.session: Optional[aiohttp.ClientSession] = None
        
    async def initialize(self):
        if not self.session:
            self.session = aiohttp.ClientSession()
            
    async def close(self):
        if self.session:
            await self.session.close()
            
    async def get_price_data(self, symbol: str) -> Dict:
        if not self.session:
            await self.initialize()
            
        # Get USD price
        usd_data = await self._fetch_price_data(symbol)
        
        # Convert to INR
        inr_data = await self.currency_service.convert_usd_to_inr(usd_data["price"])
        
        return {
            **usd_data,
            "price_inr": inr_data["INR"],
            "price_usd": usd_data["price"],
            "conversion_rate": inr_data["rate"]
        }
    
    async def _fetch_price_data(self, symbol: str) -> Dict:
        cache_key = f"{symbol}_price"
        if cache_key in self.price_cache:
            return self.price_cache[cache_key]
            
        try:
            async with self.session.get(f"https://api.example.com/v1/prices/{symbol}") as response:
                if response.status == 200:
                    data = await response.json()
                    self.price_cache[cache_key] = data
                    return data
                else:
                    raise Exception(f"API returned status {response.status}")
        except Exception as e:
            self.logger.error(f"Failed to fetch price data: {str(e)}")
            raise
            
    async def get_historical_data(
        self, 
        symbol: str, 
        start_time: datetime,
        end_time: datetime,
        interval: str = "1h"
    ) -> List[Dict]:
        # Implementation for historical data
        pass
    
    def fetch_and_store_ohlcv(self, symbol, timeframe='1d', limit=100):
        """Fetch OHLCV data and store in database"""
        try:
            # Use yfinance for reliable data
            ticker_map = {
                'BTC': 'BTC-USD',
                'ETH': 'ETH-USD',
                'ADA': 'ADA-USD',
                'SOL': 'SOL-USD',
                'DOT': 'DOT-USD',
                'LINK': 'LINK-USD'
            }
            
            ticker = ticker_map.get(symbol.upper(), f"{symbol.upper()}-USD")
            
            # Determine period based on timeframe and limit
            if timeframe == '1d':
                period = f"{limit}d"
                interval = "1d"
            elif timeframe == '1h':
                period = f"{min(limit, 730)}h"  # yfinance limit
                interval = "1h"
            else:
                period = "100d"
                interval = "1d"
            
            # Fetch data from yfinance
            stock = yf.Ticker(ticker)
            hist = stock.history(period=period, interval=interval)
            
            if hist.empty:
                print(f"No data returned for {ticker}")
                return self._generate_mock_ohlcv_data(symbol, timeframe, limit)
            
            # Convert to our format and store
            ohlcv_data = []
            for timestamp, row in hist.iterrows():
                # Check if record already exists
                existing = OHLCVData.query.filter(
                    OHLCVData.symbol == symbol.upper(),
                    OHLCVData.timestamp == timestamp.to_pydatetime(),
                    OHLCVData.timeframe == timeframe
                ).first()
                
                if not existing:
                    ohlcv_record = OHLCVData(
                        symbol=symbol.upper(),
                        timestamp=timestamp.to_pydatetime(),
                        timeframe=timeframe,
                        open_price=float(row['Open']),
                        high_price=float(row['High']),
                        low_price=float(row['Low']),
                        close_price=float(row['Close']),
                        volume=float(row['Volume'])
                    )
                    db.session.add(ohlcv_record)
                    ohlcv_data.append(ohlcv_record)
                else:
                    ohlcv_data.append(existing)
            
            db.session.commit()
            print(f"Stored {len(ohlcv_data)} OHLCV records for {symbol}")
            return ohlcv_data[-limit:]  # Return latest records
            
        except Exception as e:
            print(f"Error fetching OHLCV data: {str(e)}")
            db.session.rollback()
            return self._generate_mock_ohlcv_data(symbol, timeframe, limit)
    
    def _generate_mock_ohlcv_data(self, symbol, timeframe, limit):
        """Generate mock OHLCV data for demo purposes"""
        print(f"Generating mock data for {symbol}")
        
        base_prices = {
            'BTC': 45000,
            'ETH': 3200,
            'ADA': 0.5,
            'SOL': 100,
            'DOT': 25,
            'LINK': 15
        }
        
        base_price = base_prices.get(symbol.upper(), 1.0)
        mock_data = []
        
        for i in range(limit):
            # Generate realistic price movement
            days_ago = limit - i - 1
            timestamp = datetime.utcnow() - timedelta(days=days_ago)
            
            # Random walk with slight upward bias
            price_change = np.random.normal(0.001, 0.02)  # 0.1% daily drift, 2% volatility
            if i == 0:
                close_price = base_price
            else:
                close_price = mock_data[-1]['close'] * (1 + price_change)
            
            # Generate OHLC from close
            volatility = abs(np.random.normal(0, 0.01))
            high_price = close_price * (1 + volatility)
            low_price = close_price * (1 - volatility)
            open_price = low_price + (high_price - low_price) * np.random.random()
            
            volume = np.random.uniform(100000, 1000000)
            
            mock_data.append({
                'symbol': symbol.upper(),
                'timestamp': timestamp.isoformat(),
                'timeframe': timeframe,
                'open': round(open_price, 2),
                'high': round(high_price, 2),
                'low': round(low_price, 2),
                'close': round(close_price, 2),
                'volume': round(volume, 0)
            })
        
        return mock_data
    
    def calculate_and_store_indicators(self, symbol, timeframe='1d'):
        """Calculate technical indicators and store them"""
        try:
            # Get OHLCV data
            ohlcv_data = OHLCVData.query.filter(
                OHLCVData.symbol == symbol.upper(),
                OHLCVData.timeframe == timeframe
            ).order_by(OHLCVData.timestamp.asc()).limit(200).all()
            
            if len(ohlcv_data) < 50:
                print(f"Not enough data to calculate indicators for {symbol}")
                return None
            
            # Convert to pandas DataFrame
            df = pd.DataFrame([{
                'timestamp': item.timestamp,
                'open': item.open_price,
                'high': item.high_price,
                'low': item.low_price,
                'close': item.close_price,
                'volume': item.volume
            } for item in ohlcv_data])
            
            # Calculate indicators using simple implementations
            close_prices = df['close']

            # Moving Averages
            sma_20 = close_prices.rolling(window=20).mean()
            sma_50 = close_prices.rolling(window=50).mean()
            ema_12 = close_prices.ewm(span=12).mean()
            ema_26 = close_prices.ewm(span=26).mean()

            # RSI (simplified)
            rsi = self._calculate_rsi_simple(close_prices, 14)

            # MACD
            macd = ema_12 - ema_26
            macd_signal = macd.ewm(span=9).mean()
            macd_hist = macd - macd_signal

            # Bollinger Bands
            bb_middle = close_prices.rolling(window=20).mean()
            bb_std = close_prices.rolling(window=20).std()
            bb_upper = bb_middle + (bb_std * 2)
            bb_lower = bb_middle - (bb_std * 2)
            
            # Store latest indicators
            latest_idx = -1
            latest_timestamp = df.iloc[latest_idx]['timestamp']
            
            # Check if indicators already exist
            existing = TechnicalIndicators.query.filter(
                TechnicalIndicators.symbol == symbol.upper(),
                TechnicalIndicators.timestamp == latest_timestamp,
                TechnicalIndicators.timeframe == timeframe
            ).first()
            
            if existing:
                return existing
            
            indicators = TechnicalIndicators(
                symbol=symbol.upper(),
                timestamp=latest_timestamp,
                timeframe=timeframe,
                sma_20=float(sma_20.iloc[latest_idx]) if not pd.isna(sma_20.iloc[latest_idx]) else None,
                sma_50=float(sma_50.iloc[latest_idx]) if not pd.isna(sma_50.iloc[latest_idx]) else None,
                ema_12=float(ema_12.iloc[latest_idx]) if not pd.isna(ema_12.iloc[latest_idx]) else None,
                ema_26=float(ema_26.iloc[latest_idx]) if not pd.isna(ema_26.iloc[latest_idx]) else None,
                rsi=float(rsi.iloc[latest_idx]) if not pd.isna(rsi.iloc[latest_idx]) else None,
                macd=float(macd.iloc[latest_idx]) if not pd.isna(macd.iloc[latest_idx]) else None,
                macd_signal=float(macd_signal.iloc[latest_idx]) if not pd.isna(macd_signal.iloc[latest_idx]) else None,
                macd_histogram=float(macd_hist.iloc[latest_idx]) if not pd.isna(macd_hist.iloc[latest_idx]) else None,
                bb_upper=float(bb_upper.iloc[latest_idx]) if not pd.isna(bb_upper.iloc[latest_idx]) else None,
                bb_middle=float(bb_middle.iloc[latest_idx]) if not pd.isna(bb_middle.iloc[latest_idx]) else None,
                bb_lower=float(bb_lower.iloc[latest_idx]) if not pd.isna(bb_lower.iloc[latest_idx]) else None
            )
            
            db.session.add(indicators)
            db.session.commit()
            
            print(f"Calculated and stored indicators for {symbol}")
            return indicators
            
        except Exception as e:
            print(f"Error calculating indicators: {str(e)}")
            db.session.rollback()
            return None
    
    def get_real_time_price(self, symbol):
        """Get real-time price data"""
        try:
            # Try CoinGecko API first
            coin_ids = {
                'BTC': 'bitcoin',
                'ETH': 'ethereum',
                'ADA': 'cardano',
                'SOL': 'solana',
                'DOT': 'polkadot',
                'LINK': 'chainlink'
            }
            
            coin_id = coin_ids.get(symbol.upper())
            if not coin_id:
                return None
            
            url = f"{self.coingecko_base_url}/simple/price"
            params = {
                'ids': coin_id,
                'vs_currencies': 'usd',
                'include_24hr_change': 'true',
                'include_24hr_vol': 'true'
            }
            
            response = self.session.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                coin_data = data.get(coin_id, {})
                
                return {
                    'price': coin_data.get('usd'),
                    'change_24h': coin_data.get('usd_24h_change'),
                    'volume_24h': coin_data.get('usd_24h_vol')
                }
            
            return None
            
        except Exception as e:
            print(f"Error fetching real-time price: {str(e)}")
            return None
    
    def fetch_and_store_onchain_metrics(self, symbol):
        """Fetch on-chain metrics (mock implementation)"""
        # This would integrate with services like Glassnode, CryptoQuant, etc.
        # For now, return mock data
        return None
    
    def fetch_and_store_sentiment(self):
        """Fetch market sentiment data (mock implementation)"""
        # This would integrate with Fear & Greed Index API, news APIs, etc.
        # For now, return mock data
        return None

    def _calculate_rsi_simple(self, prices, window=14):
        """Calculate RSI using simple implementation"""
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi



#this uses machine learning ,# which is not implemented yet# import some_ml_library
# def predict_price_movement(self, symbol):
#     """Predict price movement using ML models (mock implementation)"""//passive commit

#     pass and push for the  sake of it