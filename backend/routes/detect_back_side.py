from flask import Blueprint, request, jsonify
from models.database import db, Box, PackedItem
from datetime import datetime
import os
from paddleocr import PaddleOCR
import re
from werkzeug.utils import secure_filename

detect_back_side_blueprint = Blueprint('detect_back_side', __name__)
ocr = PaddleOCR(lang='en')

def extract_text_from_image(image_path):
    """
    Extracts text from an image using PaddleOCR.

    Args:
        image_path (str): The path to the image file.

    Returns:
        str: The extracted text from the image.
    """
    try:
        results = ocr.ocr(image_path)
        return " ".join([res[1][0] for res in results[0]])
    except Exception as e:
        return str(e)

def normalize_malformed_date(raw_date):
    """
    Normalize malformed date strings like 21.11.202420.05.2025 or 15/08/25E6A.

    Args:
        raw_date (str): The raw date string.

    Returns:
        list: A list of normalized date strings.
    """
    # Handle concatenated dates like 21.11.202420.05.2025 -> ["21.11.2024", "20.05.2025"]
    if re.match(r"\d{2}\.\d{2}\.\d{4}\d{2}\.\d{2}\.\d{4}", raw_date):
        first_date = raw_date[:10]  # First 10 characters as the first date
        second_date = raw_date[10:]  # Remaining characters as the second date
        return [first_date, second_date]

    # Handle cases like 15/08/25E6A -> 15/08/2025
    if re.match(r"\d{1,2}/\d{1,2}/\d{2}[A-Z0-9]+", raw_date):
        raw_date = re.match(r"(\d{1,2}/\d{1,2}/\d{2})", raw_date).group(1)
        parts = raw_date.split('/')
        year = int(parts[2]) + 2000  # Assume 21st century
        return [f"{int(parts[0]):02d}/{int(parts[1]):02d}/{year}"]

    # Handle cases like 11-2025 -> 01/11/2025
    if re.match(r"\d{1,2}-\d{4}$", raw_date):
        parts = raw_date.split('-')
        month = int(parts[0])
        year = int(parts[1])
        return [f"01/{month:02d}/{year}"]

    # Default: Return as a single-element list
    return [raw_date]


def extract_dates(extracted_text):
    """
    Extract all dates from the text, including concatenated formats like 21.11.202420.05.2025.

    Args:
        extracted_text (str): The text extracted from the image.

    Returns:
        list: A list of datetime objects for the extracted dates.
    """
    # Comprehensive date regex pattern
    date_pattern = r"""
        \b(?:                             # Word boundary
            \d{2}\.\d{2}\.\d{4}\d{2}\.\d{2}\.\d{4} # Concatenated formats like 21.11.202420.05.2025
            |\d{1,2}/\d{1,2}/\d{2}[A-Z0-9]+       # Malformed formats like 15/08/25E6A
            |\d{5}\d{2}/\d{2}/\d{4}              # Malformed formats like 097417/09/2024
            |\d{2}/\d{2}/\d{4}\d                 # Malformed formats like 16/06/202507
            |\d{1,2}/\d{1,2}/\d{2}               # dd/mm/yy
            |\d{1,2}[/-]\d{1,2}[/-]\d{4}         # dd/mm/yyyy or dd-mm-yyyy
            |\d{1,2}[A-Z]{3}\d{4}                # Combined formats like 13SEP2024
            |\d{4}[/-]\d{2}[/-]\d{2}             # yyyy-mm-dd
            |\d{1,2} \w{3,9} \d{4}               # dd MMM yyyy (e.g., 13 Jan 2022)
            |\d{2}\.\d{2}\.\d{4}                 # dd.mm.yyyy (e.g., 02.03.2022)
            |\d{2}\.\d{4}                        # mm.yyyy (e.g., 09.2024)
        )\b
    """
    raw_dates = re.findall(date_pattern, extracted_text, re.VERBOSE)
    parsed_dates = []

    for raw_date in raw_dates:
        try:
            # Normalize malformed date formats
            normalized_dates = normalize_malformed_date(raw_date)
            for normalized_date in normalized_dates:
                # Try parsing with various formats
                parsed_date = None
                for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%d/%m/%y", "%Y-%m-%d", "%d %b %Y", "%d.%m.%Y", "%m.%Y", "%b.%Y"):
                    try:
                        parsed_date = datetime.strptime(normalized_date, fmt)
                        break
                    except ValueError:
                        continue

                if parsed_date:
                    parsed_dates.append(parsed_date)
        except ValueError:
            # Skip invalid dates
            continue

    return sorted(parsed_dates)  # Sort dates for determining manufacturing and expiry


def determine_life_and_status(dates):
    """
    Determine manufacturing date, expiry date, life of the product, and expiration status.

    Args:
        dates (list): A sorted list of datetime objects.

    Returns:
        dict: A dictionary with manufacturing date, expiry date, product life, and expiration status.
    """
    if len(dates) < 2:
        return {
            'manufacturing_date': None,
            'expiry_date': None,
            'product_life_days': None,
            'expired': None
        }

    manufacturing_date = dates[0]
    expiry_date = dates[-1]
    product_life_days = (expiry_date - manufacturing_date).days
    expired = datetime.now() > expiry_date

    return {
        'manufacturing_date': manufacturing_date.strftime("%d/%m/%Y"),
        'expiry_date': expiry_date.strftime("%d/%m/%Y"),
        'product_life_days': product_life_days,
        'expired': expired
    }

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
    extracted_text = extract_text_from_image(file_path)
    extracted_dates = extract_dates(extracted_text)

    life_and_status = determine_life_and_status(extracted_dates)

    
    box_code = request.form.get('box_code')
    if not box_code:
        return jsonify({'error': 'Box code is required'}), 400

    # Find box and update PackedItem
    box = Box.query.filter_by(box_code=box_code).first()
    if not box:
        return jsonify({'error': f'Box with code {box_code} not found'}), 404

    packed_item = PackedItem.query.filter_by(box_id=box.id).first()
    if not packed_item:
        return jsonify({'error': f'No packed item found for box {box_code}'}), 404

    # Update expiry details
    today = datetime.utcnow().date()
    packed_item.manufacturing_date=life_and_status['manufacturing_date']
    packed_item.expiry_date = life_and_status['expiry_date']
    packed_item.expired = "Yes" if life_and_status['expired'] else "No"
    packed_item.expected_life_span = life_and_status['product_life_days']
    db.session.add(packed_item)
    db.session.commit()

    return jsonify({
        "message": "Data processed and saved successfully",
        "manufacturing_date": life_and_status['manufacturing_date'],
        "expiry_date": life_and_status['expiry_date'],
        "expired": "Yes" if life_and_status['expired'] else "No",
        "expected_life_span": life_and_status['product_life_days']
    })


