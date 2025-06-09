from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import hashlib
import json
import time
from datetime import datetime, timezone
import uuid

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

'''
Enhanced Data structure for different action types:

Document Upload:
{
  "action_type": "UPLOAD",
  "timestamp": "2025-05-27T20:31:32.491975+00:00",
  "user_id": 1,
  "document_id": 123,
  "document_hash": "<sha256_hash>",
  "metadata": {
    "filename": "document.pdf",
    "file_size": 1024,
    "file_type": "application/pdf"
  }
}

Document Signature:
{
  "action_type": "SIGN",
  "timestamp": "2025-05-27T20:31:32.491975+00:00",
  "user_id": 1,
  "document_id": 123,
  "signature_data": {
    "crypto_signature": "<base64_encoded_cryptographic_signature>",
    "signature_image": "<base64_encoded_handwritten_signature>",
    "algorithm": "RSA-SHA256",
    "key_type": "RSA-2048"
  }
}

Document Share:
{
  "action_type": "SEND",
  "timestamp": "2025-05-27T20:31:32.491975+00:00",
  "user_id": 1,
  "document_id": 123,
  "share_data": {
    "shared_with": "user@example.com",
    "permission_level": "VIEW",
    "share_token": "<unique_token>"
  }
}
'''
# Initialize the SQLite database with enhanced schema
def init_db():
    conn = sqlite3.connect('blockchain.db')
    c = conn.cursor()

    # Create blocks table with enhanced structure
    c.execute('''CREATE TABLE IF NOT EXISTS blocks
                 (block_id INTEGER PRIMARY KEY,
                  previous_hash TEXT,
                  data TEXT,
                  hash TEXT,
                  timestamp TEXT,
                  action_type TEXT,
                  user_id INTEGER,
                  document_id INTEGER)''')

    # Create index for better performance
    c.execute('''CREATE INDEX IF NOT EXISTS idx_blocks_action_type ON blocks(action_type)''')
    c.execute('''CREATE INDEX IF NOT EXISTS idx_blocks_user_id ON blocks(user_id)''')
    c.execute('''CREATE INDEX IF NOT EXISTS idx_blocks_document_id ON blocks(document_id)''')

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

# API endpoint to store a new action on blockchain
@app.route('/blockchain/action', methods=['POST'])
def add_action():
    data = request.json

    # Validate required fields
    required_fields = ["action_type", "user_id", "timestamp"]
    if not all(key in data for key in required_fields):
        return jsonify({"error": f"Missing required fields: {required_fields}"}), 400

    # Validate action type
    valid_actions = ["UPLOAD", "SIGN", "SEND", "VERIFY", "REVOKE"]
    if data["action_type"] not in valid_actions:
        return jsonify({"error": f"Invalid action type. Must be one of: {valid_actions}"}), 400

    last_block = get_last_block()
    if last_block:
        previous_hash = last_block[3]  # hash of the last block
        block_id = last_block[0] + 1
    else:
        previous_hash = "0"  # Genesis block
        block_id = 1

    hash_value = compute_hash(previous_hash, data)

    # Extract metadata for indexing
    action_type = data.get("action_type")
    user_id = data.get("user_id")
    document_id = data.get("document_id")
    timestamp = data.get("timestamp")

    conn = sqlite3.connect('blockchain.db')
    c = conn.cursor()
    c.execute('''INSERT INTO blocks
                 (block_id, previous_hash, data, hash, timestamp, action_type, user_id, document_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
              (block_id, previous_hash, json.dumps(data), hash_value, timestamp, action_type, user_id, document_id))
    conn.commit()
    conn.close()

    return jsonify({
        "block_id": block_id,
        "hash": hash_value,
        "action_type": action_type,
        "timestamp": timestamp
    }), 201

# API endpoint to retrieve a block by ID
@app.route('/blockchain/block/<int:block_id>', methods=['GET'])
def get_block(block_id):
    conn = sqlite3.connect('blockchain.db')
    c = conn.cursor()
    c.execute('SELECT * FROM blocks WHERE block_id = ?', (block_id,))
    row = c.fetchone()
    conn.close()
    if row:
        return jsonify({
            "block_id": row[0],
            "previous_hash": row[1],
            "data": json.loads(row[2]),
            "hash": row[3],
            "timestamp": row[4],
            "action_type": row[5],
            "user_id": row[6],
            "document_id": row[7]
        })
    else:
        return jsonify({"error": "Block not found"}), 404

# API endpoint to get document history from blockchain
@app.route('/blockchain/document/<int:document_id>/history', methods=['GET'])
def get_document_history(document_id):
    conn = sqlite3.connect('blockchain.db')
    c = conn.cursor()
    c.execute('''SELECT block_id, data, hash, timestamp, action_type, user_id
                 FROM blocks WHERE document_id = ? ORDER BY block_id ASC''', (document_id,))
    rows = c.fetchall()
    conn.close()

    history = []
    for row in rows:
        history.append({
            "block_id": row[0],
            "data": json.loads(row[1]),
            "hash": row[2],
            "timestamp": row[3],
            "action_type": row[4],
            "user_id": row[5]
        })

    return jsonify({"document_id": document_id, "history": history})

# API endpoint to get user actions from blockchain
@app.route('/blockchain/user/<int:user_id>/actions', methods=['GET'])
def get_user_actions(user_id):
    conn = sqlite3.connect('blockchain.db')
    c = conn.cursor()
    c.execute('''SELECT block_id, data, hash, timestamp, action_type, document_id
                 FROM blocks WHERE user_id = ? ORDER BY block_id DESC''', (user_id,))
    rows = c.fetchall()
    conn.close()

    actions = []
    for row in rows:
        actions.append({
            "block_id": row[0],
            "data": json.loads(row[1]),
            "hash": row[2],
            "timestamp": row[3],
            "action_type": row[4],
            "document_id": row[5]
        })

    return jsonify({"user_id": user_id, "actions": actions})

# API endpoint to verify blockchain integrity
@app.route('/blockchain/verify', methods=['GET'])
def verify_blockchain():
    conn = sqlite3.connect('blockchain.db')
    c = conn.cursor()
    c.execute('SELECT * FROM blocks ORDER BY block_id ASC')
    blocks = c.fetchall()
    conn.close()

    if not blocks:
        return jsonify({"valid": True, "message": "Empty blockchain"})

    for i, block in enumerate(blocks):
        block_id, previous_hash, data, hash_value, timestamp, action_type, user_id, document_id = block

        # Verify hash
        expected_hash = compute_hash(previous_hash, json.loads(data))
        if hash_value != expected_hash:
            return jsonify({
                "valid": False,
                "message": f"Invalid hash at block {block_id}",
                "block_id": block_id
            })

        # Verify previous hash (except for genesis block)
        if i > 0:
            prev_block = blocks[i-1]
            if previous_hash != prev_block[3]:
                return jsonify({
                    "valid": False,
                    "message": f"Invalid previous hash at block {block_id}",
                    "block_id": block_id
                })

    return jsonify({
        "valid": True,
        "message": "Blockchain is valid",
        "total_blocks": len(blocks)
    })

# API endpoint to get blockchain statistics
@app.route('/blockchain/stats', methods=['GET'])
def get_blockchain_stats():
    conn = sqlite3.connect('blockchain.db')
    c = conn.cursor()

    # Get total blocks
    c.execute('SELECT COUNT(*) FROM blocks')
    total_blocks = c.fetchone()[0]

    # Get actions by type
    c.execute('SELECT action_type, COUNT(*) FROM blocks GROUP BY action_type')
    actions_by_type = dict(c.fetchall())

    # Get recent activity (last 10 blocks)
    c.execute('SELECT action_type, timestamp FROM blocks ORDER BY block_id DESC LIMIT 10')
    recent_activity = c.fetchall()

    conn.close()

    return jsonify({
        "total_blocks": total_blocks,
        "actions_by_type": actions_by_type,
        "recent_activity": [{"action": row[0], "timestamp": row[1]} for row in recent_activity]
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)