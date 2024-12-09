from flask import Blueprint, jsonify
from models.database import Box

report_blueprint = Blueprint("report", __name__)

@report_blueprint.route('/box-reports', methods=['GET'])
def get_box_reports():
    # Query all boxes from the database
    boxes = Box.query.all()
    # Format data into a list of dictionaries
    box_reports = [
        {
            "boxCode": box.box_code,
            "totalObjects": box.total_objects
        }
        for box in boxes
    ]
    return jsonify(box_reports)
