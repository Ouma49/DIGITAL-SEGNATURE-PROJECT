#!/bin/bash

echo "🔄 Restarting Digital Signature System"
echo "======================================"

# Stop all services
echo "🛑 Stopping all services..."
docker-compose down

# Remove old images to force rebuild
echo "🗑️ Cleaning up old images..."
docker-compose down --rmi local

# Rebuild and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to initialize
echo "⏳ Waiting for services to initialize..."
sleep 15

# Check service status
echo "🔍 Checking service status..."

# Check blockchain service
echo "Checking blockchain service..."
for i in {1..10}; do
    if curl -s http://localhost:5000/blockchain/stats > /dev/null 2>&1; then
        echo "✅ Blockchain service is ready"
        break
    else
        echo "⏳ Waiting for blockchain service... ($i/10)"
        sleep 3
    fi
done

# Check document service
echo "Checking document service..."
for i in {1..10}; do
    if curl -s http://localhost:5001/health > /dev/null 2>&1; then
        echo "✅ Document service is ready"
        break
    else
        echo "⏳ Waiting for document service... ($i/10)"
        sleep 3
    fi
done

# Check database
echo "Checking database..."
for i in {1..10}; do
    if docker exec db pg_isready -U root -d auth_db > /dev/null 2>&1; then
        echo "✅ Database is ready"
        break
    else
        echo "⏳ Waiting for database... ($i/10)"
        sleep 3
    fi
done

echo ""
echo "🎉 System Status:"
echo "- Frontend: http://localhost:8081"
echo "- API Gateway: http://localhost:80"
echo "- Document Service: http://localhost:5001"
echo "- Blockchain Service: http://localhost:5000"
echo ""
echo "📋 To view logs: docker-compose logs -f"
echo "📋 To stop: docker-compose down"
