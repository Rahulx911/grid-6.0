import torch
import torchvision
from torchvision.models.detection import fasterrcnn_resnet50_fpn, retinanet_resnet50_fpn
import cv2
import numpy as np
from torchvision.transforms import functional as F
from ensemble_boxes import weighted_boxes_fusion

def load_models():
    # Paths to the saved model weights
    faster_rcnn_path = r"C:\Users\tanya\OneDrive\Pictures\web_app\backend\models\faster_rcnn_model.pth"
    retinanet_path = r"C:\Users\tanya\OneDrive\Pictures\web_app\backend\models\retinanet_model.pth"

    # Load Faster R-CNN model architecture without downloading weights
    faster_rcnn = fasterrcnn_resnet50_fpn(weights=None).eval()
    faster_rcnn.load_state_dict(torch.load(faster_rcnn_path, map_location=torch.device('cpu')))

    # Load RetinaNet model architecture without downloading weights
    retinanet = retinanet_resnet50_fpn(weights=None).eval()
    retinanet.load_state_dict(torch.load(retinanet_path, map_location=torch.device('cpu')))

    # Return the loaded models as a list
    models = [faster_rcnn, retinanet]
    return models

def detect_objects(img_path):
    models = load_models()  # Load the pre-trained models
    img = cv2.imread(img_path)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img_tensor = F.to_tensor(img_rgb)

    all_boxes = []
    all_scores = []
    all_classes = []
    all_labels = []

    score_threshold = 0.2
    height, width = img.shape[:2]

    # Run detection for each model
    for model in models:
        with torch.no_grad():
            predictions = model([img_tensor])[0]  # Perform inference
        # Filter out low-confidence detections
        high_conf_idx = predictions['scores'] > score_threshold
        boxes = predictions['boxes'][high_conf_idx].cpu().numpy()
        scores = predictions['scores'][high_conf_idx].cpu().numpy()
        classes = predictions['labels'][high_conf_idx].cpu().numpy()

        # Normalize bounding boxes to [0, 1] for Weighted Box Fusion (WBF)
        norm_boxes = boxes / [width, height, width, height]
        all_boxes.append(norm_boxes.tolist())
        all_scores.append(scores.tolist())
        all_classes.append(classes.tolist())
        all_labels.append(classes.tolist())

    # Use Weighted Box Fusion to combine predictions from all models
    iou_threshold = 0.35
    boxes_wbf, scores_wbf, labels_wbf = weighted_boxes_fusion(
        all_boxes, all_scores, all_labels, iou_thr=iou_threshold, skip_box_thr=score_threshold
    )
    # Denormalize boxes after WBF
    boxes_wbf = np.array(boxes_wbf) * [width, height, width, height]

    return boxes_wbf, len(boxes_wbf)  # Return the bounding boxes and total number of objects
