from flask import Blueprint, request, jsonify
from models.object_detection import detect_objects
import os
from werkzeug.utils import secure_filename
from io import BytesIO
from PIL import Image
import numpy as np
import cv2

# Create a blueprint for the route
detect_objects_blueprint = Blueprint('detect_objects', __name__)

UPLOAD_FOLDER = 'static/uploads/'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@detect_objects_blueprint.route('/detect_objects', methods=['POST'])
def detect():
    print('Received request for /detect_objects')

    if 'file' not in request.files:
        print('No file found in the request')
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    filename = secure_filename(file.filename)
    print(f'Received file: {filename}')

    # Save the file to a temporary location
    img_path = os.path.join(UPLOAD_FOLDER, filename)
    print(f'Saving file to: {img_path}')
    file.save(img_path)

    # Verify if the file was saved successfully
    if not os.path.isfile(img_path):
        print(f'File not saved correctly at {img_path}')
        return jsonify({'error': 'Failed to save the file'}), 500

    # Try reading the image using OpenCV
    print(f'Reading the image from: {img_path}')
    img = cv2.imread(img_path)
    if img is None:
        print(f'Failed to read the image from {img_path}. The file might be corrupted or in an unsupported format.')
        return jsonify({'error': 'Invalid or corrupted image file'}), 400

    # Run object detection model using the file path
    print(f'Running object detection on: {img_path}')
    try:
        results = detect_objects(img_path)
    except Exception as e:
        print(f'Error during object detection: {e}')
        return jsonify({'error': 'Object detection failed'}), 500

    print(f'Detection results: {results}')

    return jsonify({
        'total_objects': results.get('total_objects', 0),
        'boxes': results.get('boxes', [])
    })
