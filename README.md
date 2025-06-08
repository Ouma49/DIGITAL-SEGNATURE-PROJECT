# PI Digital Signature Platform

A comprehensive blockchain-based platform for secure document signing, verification, and management with a microservices architecture.

![Platform Banner](https://via.placeholder.com/1200x300/0073e6/ffffff?text=PI+Digital+Signature+Platform)

## 🚀 Features

- **🔐 Secure Document Signing**: Multiple signature options (electronic, biometric, digital certificate)
- **⛓️ Blockchain Verification**: Immutable record of document authenticity using Hyperledger Fabric
- **👤 User Management**: Complete authentication and authorization system
- **📄 Document Management**: Upload, store, share, and track documents securely
- **📊 Audit Trails**: Comprehensive logging of all document activities
- **🤖 AI Document Intelligence**: Automated document classification and analysis
- **🔍 Zero-knowledge Proof**: Enhanced privacy for sensitive documents

## 🏗️ Architecture

The platform follows a microservices architecture with the following components:

- **Auth Service** – Manages user authentication and authorization
- **Blockchain Service** – Handles document verification and blockchain integration
- **API Gateway** – Routes and controls traffic between clients and services
- **Frontend** – User interface for the platform
- **Database** – Stores user and document data

Two Docker networks are used:
- `backend-net`: Internal communication between services
- `frontend-net`: External network for client access

## 📋 Project Structure

```
PI-Digital-Signature-Platform/
├── api-gateway/          # Proxy/API gateway
├── auth-service/         # Authentication microservice
├── blockchain-service/   # Blockchain integration service
├── database/             # PostgreSQL database
│   └── data/             # Persistent data volume
└── front-end/            # React frontend application
```

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn-ui
- **Backend**: Java (Helidon), Python (Flask)
- **Database**: PostgreSQL
- **Blockchain**: Hyperledger Fabric
- **Infrastructure**: Docker, Nginx

## 📦 Prerequisites

- Docker and Docker Compose
- Git

## 🚀 Deployment Steps

### 1. Clone the Project

```bash
# Clone the repository
git clone https://github.com/Ouma49/DIGITAL-SEGNATURE-PROJECT.git

# Navigate into the project directory
cd DIGITAL-SEGNATURE-PROJECT
```

### 2. Build the Docker Services

```bash
docker-compose build
```

### 3. Start the Services

```bash
docker-compose up -d
```

### 4. Verify Deployment

```bash
# Check if all services are running
docker-compose ps

# Check logs if needed
docker-compose logs -f
```

### 5. Stop the Services

```bash
docker-compose down
```

## 🌐 Accessing the Platform

The platform is accessible through the following endpoints:

- **Frontend**: `http://localhost:8081`
- **API Gateway**: `http://localhost`
- **Auth Service (direct)**: `http://localhost:8082`
- **Blockchain Service (direct)**: `http://localhost:5000`

## 📚 Documentation

For detailed documentation, please see [documentation.md](./documentation.md), which includes:

- Complete system architecture
- Detailed API reference
- User guide
- Development guide
- Security considerations
- Troubleshooting guide
- FAQ

## 🧪 Local Development

### Frontend Development

```bash
# Navigate to frontend directory
cd front-end

# Install dependencies
npm install

# Start development server
npm run dev
```

### Auth Service Development

```bash
# Navigate to auth service directory
cd auth-service

# Build with Maven
mvn package

# Run locally
java -jar target/UserAuthService.jar
```

### Blockchain Service Development

```bash
# Navigate to blockchain service directory
cd blockchain-service

# Install dependencies
pip install -r requirements.txt

# Run locally
python app.py
```

## 🐛 Troubleshooting

Common issues and their solutions:

1. **Services not starting**: Check Docker logs with `docker-compose logs <service-name>`
2. **Database connection issues**: Ensure the database container is healthy
3. **API Gateway errors**: Check Nginx configuration in `api-gateway/default.conf`

## 👥 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.



---

<p align="center">
  Made with ❤️ by the PI Digital Signature Platform Team
</p>
