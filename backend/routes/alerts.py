"""
Alerts API Routes
"""

from flask import Blueprint, jsonify, request
from datetime import datetime
from models import db, Alert
import json

alerts_bp = Blueprint('alerts', __name__)

@alerts_bp.route('/', methods=['GET'])
def get_alerts():
    """Get all alerts"""
    try:
        alerts = Alert.query.all()
        return jsonify({
            'alerts': [alert.to_dict() for alert in alerts]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@alerts_bp.route('/', methods=['POST'])
def create_alert():
    """Create a new alert"""
    try:
        data = request.get_json()
        
        alert = Alert(
            name=data['name'],
            symbol=data['symbol'],
            alert_type=data['type'],
            conditions=json.dumps(data['conditions'])
        )
        
        db.session.add(alert)
        db.session.commit()
        
        return jsonify({
            'alert': alert.to_dict(),
            'message': 'Alert created successfully'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
