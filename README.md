# PI Digital Signature Platform

This project is a **Dockerized microservices platform** for managing digital signatures. It includes:

* **Auth Service** – Manages user authentication and authorization
* **Database** – Stores user and signature data
* **API Gateway** – Routes and controls traffic between clients and services

Two Docker networks are used:

* `backend-net`: internal communication between services
* `frontend-net`: external network

---

## Project Structure

```
PI-Digital-Signature-Platform/
├── api-gateway/          # Proxy/ API gateway
├── auth-service/         # Authentication microservice
└── database/             # Database
    └── data/             # Persistent data
├── front-end/         # front-end
```

---

## Deployment Steps

### 1. Clone the Project from GitHub

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

### 4. Stop the Services

```bash
docker-compose down
```

---

## Accessing Endpoints

The Project is exposed on **port 80** of your host machine by default.
You can access it using:

*  `http://localhost` *(when working locally)*
* `http://<your-machine-ip>` *(for access over LAN or testing on other devices)*

### Example Endpoint:

* **Auth Service (via API Gateway)**
  - `http://localhost/auth/`
  - `http://<your-machine-ip>/auth/`
