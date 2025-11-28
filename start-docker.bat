@echo off
REM ============================================
REM Research Journal - Docker Compose Quick Start (Windows)
REM ============================================

echo 🚀 Starting Research Journal with Docker Compose...

REM Check if Docker is available
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    exit /b 1
)

REM Check if docker-compose is available
docker compose version >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker Compose is not available. Please install Docker Compose.
    exit /b 1
)

echo 📦 Building and starting containers...
docker compose up --build -d

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to start containers
    exit /b 1
)

echo.
echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak

echo.
echo ============================================
echo 🎉 Research Journal is running!
echo ============================================
echo.
echo 🌐 Access URLs:
echo    Frontend: http://localhost:3001
echo    Backend:  http://localhost:8081
echo    MySQL:    localhost:3307
echo.
echo 📊 Container Status:
docker compose ps

echo.
echo Commands:
echo    Stop:    docker compose down
echo    Logs:    docker compose logs -f
echo    Restart: docker compose restart
echo.

pause
