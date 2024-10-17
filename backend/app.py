from flask import Flask
from routes.detect_objects import detect_objects

app = Flask(__name__)

# Register the blueprint
app.register_blueprint(detect_objects)

if __name__ == "__main__":
    app.run(debug=True)
