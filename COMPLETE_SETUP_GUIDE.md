# Complete Digital Signature System Setup Guide

This guide will help you set up the complete digital signature system with document hashing, database storage, and blockchain recording.

## 🏗️ Architecture Overview

The system now consists of:

1. **Frontend (React/TypeScript)** - User interface
2. **Document Service (Flask)** - Document storage, hashing, and metadata management
3. **Blockchain Service (Flask)** - Immutable action recording
4. **Crypto Service (FastAPI)** - Cryptographic signing and verification 
5. **Database (PostgreSQL)** - Document metadata and user data storage
6. **Auth Service (Java)** - User authentication
7. **API Gateway (Nginx)** - Routes requests to appropriate services

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 16+ (for frontend development)
- Python 3.9+ (for backend services)

## 🚀 Quick Start

### 1. Start All Services (Automated)

**Windows:**
```cmd
start-complete-system.bat
```

**Linux/Mac:**
```bash
chmod +x start-complete-system.sh
./start-complete-system.sh
```

**Manual Start:**
```bash
# Build and start all services
docker-compose up --build

# Or start in background
docker-compose up -d --build
```

### 2. Initialize Database

The database will be automatically initialized with:
- User authentication tables
- Document storage tables
- Action tracking tables
- Blockchain reference tables

### 3. Access the Application

- **Frontend**: http://localhost:8081
- **API Gateway**: http://localhost:80
- **Document Service**: http://localhost:5001
- **Blockchain Service**: http://localhost:5000
- **Auth Service**: http://localhost:8082
- **Database**: localhost:5432

## 🔧 Service Details

### Document Service (Port 5001)

**Endpoints:**
- `POST /documents/upload` - Upload and hash documents
- `GET /documents/{id}` - Get document metadata
- `GET /documents/user/{user_id}` - Get user's documents
- `POST /documents/{id}/sign` - Record document signature
- `POST /documents/{id}/share` - Share document with users
- `GET /documents/{id}/download` - Download document file

### Blockchain Service (Port 5000)

**Endpoints:**
- `POST /blockchain/action` - Record action on blockchain
- `GET /blockchain/block/{id}` - Get specific block
- `GET /blockchain/document/{id}/history` - Get document history
- `GET /blockchain/user/{id}/actions` - Get user actions
- `GET /blockchain/verify` - Verify blockchain integrity
- `GET /blockchain/stats` - Get blockchain statistics

### Crypto Service (Port 8000)

**Endpoints:**
- `POST /users/{user_id}/keys` - Generate user keys
- `POST /sign` - Sign document cryptographically
- `POST /verify` - Verify cryptographic signature

## 📊 Database Schema

### Documents Table
- `id` - Primary key
- `title` - Document title
- `filename` - Original filename
- `file_type` - MIME type
- `file_size` - Size in bytes
- `document_hash` - SHA-256 hash of file
- `content_hash` - Hash of file content
- `uploaded_by` - User ID
- `status` - Document status
- `blockchain_tx_id` - Reference to blockchain

### Document Actions Table
- `id` - Primary key
- `document_id` - Reference to document
- `user_id` - User who performed action
- `action_type` - UPLOAD, SIGN, SEND, VERIFY, REVOKE
- `blockchain_tx_id` - Reference to blockchain
- `timestamp` - When action occurred

### Document Signatures Table
- `id` - Primary key
- `document_id` - Reference to document
- `user_id` - Signer
- `signature_type` - Type of signature
- `crypto_signature` - Cryptographic signature
- `algorithm` - Signing algorithm
- `blockchain_tx_id` - Reference to blockchain

## 🔄 Complete Workflow

### 1. Document Upload
1. User uploads document via frontend
2. Document service:
   - Saves file to disk
   - Calculates SHA-256 hash
   - Stores metadata in database
3. Blockchain service records UPLOAD action
4. Frontend updates with document info

### 2. Document Signing
1. User generates cryptographic keys (if not exists)
2. User draws/types signature
3. Crypto service creates cryptographic signature
4. Document service records signature in database
5. Blockchain service records SIGN action
6. Document status updated to SIGNED

### 3. Document Sharing
1. User enters email to share with
2. Document service:
   - Creates share record
   - Generates share token
3. Blockchain service records SEND action
4. Document status updated to SHARED

### 4. Document Verification
1. User requests verification
2. Crypto service verifies cryptographic signature
3. Document service validates against stored hash
4. Blockchain service records VERIFY action
5. Verification result displayed

## 🔐 Security Features

### Document Integrity
- **SHA-256 Hashing**: Every document gets a unique hash
- **Content Verification**: Hash comparison detects tampering
- **Immutable Records**: All actions recorded on blockchain

### Cryptographic Security
- **RSA-2048 Keys**: Strong cryptographic keys per user
- **Digital Signatures**: Non-repudiable document signing
- **Algorithm Flexibility**: Support for multiple algorithms

### Blockchain Immutability
- **Action Recording**: Every action gets a blockchain entry
- **Chain Verification**: Blockchain integrity checking
- **Audit Trail**: Complete history of document actions

## 🧪 Testing the System

### 1. Upload a Document
```bash
curl -X POST http://localhost:5001/documents/upload \
  -F "file=@test.pdf" \
  -F "title=Test Document" \
  -F "user_id=1"
```

### 2. Check Blockchain
```bash
curl http://localhost:5000/blockchain/stats
```

### 3. Get Document History
```bash
curl http://localhost:5000/blockchain/document/1/history
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check if PostgreSQL container is running
   - Verify database credentials in docker-compose.yml

2. **Blockchain Service Not Recording**
   - Check if blockchain service is accessible
   - Verify BLOCKCHAIN_SERVICE_URL in document service

3. **File Upload Fails**
   - Check upload directory permissions
   - Verify file size limits

4. **Crypto Service Errors**
   - Ensure crypto service is running on port 8000
   - Check if user keys are generated

### Logs

```bash
# View all service logs
docker-compose logs

# View specific service logs
docker-compose logs document-service
docker-compose logs blockchain
docker-compose logs db
```

## 🔧 Configuration

### Environment Variables

**Document Service:**
- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `BLOCKCHAIN_SERVICE_URL` - Blockchain service URL

**Frontend:**
- Update service URLs in `src/services/` files

### File Storage

Documents are stored in `document-service/uploads/` directory.
This is mounted as a volume in Docker.

## 📈 Monitoring

### Health Checks

- Document Service: `GET /health`
- Blockchain Service: `GET /blockchain/stats`
- Database: Built-in PostgreSQL health check

### Metrics

- Total documents uploaded
- Actions by type (from blockchain stats)
- User activity
- System performance

## 🚀 Production Deployment

### Security Considerations

1. **HTTPS**: Use SSL certificates
2. **Authentication**: Implement proper JWT auth
3. **Database**: Use strong passwords and encryption
4. **File Storage**: Use secure file storage (S3, etc.)
5. **Rate Limiting**: Implement API rate limiting
6. **Monitoring**: Add comprehensive logging and monitoring

### Scaling

1. **Load Balancing**: Use nginx for load balancing
2. **Database**: Use PostgreSQL clustering
3. **File Storage**: Use distributed storage
4. **Caching**: Add Redis for caching
5. **Microservices**: Scale services independently

This system provides a complete, secure, and auditable digital signature solution with blockchain-backed immutability and cryptographic security.
