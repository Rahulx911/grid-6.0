from flask import Blueprint, jsonify
from backend.models.database import db, Box, Item

report_blueprint = Blueprint('report', __name__)

@report_blueprint.route('/get_boxes', methods=['GET'])
def get_boxes():
    boxes = Box.query.all()
    box_list = [{'box_code': box.box_code} for box in boxes]
    return jsonify(box_list)

@report_blueprint.route('/get_box_details/<string:box_code>', methods=['GET'])
def get_box_details(box_code):
    box = Box.query.filter_by(box_code=box_code).first()
    if not box:
        return jsonify({'error': 'Box not found'}), 404

    items = Item.query.filter_by(box_id=box.box_id).all()
    item_list = [
        {
            'item_id': item.item_id,
            'front_data': item.front_data,
            'back_data': item.back_data
        } for item in items
    ]

    return jsonify({
        'total_objects': box.total_objects,
        'items': item_list
    })
