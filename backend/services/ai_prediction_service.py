"""
AI Prediction Service
Handles machine learning models for price prediction
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import RandomForestRegressor
import joblib
import os
from typing import Dict, List, Optional, Union
import logging
from dataclasses import dataclass

MODEL_PATHS = {
    "BTC": os.getenv("BTC_MODEL_PATH", "models/BTC_model.joblib"),
    "ETH": os.getenv("ETH_MODEL_PATH", "models/ETH_model.joblib"),
}

_models = {}

def load_models():
    global _models
    for key, path in MODEL_PATHS.items():
        if key not in _models:
            _models[key] = joblib.load(path)

def predict(symbol: str, features: list) -> float:
    if not _models:
        load_models()
    model = _models.get(symbol)
    if not model:
        raise ValueError(f"Model for {symbol} not loaded.")
    return model.predict([features])[0]

@dataclass
class ModelInfo:
    version: str
    last_updated: datetime
    accuracy: float

class AIPredictionService:
    def __init__(self):
        self._models: Dict[str, object] = {}
        self._model_info: Dict[str, ModelInfo] = {}
        self.logger = logging.getLogger(__name__)
        self.model_dir = 'models'
        os.makedirs(self.model_dir, exist_ok=True)
        self._load_models()
    
    def _load_models(self) -> None:
        try:
            model_paths = {
                "BTC": "models/BTC_model.joblib",
                "ETH": "models/ETH_model.joblib"
            }
            for symbol, path in model_paths.items():
                self._models[symbol] = joblib.load(path)
                self._model_info[symbol] = ModelInfo(
                    version="1.0.0",
                    last_updated=datetime.now(),
                    accuracy=0.85  # Add actual model accuracy
                )
        except Exception as e:
            self.logger.error(f"Model loading failed: {str(e)}")
            raise

    def get_price_prediction(self, symbol, timeframe='1d'):
        """Get AI price prediction for a symbol"""
        try:
            # For demo purposes, we'll use a simple model
            # In production, this would use trained LSTM/XGBoost models
            
            from models import OHLCVData, TechnicalIndicators
            
            # Get recent data
            recent_data = OHLCVData.query.filter(
                OHLCVData.symbol == symbol.upper(),
                OHLCVData.timeframe == timeframe
            ).order_by(OHLCVData.timestamp.desc()).limit(30).all()
            
            if len(recent_data) < 10:
                return self._generate_mock_prediction(symbol, timeframe)
            
            # Prepare features
            features = self._prepare_features(recent_data, symbol, timeframe)
            
            if features is None:
                return self._generate_mock_prediction(symbol, timeframe)
            
            # Load or create model
            model = self._get_or_create_model(symbol)
            
            # Make prediction
            prediction = model.predict([features])[0]
            current_price = recent_data[0].close_price
            
            # Calculate confidence based on recent volatility
            prices = [d.close_price for d in recent_data[:7]]
            volatility = np.std(prices) / np.mean(prices)
            confidence = max(0.5, 1 - volatility * 10)  # Lower confidence for high volatility
            
            # Determine direction and factors
            price_change = (prediction - current_price) / current_price
            direction = 'bullish' if price_change > 0.01 else 'bearish' if price_change < -0.01 else 'neutral'
            
            factors = self._generate_prediction_factors(symbol, direction, recent_data)
            
            return {
                'current_price': round(current_price, 2),
                'predicted_price': round(prediction, 2),
                'price_change_percent': round(price_change * 100, 2),
                'confidence': round(confidence, 3),
                'direction': direction,
                'timeframe': timeframe,
                'factors': factors,
                'model_type': 'Random Forest (Demo)',
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            print(f"Error generating prediction: {str(e)}")
            return self._generate_mock_prediction(symbol, timeframe)
    
    def _prepare_features(self, ohlcv_data, symbol, timeframe):
        """Prepare features for ML model"""
        try:
            # Convert to DataFrame
            df = pd.DataFrame([{
                'open': d.open_price,
                'high': d.high_price,
                'low': d.low_price,
                'close': d.close_price,
                'volume': d.volume
            } for d in reversed(ohlcv_data)])
            
            if len(df) < 10:
                return None
            
            # Calculate technical features
            df['returns'] = df['close'].pct_change()
            df['volatility'] = df['returns'].rolling(window=5).std()
            df['sma_5'] = df['close'].rolling(window=5).mean()
            df['sma_10'] = df['close'].rolling(window=10).mean()
            df['rsi'] = self._calculate_rsi(df['close'], 14)
            df['volume_sma'] = df['volume'].rolling(window=5).mean()
            
            # Price momentum features
            df['price_momentum_3'] = df['close'] / df['close'].shift(3) - 1
            df['price_momentum_7'] = df['close'] / df['close'].shift(7) - 1
            
            # Volume features
            df['volume_ratio'] = df['volume'] / df['volume_sma']
            
            # Get latest features (drop NaN values)
            latest_features = df.iloc[-1][[
                'returns', 'volatility', 'sma_5', 'sma_10', 'rsi',
                'volume_ratio', 'price_momentum_3', 'price_momentum_7'
            ]].fillna(0).values
            
            return latest_features
            
        except Exception as e:
            print(f"Error preparing features: {str(e)}")
            return None
    
    def _calculate_rsi(self, prices, window=14):
        """Calculate RSI indicator"""
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi
    
    def _get_or_create_model(self, symbol):
        """Get existing model or create a new one"""
        model_path = os.path.join(self.model_dir, f'{symbol}_model.joblib')
        
        if symbol in self.models:
            return self.models[symbol]
        
        if os.path.exists(model_path):
            try:
                model = joblib.load(model_path)
                self.models[symbol] = model
                return model
            except:
                pass
        
        # Create a simple Random Forest model for demo
        model = RandomForestRegressor(
            n_estimators=50,
            max_depth=10,
            random_state=42
        )
        
        # Train with synthetic data for demo
        X_train, y_train = self._generate_training_data(symbol)
        model.fit(X_train, y_train)
        
        # Save model
        try:
            joblib.dump(model, model_path)
        except:
            pass
        
        self.models[symbol] = model
        return model
    
    def _generate_training_data(self, symbol, n_samples=1000):
        """Generate synthetic training data for demo"""
        np.random.seed(42)
        
        # Generate synthetic features
        X = np.random.randn(n_samples, 8)
        
        # Generate synthetic target with some correlation to features
        y = (X[:, 0] * 0.3 +  # returns
             X[:, 1] * -0.2 +  # volatility (negative correlation)
             X[:, 2] * 0.1 +   # sma_5
             X[:, 6] * 0.4 +   # price_momentum_3
             np.random.randn(n_samples) * 0.1)  # noise
        
        # Scale to realistic price ranges
        base_price = 45000 if symbol == 'BTC' else 3200 if symbol == 'ETH' else 100
        y = base_price * (1 + y * 0.05)  # 5% max change
        
        return X, y
    
    def _generate_prediction_factors(self, symbol, direction, recent_data):
        """Generate explanation factors for the prediction"""
        factors = []
        
        # Analyze recent price trend
        recent_prices = [d.close_price for d in recent_data[:7]]
        trend = 'upward' if recent_prices[0] > recent_prices[-1] else 'downward'
        
        if direction == 'bullish':
            factors.extend([
                f"Technical indicators suggest {trend} momentum",
                "Recent volume patterns indicate accumulation",
                "Market structure shows bullish divergence"
            ])
        elif direction == 'bearish':
            factors.extend([
                f"Technical indicators show {trend} pressure",
                "Volume analysis suggests distribution",
                "Market structure indicates potential correction"
            ])
        else:
            factors.extend([
                "Mixed signals from technical indicators",
                "Consolidation pattern detected",
                "Waiting for directional breakout"
            ])
        
        # Add symbol-specific factors
        if symbol.upper() == 'BTC':
            factors.append("Bitcoin dominance affecting market sentiment")
        elif symbol.upper() == 'ETH':
            factors.append("Ethereum network activity influencing price")
        
        return factors[:4]  # Return top 4 factors
    
    def _generate_mock_prediction(self, symbol, timeframe):
        """Generate mock prediction for demo purposes"""
        import random
        
        base_prices = {
            'BTC': 45000,
            'ETH': 3200,
            'ADA': 0.5,
            'SOL': 100,
            'DOT': 25,
            'LINK': 15
        }
        
        current_price = base_prices.get(symbol.upper(), 100)
        price_change = random.uniform(-8, 12)  # -8% to +12%
        predicted_price = current_price * (1 + price_change / 100)
        confidence = random.uniform(0.65, 0.85)
        
        direction = 'bullish' if price_change > 1 else 'bearish' if price_change < -1 else 'neutral'
        
        factors = [
            "AI model detects positive momentum patterns",
            "Technical indicators align with prediction",
            "Market sentiment analysis supports forecast",
            "Historical patterns suggest similar outcomes"
        ]
        
        if direction == 'bearish':
            factors = [
                "AI model identifies potential correction signals",
                "Technical indicators show weakening momentum",
                "Market sentiment analysis indicates caution",
                "Risk management suggests defensive positioning"
            ]
        
        return {
            'current_price': round(current_price, 2),
            'predicted_price': round(predicted_price, 2),
            'price_change_percent': round(price_change, 2),
            'confidence': round(confidence, 3),
            'direction': direction,
            'timeframe': timeframe,
            'factors': factors,
            'model_type': 'Hybrid LSTM-XGBoost (Demo)',
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def retrain_model(self, symbol, new_data):
        """Retrain model with new data (placeholder)"""
        # This would implement incremental learning
        # For now, just a placeholder
        pass
    
    def get_model_performance(self, symbol):
        """Get model performance metrics"""
        # This would return actual performance metrics
        # For now, return mock metrics
        return {
            'accuracy': 0.73,
            'precision': 0.68,
            'recall': 0.71,
            'f1_score': 0.69,
            'last_updated': datetime.utcnow().isoformat()
        }
    
    def predict(self, symbol: str, features: List[float]) -> Dict[str, Union[float, str]]:
        try:
            if symbol not in self._models:
                raise ValueError(f"No model available for {symbol}")
            
            prediction = self._models[symbol].predict([features])[0]
            confidence = self._models[symbol].predict_proba([features])[0].max()
            
            return {
                "prediction": float(prediction),
                "confidence": float(confidence),
                "model_version": self._model_info[symbol].version,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            self.logger.error(f"Prediction failed for {symbol}: {str(e)}")
            raise
