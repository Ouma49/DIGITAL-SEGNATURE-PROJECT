@echo off
echo ========================================
echo   Digital Signature System Startup
echo ========================================
echo.

echo 🛑 Stopping any existing services...
docker-compose down

echo.
echo 🔨 Building and starting all services...
docker-compose up --build -d

echo.
echo ⏳ Waiting for services to initialize...
timeout /t 30 /nobreak > nul

echo.
echo 🔍 Checking service status...

echo Checking Crypto Service...
curl -s http://localhost:8000/docs > nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Crypto Service is ready
) else (
    echo ⏳ Crypto Service is starting...
)

echo Checking Document Service...
curl -s http://localhost:5001/health > nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Document Service is ready
) else (
    echo ⏳ Document Service is starting...
)

echo Checking Blockchain Service...
curl -s http://localhost:5000/blockchain/stats > nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Blockchain Service is ready
) else (
    echo ⏳ Blockchain Service is starting...
)

echo.
echo 🎉 System Status:
echo ================================
echo Frontend:          http://localhost:8081
echo API Gateway:       http://localhost:80
echo Crypto Service:    http://localhost:8000
echo Document Service:  http://localhost:5001
echo Blockchain Service: http://localhost:5000
echo Auth Service:      http://localhost:8082
echo.
echo 📋 Management Commands:
echo - View logs:       docker-compose logs -f
echo - Stop system:     docker-compose down
echo - Restart:         docker-compose restart
echo.
echo 🚀 The complete digital signature system is now running!
echo    Access the application at: http://localhost:8081
echo.
pause
