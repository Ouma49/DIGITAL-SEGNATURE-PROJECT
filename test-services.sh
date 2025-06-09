#!/bin/bash

echo "🚀 Testing Digital Signature System Services"
echo "============================================"

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Test blockchain service
echo "🔗 Testing Blockchain Service..."
curl -s http://localhost:5000/blockchain/stats > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Blockchain service is running"
else
    echo "❌ Blockchain service is not responding"
fi

# Test document service
echo "📄 Testing Document Service..."
curl -s http://localhost:5001/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Document service is running"
else
    echo "❌ Document service is not responding"
fi

# Test database connection
echo "🗄️ Testing Database Connection..."
docker exec db pg_isready -U root -d auth_db > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Database is running"
else
    echo "❌ Database is not responding"
fi

# Test frontend
echo "🌐 Testing Frontend..."
curl -s http://localhost:8081 > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend is not responding"
fi

echo ""
echo "🎯 Service Status Summary:"
echo "- Blockchain: http://localhost:5000"
echo "- Document Service: http://localhost:5001"
echo "- Frontend: http://localhost:8081"
echo "- API Gateway: http://localhost:80"
echo ""
echo "📊 Quick Stats:"
curl -s http://localhost:5000/blockchain/stats 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "Blockchain stats not available"
