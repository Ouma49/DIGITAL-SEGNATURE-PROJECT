from flask import Flask, request
import joblib
import pandas as pd
import numpy as np
import re
import os
from PyPDF2 import PdfReader
import tempfile

app = Flask(__name__)

# Load model and scaler
try:
    model = joblib.load('pdf_malware_model.pkl')
    scaler = joblib.load('scaler.pkl')
except FileNotFoundError:
    print("Error: pdf_malware_model.pkl or scaler.pkl not found. Run train_model.py to generate them.")
    exit(1)

def extract_pdf_features(pdf_path):
    """Extract features from PDF using PyPDF2."""
    try:
        reader = PdfReader(pdf_path)
        metadata = reader.metadata or {}
        text_content = reader.pages[0].extract_text() if reader.pages else ""
        features = {
            'pdfsize': os.path.getsize(pdf_path) / 1024,  # Size in KB
            'metadata size': len(str(metadata)),
            'pages': len(reader.pages),
            'xref Length': 0,  # Not easily extracted with PyPDF2
            'isEncrypted': 1 if reader.is_encrypted else 0,
            'embedded files': 0,  # Requires custom parsing
            'images': 0,  # Requires custom parsing
            'text': 'Yes' if text_content else 'No',
            'header': metadata.get('/Producer', '%PDF-1.4'),  # Approximate header
            'obj': 0, 'endobj': 0, 'stream': 0, 'endstream': 0, 'xref': 0,
            'trailer': 0, 'startxref': 0, 'pageno': 0, 'encrypt': 0,
            'ObjStm': 0, 'Javascript': 0, 'AA': 0, 'OpenAction': 0,
            'Acroform': 0, 'JBIG2Decode': 0, 'RichMedia': 0, 'launch': 0,
            'EmbeddedFile': 0, 'XFA': 0, 'Colors': 0,
        }
        return features
    except Exception as e:
        print(f"Error extracting features: {e}")
        return None

def preprocess_features(features_dict):
    """Preprocess features to match training data."""
    df = pd.DataFrame([features_dict])
    
    # Apply preprocessing
    df['text'] = np.where(df['text'].str.contains('Yes'), 1, 0)
    df['header'] = df['header'].apply(lambda x: 1 if re.search(r'%PDF-\d*\.?\d*', x) else 0)
    df = df.fillna(0).replace([-1, -1.00], 0)
    
    # Ensure columns match training data
    expected_columns = ['pdfsize', 'metadata size', 'pages', 'xref Length', 'isEncrypted', 
                        'embedded files', 'images', 'text', 'header', 'obj', 'endobj', 
                        'stream', 'endstream', 'xref', 'trailer', 'startxref', 'pageno', 
                        'encrypt', 'ObjStm', 'Javascript', 'AA', 'OpenAction', 'Acroform', 
                        'JBIG2Decode', 'RichMedia', 'launch', 'EmbeddedFile', 'XFA', 'Colors']
    df = df.reindex(columns=expected_columns, fill_value=0)
    
    # Scale features
    scaled_features = scaler.transform(df)
    return scaled_features

@app.route('/scan_pdf', methods=['POST'])
def scan_pdf():
    try:
        # Check if file is provided
        if 'file' not in request.files:
            return {'error': 'No file provided'}, 400
        
        file = request.files['file']
        if not file.filename.endswith('.pdf'):
            return {'error': 'File must be a PDF'}, 400

        # Save file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            file.save(temp_file.name)
            temp_path = temp_file.name

        # Extract features
        features = extract_pdf_features(temp_path)
        os.unlink(temp_path)  # Clean up temp file

        if features is None:
            return {'error': 'Failed to extract PDF features'}, 500

        # Preprocess and predict
        scaled_features = preprocess_features(features)
        prediction = model.predict(scaled_features)[0]
        
        return {'result': 'Malicious' if prediction == 1 else 'Benign'}
    except Exception as e:
        return {'error': str(e)}, 500

if __name__ == '__main__':
    app.run(debug=True, port=8500)