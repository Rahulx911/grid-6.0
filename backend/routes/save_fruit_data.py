# routes/detect.py

from flask import Blueprint, request, jsonify
from backend.models.database import db, Box, Item

detect_objects_savefruit_blueprint = Blueprint('detect_objects', __name__)

@detect_objects_savefruit_blueprint.route('/save_fruit_data', methods=['POST'])
def save_fruit_data():
    data = request.get_json()

    # Extract data from the request
    box_code = data.get('box_code')
    produce_type = data.get('produce_type')
    freshness = data.get('freshness')
    shelf_life = data.get('shelf_life')

    # Find the corresponding box by its code
    box = Box.query.filter_by(box_code=box_code).first()

    if not box:
        return jsonify({'error': 'Box not found'}), 404

    # Create a new item with fruit data
    new_item = Item(
        box_id=box.box_id,
        item_type='fruit',
        front_data=None,  # This field isn't used for fruit
        back_data=None,   # This field isn't used for fruit
        produce_type=produce_type,
        freshness=freshness,
        shelf_life=shelf_life
    )

    # Add the item to the database
    db.session.add(new_item)
    db.session.commit()

    return jsonify({'message': 'Fruit data saved successfully!'}), 200
