from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import tensorflow as tf
from PIL import Image
import requests
from io import BytesIO
import os
import cv2
from utils.image_processor import preprocess_image
from utils.video import load_yolo_model, process_frame, frame_generator

app = Flask(__name__)
CORS(app)

# Load models
cnn_model = tf.keras.models.load_model('models/wildfire_cnn.keras')
yolo_model = load_yolo_model('models/wildfire_yolo_v8.pt')

def download_and_process_image(image_url):
    """Download satellite image from URL and preprocess it"""
    response = requests.get(image_url)
    if response.status_code != 200:
        raise Exception("Failed to fetch image")
    
    image = Image.open(BytesIO(response.content))
    processed_image = preprocess_image(image)
    return processed_image

def generate_frames(video_path, detection_enabled):
    """
    Generate video frames with optional YOLO detection
    """
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        raise ValueError(f"Error opening video file: {video_path}")
    
    try:
        while True:
            success, frame = cap.read()
            if not success:
                break
            
            if detection_enabled:
                # Apply YOLO detection
                processed_frame, _ = process_frame(yolo_model, frame)
            else:
                # Return original frame
                processed_frame = frame
            
            # Encode frame to JPEG
            _, buffer = cv2.imencode('.jpg', processed_frame)
            frame_bytes = buffer.tobytes()
            
            yield (b'--frame\r\n'
                  b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            
    finally:
        cap.release()

@app.route('/api/predict', methods=['POST'])
def predict_wildfire_risk():
    try:
        data = request.json
        if not data or 'imageUrl' not in data:
            return jsonify({"error": "No image URL provided"}), 400

        coordinates = data.get('coordinates', None)
        processed_image = download_and_process_image(data['imageUrl'])
        
        # Make CNN prediction
        prediction = cnn_model.predict(processed_image)
        risk_percentage = int(float(prediction[0]) * 100)
        
        app.logger.info(f"Prediction made for coordinates {coordinates}: {risk_percentage}%")
        
        return jsonify({
            "risk": f"{risk_percentage}%",
            "coordinates": coordinates,
            "confidence": risk_percentage
        })

    except Exception as e:
        app.logger.error(f"Error during prediction: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/video-feed/<video_name>')
def video_feed(video_name):
    """Stream processed video feed with optional YOLO detections"""
    try:
        # Get detection state from query parameter (defaults to False)
        detection_enabled = request.args.get('detection', 'false').lower() == 'true'
        
        video_path = os.path.join('public/videos', video_name)
        if not os.path.exists(video_path):
            return jsonify({"error": "Video not found"}), 404

        return Response(
            generate_frames(video_path, detection_enabled),
            mimetype='multipart/x-mixed-replace; boundary=frame'
        )

    except Exception as e:
        app.logger.error(f"Error processing video feed: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.errorhandler(Exception)
def handle_error(error):
    app.logger.error(f"Unhandled error: {str(error)}")
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True)