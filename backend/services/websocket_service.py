"""
WebSocket Service
Handles real-time data streaming to frontend clients
"""

import threading
import time
import random
from datetime import datetime
from flask_socketio import emit, SocketIO
from services.market_data_service import MarketDataService
import asyncio
import json
import logging
from typing import Dict, Set
from aiohttp import web
import aiohttp

# Global variables
socketio_instance = None
_market_service = None
price_update_thread = None
connected_clients = set()

class WebSocketManager:
    def __init__(self):
        self.connections: Set[web.WebSocketResponse] = set()
        self.logger = logging.getLogger(__name__)
        
    async def register(self, ws: web.WebSocketResponse):
        self.connections.add(ws)
        self.logger.info(f"New client connected. Total connections: {len(self.connections)}")
        
    async def unregister(self, ws: web.WebSocketResponse):
        self.connections.remove(ws)
        self.logger.info(f"Client disconnected. Total connections: {len(self.connections)}")
        
    async def broadcast(self, message: Dict):
        if not self.connections:
            return
            
        for ws in self.connections.copy():
            try:
                await ws.send_json(message)
            except Exception as e:
                self.logger.error(f"Failed to send message: {str(e)}")
                await self.unregister(ws)

ws_manager = WebSocketManager()

async def websocket_handler(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)
    await ws_manager.register(ws)
    
    try:
        async for msg in ws:
            if msg.type == aiohttp.WSMsgType.TEXT:
                try:
                    data = json.loads(msg.data)
                    # Handle incoming messages
                    await ws.send_json({"status": "received"})
                except json.JSONDecodeError:
                    await ws.send_json({"error": "Invalid JSON"})
            elif msg.type == aiohttp.WSMsgType.ERROR:
                ws_manager.logger.error(f"WebSocket error: {ws.exception()}")
    finally:
        await ws_manager.unregister(ws)
    
    return ws

def init_websocket(socketio: SocketIO, market_service: MarketDataService):
    """Initialize WebSocket service"""
    global socketio_instance, _market_service  
    socketio_instance = socketio
    _market_service = market_service

    # Register event handlers
    @socketio.on('connect')
    def handle_connect():
        print('Client connected')

    @socketio.on('disconnect')
    def handle_disconnect():
        print('Client disconnected')

    @socketio.on('subscribe_price')
    async def handle_price_subscription(data):
        try:
            symbol = data.get('symbol')
            if not symbol:
                return {'error': 'Symbol is required'}

            price_data = await _market_service.get_price_data(symbol)
            socketio_instance.emit('price_update', price_data)
        except Exception as e:
            socketio_instance.emit('error', {'message': str(e)})

    @socketio.on('error')
    def handle_error(error):
        print(f"WebSocket error: {error}")

    return socketio

def start_price_updates():
    """Start background thread for price updates"""
    global price_update_thread
    
    if price_update_thread is None or not price_update_thread.is_alive():
        price_update_thread = threading.Thread(target=price_update_worker, daemon=True)
        price_update_thread.start()
        print("Price update thread started")

def price_update_worker():
    """Background worker for sending price updates"""
    symbols = ['BTC', 'ETH', 'ADA', 'SOL', 'DOT', 'LINK']
    
    # Base prices for simulation
    base_prices = {
        'BTC': 45000,
        'ETH': 3200,
        'ADA': 0.5,
        'SOL': 100,
        'DOT': 25,
        'LINK': 15
    }
    
    current_prices = base_prices.copy()
    
    while True:
        try:
            if len(connected_clients) > 0:
                for symbol in symbols:
                    # Simulate realistic price movement
                    change_percent = random.uniform(-0.5, 0.5)  # -0.5% to +0.5% per update
                    current_prices[symbol] *= (1 + change_percent / 100)
                    
                    # Calculate 24h change (simulated)
                    change_24h = random.uniform(-5, 5)
                    
                    # Get real price if possible, otherwise use simulated
                    real_price_data = None
                    if market_service:
                        real_price_data = market_service.get_real_time_price(symbol)
                    
                    if real_price_data:
                        price_data = {
                            'symbol': symbol,
                            'price': real_price_data['price'],
                            'change_24h': real_price_data['change_24h'],
                            'volume_24h': real_price_data.get('volume_24h', 0),
                            'timestamp': datetime.utcnow().isoformat()
                        }
                    else:
                        price_data = {
                            'symbol': symbol,
                            'price': round(current_prices[symbol], 2),
                            'change_24h': round(change_24h, 2),
                            'volume_24h': random.uniform(100000, 1000000),
                            'timestamp': datetime.utcnow().isoformat()
                        }
                    
                    # Emit price update
                    if socketio_instance:
                        socketio_instance.emit('price_update', price_data)
                
                # Send market overview every 30 seconds
                if int(time.time()) % 30 == 0:
                    send_market_overview(current_prices)
            
            time.sleep(5)  # Update every 5 seconds
            
        except Exception as e:
            print(f"Error in price update worker: {str(e)}")
            time.sleep(10)

def start_market_updates():
    """Start background thread for market updates"""
    def market_update_worker():
        while True:
            try:
                if len(connected_clients) > 0:
                    # Send sentiment update every 5 minutes
                    if int(time.time()) % 300 == 0:
                        send_sentiment_update()
                    
                    # Send news update every 10 minutes
                    if int(time.time()) % 600 == 0:
                        send_news_update()
                    
                    # Send strategy update every 15 minutes
                    if int(time.time()) % 900 == 0:
                        send_strategy_update()
                
                time.sleep(60)  # Check every minute
                
            except Exception as e:
                print(f"Error in market update worker: {str(e)}")
                time.sleep(60)
    
    market_thread = threading.Thread(target=market_update_worker, daemon=True)
    market_thread.start()
    print("Market update thread started")

def send_market_overview(current_prices):
    """Send market overview update"""
    try:
        overview_data = []
        for symbol, price in current_prices.items():
            overview_data.append({
                'symbol': symbol,
                'price': round(price, 2),
                'change_24h': round(random.uniform(-5, 5), 2),
                'volume_24h': random.uniform(100000, 1000000)
            })
        
        if socketio_instance:
            socketio_instance.emit('market_overview', {
                'overview': overview_data,
                'timestamp': datetime.utcnow().isoformat()
            })
            
    except Exception as e:
        print(f"Error sending market overview: {str(e)}")

def send_sentiment_update():
    """Send market sentiment update"""
    try:
        sentiment_data = {
            'fear_greed_index': random.randint(20, 80),
            'fear_greed_classification': random.choice(['Fear', 'Neutral', 'Greed']),
            'news_sentiment': random.uniform(-0.5, 0.5),
            'social_sentiment': random.uniform(-0.3, 0.3),
            'timestamp': datetime.utcnow().isoformat()
        }
        
        if socketio_instance:
            socketio_instance.emit('sentiment_update', sentiment_data)
            
    except Exception as e:
        print(f"Error sending sentiment update: {str(e)}")

def send_news_update():
    """Send news update"""
    try:
        news_headlines = [
            "Bitcoin ETF approval rumors circulating",
            "Ethereum network upgrade shows promising results",
            "Major institution announces crypto adoption",
            "Regulatory clarity improves market sentiment",
            "DeFi protocol launches innovative features"
        ]
        
        news_data = {
            'headline': random.choice(news_headlines),
            'sentiment': random.choice(['positive', 'neutral', 'negative']),
            'impact': random.choice(['low', 'medium', 'high']),
            'timestamp': datetime.utcnow().isoformat()
        }
        
        if socketio_instance:
            socketio_instance.emit('news_update', news_data)
            
    except Exception as e:
        print(f"Error sending news update: {str(e)}")

def send_strategy_update():
    """Send strategy performance update"""
    try:
        strategies = ['DCA Bitcoin', 'Momentum Trading', 'Mean Reversion']
        
        strategy_data = {
            'strategy_name': random.choice(strategies),
            'performance_change': round(random.uniform(-2, 3), 2),
            'message': f"Strategy performance updated: {random.choice(['outperforming', 'underperforming', 'meeting'])} expectations",
            'timestamp': datetime.utcnow().isoformat()
        }
        
        if socketio_instance:
            socketio_instance.emit('strategy_update', strategy_data)
            
    except Exception as e:
        print(f"Error sending strategy update: {str(e)}")

def trigger_alert(alert_data):
    """Trigger an alert to connected clients"""
    try:
        if socketio_instance:
            socketio_instance.emit('alert_triggered', alert_data)
            print(f"Alert triggered: {alert_data.get('message', 'Unknown alert')}")
            
    except Exception as e:
        print(f"Error triggering alert: {str(e)}")

def send_prediction_update(symbol, prediction_data):
    """Send AI prediction update"""
    try:
        if socketio_instance:
            socketio_instance.emit('prediction_update', {
                'symbol': symbol,
                'prediction': prediction_data,
                'timestamp': datetime.utcnow().isoformat()
            })
            
    except Exception as e:
        print(f"Error sending prediction update: {str(e)}")

def get_connected_clients_count():
    """Get number of connected clients"""
    return len(connected_clients)
