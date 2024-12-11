**Database Schema :-**

The database schema is designed to efficiently manage and track data related to boxes, packed items, and fresh produce using SQLAlchemy. It consists of three main tables: Box, PackedItem, and FreshProduce. The Box table represents containers with unique box_code identifiers and relationships to the items they contain. The PackedItem table stores details such as manufacturing and expiry dates, brand, item count, and expected life span, facilitating traceability and quality checks. Similarly, the FreshProduce table manages details like produce type, freshness index, and shelf life, enabling the monitoring of perishable items. The schema leverages relational mapping with foreign keys to associate items with their respective boxes and enforces constraints like uniqueness and non-nullable fields to ensure data integrity. It also uses DateTime fields with default timestamps to capture record creation times, supporting accurate historical tracking and analysis.

<img width="587" alt="image" src="https://github.com/user-attachments/assets/64aa0d8c-14c5-4f4c-a4f1-24f5eddd7a5f" />





**Freshness of Fruits:**
- Uses TensorFlow Keras for classifying fruits and vegetables and predicting freshness.
- Implements two models: classification_model for type (fresh or rotten) and freshness_model for freshness index (0 to 10).
- Preprocesses images (resizing, normalization, batch dimension addition).
- Categorizes freshness as "Fresh," "Moderately Fresh," or "Not Fresh," assigning expected shelf life.
- Displays results (produce type, freshness status, predicted shelf life) with Matplotlib for visualization.

**Object Detection:**
- Combines Mask R-CNN for instance segmentation and PaddleOCR for text recognition.
- Utilizes PyTorch’s maskrcnn_resnet50_fpn model for detecting objects and applying instance segmentation.
- Filters detections using a confidence threshold and Non-Maximum Suppression (NMS).
- Crops detected regions for text extraction using PaddleOCR, categorizing recognized text by class.
- Stores results in a dictionary, aiding in tasks like document analysis and inventory management.

**Expiry Date:**
- Implements text extraction, date normalization, and expiration status determination using PaddleOCR.
- Normalizes malformed or concatenated dates using date parsing logic supporting multiple formats.
- Analyzes dates to identify manufacturing and expiry dates, calculates product life in days.
- Determines expiration status based on current date, suitable for inventory and quality management systems.

**Brand Recognition:**
- Processes images for object detection and text extraction using YOLO and PaddleOCR.
- Enhances image quality for better detection accuracy and text clarity.
- Utilizes SpaCy for named entity recognition and HuggingFace's transformer for text classification.
- Filters and classifies extracted text, useful for document analysis and automated text extraction in structured environments.



