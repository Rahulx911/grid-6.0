from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Box(db.Model):
    __tablename__ = 'box'
    id = db.Column(db.Integer, primary_key=True)
    box_code = db.Column(db.String, unique=True, nullable=False, index=True)
    total_objects = db.Column(db.Integer, default=0, nullable=False)
    
    # Relationships
    packed_items = db.relationship('PackedItem', backref='box', lazy=True)
    fresh_produce = db.relationship('FreshProduce', backref='box', lazy=True)


class PackedItem(db.Model):
    __tablename__ = 'packed_item'
    id = db.Column(db.Integer, primary_key=True)
    box_id = db.Column(db.Integer, db.ForeignKey('box.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    brand = db.Column(db.Text, nullable=False)
    manufacturing_date=db.Column(db.Date, nullable=True)
    expiry_date = db.Column(db.Date, nullable=True)
    count = db.Column(db.Integer, default=1, nullable=False)
    expired = db.Column(db.String, nullable=True)  
    expected_life_span = db.Column(db.Integer, nullable=True)  

class FreshProduce(db.Model):
    __tablename__ = 'fresh_produce'
    id = db.Column(db.Integer, primary_key=True)
    box_id = db.Column(db.Integer, db.ForeignKey('box.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    category=db.Column(db.String, nullable=False)
    produce = db.Column(db.String, nullable=False)  
    fresh = db.Column(db.String, nullable=False)
    freshness_index = db.Column(db.Float, nullable=False)  
    shelf_life = db.Column(db.Integer, nullable=False)  
