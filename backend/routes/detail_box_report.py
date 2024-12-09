from flask import Blueprint, jsonify, request
from models.database import db, Box, PackedItem, FreshProduce

detail_box_report_blueprint = Blueprint("detail_box_report_", __name__)

@detail_box_report_blueprint.route('/box-report/<box_code>', methods=['GET'])
def get_box_report(box_code):
    # Find the box by its code
    box = Box.query.filter_by(box_code=box_code).first()
    if not box:
        return jsonify({"error": f"Box with code {box_code} not found"}), 404

    # Fetch Packed Items
    packed_items = [
        {
            "timestamp": item.timestamp.strftime("%Y-%m-%d %H:%M"),
            "brand": item.brand,
            "manufacturingDate":item.manufacturing_date.strftime("%Y-%m-%d") if item.manufacturing_date else "N/A",
            "expiryDate": item.expiry_date.strftime("%Y-%m-%d") if item.expiry_date else "N/A",
            "count": item.count,
            "expired": item.expired,
            "lifeSpan": f"{item.expected_life_span} days" if item.expected_life_span else "N/A",
        }
        for item in box.packed_items
    ]

    # Fetch Fresh Produce
    fresh_produce = [
        {
            "timestamp": produce.timestamp.strftime("%Y-%m-%d %H:%M"),
            "category": produce.category,
            "produce": produce.produce,
            "freshness": produce.fresh,
            "index": produce.freshness_index,
            "lifeSpan": f"{produce.shelf_life} days",
        }
        for produce in box.fresh_produce
    ]

    return jsonify({
        "packedItems": packed_items,
        "freshProduce": fresh_produce,
    })
