from flask import Blueprint, request, jsonify
from models.database import db, Box, Item
import os
import torch
import torchvision
from PIL import Image
import numpy as np
import easyocr
import cv2
from backend.models_path import OCR_BACK_SIDE_PATH
from werkzeug.utils import secure_filename

detect_back_side_blueprint = Blueprint('detect_objects', __name__)

# Set the model path
MODEL_PATH = OCR_BACK_SIDE_PATH

# Load the model once during initialization
def load_model(model_path, num_classes=2):
    model = torchvision.models.detection.fasterrcnn_resnet50_fpn(pretrained=False)
    in_features = model.roi_heads.box_predictor.cls_score.in_features
    model.roi_heads.box_predictor = torchvision.models.detection.faster_rcnn.FastRCNNPredictor(in_features, num_classes)
    model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
    model.eval()
    return model

# Initialize the model and device
device = torch.device('cuda') if torch.cuda.is_available() else torch.device('cpu')
model = load_model(MODEL_PATH, num_classes=2).to(device)

# Function to preprocess the user-provided image
def preprocess_image(image_path, img_size=(640, 640)):
    image = Image.open(image_path).convert("RGB")
    transform = torchvision.transforms.Compose([
        torchvision.transforms.Resize(img_size),
        torchvision.transforms.ToTensor()
    ])
    return transform(image).unsqueeze(0)

# Function to apply the model to the image and get the cropped region
def get_cropped_image(model, image_tensor, original_image, device):
    image_tensor = image_tensor.to(device)
    with torch.no_grad():
        predictions = model(image_tensor)

    boxes = predictions[0]['boxes'].cpu().numpy()
    scores = predictions[0]['scores'].cpu().numpy()
    threshold = 0.5
    best_box = None
    for i, score in enumerate(scores):
        if score > threshold:
            best_box = boxes[i]
            break

    if best_box is None:
        return None

    xmin, ymin, xmax, ymax = map(int, best_box)
    original_image_cv = cv2.cvtColor(np.array(original_image), cv2.COLOR_RGB2BGR)
    cropped_image = original_image_cv[ymin:ymax, xmin:xmax]
    return cropped_image

# Function to perform OCR on the cropped image using EasyOCR
def perform_ocr(cropped_image):
    if cropped_image is None:
        return "No detected region."

    reader = easyocr.Reader(['en'])
    result = reader.readtext(cropped_image)

    detected_text = ""
    for detection in result:
        text = detection[1]
        detected_text += text + "\n"

    return detected_text

# Main function to run the model and OCR
def apply_model_and_ocr(model, image_path):
    original_image = Image.open(image_path).convert("RGB")
    image_tensor = preprocess_image(image_path)

    cropped_image = get_cropped_image(model, image_tensor, original_image, device)
    analyzed_text = perform_ocr(cropped_image)
    return analyzed_text

@detect_back_side_blueprint.route('/detect_back_side', methods=['POST'])
def detect_back_side():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    # Secure the uploaded file name
    file = request.files['file']
    filename = secure_filename(file.filename)
    file_path = os.path.join('static/uploads', filename)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    file.save(file_path)

    # Run the OCR model
    analyzed_text = apply_model_and_ocr(model, image_path=file_path)

    return jsonify({'analyzed_text': analyzed_text})

@detect_back_side_blueprint.route('/save_ocr_data', methods=['POST'])
def save_ocr_data():
    box_code = request.json.get('box_code')
    ocr_output = request.json.get('ocr_output')

    # Find the box by its code
    box = Box.query.filter_by(box_code=box_code).first()
    if not box:
        return jsonify({'error': 'Box not found'}), 404

    # Create a new Item entry with the OCR data
    new_item = Item(box_id=box.box_id, item_type='back', back_data=ocr_output)
    db.session.add(new_item)
    db.session.commit()

    return jsonify({'message': 'OCR data saved successfully'})
