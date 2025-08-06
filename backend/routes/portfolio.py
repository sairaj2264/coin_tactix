"""
Portfolio API Routes
"""

from flask import Blueprint, jsonify, request
from datetime import datetime
import random

portfolio_bp = Blueprint('portfolio', __name__)

@portfolio_bp.route('/', methods=['GET'])
def get_portfolio():
    """Get portfolio data"""
    try:
        # Mock portfolio data
        portfolio = {
            'total_value': 125430.50,
            'total_change_24h': 2.34,
            'total_pnl': 8234.12,
            'holdings': [
                {
                    'symbol': 'BTC',
                    'amount': 2.5,
                    'value': 112500,
                    'change_24h': 1.8
                },
                {
                    'symbol': 'ETH',
                    'amount': 4.0,
                    'value': 12800,
                    'change_24h': 3.2
                }
            ]
        }
        
        return jsonify({'portfolio': portfolio})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
