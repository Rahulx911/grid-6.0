# routes/fruit_detection.py

from flask import Blueprint, request, jsonify
import numpy as np
import tensorflow as tf
from PIL import Image
import os
from werkzeug.utils import secure_filename


# Load the pre-trained model
model_path = r'C:\Users\tanya\OneDrive\Pictures\web_app\backend\models\fruits_detect.keras'
model = tf.keras.models.load_model(model_path)

# List of fruits and vegetables for classification
fruits = ['Apple', 'Banana', 'Mango', 'Strawberry']
vegetables = ['Bellpepper', 'Carrot', 'Cucumber', 'Potato', 'Tomato']
produce_types = fruits + vegetables  # Combine fruits and vegetables

# Create a blueprint for the fruit detection route
fruit_detection_blueprint = Blueprint('fruit_detection', __name__)

def preprocess_image(image_path):
    image = Image.open(image_path)
    if image.mode == 'RGBA':
        image = image.convert('RGB')
    image = image.resize((160, 160))  # Resize to match model input
    image = np.array(image) / 255.0  # Normalize pixel values to [0, 1]
    image = np.expand_dims(image, axis=0)  # Add batch dimension
    return image

@fruit_detection_blueprint.route('/detect_fruit', methods=['POST'])
def detect_fruit():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    # Secure the uploaded file name
    file = request.files['file']
    filename = secure_filename(file.filename)
    file_path = os.path.join('static/uploads/', filename)
    file.save(file_path)

    # Preprocess the image and make predictions
    image = preprocess_image(file_path)
    produce_pred, freshness_pred = model.predict(image)

    # Determine the predicted produce type and freshness
    produce_type_index = np.argmax(produce_pred[0])
    produce_type = produce_types[produce_type_index]
    category = "Fruit" if produce_type in fruits else "Vegetable"
    freshness_index = freshness_pred[0][0]
    is_fresh = "Fresh" if freshness_index > 0.5 else "Not Fresh"

    # Estimate shelf life
    if freshness_index > 0.8:
        shelf_life = "Estimated shelf life: 7+ days"
    elif 0.5 < freshness_index <= 0.8:
        shelf_life = "Estimated shelf life: 3-7 days"
    elif 0.3 < freshness_index <= 0.5:
        shelf_life = "Estimated shelf life: 1-3 days"
    else:
        shelf_life = "Estimated shelf life: Less than 1 day"

    # Return the result
    return jsonify({
        'category': category,
        'produce_type': produce_type,
        'freshness_index': float(freshness_index),
        'freshness': is_fresh,
        'shelf_life': shelf_life
    })
