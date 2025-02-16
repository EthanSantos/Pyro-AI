from ultralytics import YOLO
import cv2
import numpy as np

def load_yolo_model(model_path):
    # load yolo model from path 
    return YOLO(model_path)

def process_frame(model, frame):
    """
    process a single frame using YOLOv8 model
    Args:
        model: YOLO model instance
        frame: numpy array of frame
    Returns:
        processed_frame: frame with detections drawn
        detections: list of detection results
    """
    # Run inference
    results = model(frame, conf=0.25)
    
    # Get detections
    detections = []
    for r in results:
        for box in r.boxes:
            x1, y1, x2, y2 = box.xyxy[0]
            conf = float(box.conf)
            cls = int(box.cls)
            detections.append({
                'bbox': [float(x1), float(y1), float(x2), float(y2)],
                'confidence': conf,
                'class': cls
            })
    
    # Draw bounding boxes
    annotated_frame = results[0].plot()
    
    return annotated_frame, detections

def frame_generator(video_path, model):
    """
    process video frames and yield encoded frame data
    Args:
        video_path: path to video file
        model: YOLO model instance
    Yields:
        bytes of JPEG encoded frame with detections
    """
    # open video capture
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        raise ValueError(f"Error opening video file: {video_path}")
    
    try:
        while True:
            # read frame
            success, frame = cap.read()
            if not success:
                break
                
            # process frame
            processed_frame, _ = process_frame(model, frame)
            
            # encode to JPEG
            _, buffer = cv2.imencode('.jpg', processed_frame)
            frame_bytes = buffer.tobytes()
            
            # yield multipart frame data
            yield (b'--frame\r\n'
                  b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            
    finally:
        # clean up
        cap.release()