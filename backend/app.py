import os
from flask import Flask
from backend.models.database import db
from config import Config
from routes.detect import detect_objects_blueprint
from routes.detect_back_side import detect_back_side_blueprint
from routes.fruits_detect import fruit_detection_blueprint
from routes.save_fruit_data import detect_objects_savefruit_blueprint
from routes.detect_front_side import detect_front_side_blueprint
from routes.report import report_blueprint

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)

# Register the blueprints
app.register_blueprint(detect_objects_blueprint, name='detect_objects')
app.register_blueprint(detect_back_side_blueprint, name='detect_back_side')
app.register_blueprint(fruit_detection_blueprint, name='fruit_detection')
app.register_blueprint(detect_objects_savefruit_blueprint, name='save_fruit_data')
app.register_blueprint(detect_front_side_blueprint, name='detect_front_side')
app.register_blueprint(report_blueprint, name='report')

# Create database tables
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
