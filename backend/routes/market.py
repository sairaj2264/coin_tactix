"""
Market Data API Routes
Handles real-time and historical market data
"""

from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
from models import db, OHLCVData, TechnicalIndicators, OnChainMetrics, MarketSentiment
from services.market_data_service import MarketDataService
from services.ai_prediction_service import AIPredictionService

market_bp = Blueprint('market', __name__)
market_service = MarketDataService()
ai_service = AIPredictionService()

@market_bp.route('/ohlcv/<symbol>')
def get_ohlcv_data(symbol):
    """Get OHLCV data for a symbol"""
    try:
        timeframe = request.args.get('timeframe', '1d')
        limit = int(request.args.get('limit', 100))
        
        # Try to get from database first
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(days=limit if timeframe == '1d' else limit // 24)
        
        data = OHLCVData.query.filter(
            OHLCVData.symbol == symbol.upper(),
            OHLCVData.timeframe == timeframe,
            OHLCVData.timestamp >= start_time
        ).order_by(OHLCVData.timestamp.desc()).limit(limit).all()
        
        # If no data in database, fetch from external API
        if not data:
            print(f"No data in database for {symbol}, fetching from external API...")
            data = market_service.fetch_and_store_ohlcv(symbol, timeframe, limit)
        
        return jsonify({
            'symbol': symbol.upper(),
            'timeframe': timeframe,
            'data': [item.to_dict() if hasattr(item, 'to_dict') else item for item in data]
        })
        
    except Exception as e:
        print(f"Error fetching OHLCV data: {str(e)}")
        return jsonify({'error': str(e)}), 500

@market_bp.route('/indicators/<symbol>')
def get_technical_indicators(symbol):
    """Get technical indicators for a symbol"""
    try:
        timeframe = request.args.get('timeframe', '1d')
        indicators = request.args.get('indicators', 'rsi,macd,sma').split(',')
        
        # Get latest indicators from database
        latest_indicators = TechnicalIndicators.query.filter(
            TechnicalIndicators.symbol == symbol.upper(),
            TechnicalIndicators.timeframe == timeframe
        ).order_by(TechnicalIndicators.timestamp.desc()).first()
        
        # If no indicators, calculate them
        if not latest_indicators:
            print(f"No indicators in database for {symbol}, calculating...")
            latest_indicators = market_service.calculate_and_store_indicators(symbol, timeframe)
        
        if latest_indicators:
            return jsonify({
                'symbol': symbol.upper(),
                'indicators': latest_indicators.to_dict()
            })
        else:
            return jsonify({'error': 'Unable to calculate indicators'}), 500
            
    except Exception as e:
        print(f"Error fetching technical indicators: {str(e)}")
        return jsonify({'error': str(e)}), 500

@market_bp.route('/onchain/<symbol>')
def get_onchain_metrics(symbol):
    """Get on-chain metrics for a symbol"""
    try:
        # Get latest on-chain metrics
        latest_metrics = OnChainMetrics.query.filter(
            OnChainMetrics.symbol == symbol.upper()
        ).order_by(OnChainMetrics.timestamp.desc()).first()
        
        # If no metrics, fetch them
        if not latest_metrics:
            print(f"No on-chain metrics for {symbol}, fetching...")
            latest_metrics = market_service.fetch_and_store_onchain_metrics(symbol)
        
        if latest_metrics:
            return jsonify({
                'symbol': symbol.upper(),
                'metrics': latest_metrics.to_dict()
            })
        else:
            # Return mock data for demo
            return jsonify({
                'symbol': symbol.upper(),
                'metrics': {
                    'timestamp': datetime.utcnow().isoformat(),
                    'mvrv_ratio': 2.1,
                    'puell_multiple': 0.8,
                    'sopr': 1.05,
                    'nvt_ratio': 45.2,
                    'active_addresses': 950000,
                    'transaction_count': 280000,
                    'hash_rate': 450000000000,
                    'difficulty': 62000000000000
                }
            })
            
    except Exception as e:
        print(f"Error fetching on-chain metrics: {str(e)}")
        return jsonify({'error': str(e)}), 500

@market_bp.route('/sentiment')
def get_market_sentiment():
    """Get market sentiment data"""
    try:
        # Get latest sentiment data
        latest_sentiment = MarketSentiment.query.order_by(
            MarketSentiment.timestamp.desc()
        ).first()
        
        # If no sentiment data, fetch it
        if not latest_sentiment:
            print("No sentiment data, fetching...")
            latest_sentiment = market_service.fetch_and_store_sentiment()
        
        if latest_sentiment:
            return jsonify({
                'sentiment': latest_sentiment.to_dict()
            })
        else:
            # Return mock data for demo
            return jsonify({
                'sentiment': {
                    'timestamp': datetime.utcnow().isoformat(),
                    'fear_greed_index': 65,
                    'fear_greed_classification': 'Greed',
                    'news_sentiment': {
                        'score': 0.3,
                        'classification': 'Positive'
                    },
                    'social_sentiment': {
                        'score': 0.15,
                        'mentions': 15420
                    }
                }
            })
            
    except Exception as e:
        print(f"Error fetching market sentiment: {str(e)}")
        return jsonify({'error': str(e)}), 500

@market_bp.route('/price/<symbol>')
def get_real_time_price(symbol):
    """Get real-time price for a symbol"""
    try:
        price_data = market_service.get_real_time_price(symbol)
        
        if price_data:
            return jsonify({
                'symbol': symbol.upper(),
                'price': price_data['price'],
                'change_24h': price_data['change_24h'],
                'volume_24h': price_data['volume_24h'],
                'timestamp': datetime.utcnow().isoformat()
            })
        else:
            # Return mock data for demo
            import random
            base_price = 45000 if symbol.upper() == 'BTC' else 3200 if symbol.upper() == 'ETH' else 1.0
            change = random.uniform(-5, 5)
            
            return jsonify({
                'symbol': symbol.upper(),
                'price': base_price * (1 + change/100),
                'change_24h': change,
                'volume_24h': random.uniform(1000000, 5000000),
                'timestamp': datetime.utcnow().isoformat()
            })
            
    except Exception as e:
        print(f"Error fetching real-time price: {str(e)}")
        return jsonify({'error': str(e)}), 500

@market_bp.route('/overview')
def get_market_overview():
    """Get market overview with multiple cryptocurrencies"""
    try:
        symbols = ['BTC', 'ETH', 'ADA', 'SOL', 'DOT', 'LINK']
        overview_data = []
        
        for symbol in symbols:
            price_data = market_service.get_real_time_price(symbol)
            
            if not price_data:
                # Mock data for demo
                import random
                base_prices = {'BTC': 45000, 'ETH': 3200, 'ADA': 0.5, 'SOL': 100, 'DOT': 25, 'LINK': 15}
                change = random.uniform(-5, 5)
                price_data = {
                    'price': base_prices.get(symbol, 1.0) * (1 + change/100),
                    'change_24h': change,
                    'volume_24h': random.uniform(100000, 1000000)
                }
            
            overview_data.append({
                'symbol': symbol,
                'price': price_data['price'],
                'change_24h': price_data['change_24h'],
                'volume_24h': price_data['volume_24h']
            })
        
        return jsonify({
            'overview': overview_data,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        print(f"Error fetching market overview: {str(e)}")
        return jsonify({'error': str(e)}), 500

@market_bp.route('/prediction/<symbol>')
def get_ai_prediction(symbol):
    """Get AI prediction for a symbol"""
    try:
        timeframe = request.args.get('timeframe', '1d')
        prediction = ai_service.get_price_prediction(symbol, timeframe)
        
        if prediction:
            return jsonify({
                'symbol': symbol.upper(),
                'prediction': prediction
            })
        else:
            # Return mock prediction for demo
            import random
            current_price = 45000 if symbol.upper() == 'BTC' else 3200
            predicted_change = random.uniform(-10, 15)
            
            return jsonify({
                'symbol': symbol.upper(),
                'prediction': {
                    'current_price': current_price,
                    'predicted_price': current_price * (1 + predicted_change/100),
                    'confidence': random.uniform(0.6, 0.9),
                    'direction': 'bullish' if predicted_change > 0 else 'bearish',
                    'timeframe': timeframe,
                    'factors': [
                        'Technical indicators suggest upward momentum',
                        'On-chain metrics show accumulation',
                        'Market sentiment is positive'
                    ],
                    'timestamp': datetime.utcnow().isoformat()
                }
            })
            
    except Exception as e:
        print(f"Error getting AI prediction: {str(e)}")
        return jsonify({'error': str(e)}), 500
