from flask import Flask, request, jsonify
import sqlite3
import hashlib
import json
import time

app = Flask(__name__)
'''
Data structure:
{
  "timestamp": "2025-05-27T20:31:32.491975+00:00",
  "signature": "<base64_encoded_cryptographic_signature>",
  "hash_algorithm": "SHA-256",
  "signed_data": {
    "user_id": 1,  // Provided by the main application
    "document": "<base64_encoded_document>",
    "signature_image": "<base64_encoded_handwritten_signature>",
    "timestamp": "2025-05-27T20:31:32.491975+00:00"
}
}
'''
# Initialize the SQLite database
def init_db():
    conn = sqlite3.connect('blockchain.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS blocks
                 (block_id INTEGER PRIMARY KEY,
                  previous_hash TEXT,
                  data TEXT,
                  hash TEXT)''')
    conn.commit()
    conn.close()

init_db()

# Get the last block in the chain
def get_last_block():
    conn = sqlite3.connect('blockchain.db')
    c = conn.cursor()
    c.execute('SELECT * FROM blocks ORDER BY block_id DESC LIMIT 1')
    row = c.fetchone()
    conn.close()
    return row

# Compute the hash for a new block
def compute_hash(previous_hash, data):
    data_str = json.dumps(data, sort_keys=True)
    hash_input = previous_hash + data_str
    return hashlib.sha256(hash_input.encode()).hexdigest()

# API endpoint to store a new document
@app.route('/documents', methods=['POST'])
def add_document():
    data = request.json
    # Validate the data structure (optional but recommended)
    if not all(key in data for key in ["timestamp", "signature", "hash_algorithm", "signed_data"]):
        return jsonify({"error": "Invalid data structure"}), 400
    
    last_block = get_last_block()
    if last_block:
        previous_hash = last_block[3]  # hash of the last block
        block_id = last_block[0] + 1
    else:
        previous_hash = "0"  # Genesis block
        block_id = 1
    
    hash_value = compute_hash(previous_hash, data)
    conn = sqlite3.connect('blockchain.db')
    c = conn.cursor()
    c.execute('INSERT INTO blocks (block_id, previous_hash, data, hash) VALUES (?, ?, ?, ?)',
              (block_id, previous_hash, json.dumps(data), hash_value))
    conn.commit()
    conn.close()
    return jsonify({"id": block_id}), 201

# API endpoint to retrieve a document by ID
@app.route('/documents/<int:id>', methods=['GET'])
def get_document(id):
    conn = sqlite3.connect('blockchain.db')
    c = conn.cursor()
    c.execute('SELECT data FROM blocks WHERE block_id = ?', (id,))
    row = c.fetchone()
    conn.close()
    if row:
        return jsonify(json.loads(row[0]))
    else:
        return jsonify({"error": "Document not found"}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)