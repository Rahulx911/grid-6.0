from flask import Blueprint, request, jsonify
import numpy as np
import os
from PIL import Image
from werkzeug.utils import secure_filename
from models.database import db, Box, FreshProduce
from datetime import datetime
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import matplotlib.pyplot as plt
from dotenv import load_dotenv
from pathlib import Path
load_dotenv()


# classification_model_path = r"C:\Users\tanya\OneDrive\Pictures\web_app\backend\models\fruiznet_final_model.keras"
# classification_model = tf.keras.models.load_model(classification_model_path)
# freshness_model_path = r"C:\Users\tanya\OneDrive\Pictures\web_app\backend\models\fiv1.keras"
# freshness_model = tf.keras.models.load_model(freshness_model_path)
# dataset_dir = r"C:\Users\tanya\OneDrive\Pictures\web_app\backend\models\Fruits_Vegetables_Dataset_new"

BASE_DIR = Path(__file__).resolve().parent.parent  # Adjust based on your file structure

# Dynamically construct absolute paths
classification_model_path = BASE_DIR / "models/fruiznet_final_model.keras"
freshness_model_path = BASE_DIR / "models/fiv1.keras"
dataset_dir = BASE_DIR / "models/Fruits_Vegetables_Dataset_new"

# Load Models
classification_model = tf.keras.models.load_model(classification_model_path)
freshness_model = tf.keras.models.load_model(freshness_model_path)


class_labels = sorted([d for d in os.listdir(dataset_dir) if os.path.isdir(os.path.join(dataset_dir, d))])

# Define fruits for classification
fruit_list = ["apple", "orange", "banana", "lemon","mango"]

# Create a blueprint for the fruit detection route
fruit_detection_blueprint = Blueprint('detect_fruit', __name__)

def preprocess_image(image_path, target_size):
    """Preprocess the image for prediction."""
    img = load_img(image_path, target_size=target_size)  # Load and resize the image
    img_array = img_to_array(img)  # Convert to numpy array
    img_array = img_array / 255.0  # Normalize pixel values
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
    return img, img_array

def predict_image_details(image_path):
    """Predict the class and freshness index of the input image."""
    # Preprocess for classification model (160x160)
    original_img, classification_array = preprocess_image(image_path, target_size=(160, 160))

    # Predict class
    class_predictions = classification_model.predict(classification_array)
    predicted_class_idx = np.argmax(class_predictions[0])  # Get the index of the highest probability
    predicted_label = class_labels[predicted_class_idx]  # Map index to label

    # Extract the class after "fresh" or "rotten"
    if "fresh" in predicted_label.lower():
        display_label = predicted_label.lower().split("fresh")[-1].strip().capitalize()
    elif "rotten" in predicted_label.lower():
        display_label = predicted_label.lower().split("rotten")[-1].strip().capitalize()
    else:
        display_label = predicted_label  # Default to full label if no keyword

    # Classify as Fruit or Vegetable
    category = "Fruit" if display_label.lower() in fruit_list else "Vegetable"

    # Preprocess for freshness model (224x224)
    _, freshness_array = preprocess_image(image_path, target_size=(224, 224))

    # Predict freshness index
    freshness_prediction = freshness_model.predict(freshness_array)
    freshness_index = round(freshness_prediction[0][0], 2)

    # Determine freshness status and expected life span
    if freshness_index >= 7:
        freshness_status = "Fresh"
        expected_life_span = 12  # Days for highly fresh produce
    elif freshness_index >= 4:
        freshness_status = "Moderately Fresh"
        expected_life_span = 5  # Days for moderately fresh produce
    else:
        freshness_status = "Not Fresh"
        expected_life_span = 2  # Days for less fresh produce

    return display_label, category, freshness_status, freshness_index, expected_life_span

@fruit_detection_blueprint.route('/detect_fruit', methods=['POST'])
def detect_fruit():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    box_code = request.form['box_code']

    # Secure the uploaded file name
    file = request.files['file']
    filename = secure_filename(file.filename)
    file_path = os.path.join('static/uploads/', filename)
    file.save(file_path)

    # Predict the class and freshness of the produce
    produce_type, category, freshness_status, freshness_index, expected_life_span = predict_image_details(file_path)

    # Get box information from the database
    box_data = Box.query.filter_by(box_code=box_code).first()
    if not box_data:
        return jsonify({'error': f'Box with code {box_code} not found'}), 404

    # Create a new FreshProduce entry
    fresh_produce_entry = FreshProduce(
        box_id=box_data.id,
        timestamp=datetime.now(),
        category=category,
        produce=produce_type,
        fresh=freshness_status,
        freshness_index=float(freshness_index),  # Store as an integer percentage
        shelf_life=expected_life_span
    )

    # Save the entry to the database
    try:
        db.session.add(fresh_produce_entry)
        db.session.commit()
        return jsonify({
            'category': category,
            'produce_type': produce_type,
            'freshness': freshness_status,
            'freshness_index': float(freshness_index),
            'shelf_life': expected_life_span,
            'box_id': box_data.id,
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
