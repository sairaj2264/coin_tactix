"""
Authentication API Routes
"""

from flask import Blueprint, jsonify, request

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        # Demo authentication
        if email == 'demo@cointactix.com' and password == 'demo123':
            return jsonify({
                'token': 'demo-jwt-token',
                'user': {
                    'id': 1,
                    'name': 'Demo User',
                    'email': email
                }
            })
        
        return jsonify({'error': 'Invalid credentials'}), 401
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    """User registration"""
    try:
        data = request.get_json()
        
        return jsonify({
            'token': 'demo-jwt-token',
            'user': {
                'id': 2,
                'name': data.get('name'),
                'email': data.get('email')
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
