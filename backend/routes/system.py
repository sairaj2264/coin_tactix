from flask import Blueprint, jsonify

system_bp = Blueprint('system_bp', __name__)

@system_bp.route('/version')
def get_version():
    """
    Returns the application version.
    """
    return jsonify({"version": "1.0.0"})