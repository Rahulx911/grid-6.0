from flask import Blueprint, request, jsonify
from models.database import db, Box, PackedItem
from datetime import datetime
import os
from paddleocr import PaddleOCR
import re
from werkzeug.utils import secure_filename

detect_back_side_blueprint = Blueprint('detect_back_side', __name__)
# ocr = PaddleOCR(lang='en')

def extract_text_from_image(image_path):
    """
    Extracts text from an image using PaddleOCR.

    Args:
        image_path (str): The path to the image file.

    Returns:
        str: The extracted text from the image.
    """
    ocr = PaddleOCR(lang='en')
    try:
        results = ocr.ocr(image_path)
        return " ".join([res[1][0] for res in results[0]])
    except Exception as e:
        return str(e)

def normalize_malformed_date(raw_date):
    """
    Generalize normalization for malformed dates.
    Handles various cases like:
    - Extra characters: 15/08/25E6A -> 15/08/25
    - Malformed years: 28/09/243 -> 28/09/2024
    - Text appended: AUG/248BESTBEFOPEHLIC -> AUG/24
    - Concatenated dates: 10/10/24&09/03/25 -> ["10/10/24", "09/03/25"]
    - Overlapping dates: 21.11.202420.05.2025 -> ["21.11.2024", "20.05.2025"]
    - Misplaced year format: OCT.204.4 -> OCT.2024
    - Partial month-year: OCT.202.4 -> OCT.2024

    Args:
        raw_date (str): The raw date string.

    Returns:
        list: A list of normalized date strings.
    """
    normalized_dates = []
    # Handle dates with extra characters, e.g., 15/08/25E6A -> 15/08/25
    if re.match(r"\d{1,2}/\d{1,2}/\d{2}[A-Z0-9]+", raw_date):
        match = re.match(r"(\d{1,2}/\d{1,2}/\d{2})", raw_date)
        if match:
            normalized_dates.append(match.group(1))

    # Handle malformed years, e.g., 28/09/243 -> 28/09/2024
    if re.match(r"\d{2}/\d{2}/\d{3}$", raw_date):
        match = re.match(r"(\d{2}/\d{2})/(\d{3})", raw_date)
        if match:
            day_month = match.group(1)
            year = int(match.group(2)) + 2000  # Assume 21st century
            normalized_dates.append(f"{day_month}/{year}")

    # Handle text-appended dates, e.g., AUG/248BESTBEFOPEHLIC -> AUG/24
    if re.match(r"[A-Z]{3}/\d{2,4}[A-Z]+", raw_date):
        match = re.match(r"([A-Z]{3}/\d{2})", raw_date)
        if match:
            normalized_dates.append(match.group(1))

    # Handle concatenated dates, e.g., 10/10/24&09/03/25 -> ["10/10/24", "09/03/25"]
    if '&' in raw_date:
        parts = raw_date.split('&')
        for part in parts:
            normalized_dates.append(part.strip().rstrip('.'))

    # Handle overlapping dates, e.g., 21.11.202420.05.2025 -> ["21.11.2024", "20.05.2025"]
    if re.match(r"\d{2}\.\d{2}\.\d{4}\d{2}\.\d{2}\.\d{4}", raw_date):
        first_date = raw_date[:10]
        second_date = raw_date[10:]
        normalized_dates.extend([first_date, second_date])

    # Handle concatenated day-month, e.g., 04111/2024 -> 04/11/2024
    if re.match(r"\d{5}/\d{4}", raw_date):
        match = re.match(r"(\d{2})(\d{2})/(\d{4})", raw_date)
        if match:
            day, month, year = int(match.group(1)), int(match.group(2)), int(match.group(3))
            normalized_dates.append(f"{day:02d}/{month:02d}/{year}")

    # Handle text prefixes, e.g., FNKUM17097417/09/2024 -> 17/09/2024
    if re.match(r"[A-Z]+\d{2}\d{5}/\d{4}", raw_date):
        match = re.search(r"(\d{2}/\d{2}/\d{4})", raw_date)
        if match:
            normalized_dates.append(match.group(1))

    # Handle trailing digits, e.g., 16/06/202507 -> 16/06/2025
    if re.match(r"\d{2}/\d{2}/\d{7}", raw_date):
        match = re.match(r"(\d{2}/\d{2}/\d{4})\d", raw_date)
        if match:
            normalized_dates.append(match.group(1))

    # Handle misplaced year format, e.g., OCT.204.4 -> OCT.2024
    if re.match(r"[A-Z]{3}\.\d{3}\.\d$", raw_date):
        match = re.match(r"([A-Z]{3})\.(\d{3})\.(\d)", raw_date)
        if match:
            month = match.group(1)
            year = int(match.group(2)) + 2000  # Convert 3-digit year to 4-digit
            normalized_dates.append(f"{month}/{year}")

    # Handle partial month-year, e.g., OCT.202.4 -> OCT.2024
    if re.match(r"[A-Z]{3}\.\d{3}\.\d$", raw_date):
        match = re.match(r"([A-Z]{3})\.(\d{3})\.\d", raw_date)
        if match:
            month = match.group(1)
            year = int(match.group(2)) + 2000  # Convert 3-digit year to 4-digit
            normalized_dates.append(f"{month}/{year}")

    # Add raw_date if no specific normalization matched
    if not normalized_dates:
        normalized_dates.append(raw_date)

    # Return unique normalized dates
    return list(set(normalized_dates))

def extract_dates(extracted_text):
    """
    Extract all dates from the text, including additional formats like dd/mm/yy, dd/mm/yyyy, mm/dd/yy, and mm/dd/yyyy.

    Args:
        extracted_text (str): The text extracted from the image.

    Returns:
        list: A list of datetime objects for the extracted dates.
    """
    date_pattern = r"""
    \b(?:                             
        \d{2}\.\d{2}\.\d{4}\d{2}\.\d{2}\.\d{4}      # Concatenated dd.mm.yyyy formats
        |\d{5}/\d{4}                                # Malformed dates like 04111/2024
        |\d{1,2}[/-]\d{1,2}[/-]\d{4}                # Standard dd-mm-yyyy or dd/mm/yyyy
        |\d{1,2}[A-Z]{3}\d{4}                       # Dates like 10OCT2024
        |\d{4}[/-]\d{2}[/-]\d{2}                    # yyyy-mm-dd or yyyy/mm/dd
        |\d{1,2} \w{3,9} \d{4}                      # Dates like 10 October 2024
        |\d{2}\.\d{2}\.\d{4}                        # Dates in dd.mm.yyyy
        |\d{2}\.\d{4}                               # Dates in mm.yyyy
        |[A-Z]{3}\.\d{4}                            # Dates like OCT.2024
        |[A-Z]{3}\.\d{2}                            # Dates like OCT.24
        |[A-Z]{3}/\d{2}                             # Dates like OCT/24
        |\d{2}/\d{2}/\d{3}                          # Malformed dates like 28/09/243
        |\d{2}/\d{2}/\d{2}                          # dd/mm/yy
        |\d{2}/\d{2}/\d{4}                          # dd/mm/yyyy
        |\d{2}/\d{2}                                # mm/yy
        |\d{2}/\d{4}                                # mm/yyyy
        |\d{2}\.\d{2}                               # mm.yy
        |\d{2}\.\d{4}                               # mm.yyyy
        |\d{2}-\d{2}                                # mm-yy
        |\d{2}-\d{4}                                # mm-yyyy
        |\d{2}-\d{2}-\d{4}                          # dd-mm-yyyy
        |\d{2}-\d{2}-\d{2}                          # dd-mm-yy
        |\d{2}-\d{2}-\d{2}                          # mm-dd-yy
        |\d{2}-\d{2}-\d{4}                          # mm-dd-yyyy
        |\d{2}\.\d{2}\.\d{2}                        # dd.mm.yy
        |\d{2}\.\d{2}\.\d{4}                        # mm.dd.yyyy
        |\d{2}\.\d{2}\.\d{2}                        # mm.dd.yy
        |\d{2}/\d{2}/\d{2}                          # mm/dd/yy
        |\d{2}/\d{2}/\d{4}                          # mm/dd/yyyy
    )\b
    """

    raw_dates = re.findall(date_pattern, extracted_text, re.VERBOSE)
    parsed_dates = []

    for raw_date in raw_dates:
        try:
            normalized_dates = normalize_malformed_date(raw_date)
            for normalized_date in normalized_dates:
                parsed_date = None
                for fmt in ("%d/%m/%Y", "%d/%m/%y", "%m/%d/%Y", "%m/%d/%y", "%d-%m-%Y", "%d-%m-%y", "%Y-%m-%d", "%d %b %Y", "%d.%m.%Y", "%m.%Y", "%b.%Y"):
                    try:
                        parsed_date = datetime.strptime(normalized_date, fmt)
                        break
                    except ValueError:
                        continue

                if parsed_date:
                    parsed_dates.append(parsed_date)
        except ValueError:
            continue

    return sorted(parsed_dates)

def determine_life_and_status(dates):
    """
    Determine manufacturing date, expiry date, life of the product, and expiration status.

    Args:
        dates (list): A sorted list of datetime objects.

    Returns:
        dict: A dictionary with manufacturing date, expiry date, product life, and expiration status.
    """
    today = datetime.now()

    # If a single date is detected
    if len(dates) == 1:
        single_date = dates[0]
        if single_date.year == today.year + 1:  # If the date is a year ahead, treat it as the expiry date
            return {
                'manufacturing_date': None,
                'expiry_date': single_date.strftime("%d/%m/%Y"),
                'product_life_days': None,
                'expired': today > single_date
            }
        elif abs(single_date - today) <= timedelta(days=6 * 30):  # Treat as manufacturing date if within 6 months
            return {
                'manufacturing_date': single_date.strftime("%d/%m/%Y"),
                'expiry_date': None,
                'product_life_days': None,
                'expired': None
            }

    # If less than 2 dates are detected, return as incomplete
    if len(dates) < 2:
        return {
            'manufacturing_date': None,
            'expiry_date': None,
            'product_life_days': None,
            'expired': None
        }

    # If multiple dates are detected
    manufacturing_date = dates[0]
    expiry_date = dates[-1]
    product_life_days = (expiry_date - manufacturing_date).days
    expired = today > expiry_date

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
    # Display the extracted text
    print("\nExtracted Text:")
    print(extracted_text)

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


