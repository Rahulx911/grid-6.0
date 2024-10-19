import os
from pathlib import Path, WindowsPath

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / 'models'

FASTER_RCNN_PATH = MODELS_DIR / 'faster_rcnn_model.pth'
RETINANET_PATH = MODELS_DIR / 'retinanet_model.pth'
YOLO_WEIGHTS_PATH = MODELS_DIR / 'front.pt'
OCR_BACK_SIDE_PATH = MODELS_DIR / 'OCR_back_side.pth'