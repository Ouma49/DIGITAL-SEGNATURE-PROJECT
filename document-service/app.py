from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import psycopg2
import psycopg2.extras
import hashlib
import os
import json
import requests
from datetime import datetime, timezone
from werkzeug.utils import secure_filename
import uuid
import base64

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt', 'png', 'jpg', 'jpeg'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'auth_db'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', 'root')
}

# Blockchain service configuration
BLOCKCHAIN_SERVICE_URL = os.getenv('BLOCKCHAIN_SERVICE_URL', 'http://localhost:5000')

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def get_db_connection():
    """Get database connection"""
    return psycopg2.connect(**DB_CONFIG)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def calculate_file_hash(file_path):
    """Calculate SHA-256 hash of a file"""
    hash_sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_sha256.update(chunk)
    return hash_sha256.hexdigest()

def record_blockchain_action(action_type, user_id, document_id=None, action_data=None):
    """Record action on blockchain"""
    try:
        blockchain_data = {
            "action_type": action_type,
            "user_id": user_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "document_id": document_id,
            "action_data": action_data or {}
        }
        
        response = requests.post(
            f"{BLOCKCHAIN_SERVICE_URL}/blockchain/action",
            json=blockchain_data,
            timeout=10
        )
        
        if response.status_code == 201:
            return response.json().get('block_id')
        else:
            print(f"Blockchain recording failed: {response.text}")
            return None
    except Exception as e:
        print(f"Error recording blockchain action: {e}")
        return None

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "document-service"})

@app.route('/documents/upload', methods=['POST'])
def upload_document():
    """Upload a document and store its hash in database"""
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Get additional data
        title = request.form.get('title', file.filename)
        user_id = request.form.get('user_id')
        security_level = request.form.get('security_level', 'MEDIUM')
        
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400
        
        # Validate file
        if not allowed_file(file.filename):
            return jsonify({"error": "File type not allowed"}), 400
        
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({"error": "File too large"}), 400
        
        # Generate unique filename
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        
        # Save file
        file.save(file_path)
        
        # Calculate hashes
        file_hash = calculate_file_hash(file_path)
        content_hash = hashlib.sha256(file.read()).hexdigest()
        file.seek(0)  # Reset file pointer
        
        # Store in database
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        cur.execute("""
            INSERT INTO documents 
            (title, filename, file_type, file_size, document_hash, content_hash, 
             uploaded_by, file_path, security_level, metadata)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, upload_timestamp
        """, (
            title, filename, file.content_type, file_size, file_hash, content_hash,
            user_id, file_path, security_level, json.dumps({"original_filename": filename})
        ))
        
        result = cur.fetchone()
        document_id = result['id']
        upload_timestamp = result['upload_timestamp']
        
        # Record action in blockchain
        blockchain_tx_id = record_blockchain_action(
            "UPLOAD", 
            user_id, 
            document_id,
            {
                "filename": filename,
                "file_size": file_size,
                "file_type": file.content_type,
                "document_hash": file_hash
            }
        )
        
        # Update document with blockchain transaction ID
        if blockchain_tx_id:
            cur.execute(
                "UPDATE documents SET blockchain_tx_id = %s WHERE id = %s",
                (str(blockchain_tx_id), document_id)
            )
        
        # Record action in document_actions table
        cur.execute("""
            INSERT INTO document_actions 
            (document_id, user_id, action_type, action_data, blockchain_tx_id, ip_address)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            document_id, user_id, "UPLOAD", 
            json.dumps({"filename": filename, "file_size": file_size}),
            str(blockchain_tx_id) if blockchain_tx_id else None,
            request.remote_addr
        ))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            "document_id": document_id,
            "title": title,
            "filename": filename,
            "file_type": file.content_type,
            "file_size": file_size,
            "document_hash": file_hash,
            "content_hash": content_hash,
            "upload_timestamp": upload_timestamp.isoformat(),
            "blockchain_tx_id": blockchain_tx_id,
            "status": "UPLOADED"
        }), 201
        
    except Exception as e:
        return jsonify({"error": f"Upload failed: {str(e)}"}), 500

@app.route('/documents/<int:document_id>', methods=['GET'])
def get_document(document_id):
    """Get document metadata"""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        cur.execute("""
            SELECT d.*, u.full_name as uploaded_by_name
            FROM documents d
            JOIN users u ON d.uploaded_by = u.id
            WHERE d.id = %s
        """, (document_id,))
        
        document = cur.fetchone()
        cur.close()
        conn.close()
        
        if not document:
            return jsonify({"error": "Document not found"}), 404
        
        # Convert to dict and handle datetime serialization
        doc_dict = dict(document)
        doc_dict['upload_timestamp'] = doc_dict['upload_timestamp'].isoformat()
        doc_dict['created_at'] = doc_dict['created_at'].isoformat()
        doc_dict['updated_at'] = doc_dict['updated_at'].isoformat()
        
        return jsonify(doc_dict)
        
    except Exception as e:
        return jsonify({"error": f"Failed to get document: {str(e)}"}), 500

@app.route('/documents/<int:document_id>/download', methods=['GET'])
def download_document(document_id):
    """Download document file"""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        cur.execute("SELECT filename, file_path FROM documents WHERE id = %s", (document_id,))
        document = cur.fetchone()
        cur.close()
        conn.close()
        
        if not document:
            return jsonify({"error": "Document not found"}), 404
        
        if not os.path.exists(document['file_path']):
            return jsonify({"error": "File not found on disk"}), 404
        
        return send_file(document['file_path'], as_attachment=True, download_name=document['filename'])
        
    except Exception as e:
        return jsonify({"error": f"Download failed: {str(e)}"}), 500

@app.route('/documents/user/<int:user_id>', methods=['GET'])
def get_user_documents(user_id):
    """Get all documents for a user"""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        cur.execute("""
            SELECT id, title, filename, file_type, file_size, document_hash, 
                   upload_timestamp, status, security_level, blockchain_tx_id
            FROM documents 
            WHERE uploaded_by = %s 
            ORDER BY upload_timestamp DESC
        """, (user_id,))
        
        documents = cur.fetchall()
        cur.close()
        conn.close()
        
        # Convert datetime objects to ISO format
        for doc in documents:
            doc['upload_timestamp'] = doc['upload_timestamp'].isoformat()
        
        return jsonify({"documents": documents})
        
    except Exception as e:
        return jsonify({"error": f"Failed to get documents: {str(e)}"}), 500

@app.route('/documents/<int:document_id>/sign', methods=['POST'])
def sign_document(document_id):
    """Record document signature"""
    try:
        data = request.json
        user_id = data.get('user_id')
        signature_type = data.get('signature_type', 'ELECTRONIC')
        signature_data = data.get('signature_data')
        crypto_signature = data.get('crypto_signature')
        algorithm = data.get('algorithm')
        key_type = data.get('key_type')

        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # Check if document exists
        cur.execute("SELECT id, status FROM documents WHERE id = %s", (document_id,))
        document = cur.fetchone()
        if not document:
            return jsonify({"error": "Document not found"}), 404

        # Record signature
        cur.execute("""
            INSERT INTO document_signatures
            (document_id, user_id, signature_type, signature_data, crypto_signature,
             algorithm, key_type, ip_address, device_info, metadata)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, timestamp
        """, (
            document_id, user_id, signature_type, signature_data, crypto_signature,
            algorithm, key_type, request.remote_addr,
            request.headers.get('User-Agent'), json.dumps(data.get('metadata', {}))
        ))

        signature_result = cur.fetchone()
        signature_id = signature_result['id']
        signature_timestamp = signature_result['timestamp']

        # Record blockchain action
        blockchain_tx_id = record_blockchain_action(
            "SIGN",
            user_id,
            document_id,
            {
                "signature_type": signature_type,
                "algorithm": algorithm,
                "key_type": key_type,
                "signature_id": signature_id
            }
        )

        # Update signature with blockchain transaction ID
        if blockchain_tx_id:
            cur.execute(
                "UPDATE document_signatures SET blockchain_tx_id = %s WHERE id = %s",
                (str(blockchain_tx_id), signature_id)
            )

        # Update document status
        cur.execute(
            "UPDATE documents SET status = 'SIGNED', updated_at = CURRENT_TIMESTAMP WHERE id = %s",
            (document_id,)
        )

        # Record action
        cur.execute("""
            INSERT INTO document_actions
            (document_id, user_id, action_type, action_data, blockchain_tx_id, ip_address)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            document_id, user_id, "SIGN",
            json.dumps({"signature_type": signature_type, "algorithm": algorithm}),
            str(blockchain_tx_id) if blockchain_tx_id else None,
            request.remote_addr
        ))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            "signature_id": signature_id,
            "document_id": document_id,
            "timestamp": signature_timestamp.isoformat(),
            "blockchain_tx_id": blockchain_tx_id,
            "status": "SIGNED"
        }), 201

    except Exception as e:
        return jsonify({"error": f"Signing failed: {str(e)}"}), 500

@app.route('/documents/<int:document_id>/share', methods=['POST'])
def share_document(document_id):
    """Share document with another user"""
    try:
        data = request.json
        shared_by = data.get('shared_by')
        shared_with_email = data.get('shared_with_email')
        permission_level = data.get('permission_level', 'VIEW')

        if not shared_by or not shared_with_email:
            return jsonify({"error": "shared_by and shared_with_email are required"}), 400

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # Check if document exists
        cur.execute("SELECT id FROM documents WHERE id = %s", (document_id,))
        if not cur.fetchone():
            return jsonify({"error": "Document not found"}), 404

        # Check if user exists
        cur.execute("SELECT id FROM users WHERE email = %s", (shared_with_email,))
        shared_with_user = cur.fetchone()
        shared_with_user_id = shared_with_user['id'] if shared_with_user else None

        # Generate share token
        share_token = str(uuid.uuid4())

        # Record share
        cur.execute("""
            INSERT INTO document_shares
            (document_id, shared_by, shared_with_email, shared_with_user,
             permission_level, share_token)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, created_at
        """, (
            document_id, shared_by, shared_with_email, shared_with_user_id,
            permission_level, share_token
        ))

        share_result = cur.fetchone()
        share_id = share_result['id']
        share_timestamp = share_result['created_at']

        # Record blockchain action
        blockchain_tx_id = record_blockchain_action(
            "SEND",
            shared_by,
            document_id,
            {
                "shared_with": shared_with_email,
                "permission_level": permission_level,
                "share_token": share_token,
                "share_id": share_id
            }
        )

        # Update share with blockchain transaction ID
        if blockchain_tx_id:
            cur.execute(
                "UPDATE document_shares SET blockchain_tx_id = %s WHERE id = %s",
                (str(blockchain_tx_id), share_id)
            )

        # Update document status
        cur.execute(
            "UPDATE documents SET status = 'SHARED', updated_at = CURRENT_TIMESTAMP WHERE id = %s",
            (document_id,)
        )

        # Record action
        cur.execute("""
            INSERT INTO document_actions
            (document_id, user_id, action_type, action_data, blockchain_tx_id, ip_address)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            document_id, shared_by, "SEND",
            json.dumps({"shared_with": shared_with_email, "permission_level": permission_level}),
            str(blockchain_tx_id) if blockchain_tx_id else None,
            request.remote_addr
        ))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            "share_id": share_id,
            "document_id": document_id,
            "share_token": share_token,
            "shared_with": shared_with_email,
            "permission_level": permission_level,
            "timestamp": share_timestamp.isoformat(),
            "blockchain_tx_id": blockchain_tx_id,
            "status": "SHARED"
        }), 201

    except Exception as e:
        return jsonify({"error": f"Sharing failed: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
