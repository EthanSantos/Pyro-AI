from flask import Flask, jsonify, request
from flask_cors import CORS
import tensorflow as tf
from PIL import Image
import requests
from io import BytesIO
import numpy as np
from utils.image_processor import preprocess_image

app = Flask(__name__)
CORS(app)

# load the model
model = tf.keras.models.load_model('models/wildfire_cnn.keras')

@app.route('/', methods=['GET'])
def index():
    return "Flask server up and running :)"

def download_and_process_image(image_url):
    """Download satellite image from URL and preprocess it"""
    response = requests.get(image_url)
    if response.status_code != 200:
        raise Exception("Failed to fetch image")
    
    # open image from response 
    image = Image.open(BytesIO(response.content))
    
    # preprocess image using existing utility
    processed_image = preprocess_image(image)
    return processed_image

@app.route('/api/predict', methods=['POST'])
def predict_wildfire_risk():
    try:
        data = request.json
        if not data or 'imageUrl' not in data:
            return jsonify({"error": "No image URL provided"}), 400

        # get coordinates for logging/tracking
        coordinates = data.get('coordinates', None)
        
        # download and process data
        print(data['imageUrl'])
        processed_image = download_and_process_image(data['imageUrl'])
        
        # make prediction
        prediction = model.predict(processed_image)
        risk_score = float(prediction[0])
        # Convert risk score to percentage (0-100)
        risk_percentage = int(risk_score * 100)
        
        # log prediction for monitoring
        app.logger.info(f"Prediction made for coordinates {coordinates}: {risk_percentage}%")
        
        return jsonify({
            "risk": f"{risk_percentage}%",
            "coordinates": coordinates,
            "confidence": risk_percentage
        })

    except Exception as e:
        app.logger.error(f"Error during prediction: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.errorhandler(Exception)
def handle_error(error):
    app.logger.error(f"Unhandled error: {str(error)}")
    return jsonify({"error": "Internal server error"}), 500

# Expose the Flask app as the WSGI callable for Vercel
application = app

# Optionally run locally if executed directly
if __name__ == '__main__':
    app.run(debug=True)
