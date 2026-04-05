import os
import cv2
import time
import requests
import uuid
import psutil
import threading
from flask import Flask, Response, render_template_string
from ultralytics import YOLO
from dotenv import load_dotenv
from incident_logic import CollisionManager, select_best_yolo_model

load_dotenv()

# Configuration
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000/api")
SOURCE = os.getenv("VIDEO_SOURCE", "0") # Webcam 0, "testing.mp4", or RTSP
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "7e33ee11182cc2ad20643f007c8b4834")

# Fetch Current Location Dynamically
def fetch_current_location():
    print("🌍 Fetching Edge Node GPS Coordinates...")
    try:
        res = requests.get('http://ip-api.com/json', timeout=5).json()
        if res.get('status') == 'success':
            print(f"📍 Location Acquired: {res.get('city')}, {res.get('country')}")
            return {
                "id": "CAM-" + str(uuid.uuid4())[:6].upper(),
                "name": f"Edge Node - {res.get('city')}",
                "locationName": f"{res.get('city')}, {res.get('regionName')}",
                "roadName": "Local Tracking Node",
                "latitude": float(res.get('lat')),
                "longitude": float(res.get('lon'))
            }
    except Exception as e:
        print(f"⚠️ Warning: Could not fetch active GPS location: {e}")
        
    print("📍 Using default static location.")
    # Fallback
    return {
        "id": "CAM-001",
        "name": "Highway Overpass Junction",
        "locationName": "Main Junction, Block A",
        "roadName": "Grand Trunk Road",
        "latitude": 11.0168,
        "longitude": 76.9558
    }

CAMERA_INFO = fetch_current_location()

app = Flask(__name__)

class EdgeAIService:
    def __init__(self):
        print(f"🚀 Initializing EdgeAI...")
        model_name = select_best_yolo_model()
        print(f"🧠 System Memory Analysis: Selecting {model_name}")
        self.model = YOLO(model_name)
        self.collision_manager = CollisionManager(weather_api_key=WEATHER_API_KEY)
        self.last_sent_time = 0
        self.incident_cooldown = 15 # seconds

    def _report_incident(self, incident, frame):
        try:
             payload = {
                 "eventId": str(uuid.uuid4()),
                 "cameraId": CAMERA_INFO['id'],
                 "cameraName": CAMERA_INFO['name'],
                 "locationName": CAMERA_INFO['locationName'],
                 "roadName": CAMERA_INFO['roadName'],
                 "latitude": CAMERA_INFO['latitude'],
                 "longitude": CAMERA_INFO['longitude'],
                 "accidentDetected": True,
                 "accidentConfidence": incident['accidentConfidence'],
                 "incidentScore": incident['incidentScore'],
                 "confirmationRuleTriggered": incident['confirmationRuleTriggered'],

                 "humanCount": incident['humanCount'],
                 "vehicleCount": incident['vehicleCount'],

                 "visibleHumanCount": incident['visibleHumanCount'],
                 "incidentZoneHumanCount": incident['incidentZoneHumanCount'],
                 "totalVehicleCount": incident['totalVehicleCount'],
                 "vehicleCountsByType": incident['vehicleCountsByType'],
                 "involvedVehicleCount": incident['involvedVehicleCount'],
                 "involvedVehicleCountsByType": incident['involvedVehicleCountsByType'],

                 "estimatedTotalOccupantsMin": incident['estimatedTotalOccupantsMin'],
                 "estimatedTotalOccupantsMax": incident['estimatedTotalOccupantsMax'],
                 "estimatedTotalOccupantsMidpoint": incident['estimatedTotalOccupantsMidpoint'],

                 "estimatedTotalAffectedMin": incident['estimatedTotalAffectedMin'],
                 "estimatedTotalAffectedMax": incident['estimatedTotalAffectedMax'],
                 "estimatedTotalAffectedMidpoint": incident['estimatedTotalAffectedMidpoint'],

                 "severity": incident['severity'],
                 "severityScore": incident['severityScore'],
                 "emergencyAlert": incident['severity'] == "Critical" or incident['severity'] == "High"
             }
             
             temp_path = f"tmp_incident_{payload['eventId']}.jpg"
             cv2.imwrite(temp_path, frame)
             print(f"🚨 ALERT DETECTED: {incident['severity']} Severity (Weather: {incident['weather']})")

             with open(temp_path, 'rb') as img:
                 files = {'image': (temp_path, img, 'image/jpeg')}
                 response = requests.post(f"{BACKEND_URL}/incidents", data=payload, files=files)
                 
                 if response.status_code == 201:
                      print(f"✅ REPORT SUCCESS: Event {payload['eventId']} archived.")
                 else:
                      print(f"❌ REPORT ERROR {response.status_code}: {response.text}")

             if os.path.exists(temp_path): os.remove(temp_path)
        except Exception as e:
             print(f"❌ EDGE REPORTING FAILED: {str(e)}")

    def _draw_overlay(self, frame, incident, results=None):
        status_color = (1, 190, 1) # Dark Green
        status_text = f"System Scan: SECURE | RAM Mode: Optimized"
        
        is_accident = False
        if incident:
            is_accident = True
            status_color = (0, 0, 255) # Red
            status_text = f"CRITICAL INCIDENT | SEVERITY: {incident['severity']} | Confirming: {incident['prolongedFrames']}f"
            h, w, _ = frame.shape
            cv2.rectangle(frame, (10,10), (w-10, h-10), status_color, 4)

        # Draw status bar
        cv2.rectangle(frame, (0,0), (frame.shape[1], 40), (20,20,20), -1)
        cv2.putText(frame, status_text, (20, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255,255,255) if not incident else (0,0,255), 2)

        if results and len(results) > 0:
            boxes = results[0].boxes
            class_names = results[0].names
            
            for box in boxes.data:
                if len(box) == 6:
                    x1, y1, x2, y2, score, class_id = box
                    score = float(score)
                    if score < 0.4:
                        continue
                        
                    class_id = int(class_id)
                    x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                    class_name = class_names[class_id]

                    label = f"{class_name} {score:.2f}"

                    color_map = {
                        "person": (0, 255, 0),
                        "car": (255, 0, 0),
                        "motorcycle": (0, 255, 255),
                        "bike": (0, 255, 255),
                        "bus": (0, 165, 255),
                        "truck": (255, 0, 255),
                        "auto_rickshaw": (255, 255, 0),
                        "van": (255, 128, 0),
                    }
                    
                    color = color_map.get(class_name, (255, 255, 255))
                    thickness = 2

                    # Accident highlight logic
                    is_incident_object = False
                    if is_accident and '_incident_boxes' in incident:
                        # Check if this box is in _incident_boxes using centroid check
                        cx, cy = (x1+x2)/2, (y1+y2)/2
                        mar = 20
                        for ibox in incident['_incident_boxes']:
                             if (ibox[0]-mar <= cx <= ibox[2]+mar) and (ibox[1]-mar <= cy <= ibox[3]+mar):
                                  is_incident_object = True
                                  break

                    if is_incident_object:
                        color = (0, 0, 255) # Red
                        thickness = 4
                        label = f"{class_name} [INCIDENT] {score:.2f}"

                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, thickness)

                    (w, h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
                    label_y1 = max(0, y1 - h - 6)
                    label_y2 = max(0, y1)
                    cv2.rectangle(frame, (x1, label_y1), (x1 + w + 4, label_y2), color, -1)

                    cv2.putText(
                        frame,
                        label,
                        (x1 + 2, max(12, y1 - 4)),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.5,
                        (0, 0, 0),
                        1,
                        cv2.LINE_AA
                    )


service = EdgeAIService()

HTML_PAGE = """
<!DOCTYPE html>
<html>
<head>
    <title>Edge AI Camera</title>
    <style>
        body { 
            background-color: #0a0a0c; 
            color: #fff; 
            font-family: 'Inter', sans-serif; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            height: 100vh; margin: 0; 
        }
        h2 { margin-bottom: 20px; text-transform: uppercase; letter-spacing: 2px; }
        .stream-container {
            border: 2px solid #2563eb;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 0 40px rgba(37, 99, 235, 0.2);
            max-width: 90vw;
            max-height: 80vh;
        }
        img { width: 100%; height: auto; display: block; }
        .status { margin-top: 15px; color: #10b981; font-weight: bold; }
    </style>
</head>
<body>
    <h2>VisionGuard Edge Camera Feed</h2>
    <div class="stream-container">
        <img src="/video_feed" alt="Video stream completely unavailable. Check python console.">
    </div>
    <div class="status">● LIVE MJPEG STREAM ACTIVE</div>
</body>
</html>
"""

class VideoCaptureThread:
    def __init__(self, source):
        self.cap = cv2.VideoCapture(source)
        # Force low-resolution for lag-free streaming
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        self.ret, self.frame = self.cap.read()
        self.running = True
        self.thread = threading.Thread(target=self.update, args=())
        self.thread.daemon = True
        self.thread.start()

    def update(self):
        while self.running:
            ret, frame = self.cap.read()
            if ret:
                self.ret = ret
                self.frame = frame
            else:
                time.sleep(0.01)

    def read(self):
        return self.ret, self.frame

    def release(self):
        self.running = False
        self.thread.join()
        self.cap.release()

@app.route('/')
def index():
    return render_template_string(HTML_PAGE)

def generate_frames():
    video_source = int(SOURCE) if SOURCE.isdigit() else SOURCE
    cap = VideoCaptureThread(video_source)
    print(f"✅ Monitoring Stream connected for Web UI (Threaded).")

    while cap.running:
        ret, frame = cap.read()
        if not ret or frame is None: 
            time.sleep(0.05)
            continue

        results = service.model(frame, verbose=False)
        incident_data = service.collision_manager.process_frame(results, CAMERA_INFO)
        
        if incident_data and (time.time() - service.last_sent_time > service.incident_cooldown):
             service._report_incident(incident_data, frame)
             service.last_sent_time = time.time()

        service._draw_overlay(frame, incident_data, results)

        # Convert the drawn frame to JPEG
        ret, buffer = cv2.imencode('.jpg', frame)
        if not ret: continue
        frame_bytes = buffer.tobytes()

        # Yield frame in multipart format
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    cap.release()

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    print("🌍 Starting EdgeAI Live Server at http://localhost:5174")
    # Turn off reloader to avoid initializing YOLO model twice
    app.run(host='0.0.0.0', port=5174, debug=True, use_reloader=False)
