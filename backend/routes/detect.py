from flask import Blueprint, request, jsonify
from backend.models.object_detection import detect_objects
import os
from werkzeug.utils import secure_filename
from io import BytesIO
from PIL import Image

# Create a blueprint for the route
detect_objects_blueprint = Blueprint('detect_objects', __name__)

UPLOAD_FOLDER = 'static/uploads/'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@detect_objects_blueprint.route('/detect_objects', methods=['POST'])
# def detect():
#     if 'file' not in request.files:
#         return jsonify({'error': 'No file uploaded'}), 400

#     file = request.files['file']
#     image = Image.open(BytesIO(file.read()))

#     # Run object detection model
#     boxes, total_objects = detect_objects(image)

#     return jsonify({
#         'total_objects': total_objects,
#         'boxes': boxes.tolist()
#     })
def detect():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    image = Image.open(BytesIO(file.read()))

    # Run object detection model
    boxes, total_objects = detect_objects(image)

    return jsonify({
        'total_objects': total_objects,
        'boxes': boxes.tolist()
    })