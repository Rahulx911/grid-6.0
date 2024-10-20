import pathlib

# Save the original PosixPath
temp = pathlib.PosixPath

# Redirect PosixPath to WindowsPath
pathlib.PosixPath = pathlib.WindowsPath

import subprocess
import os
import time
import cv2
import easyocr
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from models_path import YOLO_WEIGHTS_PATH
from werkzeug.utils import secure_filename
from pathlib import Path, PureWindowsPath

# Initialize EasyOCR reader
reader = easyocr.Reader(['en'])

# Create Blueprint
detect_front_side_blueprint = Blueprint('detect_objects', __name__)

def run_yolo_inference(image_path):
    # Use double quotes around paths
    yolo_command = f'python yolov5/detect.py --weights "{YOLO_WEIGHTS_PATH}" --img 640 --conf 0.25 --source "{image_path}" --save-txt --save-conf'
    result = subprocess.run(yolo_command, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running YOLO: {result.stderr}")
        return False
    return True

def get_latest_yolo_output_folder():
    # Get the most recent YOLO output folder
    folders = sorted([f.path for f in os.scandir('yolov5/runs/detect') if f.is_dir()], key=os.path.getmtime)
    return folders[-1] if folders else None

def extract_text_with_easyocr(image, boxes):
    # Perform OCR on detected boxes
    detected_texts = []
    for box in boxes:
        x, y, w, h = box
        cropped_image = image[y:y+h, x:x+w]
        result = reader.readtext(cropped_image)
        detected_text = " ".join([res[1] for res in result]) if result else "No text detected"
        detected_texts.append(detected_text)
    return detected_texts

@detect_front_side_blueprint.route('/detect_front_side', methods=['POST'])
def detect_front_side():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    # Secure the uploaded file name
    file = request.files['file']
    filename = secure_filename(file.filename)
    file_path = os.path.join('static', 'uploads', filename)
    file_path = str(Path(file_path).resolve())  # Convert to absolute path
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    file.save(file_path)

    # Run YOLO inference
    if not run_yolo_inference(file_path):
        return jsonify({'error': 'YOLO inference failed'}), 500

    # Get the latest YOLO output folder
    latest_folder = get_latest_yolo_output_folder()
    if not latest_folder:
        return jsonify({'error': 'No YOLO output folder found'}), 500

    # Load the original image for OCR processing
    image = cv2.imread(file_path)
    img_height, img_width = image.shape[:2]

    # Read YOLO's bounding boxes from the .txt file
    txt_file_path = os.path.join(latest_folder, 'labels', f"{os.path.basename(file_path).split('.')[0]}.txt")
    detected_boxes = []
    if os.path.exists(txt_file_path):
        with open(txt_file_path, 'r') as f:
            for line in f.readlines():
                values = list(map(float, line.strip().split()))
                if len(values) >= 5:
                    class_id, x_center, y_center, width, height = values[:5]
                    x_center *= img_width
                    y_center *= img_height
                    width *= img_width
                    height *= img_height
                    x = int(x_center - width / 2)
                    y = int(y_center - height / 2)
                    detected_boxes.append((x, y, int(width), int(height)))
    else:
        return jsonify({'error': f'Bounding box file not found for {filename}'}), 500

    # Apply EasyOCR on detected bounding boxes
    detected_texts = extract_text_with_easyocr(image, detected_boxes)

    # Return the detected texts
    return jsonify({'detected_texts': detected_texts})
