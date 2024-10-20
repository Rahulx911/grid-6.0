# routes/detect.py
from flask import Blueprint, request, jsonify
from models.database import db, Box, Item

detect_save_blueprint = Blueprint('detect_save', __name__)

@detect_save_blueprint.route('/save_data', methods=['POST'])
def save_data():
    data = request.get_json()
    
    box_code = data.get('boxCode')
    total_objects = data.get('totalObjects')
    item_data = data.get('outputData')
    item_type = item_data.get('item_type', 'packed')  # Default to 'packed'
    
    # Find or create the box in the database
    box = Box.query.filter_by(box_code=box_code).first()
    if not box:
        box = Box(box_code=box_code, total_objects=total_objects)
        db.session.add(box)
        db.session.commit()  # Save to get the box_id
    
    # Create a new item entry
    new_item = Item(
        box_id=box.box_id,
        item_type=item_type,
        front_data=item_data.get('front_data'),
        back_data=item_data.get('back_data'),
        produce_type=item_data.get('produce_type'),
        freshness=item_data.get('freshness'),
        shelf_life=item_data.get('shelf_life')
    )
    
    
    # Save the new item to the database
    db.session.add(new_item)
    db.session.commit()
    
    return jsonify({'message': 'Data saved successfully'}), 200

@detect_save_blueprint.route('/save_fruit_data', methods=['POST'])
def save_fruit_data():
    data = request.get_json()
    
    box_code = data.get('box_code')
    produce_type = data.get('produce_type')
    freshness = data.get('freshness')
    shelf_life = data.get('shelf_life')
    
    box = Box.query.filter_by(box_code=box_code).first()
    if not box:
        return jsonify({'error': 'Box not found'}), 404
    
    new_item = Item(
        box_id=box.box_id,
        item_type='fruit',
        produce_type=produce_type,
        freshness=freshness,
        shelf_life=shelf_life
    )
    
    db.session.add(new_item)
    db.session.commit()
    
    return jsonify({'message': 'Fruit data saved successfully!'}), 200

@detect_save_blueprint.route('/save_ocr_data', methods=['POST'])
def save_ocr_data():
    data = request.get_json()
    
    box_code = data.get('box_code')
    ocr_output = data.get('ocr_output')
    
    box = Box.query.filter_by(box_code=box_code).first()
    if not box:
        return jsonify({'error': 'Box not found'}), 404
    
    new_item = Item(
        box_id=box.box_id,
        item_type='ocr',
        front_data=ocr_output
    )
    
    db.session.add(new_item)
    db.session.commit()
    
    return jsonify({'message': 'OCR data saved successfully!'})
