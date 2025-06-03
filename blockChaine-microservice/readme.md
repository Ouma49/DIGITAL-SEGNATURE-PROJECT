## Add Data
POST /documents
Adds a new document to the blockchain.
Expects the main application to send the data structure with user_id included.
Example Request:

curl -X POST http://localhost:5000/documents \
-H "Content-Type: application/json" \
-d '{
  "timestamp": "2025-05-27T20:31:32.491975+00:00",
  "signature": "<base64_encoded_signature>",
  "hash_algorithm": "SHA-256",
  "signed_data": {
    "user_id": 1,
    "document": "<base64_encoded_document>",
    "signature_image": "<base64_encoded_signature_image>",
    "timestamp": "2025-05-27T20:31:32.491975+00:00"
  }
}'

## Retrieve Data

GET /documents/<id>

curl http://localhost:5000/documents/1


## Docker Build

docker build -t blockchain-microservice .
docker run -d -p 5000:5000 blockchain-microservice