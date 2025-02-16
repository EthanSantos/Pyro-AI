import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image
import requests
from io import BytesIO
import numpy as np
from utils.image_processor import preprocess_image
import onnxruntime as ort

app = Flask(__name__)
CORS(app)

# Define model directory and ONNX model path
MODEL_DIR = "models"
ONNX_MODEL_PATH = os.path.join(MODEL_DIR, "wildfire_cnn.onnx")
os.makedirs(MODEL_DIR, exist_ok=True)

# Load the ONNX model using ONNX Runtime
app.logger.info("Loading the ONNX model...")
session = ort.InferenceSession(ONNX_MODEL_PATH)
# Get the input name (assumes one input tensor)
input_name = session.get_inputs()[0].name

def onnx_predict(session, processed_image):
    """
    Prepares the image and runs inference using ONNX Runtime.
    This function expects the processed image to be in a format the model requires.
    """
    # Expand dimensions to add batch size (if needed)
    input_data = np.expand_dims(processed_image, axis=0).astype(np.float32)
    # Run the model and get the prediction (assumes a single output tensor)
    outputs = session.run(None, {input_name: input_data})
    return outputs[0]

@app.route('/', methods=['GET'])
def index():
    return "Flask server up and running :)"

def download_and_process_image(image_url):
    """
    Download the image from the provided URL and preprocess it using your utility.
    """
    response = requests.get(image_url)
    if response.status_code != 200:
        raise Exception("Failed to fetch image")
    
    # Open the image from the response content
    image = Image.open(BytesIO(response.content))
    # Preprocess the image (make sure it matches the ONNX model's input format)
    processed_image = preprocess_image(image)
    return processed_image

@app.route('/api/predict', methods=['POST'])
def predict_wildfire_risk():
    try:
        data = request.json
        if not data or 'imageUrl' not in data:
            return jsonify({"error": "No image URL provided"}), 400

        # Optionally get coordinates for logging/tracking
        coordinates = data.get('coordinates', None)
        app.logger.info(f"Downloading image from: {data['imageUrl']}")
        processed_image = download_and_process_image(data['imageUrl'])
        
        # Run prediction using ONNX Runtime
        prediction = onnx_predict(session, processed_image)
        risk_score = float(prediction[0])
        risk_percentage = int(risk_score * 100)
        
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

if __name__ == '__main__':
    app.run(debug=True)
