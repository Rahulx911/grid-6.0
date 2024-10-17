from flask import Flask
from routes.detect import detect_objects_blueprint

app = Flask(__name__)

# Register the blueprint
app.register_blueprint(detect_objects_blueprint)

if __name__ == "__main__":
    app.run(debug=True)
