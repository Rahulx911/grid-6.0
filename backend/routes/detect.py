from flask import Blueprint, request, jsonify
from backend.models.object_detection import detect_objects
import os
from werkzeug.utils import secure_filename

# Create a blueprint for the route
detect_objects_blueprint = Blueprint('detect_objects', __name__)

UPLOAD_FOLDER = 'static/uploads/'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@detect_objects_blueprint.route('/detect_objects', methods=['POST'])
def detect():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    # Secure the uploaded file name
    file = request.files['file']
    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    # Run object detection model
    boxes, total_objects = detect_objects(file_path)

    return jsonify({
        'total_objects': total_objects,
        'boxes': boxes.tolist()  # Optional, return bounding boxes as well
    })
