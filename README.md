Database Schema :-

The database schema is designed to efficiently manage and track data related to boxes, packed items, and fresh produce using SQLAlchemy. It consists of three main tables: Box, PackedItem, and FreshProduce. The Box table represents containers with unique box_code identifiers and relationships to the items they contain. The PackedItem table stores details such as manufacturing and expiry dates, brand, item count, and expected life span, facilitating traceability and quality checks. Similarly, the FreshProduce table manages details like produce type, freshness index, and shelf life, enabling the monitoring of perishable items. The schema leverages relational mapping with foreign keys to associate items with their respective boxes and enforces constraints like uniqueness and non-nullable fields to ensure data integrity. It also uses DateTime fields with default timestamps to capture record creation times, supporting accurate historical tracking and analysis.

 <img width="1233" alt="image" src="https://github.com/user-attachments/assets/bb8eb77c-2ddf-44cb-b34b-e98f4c270bad" />

Freshness of Fruits :- 
The provided code implements a pipeline for the classification and freshness prediction of fruits and vegetables using TensorFlow Keras. It leverages two pre-trained models: one for classifying the type of produce and another for estimating its freshness index. The classification_model categorizes input images into various classes such as "fresh" or "rotten" produce, while the freshness_model predicts a freshness index ranging from 0 to 10. The pipeline preprocesses images using standard techniques such as resizing, normalization, and batch dimension addition, tailored to the specific input sizes required by each model. The code determines the produce type (fruit or vegetable) based on a predefined list and categorizes freshness into "Fresh," "Moderately Fresh," or "Not Fresh" based on the index, associating it with an expected shelf life. Results, including the produce type, category, freshness status, and predicted shelf life, are displayed alongside the input image using Matplotlib for better visualization and user interpretation. This pipeline is particularly valuable for quality control and inventory management in food industries.



Object Detection :-
The provided code combines Mask R-CNN for instance segmentation with PaddleOCR for optical character recognition (OCR), creating a powerful pipeline for object detection, segmentation, and text extraction. Using PyTorch's pre-trained maskrcnn_resnet50_fpn, the pipeline detects objects in the image and filters the predictions using a confidence threshold and Non-Maximum Suppression (NMS). For each detected object, bounding boxes and masks are generated and visualized, with masks applied transparently to the original image for better interpretability. Detected regions are cropped and passed to PaddleOCR for text recognition. The recognized text is categorized by the detected class, and results are stored in a dictionary for organized display. This workflow is highly applicable for real-world tasks such as document analysis, retail automation, or inventory management, where both visual and textual data extraction is necessary.



Expiry Date :-
The provided script is a comprehensive pipeline for extracting text from images, normalizing dates, and determining the life and expiration status of a product. Using PaddleOCR, the script extracts textual information from an input image. Malformed or concatenated dates within the extracted text are normalized using a robust date parsing and validation logic that supports multiple date formats and patterns. The normalized dates are analyzed to identify manufacturing and expiry dates, calculate product life in days, and determine expiration status based on the current date. The script provides a modular approach with functions for text extraction, date normalization, and life-cycle analysis, making it applicable for automating tasks in inventory or quality management systems.



Brand Recognition :-
The provided script integrates multiple tools and techniques to process an image, detect objects, and extract meaningful text. It begins with enhancing image quality to improve detection accuracy using contrast adjustments and resizing. YOLO (You Only Look Once) is employed for object detection, generating bounding boxes around detected objects. PaddleOCR is then utilized to extract text from these bounding boxes, which is further processed to filter nonsensical text and remove duplicates. The script also leverages SpaCy for named entity recognition and HuggingFace's transformer pipeline for text classification, ensuring that extracted text is relevant and meaningful. This end-to-end pipeline is particularly useful for automating text extraction and classification tasks in structured document or object detection systems.


