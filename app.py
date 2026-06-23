import os
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from PIL import Image

from utils.metadata_checker import check_metadata
from utils.ocr_checker import check_ocr_watermark
from utils.predictor import predict_image

app = Flask(__name__, static_folder='static')

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/analyze', methods=['POST'])
def analyze():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file:
        # Save to memory instead of disk if possible, or we can use the file stream
        image = Image.open(file.stream)
        
        # We need to reset the stream because metadata checker uses it
        file.stream.seek(0)
        metadata_is_ai, metadata_reason = check_metadata(file.stream)
        
        file.stream.seek(0)
        ocr_is_ai, ocr_reason = False, ""
        if not metadata_is_ai:
            ocr_is_ai, ocr_reason = check_ocr_watermark(file.stream)
            
        cnn_is_ai, cnn_confidence = False, 0.0
        cnn_ran = False
        
        if not metadata_is_ai and not ocr_is_ai:
            cnn_is_ai, cnn_confidence = predict_image(image)
            cnn_ran = True

        # Final decision logic
        final_is_ai = False
        final_confidence = 0.0
        final_reason = ""

        if metadata_is_ai:
            final_is_ai = True
            final_confidence = 100.0
            final_reason = f"AI Metadata detected: {metadata_reason}"
        elif ocr_is_ai:
            final_is_ai = True
            final_confidence = 100.0
            final_reason = f"AI Watermark detected: {ocr_reason}"
        else:
            final_is_ai = cnn_is_ai
            final_confidence = cnn_confidence
            if final_is_ai:
                final_reason = "Deep learning model prediction indicates AI generation."
            else:
                final_reason = "No AI signatures found. Deep learning model predicts Real."

        return jsonify({
            'final_is_ai': final_is_ai,
            'final_confidence': final_confidence,
            'final_reason': final_reason,
            'breakdown': {
                'metadata': {'is_ai': metadata_is_ai, 'reason': metadata_reason},
                'ocr': {'is_ai': ocr_is_ai, 'reason': ocr_reason},
                'cnn': {'ran': cnn_ran, 'is_ai': cnn_is_ai, 'confidence': cnn_confidence}
            }
        })

if __name__ == "__main__":
    app.run(debug=True, port=5000)
