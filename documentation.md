# PI Digital Signature Platform - Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [System Architecture](#system-architecture)
3. [Installation Guide](#installation-guide)
4. [User Guide](#user-guide)
5. [API Reference](#api-reference)
6. [Development Guide](#development-guide)
7. [Security Considerations](#security-considerations)
8. [Troubleshooting](#troubleshooting)
9. [FAQ](#faq)

---

## Introduction

### Overview

The PI Digital Signature Platform is a comprehensive blockchain-based solution for secure document signing, verification, and management. It provides a robust framework for creating legally binding digital signatures with immutable blockchain verification.

### Key Features

- **Secure Document Signing**: Multiple signature options including electronic, biometric, and digital certificate
- **Blockchain Verification**: Immutable record of document authenticity using Hyperledger Fabric
- **User Management**: Complete authentication and authorization system
- **Document Management**: Upload, store, share, and track documents securely
- **Audit Trails**: Comprehensive logging of all document activities
- **AI-powered Document Intelligence**: Automated document classification and analysis
- **Zero-knowledge Proof Verification**: Enhanced privacy for sensitive documents
- **Regulatory Compliance**: Built-in compliance with major e-signature regulations

### Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn-ui
- **Backend**: Java (Helidon), Python (Flask), Node.js
- **Database**: PostgreSQL
- **Blockchain**: Hyperledger Fabric
- **Infrastructure**: Docker, Nginx

---

## System Architecture

### Microservices Architecture

The platform follows a microservices architecture pattern with the following components:

1. **Auth Service**: Manages user authentication, authorization, and profile management
2. **Blockchain Service**: Handles document verification and blockchain integration
3. **API Gateway**: Routes and controls traffic between clients and services
4. **Frontend**: User interface for the platform
5. **Database**: Stores user and document data

### Network Architecture

Two Docker networks are used:
- `backend-net`: Internal communication between services
- `frontend-net`: External network for client access

### Data Flow Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│   Client    │────▶│ API Gateway │────▶│ Auth Service│
│             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                          │
                          ▼
                    ┌─────────────┐     ┌─────────────┐
                    │             │     │             │
                    │ Blockchain  │────▶│  Database   │
                    │  Service    │     │             │
                    │             │     │             │
                    └─────────────┘     └─────────────┘
```

### Component Descriptions

#### Auth Service
- **Technology**: Java with Helidon framework
- **Responsibility**: User registration, login, token management, profile management
- **Port**: 8082

#### Blockchain Service
- **Technology**: Python with Flask
- **Responsibility**: Document hashing, blockchain integration, verification
- **Port**: 5000

#### API Gateway
- **Technology**: Nginx
- **Responsibility**: Request routing, load balancing, SSL termination
- **Port**: 80

#### Frontend
- **Technology**: React, TypeScript
- **Responsibility**: User interface
- **Port**: 8081

#### Database
- **Technology**: PostgreSQL
- **Responsibility**: Data persistence
- **Port**: 5432

---

## Installation Guide

### Prerequisites

- Docker and Docker Compose
- Git
- Node.js and npm (for local development)
- Java 11+ and Maven (for local development)
- Python 3.8+ (for local development)

### Installation Steps

#### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/Ouma49/DIGITAL-SEGNATURE-PROJECT.git

# Navigate into the project directory
cd DIGITAL-SEGNATURE-PROJECT
```

#### 2. Configure Environment Variables (Optional)

Create a `.env` file in the root directory to customize your deployment:

```bash
# Example .env file
DB_USER=customuser
DB_PASSWORD=strongpassword
JWT_SECRET=your-custom-jwt-secret-key
BLOCKCHAIN_NODE_URL=http://blockchain-node:8545
```

#### 3. Build and Start the Services

```bash
# Build all services
docker-compose build

# Start all services in detached mode
docker-compose up -d
```

#### 4. Verify Installation

```bash
# Check if all services are running
docker-compose ps

# Check logs if needed
docker-compose logs -f
```

#### 5. Access the Platform

The platform is accessible through the following endpoints:

- **Frontend**: `http://localhost:8081`
- **API Gateway**: `http://localhost`
- **Auth Service (direct)**: `http://localhost:8082`
- **Blockchain Service (direct)**: `http://localhost:5000`

---

## User Guide

### Getting Started

#### Registration and Login

1. Navigate to `http://localhost:8081` in your web browser
2. Click on "Register" to create a new account
3. Fill in your details and submit the form
4. After registration, log in with your email and password

#### Dashboard Overview

The dashboard provides an overview of your documents and recent activities:

- **Recent Documents**: Quick access to recently uploaded or signed documents
- **Pending Actions**: Documents requiring your signature or attention
- **Activity Feed**: Recent activities on your documents
- **Quick Actions**: Shortcuts to common tasks like uploading or signing documents

### Document Management

#### Uploading Documents

1. Click on "Upload Document" in the dashboard
2. Select a file from your computer
3. Add document title and description
4. Choose security level and expiry date (optional)
5. Click "Upload" to complete the process

#### Signing Documents

1. Navigate to the document you want to sign
2. Click on "Sign Document"
3. Choose your signature method:
   - Draw signature
   - Type signature
   - Upload signature image
   - Use biometric signature (if available)
4. Review the document
5. Click "Sign" to complete the process

#### Verifying Documents

1. Navigate to the document you want to verify
2. Click on "Verify Document"
3. The system will check the document against the blockchain record
4. View verification details including timestamp, blockchain transaction ID, and verification status

#### Sharing Documents

1. Navigate to the document you want to share
2. Click on "Share Document"
3. Enter recipient email addresses
4. Choose sharing permissions (view, sign, etc.)
5. Add a message (optional)
6. Click "Share" to send the document

### Advanced Features

#### Smart Documents

Smart documents allow you to create documents with conditional logic and automated workflows:

1. Navigate to "Smart Documents" in the sidebar
2. Click "Create Smart Document"
3. Define document conditions and automation rules
4. Upload or create the document content
5. Publish the smart document

#### AI Document Analysis

The platform provides AI-powered document analysis:

1. Upload a document
2. Navigate to "AI Analysis" tab
3. Click "Analyze Document"
4. View extracted information, classification, and security analysis

---

## API Reference

### Auth Service API

#### Registration

```
POST /auth/register
Content-Type: application/json

{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Registration success."
}
```

#### Login

```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userInfo": {
    "id": "1",
    "email": "user@example.com",
    "fullName": "User Name"
  }
}
```

#### Get User Profile

```
GET /auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "1",
  "email": "user@example.com",
  "fullName": "User Name",
  "createdAt": "2023-05-27T20:31:32.491975+00:00"
}
```

### Blockchain Service API

#### Add Document to Blockchain

```
POST /documents
Content-Type: application/json

{
  "timestamp": "2023-05-27T20:31:32.491975+00:00",
  "signature": "<base64_encoded_signature>",
  "hash_algorithm": "SHA-256",
  "signed_data": {
    "user_id": 1,
    "document": "<base64_encoded_document>",
    "signature_image": "<base64_encoded_signature_image>",
    "timestamp": "2023-05-27T20:31:32.491975+00:00"
  }
}
```

**Response:**
```json
{
  "id": 123
}
```

#### Retrieve Document from Blockchain

```
GET /documents/<id>
```

**Response:**
```json
{
  "timestamp": "2023-05-27T20:31:32.491975+00:00",
  "signature": "<base64_encoded_signature>",
  "hash_algorithm": "SHA-256",
  "signed_data": {
    "user_id": 1,
    "document": "<base64_encoded_document>",
    "signature_image": "<base64_encoded_signature_image>",
    "timestamp": "2023-05-27T20:31:32.491975+00:00"
  }
}
```

---

## Development Guide

### Project Structure

```
PI-Digital-Signature-Platform/
├── api-gateway/          # Nginx proxy/API gateway
│   └── default.conf      # Nginx configuration
├── auth-service/         # Authentication microservice (Java/Helidon)
│   ├── src/              # Source code
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── aloui/bilal/userauthservice/
│   │   │   │       ├── Main.java
│   │   │   │       ├── service/
│   │   │   │       │   └── auth/
│   │   │   │       │       ├── AuthService.java
│   │   │   │       │       └── handlers/
│   │   │   │       │           ├── LoginHandler.java
│   │   │   │       │           └── RegisterHandler.java
│   │   │   │       └── util/
│   │   │   └── resources/
│   │   └── test/
│   ├── Dockerfile        # Docker build instructions
│   └── pom.xml           # Maven dependencies
├── blockchain-service/   # Blockchain integration service
│   ├── app.py            # Main application file
│   ├── requirements.txt  # Python dependencies
│   └── Dockerfile        # Docker build instructions
├── database/             # PostgreSQL database
│   └── data/             # Persistent data volume
├── front-end/            # React frontend application
│   ├── src/              # Source code
│   │   ├── components/   # Reusable UI components
│   │   ├── contexts/     # React contexts (auth, etc.)
│   │   ├── pages/        # Application pages
│   │   ├── services/     # API service connections
│   │   └── utils/        # Utility functions
│   ├── public/           # Static assets
│   ├── Dockerfile        # Docker build instructions
│   └── package.json      # NPM dependencies
└── docker-compose.yml    # Docker services configuration
```

### Frontend Development

#### Setup

```bash
# Navigate to frontend directory
cd front-end

# Install dependencies
npm install

# Start development server
npm run dev
```

#### Key Components

- **AuthContext**: Manages authentication state and user sessions
- **DocumentContext**: Manages document state and operations
- **API Services**: Handles communication with backend services

#### Building for Production

```bash
# Build production assets
npm run build

# Preview production build
npm run preview
```

### Auth Service Development

#### Setup

```bash
# Navigate to auth service directory
cd auth-service

# Build with Maven
mvn package

# Run locally
java -jar target/UserAuthService.jar
```

#### Key Components

- **AuthService**: Main service class that defines API routes
- **Handlers**: Request handlers for different endpoints
- **DAO**: Data Access Objects for database operations

### Blockchain Service Development

#### Setup

```bash
# Navigate to blockchain service directory
cd blockchain-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run locally
python app.py
```

#### Key Components

- **app.py**: Main Flask application
- **blockchain.db**: SQLite database for blockchain records

---

## Security Considerations

### Authentication and Authorization

- JWT-based authentication with secure token handling
- Role-based access control for different user types
- Token expiration and refresh mechanisms

### Data Protection

- End-to-end encryption for document storage and transmission
- Secure password hashing using bcrypt
- HTTPS for all communications

### Blockchain Security

- Immutable record of all document transactions
- Cryptographic verification of document integrity
- Zero-knowledge proofs for privacy-preserving verification

### Compliance

- GDPR compliance for user data protection
- eIDAS compliance for electronic signatures
- UETA and ESIGN Act compliance for US legal requirements

---

## Troubleshooting

### Common Issues

#### Services Not Starting

**Symptoms**: Docker containers fail to start or exit immediately after starting.

**Solutions**:
1. Check Docker logs: `docker-compose logs <service-name>`
2. Verify port availability: Ensure ports 8081, 8082, 5000, and 5432 are not in use
3. Check environment variables: Ensure all required environment variables are set

#### Authentication Issues

**Symptoms**: Unable to log in or register, or receiving unauthorized errors.

**Solutions**:
1. Check auth service logs: `docker-compose logs auth`
2. Verify database connection: Ensure the database is running and accessible
3. Check JWT configuration: Ensure JWT secret is properly set

#### Document Verification Failures

**Symptoms**: Documents fail to verify or blockchain verification errors.

**Solutions**:
1. Check blockchain service logs: `docker-compose logs blockchain`
2. Verify blockchain connection: Ensure the blockchain node is accessible
3. Check document hash: Ensure the document hasn't been modified

### Logs

To view logs for a specific service:

```bash
docker-compose logs -f auth
docker-compose logs -f frontend
docker-compose logs -f blockchain
```

### Resetting the System

If you need to reset the system completely:

```bash
# Stop all services and remove volumes
docker-compose down -v

# Rebuild and restart
docker-compose build
docker-compose up -d
```

---

## FAQ

### General Questions

#### Q: What is blockchain document verification?
**A**: Blockchain document verification is a process where document authenticity is verified and recorded on a blockchain network. This creates an immutable record of the document's existence and any changes made to it, ensuring its integrity and preventing tampering.

#### Q: How secure is my data?
**A**: Your data is protected with multiple layers of security including end-to-end encryption, blockchain technology, and secure data centers. We follow industry best practices and maintain various security certifications to ensure your data remains safe.

#### Q: Do I need to be tech-savvy to use this platform?
**A**: Not at all! The platform is designed with a user-friendly interface that makes it easy for anyone to use. Our platform guides you through each step of the document signing and verification process.

### Technical Questions

#### Q: Can I integrate the platform with other systems?
**A**: Yes, the platform provides API access that allows integration with other systems and workflows. Refer to the API Reference section for details.

#### Q: How does zero-knowledge proof verification work?
**A**: Zero-knowledge proofs allow one party (the prover) to prove to another party (the verifier) that a statement is true without revealing any additional information. In our platform, this allows document verification without exposing the actual document content.

#### Q: What blockchain technology does the platform use?
**A**: The platform uses Hyperledger Fabric, an enterprise-grade permissioned blockchain framework that delivers high transaction throughput, privacy controls, and modular architecture.

---

## Support and Contact

For questions, issues, or feature requests, please contact:

- **Project Maintainer**: Bilal ALOUI
- **GitHub**: [https://github.com/Ouma49](https://github.com/Ouma49)
- **Email**: [contact@example.com](mailto:contact@example.com)

---

© 2023 PI Digital Signature Platform. All rights reserved.