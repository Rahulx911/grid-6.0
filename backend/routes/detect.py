# routes/detect.py

from flask import Blueprint, request, jsonify
from models.object_detection import detect_objects
import os

# Create a blueprint for the route
detect_objects_blueprint = Blueprint('detect_objects', __name__)

UPLOAD_FOLDER = 'static/uploads/'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@detect_objects_blueprint.route('/detect_objects', methods=['POST'])
def detect():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    # Run object detection model
    boxes, total_objects = detect_objects(file_path)

    return jsonify({
        'total_objects': total_objects,
        'boxes': boxes.tolist()  # Optional, return bounding boxes as well
    })
