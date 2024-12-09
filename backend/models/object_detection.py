import torch
import torchvision
from torchvision.models.detection import maskrcnn_resnet50_fpn
from torchvision.transforms import functional as F
import cv2
import numpy as np
from paddleocr import PaddleOCR
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
from torchvision.ops import nms
from app import db
from models.database import Box

ocr = PaddleOCR(use_angle_cls=True, lang="en")
def load_mask_rcnn():
    model = maskrcnn_resnet50_fpn(pretrained=True)
    model.eval()
    return model

mask_rcnn = load_mask_rcnn()

def detect_objects(img_path):
    img = cv2.imread(img_path)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)  # Convert BGR to RGB
    height, width, _ = img.shape
    
    img_tensor = F.to_tensor(img_rgb).unsqueeze(0)  # Add batch dimension
    
    with torch.no_grad():
        predictions = mask_rcnn(img_tensor)[0]
    
    score_threshold = 0.126
    boxes = predictions["boxes"]
    scores = predictions["scores"]
    labels = predictions["labels"]
    masks = predictions["masks"]
    
    nms_threshold = 0.5  # IoU threshold for NMS
    keep_indices = nms(boxes, scores, nms_threshold)
    
    boxes = boxes[keep_indices].cpu().numpy()
    scores = scores[keep_indices].cpu().numpy()
    labels = labels[keep_indices].cpu().numpy()
    masks = masks[keep_indices].cpu().numpy()
    
    final_boxes = []
    final_scores = []
    final_labels = []
    final_masks = []
    
    for i, score in enumerate(scores):
        if score >= 0.2980:
            final_boxes.append(boxes[i])
            final_scores.append(score)
            final_labels.append(labels[i])
            final_masks.append(masks[i])
            
    final_boxes = np.array(final_boxes)
    final_scores = np.array(final_scores)
    final_labels = np.array(final_labels)
    final_masks = np.array(final_masks)
    
    ocr_results = []
    
    for i, (box, mask) in enumerate(zip(final_boxes, final_masks)):
        x1, y1, x2, y2 = map(int, box)
        mask = mask[0] > 0.7  # Binary mask

        x1 = max(0, x1)
        y1 = max(0, y1)
        x2 = min(width, x2)
        y2 = min(height, y2)

        cropped_region = img_rgb[y1:y2, x1:x2]

        if cropped_region.size == 0:  # Skip if cropped region is invalid
            continue

        ocr_result = ocr.ocr(cropped_region, cls=True)
        ocr_text = " ".join([line[1][0] for line in ocr_result[0]]) if ocr_result[0] else "No text detected"

        if ocr_text is None or ocr_text == "No text detected":
            continue
        
        # class_label = f"Class {final_labels[i]}"
        # if class_label not in ocr_results:
        #     ocr_results[class_label] = []
        ocr_results.append(ocr_text)

    return {
        "total_objects": len(final_boxes),
        "ocr_results": ocr_results
    }
        

box_detection_blueprint = Blueprint('box_detection', __name__)

@box_detection_blueprint.route('/box_detection', methods=['POST'])
def detect_objects_for_box():

    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    # Get the box code from the form data
    box_code = request.form.get('box_code')
    print(box_code)
    
    if not box_code:
        return jsonify({'error': 'Box code is required'}), 400

    # Secure the uploaded file and save it
    file = request.files['file']
    print("done2")
    filename = secure_filename(file.filename)
    print("done3")
    file_path = os.path.join('static/uploads/', filename)
    file.save(file_path)

    # Run the object detection
    result = detect_objects(file_path)
    total_objects = result['total_objects']
    ocr_results = result['ocr_results']

    # Check if the box exists
    box = Box.query.filter_by(box_code=box_code).first()

    # If the box doesn't exist, create a new one
    if not box:
        box = Box(box_code=box_code, total_objects=total_objects)
        db.session.add(box)
        db.session.commit()
        return jsonify({
            'box_code': box_code,
            'total_objects': total_objects
        })

    # If the box exists, just update the total_objects
    box.total_objects = total_objects
    db.session.commit()

    return jsonify({
        'box_code': box_code,
        'total_objects': total_objects,
        'detected_texts': ocr_results
    })


