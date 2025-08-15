from flask import Flask, request, render_template, jsonify, send_file
from ultralytics import YOLO
import os
import cv2

app = Flask(__name__)
script_dir = os.path.dirname(os.path.abspath(__file__))

model_path = os.path.join(script_dir, 'model', 'best.pt')

model = YOLO(model_path)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    file = request.files['file']
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    
    try:
        file.save(file_path)
        results = model(file_path)
        first_result = results[0]
        
        img = cv2.imread(file_path)
        if img is None:
            raise ValueError("Error reading uploaded image.")
        
        for box in first_result.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0].numpy())
            class_id = int(box.cls[0].item())
            class_name = model.names[class_id]
            cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(img, class_name, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        
        processed_file_path = os.path.join(UPLOAD_FOLDER, 'processed_' + file.filename)
        cv2.imwrite(processed_file_path, img)
        return send_file(processed_file_path, mimetype='image/jpeg')
    
    except Exception as e:
        print(f"Error processing file: {str(e)}")
        return jsonify({'error': f"Error processing file: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
