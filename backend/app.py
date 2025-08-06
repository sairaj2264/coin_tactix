"""
CoinTactix Backend API
Advanced Cryptocurrency Trading Intelligence Platform
"""

import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_app():
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///cointactix.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['REDIS_URL'] = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    
    # Initialize extensions
    CORS(app, origins=["http://localhost:3000"])
    
    # Initialize SocketIO
    socketio = SocketIO(
        app, 
        cors_allowed_origins=["http://localhost:3000"],
        async_mode='eventlet'
    )
    
    # Import and register blueprints
    from routes.market import market_bp
    from routes.strategy import strategy_bp
    from routes.alerts import alerts_bp
    from routes.auth import auth_bp
    from routes.portfolio import portfolio_bp
    
    app.register_blueprint(market_bp, url_prefix='/api/market')
    app.register_blueprint(strategy_bp, url_prefix='/api/strategies')
    app.register_blueprint(alerts_bp, url_prefix='/api/alerts')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(portfolio_bp, url_prefix='/api/portfolio')
    
    # Initialize database
    from models import db
    db.init_app(app)
    
    # Initialize real-time services
    from services.websocket_service import init_websocket
    init_websocket(socketio)
    
    # Health check endpoint
    @app.route('/api/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'CoinTactix API',
            'version': '1.0.0'
        })
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    return app, socketio

if __name__ == '__main__':
    app, socketio = create_app()
    
    # Create tables
    with app.app_context():
        from models import db
        db.create_all()
        print("Database tables created successfully!")
    
    print("Starting CoinTactix Backend Server...")
    print("API available at: http://localhost:5000")
    print("WebSocket available at: ws://localhost:5000")
    
    # Start the server
    socketio.run(
        app,
        host='0.0.0.0',
        port=5000,
        debug=True,
        use_reloader=True
    )
