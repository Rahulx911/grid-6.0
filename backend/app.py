import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from models.database import db
from config import Config
from models.object_detection import box_detection_blueprint
from routes.detect_back_side import detect_back_side_blueprint
from routes.fruits_detect import  fruit_detection_blueprint
from routes.detect_front_side import detect_front_side_blueprint
from routes.box_reports import report_blueprint 
from routes.detail_box_report import detail_box_report_blueprint

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["https://grid-6-0.vercel.app", "http://localhost:3000"]}})
app.config.from_object(Config)

db.init_app(app)
migrate = Migrate(app, db)  

app.register_blueprint(box_detection_blueprint)
app.register_blueprint(detect_back_side_blueprint)
app.register_blueprint(fruit_detection_blueprint)
app.register_blueprint(detect_front_side_blueprint)
app.register_blueprint(report_blueprint)
app.register_blueprint(detail_box_report_blueprint)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port,debug=True)
