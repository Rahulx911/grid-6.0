# routes/save_ocr_data.py

from flask import Blueprint, request, jsonify
from backend.models.database import db, Box, Item

save_ocr_data_blueprint = Blueprint('save_ocr_data', __name__)

@save_ocr_data_blueprint.route('/save_ocr_data', methods=['POST'])
def save_ocr_data():
    data = request.get_json()
    box_code = data.get('box_code')
    ocr_output = data.get('ocr_output')

    # Find the corresponding box
    box = Box.query.filter_by(box_code=box_code).first()
    if not box:
        return jsonify({'error': 'Box not found'}), 404

    # Save the OCR data as a new item in the database
    new_item = Item(
        box_id=box.box_id,
        item_type='ocr',
        front_data=ocr_output
    )
    db.session.add(new_item)
    db.session.commit()

    return jsonify({'message': 'OCR data saved successfully!'})
