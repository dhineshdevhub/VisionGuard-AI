from ultralytics import YOLO
print("Exporting 11n...")
YOLO("yolo11n.pt").export(format="onnx", imgsz=480)
print("Exporting 11s...")
YOLO("yolo11s.pt").export(format="onnx", imgsz=480)
