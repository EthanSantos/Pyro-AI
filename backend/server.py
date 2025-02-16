import os
from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from PIL import Image
import requests
from io import BytesIO
import numpy as np
import onnxruntime as ort
import cv2

from utils.image_processor import preprocess_image
from utils.video import load_yolo_model, process_frame  # Ensure these functions are implemented

app = Flask(__name__)
CORS(app)

# ----------------------------
# Global Toggle for Detection
# ----------------------------
detection_enabled = False  # This global variable controls YOLO detection

# ----------------------------
# ONNX MODEL (Wildfire CNN) Setup
# ----------------------------
MODEL_DIR = "models"
ONNX_MODEL_PATH = os.path.join(MODEL_DIR, "wildfire_cnn.onnx")
os.makedirs(MODEL_DIR, exist_ok=True)

app.logger.info("Loading the ONNX model...")
session = ort.InferenceSession(ONNX_MODEL_PATH)
# Get the input name (assumes one input tensor)
input_name = session.get_inputs()[0].name

def onnx_predict(session, processed_image):
    """
    Prepare the image and run inference using ONNX Runtime.
    """
    # Expand dims to add a batch dimension and cast to float32
    input_data = np.expand_dims(processed_image, axis=0).astype(np.float32)
    outputs = session.run(None, {input_name: input_data})
    return outputs[0]

# ----------------------------
# YOLOv8 MODEL Setup for Video Processing
# ----------------------------
app.logger.info("Loading the YOLOv8 model...")
yolo_model = load_yolo_model(os.path.join(MODEL_DIR, "wildfire_yolo_v8.pt"))

# ----------------------------
# Routes and Utility Functions
# ----------------------------

@app.route('/', methods=['GET'])
def index():
    return "Flask server up and running :)"

def download_and_process_image(image_url):
    """
    Download the image from the provided URL and preprocess it.
    """
    response = requests.get(image_url)
    if response.status_code != 200:
        raise Exception("Failed to fetch image")
    
    image = Image.open(BytesIO(response.content))
    processed_image = preprocess_image(image)
    return processed_image

@app.route('/api/predict', methods=['POST'])
def predict_wildfire_risk():
    try:
        data = request.json
        if not data or 'imageUrl' not in data:
            return jsonify({"error": "No image URL provided"}), 400

        coordinates = data.get('coordinates', None)
        app.logger.info(f"Downloading image from: {data['imageUrl']}")
        processed_image = download_and_process_image(data['imageUrl'])
        
        # Run prediction using ONNX Runtime
        prediction = onnx_predict(session, processed_image)
        risk_score = float(prediction[0])
        risk_percentage = int(prediction[0][0] * 100)
        
        app.logger.info(f"Prediction made for coordinates {coordinates}: {risk_percentage}%")
        return jsonify({
            "risk": f"{risk_percentage}%",
            "coordinates": coordinates,
            "confidence": risk_percentage
        })

    except Exception as e:
        app.logger.error(f"Error during prediction: {str(e)}")
        return jsonify({"error": str(e)}), 500

# ----------------------------
# Detection Toggle API
# ----------------------------
@app.route('/api/toggle-detection', methods=['POST'])
def toggle_detection():
    """
    Update the global detection_enabled variable based on the incoming JSON.
    """
    global detection_enabled
    data = request.json
    if 'enabled' not in data:
        return jsonify({"error": "No 'enabled' field provided"}), 400

    detection_enabled = bool(data['enabled'])
    app.logger.info(f"Detection toggled to: {detection_enabled}")
    return jsonify({"status": "Detection state updated", "enabled": detection_enabled}), 200

def generate_frames(video_path):
    """
    Generate video frames from the provided video path in a loop.
    If detection_enabled is True, apply YOLOv8 detection on each frame.
    """
    global detection_enabled
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        raise ValueError(f"Error opening video file: {video_path}")
    
    try:
        while True:
            success, frame = cap.read()
            if not success:
                # If we reach the end of the video, loop back to the start
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                continue
            
            if detection_enabled:
                # Process frame with YOLO detection
                processed_frame, _ = process_frame(yolo_model, frame)
            else:
                processed_frame = frame
            
            # Encode frame to JPEG
            ret, buffer = cv2.imencode('.jpg', processed_frame)
            if not ret:
                continue  # Skip if encoding fails
            frame_bytes = buffer.tobytes()
            
            # Return a multipart response
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
    finally:
        cap.release()

@app.route('/api/video-feed/<video_name>')
def video_feed(video_name):
    """
    Stream the video continuously. The detection is controlled by
    the global detection_enabled variable (set via /api/toggle-detection).
    """
    try:
        video_path = os.path.join('public/videos', video_name)
        if not os.path.exists(video_path):
            return jsonify({"error": "Video not found"}), 404

        return Response(
            generate_frames(video_path),
            mimetype='multipart/x-mixed-replace; boundary=frame'
        )

    except Exception as e:
        app.logger.error(f"Error processing video feed: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.errorhandler(Exception)
def handle_error(error):
    app.logger.error(f"Unhandled error: {str(error)}")
    response = jsonify({"error": "Internal server error"})
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    return response, 500

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    return response


# Expose the Flask app as the WSGI callable for deployment (e.g., on Vercel)
application = app

if __name__ == '__main__':
    app.run(debug=True)
