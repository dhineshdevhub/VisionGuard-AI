import time
import psutil
import requests
import json
import numpy as np

def select_best_yolo_model():
    """
    Selects model size based on available system RAM.
    """
    total_memory = psutil.virtual_memory().total
    if total_memory < 4 * 1024 * 1024 * 1024:
        return 'yolo11n.onnx'
    elif total_memory < 8 * 1024 * 1024 * 1024:
        return 'yolo11s.onnx'
    else:
        return 'yolo11n.onnx'

def calculate_iou(box1, box2):
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])
    inter_area = max(0, x2 - x1) * max(0, y2 - y1)
    box1_area = (box1[2] - box1[0]) * (box1[3] - box1[1])
    box2_area = (box2[2] - box2[0]) * (box2[3] - box2[1])
    union_area = box1_area + box2_area - inter_area
    return inter_area / union_area if union_area > 0 else 0

def boxes_intersect_with_margin(box1, box2, margin=50):
    x1 = max(box1[0] - margin, box2[0] - margin)
    y1 = max(box1[1] - margin, box2[1] - margin)
    x2 = min(box1[2] + margin, box2[2] + margin)
    y2 = min(box1[3] + margin, box2[3] + margin)
    return (x1 < x2) and (y1 < y2)

def point_in_incident_zone(point_x, point_y, incident_boxes, margin=100):
    for box in incident_boxes:
        if (box[0]-margin <= point_x <= box[2]+margin) and (box[1]-margin <= point_y <= box[3]+margin):
            return True
    return False

# COCO vehicle class map
COCO_VEHICLES = {
    2: "car",
    3: "motorcycle",
    5: "bus",
    7: "truck"
}

# Configurable occupancy heuristics
OCCUPANCY_RULES = {
    "motorcycle": (1, 2),
    "car": (1, 5),
    "van": (1, 12),
    "bus": (10, 50),
    "truck": (1, 3)
}

class CollisionManager:
    def __init__(self, weather_api_key=None):
        self.prolonged_collision_frames = 3
        self.current_collision_streak = 0
        self.weather_api_key = weather_api_key
        self.last_weather_check = 0
        self.current_weather = "Clear"
        self.current_temp = 25
        
        # Temporal persistence tracker
        self.consecutive_incidents = 0
        self.cooldown_frames = 0
        self.cooldown_max = 50

    def get_weather(self, lat, lon):
        if not self.weather_api_key or (time.time() - self.last_weather_check < 3600):
            return self.current_weather, self.current_temp
        try:
            url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={self.weather_api_key}&units=metric"
            res = requests.get(url).json()
            if 'weather' in res:
                self.current_weather = res['weather'][0]['description']
                self.current_temp = res['main']['temp']
                self.last_weather_check = time.time()
        except: pass
        return self.current_weather, self.current_temp

    def extract_involved_vehicles(self, vehicle_idx_list, boxes):
        involved = []
        incident_boxes = []
        for i in range(len(vehicle_idx_list)):
            for j in range(i + 1, len(vehicle_idx_list)):
                idx1 = vehicle_idx_list[i]
                idx2 = vehicle_idx_list[j]
                iou = calculate_iou(boxes[idx1], boxes[idx2])
                if iou > 0.05:
                    if idx1 not in involved: involved.append(idx1)
                    if idx2 not in involved: involved.append(idx2)
                    incident_boxes.extend([boxes[idx1], boxes[idx2]])
        return involved, incident_boxes

    def process_frame(self, results, camera_info):
        if self.cooldown_frames > 0:
            self.cooldown_frames -= 1
            return None
            
        boxes = results[0].boxes.xyxy.cpu().numpy()
        classes = results[0].boxes.cls.cpu().numpy()
        confs = results[0].boxes.conf.cpu().numpy()
        
        # --- A. ACTUAL DETECTED COUNTS (Global) ---
        human_idx_list = [i for i, c in enumerate(classes) if c == 0 and confs[i] > 0.35]
        vehicle_idx_list = [i for i, c in enumerate(classes) if c in COCO_VEHICLES and confs[i] > 0.40]
        
        visible_human_count = len(human_idx_list)
        total_vehicle_count = len(vehicle_idx_list)
        
        vehicle_counts_by_type = {}
        for idx in vehicle_idx_list:
            v_type = COCO_VEHICLES[int(classes[idx])]
            vehicle_counts_by_type[v_type] = vehicle_counts_by_type.get(v_type, 0) + 1
            
        # --- INCIDENT SCORING ---
        incident_score = 0.0
        involved_vehicle_indices, incident_boxes = self.extract_involved_vehicles(vehicle_idx_list, boxes)
        
        # Multi-signal logic overlap
        if len(involved_vehicle_indices) >= 2:
            incident_score += 0.60
            
        # Proximity logic (Sudden stop/close bounds)
        if total_vehicle_count >= 2 and len(involved_vehicle_indices) == 0:
             for i in range(len(vehicle_idx_list)):
                 for j in range(i + 1, len(vehicle_idx_list)):
                      if boxes_intersect_with_margin(boxes[vehicle_idx_list[i]], boxes[vehicle_idx_list[j]], margin=30):
                           incident_score += 0.35
                           if vehicle_idx_list[i] not in involved_vehicle_indices: involved_vehicle_indices.append(vehicle_idx_list[i])
                           if vehicle_idx_list[j] not in involved_vehicle_indices: involved_vehicle_indices.append(vehicle_idx_list[j])
                           incident_boxes.extend([boxes[vehicle_idx_list[i]], boxes[vehicle_idx_list[j]]])
                           break
                           
        # Human on ground / abnormal human near vehicle (proximal humans)
        incident_zone_human_count = 0
        for idx in human_idx_list:
            bx = boxes[idx]
            cx, cy = (bx[0]+bx[2])/2, (bx[1]+bx[3])/2
            if point_in_incident_zone(cx, cy, incident_boxes, margin=150):
                incident_zone_human_count += 1
                incident_score += 0.15

        # Temporal Confirmation Rule
        if incident_score >= 0.50:
            self.consecutive_incidents += 1
        else:
            self.consecutive_incidents = max(0, self.consecutive_incidents - 1)
            
        # Add persistence bonus
        confirmation_rule_triggered = ""
        if self.consecutive_incidents >= 3:
            incident_score += 0.40
            confirmation_rule_triggered = "temporal_persistence_3_frames"
        
        if incident_score < 0.85:
            return None

        # --- EVENT CONFIRMED ---
        self.cooldown_frames = self.cooldown_max
        
        # --- INVOLVED VEHICLES INTELLIGENCE ---
        involved_vehicle_count = len(involved_vehicle_indices)
        involved_vehicle_counts_by_type = {}
        min_occ, max_occ = 0, 0
        
        for idx in involved_vehicle_indices:
            v_type = COCO_VEHICLES[int(classes[idx])]
            involved_vehicle_counts_by_type[v_type] = involved_vehicle_counts_by_type.get(v_type, 0) + 1
            o_min, o_max = OCCUPANCY_RULES.get(v_type, (1, 4))
            min_occ += o_min
            max_occ += o_max

        mid_occ = int(round((min_occ + max_occ) / 2))
        
        # --- B. ESTIMATED TOTAL AFFECTED PEOPLE ---
        # Adjusted by incident_zone_humans (we do not claim exact counts unless visible is strictly higher)
        est_affected_min = max(min_occ, incident_zone_human_count)
        est_affected_mid = max(mid_occ, incident_zone_human_count)
        est_affected_max = max(max_occ, incident_zone_human_count + mid_occ)

        # Weather Severity calculation
        weather, temp = self.get_weather(camera_info['latitude'], camera_info['longitude'])
        severity = "High"
        severity_score = min(98.0, incident_score * 100)
        
        if "rain" in weather.lower() or "fog" in weather.lower() or "haze" in weather.lower():
            severity = "Critical"
            severity_score = 99.0

        return {
            "accidentDetected": True,
            "accidentConfidence": float(incident_score),
            "incidentScore": float(incident_score),
            "confirmationRuleTriggered": confirmation_rule_triggered,
            
            # Legacy
            "humanCount": visible_human_count,
            "vehicleCount": total_vehicle_count,
            
            # Actuals
            "visibleHumanCount": visible_human_count,
            "incidentZoneHumanCount": incident_zone_human_count,
            "totalVehicleCount": total_vehicle_count,
            "vehicleCountsByType": json.dumps(vehicle_counts_by_type),
            "involvedVehicleCount": involved_vehicle_count,
            "involvedVehicleCountsByType": json.dumps(involved_vehicle_counts_by_type),
            
            # Estimates
            "estimatedTotalOccupantsMin": min_occ,
            "estimatedTotalOccupantsMax": max_occ,
            "estimatedTotalOccupantsMidpoint": mid_occ,
            
            "estimatedTotalAffectedMin": est_affected_min,
            "estimatedTotalAffectedMax": est_affected_max,
            "estimatedTotalAffectedMidpoint": est_affected_mid,
            
            # General
            "severity": severity,
            "severityScore": float(severity_score),
            "weather": weather,
            "temp": temp,
            "prolongedFrames": self.consecutive_incidents,
            
            # System UI pass-through (removed before JSON API post)
            "_incident_boxes": incident_boxes
        }
