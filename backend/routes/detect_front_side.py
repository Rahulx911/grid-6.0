import pathlib
temp = pathlib.PosixPath
pathlib.PosixPath = pathlib.WindowsPath

import subprocess
import os
import cv2
import matplotlib.pyplot as plt
import time
from paddleocr import PaddleOCR
import re
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from pathlib import Path, PureWindowsPath
from models.database import Box,PackedItem
from app import db
from datetime import datetime
from dotenv import load_dotenv
from pathlib import Path
load_dotenv()
# YOLO_WEIGHTS_PATH = r"C:\Users\tanya\OneDrive\Pictures\web_app\backend\models\best.pt"
# DETECT=r"C:\Users\tanya\OneDrive\Pictures\web_app\backend\yolov5\detect.py"
# DETECT_RUNS=r"C:\Users\tanya\OneDrive\Pictures\web_app\backend\yolov5\runs\detect"

BASE_DIR = Path(__file__).resolve().parent.parent.parent  # Adjust based on your script's location
print("BASE_DIR:", BASE_DIR)

YOLO_WEIGHTS_PATH = BASE_DIR / 'backend/models/best.pt'
DETECT = BASE_DIR / 'backend/yolov5/detect.py'
DETECT_RUNS = BASE_DIR / 'backend/yolov5/runs/detect'

ocr = PaddleOCR(use_angle_cls=True, lang='en', det_db_thresh=0.3, det_db_box_thresh=0.5)

detected_texts = []


# Create Blueprint
detect_front_side_blueprint = Blueprint('detect_front_side', __name__)

def run_yolo_inference(image_path):
    print(image_path)
    yolo_command = f"python {DETECT} --weights {YOLO_WEIGHTS_PATH} --img 640 --conf 0.25 --source {image_path} --save-txt --save-conf"
    result = subprocess.run(yolo_command, shell=True, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"Error running YOLO: {result.stderr}")
    else:
        print(f"YOLO inference completed: {result.stdout}")


def get_latest_yolo_output_folder():
    folders = sorted([f.path for f in os.scandir(DETECT_RUNS) if f.is_dir()], key=os.path.getmtime)
    if folders:
        return folders[-1] 
    print("No folders found in YOLO output directory.")
    return None

def visualize_result(image_path):
    latest_folder = get_latest_yolo_output_folder()

    if latest_folder:
        result_image_path = os.path.join(latest_folder, os.path.basename(image_path))

        if os.path.exists(result_image_path):
            result_image = cv2.imread(result_image_path)
            if result_image is not None:
                plt.imshow(cv2.cvtColor(result_image, cv2.COLOR_BGR2RGB))
                plt.axis('off')  # Hide axes
                plt.show()
            else:
                print("Result image not loaded properly.")
        else:
            print(f"Result image not found at {result_image_path}")
    else:
        print("No YOLO output folder found.")

def check_bounding_boxes(image_path):
    latest_folder = get_latest_yolo_output_folder()

    if latest_folder:
        txt_file_path = os.path.join(latest_folder, 'labels', f"{os.path.basename(image_path).split('.')[0]}.txt")
        print(f"Expected bounding box file path: {txt_file_path}")  # Print to manually verify
        if os.path.exists(txt_file_path):
            print(f"Bounding box file found: {txt_file_path}")
            with open(txt_file_path, 'r') as f:
                print(f.read())
        else:
            print(f"Bounding box file not found at {txt_file_path}")
    else:
        print("No YOLO output folder found.")



def enhance_image_quality(image_path):
    image = cv2.imread(image_path)

    # Resize the image to improve detection accuracy
    resized_image = cv2.resize(image, (640, 640))

    # Increase the contrast of the image
    lab = cv2.cvtColor(resized_image, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    l = cv2.equalizeHist(l)  
    lab = cv2.merge([l, a, b])
    enhanced_image = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)

    return enhanced_image


def extract_text_with_paddleocr(image, boxes):
    global detected_texts  # Access the global variable to store the text

    for i, box in enumerate(boxes):
        x, y, w, h = box
        cropped_image = image[y:y+h, x:x+w]

        preprocessed_image = cv2.cvtColor(cropped_image, cv2.COLOR_BGR2GRAY)  # Convert to grayscale
        preprocessed_image = cv2.threshold(preprocessed_image, 128, 255, cv2.THRESH_BINARY)[1]  # Thresholding

        # Use PaddleOCR to extract text from the cropped region
        result = ocr.ocr(cropped_image, cls=True)

        # Check if result is found
        if result and result[0]:
            detected_text = " ".join([res[1][0] for res in result[0]])
            print(f"Text detected in box {i+1}: {detected_text}")
            detected_texts.append(detected_text)
        else:
            print(f"No text detected in box {i+1}")
            cv2.imwrite(f"cropped_box_{i+1}.jpg", cropped_image)

# Remove repeating words/phrases from detected texts
def remove_duplicates(texts):
    unique_text = []

    # Combine all text fragments into one string
    combined_text = " ".join(texts)

    # Split by spaces and filter duplicates
    words = combined_text.split()
    unique_words = set()

    for word in words:
        if word not in unique_words:
            unique_words.add(word)
            unique_text.append(word)

    # Return the final unique text as a single string
    return " ".join(unique_text)



@detect_front_side_blueprint.route('/detect_front_side', methods=['POST'])
def detect_front_side():
    print("BASE_DIR:", BASE_DIR)
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    # Secure the uploaded file name
    file = request.files['file']
    filename = secure_filename(file.filename)
    file_path = os.path.join('static', 'uploads', filename)
    file_path = str(Path(file_path).resolve())  # Convert to absolute path
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    file.save(file_path)
    print(file_path)

    global detected_texts  # Clear previous detections
    detected_texts = []  # Reset the list before each run

    # Enhance image quality before passing to YOLO and OCR
    enhanced_image = enhance_image_quality(file_path)
    
    # Run YOLO for object detection
    run_yolo_inference(file_path)
    

    time.sleep(5) 

    # Get the latest YOLO output folder dynamically
    latest_folder = get_latest_yolo_output_folder()
    if latest_folder:
        result_image_path = f'{latest_folder}/{os.path.basename(file_path)}'
        txt_file_path = f'{latest_folder}/labels/{os.path.basename(file_path).split(".")[0]}.txt'
        print(f"Using YOLO output folder: {latest_folder}")
        print(f"Expected label file path: {txt_file_path}")
    else:
        print("No YOLO output folder found")
        return

    # Visualize result image
    # visualize_result(result_image_path)

    # Load image and bounding boxes
    image = cv2.imread(file_path)
    img_height, img_width = image.shape[:2]

    # Read YOLO's bounding boxes from the .txt file
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
        print(f"Label file {txt_file_path} does not exist.")

    # Apply PaddleOCR on detected bounding boxes
    extract_text_with_paddleocr(image, detected_boxes)

    # After OCR extraction, remove duplicates and output the final result
    final_output = remove_duplicates(detected_texts)
    print(final_output)

    box_code = request.form.get('box_code')
    if not box_code:
        return jsonify({'error': 'Box code is required'}), 400

    # Save to PackedItem
    box = Box.query.filter_by(box_code=box_code).first()
    if not box:
        return jsonify({'error': f'Box with code {box_code} not found'}), 404

    if final_output:
        packed_item = PackedItem.query.filter_by(box_id=box.id, brand=final_output).first()
    else:
        print("No text detected from OCR")

    if packed_item:
        # Increment the count if the brand already exists
        packed_item.count += 1
    else:
        # Create a new entry if the brand does not exist
        packed_item = PackedItem(
            box_id=box.id,
            timestamp=datetime.now(),
            brand=final_output,
            expiry_date=None,  # Leave expiry_date as None
            count=1,
            expired=None,
            expected_life_span=None
        )
    db.session.add(packed_item)
    db.session.commit()

    return jsonify({'brand': final_output, 'box_id': box.id})
    

