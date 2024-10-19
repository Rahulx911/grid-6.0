# models/database.py

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Box(db.Model):
    __tablename__ = 'box'
    box_id = db.Column(db.Integer, primary_key=True)
    box_code = db.Column(db.String, unique=True, nullable=False, index=True)
    total_objects = db.Column(db.Integer, nullable=True)

class Item(db.Model):
    __tablename__ = 'item'
    item_id = db.Column(db.Integer, primary_key=True)
    box_id = db.Column(db.Integer, db.ForeignKey('box.box_id'), nullable=False, index=True)
    item_type = db.Column(db.String, nullable=False)  # 'fruit' or 'packed'
    front_data = db.Column(db.String, nullable=True)
    back_data = db.Column(db.String, nullable=True)
    produce_type = db.Column(db.String, nullable=True)
    freshness = db.Column(db.String, nullable=True)
    shelf_life = db.Column(db.String, nullable=True)
    
    box = db.relationship('Box', backref='items', lazy=True)

