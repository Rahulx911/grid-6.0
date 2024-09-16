import cv2
import numpy as np
import pytesseract
from tensorflow.keras.applications.vgg16 import VGG16, preprocess_input
from tensorflow.keras.models import Model

# Configure the path to the Tesseract executable for OCR functionality
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'  # Adjust this path based on your installation

def preprocess_image(image):
    """Apply advanced preprocessing techniques to enhance image for analysis."""
    gray_img = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    hist_eq_img = cv2.equalizeHist(gray_img)
    smoothed_img = cv2.bilateralFilter(hist_eq_img, d=9, sigmaColor=75, sigmaSpace=75)
    segmented_img = cv2.adaptiveThreshold(smoothed_img, maxValue=255, adaptiveMethod=cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                          thresholdType=cv2.THRESH_BINARY_INV, blockSize=11, C=2)
    return segmented_img

def extract_features(image, model):
    """Extract deep features from the image using a pre-trained CNN."""
    resized_image = cv2.resize(image, (224, 224))
    image_array = np.expand_dims(resized_image, axis=0)
    processed_image = preprocess_input(image_array)
    features = model.predict(processed_image)
    return features

def detect_objects(image, model):
    """Placeholder for object detection. Implement specific model logic as required."""
    return image  # Return image as placeholder

def check_dimensions(box, reference_size, image_width):
    """Calculate object dimensions based on a reference size."""
    x, y, width, height = box
    pixel_per_metric = image_width / reference_size
    object_width = width / pixel_per_metric
    object_height = height / pixel_per_metric
    return object_width, object_height

def analyze_color(image, box):
    """Analyze the average color within the specified bounding box of an object."""
    x, y, width, height = box
    object_img = image[y:y+height, x:x+width]
    avg_color_per_row = np.average(object_img, axis=0)
    avg_color = np.average(avg_color_per_row, axis=0)
    avg_color = np.uint8(avg_color)
    avg_color_hsv = cv2.cvtColor(np.array([[avg_color]], dtype=np.uint8), cv2.COLOR_BGR2HSV)[0][0]
    return avg_color_hsv

def extract_text(image):
    """Extract text from an image using OCR."""
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    extracted_text = pytesseract.image_to_string(gray_image, lang='eng')
    return extracted_text.strip()

def process_video(video_path):
    """Process each frame of the video with the smart vision system."""
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        print("Error opening video stream or file")
        return

    vgg16_model = VGG16(weights='imagenet')
    feature_model = Model(inputs=vgg16_model.input, outputs=vgg16_model.get_layer('block5_pool').output)

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        preprocessed_frame = preprocess_image(frame)
        features = extract_features(preprocessed_frame, feature_model)
        detected_frame = detect_objects(frame, feature_model)
        text = extract_text(preprocessed_frame)

        cv2.imshow('Processed Frame', detected_frame)
        print("Extracted Text:", text)

        if cv2.waitKey(25) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    # Replace 'path_to_downloaded_video.mp4' with the path to your downloaded video
    process_video('/Users/rahuljain/Downloads/box6.mp4')
