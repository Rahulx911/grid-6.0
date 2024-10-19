# query_database.py
from app import app  # Import the Flask app to use its context
from models.database import db, Box, Item

# Use the app context for querying the database
with app.app_context():
    # List all Box entries
    boxes = Box.query.all()
    print("Box Entries:")
    for box in boxes:
        print(f"Box Code: {box.box_code}, Total Objects: {box.total_objects}")

    # List all Item entries
    items = Item.query.all()
    print("\nItem Entries:")
    for item in items:
        print(f"Item ID: {item.item_id}, Box ID: {item.box_id}, Type: {item.item_type}, "
              f"Front Data: {item.front_data}, Back Data: {item.back_data}")
