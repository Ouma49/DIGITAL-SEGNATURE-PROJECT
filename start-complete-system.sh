#!/bin/bash

echo "========================================"
echo "   Digital Signature System Startup"
echo "========================================"
echo

echo "🛑 Stopping any existing services..."
docker-compose down

echo
echo "🔨 Building and starting all services..."
docker-compose up --build -d

echo
echo "⏳ Waiting for services to initialize..."
sleep 30

echo
echo "🔍 Checking service status..."

# Function to check service health
check_service() {
    local service_name=$1
    local url=$2
    local max_attempts=10
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo "✅ $service_name is ready"
            return 0
        else
            echo "⏳ $service_name is starting... ($attempt/$max_attempts)"
            sleep 3
            ((attempt++))
        fi
    done
    
    echo "❌ $service_name failed to start"
    return 1
}

# Check all services
check_service "Crypto Service" "http://localhost:8000/docs"
check_service "Document Service" "http://localhost:5001/health"
check_service "Blockchain Service" "http://localhost:5000/blockchain/stats"
check_service "Frontend" "http://localhost:8081"

echo
echo "🎉 System Status:"
echo "================================"
echo "Frontend:           http://localhost:8081"
echo "API Gateway:        http://localhost:80"
echo "Crypto Service:     http://localhost:8000"
echo "Document Service:   http://localhost:5001"
echo "Blockchain Service: http://localhost:5000"
echo "Auth Service:       http://localhost:8082"
echo
echo "📋 Management Commands:"
echo "- View logs:        docker-compose logs -f"
echo "- Stop system:      docker-compose down"
echo "- Restart:          docker-compose restart"
echo
echo "🚀 The complete digital signature system is now running!"
echo "   Access the application at: http://localhost:8081"
echo

# Show recent logs
echo "📊 Recent Activity:"
echo "==================="
docker-compose logs --tail=5 crypto-service
docker-compose logs --tail=5 document-service
docker-compose logs --tail=5 blockchain
