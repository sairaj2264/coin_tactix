"""
Strategy API Routes
Handles trading strategies and backtesting
"""

from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
from models import db, Strategy
from services.ai_prediction_service import AIPredictionService
import json
import random

strategy_bp = Blueprint('strategy', __name__)
ai_service = AIPredictionService()

@strategy_bp.route('/', methods=['GET'])
def get_strategies():
    """Get all strategies"""
    try:
        strategies = Strategy.query.all()
        
        # If no strategies exist, create some demo ones
        if not strategies:
            demo_strategies = [
                {
                    'name': 'DCA Bitcoin',
                    'description': 'Dollar Cost Averaging strategy for Bitcoin accumulation',
                    'symbol': 'BTC',
                    'strategy_type': 'DCA',
                    'parameters': json.dumps({
                        'investment_amount': 1000,
                        'frequency': 'weekly',
                        'duration_months': 12
                    }),
                    'total_return': 2450.30,
                    'win_rate': 68.5,
                    'max_drawdown': -15.2,
                    'sharpe_ratio': 1.8
                },
                {
                    'name': 'Momentum Trading',
                    'description': 'Technical analysis based momentum trading',
                    'symbol': 'ETH',
                    'strategy_type': 'Technical',
                    'parameters': json.dumps({
                        'rsi_threshold': 70,
                        'macd_signal': True,
                        'stop_loss': 5.0
                    }),
                    'total_return': -156.80,
                    'win_rate': 45.2,
                    'max_drawdown': -22.1,
                    'sharpe_ratio': 0.3
                },
                {
                    'name': 'Mean Reversion',
                    'description': 'Statistical arbitrage using mean reversion',
                    'symbol': 'ADA',
                    'strategy_type': 'Statistical',
                    'parameters': json.dumps({
                        'lookback_period': 20,
                        'std_threshold': 2.0,
                        'position_size': 0.1
                    }),
                    'total_return': 1234.50,
                    'win_rate': 72.1,
                    'max_drawdown': -8.5,
                    'sharpe_ratio': 2.1
                }
            ]
            
            for strategy_data in demo_strategies:
                strategy = Strategy(**strategy_data)
                db.session.add(strategy)
            
            db.session.commit()
            strategies = Strategy.query.all()
        
        return jsonify({
            'strategies': [strategy.to_dict() for strategy in strategies]
        })
        
    except Exception as e:
        print(f"Error fetching strategies: {str(e)}")
        return jsonify({'error': str(e)}), 500

@strategy_bp.route('/', methods=['POST'])
def create_strategy():
    """Create a new strategy"""
    try:
        data = request.get_json()
        
        strategy = Strategy(
            name=data['name'],
            description=data.get('description', ''),
            symbol=data['symbol'],
            strategy_type=data['type'],
            parameters=json.dumps(data.get('parameters', {}))
        )
        
        db.session.add(strategy)
        db.session.commit()
        
        return jsonify({
            'strategy': strategy.to_dict(),
            'message': 'Strategy created successfully'
        }), 201
        
    except Exception as e:
        print(f"Error creating strategy: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@strategy_bp.route('/<int:strategy_id>', methods=['GET'])
def get_strategy(strategy_id):
    """Get a specific strategy"""
    try:
        strategy = Strategy.query.get_or_404(strategy_id)
        return jsonify({
            'strategy': strategy.to_dict()
        })
        
    except Exception as e:
        print(f"Error fetching strategy: {str(e)}")
        return jsonify({'error': str(e)}), 500

@strategy_bp.route('/<int:strategy_id>', methods=['PUT'])
def update_strategy(strategy_id):
    """Update a strategy"""
    try:
        strategy = Strategy.query.get_or_404(strategy_id)
        data = request.get_json()
        
        strategy.name = data.get('name', strategy.name)
        strategy.description = data.get('description', strategy.description)
        strategy.symbol = data.get('symbol', strategy.symbol)
        strategy.strategy_type = data.get('type', strategy.strategy_type)
        strategy.parameters = json.dumps(data.get('parameters', json.loads(strategy.parameters)))
        strategy.is_active = data.get('is_active', strategy.is_active)
        strategy.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'strategy': strategy.to_dict(),
            'message': 'Strategy updated successfully'
        })
        
    except Exception as e:
        print(f"Error updating strategy: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@strategy_bp.route('/<int:strategy_id>', methods=['DELETE'])
def delete_strategy(strategy_id):
    """Delete a strategy"""
    try:
        strategy = Strategy.query.get_or_404(strategy_id)
        db.session.delete(strategy)
        db.session.commit()
        
        return jsonify({
            'message': 'Strategy deleted successfully'
        })
        
    except Exception as e:
        print(f"Error deleting strategy: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@strategy_bp.route('/<int:strategy_id>/backtest', methods=['POST'])
def run_backtest(strategy_id):
    """Run backtest for a strategy"""
    try:
        strategy = Strategy.query.get_or_404(strategy_id)
        data = request.get_json()
        
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        initial_capital = data.get('initial_capital', 10000)
        
        # Simulate backtest results
        # In production, this would run actual backtesting logic
        backtest_results = _simulate_backtest(strategy, start_date, end_date, initial_capital)
        
        return jsonify({
            'strategy_id': strategy_id,
            'backtest_results': backtest_results
        })
        
    except Exception as e:
        print(f"Error running backtest: {str(e)}")
        return jsonify({'error': str(e)}), 500

def _simulate_backtest(strategy, start_date, end_date, initial_capital):
    """Simulate backtest results for demo"""
    
    # Generate realistic backtest data
    days = 252  # Approximate trading days in a year
    returns = []
    equity_curve = [initial_capital]
    
    # Simulate daily returns based on strategy type
    if strategy.strategy_type == 'DCA':
        # DCA typically has lower volatility, steady growth
        daily_returns = [random.gauss(0.0008, 0.015) for _ in range(days)]  # ~20% annual return, 15% volatility
    elif strategy.strategy_type == 'Technical':
        # Technical strategies can be more volatile
        daily_returns = [random.gauss(0.0003, 0.025) for _ in range(days)]  # ~8% annual return, 25% volatility
    else:
        # Statistical strategies
        daily_returns = [random.gauss(0.0005, 0.012) for _ in range(days)]  # ~13% annual return, 12% volatility
    
    # Calculate equity curve
    for daily_return in daily_returns:
        new_equity = equity_curve[-1] * (1 + daily_return)
        equity_curve.append(new_equity)
        returns.append(daily_return)
    
    # Calculate performance metrics
    total_return = (equity_curve[-1] - initial_capital) / initial_capital
    
    # Calculate max drawdown
    peak = initial_capital
    max_drawdown = 0
    for equity in equity_curve:
        if equity > peak:
            peak = equity
        drawdown = (peak - equity) / peak
        if drawdown > max_drawdown:
            max_drawdown = drawdown
    
    # Calculate Sharpe ratio (simplified)
    avg_return = sum(returns) / len(returns)
    return_std = (sum([(r - avg_return) ** 2 for r in returns]) / len(returns)) ** 0.5
    sharpe_ratio = (avg_return * 252) / (return_std * (252 ** 0.5)) if return_std > 0 else 0
    
    # Calculate win rate
    winning_days = sum(1 for r in returns if r > 0)
    win_rate = winning_days / len(returns)
    
    # Generate trade history
    trades = []
    for i in range(0, len(equity_curve) - 1, random.randint(5, 15)):
        trade_return = random.gauss(0.02, 0.05)  # 2% average return per trade
        trades.append({
            'date': (datetime.now() - timedelta(days=len(equity_curve) - i)).isoformat(),
            'type': random.choice(['BUY', 'SELL']),
            'price': equity_curve[i] / 100,  # Simulate price
            'quantity': random.uniform(0.1, 2.0),
            'return_percent': trade_return * 100
        })
    
    return {
        'initial_capital': initial_capital,
        'final_capital': round(equity_curve[-1], 2),
        'total_return': round(total_return * 100, 2),
        'total_return_amount': round(equity_curve[-1] - initial_capital, 2),
        'max_drawdown': round(max_drawdown * 100, 2),
        'sharpe_ratio': round(sharpe_ratio, 2),
        'win_rate': round(win_rate * 100, 2),
        'total_trades': len(trades),
        'winning_trades': len([t for t in trades if t['return_percent'] > 0]),
        'equity_curve': [{'date': (datetime.now() - timedelta(days=len(equity_curve) - i)).isoformat(), 'equity': round(equity, 2)} for i, equity in enumerate(equity_curve[::10])],  # Sample every 10th point
        'trades': trades[:20],  # Return last 20 trades
        'start_date': start_date,
        'end_date': end_date,
        'duration_days': days,
        'strategy_name': strategy.name,
        'timestamp': datetime.utcnow().isoformat()
    }

@strategy_bp.route('/predictions', methods=['POST'])
def get_prediction():
    """Get AI prediction for investment"""
    try:
        data = request.get_json()
        symbol = data.get('symbol', 'BTC')
        timeframe = data.get('timeframe', '1d')
        investment_amount = data.get('investment_amount', 1000)
        
        # Get AI prediction
        prediction = ai_service.get_price_prediction(symbol, timeframe)
        
        if prediction:
            # Calculate potential profit/loss
            current_price = prediction['current_price']
            predicted_price = prediction['predicted_price']
            price_change = (predicted_price - current_price) / current_price
            
            potential_profit = investment_amount * price_change
            
            prediction['investment_analysis'] = {
                'investment_amount': investment_amount,
                'potential_profit': round(potential_profit, 2),
                'potential_return_percent': round(price_change * 100, 2),
                'risk_level': 'High' if abs(price_change) > 0.1 else 'Medium' if abs(price_change) > 0.05 else 'Low',
                'recommended_position_size': min(investment_amount, investment_amount * prediction['confidence'])
            }
        
        return jsonify({
            'prediction': prediction
        })
        
    except Exception as e:
        print(f"Error getting prediction: {str(e)}")
        return jsonify({'error': str(e)}), 500
